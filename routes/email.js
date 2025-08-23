import express from "express";
import SibApiV3Sdk from "sib-api-v3-sdk";

const router = express.Router();

// Setup Brevo client once
let defaultClient = SibApiV3Sdk.ApiClient.instance;
let apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY; // use one consistent key name

const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

// ---------------- OTP ----------------
router.post("/send-otp", async (req, res) => {
  const { email, otp } = req.body;

  const sendSmtpEmail = {
    to: [{ email }],
    subject: "Your OTP Code",
    htmlContent: `<p>Your OTP is: <b>${otp}</b></p>`,
    sender: { email: "noreply@dermascan.com", name: "DermaScan" },
  };

  try {
    await tranEmailApi.sendTransacEmail(sendSmtpEmail);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------- Approval / Rejection ----------------
router.post("/send-approval", async (req, res) => {
  const { email, firstName, isApproved } = req.body;

  const subject = isApproved
    ? "Account Approved - DermaScan"
    : "Account Status Update - DermaScan";

  const htmlContent = isApproved
    ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Congratulations, Dr. ${firstName}!</h2>
        <p>Your DermaScan dermatologist account has been <strong>approved</strong> by our administrator.</p>
        <p>You can now fully access all dermatologist features on our platform.</p>
        <p>Thank you for joining DermaScan!</p>
        <br>
        <p>Best regards,<br>The DermaScan Team</p>
      </div>
    `
    : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Account Status Update</h2>
        <p>Dear Dr. ${firstName},</p>
        <p>We regret to inform you that your DermaScan dermatologist account application has been <strong>rejected</strong>.</p>
        <p>If you believe this is an error, please contact our support team.</p>
        <br>
        <p>Best regards,<br>The DermaScan Team</p>
      </div>
    `;

  const sendSmtpEmail = {
    to: [{ email }],
    subject,
    htmlContent,
    sender: { email: "noreply@dermascan.com", name: "DermaScan" },
  };

  try {
    await tranEmailApi.sendTransacEmail(sendSmtpEmail);
    res.json({ success: true });
  } catch (err) {
    console.error("Error sending approval email:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
