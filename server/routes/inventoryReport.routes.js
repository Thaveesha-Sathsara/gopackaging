const express = require('express');
const router = express.Router();
const {
    getInventoryReport
} = require('../controllers/reports/reports.controller');

const { protect } = require('../middleware/auth.middleware');

router.get("reports/inventory-reports", protect, getInventoryReport);

module.exports = router;