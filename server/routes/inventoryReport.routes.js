const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { hotProxy } = require('../utils/asphalt-proxy');

const path = 'inventory/inventory.controller';

router.get("reports/inventory-reports", protect, hotProxy(path, 'getInventoryReport'));

module.exports = router;