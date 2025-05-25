const Invite = require('../models/Invite');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Notification = require('../models/Notification');

// @desc    Create and send invite
// @route   POST /api/invites
// @access  Private (Admin and Manager only)
exports.createInvite = async (req, res) => {
  try {
    const { email, role } = req.body;

    // Validate role
    if (!['admin', 'manager', 'member'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role',
      });
    }

    // Check if user is already in the organization
    const existingUser = await User.findOne({
      email,
      organization: req.user.organization,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists in your organization',
      });
    }

    // Check if invite already exists and is pending
    const existingInvite = await Invite.findOne({
      email,
      organization: req.user.organization,
      status: 'pending',
    });

    if (existingInvite) {
      return res.status(400).json({
        success: false,
        message: 'Invite already sent to this email',
      });
    }

    // Get organization info
    const organization = await Organization.findById(req.user.organization);    // Create invite
    const invite = await Invite.create({
      email,
      role,
      organization: req.user.organization,
      invitedBy: req.user.id,
    });

    // Generate invite link URL
    const inviteUrl = `${process.env.FRONTEND_URL}/register/invite/${invite.token}`;

    res.status(201).json({
      success: true,
      data: {
        id: invite._id,
        email: invite.email,
        role: invite.role,
        token: invite.token,
        inviteUrl,
        status: invite.status,
        expiresAt: invite.expiresAt,
        organizationName: organization.name
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Get all invites for organization
// @route   GET /api/invites
// @access  Private (Admin and Manager only)
exports.getInvites = async (req, res) => {
  try {
    const invites = await Invite.find({
      organization: req.user.organization,
    }).populate('invitedBy', 'firstName lastName email');

    res.status(200).json({
      success: true,
      count: invites.length,
      data: invites,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Accept invite and create user
// @route   POST /api/invites/accept/:token
// @access  Public
exports.acceptInvite = async (req, res) => {  try {
    const { firstName, lastName, password } = req.body;
    const { token: inviteToken } = req.params;

    // Find the invite by token
    const invite = await Invite.findOne({
      token: inviteToken,
      status: 'pending',
      expiresAt: { $gt: Date.now() },
    }).populate('organization');

    if (!invite) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired invite',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: invite.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email: invite.email,
      password,
      organization: invite.organization._id,
      role: invite.role,
    });

    // Update invite status
    invite.status = 'accepted';
    await invite.save();    // Create notification for the person who sent the invite
    await Notification.create({
      title: 'Invite Accepted',
      message: `${firstName} ${lastName} has accepted your invitation and joined the organization.`,
      type: 'invite',
      user: invite.invitedBy,
      organization: invite.organization._id,
      relatedTo: {
        model: 'User',
        id: user._id,
      },
    });

    // Send token response
    const authToken = user.getSignedJwtToken();
    res.status(200).json({      success: true,
      token: authToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        organization: {
          id: invite.organization._id,
          name: invite.organization.name,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Cancel invite
// @route   DELETE /api/invites/:id
// @access  Private (Admin and Manager only)
exports.cancelInvite = async (req, res) => {
  try {
    const invite = await Invite.findOne({
      _id: req.params.id,
      organization: req.user.organization,
    });

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: 'Invite not found',
      });
    }

    await invite.remove();

    res.status(200).json({
      success: true,
      message: 'Invite cancelled successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Validate invite token
// @route   GET /api/invites/validate/:token
// @access  Public
exports.validateInviteToken = async (req, res) => {  try {
    const { token: inviteToken } = req.params;

    // Find the invite by token and check if it's valid
    const invite = await Invite.findOne({
      token: inviteToken,
      status: 'pending',
      expiresAt: { $gt: Date.now() },
    }).populate('organization', 'name');

    if (!invite) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired invite token',
        valid: false
      });
    }

    // Return invitation details 
    res.status(200).json({
      success: true,
      valid: true,
      data: {
        email: invite.email,
        role: invite.role,
        organizationId: invite.organization._id,
        organizationName: invite.organization.name,
        expiresAt: invite.expiresAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
      valid: false
    });
  }
};
