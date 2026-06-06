const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');

const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const token = authorization.split(' ')[1];

  try {
    const { _id } = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = await AdminUser.findOne({ _id }).select('_id role restaurantId');
    if (!req.user) {
      throw new Error('User not found');
    }
    next();
  } catch (error) {
    res.status(401).json({ error: 'Request is not authorized' });
  }
};

const requireSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'super_admin') {
    next();
  } else {
    res.status(403).json({ error: 'Super Admin access required' });
  }
};

module.exports = { requireAuth, requireSuperAdmin };
