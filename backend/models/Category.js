const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  name: { type: String, required: true },
  sortOrder: { type: Number, default: 0 }
});

module.exports = mongoose.model('Category', categorySchema);
