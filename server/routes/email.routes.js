const express = require('express');
const router = express.Router();
const { sendTestEmail } = require('../controllers/email.controller');

router.post('/send', sendTestEmail);

module.exports = router;