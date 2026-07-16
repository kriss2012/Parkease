const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const validate = require('../middleware/validate');
const { createBookingRules } = require('../validators/bookingValidators');
const { createBooking, getMyBookings, getBookingById, cancelBooking } = require('../controllers/bookingController');

router.use(protect);
router.post('/', authorize('user'), createBookingRules, validate, createBooking);
router.get('/mine', authorize('user'), getMyBookings);
router.get('/:id', getBookingById);
router.put('/:id/cancel', authorize('user'), cancelBooking);

module.exports = router;
