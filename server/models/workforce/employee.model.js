const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
    {
        employeeID: { type: String },
        employeeName: { type: String },
        dob: { type: Date, default: null },
        nic: { type: String },
        contactNumber: { type: String },
        address: { type: String },
        position: { type: String },
        salary: { type: Number },
        joiningDate: { type: Date, default: null },
        isActived: { type: Boolean, default: true },
        remarks: { type: String },
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Employee", employeeSchema);