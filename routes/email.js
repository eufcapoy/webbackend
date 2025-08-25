import express from "express";
import SibApiV3Sdk from "sib-api-v3-sdk";

const router = express.Router();

// Function to get Brevo client (lazy initialization)
const getBrevoClient = () => {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY environment variable not found");
  }

  let defaultClient = SibApiV3Sdk.ApiClient.instance;
  let apiKey = defaultClient.authentications["api-key"];
  apiKey.apiKey = process.env.BREVO_API_KEY;

  return new SibApiV3Sdk.TransactionalEmailsApi();
};

// ---------------- OTP ----------------
router.post("/send-otp", async (req, res) => {
  try {
    // Get Brevo client (will throw error if env var not set)
    const tranEmailApi = getBrevoClient();

    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: "Email and OTP are required",
      });
    }

    const sendSmtpEmail = {
      to: [{ email }],
      subject: "Your OTP Code",
      htmlContent: `<p>Your OTP is: <b>${otp}</b></p>`,
      sender: {
        email: "eufemiocapoy.anhs@gmail.com",
        name: "DermaScan",
      },
    };

    await tranEmailApi.sendTransacEmail(sendSmtpEmail);
    console.log(`OTP sent successfully to: ${email}`);
    res.json({ success: true });
  } catch (err) {
    console.error("Error sending OTP:", err);
    if (err.message === "BREVO_API_KEY environment variable not found") {
      return res.status(500).json({
        success: false,
        error: "Email service not configured. Check environment variables.",
      });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------- Approval / Rejection ----------------
router.post("/send-approval", async (req, res) => {
  try {
    // Get Brevo client (will throw error if env var not set)
    const tranEmailApi = getBrevoClient();

    const { email, firstName, isApproved } = req.body;

    if (!email || !firstName || typeof isApproved !== "boolean") {
      return res.status(400).json({
        success: false,
        error: "Email, firstName, and isApproved are required",
      });
    }

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
      sender: {
        email: "eufemiocapoy.anhs@gmail.com",
        name: "DermaScan",
      },
    };

    await tranEmailApi.sendTransacEmail(sendSmtpEmail);
    console.log(
      `${
        isApproved ? "Approval" : "Rejection"
      } email sent successfully to: ${email}`
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error sending approval email:", err);
    if (err.message === "BREVO_API_KEY environment variable not found") {
      return res.status(500).json({
        success: false,
        error: "Email service not configured. Check environment variables.",
      });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});
router.post("/send-password-reset-otp", async (req, res) => {
  try {
    const tranEmailApi = getBrevoClient();
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: "Email and OTP are required",
      });
    }

    const sendSmtpEmail = {
      to: [{ email }],
      subject: "Password Reset - DermaScan",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2962FF;">DermaScan</h1>
          </div>
          
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You have requested to reset your password for your DermaScan dermatologist account.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="margin-bottom: 10px; font-weight: bold;">Your verification code is:</p>
            <h1 style="color: #2962FF; font-size: 2.5em; letter-spacing: 0.2em; margin: 10px 0;">${otp}</h1>
            <p style="color: #666; font-size: 0.9em;">This code will expire in 10 minutes</p>
          </div>
          
          <p><strong>Important:</strong> If you did not request this password reset, please ignore this email. Your account remains secure.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 0.9em; text-align: center;">
            This is an automated message from DermaScan. Please do not reply to this email.
          </p>
        </div>
      `,
      sender: {
        email: "eufemiocapoy.anhs@gmail.com",
        name: "DermaScan - Password Reset",
      },
    };

    await tranEmailApi.sendTransacEmail(sendSmtpEmail);
    console.log(`Password reset OTP sent successfully to: ${email}`);
    res.json({ success: true });
  } catch (err) {
    console.error("Error sending password reset OTP:", err);
    if (err.message === "BREVO_API_KEY environment variable not found") {
      return res.status(500).json({
        success: false,
        error: "Email service not configured. Check environment variables.",
      });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});
export default router;
