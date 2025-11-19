const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const attendanceSchema = new Schema(
    {
        // Link to the 'Employee' collection
        employee: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        // We store times as simple strings for easy input (e.g., "09:00")
        startTime: {
            type: String,
            default: "",
        },
        endTime: {
            type: String,
            default: "",
        },
        // Stored as a number (e.g., 8.5 for 8 and a half hours)
        totalHours: {
            type: Number,
            default: 0,
        },
        hourlyRate: { 
            type: Number, 
            default: 0 
        },
        dailyPay: { 
            type: Number, 
            default: 0 
        },
    },
    {
        timestamps: true,
    }
);

// To prevent an employee from having duplicate records for the same day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);