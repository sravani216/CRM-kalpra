const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');
const {
  validate,
  profileUpdateSchema,
  passwordChangeSchema,
  createTeamMemberSchema,
} = require('../validators/schemas');

// Apply authentication to all user routes
router.use(authenticate);

// Profile & Account Settings
router.patch('/profile', validate(profileUpdateSchema), usersController.updateProfile);
router.post('/profile/avatar', uploadAvatar, usersController.uploadAvatar);
router.patch('/password', validate(passwordChangeSchema), usersController.changePassword);

// Team Management
// List team members: Marketing Head & CEO
router.get('/team', authorize('MARKETING_HEAD', 'CEO'), usersController.getTeam);

// Add team member: Marketing Head only
router.post('/team', authorize('MARKETING_HEAD'), validate(createTeamMemberSchema), usersController.createTeamMember);

// Toggle employee status: Marketing Head only
router.patch('/:id/status', authorize('MARKETING_HEAD'), usersController.toggleUserStatus);

module.exports = router;

