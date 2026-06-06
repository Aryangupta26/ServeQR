const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Restaurant = require('../models/Restaurant');
const AdminUser = require('../models/AdminUser');
const { requireAuth, requireSuperAdmin } = require('../middleware/auth');

router.use(requireAuth);
router.use(requireSuperAdmin);

// Onboard new restaurant
router.post('/restaurants', async (req, res) => {
  try {
    const { name, slug, email, password } = req.body;

    // Create restaurant
    const restaurant = new Restaurant({ name, slug });
    await restaurant.save();

    // Create restaurant admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = new AdminUser({
      email,
      password: hashedPassword,
      role: 'restaurant_admin',
      restaurantId: restaurant._id
    });
    await admin.save();

    res.status(201).json({ message: 'Restaurant onboarded successfully', restaurant, adminId: admin._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List all restaurants
router.get('/restaurants', async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
