const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  logoUrl: { type: String },
  themeColor: { type: String, default: '#000000' },
  subscriptionStatus: { type: String, enum: ['active', 'inactive', 'trial'], default: 'trial' },
  settings: {
    paymentMethod: { type: String, enum: ['none', 'otp', 'razorpay', 'upi'], default: 'otp' },
    upiId: { type: String }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
