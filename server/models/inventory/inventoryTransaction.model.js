const mongoose = require("mongoose");

const inventoryTransactionSchema = new mongoose.Schema(
    {
        // Dynamic Link: Can point to 'RawMaterial' OR 'FinishedGood'
        item: { 
            type: mongoose.Schema.Types.ObjectId, 
            required: true, 
            refPath: 'itemModel' 
        },
        itemModel: { 
            type: String, 
            required: true, 
            enum: ['RawMaterial', 'FinishedGood'] 
        },
        
        // Transaction Details
        type: { 
            type: String, 
            required: true, 
            enum: ['in', 'out'] // 'in' = Add/Produce, 'out' = Use/Ship
        },
        reason: { 
            type: String, 
            required: true // e.g., "Purchase", "Production Use", "Shipment", "Adjustment"
        },
        quantity: { type: Number, required: true },
        date: { type: Date, required: true }, // The date the event happened
        user: { type: String }, // Optional: Capture who did it?
    },
    { timestamps: true }
);

module.exports = mongoose.model("InventoryTransaction", inventoryTransactionSchema);