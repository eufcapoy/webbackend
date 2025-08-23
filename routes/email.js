import express from "express";
import SibApiV3Sdk from "sib-api-v3-sdk";

const router = express.Router();

router.post("/send-otp", async (req, res) => {
  const { email, otp } = req.body;

  let defaultClient = SibApiV3Sdk.ApiClient.instance;
  let apiKey = defaultClient.authentications["api-key"];
  apiKey.apiKey = process.env.BREVO_API_KEY; // ✅ from .env

  const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();
  const sendSmtpEmail = {
    to: [{ email }],
    subject: "Your OTP Code",
    htmlContent: `<p>Your OTP is: <b>${otp}</b></p>`,
    sender: { email: "you@example.com", name: "DermaScan" },
  };

  try {
    await tranEmailApi.sendTransacEmail(sendSmtpEmail);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
