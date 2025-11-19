const express = require('express');
const router = express.Router();
const { 
    getAllEmployees,
    getEmployeesById,
    patchEmployeeContent,
    createEmployee,
    deleteEmployee,
} = require('../controllers/workforce/employee.controller');

const { protect } = require('../middleware/auth.middleware');

router.get("/", protect, getAllEmployees);
router.get("/:id", protect, getEmployeesById);
router.patch("/:id", protect, patchEmployeeContent);
router.post("/", protect, createEmployee);
router.delete("/:id", protect, deleteEmployee);

module.exports = router;