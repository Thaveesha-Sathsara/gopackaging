const { JSONCookie } = require("cookie-parser");
const Attendance = require("../../models/workforce/attendance.model");
const Employee = require("../../models/workforce/employee.model");
// ✅ Ensure this path matches your folder structure!
const PayrollAdjustment = require("../../models/workforce/payrollAdjustment.model"); 
const mongoose = require("mongoose");

// Helpers
const getFirstOfMonth = (date) => new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1));
const getPrevMonth = (date) => new Date(Date.UTC(date.getFullYear(), date.getMonth() - 1, 1));

const getPayrollSummary = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) return res.status(400).json({ message: "Date range required" });

        const payrollData = await Attendance.aggregate([
            {
                $match: {
                    date: { $gte: new Date(startDate), $lte: new Date(endDate) },
                    status: "Present"
                },
            },
            {
                $group: {
                    _id: "$employee",
                    daysPresent: { $sum: 1 },
                    totalNormalHours: { $sum: "$normalHours" },
                    totalOtHours: { $sum: "$otHours" },
                    totalDoubleOtHours: { $sum: "$doubleOtHours" },
                    totalBasicPay: { $sum: "$normalPay" },
                    totalOtPay: { $sum: "$otPay" },
                    totalDoubleOtPay: { $sum: "$doubleOtPay" },
                    grossWorkPay: { $sum: "$dailyPay" }, // This is usually Basic + OT
                    totalLateDeductions: { $sum: "$lateDeduction" }
                },
            },
        ]);

        const employeeIds = payrollData.map(p => p._id);
        const employees = await Employee.find({
            _id: { $in: employeeIds },
            isActived: true
        });
        
        const empMap = {};
        employees.forEach(emp => { empMap[emp._id.toString()] = emp; });

        // ✅ Fetch Adjustments for this Month
        const targetMonth = getFirstOfMonth(new Date(startDate));
        const adjustments = await PayrollAdjustment.find({ 
            month: targetMonth,
            employee: { $in: employeeIds }
        });
        const adjMap = {};
        adjustments.forEach(adj => { adjMap[adj.employee.toString()] = adj; });

        const finalPayroll = payrollData.map(record => {
            const emp = empMap[record._id.toString()];
            if (!emp) return null;
            const adj = adjMap[record._id.toString()];

            // Calculate Allowances
            const mealAllowance = (adj?.isMealClaimed) ? (emp.allowanceMeal || 0) : 0;
            const medicalAllowance = (adj?.isMedicalClaimed) ? (emp.allowanceMedical || 0) : 0;
            const attendanceAllowance = (record.daysPresent >= 25) ? (emp.allowanceAttendance || 0) : 0;
            const specialBonus = adj?.bonusAmount || 0;
            const advanceReceived = (adj?.isAdvanceTaken) ? (emp.fixedAdvanceAmount || 0) : 0;

            // --- FIXED ETF LOGIC START ---
            const etfRate = emp.etfRate || 0;
            const isEtfApplied = adj?.isEtfApplied || false;
            
            // 1. Calculate the ETF amount based on Gross Work Pay
            const etfAmount = isEtfApplied ? (record.grossWorkPay * (etfRate / 100)) : 0;
            // --- FIXED ETF LOGIC END ---

            const totalAllowances = mealAllowance + medicalAllowance + attendanceAllowance + specialBonus + advanceReceived;
            
            // ✅ Net Pay Calculation:
            // (Money You Earned) - (Money Deducted)
            // (GrossWorkPay + Allowances) - (ETF Amount)
            const finalTotalPay = (record.grossWorkPay + totalAllowances) - etfAmount;

            return {
                employeeId: emp._id,
                employeeID: emp.employeeID,
                employeeName: emp.employeeName,
                position: emp.position,
                totalHours: (record.totalNormalHours + record.totalOtHours).toFixed(2),
                daysPresent: record.daysPresent,
                hourlyRate: emp.salary,
                basicPay: record.totalBasicPay,
                otPay: record.totalOtPay,
                allowances: totalAllowances,
                etfAmount: Number(etfAmount.toFixed(2)), // Showing what was deducted
                totalPay: Number(finalTotalPay.toFixed(2)), // The final amount in hand
            };
        });

        const sortedPayroll = finalPayroll.filter(p => p !== null).sort((a, b) => a.employeeID.localeCompare(b.employeeID));
        res.status(200).json(sortedPayroll);

    } catch (error) {
        console.error("Error fetching payroll summary:", error);
        res.status(500).json({ message: error.message });
    }
};

const getEmployeePayrollDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.query;
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        const currentMonth = getFirstOfMonth(start);
        const previousMonth = getPrevMonth(start);

        const employee = await Employee.findById(id);
        if (!employee) return res.status(404).json({ message: "Employee not found" });

        const records = await Attendance.find({
            employee: id,
            date: { $gte: start, $lte: end }
        }).sort({ date: 1 });

        const currentAdj = await PayrollAdjustment.findOne({ employee: id, month: currentMonth });
        const prevAdj = await PayrollAdjustment.findOne({ employee: id, month: previousMonth });

        // logic
        const daysPresent = records.filter(r => r.status === "Present").length;
        const normalHours = records.reduce((sum, r) => sum + (r.normalHours || 0), 0);
        const otHours = records.reduce((sum, r) => sum + (r.otHours || 0), 0);
        const doubleOtHours = records.reduce((sum, r) => sum + (r.doubleOtHours || 0), 0);
        
        const mealAllowance = (currentAdj?.isMealClaimed) ? (employee.allowanceMeal || 0) : 0;
        const medicalAllowance = (currentAdj?.isMedicalClaimed) ? (employee.allowanceMedical || 0) : 0;
        const attendanceAllowance = (daysPresent >= 25) ? (employee.allowanceAttendance || 0) : 0;
        const specialBonus = currentAdj?.bonusAmount || 0;
        const bonusRemark = currentAdj?.bonusRemark || "";
        const advanceReceived = (currentAdj?.isAdvanceTaken) ? (employee.fixedAdvanceAmount || 0) : 0;

        const totalLateDeductions = records.reduce((sum, r) => sum + (r.lateDeduction || 0), 0);
        const advanceDeduction = (prevAdj?.isAdvanceTaken) ? (employee.fixedAdvanceAmount || 0) : 0;

        // Sum of all daily earning (Normal + OT + Double OT)
        const totalWorkPay = records.reduce((sum, rec) => sum + (rec.dailyPay || 0), 0);
        const otPay = records.reduce((sum, rec) => sum + (rec.otPay || 0), 0);
        const doubleOtPay = records.reduce((sum, rec) => sum + (rec.doubleOtPay || 0), 0);

        // --- FIXED ETF LOGIC START ---
        const etfRate = employee.etfRate || 0;
        const isEtfApplied = currentAdj ? currentAdj.isEtfApplied : false;
        
        // Calculate ETF amount
        const etfAmount = isEtfApplied ? (totalWorkPay * (etfRate / 100)) : 0;
        // --- FIXED ETF LOGIC END ---

        // Add ETF to total deductions
        const totalDeductions = advanceDeduction + etfAmount;

        const totalActualBasicPay = records.reduce((sum, r) => sum + (r.normalPay || 0), 0);
        const totalGrossBasicPay = totalActualBasicPay + totalLateDeductions;
        const totalAllowances = mealAllowance + medicalAllowance + attendanceAllowance + specialBonus + advanceReceived;
        
        // Formula: (Work Pay + Allowances) - (Deductions)
        // Deductions = Old Advance + ETF
        // Note: advanceReceived is technically money IN, advanceDeduction is money OUT
        const netPay = (totalWorkPay + totalAllowances) - totalDeductions;

        const formattedRecords = records.map(r => ({
            _id: r._id,
            date: r.date,
            startTime: r.startTime,
            endTime: r.endTime,
            status: r.status,
            normalHours: r.normalHours || 0,
            otHours: r.otHours || 0,
            hourlyRate: r.hourlyRate,
            otRate: r.otRate,
            doubleOtHours: r.doubleOtHours || 0,
            doubleOtRate: r.doubleOtRate,
            lateDeduction: r.lateDeduction || 0, 
            normalPay: r.normalPay || 0,
            otPay: r.otPay || 0,
            dailyPay: r.dailyPay || 0
        }));

        res.status(200).json({
            employee: {
                name: employee.employeeName,
                id: employee.employeeID,
                nic: employee.nic,
                joinedDate: employee.joiningDate,
                position: employee.position,
                hourlyRate: employee.salary
            },
            summary: {
                daysPresent,
                normalHours,
                otHours,
                doubleOtHours,
                totalWorkPay,
                totalAllowances,
                specialBonus,
                bonusRemark,
                advanceReceived,
                totalLateDeductions,
                advanceDeduction,
                etfAmount,
                otPay,
                doubleOtPay,
                totalGrossBasicPay,
                totalActualBasicPay,
                allowanceBreakdown: {
                    meal: mealAllowance,
                    medical: medicalAllowance,
                    attendance: attendanceAllowance,
                    advance: advanceReceived,
                    bonus: specialBonus,
                },
                netPay: Number(netPay.toFixed(2))
            },
            records: formattedRecords
        });

    } catch (error) {
        console.error(error); 
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getPayrollSummary, getEmployeePayrollDetails };