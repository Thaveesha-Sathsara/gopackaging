const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
    getRawMaterials,
    createRawMaterial,
    adjustRawMaterialStock,
    updateRawMaterial,
    getFinishedGoods,
    deleteRawMaterial,
    deleteFinishedGood,
    createFinishedGood,
    adjustFinishedGoodStock,
    updateFinishedGood,
    getItemHistory,
} = require('../controllers/inventory/inventory.controller');

// Raw Materials
router.get('/raw-materials', protect, getRawMaterials);
router.post('/raw-materials', protect, createRawMaterial);
router.patch('/raw-materials/:id/adjust', protect, adjustRawMaterialStock);
router.patch('/raw-materials/:id', protect, updateRawMaterial);
router.delete('/raw-materials/:id', protect, deleteRawMaterial);

// Finished Goods
router.get('/finished-goods', protect, getFinishedGoods);
router.post('/finished-goods', protect, createFinishedGood);
router.patch('/finished-goods/:id/adjust', protect, adjustFinishedGoodStock);
router.patch('/finished-goods/:id', protect, updateFinishedGood);
router.delete('/finished-goods/:id', protect, deleteFinishedGood);

router.get('/history/:id', protect, getItemHistory);

module.exports = router;