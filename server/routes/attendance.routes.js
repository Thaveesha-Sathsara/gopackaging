const express = require('express');
const router = express.Router();
const { 
    getAttendanceSummary,
    createDailyAttendance,
    getDailyAttendance,
    getEmployeeAttendanceHistory
} = require('../controllers/workforce/attendance.controller');
const { protect } = require('../middleware/auth.middleware');

// Route for getting the date-range summary
// GET /api/workforce/attendance/summary?startDate=...&endDate=...
router.get("/summary", protect, getAttendanceSummary);

router.get("/daily", protect, getDailyAttendance);

// Route for saving the daily attendance sheet
// POST /api/workforce/attendance/daily
router.post("/daily", protect, createDailyAttendance);

router.get("/employee/:id", protect, getEmployeeAttendanceHistory);

module.exports = router;