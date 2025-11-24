const Holiday = require("../../models/workforce/holiday.model");

// Get all holidays (we will fetch all and let frontend filter for now, or you can filter by year)
const getHolidays = async (req, res) => {
    try {
        const holidays = await Holiday.find().sort({ date: 1 });
        res.status(200).json(holidays);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add a new holiday
const createHoliday = async (req, res) => {
    try {
        const { date, name, type } = req.body;
        
        // Simple validation
        if (!date || !name) {
            return res.status(400).json({ message: "Date and Name are required" });
        }

        // Check if exists
        const existing = await Holiday.findOne({ date: new Date(date) });
        if (existing) {
            return res.status(400).json({ message: "A holiday already exists on this date." });
        }

        const holiday = await Holiday.create({ 
            date: new Date(date), 
            name, 
            type: type || "Mercantile" 
        });

        res.status(201).json(holiday);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a holiday
const deleteHoliday = async (req, res) => {
    try {
        const { id } = req.params;
        await Holiday.findByIdAndDelete(id);
        res.status(200).json({ message: "Holiday removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getHolidays, createHoliday, deleteHoliday };