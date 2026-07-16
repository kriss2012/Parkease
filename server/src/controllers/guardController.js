const asyncHandler = require('express-async-handler');
const Booking = require('../models/Booking');
const ParkingSlot = require('../models/ParkingSlot');
const Mall = require('../models/Mall');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const { verifyPayload } = require('../utils/qrCode');
const { generateInvoice } = require('../utils/billing');

// @desc Guard scans a QR (JSON payload from the code) and the system tells
//       them what to do next - the guard never manually approves anything.
// @route POST /api/guard/scan
const scanQR = asyncHandler(async (req, res) => {
  const { payload } = req.body; // { bookingId, expiry, hash }

  const verification = verifyPayload(payload);
  if (!verification.valid) {
    return res.status(400).json({ success: false, reason: verification.reason, message: qrRejectMessage(verification.reason) });
  }

  const booking = await Booking.findById(payload.bookingId).populate('mall slot user');
  if (!booking) {
    return res.status(404).json({ success: false, reason: 'NOT_FOUND', message: 'Booking not found' });
  }

  if (req.user.assignedMall && String(booking.mall._id) !== String(req.user.assignedMall)) {
    return res.status(403).json({ success: false, reason: 'WRONG_MALL', message: 'This booking is for a different mall' });
  }

  if (booking.status === 'cancelled') {
    return res.status(400).json({ success: false, reason: 'CANCELLED_BOOKING', message: 'This booking has been cancelled' });
  }
  if (booking.status === 'completed') {
    return res.status(400).json({ success: false, reason: 'ALREADY_EXITED', message: 'This vehicle has already exited' });
  }
  if (booking.status === 'entered') {
    return res.json({
      success: true,
      action: 'EXIT_READY',
      message: 'Vehicle already inside - ready to process exit',
      booking,
    });
  }
  if (booking.status === 'confirmed') {
    return res.json({
      success: true,
      action: 'ENTRY_READY',
      message: 'Booking is valid - ready to process entry',
      booking,
    });
  }

  return res.status(400).json({ success: false, reason: 'INVALID_STATE', message: `Booking is '${booking.status}' and cannot be processed` });
});

const qrRejectMessage = (reason) => ({
  EXPIRED_QR: 'This QR code has expired',
  TAMPERED_QR: 'This QR code failed verification',
  MALFORMED_QR: 'This QR code could not be read',
}[reason] || 'This QR code is invalid');

// @desc Confirm vehicle entry after a successful scan
// @route POST /api/guard/entry/:bookingId
const processEntry = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId).populate('mall slot');
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Entry rules
  if (booking.status !== 'confirmed') {
    res.status(400);
    throw new Error(`Cannot process entry - booking is '${booking.status}', not 'confirmed'`);
  }
  if (booking.entryTime) {
    res.status(400);
    throw new Error('Vehicle has already entered for this booking');
  }
  if (new Date() > booking.qrExpiresAt) {
    booking.status = 'expired';
    await booking.save();
    await ParkingSlot.findByIdAndUpdate(booking.slot, { status: 'available', currentBooking: null });
    res.status(400);
    throw new Error('Booking window has expired');
  }

  booking.entryTime = new Date();
  booking.status = 'entered';
  await booking.save();

  await ParkingSlot.findByIdAndUpdate(booking.slot, { status: 'occupied' });

  res.json({ success: true, message: 'Entry recorded', booking });
});

// @desc Confirm vehicle exit: calculates final bill and generates a receipt
// @route POST /api/guard/exit/:bookingId
const processExit = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId).populate('mall slot payment');
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Exit rules
  if (!booking.entryTime) {
    res.status(400);
    throw new Error('Vehicle has not entered yet - cannot process exit');
  }
  if (booking.status !== 'entered') {
    res.status(400);
    throw new Error(`Cannot process exit - booking is '${booking.status}', not 'entered'`);
  }

  const exitTime = new Date();
  const invoice = generateInvoice({
    hourlyRate: booking.mall.pricing.hourly,
    durationHours: booking.durationHours,
    plannedExit: booking.plannedExit,
    actualExit: exitTime,
  });

  booking.exitTime = exitTime;
  booking.status = 'completed';
  booking.pricing = { ...booking.pricing.toObject(), ...invoice };
  await booking.save();

  await ParkingSlot.findByIdAndUpdate(booking.slot, { status: 'available', currentBooking: null });

  if (invoice.lateExitCharges > 0 && booking.payment) {
    await Payment.findByIdAndUpdate(booking.payment, {
      $inc: { amount: invoice.lateExitCharges + invoice.gst },
    });
  }

  await Notification.create({
    user: booking.user,
    type: 'booking-completed',
    title: 'Parking session completed',
    message: `Total charged: ₹${invoice.totalAmount} for booking ${booking.bookingCode}.`,
  });

  res.json({
    success: true,
    message: 'Exit recorded',
    booking,
    receipt: {
      bookingCode: booking.bookingCode,
      vehicleNumber: booking.vehicleNumber,
      entryTime: booking.entryTime,
      exitTime,
      durationBilled: `${booking.durationHours}h planned`,
      ...invoice,
    },
  });
});

// @desc Guard dashboard summary: today's entries/exits, pending vehicles
// @route GET /api/guard/dashboard
const guardDashboard = asyncHandler(async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const mallFilter = req.user.assignedMall ? { mall: req.user.assignedMall } : {};

  const [todaysEntries, todaysExits, pendingVehicles] = await Promise.all([
    Booking.countDocuments({ ...mallFilter, entryTime: { $gte: startOfDay } }),
    Booking.countDocuments({ ...mallFilter, exitTime: { $gte: startOfDay } }),
    Booking.countDocuments({ ...mallFilter, status: 'entered' }),
  ]);

  res.json({ success: true, todaysEntries, todaysExits, pendingVehicles });
});

module.exports = { scanQR, processEntry, processExit, guardDashboard };
