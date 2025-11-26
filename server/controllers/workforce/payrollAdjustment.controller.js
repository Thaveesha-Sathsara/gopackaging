const PayrollAdjustment = require("../../models/workforce/payrollAdjustment.model");
const Employee = require("../../models/workforce/employee.model");

// Helper to normalize to 1st of the month
const getFirstOfMonth = (dateString) => {
    const date = new Date(dateString);
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1));
};

/**
 * @desc    Get all adjustments for a specific month (for the UI table)
 * @route   GET /api/workforce/payroll/adjustments
 */
const getMonthlyAdjustments = async (req, res) => {
    try {
        const { date } = req.query; // Any date in that month
        if (!date) return res.status(400).json({ message: "Date required" });

        const targetMonth = getFirstOfMonth(date);

        // 1. Get all active employees
        const employees = await Employee.find({ isActived: true }).select("employeeID employeeName allowanceMeal allowanceMedical fixedAdvanceAmount");

        // 2. Get existing adjustments for this month
        const adjustments = await PayrollAdjustment.find({ month: targetMonth });

        // 3. Map data for the frontend table
        const adjMap = {};
        adjustments.forEach(adj => { adjMap[adj.employee.toString()] = adj; });

        const result = employees.map(emp => {
            const adj = adjMap[emp._id.toString()];
            return {
                employeeId: emp._id,
                employeeID: emp.employeeID,
                employeeName: emp.employeeName,
                allowanceMeal: emp.allowanceMeal || 0,
                allowanceMedical: emp.allowanceMedical || 0,
                fixedAdvanceAmount: emp.fixedAdvanceAmount || 0,
                
                // If record exists, use it. If not, defaults.
                isMealClaimed: adj ? adj.isMealClaimed : false,
                isMedicalClaimed: adj ? adj.isMedicalClaimed : false,
                isAdvanceTaken: adj ? adj.isAdvanceTaken : false,
                bonusAmount: adj ? adj.bonusAmount : 0,
                bonusRemark: adj ? adj.bonusRemark : "",
            };
        });

        res.status(200).json(result);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Bulk Save adjustments
 * @route   POST /api/workforce/payroll/adjustments
 */
const saveMonthlyAdjustments = async (req, res) => {
    try {
        const { date, records } = req.body;
        const targetMonth = getFirstOfMonth(date);

        const operations = records.map(rec => ({
            updateOne: {
                filter: { employee: rec.employeeId, month: targetMonth },
                update: {
                    $set: {
                        isMealClaimed: rec.isMealClaimed,
                        isMedicalClaimed: rec.isMedicalClaimed,
                        isAdvanceTaken: rec.isAdvanceTaken,
                        bonusAmount: Number(rec.bonusAmount) || 0,
                        bonusRemark: rec.bonusRemark || ""
                    }
                },
                upsert: true
            }
        }));

        await PayrollAdjustment.bulkWrite(operations);
        res.status(200).json({ message: "Adjustments saved successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getMonthlyAdjustments, saveMonthlyAdjustments };