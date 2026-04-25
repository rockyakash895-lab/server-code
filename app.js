const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ cPanel SMTP (custom domain email)
const transporter = nodemailer.createTransport({
  host: "mail.rmenipro.online",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// OTP store
let otpStore = {};

// SEND OTP
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send({ success: false, error: "Email required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);

  otpStore[email] = {
    otp: otp,
    expire: Date.now() + 10 * 60 * 1000
  };

  try {
    await transporter.sendMail({
  from: `"FIRE PRO" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "🔐 Verification Code",
  html: `
<div style="background:#020617; padding:30px; font-family:Arial, sans-serif; text-align:center;">

  <div style="
    max-width:420px;
    margin:auto;
    background:linear-gradient(145deg,#020617,#0f172a);
    border-radius:16px;
    padding:25px;
    box-shadow:0 0 40px rgba(56,189,248,0.2);
    border:1px solid rgba(56,189,248,0.2);
  ">

    <img src="https://i.supaimg.com/c48fc7db-43fb-43f8-b6da-ffe4295b161b/59c96fa4-74d9-4e0a-a8b1-541dbf4c3cfb.png"
         style="width:100%; max-width:320px; border-radius:12px; margin-bottom:20px;" />

    <h2 style="
      color:#38bdf8;
      margin:10px 0;
      text-shadow:0 0 10px rgba(56,189,248,0.6);
    ">
      🔐 Verification Required
    </h2>

    <p style="color:#cbd5f5; font-size:14px;">
      A secure login request was detected.<br>
      Use the code below to continue.
    </p>

    <div style="
      font-size:36px;
      letter-spacing:10px;
      font-weight:bold;
      margin:25px 0;
      padding:20px;
      border-radius:14px;
      background:linear-gradient(135deg,#020617,#020617);
      color:#22c55e;
      box-shadow:
        0 0 20px rgba(34,197,94,0.5),
        inset 0 0 10px rgba(34,197,94,0.2);
      border:1px solid rgba(34,197,94,0.4);
    ">
      ${otp}
    </div>

    <p style="font-size:13px; color:#94a3b8;">
      ⏳ This code expires in 10 minutes
    </p>

    <div style="
      margin-top:20px;
      padding:12px;
      background:rgba(56,189,248,0.1);
      border-radius:10px;
      color:#38bdf8;
      font-size:13px;
    ">
      ⚡ Secure Authentication Enabled
    </div>

    <hr style="border:0.5px solid #334155; margin:25px 0;">

    <p style="font-size:12px; color:#64748b;">
      Thanks,<br>
      <b style="color:#38bdf8;">Fire Pro Team 🔥</b>
    </p>

  </div>

</div>
`
});

    res.send({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, error: "Email send failed" });
  }
});

// VERIFY OTP
app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const data = otpStore[email];

  if (data && data.otp == otp && Date.now() < data.expire) {
    delete otpStore[email]; // ✅ remove after use
    res.send({ success: true });
  } else {
    res.send({ success: false });
  }
});

// START SERVER
app.listen(process.env.PORT || 3000, () => {
  console.log("Server running...");
});