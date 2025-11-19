const express = require('express');
const router = express.Router();
const { 
    getPayrollSummary, 
    getEmployeePayrollDetails 
} = require('../controllers/workforce/payroll.controller');
const { protect } = require('../middleware/auth.middleware');

router.get("/summary", protect, getPayrollSummary);
router.get("/employee/:id", protect, getEmployeePayrollDetails);

module.exports = router;