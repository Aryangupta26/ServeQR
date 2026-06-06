const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const Order = require('../models/Order');

// Fetch restaurant data for customer ordering
router.get('/restaurant/:slug', async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ slug: req.params.slug });
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    
    const categories = await Category.find({ restaurantId: restaurant._id }).lean();
    const menuItems = await MenuItem.find({ restaurantId: restaurant._id, isAvailable: true }).lean();
    
    // Group menu items by category
    const menu = categories.map(cat => ({
      ...cat,
      items: menuItems.filter(item => item.categoryId.toString() === cat._id.toString())
    }));

    res.json({ restaurant, menu });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Place order
router.post('/restaurant/:slug/order', async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ slug: req.params.slug });
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

    let { tableId, items, totalAmount, customerPhone } = req.body;
    
    // Resolve placeholder table-1 to an actual ObjectId
    if (!tableId || tableId === 'table-1') {
      let table = await Table.findOne({ restaurantId: restaurant._id, tableNumber: '1' });
      if (!table) {
        table = new Table({ restaurantId: restaurant._id, tableNumber: '1' });
        await table.save();
      }
      tableId = table._id;
    }

    const order = new Order({
      restaurantId: restaurant._id,
      tableId,
      items,
      totalAmount,
      customerPhone,
      status: 'pending',
      paymentStatus: restaurant.settings?.paymentMethod === 'none' ? 'paid' : 'pending'
    });
    
    await order.save();
    
    // Emit real-time event to the restaurant's room
    const io = req.app.get('io');
    io.to(restaurant._id.toString()).emit('new_order', order);

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
