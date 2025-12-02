const PayrollAdjustment = require("../../models/workforce/payrollAdjustment.model");
const Employee = require("../../models/workforce/employee.model");

// ✅ Helper: Get Start and End of a specific day in UTC
// This ensures we find the record regardless of slight time shifts (e.g. 5:30 vs 00:00)
const getDateRange = (dateString) => {
    // Input: "2023-11" or "2023-11-01"
    const date = new Date(dateString); 
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-indexed

    const startOfDay = new Date(Date.UTC(year, month, 1, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month, 1, 23, 59, 59));
    
    return { start: startOfDay, end: endOfDay };
};

// ✅ Helper: Get Start/End for the PREVIOUS month
const getPrevDateRange = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth(); 

    // Subtract 1 from month (JS handles year rollover automatically)
    const startOfDay = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month - 1, 1, 23, 59, 59));

    return { start: startOfDay, end: endOfDay };
};

const getMonthlyAdjustments = async (req, res) => {
    try {
        const { date } = req.query; // "2023-12-01"
        if (!date) return res.status(400).json({ message: "Date required" });

        // 1. Calculate Ranges
        const currentRange = getDateRange(date);
        const prevRange = getPrevDateRange(date);

        console.log("--- DEBUG ETF LOGIC ---");
        console.log("Looking for Current Month between:", currentRange.start.toISOString(), "and", currentRange.end.toISOString());
        console.log("Looking for Previous Month between:", prevRange.start.toISOString(), "and", prevRange.end.toISOString());

        // 2. Fetch Employees
        const employees = await Employee.find({ isActived: true })
            .select("employeeID employeeName allowanceMeal allowanceMedical fixedAdvanceAmount etfRate");

        // 3. Fetch Adjustments using Range Query ($gte and $lte)
        // This fixes the issue if DB has 5:30 and we search for 00:00
        const currentAdjustments = await PayrollAdjustment.find({ 
            month: { $gte: currentRange.start, $lte: currentRange.end } 
        });

        const prevAdjustments = await PayrollAdjustment.find({ 
            month: { $gte: prevRange.start, $lte: prevRange.end } 
        });

        console.log(`Found ${currentAdjustments.length} records for Current Month.`);
        console.log(`Found ${prevAdjustments.length} records for Previous Month.`);

        // 4. Map Data
        const currentAdjMap = {};
        currentAdjustments.forEach(adj => { currentAdjMap[adj.employee.toString()] = adj; });

        const prevAdjMap = {};
        prevAdjustments.forEach(adj => { prevAdjMap[adj.employee.toString()] = adj; });

        const result = employees.map(emp => {
            const currentAdj = currentAdjMap[emp._id.toString()];
            const prevAdj = prevAdjMap[emp._id.toString()];

            let etfStatus = false;

            if (currentAdj) {
                // Case A: Record exists for this month. Use it.
                // NOTE: If you previously saved "False", this will stay "False".
                etfStatus = currentAdj.isEtfApplied;
            } else if (prevAdj) {
                // Case B: New month. Check previous month.
                etfStatus = prevAdj.isEtfApplied;
                if (etfStatus) console.log(`> Carrying over ETF: TRUE for ${emp.employeeName}`);
            }

            return {
                employeeId: emp._id,
                employeeID: emp.employeeID,
                employeeName: emp.employeeName,
                allowanceMeal: emp.allowanceMeal || 0,
                allowanceMedical: emp.allowanceMedical || 0,
                fixedAdvanceAmount: emp.fixedAdvanceAmount || 0,
                etfRate: emp.etfRate || 0,
                
                isMealClaimed: currentAdj ? currentAdj.isMealClaimed : false,
                isMedicalClaimed: currentAdj ? currentAdj.isMedicalClaimed : false,
                isAdvanceTaken: currentAdj ? currentAdj.isAdvanceTaken : false,
                
                // ✅ Result
                isEtfApplied: etfStatus, 

                bonusAmount: currentAdj ? currentAdj.bonusAmount : 0,
                bonusRemark: currentAdj ? currentAdj.bonusRemark : "",
            };
        });

        res.status(200).json(result);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const saveMonthlyAdjustments = async (req, res) => {
    try {
        const { date, records } = req.body;
        
        // Always save as UTC Midnight to keep DB clean
        const saveDate = new Date(date);
        const targetMonth = new Date(Date.UTC(saveDate.getFullYear(), saveDate.getMonth(), 1, 0, 0, 0));

        const operations = records.map(rec => ({
            updateOne: {
                filter: { employee: rec.employeeId, month: targetMonth },
                update: {
                    $set: {
                        isMealClaimed: rec.isMealClaimed,
                        isMedicalClaimed: rec.isMedicalClaimed,
                        isAdvanceTaken: rec.isAdvanceTaken,
                        isEtfApplied: rec.isEtfApplied,
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