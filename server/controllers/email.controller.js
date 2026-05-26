const sendEmail = require("../config/email.config"); // Correct path to your config

const sendTestEmail = async (req, res, next) => {
    try {
        const { to, subject, message } = req.body;
        
        const success = await sendEmail(to, subject, `<p>${message}</p>`);
        
        if (success) {
            res.status(200).json({ message: "Email sent successfully" });
        } else {
            res.status(500).json({ message: "Failed to send email" });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = { sendTestEmail };