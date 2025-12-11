const mongoose = require("mongoose");

const jobRoleSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true, trim: true }, 
        
        // --- Shift Configuration ---
        // Defaults to standard day shift if not provided
        startTime: { type: String, default: "08:00" }, // e.g. "06:00" for Drivers
        endTime: { type: String, default: "17:00" },   // e.g. "18:00" for Drivers
        
        // --- OT Configuration ---
        allowOvertime: { type: Boolean, default: true }, 
        allowDoubleOT: { type: Boolean, default: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model("JobRole", jobRoleSchema);