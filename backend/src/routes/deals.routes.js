const express = require('express');
const router = express.Router();
const dealsController = require('../controllers/deals.controller');
const { authenticate } = require('../middleware/auth');
const { validate, updateDealSchema } = require('../validators/schemas');

router.use(authenticate);

router.get('/', dealsController.getDeals);
router.patch('/:id', validate(updateDealSchema), dealsController.updateDeal);

module.exports = router;

