const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifies the JWT and attaches the user to req.user
const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'User no longer exists' });
      }
      return next();
    } catch (err) {
      return res.status(401).json({ message: 'Not authorized, token invalid' });
    }
  }

  return res.status(401).json({ message: 'Not authorized, no token' });
};

// Restricts a route to specific roles, e.g. authorize('admin') or authorize('doctor','admin')
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res
      .status(403)
      .json({ message: `Role '${req.user ? req.user.role : 'unknown'}' is not permitted to access this resource` });
  }
  next();
};

module.exports = { protect, authorize };
