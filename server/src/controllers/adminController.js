const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const User = require('../models/User');
const Mall = require('../models/Mall');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');
const APIFeatures = require('../utils/apiFeatures');

const logAction = (actor, action, targetType, targetId, details = {}) =>
  AuditLog.create({ actor: actor._id, actorRole: actor.role, action, targetType, targetId, details });

// @desc High-level admin dashboard counts
// @route GET /api/admin/dashboard
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalMalls, activeBookings, pendingApprovals, revenueAgg] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Mall.countDocuments({ status: 'approved' }),
    Booking.countDocuments({ status: { $in: ['confirmed', 'entered'] } }),
    Mall.countDocuments({ status: 'pending' }),
    Payment.aggregate([{ $match: { status: 'success' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
  ]);

  res.json({
    success: true,
    totalUsers,
    totalMalls,
    activeBookings,
    pendingApprovals,
    revenue: revenueAgg[0]?.total || 0,
  });
});

// @desc List users/owners with pagination & filtering
// @route GET /api/admin/users
const listUsers = asyncHandler(async (req, res) => {
  const features = new APIFeatures(User.find(), req.query).filter().search(['name', 'email']).sort().paginate();
  const users = await features.query;
  res.json({ success: true, count: users.length, users });
});

// @desc Suspend or reinstate a user/owner account
// @route PUT /api/admin/users/:id/suspend
const toggleSuspendUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.isSuspended = !user.isSuspended;
  await user.save();
  await logAction(req.user, user.isSuspended ? 'USER_SUSPENDED' : 'USER_REINSTATED', 'User', user._id);
  res.json({ success: true, user });
});

// @desc List pending mall registrations
// @route GET /api/admin/malls/pending
const listPendingMalls = asyncHandler(async (req, res) => {
  const malls = await Mall.find({ status: 'pending' }).populate('owner', 'name email').sort('-createdAt');
  res.json({ success: true, malls });
});

// @desc Approve a mall registration
// @route PUT /api/admin/malls/:id/approve
const approveMall = asyncHandler(async (req, res) => {
  const mall = await Mall.findById(req.params.id).populate('owner');
  if (!mall) {
    res.status(404);
    throw new Error('Mall not found');
  }
  mall.status = 'approved';
  await mall.save();

  mall.owner.approvalStatus = 'approved';
  await mall.owner.save();

  await logAction(req.user, 'MALL_APPROVED', 'Mall', mall._id);
  await Notification.create({
    user: mall.owner._id,
    type: 'mall-approved',
    title: 'Mall approved',
    message: `${mall.name} has been approved and is now live on ParkEase.`,
  });
  await sendEmail({
    to: mall.owner.email,
    subject: 'ParkEase - Mall Approved',
    html: `<p>Congratulations! ${mall.name} has been approved and is now visible to users.</p>`,
  });

  res.json({ success: true, mall });
});

// @desc Reject a mall registration
// @route PUT /api/admin/malls/:id/reject
const rejectMall = asyncHandler(async (req, res) => {
  const mall = await Mall.findById(req.params.id).populate('owner');
  if (!mall) {
    res.status(404);
    throw new Error('Mall not found');
  }
  mall.status = 'rejected';
  mall.rejectionReason = req.body.reason || 'Did not meet listing requirements';
  await mall.save();

  await logAction(req.user, 'MALL_REJECTED', 'Mall', mall._id, { reason: mall.rejectionReason });
  await Notification.create({
    user: mall.owner._id,
    type: 'mall-rejected',
    title: 'Mall registration rejected',
    message: `${mall.name} was rejected: ${mall.rejectionReason}`,
  });
  await sendEmail({
    to: mall.owner.email,
    subject: 'ParkEase - Mall Registration Rejected',
    html: `<p>Unfortunately ${mall.name} was rejected. Reason: ${mall.rejectionReason}</p>`,
  });

  res.json({ success: true, mall });
});

// @desc Platform-wide analytics for charts
// @route GET /api/admin/analytics
const getAnalytics = asyncHandler(async (req, res) => {
  const [monthlyRevenue, bookingsByStatus, popularMalls, peakHours, avgDuration] = await Promise.all([
    Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, total: { $sum: '$amount' } } },
      { $sort: { _id: 1 } },
    ]),
    Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Booking.aggregate([
      { $group: { _id: '$mall', bookings: { $sum: 1 } } },
      { $sort: { bookings: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'malls', localField: '_id', foreignField: '_id', as: 'mall' } },
      { $unwind: '$mall' },
      { $project: { 'mall.name': 1, bookings: 1 } },
    ]),
    Booking.aggregate([
      { $match: { entryTime: { $ne: null } } },
      { $group: { _id: { $hour: '$entryTime' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Booking.aggregate([
      { $match: { entryTime: { $ne: null }, exitTime: { $ne: null } } },
      { $project: { durationHrs: { $divide: [{ $subtract: ['$exitTime', '$entryTime'] }, 1000 * 60 * 60] } } },
      { $group: { _id: null, avg: { $avg: '$durationHrs' } } },
    ]),
  ]);

  res.json({
    success: true,
    monthlyRevenue,
    bookingsByStatus,
    popularMalls,
    peakHours,
    avgParkingDurationHours: avgDuration[0]?.avg || 0,
  });
});

// @desc Audit log list
// @route GET /api/admin/audit-logs
const getAuditLogs = asyncHandler(async (req, res) => {
  const features = new APIFeatures(AuditLog.find().populate('actor', 'name email role'), req.query).filter().sort().paginate();
  const logs = await features.query;
  res.json({ success: true, count: logs.length, logs });
});

module.exports = {
  getDashboardStats,
  listUsers,
  toggleSuspendUser,
  listPendingMalls,
  approveMall,
  rejectMall,
  getAnalytics,
  getAuditLogs,
};
