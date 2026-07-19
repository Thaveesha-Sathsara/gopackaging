const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');

const dynamicController = (methodName) => {
    return (req, res, next) => {
        // 1. Get the exact hard drive path to the controller
        const controllerPath = require.resolve('../controllers/workforce/employee.controller');
        
        // 2. MURDER THE GHOST CACHE! Force Node to read the newly healed file.
        delete require.cache[controllerPath]; 
        
        // 3. Load the fresh, patched controller
        const controller = require(controllerPath);
        return controller[methodName](req, res, next);
    };
};

router.get("/", protect, dynamicController('getAllEmployees'));
router.get("/:id", protect, dynamicController('getEmployeesById'));
router.patch("/:id", protect, dynamicController('patchEmployeeContent'));
router.post("/", protect, dynamicController('createEmployee'));
router.delete("/:id", protect, dynamicController('deleteEmployee'));

module.exports = router;