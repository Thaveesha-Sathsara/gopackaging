const nodemailer = require("nodemailer");
require("dotenv").config();

// Create the transporter (The Postman)
const transporter = nodemailer.createTransport({
    service: "gmail", 
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
    },
});

// Helper to send mail
const sendEmail = async (to, subject, htmlContent) => {
    try {
        const mailOptions = {
            from: `"LCS Factory System" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: htmlContent,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("📧 Email sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("❌ Error sending email:", error);
        return false;
    }
};

module.exports = sendEmail;