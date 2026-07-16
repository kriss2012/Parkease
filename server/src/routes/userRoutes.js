const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { updateProfile, toggleFavoriteMall, getFavoriteMalls } = require('../controllers/userController');

router.use(protect);
router.put('/profile', updateProfile);
router.get('/favorites', getFavoriteMalls);
router.post('/favorites/:mallId', toggleFavoriteMall);

module.exports = router;
