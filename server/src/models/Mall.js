const mongoose = require('mongoose');

const mallSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true, index: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    images: [{ type: String }],
    openingHours: {
      open: { type: String, default: '06:00' },
      close: { type: String, default: '23:00' },
      is24Hours: { type: Boolean, default: false },
    },
    pricing: {
      hourly: { type: Number, required: true, default: 20 },
      daily: { type: Number, required: true, default: 150 },
      monthly: { type: Number, required: true, default: 2000 },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

mallSchema.index({ location: '2dsphere' });
mallSchema.index({ name: 'text', city: 'text', address: 'text' });

module.exports = mongoose.model('Mall', mallSchema);
