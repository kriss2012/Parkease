const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { scanQR, processEntry, processExit, guardDashboard } = require('../controllers/guardController');

router.use(protect, authorize('guard', 'admin'));
router.get('/dashboard', guardDashboard);
router.post('/scan', scanQR);
router.post('/entry/:bookingId', processEntry);
router.post('/exit/:bookingId', processExit);

module.exports = router;
