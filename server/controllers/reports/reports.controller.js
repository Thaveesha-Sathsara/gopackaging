const Employee = require("../../models/workforce/employee.model");
const Attendance = require("../../models/workforce/attendance.model");
const RawMaterial = require("../../models/inventory/rawMaterial.model");
const FinishedGood = require("../../models/inventory/finishedGood.model");
const InventoryTransaction = require("../../models/inventory/inventoryTransaction.model");
const mongoose = require("mongoose");

// --- 1. EMPLOYEE 360 REPORT ---
const getEmployeeReport = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Get Employee Basic Details
        const employee = await Employee.findById(id).select("employeeID employeeName position joiningDate mobileNumber address salary rateOT");
        if (!employee) return res.status(404).json({ message: "Employee not found" });

        // 2. Define 6-Month Range
        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(today.getMonth() - 6);

        // 3. Aggregate Monthly Stats (The "Heavy Lifting")
        const monthlyStats = await Attendance.aggregate([
            {
                $match: {
                    employee: new mongoose.Types.ObjectId(id),
                    date: { $gte: sixMonthsAgo, $lte: today }
                }
            },
            {
                $group: {
                    _id: { 
                        year: { $year: "$date" }, 
                        month: { $month: "$date" } 
                    },
                    // Summing up the SNAPSHOT data we saved earlier
                    earnings: { $sum: "$dailyPay" }, 
                    otEarnings: { $sum: { $add: ["$otPay", "$doubleOtPay"] } },
                    hours: { $sum: "$totalHours" },
                    present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
                    late: { $sum: { $cond: [{ $gt: ["$lateDeduction", 0] }, 1, 0] } }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // 4. Format Data for Recharts (Array of Objects)
        const history = monthlyStats.map(item => {
            // Convert { year: 2023, month: 11 } to "Nov"
            const date = new Date(item._id.year, item._id.month - 1);
            return {
                name: date.toLocaleString('default', { month: 'short' }),
                fullDate: date.toISOString(),
                earnings: item.earnings || 0,
                otEarnings: item.otEarnings || 0,
                hours: item.hours || 0,
                present: item.present || 0,
                late: item.late || 0
            };
        });

        // 5. Calculate Summary Stats
        const totalHours = history.reduce((acc, cur) => acc + cur.hours, 0);
        const totalEarnings = history.reduce((acc, cur) => acc + cur.earnings, 0);
        const avgHours = history.length > 0 ? (totalHours / history.length) : 0;
        const lastPay = history.length > 0 ? history[history.length - 1].earnings : 0;

        res.status(200).json({
            employee,
            history,
            stats: {
                hours: avgHours.toFixed(1),
                earnings: lastPay
            }
        });

    } catch (error) {
        console.error("Report Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// --- 2. INVENTORY HEALTH REPORT ---
const getInventoryReport = async (req, res) => {
    try {
        // 1. Raw Materials Health
        const rawMaterials = await RawMaterial.find();
        
        // Calculate status counts
        let lowStock = 0;
        let healthyStock = 0;
        let outOfStock = 0;

        const materialHealthData = rawMaterials.map(m => {
            if (m.currentStock === 0) outOfStock++;
            else if (m.currentStock < m.minimumLevel) lowStock++;
            else healthyStock++;

            return {
                name: m.name,
                stock: m.currentStock,
                min: m.minimumLevel,
                status: m.currentStock < m.minimumLevel ? "Critical" : "Good"
            };
        });

        // 2. Finished Goods Summary
        const finishedGoods = await FinishedGood.find();
        
        // 3. Transactions (Last 30 Days) - To show movement
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const transactions = await InventoryTransaction.aggregate([
            { $match: { date: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    inward: { $sum: { $cond: [{ $eq: ["$type", "in"] }, "$quantity", 0] } },
                    outward: { $sum: { $cond: [{ $eq: ["$type", "out"] }, "$quantity", 0] } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({
            rawMaterialStats: {
                total: rawMaterials.length,
                lowStock,
                outOfStock,
                healthyStock,
                details: materialHealthData
            },
            finishedGoodsStats: {
                total: finishedGoods.length,
                details: finishedGoods
            },
            movement: transactions
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getEmployeeReport, getInventoryReport };