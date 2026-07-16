const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const {
  createMall, searchMalls, getMallById, updateMall, getOwnerMalls,
} = require('../controllers/mallController');
const { getOwnerMallDashboard, getMallBookings } = require('../controllers/ownerController');

router.get('/', searchMalls); // public search
router.get('/owner/mine', protect, authorize('owner'), getOwnerMalls);
router.get('/:id', getMallById); // public detail
router.post('/', protect, authorize('owner'), createMall);
router.put('/:id', protect, authorize('owner', 'admin'), updateMall);
router.get('/:mallId/dashboard', protect, authorize('owner', 'admin'), getOwnerMallDashboard);
router.get('/:mallId/bookings', protect, authorize('owner', 'admin'), getMallBookings);

module.exports = router;
