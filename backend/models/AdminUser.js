const mongoose = require('mongoose');

const adminUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'restaurant_admin'], required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }, // Null for super_admin
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdminUser', adminUserSchema);
