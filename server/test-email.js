// test-email.js
require("dotenv").config();
const nodemailer = require("nodemailer");

async function main() {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: "Test Email",
      text: "If you see this, Nodemailer is working!",
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();