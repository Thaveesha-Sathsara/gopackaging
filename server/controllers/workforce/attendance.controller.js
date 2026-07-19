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

// ✅ UPDATED: Accepts an 'options' object to control logic based on Role
const calculateTimeLogic = (startTimeStr, endTimeStr, isHolidayOrSunday, options = {}) => {
    // Default options: Assume OT is allowed unless specified otherwise
    const { allowOvertime = true } = options;

    if (!startTimeStr || !endTimeStr) {
        return { normalHours: 0, otHours: 0, doubleOtHours: 0, lostHours: 0 };
    }

    const toDecimal = (time) => {
        const [h, m] = time.split(":").map(Number);
        return h + m / 60;
    };

    let actualStart = toDecimal(startTimeStr);
    let actualEnd = toDecimal(endTimeStr);

    // ✅ FIX: Handle Midnight Crossing (e.g. 20:00 to 05:00)
    if (actualEnd < actualStart) {
        actualEnd += 24;
    }

    // --- DEFINE SHIFT RULES ---
    let SHIFT_START_TIME, SHIFT_END_TIME, BUFFER_LIMIT;

    if (actualStart >= 12.0) {
        // 🌙 NIGHT SHIFT CONFIG (Starts after 12 PM)
        SHIFT_START_TIME = 20.0; // 8:00 PM
        SHIFT_END_TIME = 29.0;   // 5:00 AM (24 + 5)
        BUFFER_LIMIT = 29.5;     // 5:30 AM
    } else {
        // ☀️ DAY SHIFT CONFIG (Starts before 12 PM)
        SHIFT_START_TIME = 8.0;  // 8:00 AM
        SHIFT_END_TIME = 17.0;   // 5:00 PM
        BUFFER_LIMIT = 17.5;     // 5:30 PM
    }

    let effectiveStart;
    let lostHours = 0; 

    // 1. APPLY START TIME ROUNDING (LATE PENALTY)
    if (actualStart <= SHIFT_START_TIME) {
        effectiveStart = SHIFT_START_TIME; 
    } else {
        effectiveStart = Math.ceil(actualStart);
        if (!isHolidayOrSunday) {
             lostHours = effectiveStart - actualStart;
        }
    }

    // 2. CHECK: IS IT A HOLIDAY OR SUNDAY?
    if (isHolidayOrSunday) {
        let effectiveEnd = actualEnd;
        let duration = Math.max(0, effectiveEnd - effectiveStart);
        
        // ✅ ROLE CHECK: If role doesn't allow OT, pay as Normal Hours, not Double OT.
        if (!allowOvertime) {
             return {
                normalHours: parseFloat(duration.toFixed(2)), 
                otHours: 0,
                doubleOtHours: 0,
                lostHours: 0 
            };
        }

        return {
            normalHours: 0,
            otHours: 0,
            doubleOtHours: parseFloat(duration.toFixed(2)),
            lostHours: 0 
        };
    } else {
        // --- NORMAL WORKING DAY LOGIC ---
        let effectiveNormalEnd;
        let effectiveOtEnd;

        // Apply "Free Gap" Buffer Rule
        if (actualEnd <= BUFFER_LIMIT) {
            effectiveNormalEnd = SHIFT_END_TIME;
            effectiveOtEnd = SHIFT_END_TIME;
        } else {
            effectiveNormalEnd = SHIFT_END_TIME;
            effectiveOtEnd = actualEnd;
        }

        let normalHours = Math.max(0, effectiveNormalEnd - effectiveStart);
        
        // Calculate potential OT
        let rawOtHours = Math.max(0, effectiveOtEnd - SHIFT_END_TIME);
        
        // ✅ ROLE CHECK: Force OT to 0 if not allowed
        let otHours = allowOvertime ? rawOtHours : 0;
        
        // If OT is disabled but they worked extra, you might want to add rawOtHours to normalHours 
        // depending on company policy. Here we assume strictly "No OT Pay".

        return { 
            normalHours: parseFloat(normalHours.toFixed(2)), 
            otHours: parseFloat(otHours.toFixed(2)),
            doubleOtHours: 0,
            lostHours: parseFloat(lostHours.toFixed(2)) 
        };
    }
};

const getAttendanceSummary = async (req, res, next) => {
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
        next(error)
    }
};

const getDailyAttendance = async (req, res, next) => {
    try {
        const { date } = req.query;
        if (!date) return res.status(400).json({ message: "Date required" });
        const searchDate = normalizeDate(date);
        const records = await Attendance.find({ date: searchDate }).populate({ path: "employee", select: "employeeID employeeName isActived", match: { isActived: true } });
        res.status(200).json(records);
    } catch (error) {
        next(error)
    }
};

const createDailyAttendance = async (req, res, next) => {
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
            date: { $gte: startOfDay, $lte: endOfDay } 
        });
        
        const isHoliday = !!holidayRecord;
        const isDoubleOtDay = isSunday || isHoliday; 

        // 2. Fetch Employees AND THEIR ROLES
        const employeeIds = records.map(r => r.employeeId);
        
        // ✅ POPULATE ROLE to get access to 'allowOvertime'
        const employees = await Employee.find({ _id: { $in: employeeIds } })
            .populate('role'); 
        
        const empMap = {};
        employees.forEach(emp => {
            empMap[emp._id.toString()] = {
                salary: emp.salary || 0,        
                rateOT: emp.rateOT || 0,        
                rateDoubleOT: emp.rateDoubleOT || 0,
                // ✅ Extract Rule: Default to true if role is missing/deleted
                allowOvertime: emp.role ? emp.role.allowOvertime : true 
            };
        });

        const operations = records.map(record => {
            const empData = empMap[record.employeeId] || { salary: 0, rateOT: 0, allowOvertime: true };
            
            let normalHours = 0, otHours = 0, doubleOtHours = 0, totalHours = 0;
            let normalPay = 0, otPay = 0, doubleOtPay = 0, dailyPay = 0;
            let lateDeduction = 0;

            if (record.status === "Present" && record.startTime && record.endTime) {
                // ✅ PASS ROLE CONFIGURATION
                const calc = calculateTimeLogic(
                    record.startTime, 
                    record.endTime, 
                    isDoubleOtDay,
                    { allowOvertime: empData.allowOvertime }
                );
                
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
            ? `Saved. Treated as ${isSunday ? "Sunday" : "Holiday"}: Double OT Applied (if eligible).` 
            : "Saved. Normal working day.";

        res.status(201).json({ message, result });

    } catch (error) {
        console.error(error);
        next(error)
    }
};

const getEmployeeAttendanceHistory = async (req, res, next) => {
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
        next(error)
    }
};

module.exports = {
    getAttendanceSummary,
    createDailyAttendance,
    getDailyAttendance,
    getEmployeeAttendanceHistory
};