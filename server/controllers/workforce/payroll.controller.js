const Attendance = require("../../models/workforce/attendance.model");
const Employee = require("../../models/workforce/employee.model");
const mongoose = require("mongoose");

/**
 * @desc    Get Payroll Summary (Total Hours * Hourly Rate) for all employees in a range
 * @route   GET /api/workforce/payroll/summary
 */
const getPayrollSummary = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) return res.status(400).json({ message: "Date range required" });

        const payrollData = await Attendance.aggregate([
            {
                $match: {
                    date: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate),
                    },
                },
            },
            {
                $group: {
                    _id: "$employee",
                    totalHours: { $sum: "$totalHours" },
                    // ✅ SUM THE SAVED DAILY PAY instead of calculating dynamically
                    totalPay: { $sum: "$dailyPay" } 
                },
            },
            {
                $lookup: {
                    from: "employees",
                    localField: "_id",
                    foreignField: "_id",
                    as: "employeeDetails",
                },
            },
            { $unwind: "$employeeDetails" },
            {
                $project: {
                    _id: 0,
                    employeeId: "$_id",
                    employeeID: "$employeeDetails.employeeID",
                    employeeName: "$employeeDetails.employeeName",
                    position: "$employeeDetails.position",
                    hourlyRate: "$employeeDetails.salary", 
                    totalHours: 1,
                    totalPay: 1,
                },
            },
            { $sort: { employeeID: 1 } }
        ]);

        res.status(200).json(payrollData);
    } catch (error) {
        console.error("Error fetching payroll summary:", error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get Detailed Payroll (Daily breakdown) for ONE employee
 * @route   GET /api/workforce/payroll/employee/:id
 */
const getEmployeePayrollDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.query;

        // 1. Get Employee Details (for the rate)
        const employee = await Employee.findById(id);
        if (!employee) return res.status(404).json({ message: "Employee not found" });

        // 2. Get Attendance Records
        const attendanceRecords = await Attendance.find({
            employee: id,
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            }
        }).sort({ date: 1 });

        // 3. Calculate Daily Pay for each record
        const detailedRecords = attendanceRecords.map(record => ({
            _id: record._id,
            date: record.date,
            startTime: record.startTime,
            endTime: record.endTime,
            totalHours: record.totalHours,
            hourlyRate: employee.salary,
            dailyPay: record.totalHours * employee.salary
        }));

        res.status(200).json({
            employee: {
                name: employee.employeeName,
                id: employee.employeeID,
                position: employee.position,
                hourlyRate: employee.salary
            },
            records: detailedRecords
        });

    } catch (error) {
        console.error("Error fetching employee details:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getPayrollSummary, getEmployeePayrollDetails };