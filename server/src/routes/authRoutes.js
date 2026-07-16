const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerRules, loginRules, resetPasswordRules } = require('../validators/authValidators');
const {
  register, login, refresh, logout, forgotPassword, resetPassword, getMe,
} = require('../controllers/authController');

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/refresh', refresh);
router.post('/logout', protect, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPasswordRules, validate, resetPassword);
router.get('/me', protect, getMe);

module.exports = router;
