const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({
  to,
  subject,
  text,
  html,
}) => {
  if (!to) {
    throw new Error('Recipient email address is required.');
  }

  if (!subject) {
    throw new Error('Email subject is required.');
  }

  if (!text && !html) {
    throw new Error('Email message is required.');
  }

  const mailOptions = {
    from:
      process.env.SMTP_FROM ||
      process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendEmail,
};
