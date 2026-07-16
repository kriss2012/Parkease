const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const {
  getDashboardStats, listUsers, toggleSuspendUser,
  listPendingMalls, approveMall, rejectMall, getAnalytics, getAuditLogs,
} = require('../controllers/adminController');

router.use(protect, authorize('admin'));
router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/audit-logs', getAuditLogs);
router.get('/users', listUsers);
router.put('/users/:id/suspend', toggleSuspendUser);
router.get('/malls/pending', listPendingMalls);
router.put('/malls/:id/approve', approveMall);
router.put('/malls/:id/reject', rejectMall);

module.exports = router;
