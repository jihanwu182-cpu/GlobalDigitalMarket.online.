const sendEmail = async ({
  to,
  subject,
  text,
  html,
}) => {
  if (!to) {
    throw new Error('Recipient email address is required.');
  }

  if (!subject || !subject.trim()) {
    throw new Error('Email subject is required.');
  }

  if (!text && !html) {
    throw new Error('Email message is required.');
  }

  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured.');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from:
        process.env.EMAIL_FROM ||
        'Global Digital Market <support@globaldigitalmarket.online>',
      to: [to],
      subject: subject.trim(),
      text: text || undefined,
      html: html || undefined,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('RESEND API ERROR:', data);

    throw new Error(
      data?.message ||
      data?.error ||
      'Failed to send email through Resend.'
    );
  }

  console.log('RESEND EMAIL SENT:', data);

  return data;
};

module.exports = {
  sendEmail,
};
