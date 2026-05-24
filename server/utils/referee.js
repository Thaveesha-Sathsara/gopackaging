const vm = require('vm');
const holidayModel = require('../models/workforce/holiday.model');

async function testPatch(patchedFunction, originalReq, originalRes) {
    console.log("[BOUNCER] Booting VM Sandbox...");

    try {
        // inject the live context
        const sandbox = {
            req: originalReq,
            res: {
                status: function (code) { this.statusCode = code; return this; },
                json: function (data) { this.data = data; return this; },
                statusCode: null,
                data: null
            },
            next: (err) => { throw err; }, // sandbox dies if error is passed

            // inject the live database models
            Employee: require('../models/workforce/employee.model'),
            Attendance: require('../models/workforce/attendance.model'),
            InventoryTransaction: require('../models/inventory/inventoryTransaction.model'),
            RawMaterial: require('../models/inventory/rawMaterial.model'),
            holidayModel: require('../models/workforce/holiday.model'),
            console: { log: () => { } }
        };

        vm.createContext(sandbox);

        // dynamically extract the name of the function the AI wrote
        const match = patchedFunction.match(/(?:const|let|var|async function|function)\s+([a-zA-Z0-9_]+)/);
        const funcName = match ? match[1] : null;

        if (!funcName) {
            throw new Error("Could not extract function name for Sandbox execution. The AI likely returned an anonymous function.");
        }

        // inject the named function, then call it by its name
        const script = new vm.Script(`
            ${patchedFunction}
            ${funcName}(req, res, next); 
        `);
        
        await script.runInContext(sandbox);

        // evaluate the result
        if (sandbox.res.statusCode === 200) {
            console.log("[BOUNCER] Patch verified against live database.");
            return { approved: true };
        } else {
            console.log(`[BOUNCER] Code ran, but returned status ${sandbox.res.statusCode}. Rejected.`);
            return { approved: false, reason: `HTTP Status Code was ${sandbox.res.statusCode}` };
        }
    
    } catch (error) {
        console.log(`[BOUNCER] AI Patch crashed the Sandbox: ${error.message}`);
        return { approved: false, reason: error.message };
    }
}

module.exports = { testPatch };