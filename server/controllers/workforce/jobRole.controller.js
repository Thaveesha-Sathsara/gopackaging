const JobRole = require("../../models/workforce/jobRole.model");

const getJobRoles = async (req, res, next) => {
    try {
        const roles = await JobRole.find().sort({ name: 1 });
        res.status(200).json(roles);
    } catch (error) {
        next(error);
    }
};

const createJobRole = async (req, res, next) => {
    try {
        const { name, startTime, endTime, allowOvertime, allowDoubleOT } = req.body;
        
        // Validation
        if (!name) return res.status(400).json({ message: "Role Name is required" });

        const existing = await JobRole.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existing) {
            return res.status(400).json({ message: "Role already exists" });
        }

        const newRole = new JobRole({ 
            name, 
            startTime: startTime || "08:00", 
            endTime: endTime || "17:00", 
            allowOvertime: allowOvertime !== undefined ? allowOvertime : true,
            allowDoubleOT: allowDoubleOT !== undefined ? allowDoubleOT : true
        });
        
        await newRole.save();
        res.status(201).json(newRole);
    } catch (error) {
        next(error);
    }
};

const deleteJobRole = async (req, res, next) => {
    try {
        await JobRole.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Role deleted" });
    } catch (error) {
        next(error);
    }
};

module.exports = { getJobRoles, createJobRole, deleteJobRole };