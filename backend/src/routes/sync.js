const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');
const { authenticate, authorize } = require('../middlewares/auth');

// All sync routes require authentication
router.use(authenticate);

// Trigger manual sync
router.post(
    '/trigger',
    syncController.triggerSync
);

// Get sync status
router.get(
    '/status',
    syncController.getSyncStatus
);

// Force sync specific measurement (admin only)
router.post(
    '/force/:measurementId',
    authorize('admin'),
    syncController.forceSyncMeasurement
);

module.exports = router;
