const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { hotProxy } = require('../utils/asphalt-proxy');

const path = 'workforce/attendance.controller';

router.get("/summary", protect, hotProxy(path, 'getAttendanceSummary'));
router.get("/daily", protect, hotProxy(path, 'getDailyAttendance'));
router.post("/daily", protect, hotProxy(path, 'createDailyAttendance'));
router.get("/employee/:id", protect, hotProxy(path, 'getEmployeeAttendanceHistory'));

module.exports = router;