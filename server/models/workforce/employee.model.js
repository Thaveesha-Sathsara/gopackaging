const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
    {
        //identity
        employeeID: { type: String },
        employeeName: { type: String },
        nic: { type: String },
        dob: { type: Date, default: null },
        avatar: { type: String, default: null },

        //contact and work
        contactNumber: { type: String },
        address: { type: String },
        position: { type: String },
        joiningDate: { type: Date, default: null },
        isActived: { type: Boolean, default: true },

        //compensation and benefits
        salary: { type: Number, default: 0 },
        allowanceMeal: { type: Number, default: 0 },
        allowanceMedical: { type: Number, default: 0 },
        allowanceAttendance: { type: Number, default: 0 },
        rateOT: { type: Number, default: 0 },
        rateDoubleOT: { type: Number, default: 0 },
        etfRate: { type: Number, default: 3 },
        
        remarks: { type: String },
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Employee", employeeSchema);