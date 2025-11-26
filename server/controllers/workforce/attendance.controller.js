const Attendance = require("../../models/workforce/attendance.model");
const Employee = require("../../models/workforce/employee.model");
const Holiday = require("../../models/workforce/holiday.model");
const mongoose = require("mongoose");

// ... (normalizeDate and calculateTimeLogic remain the same) ...
const normalizeDate = (dateString) => {
    const date = new Date(dateString);
    date.setUTCHours(0, 0, 0, 0);
    return date;
};

const calculateTimeLogic = (startTimeStr, endTimeStr, isHolidayOrSunday) => {
    if (!startTimeStr || !endTimeStr) {
        return { normalHours: 0, otHours: 0, doubleOtHours: 0, lostHours: 0 };
    }

    const toDecimal = (time) => {
        const [h, m] = time.split(":").map(Number);
        return h + m / 60;
    };

    const actualStart = toDecimal(startTimeStr);
    const actualEnd = toDecimal(endTimeStr);

    let effectiveStart;
    let lostHours = 0; // ✅ Track lost time

    // 1. APPLY START TIME ROUNDING
    if (actualStart <= 8.0) {
        effectiveStart = 8.0; 
    } else {
        effectiveStart = Math.ceil(actualStart);
        // ✅ Calculate the penalty gap (e.g., 8:15 -> 9:00. Lost = 0.75)
        // But we only care about the time *after* 8:00
        if (!isHolidayOrSunday) {
             // If they came at 8:15 (8.25), effective is 9.0. 
             // They worked 0.75 hours (8.25 to 9.00) that we are NOT paying for.
             lostHours = effectiveStart - actualStart;
        }
    }

    // 2. CHECK: IS IT A HOLIDAY OR SUNDAY?
    if (isHolidayOrSunday) {
        let effectiveEnd = actualEnd;
        let duration = Math.max(0, effectiveEnd - effectiveStart);
        
        return {
            normalHours: 0,
            otHours: 0,
            doubleOtHours: parseFloat(duration.toFixed(2)),
            lostHours: 0 // Usually no late penalties on Double OT days (optional)
        };
    } else {
        // --- NORMAL DAY LOGIC ---
        const WORK_END_TIME = 17.0; // 5:00 PM
        const BUFFER_LIMIT = 17.5;  // 5:30 PM
        
        let effectiveNormalEnd;
        let effectiveOtEnd;

        if (actualEnd <= BUFFER_LIMIT) {
            effectiveNormalEnd = WORK_END_TIME;
            effectiveOtEnd = WORK_END_TIME;
        } else {
            effectiveNormalEnd = WORK_END_TIME;
            effectiveOtEnd = actualEnd;
        }

        let normalHours = Math.max(0, effectiveNormalEnd - effectiveStart);
        let otHours = Math.max(0, effectiveOtEnd - WORK_END_TIME);
        
        return { 
            normalHours: parseFloat(normalHours.toFixed(2)), 
            otHours: parseFloat(otHours.toFixed(2)),
            doubleOtHours: 0,
            lostHours: parseFloat(lostHours.toFixed(2)) // ✅ Return this
        };
    }
};

