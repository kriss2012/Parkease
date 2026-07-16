const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Mall = require('../models/Mall');

// @desc Update own profile
// @route PUT /api/users/profile
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;
  const user = await User.findById(req.user._id);
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (avatar) user.avatar = avatar;
  await user.save();
  res.json({ success: true, user });
});

// @desc Add/remove a mall from favorites
// @route POST /api/users/favorites/:mallId
const toggleFavoriteMall = asyncHandler(async (req, res) => {
  const mall = await Mall.findById(req.params.mallId);
  if (!mall) {
    res.status(404);
    throw new Error('Mall not found');
  }
  const user = await User.findById(req.user._id);
  const idx = user.favoriteMalls.findIndex((m) => m.toString() === mall._id.toString());
  if (idx > -1) {
    user.favoriteMalls.splice(idx, 1);
  } else {
    user.favoriteMalls.push(mall._id);
  }
  await user.save();
  res.json({ success: true, favoriteMalls: user.favoriteMalls });
});

// @desc Get current user's favorite malls
// @route GET /api/users/favorites
const getFavoriteMalls = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('favoriteMalls');
  res.json({ success: true, malls: user.favoriteMalls });
});

module.exports = { updateProfile, toggleFavoriteMall, getFavoriteMalls };
