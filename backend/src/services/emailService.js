const nodemailer = require('nodemailer');

console.log('SMTP CONFIG:', {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE,
  user: process.env.SMTP_USER,
  from: process.env.SMTP_FROM,
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
  console.log('STARTING SMTP VERIFICATION...');

  transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP CONNECTION ERROR:', error);
  } else {
    console.log('SMTP CONNECTION SUCCESS:', success);
  }
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
