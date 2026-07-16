const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { getPaymentByBooking, getOwnerRevenue } = require('../controllers/paymentController');

router.use(protect);
router.get('/owner/revenue', authorize('owner', 'admin'), getOwnerRevenue);
router.get('/:bookingId', getPaymentByBooking);

module.exports = router;
