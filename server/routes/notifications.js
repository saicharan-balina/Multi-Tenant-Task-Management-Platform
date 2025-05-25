const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getNotifications)
  .put(markAllAsRead);

router.route('/:id')
  .put(markAsRead)
  .delete(deleteNotification);

module.exports = router;
