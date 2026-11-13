const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notes.controller');
const { authenticate } = require('../middleware/auth');
const {
  validate,
  createPersonalNoteSchema,
  updatePersonalNoteSchema,
} = require('../validators/schemas');

router.use(authenticate);

router.get('/', notesController.getNotes);
router.post('/', validate(createPersonalNoteSchema), notesController.createNote);
router.patch('/:id', validate(updatePersonalNoteSchema), notesController.updateNote);
router.delete('/:id', notesController.deleteNote);

module.exports = router;

