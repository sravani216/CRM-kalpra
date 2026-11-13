const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { validate, loginSchema, passwordChangeSchema } = require('../validators/schemas');

// Public route
router.post('/login', validate(loginSchema), authController.login);

// Protected routes
router.get('/me', authenticate, authController.getMe);
router.post('/change-password', authenticate, validate(passwordChangeSchema), authController.changePasswordAlias);

module.exports = router;

