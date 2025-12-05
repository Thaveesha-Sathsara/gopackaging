const nodemailer = require('nodemailer');

const sendEmailSecurity = async (to, subject, htmlContent) => {
    try {
        // 1. Create the Transporter (Brevo Connection)
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // 2. Define Email Options
        const mailOptions = {
            from: `"LCS Enterprises - Security" <${process.env.FROM_EMAIL_SECURITY}>`, // Shows as "LCS Security"
            to: to, // Dynamic recipient (can be Admin or User)
            subject: subject,
            html: htmlContent, // We use HTML for your beautiful template
        };

        // 3. Send Email
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.messageId}`);
        return info;

    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Email could not be sent");
    }
};

const sendEmailAlerts = async (to, subject, htmlContent) => {
    try {
        // 1. Create the Transporter (Brevo Connection)
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // 2. Define Email Options
        const mailOptions = {
            from: `"LCS Enterprises - Alerts" <${process.env.FROM_EMAIL_ALERTS}>`, // Shows as "LCS Security"
            to: to, // Dynamic recipient (can be Admin or User)
            subject: subject,
            html: htmlContent, // We use HTML for your beautiful template
        };

        // 3. Send Email
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.messageId}`);
        return info;

    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Email could not be sent");
    }
};

module.exports = { sendEmailSecurity, sendEmailAlerts };