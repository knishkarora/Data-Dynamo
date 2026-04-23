const SibApiV3Sdk = require('sib-api-v3-sdk');
const logger = require('../config/logger');

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sendConfirmationEmail = async (email, reportDetails) => {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    
    sendSmtpEmail.subject = "Report Received - Civic Issue Tracking";
    sendSmtpEmail.htmlContent = `
      <html>
        <body>
          <h1>Issue Reported Successfully</h1>
          <p>Thank you for contributing to a cleaner city.</p>
          <p><strong>Category:</strong> ${reportDetails.category}</p>
          <p><strong>Description:</strong> ${reportDetails.description}</p>
          <p>Our team is looking into it.</p>
        </body>
      </html>
    `;
    sendSmtpEmail.sender = { 
      name: process.env.BREVO_SENDER_NAME || "Climx", 
      email: process.env.BREVO_SENDER_EMAIL 
    };
    sendSmtpEmail.to = [{ email }];

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    logger.info(`Email sent successfully: ${data.messageId}`);
    return data;
  } catch (error) {
    logger.error(`Brevo Email Error: ${error.message}`);
  }
};

module.exports = {
  sendConfirmationEmail
};
