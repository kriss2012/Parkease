const asyncHandler = require('express-async-handler');
const ParkingFloor = require('../models/ParkingFloor');
const ParkingSlot = require('../models/ParkingSlot');
const Mall = require('../models/Mall');

const assertMallOwnership = async (mallId, user) => {
  const mall = await Mall.findById(mallId);
  if (!mall) {
    const e = new Error('Mall not found');
    e.status = 404;
    throw e;
  }
  if (mall.owner.toString() !== user._id.toString() && user.role !== 'admin') {
    const e = new Error('Not authorized for this mall');
    e.status = 403;
    throw e;
  }
  return mall;
};

// @desc Create a parking floor for a mall
// @route POST /api/floors
const createFloor = asyncHandler(async (req, res) => {
  await assertMallOwnership(req.body.mall, req.user);
  const floor = await ParkingFloor.create(req.body);
  res.status(201).json({ success: true, floor });
});

// @desc List floors for a mall (with slot counts)
// @route GET /api/floors/mall/:mallId
const getFloorsByMall = asyncHandler(async (req, res) => {
  const floors = await ParkingFloor.find({ mall: req.params.mallId }).sort('level');
  const withCounts = await Promise.all(
    floors.map(async (f) => {
      const total = await ParkingSlot.countDocuments({ floor: f._id });
      const available = await ParkingSlot.countDocuments({ floor: f._id, status: 'available' });
      return { ...f.toObject(), totalSlots: total, availableSlots: available };
    })
  );
  res.json({ success: true, floors: withCounts });
});

// @desc Update a floor
// @route PUT /api/floors/:id
const updateFloor = asyncHandler(async (req, res) => {
  const floor = await ParkingFloor.findById(req.params.id);
  if (!floor) {
    res.status(404);
    throw new Error('Floor not found');
  }
  await assertMallOwnership(floor.mall, req.user);
  const { name, level, isActive } = req.body;
  if (name !== undefined) floor.name = name;
  if (level !== undefined) floor.level = level;
  if (isActive !== undefined) floor.isActive = isActive;
  await floor.save();
  res.json({ success: true, floor });
});

// @desc Delete a floor (only if it has no slots)
// @route DELETE /api/floors/:id
const deleteFloor = asyncHandler(async (req, res) => {
  const floor = await ParkingFloor.findById(req.params.id);
  if (!floor) {
    res.status(404);
    throw new Error('Floor not found');
  }
  await assertMallOwnership(floor.mall, req.user);
  const slotCount = await ParkingSlot.countDocuments({ floor: floor._id });
  if (slotCount > 0) {
    res.status(400);
    throw new Error('Cannot delete a floor that still has parking slots');
  }
  await floor.deleteOne();
  res.json({ success: true, message: 'Floor deleted' });
});

module.exports = { createFloor, getFloorsByMall, updateFloor, deleteFloor, assertMallOwnership };
