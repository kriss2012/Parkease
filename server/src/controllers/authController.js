const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const sendEmail = require('../utils/sendEmail');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');

const issueTokens = async (user) => {
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save();
  return { accessToken, refreshToken };
};

// @desc Register a new user or mall owner
// @route POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(409);
    throw new Error('An account with this email already exists');
  }

  // Only 'user' and 'owner' can self-register. Admin/guard are created by an admin.
  const allowedSelfRoles = ['user', 'owner'];
  const finalRole = allowedSelfRoles.includes(role) ? role : 'user';

  const user = await User.create({ name, email, password, phone, role: finalRole });

  if (finalRole === 'owner') {
    await AuditLog.create({ action: 'OWNER_REGISTRATION_SUBMITTED', targetType: 'User', targetId: user._id });
    await sendEmail({
      to: user.email,
      subject: 'ParkEase - Owner Registration Received',
      html: `<p>Hi ${user.name}, your mall owner account is pending admin approval. We'll notify you once it's reviewed.</p>`,
    });
  }

  const tokens = await issueTokens(user);
  res.status(201).json({
    success: true,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, approvalStatus: user.approvalStatus },
    ...tokens,
  });
});

// @desc Login
// @route POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  if (user.isSuspended || !user.isActive) {
    res.status(403);
    throw new Error('This account has been suspended. Contact support.');
  }
  if (user.role === 'owner' && user.approvalStatus !== 'approved') {
    res.status(403);
    throw new Error(`Owner account is ${user.approvalStatus}. You cannot log in yet.`);
  }

  const tokens = await issueTokens(user);
  res.json({
    success: true,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    ...tokens,
  });
});

// @desc Refresh access token using a valid refresh token
// @route POST /api/auth/refresh
const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400);
    throw new Error('Refresh token is required');
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    res.status(401);
    throw new Error('Refresh token invalid or expired');
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== refreshToken) {
    res.status(401);
    throw new Error('Refresh token invalid or expired');
  }

  const accessToken = generateAccessToken(user._id, user.role);
  res.json({ success: true, accessToken });
});

// @desc Logout - invalidate the stored refresh token
// @route POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  req.user.refreshToken = undefined;
  await req.user.save();
  res.json({ success: true, message: 'Logged out' });
});

// @desc Forgot password - emails a reset link with a one-time token
// @route POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  // Respond the same way regardless, to avoid leaking which emails are registered
  if (!user) {
    return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 min
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: 'ParkEase - Password Reset',
    html: `<p>Reset your password using this link (valid 30 minutes): <a href="${resetUrl}">${resetUrl}</a></p>`,
  });

  res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
});

// @desc Reset password using the token emailed to the user
// @route POST /api/auth/reset-password/:token
const resetPassword = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Reset token is invalid or has expired');
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ success: true, message: 'Password reset successful. Please log in.' });
});

// @desc Get logged-in user's profile
// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = { register, login, refresh, logout, forgotPassword, resetPassword, getMe };
