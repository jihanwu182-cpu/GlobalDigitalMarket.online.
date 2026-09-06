const axios = require('axios');

const RESEND_API_URL = 'https://api.resend.com/emails';

const FROM_EMAIL =
  process.env.EMAIL_FROM ||
  'Global Digital Market <support@globaldigitalmarket.online>';

const sendEmail = async ({
  to,
  subject,
  html,
  text,
}) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      'RESEND_API_KEY is not configured'
    );
  }

  if (
    !to ||
    !subject ||
    (!html && !text)
  ) {
    throw new Error(
      'Email requires to, subject, and html or text content'
    );
  }

  const recipients =
    Array.isArray(to)
      ? to
      : [to];

  try {
    const response =
      await axios.post(
        RESEND_API_URL,
        {
          from: FROM_EMAIL,
          to: recipients,
          subject,
          html: html || undefined,
          text: text || undefined,
        },
        {
          headers: {
            Authorization:
              `Bearer ${process.env.RESEND_API_KEY}`,

            'Content-Type':
              'application/json',
          },

          timeout: 15000,
        }
      );

    console.log(
      'Email sent successfully:',
      response.data
    );

    return response.data;

  } catch (error) {
    console.error(
      'Resend email error:',
      error?.response?.data ||
        error?.message ||
        error
    );

    throw error;
  }
};

module.exports = {
  sendEmail,
};
