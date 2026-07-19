const PayrollAdjustment = require("../../models/workforce/payrollAdjustment.model");
const Employee = require("../../models/workforce/employee.model");

// ✅ Helper: Get Start and End of a specific day in UTC
const getDateRange = (dateString) => {
    const date = new Date(dateString); 
    const year = date.getFullYear();
    const month = date.getMonth(); 

    const startOfDay = new Date(Date.UTC(year, month, 1, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month, 1, 23, 59, 59));
    
    return { start: startOfDay, end: endOfDay };
};

const getMonthlyAdjustments = async (req, res, next) => {
    try {
        const { date } = req.query; 
        if (!date) return res.status(400).json({ message: "Date required" });

        // 1. Calculate Range for CURRENT month only
        const currentRange = getDateRange(date);

        // 2. Fetch Active Employees
        const employees = await Employee.find({ isActived: true })
            .select("employeeID employeeName allowanceMeal allowanceMedical fixedAdvanceAmount etfRate");

        // 3. Fetch Adjustments for THIS month (to see if user already saved something)
        const currentAdjustments = await PayrollAdjustment.find({ 
            month: { $gte: currentRange.start, $lte: currentRange.end } 
        });

        // 4. ✅ NEW LOGIC: Find employees who EVER had ETF enabled before this month
        // We look for any record where date is LESS than current month AND etf is true
        const employeesWithHistoryOfEtf = await PayrollAdjustment.distinct("employee", {
            month: { $lt: currentRange.start }, // Strictly before current month
            isEtfApplied: true
        });

        // Convert ObjectId array to string array for easy comparison
        const historicalEtfSet = new Set(employeesWithHistoryOfEtf.map(id => id.toString()));

        // 5. Map Data
        const currentAdjMap = {};
        currentAdjustments.forEach(adj => { currentAdjMap[adj.employee.toString()] = adj; });

        const result = employees.map(emp => {
            const empIdStr = emp._id.toString();
            const currentAdj = currentAdjMap[empIdStr];
            
            // ✅ DETERMINE ETF STATUS
            let etfStatus = false;

            if (currentAdj) {
                // Case A: User has explicitly saved this month. Trust the saved value.
                // (This allows you to manually turn it off if absolutely needed, though rare)
                etfStatus = currentAdj.isEtfApplied;
            } else {
                // Case B: No record for this month yet. 
                // Check if they are in the "Historical Set" (Have they ever had ETF?)
                if (historicalEtfSet.has(empIdStr)) {
                    etfStatus = true;
                }
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
                
                // ✅ Final Logic Applied Here
                isEtfApplied: etfStatus, 

                bonusAmount: currentAdj ? currentAdj.bonusAmount : 0,
                bonusRemark: currentAdj ? currentAdj.bonusRemark : "",
            };
        });

        res.status(200).json(result);

    } catch (error) {
        console.error(error);
        next(error)
    }
};

const saveMonthlyAdjustments = async (req, res, next) => {
    // ... (Your existing save logic remains exactly the same) ...
    try {
        const { date, records } = req.body;
        
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
        next(error)
    }
};

module.exports = { getMonthlyAdjustments, saveMonthlyAdjustments };