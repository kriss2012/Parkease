const mongoose = require('mongoose');

const parkingFloorSchema = new mongoose.Schema(
  {
    mall: { type: mongoose.Schema.Types.ObjectId, ref: 'Mall', required: true, index: true },
    name: { type: String, required: true }, // Ground, First, Second, Basement...
    level: { type: Number, required: true }, // -1 for basement, 0 ground, 1 first...
    totalSlots: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

parkingFloorSchema.index({ mall: 1, level: 1 }, { unique: true });

module.exports = mongoose.model('ParkingFloor', parkingFloorSchema);
