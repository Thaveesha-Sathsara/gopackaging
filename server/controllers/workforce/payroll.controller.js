const Attendance = require("../../models/workforce/attendance.model");
const Employee = require("../../models/workforce/employee.model");
const mongoose = require("mongoose");

/**
 * @desc    Get Payroll Summary with ALLOWANCES logic
 * @route   GET /api/workforce/payroll/summary
 */
const getPayrollSummary = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) return res.status(400).json({ message: "Date range required" });

        // 1. Aggregate basic attendance data (Work Pay + OT Pay + Days Count)
        const payrollData = await Attendance.aggregate([
            {
                $match: {
                    date: { $gte: new Date(startDate), $lte: new Date(endDate) },
                    status: "Present" // Only count present days for the 25-day rule
                },
            },
            {
                $group: {
                    _id: "$employee",
                    daysPresent: { $sum: 1 }, // Count days present for allowance logic
                    totalNormalHours: { $sum: "$normalHours" },
                    totalOtHours: { $sum: "$otHours" },
                    totalDoubleOtHours: { $sum: "$doubleOtHours" },
                    totalBasicPay: { $sum: "$normalPay" },
                    totalOtPay: { $sum: "$otPay" },
                    totalDoubleOtPay: { $sum: "$doubleOtPay" },
                    grossWorkPay: { $sum: "$dailyPay" } // normal + ot
                },
            },
        ]);

        // 2. Fetch Employee details to calculate Allowances
        // We need to manually merge because allowances are in the Employee Model, not Attendance
        const employeeIds = payrollData.map(p => p._id);
        const employees = await Employee.find({ _id: { $in: employeeIds } });
        
        const empMap = {};
        employees.forEach(emp => {
            empMap[emp._id.toString()] = emp;
        });

        // 3. Final Calculation with Allowances
        const finalPayroll = payrollData.map(record => {
            const emp = empMap[record._id.toString()];
            if (!emp) return null;

            // --- ALLOWANCE LOGIC ---
            // A. Fixed Allowances (Meal, Medical) - Add if > 0
            const mealAllowance = emp.allowanceMeal || 0;
            const medicalAllowance = emp.allowanceMedical || 0;

            // B. Attendance Allowance (Only if present >= 25 days)
            const attendanceAllowance = (record.daysPresent >= 25) ? (emp.allowanceAttendance || 0) : 0;

            const totalAllowances = mealAllowance + medicalAllowance + attendanceAllowance;
            const finalTotalPay = record.grossWorkPay + totalAllowances;

            return {
                employeeId: emp._id,
                employeeID: emp.employeeID,
                employeeName: emp.employeeName,
                position: emp.position,
                
                // Hours
                totalHours: (record.totalNormalHours + record.totalOtHours).toFixed(2),
                daysPresent: record.daysPresent,
                
                // Rate (Display Basic Hourly Rate)
                hourlyRate: emp.salary,

                // Financials
                basicPay: record.totalBasicPay,
                otPay: record.totalOtPay,
                allowances: totalAllowances,
                
                // Allowances Breakdown (Optional, for frontend tooltip if needed)
                allowanceBreakdown: {
                    meal: mealAllowance,
                    medical: medicalAllowance,
                    attendance: attendanceAllowance
                },

                totalPay: finalTotalPay,
                status: "Active"
            };
        });

        // Remove nulls and sort
        const sortedPayroll = finalPayroll.filter(p => p !== null).sort((a, b) => a.employeeID.localeCompare(b.employeeID));

        res.status(200).json(sortedPayroll);

    } catch (error) {
        console.error("Error fetching payroll summary:", error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get Detailed Payroll for ONE employee
 * @route   GET /api/workforce/payroll/employee/:id
 */
const getEmployeePayrollDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.query;

        const employee = await Employee.findById(id);
        if (!employee) return res.status(404).json({ message: "Employee not found" });

        const records = await Attendance.find({
            employee: id,
            date: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }).sort({ date: 1 });

        // Calculate Totals for the header
        const daysPresent = records.filter(r => r.status === "Present").length;
        
        // Calculate Allowances for this period
        const mealAllowance = employee.allowanceMeal || 0;
        const medicalAllowance = employee.allowanceMedical || 0;
        const attendanceAllowance = (daysPresent >= 25) ? (employee.allowanceAttendance || 0) : 0;
        const totalAllowances = mealAllowance + medicalAllowance + attendanceAllowance;

        const formattedRecords = records.map(r => ({
            _id: r._id,
            date: r.date,
            startTime: r.startTime,
            endTime: r.endTime,
            status: r.status,
            
            // New detailed fields
            normalHours: r.normalHours || 0,
            otHours: r.otHours || 0,
            hourlyRate: r.hourlyRate,
            otRate: r.otRate,
            doubleOtHours: r.doubleOtHours || 0,
            doubleOtRate: r.doubleOtRate,
            
            normalPay: r.normalPay || 0,
            otPay: r.otPay || 0,
            dailyPay: r.dailyPay || 0
        }));

        res.status(200).json({
            employee: {
                name: employee.employeeName,
                id: employee.employeeID,
                position: employee.position,
                hourlyRate: employee.salary
            },
            summary: {
                daysPresent,
                totalAllowances,
                allowanceBreakdown: {
                    meal: mealAllowance,
                    medical: medicalAllowance,
                    attendance: attendanceAllowance
                }
            },
            records: formattedRecords
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getPayrollSummary, getEmployeePayrollDetails };