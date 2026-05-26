const Employees = require("../../models/workforce/employee.model");
const JobRole = require("../../models/workforce/jobRole.model"); // Import JobRole

const getAllEmployees = async (req, res, next) => {
    try {
        // Populate role so we can see the name in the frontend list
        const employees = await Employees.find()
            .populate("role", "name") 
            .sort({ createdAt: -1 });

        if (employees.length === 0) {
            return res.status(200).json([]);
        }
        res.status(200).json(employees);
    } catch (error) {
        console.error("Error fetching employees:", error);
        next(error);
    }
};

const getEmployeesById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const employeesById = await Employees.findById(id).populate("role");
        if (!employeesById) {
            return res.status(404).json({ message: "Employee not found" });
        }
        res.status(200).json(employeesById);
    } catch (error) {
        next(error);
    }
};

const patchEmployeeContent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // If role is being updated, sync the position name
        if (updateData.role) {
            const roleDoc = await JobRole.findById(updateData.role);
            if (roleDoc) {
                updateData.position = roleDoc.name;
            }
        }

        const employeeToUpdate = await Employees.findByIdAndUpdate(id, updateData, {
            new: true,
        });

        if (!employeeToUpdate) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.status(200).json(employeeToUpdate);
    } catch (error) {
        next(error);
    }
};

const createEmployee = async (req, res, next) => {
    try {
        const {
            employeeID,
            employeeName,
            dob,
            nic,
            contactNumber,
            address,
            
            // ✅ Fix: We now receive 'role' (The ID)
            role, 
            
            salary,
            joiningDate,
            isActived = true,
            remarks,
            allowanceMeal,
            allowanceMedical,
            allowanceAttendance,
            fixedAdvanceAmount,
            rateOT,
            rateDoubleOT,
            etfRate,
            avatar 
        } = req.body;

        // 1. Validate Role
        if (!role) {
            return res.status(400).json({ message: "Job Role is required" });
        }

        const jobRoleDoc = await JobRole.findById(role);
        if (!jobRoleDoc) {
            return res.status(400).json({ message: "Invalid Job Role ID" });
        }

        // 2. Create Employee
        const newEmployee = new Employees({
            employeeID,
            employeeName,
            dob,
            nic,
            contactNumber,
            address,
            
            // ✅ Save the Relation
            role: jobRoleDoc._id,
            // ✅ Auto-fill position string for legacy support/display
            position: jobRoleDoc.name, 

            salary,
            joiningDate,
            isActived,
            remarks,
            allowanceMeal,
            allowanceMedical,
            allowanceAttendance,
            fixedAdvanceAmount,
            rateOT,
            rateDoubleOT,
            etfRate,
            avatar
        });

        await newEmployee.save();
        
        res.status(201).json(newEmployee); 

    } catch (error) {
        console.error("Create Employee Error:", error);
        next(error);
    }
};

const deleteEmployee = async (req, res, next) => {
    try {
        const employeeToDelete = await Employees.findByIdAndDelete(req.params.id);
        if (!employeeToDelete)
            return res.status(404).json({ message: "Employee not found" });
        res.status(200).json({ message: "Employee deleted successfully" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllEmployees,
    getEmployeesById,
    patchEmployeeContent,
    createEmployee,
    deleteEmployee,
};