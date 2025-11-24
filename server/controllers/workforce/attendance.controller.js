const Attendance = require("../../models/workforce/attendance.model");
const Employee = require("../../models/workforce/employee.model");
const Holiday = require("../../models/workforce/holiday.model");
const mongoose = require("mongoose");

const normalizeDate = (dateString) => {
    const date = new Date(dateString);
    date.setUTCHours(0, 0, 0, 0);
    return date;
};

// --- HELPER: TIME CALCULATION LOGIC ---
const calculateTimeLogic = (startTimeStr, endTimeStr, isHolidayOrSunday) => {
    if (!startTimeStr || !endTimeStr) {
        return { normalHours: 0, otHours: 0, doubleOtHours: 0 };
    }

    const toDecimal = (time) => {
        const [h, m] = time.split(":").map(Number);
        return h + m / 60;
    };

    const actualStart = toDecimal(startTimeStr);
    const actualEnd = toDecimal(endTimeStr);

    // 1. APPLY START TIME ROUNDING (Same rule for both Normal and Holiday)
    // If before 8:00 -> 8:00. If after 8:00 -> Round UP to next hour.
    let effectiveStart;
    if (actualStart <= 8.0) {
        effectiveStart = 8.0; 
    } else {
        effectiveStart = Math.ceil(actualStart);
    }

    // 2. CHECK: IS IT A HOLIDAY OR SUNDAY?
    if (isHolidayOrSunday) {
        // --- DOUBLE OT LOGIC ---
        // Rule: On holidays, ALL work is Double OT. No "Normal Hours".
        // We simply take End Time - Start Time.
        
        let effectiveEnd = actualEnd; // You can apply rounding to end time here if needed
        let duration = Math.max(0, effectiveEnd - effectiveStart);
        
        return {
            normalHours: 0,
            otHours: 0,
            doubleOtHours: parseFloat(duration.toFixed(2)) // All goes here
        };
    } else {
        // --- NORMAL DAY LOGIC (Your existing logic) ---
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
            doubleOtHours: 0
        };
    }
};


const getAttendanceSummary = async (req, res) => {
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
                    // We can also sum OT hours here if you want to show it in summary later
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

const createDailyAttendance = async (req, res) => {
    try {
        const { date, records } = req.body;
        if (!date || !records) return res.status(400).json({ message: "Invalid data" });

        const normalizedDate = normalizeDate(date);

        // 1. CHECK DAY TYPE (Sunday or Holiday?)
        // Check 1: Is it Sunday? (0 = Sunday in JS)
        const dayOfWeek = normalizedDate.getDay();
        const isSunday = dayOfWeek === 0;

        // Check 2: Is it in our Holiday Database?
        const holidayRecord = await Holiday.findOne({ date: normalizedDate });
        const isHoliday = !!holidayRecord; // true if found

        const isDoubleOtDay = isSunday || isHoliday; // If either is true, we use Double OT mode

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
            
            let normalHours = 0;
            let otHours = 0;
            let doubleOtHours = 0;
            let totalHours = 0;
            
            let normalPay = 0;
            let otPay = 0;
            let doubleOtPay = 0;
            let dailyPay = 0;

            if (record.status === "Present") {
                // Pass the "isDoubleOtDay" flag to our calculator
                const calc = calculateTimeLogic(record.startTime, record.endTime, isDoubleOtDay);
                
                normalHours = calc.normalHours;
                otHours = calc.otHours;
                doubleOtHours = calc.doubleOtHours;
                totalHours = normalHours + otHours + doubleOtHours;

                // --- PAY CALCULATIONS ---
                
                // 1. Normal Pay
                normalPay = normalHours * empData.salary;
                
                // 2. OT Pay (1.5x)
                const effectiveOtRate = empData.rateOT > 0 ? empData.rateOT : (empData.salary * 1.5);
                otPay = otHours * effectiveOtRate;

                // 3. Double OT Pay (2.0x) - NEW!
                const effectiveDoubleOtRate = empData.rateDoubleOT > 0 ? empData.rateDoubleOT : (empData.salary * 2.0);
                doubleOtPay = doubleOtHours * effectiveDoubleOtRate;

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
                            status: record.status || "Present",
                            startTime: record.startTime,
                            endTime: record.endTime,
                            
                            // Hours Breakdown
                            normalHours,
                            otHours,
                            doubleOtHours, // Saved to DB
                            totalHours,
                            
                            // Rates Snapshot
                            hourlyRate: empData.salary,
                            otRate: empData.rateOT,
                            doubleOtRate: empData.rateDoubleOT, // Saved to DB

                            // Pay Breakdown
                            normalPay,
                            otPay,
                            doubleOtPay, // Saved to DB
                            dailyPay
                        },
                    },
                    upsert: true, 
                },
            };
        });

        const result = await Attendance.bulkWrite(operations);
        
        // Optional: Send back a message saying if it was treated as a Holiday
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