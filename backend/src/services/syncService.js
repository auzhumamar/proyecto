const axios = require('axios');
const { HeartMeasurement, SyncStatus } = require('../models');
const ubidotsConfig = require('../config/ubidots');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class SyncService {
    /**
     * Sync pending measurements to Ubidots
     */
    async syncPendingMeasurements() {
        try {
            // Get pending measurements
            const pendingMeasurements = await HeartMeasurement.findAll({
                where: { is_synced: false },
                include: [{
                    model: SyncStatus,
                    as: 'syncStatus',
                    where: {
                        status: { [Op.in]: ['pending', 'failed'] },
                        retry_count: { [Op.lt]: ubidotsConfig.sync.maxRetries }
                    }
                }],
                limit: 50 // Process in batches
            });

            if (pendingMeasurements.length === 0) {
                logger.info('No pending measurements to sync');
                return {
                    success: true,
                    message: 'No pending measurements',
                    data: { synced: 0, failed: 0 }
                };
            }

            let syncedCount = 0;
            let failedCount = 0;

            for (const measurement of pendingMeasurements) {
                try {
                    await this.syncMeasurement(measurement);
                    syncedCount++;
                } catch (error) {
                    failedCount++;
                    logger.error('Failed to sync measurement:', {
                        measurementId: measurement.id,
                        error: error.message
                    });
                }
            }

            logger.info('Sync completed:', { syncedCount, failedCount });

            return {
                success: true,
                message: 'Sync completed',
                data: { synced: syncedCount, failed: failedCount }
            };
        } catch (error) {
            logger.error('Error syncing measurements:', error);
            throw error;
        }
    }

    /**
     * Sync single measurement to Ubidots
     */
    async syncMeasurement(measurement) {
        try {
            const syncStatus = measurement.syncStatus;

            // Prepare data for Ubidots
            const ubidotsData = {
                [ubidotsConfig.variables.bpm]: {
                    value: measurement.bpm,
                    timestamp: new Date(measurement.measured_at).getTime()
                }
            };

            // Add ECG signal if available
            if (measurement.ecg_signal) {
                ubidotsData[ubidotsConfig.variables.ecg] = {
                    value: JSON.stringify(measurement.ecg_signal),
                    timestamp: new Date(measurement.measured_at).getTime()
                };
            }

            // Add electrode status if available
            if (measurement.electrode_status) {
                ubidotsData[ubidotsConfig.variables.electrodeStatus] = {
                    value: JSON.stringify(measurement.electrode_status),
                    timestamp: new Date(measurement.measured_at).getTime()
                };
            }

            // Send to Ubidots
            const response = await axios.post(
                `${ubidotsConfig.apiUrl}${ubidotsConfig.endpoints.devices}/${ubidotsConfig.deviceLabel}`,
                ubidotsData,
                {
                    headers: {
                        'X-Auth-Token': ubidotsConfig.token,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                }
            );

            // Update measurement as synced
            measurement.is_synced = true;
            measurement.sync_error = null;
            await measurement.save();

            // Update sync status
            syncStatus.status = 'synced';
            syncStatus.ubidots_id = response.data?.id || null;
            syncStatus.last_attempt_at = new Date();
            syncStatus.error_message = null;
            await syncStatus.save();

            logger.info('Measurement synced successfully:', {
                measurementId: measurement.id,
                ubidotsId: response.data?.id
            });

            return { success: true };
        } catch (error) {
            // Update sync status with error
            const syncStatus = measurement.syncStatus;
            syncStatus.status = 'failed';
            syncStatus.retry_count += 1;
            syncStatus.last_attempt_at = new Date();
            syncStatus.error_message = error.message;
            await syncStatus.save();

            // Update measurement with error
            measurement.sync_error = error.message;
            await measurement.save();

            throw error;
        }
    }

    /**
     * Get sync status summary
     */
    async getSyncStatus() {
        try {
            const totalMeasurements = await HeartMeasurement.count();
            const syncedMeasurements = await HeartMeasurement.count({ where: { is_synced: true } });
            const pendingMeasurements = await SyncStatus.count({ where: { status: 'pending' } });
            const failedMeasurements = await SyncStatus.count({ where: { status: 'failed' } });

            return {
                success: true,
                data: {
                    total: totalMeasurements,
                    synced: syncedMeasurements,
                    pending: pendingMeasurements,
                    failed: failedMeasurements
                }
            };
        } catch (error) {
            logger.error('Error getting sync status:', error);
            throw error;
        }
    }

    /**
     * Force sync for specific measurement
     */
    async forceSyncMeasurement(measurementId) {
        try {
            const measurement = await HeartMeasurement.findByPk(measurementId, {
                include: [{
                    model: SyncStatus,
                    as: 'syncStatus'
                }]
            });

            if (!measurement) {
                throw new Error('Measurement not found');
            }

            await this.syncMeasurement(measurement);

            return {
                success: true,
                message: 'Measurement synced successfully'
            };
        } catch (error) {
            logger.error('Error force syncing measurement:', error);
            throw error;
        }
    }
}

module.exports = new SyncService();
