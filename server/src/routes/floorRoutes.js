const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { createFloor, getFloorsByMall, updateFloor, deleteFloor } = require('../controllers/floorController');

router.get('/mall/:mallId', getFloorsByMall); // public - users need this to see floor availability
router.post('/', protect, authorize('owner', 'admin'), createFloor);
router.put('/:id', protect, authorize('owner', 'admin'), updateFloor);
router.delete('/:id', protect, authorize('owner', 'admin'), deleteFloor);

module.exports = router;
