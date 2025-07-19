const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const User = require('../models/User');
const Otp = require('../models/Otp');

const {
  FAST2SMS_API_KEY,
  JWT_SECRET,
  JWT_EXPIRY
} = process.env;
//the basic idea is to use Fast2SMS for sending OTPs via SMS, and JWT for user authentication and store the OTPs in a MongoDB database using Mongoose.
//and test the otp genrated and same as the one passed by the user
// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
//more secure for node v>14
//const crypto = require('crypto');
//function generateSecureOTP() {
  //return crypto.randomInt(100000, 1000000).toString();
//}

// Send OTP using Fast2SMS
async function sendOTP(mobile, otp) {
  const payload = {
    variables_values: otp,
    route: 'otp',
    numbers: mobile
  };

  return axios.post(
    'https://www.fast2sms.com/dev/bulkV2',
    new URLSearchParams(payload),
    {
      headers: {
        Authorization: FAST2SMS_API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    }
  );
}

// Rate limit OTP sends
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min window
  max: 5,
  message: 'Too many OTP requests. Try again later.'
});

// POST /send-otp
router.post('/send-otp', otpLimiter, async (req, res) => {
  const { mobile } = req.body;
  if (!mobile) return res.status(400).json({ message: 'Mobile number is required' });

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  try {
    // Prevent spamming resend
    const existing = await Otp.findOne({ mobile });
    if (existing && (Date.now() < new Date(existing.expiresAt) - 60 * 1000)) {//in one min 1 otp
      return res.status(429).json({ message: 'Please wait before requesting OTP again' });
    }

    await sendOTP(mobile, otp);//passing the value to the sendOTP function
    await Otp.findOneAndDelete({ mobile });//delete any existing OTP for the mobile number
    await Otp.create({ mobile, otp, expiresAt });

    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('OTP error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// POST /verify-otp
router.post('/verify-otp', async (req, res) => {
  const { mobile, otp } = req.body;
  if (!mobile || !otp) return res.status(400).json({ message: 'Mobile and OTP required' });

  const record = await Otp.findOne({ mobile });

  if (!record) return res.status(400).json({ message: 'OTP not found or expired' });
  if (record.expiresAt < new Date()) return res.status(400).json({ message: 'OTP expired' });
  if (record.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

  let user = await User.findOne({ mobile });
  if (!user) user = await User.create({ mobile });//create a new user by its mobile number if not present

  await Otp.deleteOne({ mobile });

  const token = jwt.sign({ userId: user._id, mobile: user.mobile }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

  res.json({
    message: 'Signup successful',
    token,
    user: { mobile: user.mobile }
  });
});

module.exports = router;
