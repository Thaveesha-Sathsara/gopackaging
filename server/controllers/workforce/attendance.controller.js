const Attendance = require("../../models/workforce/attendance.model");
const Employee = require("../../models/workforce/employee.model"); // We need this
const mongoose = require("mongoose");

/**
 * @desc    Get summarized attendance data for all employees within a date range
 * @route   GET /api/workforce/attendance/summary
 * @access  Private
 */

const normalizeDate = (dateString) => {
    const date = new Date(dateString);
    date.setUTCHours(0, 0, 0, 0);
    return date;
};

const getAttendanceSummary = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: "Please provide startDate and endDate." });
        }

        const summary = await Attendance.aggregate([
            {
                $match: {
                    date: {
                        $gte: new Date(startDate), // Ensure these are Date objects
                        $lte: new Date(endDate),
                    },
                },
            },
            {
                $group: {
                    _id: "$employee", // Group by Employee ObjectId
                    totalHoursWorked: { $sum: "$totalHours" },
                },
            },
            {
                $lookup: {
                    from: "employees", // ⚠️ IMPORTANT: MongoDB collection names are usually lowercase plural!
                    localField: "_id",
                    foreignField: "_id",
                    as: "employeeDetails",
                },
            },
            {
                $unwind: "$employeeDetails",
            },
            {
                $project: {
                    _id: 0,
                    employeeId: "$_id",
                    employeeID: "$employeeDetails.employeeID",
                    employeeName: "$employeeDetails.employeeName",
                    position: "$employeeDetails.position",
                    totalHoursWorked: "$totalHoursWorked",
                },
            },
        ]);

        res.status(200).json(summary);
    } catch (error) {
        console.error("Error fetching attendance summary:", error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get all attendance records for a single day
 * @route   GET /api/workforce/attendance/daily
 * @access  Private
 */
const getDailyAttendance = async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ message: "Please provide a date." });
        }

        const searchDate = normalizeDate(date);

        // Find all records for that date and populate the employee's details
        const records = await Attendance.find({ date: searchDate })
            .populate("employee", "employeeID employeeName"); // <-- This links to the employee

        res.status(200).json(records);
    } catch (error) {
        console.error("Error fetching daily attendance:", error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Create or update daily attendance for multiple employees
 * @route   POST /api/workforce/attendance/daily
 * @access  Private
 */
const createDailyAttendance = async (req, res) => {
    try {
        const { date, records } = req.body;

        if (!date || !records) return res.status(400).json({ message: "Invalid data" });

        const normalizedDate = normalizeDate(date);

        // 1. Fetch all employees involved in this update to get their CURRENT salary
        // We extract the IDs from the incoming records
        const employeeIds = records.map(r => r.employeeId);
        const employees = await Employee.find({ _id: { $in: employeeIds } });
        
        // Create a map for fast salary lookup: { "empId": 500.00 }
        const salaryMap = {};
        employees.forEach(emp => {
            salaryMap[emp._id.toString()] = emp.salary || 0;
        });

        const operations = records.map(record => {
            // 2. Get the current salary for this employee
            const currentHourlyRate = salaryMap[record.employeeId] || 0;
            
            // 3. Calculate the frozen Daily Pay
            const calculatedDailyPay = record.totalHours * currentHourlyRate;

            return {
                updateOne: {
                    filter: { 
                        employee: new mongoose.Types.ObjectId(record.employeeId), 
                        date: normalizedDate 
                    },
                    update: {
                        $set: {
                            startTime: record.startTime,
                            endTime: record.endTime,
                            totalHours: record.totalHours,
                            hourlyRate: currentHourlyRate,
                            dailyPay: calculatedDailyPay 
                        },
                    },
                    upsert: true, 
                },
            };
        });

        const result = await Attendance.bulkWrite(operations);
        res.status(201).json({ message: "Saved", result });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get detailed attendance history for ONE employee
 * @route   GET /api/workforce/attendance/employee/:id
 */
const getEmployeeAttendanceHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.query;

        const employee = await Employee.findById(id);
        if (!employee) return res.status(404).json({ message: "Employee not found" });

        // Fetch attendance records sorted by date (newest first)
        const records = await Attendance.find({
            employee: id,
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            },
        }).sort({ date: -1 });

        res.status(200).json({
            employee: {
                id: employee.employeeID,
                name: employee.employeeName,
                position: employee.position,
            },
            records: records
        });

    } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAttendanceSummary,
    createDailyAttendance,
    getDailyAttendance,
    getEmployeeAttendanceHistory
};