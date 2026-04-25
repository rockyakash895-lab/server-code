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
      from: `"MENIR OTP" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. Valid for 10 minutes. Do not share this code.`
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