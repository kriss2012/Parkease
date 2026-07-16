const asyncHandler = require('express-async-handler');
const ParkingSlot = require('../models/ParkingSlot');
const ParkingFloor = require('../models/ParkingFloor');
const { assertMallOwnership } = require('./floorController');

// @desc Bulk-create slots on a floor, e.g. { floor, prefix: "G", count: 20, vehicleType }
// @route POST /api/slots/bulk
const bulkCreateSlots = asyncHandler(async (req, res) => {
  const { floor: floorId, prefix, count, vehicleType } = req.body;
  const floor = await ParkingFloor.findById(floorId);
  if (!floor) {
    res.status(404);
    throw new Error('Floor not found');
  }
  await assertMallOwnership(floor.mall, req.user);

  const docs = Array.from({ length: count }, (_, i) => ({
    mall: floor.mall,
    floor: floor._id,
    slotNumber: `${prefix}-${String(i + 1).padStart(2, '0')}`,
    vehicleType: vehicleType || '4-wheeler',
    status: 'available',
  }));

  const created = await ParkingSlot.insertMany(docs, { ordered: false }).catch((err) => {
    // Partial success on duplicate slot numbers is acceptable; surface a clear message
    if (err.code === 11000) return err.insertedDocs || [];
    throw err;
  });

  floor.totalSlots = await ParkingSlot.countDocuments({ floor: floor._id });
  await floor.save();

  res.status(201).json({ success: true, createdCount: created.length, slots: created });
});

// @desc Get slots for a floor, with live status
// @route GET /api/slots/floor/:floorId
const getSlotsByFloor = asyncHandler(async (req, res) => {
  const slots = await ParkingSlot.find({ floor: req.params.floorId }).sort('slotNumber');
  res.json({ success: true, slots });
});

// @desc Update a single slot (status/maintenance/vehicleType)
// @route PUT /api/slots/:id
const updateSlot = asyncHandler(async (req, res) => {
  const slot = await ParkingSlot.findById(req.params.id);
  if (!slot) {
    res.status(404);
    throw new Error('Slot not found');
  }
  await assertMallOwnership(slot.mall, req.user);

  const { status, vehicleType } = req.body;
  if (status) {
    if (slot.currentBooking && ['available', 'maintenance'].includes(status)) {
      res.status(400);
      throw new Error('Cannot change status of a slot with an active booking');
    }
    slot.status = status;
  }
  if (vehicleType) slot.vehicleType = vehicleType;
  await slot.save();
  res.json({ success: true, slot });
});

// @desc Live availability count grouped by vehicle type for a mall
// @route GET /api/slots/mall/:mallId/availability
const getMallAvailability = asyncHandler(async (req, res) => {
  const summary = await ParkingSlot.aggregate([
    { $match: { mall: new (require('mongoose').Types.ObjectId)(req.params.mallId) } },
    { $group: { _id: { vehicleType: '$vehicleType', status: '$status' }, count: { $sum: 1 } } },
  ]);
  res.json({ success: true, summary });
});

module.exports = { bulkCreateSlots, getSlotsByFloor, updateSlot, getMallAvailability };
