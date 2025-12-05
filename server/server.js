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

dotenv.config();

connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

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

app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server is running on port ${PORT}`));