// ... (getAttendanceSummary remains the same) ...
const getAttendanceSummary = async (req, res) => {
    // ... copy your existing code here
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) return res.status(400).json({ message: "Dates required" });

        const summary = await Attendance.aggregate([
            {
                $match: {
                    date: { $gte: new Date(startDate), $lte: new Date(endDate) },
                },
            },
            {
                $group: {
                    _id: "$employee",
                    totalHoursWorked: { $sum: "$totalHours" },
                    totalOtHours: { $sum: "$otHours" } 
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
                    totalHoursWorked: "$totalHoursWorked",
                    totalOtHours: "$totalOtHours"
                },
            },
        ]);

        const sortedAttendance = summary.filter(p => p !== null).sort((a, b) => a.employeeID.localeCompare(b.employeeID));
        res.status(200).json(sortedAttendance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const getDailyAttendance = async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) return res.status(400).json({ message: "Date required" });
        const searchDate = normalizeDate(date);
        const records = await Attendance.find({ date: searchDate }).populate("employee", "employeeID employeeName");
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ UPDATED CREATE FUNCTION
const createDailyAttendance = async (req, res) => {
    try {
        const { date, records } = req.body;
        if (!date || !records) return res.status(400).json({ message: "Invalid data" });

        const normalizedDate = normalizeDate(date);

        // 1. CHECK DAY TYPE (ROBUST WAY)
        
        // Check 1: Sunday? Use getUTCDay() to match the UTC normalized date
        const dayOfWeek = normalizedDate.getUTCDay(); 
        const isSunday = dayOfWeek === 0;

        // Check 2: Holiday? Use a RANGE query to catch any time on that day
        const startOfDay = new Date(normalizedDate);
        const endOfDay = new Date(normalizedDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const holidayRecord = await Holiday.findOne({ 
            date: { 
                $gte: startOfDay, 
                $lte: endOfDay 
            } 
        });
        
        const isHoliday = !!holidayRecord;
        const isDoubleOtDay = isSunday || isHoliday; 

        // 2. Fetch Employees for Rates
        const employeeIds = records.map(r => r.employeeId);
        const employees = await Employee.find({ _id: { $in: employeeIds } });
        
        const empMap = {};
        employees.forEach(emp => {
            empMap[emp._id.toString()] = {
                salary: emp.salary || 0,        
                rateOT: emp.rateOT || 0,        
                rateDoubleOT: emp.rateDoubleOT || 0 
            };
        });

        const operations = records.map(record => {
            const empData = empMap[record.employeeId] || { salary: 0, rateOT: 0 };
            
            let normalHours = 0, otHours = 0, doubleOtHours = 0, totalHours = 0;
            let normalPay = 0, otPay = 0, doubleOtPay = 0, dailyPay = 0;
            let lateDeduction = 0; // ✅ Init variable

            if (record.status === "Present" && record.startTime && record.endTime) {
                const calc = calculateTimeLogic(record.startTime, record.endTime, isDoubleOtDay);
                
                normalHours = calc.normalHours;
                otHours = calc.otHours;
                doubleOtHours = calc.doubleOtHours;
                totalHours = normalHours + otHours + doubleOtHours;

                // 1. Normal Pay
                normalPay = normalHours * empData.salary;
                
                // 2. OT Pay
                const effectiveOtRate = empData.rateOT > 0 ? empData.rateOT : (empData.salary * 1.5);
                otPay = otHours * effectiveOtRate;

                // 3. Double OT Pay
                const effectiveDoubleOtRate = empData.rateDoubleOT > 0 ? empData.rateDoubleOT : (empData.salary * 2.0);
                doubleOtPay = doubleOtHours * effectiveDoubleOtRate;

                // 4. ✅ Calculate Late Deduction (Money Lost)
                // Logic: lostHours * Basic Salary Rate
                if (calc.lostHours > 0) {
                    lateDeduction = calc.lostHours * empData.salary;
                }

                dailyPay = normalPay + otPay + doubleOtPay;
            }

            return {
                updateOne: {
                    filter: { 
                        employee: new mongoose.Types.ObjectId(record.employeeId), 
                        date: normalizedDate 
                    },
                    update: {
                        $set: {
                            // ... existing fields ...
                            status: record.status || "Present",
                            startTime: record.startTime,
                            endTime: record.endTime,
                            normalHours, otHours, doubleOtHours, totalHours,
                            hourlyRate: empData.salary, otRate: empData.rateOT, doubleOtRate: empData.rateDoubleOT,
                            normalPay, otPay, doubleOtPay, dailyPay,
                            
                            // ✅ Save the Deduction
                            lateDeduction: lateDeduction 
                        },
                    },
                    upsert: true, 
                },
            };
        });

        const result = await Attendance.bulkWrite(operations);
        
        const message = isDoubleOtDay 
            ? `Saved. Treated as ${isSunday ? "Sunday" : "Holiday"}: Double OT Applied.` 
            : "Saved. Normal working day.";

        res.status(201).json({ message, result });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const getEmployeeAttendanceHistory = async (req, res) => {
    // ... (your existing code)
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.query;
        const employee = await Employee.findById(id);
        if (!employee) return res.status(404).json({ message: "Not found" });

        const records = await Attendance.find({
            employee: id,
            date: { $gte: new Date(startDate), $lte: new Date(endDate) },
        }).sort({ date: -1 });

        res.status(200).json({
            employee: { id: employee.employeeID, name: employee.employeeName, position: employee.position },
            records
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAttendanceSummary,
    createDailyAttendance,
    getDailyAttendance,
    getEmployeeAttendanceHistory
};