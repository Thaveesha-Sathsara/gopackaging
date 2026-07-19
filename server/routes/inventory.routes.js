const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { hotProxy } = require('../utils/asphalt-proxy');

const path = 'inventory/inventory.controller';

// Raw Materials
router.get('/raw-materials', protect, hotProxy(path, 'getRawMaterials'));
router.post('/raw-materials', protect, hotProxy(path, 'createRawMaterial'));
router.patch('/raw-materials/:id/adjust', protect, hotProxy(path, 'adjustRawMaterialStock'));
router.patch('/raw-materials/:id', protect, hotProxy(path, 'updateRawMaterial'));
router.delete('/raw-materials/:id', protect, hotProxy(path, 'deleteRawMaterial'));

// Finished Goods
router.get('/finished-goods', protect, hotProxy(path, 'getFinishedGoods'));
router.post('/finished-goods', protect, hotProxy(path, 'createFinishedGood'));
router.patch('/finished-goods/:id/adjust', protect, hotProxy(path, 'adjustFinishedGoodStock'));
router.patch('/finished-goods/:id', protect, hotProxy(path, 'updateFinishedGood'));
router.delete('/finished-goods/:id', protect, hotProxy(path, 'deleteFinishedGood'));

router.get('/history/:id', protect, hotProxy(path, 'getItemHistory'));

module.exports = router;