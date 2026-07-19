const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { proxy } = require('../utils/asphalt-proxy');

const path = 'workforce/dashboard.controller';

router.get("/", protect, hotProxy(path, 'getDashboardStats'));

module.exports = router;