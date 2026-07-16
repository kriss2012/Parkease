const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema(
  {
    mall: { type: mongoose.Schema.Types.ObjectId, ref: 'Mall', required: true, index: true },
    floor: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingFloor', required: true, index: true },
    slotNumber: { type: String, required: true },
    vehicleType: {
      type: String,
      enum: ['2-wheeler', '4-wheeler', 'ev', 'handicap-accessible'],
      default: '4-wheeler',
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'reserved', 'maintenance'],
      default: 'available',
      index: true,
    },
    // Set when a booking currently holds this slot (reserved/occupied)
    currentBooking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
  },
  { timestamps: true }
);

parkingSlotSchema.index({ floor: 1, slotNumber: 1 }, { unique: true });
parkingSlotSchema.index({ mall: 1, vehicleType: 1, status: 1 });

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);
