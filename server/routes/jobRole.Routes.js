const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const { hotProxy } = require('../utils/asphalt-proxy');
const path = 'workforce/jobRole.controller';

router.get("/", protect, hotProxy(path, 'getJobRoles'));
router.post("/", protect, hotProxy(path, 'createJobRole'));
router.delete("/:id", protect, hotProxy(path, 'deleteJobRole'));

module.exports = router;    