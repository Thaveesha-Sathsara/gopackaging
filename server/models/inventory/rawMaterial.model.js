const mongoose = require("mongoose");

const rawMaterialSchema = new mongoose.Schema(
    {
        materialID: { type: String, required: true, unique: true }, // Auto-generated (e.g., RM-1001)
        name: { type: String, required: true },
        category: { type: String, default: "General" }, // e.g., "Ink", "Polythene", "Chemical"
        unit: { type: String, required: true }, // e.g., "kg", "liters", "units"
        currentStock: { type: Number, default: 0 },
        minimumLevel: { type: Number, default: 10 }, // Value add: Alert if stock drops below this
        description: { type: String },
    },
    { timestamps: true }
);

module.exports = mongoose.model("RawMaterial", rawMaterialSchema);