const express = require("express");
const router = express.Router();
const { getHolidays, createHoliday, deleteHoliday } = require("../controllers/workforce/holiday.controller");

router.get("/", getHolidays);
router.post("/", createHoliday);
router.delete("/:id", deleteHoliday);

module.exports = router;