const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  tableNumber: { type: String, required: true },
  qrCodeUrl: { type: String }
});

module.exports = mongoose.model('Table', tableSchema);
