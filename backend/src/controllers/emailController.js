const pool = require('../config/database');
const { sendEmail } = require('../services/emailService');

const sendAdminEmail = async (req, res) => {
  try {
    const { userId, subject, message } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: 'User is required.',
      });
    }

    if (!subject || !subject.trim()) {
      return res.status(400).json({
        error: 'Email subject is required.',
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: 'Email message is required.',
      });
    }

    const result = await pool.query(
      `
      SELECT id, email, first_name, last_name
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found.',
      });
    }

    const user = result.rows[0];

    await sendEmail({
      to: user.email,
      subject: subject.trim(),
      text: message.trim(),
    });

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully.',
      recipient: user.email,
    });
  } catch (error) {
    console.error('SEND ADMIN EMAIL ERROR:', error);

    return res.status(500).json({
      error: 'Failed to send email.',
      message: error.message,
    });
  }
};

module.exports = {
  sendAdminEmail,
};
