const RawMaterial = require("../../models/inventory/rawMaterial.model");
const FinishedGood = require("../../models/inventory/finishedGood.model");
const InventoryTransaction = require("../../models/inventory/inventoryTransaction.model");
const checkAndSendLowStockAlert = require("../../utils/inventoryAlerts.utils"); 

// --- RAW MATERIALS ---

const getRawMaterials = async (req, res) => {
    try {
        const materials = await RawMaterial.find().sort({ createdAt: -1 });
        res.status(200).json(materials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createRawMaterial = async (req, res) => {
    try {
        const { name, category, unit, minimumLevel, description } = req.body;

        const lastItem = await RawMaterial.findOne().sort({ createdAt: -1 });
        
        let nextNum = 1;
        if (lastItem && lastItem.materialID) {
            const lastNum = parseInt(lastItem.materialID.split("-")[1]);
            nextNum = lastNum + 1;
        }

        const materialID = `RM-${String(nextNum).padStart(4, "0")}`;

        const newMaterial = new RawMaterial({
            materialID,
            name,
            category,
            unit,
            currentStock: 0,
            minimumLevel,
            description,
        });

        await newMaterial.save();
        res.status(201).json(newMaterial);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const adjustRawMaterialStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { adjustment, type, date } = req.body;

        const material = await RawMaterial.findById(id);
        if (!material) return res.status(404).json({ message: "Material not found" });

        // ✅ FIX 1: Typo corrected (adjustment)
        const qty = Number(adjustment);
        const transactionDate = date ? new Date(date) : new Date();

        if (type === "add") {
            material.currentStock += qty;

            await InventoryTransaction.create({
                item: id,
                itemModel: 'RawMaterial',
                type: 'in',
                reason: 'Purchase / Add',
                quantity: qty,
                date: transactionDate,
            });

        } else if (type === "use") {
            material.currentStock -= qty;

            await InventoryTransaction.create({
                item: id,
                itemModel: 'RawMaterial',
                type: 'out',
                reason: 'Usage / Use',
                quantity: qty,
                date: transactionDate,
            });
        }

        await material.save();
        await checkAndSendLowStockAlert(material, 'RawMaterial');
        res.status(200).json(material);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateRawMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const { currentStock, materialID, ...updateData } = req.body;

        const updatedMaterial = await RawMaterial.findByIdAndUpdate(id, updateData, { new: true });
        
        if (!updatedMaterial) return res.status(404).json({ message: "Material not found" });
        res.status(200).json(updatedMaterial);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteRawMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedItem = await RawMaterial.findByIdAndDelete(id);
        
        // Optional: Delete associated transactions to keep DB clean? 
        // Or keep them for audit? For now, let's just delete the item.
        if (!deletedItem) return res.status(404).json({ message: "Item not found" });
        
        res.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- FINISHED GOODS ---

const getFinishedGoods = async (req, res) => {
    try {
        const goods = await FinishedGood.find().sort({ createdAt: -1 });
        res.status(200).json(goods);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createFinishedGood = async (req, res) => {
    try {
        const { name, unit, description } = req.body;

        const count = await FinishedGood.countDocuments();
        const productID = `FG-${String(count + 1).padStart(4, "0")}`;

        const newProduct = new FinishedGood({
            productID,
            name,
            unit,
            currentStock: 0,
            description,
        });

        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const adjustFinishedGoodStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { adjustment, type, date } = req.body; 

        const product = await FinishedGood.findById(id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        const qty = Number(adjustment);
        const transactionDate = date ? new Date(date) : new Date();

        if (type === "produce") {
            product.currentStock += qty;

            await InventoryTransaction.create({
                item: id,
                itemModel: 'FinishedGood',
                type: 'in',
                reason: 'Production Run',
                quantity: qty,
                date: transactionDate,
            });
        } else if (type === "ship") {
            product.currentStock -= qty;

            await InventoryTransaction.create({
                item: id,
                itemModel: 'FinishedGood',
                type: 'out',
                reason: 'Shipment',
                quantity: qty,
                date: transactionDate,
            });
        }

        await product.save();
        await checkAndSendLowStockAlert(product, 'FinishedGood');
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateFinishedGood = async (req, res) => {
    try {
        const { id } = req.params;
        const { currentStock, productID, ...updateData } = req.body;

        const updatedProduct = await FinishedGood.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedProduct) return res.status(404).json({ message: "Product not found" });
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteFinishedGood = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedItem = await FinishedGood.findByIdAndDelete(id);
        
        if (!deletedItem) return res.status(404).json({ message: "Item not found" });
        
        res.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getItemHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const history = await InventoryTransaction.find({ item: id }).sort({ date: -1, createdAt: -1 });
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getRawMaterials,
    createRawMaterial,
    adjustRawMaterialStock,
    updateRawMaterial,
    deleteRawMaterial,
    getFinishedGoods,
    createFinishedGood,
    adjustFinishedGoodStock,
    updateFinishedGood,
    deleteFinishedGood,
    getItemHistory,
};