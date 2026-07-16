const nodemailer = require('nodemailer');

// Lazily create the transporter so missing SMTP env vars don't crash the app on boot
let transporter;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    await getTransporter().sendMail({
      from: process.env.EMAIL_FROM || 'ParkEase <no-reply@parkease.com>',
      to,
      subject,
      html,
    });
  } catch (err) {
    // Email failures should never break the request lifecycle - just log it
    console.error('Email send failed:', err.message);
  }
};

module.exports = sendEmail;
