const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { 
    authUser, 
    logoutUser, 
    getUserProfile, 
    sendOTP, 
    updateProfile 
} = require('../controllers/login.controller');

// Public Routes
router.post('/login', authUser);
router.post('/logout', logoutUser);

// Protected Routes (Need Login)
router.get('/profile', protect, getUserProfile);
router.post('/send-otp', protect, sendOTP);
router.put('/profile', protect, updateProfile);

module.exports = router;