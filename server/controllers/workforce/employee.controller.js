const Employees = require("../../models/workforce/employee.model");

const getAllEmployees = async (req, res) => {
    try {
        const employees = await Employees.find().sort({ createdAt: -1 });

        if (employees.length === 0) {
            return res.status(200).json([]);
        }
        res.status(200).json(employees);
    } catch (error) {
        console.error("Error fetching employees:", error);
        res.status(500).json({ message: error.message });
    }
};

const getEmployeesById = async (req, res) => {
    try {
        const { id } = req.params;

        const employeesById = await Employees.findById(id);
        if (!employeesById) {
            return res.status(404).json({ message: "Employee not found" });
        }
        res.status(200).json(employeesById);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const patchEmployeeContent = async (req, res) => {
    try {
        const { id } = req.params;
        
        const updateData = req.body;

        const employeeToUpdate = await Employees.findByIdAndUpdate(id, updateData, {
            new: true,
        });

        if (!employeeToUpdate) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.status(200).json(employeeToUpdate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createEmployee = async (req, res) => {
    try {
        const {
            employeeID,
            employeeName,
            dob,
            nic,
            contactNumber,
            address,
            position,
            salary,
            joiningDate,
            isActived = true,
            remarks,
            // 👇 NEW FIELDS MUST BE ADDED HERE
            allowanceMeal,
            allowanceMedical,
            allowanceAttendance,
            rateOT,
            rateDoubleOT,
            etfRate,
            avatar // Don't forget the image!
        } = req.body;

        const newEmployee = new Employees({
            employeeID,
            employeeName,
            dob,
            nic,
            contactNumber,
            address,
            position,
            salary,
            joiningDate,
            isActived,
            remarks,
            // 👇 AND MAPPED HERE
            allowanceMeal,
            allowanceMedical,
            allowanceAttendance,
            rateOT,
            rateDoubleOT,
            etfRate,
            avatar
        });

        await newEmployee.save();
        
        res.status(201).json(newEmployee); 

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteEmployee = async (req, res) => {
    try {
        const employeeToDelete = await Employees.findByIdAndDelete(req.params.id);
        if (!employeeToDelete)
            return res.status(404).json({ message: "Employee not found" });
        res.status(200).json({ message: "Employee deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllEmployees,
    getEmployeesById,
    patchEmployeeContent,
    createEmployee,
    deleteEmployee,
};