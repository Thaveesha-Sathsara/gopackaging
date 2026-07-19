const express = require("express");
const router = express.Router();
const { hotProxy } = require('../utils/asphalt-proxy');

const path = 'workforce/holiday.controller';

router.get("/", hotProxy(path, 'getHolidays'));
router.post("/", hotProxy(path, 'createHoliday'));
router.delete("/:id", hotProxy(path, 'deleteHoliday'));

module.exports = router;