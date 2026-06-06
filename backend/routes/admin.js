const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const Order = require('../models/Order');
const { requireAuth } = require('../middleware/auth');
const { requireTenantAccess } = require('../middleware/tenant');

router.use(requireAuth);

// Get my restaurant details
router.get('/restaurant/:restaurantId', requireTenantAccess, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update restaurant settings (e.g. payment method)
router.put('/restaurant/:restaurantId/settings', requireTenantAccess, async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.restaurantId,
      { $set: { settings: req.body.settings } },
      { new: true }
    );
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Menu Management
router.get('/restaurant/:restaurantId/menu', requireTenantAccess, async (req, res) => {
  try {
    const categories = await Category.find({ restaurantId: req.params.restaurantId });
    const menuItems = await MenuItem.find({ restaurantId: req.params.restaurantId });

    const menu = categories.map(cat => ({
      ...cat.toObject(),
      items: menuItems.filter(item => item.categoryId.toString() === cat._id.toString())
    }));

    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/restaurant/:restaurantId/categories', requireTenantAccess, async (req, res) => {
  try {
    const category = new Category({ ...req.body, restaurantId: req.params.restaurantId });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/restaurant/:restaurantId/menu-items', requireTenantAccess, async (req, res) => {
  try {
    const menuItem = new MenuItem({ ...req.body, restaurantId: req.params.restaurantId });
    await menuItem.save();
    res.status(201).json(menuItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Orders
router.get('/restaurant/:restaurantId/orders', requireTenantAccess, async (req, res) => {
  try {
    const orders = await Order.find({ restaurantId: req.params.restaurantId }).populate('tableId');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
