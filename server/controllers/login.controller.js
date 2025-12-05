const User = require('../models/user.model');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const sendEmail = require('../config/email.config'); 

// Helper: Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// Helper: Professional Email HTML Template
const getOtpEmailTemplate = (otp) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; }
            .container { max-width: 500px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden; border: 1px solid #e4e4e7; }
            .header { background-color: #2563eb; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px; }
            .content { padding: 40px 30px; text-align: center; color: #3f3f46; }
            .title { font-size: 18px; font-weight: 600; margin-bottom: 10px; color: #18181b; }
            .description { font-size: 15px; line-height: 1.5; color: #52525b; margin-bottom: 25px; }
            .otp-wrapper { margin: 30px 0; }
            .otp-code { background-color: #eff6ff; color: #2563eb; font-size: 36px; font-weight: 800; letter-spacing: 8px; padding: 20px 10px; border-radius: 8px; border: 2px dashed #bfdbfe; display: block; width: 100%; box-sizing: border-box; font-family: 'Courier New', monospace; }
            .expiry { font-size: 13px; color: #71717a; margin-top: 15px; }
            .warning-box { background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 12px; margin-top: 30px; }
            .warning-text { color: #991b1b; font-size: 13px; margin: 0; }
            .footer { background-color: #fafafa; padding: 20px; text-align: center; font-size: 12px; color: #a1a1aa; border-top: 1px solid #f4f4f5; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>LCS Enterprises</h1>
            </div>
            <div class="content">
                <div class="title">Security Verification</div>
                <div class="description">
                    We received a request to update your admin credentials. Use the code below to complete this action.
                </div>
                
                <div class="otp-wrapper">
                    <div class="otp-code">${otp}</div>
                </div>
                
                <div class="expiry">This code expires in <strong>3 minutes</strong>.</div>

                <div class="warning-box">
                    <p class="warning-text">⚠️ If you did not request this code, please ignore this email and check your account security settings.</p>
                </div>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} LCS Enterprises. All rights reserved.</p>
                <p>Automated System Message • Do Not Reply</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
const authUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
        const token = generateToken(user._id);

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

    // Send Email using the new template
    const htmlMessage = getOtpEmailTemplate(otp);
    const targetEmail = process.env.ADMIN_EMAIL; 
    
    // Note: Ensure your sendEmail function supports an HTML parameter, 
    // or pass this as the 'text' param if it auto-detects HTML.
    // Assuming sendEmail(to, subject, htmlContent)
    await sendEmail(targetEmail, "Action Required: Your Verification Code", htmlMessage);

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
    if (newPassword) user.password = newPassword; 

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