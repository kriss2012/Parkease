const { validationResult } = require('express-validator');

// Runs after express-validator chains; returns 422 with the first errors if any
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  next();
};

module.exports = validate;
