const cron = require("node-cron");
const { sendEmailAlerts } = require("../config/email.config");
const Employee = require("../models/workforce/employee.model");
const Attendance = require("../models/workforce/attendance.model");
const InventoryTransaction = require("../models/inventory/inventoryTransaction.model");
const RawMaterial = require("../models/inventory/rawMaterial.model");

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount || 0);
};

const runDailyReport = () => {
    // Schedule: 8:00 AM every day ('0 8 * * *')
    cron.schedule("0 3 * * *", async () => {
        console.log("Running Daily Report Job...");

        try {
            // 1. Define "Yesterday" (The full 24 hours of the previous day)
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);
            
            const yesterdayEnd = new Date(yesterday);
            yesterdayEnd.setHours(23, 59, 59, 999);

            const dateString = yesterday.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

            // 2. DATA: Attendance Summary
            const attendanceStats = await Attendance.aggregate([
                { $match: { date: { $gte: yesterday, $lte: yesterdayEnd } } },
                {
                    $group: {
                        _id: null,
                        present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
                        leave: { $sum: { $cond: [{ $eq: ["$status", "Leave"] }, 1, 0] } },
                        totalCost: { $sum: "$dailyPay" }, // Using the snapshot field we created!
                        totalHours: { $sum: "$totalHours" },
                        lateDeductions: { $sum: "$lateDeduction" }
                    }
                }
            ]);
            const att = attendanceStats[0] || { present: 0, leave: 0, totalCost: 0, totalHours: 0, lateDeductions: 0 };

            // 3. DATA: Inventory Movement (Yesterday)
            const transactions = await InventoryTransaction.aggregate([
                { $match: { date: { $gte: yesterday, $lte: yesterdayEnd } } },
                {
                    $group: {
                        _id: "$type", // 'in' or 'out'
                        count: { $sum: 1 },
                        itemsMoved: { $push: { reason: "$reason", qty: "$quantity", model: "$itemModel" } } // Simple list
                    }
                }
            ]);
            
            const addedCount = transactions.find(t => t._id === 'in')?.count || 0;
            const usedCount = transactions.find(t => t._id === 'out')?.count || 0;

            // 4. DATA: Low Stock Items (Current Status)
            const lowStockItems = await RawMaterial.find({ 
                $expr: { $lte: ["$currentStock", "$minimumLevel"] } 
            }).limit(5); // Only show top 5

            // 5. BUILD HTML EMAIL
            const htmlContent = `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <div style="background-color: #0f172a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                        <h1 style="margin: 0; font-size: 24px;">Daily Operations Report</h1>
                        <p style="margin: 5px 0 0 0; opacity: 0.8;">For ${dateString}</p>
                    </div>

                    <div style="padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
                        
                        <!-- WORKFORCE SECTION -->
                        <h3 style="border-bottom: 2px solid #3b82f6; padding-bottom: 5px; color: #1e40af;">Workforce Summary</h3>
                        <table style="width: 100%; margin-bottom: 20px;">
                            <tr>
                                <td style="padding: 8px; background: #eff6ff;"><strong>Present:</strong> ${att.present}</td>
                                <td style="padding: 8px; background: #eff6ff;"><strong>On Leave:</strong> ${att.leave}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px;"><strong>Total Hours:</strong> ${att.totalHours.toFixed(1)} hrs</td>
                                <td style="padding: 8px;"><strong>Late Deductions:</strong> ${formatCurrency(att.lateDeductions)}</td>
                            </tr>
                            <tr>
                                <td colspan="2" style="padding: 12px; background: #dbeafe; text-align: center; border-radius: 4px;">
                                    <strong>Estimated Daily Payroll Cost:</strong> <br/>
                                    <span style="font-size: 18px; color: #1e3a8a;">${formatCurrency(att.totalCost)}</span>
                                </td>
                            </tr>
                        </table>

                        <!-- INVENTORY SECTION -->
                        <h3 style="border-bottom: 2px solid #f59e0b; padding-bottom: 5px; color: #92400e;">Inventory Movement</h3>
                        <p style="margin-bottom: 15px;">Yesterday's transaction summary:</p>
                        <table style="width: 100%; margin-bottom: 20px; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Added/Produced:</strong></td>
                                <td style="padding: 8px; border: 1px solid #e2e8f0; color: green;">${addedCount} Transactions</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Used/Shipped:</strong></td>
                                <td style="padding: 8px; border: 1px solid #e2e8f0; color: orange;">${usedCount} Transactions</td>
                            </tr>
                        </table>

                        ${lowStockItems.length > 0 ? `
                            <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 10px; border-radius: 6px;">
                                <strong style="color: #b91c1c;">Critical Low Stock Alerts (${lowStockItems.length})</strong>
                                <ul style="margin: 10px 0 0 20px; padding: 0; color: #b91c1c; font-size: 13px;">
                                    ${lowStockItems.map(i => `<li>${i.name}: ${i.currentStock} ${i.unit} (Min: ${i.minimumLevel})</li>`).join('')}
                                </ul>
                            </div>
                        ` : '<p style="color: green; font-size: 13px;">All raw material stock levels are healthy.</p>'}
                        
                        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #94a3b8;">
                            <p>This is an automated message from your LCS Enterprises G.O Packaging Workforce System.</p>
                        </div>
                    </div>
                </div>
            `;

            // 6. Send Email
            await sendEmailAlerts(process.env.ADMIN_EMAIL, `Daily Report: ${dateString}`, htmlContent);

        } catch (error) {
            console.error("Daily Report Job Failed:", error);
        }
    },
        {
            timezone: "Asia/Colombo"
        }
    );
};

module.exports = runDailyReport;