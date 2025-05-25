const express = require('express');
const router = express.Router();
const {
  getOrganization,
  updateOrganization,
  getOrganizationUsers,
  updateUserRole,
  removeUser
} = require('../controllers/organizationController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.get('/', getOrganization);
router.put('/', authorize('admin'), updateOrganization);
router.get('/users', getOrganizationUsers);
router.put('/users/:userId', authorize('admin'), updateUserRole);
router.delete('/users/:userId', authorize('admin'), removeUser);

module.exports = router;
