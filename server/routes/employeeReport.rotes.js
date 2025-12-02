const express = require('express');
const router = express.Router();
const {
    getEmployeeReport,
} = require('../controllers/reports/reports.controller');

const { protect } = require('../middleware/auth.middleware');

router.get('/employee/:id', protect, getEmployeeReport);

module.exports = router;