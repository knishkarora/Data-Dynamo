const nodemailer = require('nodemailer');
const logger = require('../config/logger');

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: process.env.BREVO_SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

const sendConfirmationEmail = async (email, reportDetails) => {
  console.log(`[EmailService] Attempting to send SMTP email to: ${email}`);
  
  const ticketId = reportDetails._id.toString().slice(-6).toUpperCase();
  const severityColor = reportDetails.severity === 'high' ? '#ef4444' : '#f59e0b';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');
          body { font-family: 'Inter', sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background-color: #121212; border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #2dd4bf 0%, #3b82f6 100%); padding: 40px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; color: #000000; letter-spacing: -0.02em; }
          .content { padding: 40px; }
          .status-pill { display: inline-block; padding: 6px 12px; background: rgba(45, 212, 191, 0.1); border: 1px solid rgba(45, 212, 191, 0.2); color: #2dd4bf; border-radius: 100px; font-size: 12px; font-weight: 600; margin-bottom: 24px; }
          h2 { font-size: 20px; margin-top: 0; color: #ffffff; }
          p { color: #a1a1aa; line-height: 1.6; font-size: 14px; }
          .report-details { background: rgba(255,255,255,0.03); border-radius: 16px; padding: 24px; margin: 32px 0; border: 1px solid rgba(255,255,255,0.05); }
          .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
          .detail-row:last-child { border-bottom: none; }
          .label { color: #71717a; font-size: 12px; text-transform: uppercase; tracking: 0.1em; }
          .value { color: #e4e4e7; font-size: 14px; font-weight: 500; }
          .footer { padding: 32px; border-top: 1px solid rgba(255,255,255,0.05); text-align: center; background: rgba(0,0,0,0.2); }
          .footer p { font-size: 11px; color: #52525b; margin: 0; }
          .btn { display: inline-block; background: #2dd4bf; color: #000000; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 20px; transition: transform 0.2s; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CLIMX</h1>
          </div>
          <div class="content">
            <div class="status-pill">REPORT SECURED</div>
            <h2>Submission Confirmed</h2>
            <p>Hello,</p>
            <p>We've successfully received your civic report. Our AI-powered oversight system is currently analyzing the data to route it to the appropriate authorities.</p>
            
            <div class="report-details">
              <div class="detail-row">
                <span class="label">Ticket ID</span>
                <span class="value">#${ticketId}</span>
              </div>
              <div class="detail-row">
                <span class="label">Category</span>
                <span class="value">${reportDetails.category.replace('_', ' ').toUpperCase()}</span>
              </div>
              <div class="detail-row">
                <span class="label">Severity</span>
                <span class="value" style="color: ${severityColor}">${reportDetails.severity.toUpperCase()}</span>
              </div>
              <div class="detail-row">
                <span class="label">Timestamp</span>
                <span class="value">${new Date().toLocaleString()}</span>
              </div>
            </div>

            <p>Your contribution helps build a more accountable and sustainable India. You can track the progress of this ticket through your dashboard.</p>
            
            <a href="https://climx.app/profile" class="btn">View My Reports</a>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Climx · Environmental Accountability Platform</p>
            <p>Ludhiana, India</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.BREVO_SENDER_NAME}" <${process.env.BREVO_SENDER_EMAIL}>`,
      to: email,
      subject: `[Ticket #${ticketId}] Report Received — Climx`,
      html: htmlContent,
    });

    console.log(`[EmailService] Email sent successfully: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('[EmailService] SMTP Error:', error);
    logger.error(`SMTP Email Error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  sendConfirmationEmail
};
