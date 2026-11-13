const express = require('express');
const router = express.Router();
const leadsController = require('../controllers/leads.controller');
const { authenticate } = require('../middleware/auth');
const {
  validate,
  createLeadSchema,
  updateLeadSchema,
  createLeadNoteSchema,
} = require('../validators/schemas');

router.use(authenticate);

router.get('/', leadsController.getLeads);
router.post('/', validate(createLeadSchema), leadsController.createLead);
router.patch('/:id', validate(updateLeadSchema), leadsController.updateLead);
router.post('/:id/notes', validate(createLeadNoteSchema), leadsController.addLeadNote);

module.exports = router;

