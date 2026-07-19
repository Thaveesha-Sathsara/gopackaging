const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { hotProxy } = require('../utils/asphalt-proxy');
const path = 'workforce/payroll.controller';

const getPayrollSummary = hotProxy(path, 'getPayrollSummary');
const getEmployeePayrollDetails = hotProxy(path, 'getEmployeePayrollDetails');

router.get("/summary", protect, getPayrollSummary);
router.get("/employee/:id", protect, getEmployeePayrollDetails);

module.exports = router;