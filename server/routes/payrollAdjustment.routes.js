const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { hotProxy } = require('../utils/asphalt-proxy');
const path = 'workforce/payrollAdjustment.controller';

router.get("/", protect, hotProxy(path, 'getMonthlyAdjustments'));
router.post("/", protect, hotProxy(path, 'saveMonthlyAdjustments'));

module.exports = router;