const asyncHandler = require('express-async-handler');
const Payment = require('../models/Payment');

// @desc Get payment/invoice details for a booking
// @route GET /api/payments/:bookingId
const getPaymentByBooking = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ booking: req.params.bookingId }).populate('booking');
  if (!payment) {
    res.status(404);
    throw new Error('Payment record not found');
  }
  if (payment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this payment');
  }
  res.json({ success: true, payment });
});

// @desc Owner: revenue for their malls (used by owner analytics dashboard)
// @route GET /api/payments/owner/revenue
const getOwnerRevenue = asyncHandler(async (req, res) => {
  const Booking = require('../models/Booking');
  const Mall = require('../models/Mall');
  const mongoose = require('mongoose');

  const malls = await Mall.find({ owner: req.user._id }).select('_id');
  const mallIds = malls.map((m) => m._id);

  const revenue = await Booking.aggregate([
    { $match: { mall: { $in: mallIds }, 'pricing.totalAmount': { $gt: 0 } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        total: { $sum: '$pricing.totalAmount' },
        bookings: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({ success: true, revenue });
});

module.exports = { getPaymentByBooking, getOwnerRevenue };
