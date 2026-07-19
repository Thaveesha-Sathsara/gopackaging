const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { hotProxy } = require('../utils/asphalt-proxy');
const path = 'reports/reports.controller';

// @route   GET /api/reports/employee/:id
// @desc    Get 360-degree report for a specific employee (Payroll, Attendance, Stats)
router.get('/employee/:id', protect, hotProxy(path, 'getEmployeeReport'));

// @route   GET /api/reports/inventory
// @desc    Get Inventory Health Report (Low stock, movement, value)
router.get('/inventory', protect, hotProxy(path, 'getInventoryReport'));

module.exports = router;