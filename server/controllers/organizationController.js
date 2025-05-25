const Organization = require('../models/Organization');
const User = require('../models/User');

// @desc    Get organization details
// @route   GET /api/organizations
// @access  Private
exports.getOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.user.organization);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    res.status(200).json({
      success: true,
      data: organization,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Update organization
// @route   PUT /api/organizations
// @access  Private (Admin only)
exports.updateOrganization = async (req, res) => {
  try {
    const { name, description, settings } = req.body;

    let organization = await Organization.findById(req.user.organization);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    // Update fields
    if (name) organization.name = name;
    if (description) organization.description = description;
    if (settings) {
      organization.settings = {
        ...organization.settings,
        ...settings,
      };
    }

    await organization.save();

    res.status(200).json({
      success: true,
      data: organization,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Get all organization users
// @route   GET /api/organizations/users
// @access  Private
exports.getOrganizationUsers = async (req, res) => {
  try {
    const users = await User.find({ organization: req.user.organization }).select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Update user role (Admin only)
// @route   PUT /api/organizations/users/:userId
// @access  Private (Admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const { userId } = req.params;

    // Validate role
    if (!['admin', 'manager', 'member'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role',
      });
    }

    // Make sure user is not updating their own role
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot update your own role',
      });
    }

    // Find user and ensure they belong to same organization
    const user = await User.findOne({ 
      _id: userId, 
      organization: req.user.organization 
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found in your organization',
      });
    }

    // Update role
    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
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

// @desc    Remove user from organization (Admin only)
// @route   DELETE /api/organizations/users/:userId
// @access  Private (Admin only)
exports.removeUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Make sure user is not removing themselves
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot remove yourself from the organization',
      });
    }

    // Find user and ensure they belong to same organization
    const user = await User.findOne({ 
      _id: userId, 
      organization: req.user.organization 
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found in your organization',
      });
    }

    // Check if the user is the last admin in the organization
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({
        organization: req.user.organization,
        role: 'admin'
      });

      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot remove the last admin from the organization',
        });
      }
    }

    // Remove user from organization
    // Option 1: Delete the user completely
    // await User.findByIdAndDelete(userId);

    // Option 2: Set organization to null (better for data retention)
    user.organization = null;
    user.role = 'member'; // Reset role to default
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User removed from organization successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};
