const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  addComment
} = require('../controllers/taskController');
const { protect, authorize, checkTaskAccess } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.route('/')
  .post(authorize('admin', 'manager'), createTask)
  .get(getTasks);

router.route('/:id')
  .get(checkTaskAccess, getTask)
  .put(checkTaskAccess, updateTask)
  .delete(authorize('admin', 'manager'), deleteTask);

router.post('/:id/comments', checkTaskAccess, addComment);

module.exports = router;
