const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Individual employee performance analytics (Employee sees self, Head & CEO see all)
router.get('/employee/:id', analyticsController.getEmployeeAnalytics);

// Company-wide executive analytics for CEO and Marketing Head
router.get('/executive', authorize('CEO', 'MARKETING_HEAD'), analyticsController.getExecutiveAnalytics);

module.exports = router;

