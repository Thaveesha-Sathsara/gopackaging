const Employee = require("../../models/workforce/employee.model");
const Attendance = require("../../models/workforce/attendance.model");
const RawMaterial = require("../../models/inventory/rawMaterial.model");
const InventoryTransaction = require("../../models/inventory/inventoryTransaction.model");
const Holiday = require("../../models/workforce/holiday.model");

const getDashboardStats = async (req, res, next) => {
    try {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        
        // --- 1. CORE KPIS ---
        const totalEmployees = await Employee.countDocuments({ isActived: true });
        
        // Attendance Today
        const presentToday = await Attendance.countDocuments({ date: today, status: "Present", startTime: { $ne: null, $ne: "" } });
        const attendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;

        // Inventory Alerts
        const lowStockMaterials = await RawMaterial.find({ 
            $expr: { $lt: ["$currentStock", "$minimumLevel"] } 
        }).limit(4); // Limit to 4 for UI fit

        // --- 2. WORKFORCE METRICS (Last 30 Days) ---
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);

        const workforceStats = await Attendance.aggregate([
            { $match: { date: { $gte: thirtyDaysAgo, $lte: today } } },
            { $group: {
                _id: null,
                totalNormalHours: { $sum: "$normalHours" },
                totalOtHours: { $sum: "$otHours" },
                totalDoubleOtHours: { $sum: "$doubleOtHours" },
                totalPayrollCost: { $sum: "$dailyPay" } // Rough estimate of cost
            }}
        ]);

        const workMetrics = workforceStats[0] || { totalNormalHours: 0, totalOtHours: 0, totalPayrollCost: 0 };

        // --- 3. PAYROLL TREND (Last 6 Months) ---
        // Group by Month to show spending trends
        const sixMonthsAgo = new Date(today);
        sixMonthsAgo.setMonth(today.getMonth() - 5);
        sixMonthsAgo.setDate(1);

        const payrollTrend = await Attendance.aggregate([
            { $match: { date: { $gte: sixMonthsAgo } } },
            { $group: {
                _id: { 
                    month: { $month: "$date" }, 
                    year: { $year: "$date" } 
                },
                totalPay: { $sum: "$dailyPay" },
                totalOT: { $sum: "$otPay" }
            }},
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Format for Recharts: "Jan", "Feb", etc.
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const formattedPayrollTrend = payrollTrend.ineterval.map(item => ({
            name: monthNames[item._id.month - 1],
            total: Math.round(item.totalPay),
            ot: Math.round(item.totalOT)
        }));

        // --- 4. UPCOMING HOLIDAYS (Next 3) ---
        const upcomingHolidays = await Holiday.find({ date: { $gte: today } })
            .sort({ date: 1 })
            .limit(3);

        res.status(200).json({
            stats: {
                totalEmployees,
                presentToday,
                attendanceRate,
                lowStockCount: lowStockMaterials.length,
                totalManHours: Math.round(workMetrics.totalNormalHours + workMetrics.totalOtHours),
                otHours: Math.round(workMetrics.totalOtHours + workMetrics.totalDoubleOtHours),
                estimatedPayrollCost: Math.round(workMetrics.totalPayrollCost)
            },
            lists: {
                lowStockMaterials,
                upcomingHolidays
            },
            charts: {
                payrollTrend: formattedPayrollTrend
            }
        });

    } catch (error) {
        next(error);
    }
};

module.exports = { getDashboardStats };