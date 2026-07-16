const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { bulkCreateSlots, getSlotsByFloor, updateSlot, getMallAvailability } = require('../controllers/slotController');

router.get('/floor/:floorId', getSlotsByFloor); // public - live availability
router.get('/mall/:mallId/availability', getMallAvailability); // public
router.post('/bulk', protect, authorize('owner', 'admin'), bulkCreateSlots);
router.put('/:id', protect, authorize('owner', 'admin'), updateSlot);

module.exports = router;
