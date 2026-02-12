const syncService = require('../services/syncService');
const logger = require('../utils/logger');

class SyncController {
    /**
     * Trigger manual sync
     */
    async triggerSync(req, res, next) {
        try {
            const result = await syncService.syncPendingMeasurements();

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get sync status
     */
    async getSyncStatus(req, res, next) {
        try {
            const result = await syncService.getSyncStatus();

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Force sync specific measurement
     */
    async forceSyncMeasurement(req, res, next) {
        try {
            const { measurementId } = req.params;

            const result = await syncService.forceSyncMeasurement(measurementId);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new SyncController();
