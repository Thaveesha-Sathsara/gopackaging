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
        console.log(`[AI DIAGNOSTICS] Transmitting payload to Python Engine...`);

        try {
            const ipcDir = path.join(__dirname, 'ipc_link');
            const crashFilePath = path.join(ipcDir, 'crash.json');
            const fixFilePath = path.join(ipcDir, 'fix.json');

            if (!fs.existsSync(ipcDir)) {
                fs.mkdirSync(ipcDir, { recursive: true });
            }

            const specificBrokenFunction = extractBrokenFunction(brokenCode, err.stack);
            console.log(`\n[ISOLATED CODE BLOCK]:\n${specificBrokenFunction}\n`);

            // Wirte the crash to shared memory
            fs.writeFileSync(crashFilePath, JSON.stringify({
                error: aiPromptMessage,
                file: targetFile,
                code_chunk: brokenCode
            }));

            console.log(`[IPC] Memory flag written. Awaiting Python Daemon...`);

            // The 10-millisecond polling loop
            const aiData = await new Promise((resolve, reject) => {
                let elapsed = 0;
                const timeoutLimit = 15000;

                const interval = setInterval(() => {
                    if (fs.existsSync(fixFilePath)) {
                        clearInterval(interval);
                        const data = JSON.parse(fs.readFileSync(fixFilePath, 'utf8'));
                        fs.unlinkSync(fixFilePath);
                        resolve(data);
                    }

                    elapsed += 10;
                    if (elapsed > timeoutLimit) {
                        clearInterval(interval);
                        reject(new Error("AI Daemon timeout. Generation took too long."));
                    }
                }, 10);
            });

            const rawAiOutput = aiData.fixed_code; 
            console.log(`[IPC] AI Patch received in ${aiData.time_taken} seconds.`);

            // The bouncer intevenes
            const approvedPatch = validateAST(rawAiOutput);

            if (approvedPatch) {
                console.log(`[BOUNCER] Patch approved. Breaking the loop.`);
                
                // Execute the hot-patch
                const updateModule = applyHotPatch(targetFile, approvedPatch);

                if (updateModule) {
                    try {
                        console.log(`[HEALING COMPLETE] Re-running paused HTTP request...`);
                        await updateModule.getRawMaterials(req, res, next);
                        isHealed = true; // If successful, stops the while loop
                    } catch (retryErr) {
                        console.error("\n[SECONDARY CRASH IN RE-RUN]:", retryErr.message);
                        // If hit a new bug after patching. Feed this back to the AI
                        aiPromptMessage = `You fixed the first error, but the new code threw this error: ${retryErr.message}. Fix this new error.`;
                    }
                } else {
                    res.status(500).json({ error: "Hot-patch failed to apply to memory." });
                    break;
                }
            } else {
                 // If the bouncer rejected 
                console.log(`[BOUNCER REJECTION] AI wrote unsafe or invalid code. Forcing retry.`);
                
                 // Update the prompt so the AI knows why it failed
                aiPromptMessage = `Your last attempt failed Abstract Syntax Tree (AST) validation. 
                 You either wrote invalid JavaScript, or tried to import forbidden modules like 'fs'.
                 Do not hallucinate. Try again. Original Error: ${err.message}`;
            }

        } catch (apiError) {
            console.error(`[AI CONNECTION FAILED]`, apiError.message);
            break; // Break the loop if the Python server is dead
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
