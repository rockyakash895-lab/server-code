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
<div style="background:#000; padding:20px; text-align:center; font-family:Arial;">

  <!-- 🔥 FULL IMAGE -->
  <img src="https://i.supaimg.com/c48fc7db-43fb-43f8-b6da-ffe4295b161b/b4aef1cb-8441-4b72-bfb1-893ac7cb2f61.jpg"
       style="width:100%; max-width:420px; border-radius:12px; box-shadow:0 0 20px rgba(255,0,0,0.4);" />

  <!-- TEXT -->
  <h2 style="color:#38bdf8; margin-top:20px;">VERIFICATION REQUIRED</h2>

  <p style="color:#cbd5f5; font-size:14px;">
    A secure login request was detected.<br>
    Use the code below to continue.
  </p>

  <!-- OTP BOX -->
  <div style="
    font-size:36px;
    letter-spacing:10px;
    font-weight:bold;
    background:#020617;
    padding:18px;
    border-radius:12px;
    display:inline-block;
    margin:20px 0;
    color:#22c55e;
    border:1px solid #22c55e;
    box-shadow:0 0 20px rgba(34,197,94,0.5);
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
    🔐 Secure Authentication Enabled
  </div>

  <p style="margin-top:20px; font-size:12px; color:#64748b;">
    Thanks,<br>
    <b style="color:#38bdf8;">Fire Pro Team 🔥</b>
  </p>

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