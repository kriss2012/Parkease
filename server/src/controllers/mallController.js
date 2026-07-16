const asyncHandler = require('express-async-handler');
const Mall = require('../models/Mall');
const ParkingSlot = require('../models/ParkingSlot');
const AuditLog = require('../models/AuditLog');
const APIFeatures = require('../utils/apiFeatures');

// @desc Owner creates a mall (goes to pending until admin approves)
// @route POST /api/malls
const createMall = asyncHandler(async (req, res) => {
  const mall = await Mall.create({ ...req.body, owner: req.user._id, status: 'pending' });
  res.status(201).json({ success: true, mall });
});

// @desc Public search for approved malls: by city, name, distance, vehicle type
// @route GET /api/malls
const searchMalls = asyncHandler(async (req, res) => {
  const { lat, lng, maxDistanceKm, vehicleType } = req.query;
  let baseQuery = Mall.find({ status: 'approved', isActive: true });

  if (lat && lng) {
    baseQuery = Mall.find({
      status: 'approved',
      isActive: true,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
          $maxDistance: (Number(maxDistanceKm) || 10) * 1000,
        },
      },
    });
  }

  const features = new APIFeatures(baseQuery, req.query).search(['name', 'city', 'address']).sort().paginate();
  let malls = await features.query;

  if (vehicleType) {
    const mallIds = malls.map((m) => m._id);
    const availableCounts = await ParkingSlot.aggregate([
      { $match: { mall: { $in: mallIds }, vehicleType, status: 'available' } },
      { $group: { _id: '$mall', count: { $sum: 1 } } },
    ]);
    const availMap = new Map(availableCounts.map((c) => [String(c._id), c.count]));
    malls = malls
      .map((m) => ({ ...m.toObject(), availableSlots: availMap.get(String(m._id)) || 0 }))
      .filter((m) => m.availableSlots > 0);
  }

  res.json({ success: true, count: malls.length, malls });
});

// @desc Get single mall with live slot availability summary
// @route GET /api/malls/:id
const getMallById = asyncHandler(async (req, res) => {
  const mall = await Mall.findById(req.params.id);
  if (!mall) {
    res.status(404);
    throw new Error('Mall not found');
  }

  const slotSummary = await ParkingSlot.aggregate([
    { $match: { mall: mall._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  res.json({ success: true, mall, slotSummary });
});

// @desc Owner updates their mall
// @route PUT /api/malls/:id
const updateMall = asyncHandler(async (req, res) => {
  const mall = await Mall.findById(req.params.id);
  if (!mall) {
    res.status(404);
    throw new Error('Mall not found');
  }
  if (mall.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to edit this mall');
  }

  const editable = ['name', 'description', 'address', 'city', 'images', 'openingHours', 'pricing', 'location'];
  editable.forEach((field) => {
    if (req.body[field] !== undefined) mall[field] = req.body[field];
  });
  await mall.save();
  res.json({ success: true, mall });
});

// @desc Owner's own malls
// @route GET /api/malls/owner/mine
const getOwnerMalls = asyncHandler(async (req, res) => {
  const malls = await Mall.find({ owner: req.user._id }).sort('-createdAt');
  res.json({ success: true, malls });
});

module.exports = { createMall, searchMalls, getMallById, updateMall, getOwnerMalls };
