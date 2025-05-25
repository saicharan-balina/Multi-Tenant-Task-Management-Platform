const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [200, 'Title can not be more than 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [1000, 'Description can not be more than 1000 characters'],
    },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'completed', 'expired'],
      default: 'todo',
    },
    category: {
      type: String,
      enum: ['Bug', 'Feature', 'Improvement'],
      required: [true, 'Please add a category'],
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: [true, 'Please add a priority'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Please add a due date'],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please assign task to someone'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        text: {
          type: String,
          required: [true, 'Please add a comment text'],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create compound index for organization-specific queries (multi-tenancy)
TaskSchema.index({ organization: 1 });

module.exports = mongoose.model('Task', TaskSchema);
