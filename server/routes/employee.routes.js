const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { hotProxy } = require('../utils/asphalt-proxy');


const path = 'workforce/employee.controller';

router.get("/", protect, hotProxy(path, 'getAllEmployees'));
router.get("/:id", protect, hotProxy(path, 'getEmployeesById'));
router.patch("/:id", protect, hotProxy(path, 'patchEmployeeContent'));
router.post("/", protect, hotProxy(path, 'createEmployee'));
router.delete("/:id", protect, hotProxy(path, 'deleteEmployee'));

module.exports = router;