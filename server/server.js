const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const employeeRoutes = require('./routes/employee.routes');
const payrollRoutes = require('./routes/payroll.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const cookieParser = require('cookie-parser');
const attendanceRoutes = require('./routes/attendance.routes');
const holidayRoutes = require('./routes/holiday.routes');
const payrollAdjustmentRoutes = require('./routes/payrollAdjustment.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const employeeReportRoutes = require('./routes/employeeReport.rotes');
const inventoryReportRoutes = require('./routes/inventoryReport.routes');
const emailRoutes = require('./routes/email.routes');
const reportsRoutes = require('./routes/reports.routes');
const runDailyReport = require('./utils/dailyReports');
const jobRoleRoutes = require('./routes/jobRole.Routes');
const { applyHotPatch } = require('./utils/hotPatcher');
const path = require('path');
const fs = require('fs');
const { validateAST } = require('./utils/symbolicValidator');
const { extractBrokenFunction } = require('./utils/astChunker');
const { getRepairPatch } = require('./utils/api_bridge');
const { testPatch } = require('./utils/referee');


dotenv.config();

connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// CRON Jobs
runDailyReport();
console.log("Daily Report Job Scheduler started.");

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/workforce/employee', employeeRoutes);
app.use('/api/workforce/attendance', attendanceRoutes);
app.use('/api/workforce/payroll', payrollRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/workforce/holidays', holidayRoutes);
app.use('/api/workforce/payroll/adjustments', payrollAdjustmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports/employees', employeeReportRoutes);
app.use('/api/reports/inventory', inventoryReportRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/workforce/job-roles', jobRoleRoutes);

// app.use((err, req, res, next) => {
//     const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
//     res.status(statusCode);
//     res.json({
//         message: err.message,
//         stack: process.env.NODE_ENV === 'production' ? null : err.stack,
//     });
// });

app.use(async (err, req, res, next) => {

    // The exception filter
    // Do not trigger the AI for standard expected errors like missing logins
    if (err.message.includes('Not authorized') || err.message.includes('jwt')) {
        console.log(`[ROUTER] Standard Auth Error ignored by AI. Returning 401.`);
        return res.status(401).json({ message: "Not authorized, please log in." });
    }

    console.log(`\n[CRASH DETECTED] Route failed: ${err.message}`);

    // The dynamic stack trace parser
    let targetFile = null;
    const stackLines = err.stack.split('\n');

    // Scan the stack trace to find the exact file that crashed
    for (let line of stackLines) {
        if (line.includes(__dirname) && !line.includes('node_modules')) {
            const match = line.match(/\((.*):\d+:\d+\)/) || line.match(/at (.*):\d+:\d+/);
            if (match && match[1]) {
                targetFile = match[1];
                break;
            }
        }
    }

    if (!targetFile || !fs.existsSync(targetFile)) {
        console.log(`[ROUTER] Could not isolate local file. Routing to standard 500 error.`);
        return res.status(500).json({ error: "Internal Server Error" });
    }

    console.log(`[TARGET ACQUIRED] Dynamic fault isolated at: ${targetFile}`);
    const brokenCode = fs.readFileSync(targetFile, 'utf8');

    let attempts = 0;
    const maxAttempts = 3;
    let isHealed = false;
    
    // Start with the original Node error
    let aiPromptMessage = `Original Error: ${err.message}`;

    while (attempts < maxAttempts && !isHealed) {
        attempts++;
        console.log(`\n[AUTONOMOUS LOOP] Attempt ${attempts} of ${maxAttempts}...`);

        try {
            // extract broken DNA
            const specificBrokenFunction = extractBrokenFunction(brokenCode, err.stack);

            console.log(`[AI DIAGNOSTICS] Transmitting to GROQ LPU...`);
            const contract = "Ensure the function handles the request without throwing an error. CRITICAL BUSINESS LOGIC: If 'req.body' or 'req.body.filter' is undefined, the database query MUST fall back to returning ALL records (e.g. Model.find()). Do not search for undefined values.";

            // RAG context injector
            console.log(`[CONTEXT] Scanning file for database models...`);
            let schemaContext = "";
            const modelImports = brokenCode.match(/require\(['"]([^'"]+model)['"]\)/g);

            if (modelImports) {
                modelImports.forEach(importString => {
                    // extract the path from the require string
                    const relativePath = importString.match(/require\(['"]([^'"]+)['"]\)/)[1];

                    let absolutePath = path.resolve(path.dirname(targetFile), relativePath);
                    if (!absolutePath.endsWith('.js')) absolutePath += '.js';

                    // read the file and add it to the AI's context
                    if (fs.existsSync(absolutePath)) {
                        schemaContext += `\n// Schema File: ${path.basename(absolutePath)}\n`;
                        schemaContext += fs.readFileSync(absolutePath, 'utf8') + "\n";
                    }
                });
                console.log(`[CONTEXT] Injected database schema(s) into AI.`);
            }

            const patchedCode = await getRepairPatch(specificBrokenFunction, aiPromptMessage, contract);
            console.log(`[AI RESPONSE RECEIVED] Evaluating logic...`);

            console.log(`\n[X-RAY] AI Output:`, patchedCode);

            // const isApproved = await testPatch(patchedCode, req, res);

            const bouncerResult = await testPatch(patchedCode, req, res);
            
            if (bouncerResult.approved) {
                console.log(`[BOUNCER] Sandbox survival confirmed. Commencing Hot-Patch...`);
                
                const fullHealedFile = brokenCode.replace(specificBrokenFunction, patchedCode);
                const updateModule = applyHotPatch(targetFile, fullHealedFile);

                if (updateModule) {
                    try {
                        console.log(`[HEALING COMPLETE] Re-running paused HTTP request...`);

                        const functionNameMatch = specificBrokenFunction.match(/(?:const|let|var|async function|function)\s+([a-zA-Z0-9_]+)/);
                        if (functionNameMatch && updateModule[functionNameMatch[1]]) {
                            await updateModule[functionNameMatch[1]](req, res, next);
                        } else {
                            console.log("[!] Dynamic router fallback. Sending 200 OK.");
                            res.status(200).json({ message: "Server dynamically healed, please refresh." });
                        }
                    
                        isHealed = true;
                    } catch (retryErr) {
                        console.error("\n[SECONDARY CRASH IN RE-RUN]:", retryErr.message);
                        aiPromptMessage = `Your fix failed during actual execution: ${retryErr.message}, Fix it.`;
                    }
                }
            } else {
                console.log(`[BOUNCER REJECTION] AI code failed the VM Sandbox test. Retrying...`);
                aiPromptMessage = `Original Error: ${err.message}
                                Your last attempt tried to fix this, but it crashed the Sandbox validation with this NEW error: "${bouncerResult.reason}". 
                                You must fix the Original Error AND ensure your new logic does not trigger the Sandbox error.`;
            }
        } catch (error) {
            console.error(`[CRITICAL ENGINE FAILURE]`, error.message);
            break;
        }

    }

    // If the loop finished all 3 attempts and didn't heal the system
    if (!isHealed) {
        console.log(`\n[FATAL] Autonomous Agent exhausted all ${maxAttempts} attempts. System self-healing failed.`);
        if (!res.headersSent) {
            res.status(500).json({ error: "Self-healing AI failed to resolve the crash within attempt limits." });
        }
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server is running on port ${PORT}`));
