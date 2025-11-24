const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const attendanceSchema = new Schema(
    {
        employee: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        startTime: {
            type: String,
            default: "",
        },
        endTime: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: ["Present", "Leave", "Absent"],
            default: "Present",
        },
        
        // --- HOURS BREAKDOWN ---
        normalHours: { type: Number, default: 0 }, // Hours up to 5:00 PM
        otHours: { type: Number, default: 0 },     // Hours after 5:00 PM (if left after 5:30)
        doubleOtHours: { type: Number, default: 0 }, // Future proofing
        totalHours: { type: Number, default: 0 },  // normal + ot + double

        // --- RATES ---
        hourlyRate: { type: Number, default: 0 },
        otRate: { type: Number, default: 0 },      // 1.5x or custom
        doubleOtRate: { type: Number, default: 0 },

        // --- PAY BREAKDOWN ---
        normalPay: { type: Number, default: 0 },
        otPay: { type: Number, default: 0 },
        doubleOtPay: { type: Number, default: 0 },
        dailyPay: { type: Number, default: 0 },    // Sum of all pays
    },
    {
        timestamps: true,
    }
);

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);