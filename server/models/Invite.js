const mongoose = require('mongoose');
const crypto = require('crypto');

const InviteSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please add an email'],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'member'],
      default: 'member',
    },
    token: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'expired'],
      default: 'pending',
    },
    expiresAt: {
      type: Date,
      default: function() {
        // Invite expires after 7 days
        return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      }
    },
  },
  {
    timestamps: true,
  }
);

// Create a token before saving
InviteSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('email')) {
    // Generate a token
    this.token = crypto.randomBytes(20).toString('hex');
  }
  next();
});

module.exports = mongoose.model('Invite', InviteSchema);
