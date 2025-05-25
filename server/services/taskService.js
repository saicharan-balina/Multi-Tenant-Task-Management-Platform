const Task = require('../models/Task');
const Notification = require('../models/Notification');

// Update expired tasks and send notifications
exports.updateExpiredTasks = async () => {
  try {
    const now = new Date();
    
    // Find tasks that are expired but not marked as expired
    const expiredTasks = await Task.find({
      dueDate: { $lt: now },
      status: { $ne: 'expired' },
    }).populate('assignedTo');
    
    console.log(`Found ${expiredTasks.length} expired tasks to update.`);
    
    // Update each task and create notifications
    for (const task of expiredTasks) {
      // Update task status to expired
      task.status = 'expired';
      await task.save();
      
      // Create notification for the assignee
      await Notification.create({
        title: 'Task Expired',
        message: `Task "${task.title}" has expired. Due date was ${task.dueDate.toDateString()}.`,
        type: 'task',
        user: task.assignedTo._id,
        organization: task.organization,
        relatedTo: {
          model: 'Task',
          id: task._id,
        },
      });
    }
    
    return expiredTasks.length;
  } catch (error) {
    console.error('Error in updateExpiredTasks service:', error);
    throw error;
  }
};
