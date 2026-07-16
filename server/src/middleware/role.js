// Usage: authorize('admin', 'owner')
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    return next(new Error(`Role '${req.user ? req.user.role : 'guest'}' is not permitted to access this resource`));
  }
  next();
};

module.exports = { authorize };
