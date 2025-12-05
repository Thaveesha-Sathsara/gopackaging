const express = require('express');
const router = express.Router();
const { 
    getEmployeeReport, 
    getInventoryReport 
} = require('../controllers/reports/reports.controller'); // Ensure this path matches your controller location
const { protect } = require('../middleware/auth.middleware');

// @route   GET /api/reports/employee/:id
// @desc    Get 360-degree report for a specific employee (Payroll, Attendance, Stats)
router.get('/employee/:id', protect, getEmployeeReport);

// @route   GET /api/reports/inventory
// @desc    Get Inventory Health Report (Low stock, movement, value)
router.get('/inventory', protect, getInventoryReport);

module.exports = router;