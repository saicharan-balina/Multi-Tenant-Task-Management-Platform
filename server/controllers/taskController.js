const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Organization = require('../models/Organization');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (Admin and Manager only)
exports.createTask = async (req, res) => {
  try {
    const { title, description, category, priority, dueDate, assignedTo } = req.body;

    // Validate category against organization's settings
    const organization = await Organization.findById(req.user.organization);
    if (!organization.settings.taskCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category for this organization',
      });
    }

    // Validate priority against organization's settings
    if (!organization.settings.taskPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid priority for this organization',
      });
    }

    // Ensure the assigned user exists and belongs to the same organization
    const assignedUser = await User.findOne({
      _id: assignedTo,
      organization: req.user.organization,
    });

    if (!assignedUser) {
      return res.status(400).json({
        success: false,
        message: 'Assigned user not found in your organization',
      });
    }

    // Create task
    const task = await Task.create({
      title,
      description,
      category,
      priority,
      dueDate,
      assignedTo,
      createdBy: req.user.id,
      organization: req.user.organization,
    });

    // Create notification for the assigned user
    await Notification.create({
      title: 'New Task Assigned',
      message: `You have been assigned a new task: ${title}`,
      type: 'task',
      user: assignedTo,
      organization: req.user.organization,
      relatedTo: {
        model: 'Task',
        id: task._id,
      },
    });

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Get all tasks for organization with filtering
// @route   GET /api/tasks
// @access  Private (with role-based filtering)
exports.getTasks = async (req, res) => {
  try {
    const { status, category, priority, assignedTo } = req.query;

    // Build query
    const query = { organization: req.user.organization };

    // Add filters if provided
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    
    // Role-based filtering
    if (req.user.role === 'member') {
      // Members can only see tasks assigned to them
      query.assignedTo = req.user.id;
    } else if (assignedTo) {
      // Admins and managers can filter by assignedTo
      query.assignedTo = assignedTo;
    }

    // Execute query
    const tasks = await Task.find(query)
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private (with role-based access)
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check if task belongs to user's organization
    if (task.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this task',
      });
    }

    // Role-based access
    if (req.user.role === 'member' && task.assignedTo._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this task',
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private (with role-based access)
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check if task belongs to user's organization
    if (task.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task',
      });
    }

    // Role-based access
    if (req.user.role === 'member') {
      // Members can only update the status of their own tasks
      if (task.assignedTo.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this task',
        });
      }

      // Members can only update status field
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Please provide task status',
        });
      }

      task.status = status;
      await task.save();
    } else {
      // Admins and managers can update all fields
      const { title, description, status, category, priority, dueDate, assignedTo } = req.body;

      // Update fields
      if (title) task.title = title;
      if (description) task.description = description;
      if (status) task.status = status;
      if (category) task.category = category;
      if (priority) task.priority = priority;
      if (dueDate) task.dueDate = dueDate;

      // Handle assignedTo change
      if (assignedTo && assignedTo !== task.assignedTo.toString()) {
        // Verify new assignee is in the same organization
        const assignedUser = await User.findOne({
          _id: assignedTo,
          organization: req.user.organization,
        });

        if (!assignedUser) {
          return res.status(400).json({
            success: false,
            message: 'Assigned user not found in your organization',
          });
        }

        task.assignedTo = assignedTo;

        // Create notification for new assignee
        await Notification.create({
          title: 'Task Assigned',
          message: `You have been assigned a task: ${task.title}`,
          type: 'task',
          user: assignedTo,
          organization: req.user.organization,
          relatedTo: {
            model: 'Task',
            id: task._id,
          },
        });
      }

      await task.save();
    }

    // Get updated task with populated fields
    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email');

    res.status(200).json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin and Manager only)
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check if task belongs to user's organization
    if (task.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this task',
      });
    }

    await task.remove();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check if task belongs to user's organization
    if (task.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to comment on this task',
      });
    }

    // Role-based access
    if (req.user.role === 'member' && task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to comment on this task',
      });
    }

    // Add comment
    task.comments.push({
      user: req.user.id,
      text,
    });

    await task.save();

    // If comment is by someone other than the assignee, create notification
    if (req.user.id !== task.assignedTo.toString()) {
      await Notification.create({
        title: 'New Comment on Task',
        message: `New comment on task: ${task.title}`,
        type: 'task',
        user: task.assignedTo,
        organization: req.user.organization,
        relatedTo: {
          model: 'Task',
          id: task._id,
        },
      });
    }

    res.status(201).json({
      success: true,
      data: task.comments[task.comments.length - 1],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};
