const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasks.controller');
const { authenticate } = require('../middleware/auth');
const { uploadTaskFiles } = require('../middleware/upload');
const {
  validate,
  createTaskSchema,
  stopTaskSchema,
} = require('../validators/schemas');

router.use(authenticate);

router.get('/', tasksController.getTasks);
router.post('/', validate(createTaskSchema), tasksController.createTask);
router.patch('/:id/start', tasksController.startTaskTimer);
router.patch('/:id/stop', validate(stopTaskSchema), tasksController.stopTaskTimer);
router.post('/:id/upload', uploadTaskFiles, tasksController.uploadTaskProof);

module.exports = router;

