const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const bookingSchema = new mongoose.Schema(
  {
    bookingCode: { type: String, unique: true, default: () => uuidv4() },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mall: { type: mongoose.Schema.Types.ObjectId, ref: 'Mall', required: true },
    floor: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingFloor', required: true },
    slot: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSlot', required: true },

    vehicleNumber: { type: String, required: true, uppercase: true, trim: true },
    vehicleType: {
      type: String,
      enum: ['2-wheeler', '4-wheeler', 'ev', 'handicap-accessible'],
      required: true,
    },

    date: { type: Date, required: true }, // booking date
    arrivalTime: { type: String, required: true }, // "HH:mm"
    durationHours: { type: Number, required: true, min: 1 },
    plannedExit: { type: Date, required: true },

    entryTime: { type: Date, default: null },
    exitTime: { type: Date, default: null },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'entered', 'completed', 'cancelled', 'expired'],
      default: 'pending',
      index: true,
    },

    qrHash: { type: String }, // HMAC hash embedded in the QR payload
    qrExpiresAt: { type: Date },

    pricing: {
      baseAmount: { type: Number, default: 0 },
      extraCharges: { type: Number, default: 0 },
      lateExitCharges: { type: Number, default: 0 },
      gst: { type: Number, default: 0 },
      totalAmount: { type: Number, default: 0 },
    },

    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },

    cancelledAt: { type: Date },
    cancellationReason: { type: String },
  },
  { timestamps: true }
);

bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ mall: 1, status: 1, date: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
