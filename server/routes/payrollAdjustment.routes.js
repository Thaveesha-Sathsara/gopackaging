const express = require('express');
const router = express.Router();
const { 
    getMonthlyAdjustments, 
    saveMonthlyAdjustments 
} = require('../controllers/workforce/payrollAdjustment.controller');
const { protect } = require('../middleware/auth.middleware');

router.get("/", protect, getMonthlyAdjustments);
router.post("/", protect, saveMonthlyAdjustments);

module.exports = router;