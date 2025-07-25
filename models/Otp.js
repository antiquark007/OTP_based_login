const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  mobile: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true }
});

module.exports = mongoose.model('Otp', otpSchema);
