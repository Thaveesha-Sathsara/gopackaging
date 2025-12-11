const express = require("express");
const router = express.Router();
const {
    getJobRoles,
    createJobRole,
    deleteJobRole
} = require("../controllers/workforce/jobRole.controller");
const { protect } = require("../middleware/auth.middleware");

router.get("/", protect, getJobRoles);
router.post("/", protect, createJobRole);
router.delete("/:id", protect, deleteJobRole);

module.exports = router;    