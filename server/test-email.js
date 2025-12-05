require('dotenv').config(); // Make sure you have dotenv installed
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: process.env.SMTP_USER, // YOUR LOGIN EMAIL (e.g., student@gmail.com)
    pass: process.env.SMTP_PASS, // YOUR API KEY (xsmtpsib-...)
  },
});

async function verify() {
  try {
    await transporter.verify();
    console.log('✅ Server is ready to take our messages');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verify();