const axios = require('axios');

const RESEND_API_URL = 'https://api.resend.com/emails';
const FROM_EMAIL =
  process.env.EMAIL_FROM || 'support@globaldigitalmarket.online';

const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  if (!to || !subject || (!html && !text)) {
    throw new Error(
      'Email requires to, subject, and html or text content'
    );
  }

  const response = await axios.post(
    RESEND_API_URL,
    {
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    }
  );

  return response.data;
};

module.exports = {
  sendEmail,
};
