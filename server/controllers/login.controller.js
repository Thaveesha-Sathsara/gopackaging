const User = require('../models/user.model');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const sendEmail = require('../config/email.config'); // Ensure this path is correct

// Helper: Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
const authUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
        const token = generateToken(user._id);

        // Set Secure Cookie
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        res.json({
            _id: user._id,
            username: user.username,
        });
    } else {
        res.status(401);
        throw new Error('Invalid username or password');
    }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/auth/profile
const getUserProfile = asyncHandler(async (req, res) => {
    if (req.user) {
        res.json({
            _id: req.user._id,
            username: req.user.username,
            // Don't send password or OTP info back
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Send OTP to Admin Email
// @route   POST /api/auth/send-otp
const sendOTP = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save to DB (Expires in 3 mins)
    user.otp = otp;
    user.otpExpires = Date.now() + 3 * 60 * 1000; 
    await user.save();

    // Send Email
    const message = `Your OTP for account verification is: <b style="font-size: 24px;">${otp}</b>. It expires in 3 minutes.`;
    
    // Ensure ADMIN_EMAIL is set in .env
    const targetEmail = process.env.ADMIN_EMAIL; 
    await sendEmail(targetEmail, "Security Verification - LCS System", message);

    res.json({ message: "OTP Sent to Admin Email" });
});

// @desc    Verify OTP & Update Profile
// @route   PUT /api/auth/profile
const updateProfile = asyncHandler(async (req, res) => {
    const { otp, newUsername, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Verify OTP logic
    if (!user.otp || user.otp !== otp || user.otpExpires < Date.now()) {
        res.status(400);
        throw new Error('Invalid or Expired OTP');
    }

    // Update Fields if provided
    if (newUsername) user.username = newUsername;
    if (newPassword) user.password = newPassword; // Pre-save hook handles hashing

    // Clear OTP immediately after use
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.json({
        _id: user._id,
        username: user.username,
        message: "Credentials Updated Successfully"
    });
});

module.exports = { 
    authUser, 
    logoutUser, 
    getUserProfile, 
    sendOTP, 
    updateProfile 
};