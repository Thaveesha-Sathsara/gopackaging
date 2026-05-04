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
    console.log(`\n[CRASH DETECTED] Route failed: ${err.message}`);
    
    const targetFile = path.join(__dirname, 'controllers', 'inventory', 'inventory.controller.js');

    // Read the current, broken file from the hard drive to send to the AI
    const brokenCode = fs.readFileSync(targetFile, 'utf8');

    console.log(`Transmitting crash report to Python engine`);

    try {
        // The AI request hit local fastAPI server
        const response = await fetch('http://127.0.0.1:8000/diagnose-and-patch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: err.message,
                code: brokenCode,
            })
        });

        if (!response.ok) {
            throw new Error(`Python API responded with status: ${response.status}`);
        }

        const aiData = await response.json();
        const realAiGeneratedFix = aiData.fixed_code;

        console.log(`Fix generated in ${aiData.time_taken} seconds`);

        // Apply the hot patch with the AI's live code
        const updateModule = applyHotPatch(targetFile, realAiGeneratedFix);

        if (updateModule) {
            console.log(`Re-running request with patched memory`);

            try {
                // Force express to re-run the user's request
                await updateModule.getRawMaterials(req, res, next);
            } catch (retryErr) {
                console.error("\nEven after patching, the request failed:", retryErr.message);
                res.status(500).json({ error: "Retry failed after hot-patch" });
            }
        } else {
            res.status(500).json({ error: "System crash. Self-healing failed" });
        }

    } catch (apiError) {
        console.error(`\n Is the python server running?`, apiError.message);
        res.status(500).json({ error: "Self-healing AI unreachable" });
    }    

});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server is running on port ${PORT}`));
