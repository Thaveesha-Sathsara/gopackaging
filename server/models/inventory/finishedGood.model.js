const mongoose = require("mongoose");

const finishedGoodSchema = new mongoose.Schema(
    {
        productID: { type: String, required: true, unique: true }, // e.g., FG-2001
        name: { type: String, required: true }, // e.g., "Garbage Bag - Large"
        unit: { type: String, required: true }, // e.g., "bundles", "packs"
        currentStock: { type: Number, default: 0 },
        batchNumber: { type: String }, // Useful for tracking specific production runs
        description: { type: String },
    },
    { timestamps: true }
);

module.exports = mongoose.model("FinishedGood", finishedGoodSchema);