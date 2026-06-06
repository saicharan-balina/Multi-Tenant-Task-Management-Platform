const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Check for token in Auth header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }

  try {
    // Verify token
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from the token
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    // Check if user belongs to the organization in the token
    // This ensures users can only access their own organization's data
    if (req.user.organization.toString() !== decoded.organization) {
      return res.status(401).json({
        success: false,
        message: 'User does not belong to this organization',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'User role not defined',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not  authorized to access this route`,
      });
    }
    next();
  };
};

// Middleware to check if user has access to specific task
exports.checkTaskAccess = async (req, res, next) => {
  try {
    // Get the task ID from the request parameters
    const taskId = req.params.id;
    
    // Get the user from the request object (added by protect middleware)
    const user = req.user;
    
    // Get the task from the database
    const Task = require('../models/Task');
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }
    
    // Check if task belongs to user's organization
    if (task.organization.toString() !== user.organization.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this task',
      });
    }
    
    // Check role-based permissions
    if (user.role === 'admin' || user.role === 'manager') {
      // Admins and managers have full access
      return next();
    } else if (user.role === 'member' && task.assignedTo.toString() === user._id.toString()) {
      // Members can only access their own tasks
      return next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this task',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
