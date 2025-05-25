const express = require('express');
const router = express.Router();
const {
  createInvite,
  getInvites,
  acceptInvite,
  cancelInvite,
  validateInviteToken
} = require('../controllers/inviteController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/accept/:token', acceptInvite);
router.get('/validate/:token', validateInviteToken);

// Protected routes
router.use(protect);

// Admin and manager only routes
router.post('/', authorize('admin', 'manager'), createInvite);
router.get('/', authorize('admin', 'manager'), getInvites);
router.delete('/:id', authorize('admin', 'manager'), cancelInvite);

module.exports = router;
