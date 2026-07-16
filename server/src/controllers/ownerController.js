const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Mall = require('../models/Mall');
const Booking = require('../models/Booking');
const ParkingSlot = require('../models/ParkingSlot');

// @desc Owner dashboard: today's revenue, occupancy %, slot counts, completed bookings
// @route GET /api/malls/:mallId/dashboard
const getOwnerMallDashboard = asyncHandler(async (req, res) => {
  const mall = await Mall.findById(req.params.mallId);
  if (!mall) {
    res.status(404);
    throw new Error('Mall not found');
  }
  if (mall.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized for this mall');
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [slotCounts, todaysRevenueAgg, completedToday, cancelledToday, peakHour] = await Promise.all([
    ParkingSlot.aggregate([
      { $match: { mall: mall._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Booking.aggregate([
      { $match: { mall: mall._id, createdAt: { $gte: startOfDay }, 'pricing.totalAmount': { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$pricing.totalAmount' } } },
    ]),
    Booking.countDocuments({ mall: mall._id, status: 'completed', exitTime: { $gte: startOfDay } }),
    Booking.countDocuments({ mall: mall._id, status: 'cancelled', cancelledAt: { $gte: startOfDay } }),
    Booking.aggregate([
      { $match: { mall: mall._id, entryTime: { $ne: null } } },
      { $group: { _id: { $hour: '$entryTime' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]),
  ]);

  const totalSlots = slotCounts.reduce((s, c) => s + c.count, 0);
  const occupied = slotCounts.find((c) => c._id === 'occupied')?.count || 0;
  const available = slotCounts.find((c) => c._id === 'available')?.count || 0;
  const reserved = slotCounts.find((c) => c._id === 'reserved')?.count || 0;

  res.json({
    success: true,
    todaysRevenue: todaysRevenueAgg[0]?.total || 0,
    occupancyRate: totalSlots ? Math.round((occupied / totalSlots) * 100) : 0,
    availableSlots: available,
    reservedSlots: reserved,
    occupiedSlots: occupied,
    completedBookingsToday: completedToday,
    cancelledBookingsToday: cancelledToday,
    peakHour: peakHour[0]?._id ?? null,
  });
});

// @desc Bookings list for a mall (owner view), paginated
// @route GET /api/malls/:mallId/bookings
const getMallBookings = asyncHandler(async (req, res) => {
  const mall = await Mall.findById(req.params.mallId);
  if (!mall) {
    res.status(404);
    throw new Error('Mall not found');
  }
  if (mall.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized for this mall');
  }

  const { status, page = 1, limit = 20 } = req.query;
  const filter = { mall: mall._id };
  if (status) filter.status = status;

  const bookings = await Booking.find(filter)
    .populate('user', 'name email phone')
    .populate('slot', 'slotNumber')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Booking.countDocuments(filter);

  res.json({ success: true, bookings, total, page: Number(page), pages: Math.ceil(total / limit) });
});

module.exports = { getOwnerMallDashboard, getMallBookings };
