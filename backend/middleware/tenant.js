// Middleware to ensure a restaurant admin only accesses their own restaurant data
const requireTenantAccess = (req, res, next) => {
  const requestedRestaurantId = req.params.restaurantId || req.body.restaurantId || req.query.restaurantId;
  
  if (!requestedRestaurantId) {
    return res.status(400).json({ error: 'restaurantId is required for this action' });
  }

  // Super admins can access any tenant
  if (req.user.role === 'super_admin') {
    return next();
  }

  // Restaurant admin must match the requested restaurantId
  if (req.user.restaurantId && req.user.restaurantId.toString() === requestedRestaurantId) {
    return next();
  }

  return res.status(403).json({ error: 'Unauthorized access to this tenant' });
};

module.exports = { requireTenantAccess };
