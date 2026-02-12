// Statistics page logic

// Require authentication
if (!requireAuth()) {
    throw new Error('Not authenticated');
}

let currentPatient = null;
let selectedTimeRange = 'week'; // day, week, month, year

// Initialize statistics page
document.addEventListener('DOMContentLoaded', async () => {
    await loadPatient();
    await loadStatistics();
    setupEventListeners();
});

// Load patient
async function loadPatient() {
    try {
        const result = await api.getPatients();

        if (result.success && result.data.length > 0) {
            currentPatient = result.data[0];
        } else {
            showToast('No tienes pacientes registrados', 'warning');
            setTimeout(() => window.location.href = 'profile.html', 2000);
        }
    } catch (error) {
        console.error('Error loading patient:', error);
        showToast('Error al cargar paciente', 'error');
    }
}

// Load statistics
async function loadStatistics() {
    if (!currentPatient) return;

    try {
        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();

        switch (selectedTimeRange) {
            case 'day':
                startDate.setDate(startDate.getDate() - 1);
                break;
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case 'year':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
        }

        // Get statistics
        const statsResult = await api.getMeasurementStats(currentPatient.id, {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        });

        if (statsResult.success) {
            displayStatistics(statsResult.data);
        }

        // Get measurements for history
        const measurementsResult = await api.getMeasurements(currentPatient.id, {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            limit: 100,
            sort: 'desc'
        });

        if (measurementsResult.success) {
            displayMeasurementHistory(measurementsResult.data.measurements);
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
        showToast('Error al cargar estadísticas', 'error');
    }
}

// Display statistics
function displayStatistics(stats) {
    // Average BPM
    const avgBpmEl = document.getElementById('avgBpm');
    if (avgBpmEl && stats.avgBpm) {
        avgBpmEl.textContent = Math.round(stats.avgBpm);
    }

    // Min BPM
    const minBpmEl = document.getElementById('minBpm');
    if (minBpmEl && stats.minBpm) {
        minBpmEl.textContent = stats.minBpm;
    }

    // Max BPM
    const maxBpmEl = document.getElementById('maxBpm');
    if (maxBpmEl && stats.maxBpm) {
        maxBpmEl.textContent = stats.maxBpm;
    }

    // Total measurements
    const totalMeasurementsEl = document.getElementById('totalMeasurements');
    if (totalMeasurementsEl && stats.count) {
        totalMeasurementsEl.textContent = stats.count;
    }
}

// Display measurement history
function displayMeasurementHistory(measurements) {
    const historyContainer = document.getElementById('measurementHistory');
    if (!historyContainer) return;

    if (measurements.length === 0) {
        historyContainer.innerHTML = `
            <div class="text-center py-12 text-slate-400">
                <span class="material-symbols-outlined text-5xl mb-3">history</span>
                <p class="text-base font-medium">No hay mediciones en este período</p>
            </div>
        `;
        return;
    }

    historyContainer.innerHTML = measurements.map(m => {
        const status = getBPMStatus(m.bpm);
        return `
            <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td class="px-6 py-4 font-medium flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary text-[18px]">favorite</span>
                    ${m.bpm} BPM
                </td>
                <td class="px-6 py-4 text-slate-500">${formatDate(m.timestamp)}</td>
                <td class="px-6 py-4">${m.electrodes_connected ? 'Conectados' : 'Desconectados'}</td>
                <td class="px-6 py-4 text-right">
                    <span class="px-2 py-1 ${status.bg} ${status.color} text-[10px] font-bold rounded uppercase">
                        ${status.status}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Time range buttons
    const timeRangeButtons = document.querySelectorAll('[data-time-range]');
    timeRangeButtons.forEach(button => {
        button.addEventListener('click', async () => {
            // Update active state
            timeRangeButtons.forEach(btn => {
                btn.classList.remove('bg-primary', 'text-white', 'shadow-sm');
                btn.classList.add('text-slate-500');
            });
            button.classList.add('bg-primary', 'text-white', 'shadow-sm');
            button.classList.remove('text-slate-500');

            // Update selected range
            selectedTimeRange = button.dataset.timeRange;

            // Reload statistics
            await loadStatistics();
        });
    });

    // Download report button
    const downloadButton = document.getElementById('downloadReport');
    if (downloadButton) {
        downloadButton.addEventListener('click', downloadReport);
    }
}

// Download report
function downloadReport() {
    showToast('Función de descarga en desarrollo', 'info');
}
