const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add an organization name'],
      trim: true,
      unique: true,
      maxlength: [100, 'Organization name can not be more than 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description can not be more than 500 characters'],
    },    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Changed to false to allow organization creation before user
    },
    logo: {
      type: String,
      default: 'default-logo.png',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    settings: {
      taskCategories: {
        type: [String],
        default: ['Bug', 'Feature', 'Improvement'],
      },
      taskPriorities: {
        type: [String],
        default: ['Low', 'Medium', 'High'],
      },
      allowGuests: {
        type: Boolean,
        default: false,
      },
      defaultTaskDueDays: {
        type: Number,
        default: 7,
      },
      workingHours: {
        start: {
          type: String,
          default: '09:00',
        },
        end: {
          type: String,
          default: '17:00',
        },
        workDays: {
          type: [String],
          default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        },
      },
      notificationSettings: {
        emailNotifications: {
          type: Boolean,
          default: true,
        },
        taskAssigned: {
          type: Boolean,
          default: true,
        },
        taskStatusChanged: {
          type: Boolean,
          default: true,
        },
        taskCommented: {
          type: Boolean,
          default: true,
        },
        newMemberJoined: {
          type: Boolean,
          default: true,
        },
      },
      theme: {
        primaryColor: {
          type: String,
          default: '#4F46E5', // Indigo color
        },
        logoUrl: {
          type: String,
          default: '',
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Organization', OrganizationSchema);
