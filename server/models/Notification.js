const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['task', 'invite', 'system', 'other'],
      default: 'other',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    relatedTo: {
      model: {
        type: String,
        enum: ['Task', 'Invite', 'User', null],
        default: null,
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'relatedTo.model',
        default: null,
      },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for user-specific queries
NotificationSchema.index({ user: 1, isRead: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);
