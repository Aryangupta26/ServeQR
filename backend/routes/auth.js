const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const AdminUser = require('../models/AdminUser');
const Restaurant = require('../models/Restaurant');

router.post('/register', async (req, res) => {
  try {
    const { name, slug, email, password } = req.body;

    const existingRestaurant = await Restaurant.findOne({ slug });
    if (existingRestaurant) return res.status(400).json({ error: 'Slug already taken' });

    const restaurant = new Restaurant({ name, slug });
    await restaurant.save();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = new AdminUser({
      email,
      password: hashedPassword,
      role: 'restaurant_admin',
      restaurantId: restaurant._id
    });
    await admin.save();

    const token = jwt.sign({ _id: admin._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });
    
    res.status(201).json({ token, role: admin.role, restaurantId: admin.restaurantId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await AdminUser.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });
    
    res.json({ token, role: user.role, restaurantId: user.restaurantId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
