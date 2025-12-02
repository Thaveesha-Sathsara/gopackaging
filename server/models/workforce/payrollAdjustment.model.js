const mongoose = require("mongoose");

const payrollAdjustmentSchema = new mongoose.Schema(
    {
        employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
        
        // We store the "Month" as the 1st day of that month (e.g., 2023-11-01)
        month: { type: Date, required: true },

        // Checkboxes (True/False)
        isMealClaimed: { type: Boolean, default: false },
        isMedicalClaimed: { type: Boolean, default: false },
        isAdvanceTaken: { type: Boolean, default: false },
        isEtfApplied: { type: Boolean, default: false },

        // Variable Data
        bonusAmount: { type: Number, default: 0 },
        bonusRemark: { type: String, default: "" },
    },
    { timestamps: true }
);

// Ensure one record per employee per month
payrollAdjustmentSchema.index({ employee: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("PayrollAdjustment", payrollAdjustmentSchema);