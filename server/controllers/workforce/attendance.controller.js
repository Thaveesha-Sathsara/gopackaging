const Attendance = require("../../models/workforce/attendance.model");
const Employee = require("../../models/workforce/employee.model");
const Holiday = require("../../models/workforce/holiday.model");
const mongoose = require("mongoose");

// Helper: Normalize date to start of day (00:00:00 UTC)
const normalizeDate = (dateString) => {
    const date = new Date(dateString);
    date.setUTCHours(0, 0, 0, 0);
    return date;
};

// 

const calculateTimeLogic = (startTimeStr, endTimeStr, isHolidayOrSunday) => {
    if (!startTimeStr || !endTimeStr) {
        return { normalHours: 0, otHours: 0, doubleOtHours: 0, lostHours: 0 };
    }

    // Helper to convert "08:30" to 8.5
    const toDecimal = (time) => {
        const [h, m] = time.split(":").map(Number);
        return h + m / 60;
    };

    let actualStart = toDecimal(startTimeStr);
    let actualEnd = toDecimal(endTimeStr);

    // ✅ FIX: HANDLE MIDNIGHT CROSSING
    // If End Time is less than Start Time (e.g., Start 20:00, End 05:00),
    // it means the shift ended the next day. Add 24 hours to End Time.
    if (actualEnd < actualStart) {
        actualEnd += 24;
    }

    // --- DEFINE SHIFT RULES ---
    // We determine the shift type based on the Start Time.
    // If they start after 12:00 PM (12.0), we assume it's a Night Shift.
    
    let SHIFT_START_TIME, SHIFT_END_TIME, BUFFER_LIMIT;

    if (actualStart >= 12.0) {
        // 🌙 NIGHT SHIFT CONFIG
        SHIFT_START_TIME = 20.0; // 8:00 PM
        SHIFT_END_TIME = 29.0;   // 5:00 AM (24 + 5)
        BUFFER_LIMIT = 29.5;     // 5:30 AM (OT starts after this)
    } else {
        // ☀️ DAY SHIFT CONFIG
        SHIFT_START_TIME = 8.0;  // 8:00 AM
        SHIFT_END_TIME = 17.0;   // 5:00 PM
        BUFFER_LIMIT = 17.5;     // 5:30 PM
    }

    let effectiveStart;
    let lostHours = 0; 

    // 1. APPLY START TIME ROUNDING (LATE PENALTY)
    // Works for both: 8:15->9:00 OR 20:15->21:00
    if (actualStart <= SHIFT_START_TIME) {
        effectiveStart = SHIFT_START_TIME; 
    } else {
        effectiveStart = Math.ceil(actualStart);
        // Calculate penalty only on normal days
        if (!isHolidayOrSunday) {
             lostHours = effectiveStart - actualStart;
        }
    }

    // 2. CHECK: IS IT A HOLIDAY OR SUNDAY?
    if (isHolidayOrSunday) {
        // Double OT applies to the entire duration worked
        let effectiveEnd = actualEnd;
        let duration = Math.max(0, effectiveEnd - effectiveStart);
        
        return {
            normalHours: 0,
            otHours: 0,
            doubleOtHours: parseFloat(duration.toFixed(2)),
            lostHours: 0 
        };
    } else {
        // --- NORMAL WORKING DAY LOGIC (Day or Night) ---
        
        let effectiveNormalEnd;
        let effectiveOtEnd;

        // Apply the "Free Gap" Buffer Rule
        if (actualEnd <= BUFFER_LIMIT) {
            // User left during the gap (e.g., 5:15 AM). 
            // We clamp payment to Shift End (5:00 AM). No OT.
            effectiveNormalEnd = SHIFT_END_TIME;
            effectiveOtEnd = SHIFT_END_TIME;
        } else {
            // User stayed past the gap (e.g., 6:00 AM).
            // OT applies.
            effectiveNormalEnd = SHIFT_END_TIME;
            effectiveOtEnd = actualEnd;
        }

        // Calculate Durations
        let normalHours = Math.max(0, effectiveNormalEnd - effectiveStart);
        
        // OT is calculated based on time worked AFTER the shift end
        let otHours = Math.max(0, effectiveOtEnd - SHIFT_END_TIME);
        
        return { 
            normalHours: parseFloat(normalHours.toFixed(2)), 
            otHours: parseFloat(otHours.toFixed(2)),
            doubleOtHours: 0,
            lostHours: parseFloat(lostHours.toFixed(2)) 
        };
    }
};

const getAttendanceSummary = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) return res.status(400).json({ message: "Dates required" });

        const start = new Date(startDate);
        start.setUTCHours(0, 0, 0, 0); 

        const end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999);

        const summary = await Attendance.aggregate([
            {
                $match: {
                    date: { $gte: start, $lte: end },
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
                $match: 
                { "employeeDetails.isActived": true }
            },
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
        const records = await Attendance.find({ date: searchDate }).populate({ path: "employee", select: "employeeID employeeName isActived", match: { isActived: true } });
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

        // 1. CHECK DAY TYPE
        const dayOfWeek = normalizedDate.getUTCDay(); 
        const isSunday = dayOfWeek === 0;

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
            let lateDeduction = 0;

            if (record.status === "Present" && record.startTime && record.endTime) {
                // ✅ All complexity is detected automatically inside here
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

                // 4. Late Deduction
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
                            status: record.status || "Present",
                            startTime: record.startTime,
                            endTime: record.endTime,
                            normalHours, otHours, doubleOtHours, totalHours,
                            hourlyRate: empData.salary, otRate: empData.rateOT, doubleOtRate: empData.rateDoubleOT,
                            normalPay, otPay, doubleOtPay, dailyPay,
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
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.query;
        const employee = await Employee.findById(id);
        if (!employee) return res.status(404).json({ message: "Not found" });

        const start = new Date(startDate);
        start.setUTCHours(0, 0, 0, 0);

        const end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999);

        const records = await Attendance.find({
            employee: id,
            date: { $gte: start, $lte: end },
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