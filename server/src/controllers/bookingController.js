const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const ParkingSlot = require('../models/ParkingSlot');
const Mall = require('../models/Mall');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');
const { generateQRDataURL } = require('../utils/qrCode');
const { calcBaseAmount, generateInvoice } = require('../utils/billing');

// @desc Create a booking: atomically allocate a matching available slot,
//       lock it as 'reserved', calculate pricing, and issue a signed QR.
// @route POST /api/bookings
const createBooking = asyncHandler(async (req, res) => {
  const { mallId, vehicleNumber, vehicleType, date, arrivalTime, durationHours, paymentMethod } = req.body;

  const mall = await Mall.findById(mallId);
  if (!mall || mall.status !== 'approved' || !mall.isActive) {
    res.status(400);
    throw new Error('This mall is not available for booking');
  }

  // One active booking per user (pending/confirmed/entered)
  const activeBooking = await Booking.findOne({
    user: req.user._id,
    status: { $in: ['pending', 'confirmed', 'entered'] },
  });
  if (activeBooking) {
    res.status(409);
    throw new Error('You already have an active booking. Complete or cancel it before booking again.');
  }

  // Prevent past-date bookings
  const [hh, mm] = arrivalTime.split(':').map(Number);
  const bookingDate = new Date(date);
  bookingDate.setHours(hh, mm, 0, 0);
  if (bookingDate < new Date(Date.now() - 5 * 60 * 1000)) {
    res.status(400);
    throw new Error('Cannot book a slot in the past');
  }

  const plannedExit = new Date(bookingDate.getTime() + durationHours * 60 * 60 * 1000);

  // === Atomic slot allocation ===
  // findOneAndUpdate on { mall, vehicleType, status: 'available' } is atomic at the
  // document level in MongoDB, which prevents two concurrent requests from claiming
  // the same slot (no read-then-write race).
  const slot = await ParkingSlot.findOneAndUpdate(
    { mall: mall._id, vehicleType, status: 'available' },
    { $set: { status: 'reserved' } },
    { new: true, sort: { slotNumber: 1 } }
  );

  if (!slot) {
    res.status(409);
    throw new Error(`No available ${vehicleType} slots at this mall right now`);
  }

  try {
    const baseAmount = calcBaseAmount(mall.pricing.hourly, durationHours);

    const booking = await Booking.create({
      user: req.user._id,
      mall: mall._id,
      floor: slot.floor,
      slot: slot._id,
      vehicleNumber,
      vehicleType,
      date: bookingDate,
      arrivalTime,
      durationHours,
      plannedExit,
      status: 'confirmed',
      pricing: { baseAmount, totalAmount: baseAmount },
      qrExpiresAt: plannedExit,
    });

    slot.currentBooking = booking._id;
    await slot.save();

    // Dummy payment - always "succeeds" in this simulation
    const payment = await Payment.create({
      booking: booking._id,
      user: req.user._id,
      amount: baseAmount,
      method: paymentMethod || 'dummy-card',
      status: 'success',
      transactionId: `TXN-${Date.now()}`,
      invoiceNumber: `INV-${booking.bookingCode.slice(0, 8).toUpperCase()}`,
      paidAt: new Date(),
    });
    booking.payment = payment._id;

    const { dataUrl, payload } = await generateQRDataURL(booking._id, plannedExit);
    booking.qrHash = payload.hash;
    await booking.save();

    await Notification.create({
      user: req.user._id,
      type: 'booking-confirmation',
      title: 'Booking confirmed',
      message: `Your slot ${slot.slotNumber} at ${mall.name} is booked for ${date} at ${arrivalTime}.`,
      meta: { bookingId: booking._id },
    });
    await sendEmail({
      to: req.user.email,
      subject: 'ParkEase - Booking Confirmed',
      html: `<p>Hi ${req.user.name}, your booking (${booking.bookingCode}) at ${mall.name}, slot ${slot.slotNumber}, is confirmed.</p>`,
    });

    res.status(201).json({ success: true, booking, qrCode: dataUrl });
  } catch (err) {
    // Roll back the slot reservation if anything after allocation fails
    await ParkingSlot.findByIdAndUpdate(slot._id, { status: 'available', currentBooking: null });
    throw err;
  }
});

// @desc Get logged-in user's bookings (history + active)
// @route GET /api/bookings/mine
const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate('mall', 'name city address images')
    .populate('slot', 'slotNumber')
    .sort('-createdAt');
  res.json({ success: true, bookings });
});

// @desc Get a single booking (with fresh QR if still valid)
// @route GET /api/bookings/:id
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('mall slot floor payment');
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  if (booking.user.toString() !== req.user._id.toString() && !['admin', 'guard'].includes(req.user.role)) {
    res.status(403);
    throw new Error('Not authorized to view this booking');
  }

  let qrCode = null;
  if (['confirmed'].includes(booking.status)) {
    const { dataUrl } = await generateQRDataURL(booking._id, booking.qrExpiresAt);
    qrCode = dataUrl;
  }

  res.json({ success: true, booking, qrCode });
});

// @desc Cancel a booking and free the slot
// @route PUT /api/bookings/:id/cancel
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  if (booking.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to cancel this booking');
  }
  if (!['pending', 'confirmed'].includes(booking.status)) {
    res.status(400);
    throw new Error(`Booking cannot be cancelled once it is '${booking.status}'`);
  }

  booking.status = 'cancelled';
  booking.cancelledAt = new Date();
  booking.cancellationReason = req.body.reason || 'Cancelled by user';
  await booking.save();

  await ParkingSlot.findByIdAndUpdate(booking.slot, { status: 'available', currentBooking: null });

  await Notification.create({
    user: booking.user,
    type: 'booking-cancellation',
    title: 'Booking cancelled',
    message: `Your booking ${booking.bookingCode} has been cancelled.`,
  });

  res.json({ success: true, booking });
});

module.exports = { createBooking, getMyBookings, getBookingById, cancelBooking };
