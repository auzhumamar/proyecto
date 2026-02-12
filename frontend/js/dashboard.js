// Dashboard logic - Real-time BPM monitoring

// Require authentication
if (!requireAuth()) {
    throw new Error('Not authenticated');
}

let currentPatient = null;
let bpmUpdateInterval = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    await loadUserInfo();
    await loadPatients();
    startBPMUpdates();
});

// Load user information
async function loadUserInfo() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = '/frontend/login.html';
        return;
    }

    // Update UI with user info
    const userNameEl = document.getElementById('userName');
    const userEmailEl = document.getElementById('userEmail');

    if (userNameEl) {
        userNameEl.textContent = user.email.split('@')[0];
    }
    if (userEmailEl) {
        userEmailEl.textContent = user.email;
    }
}

// Load patients
async function loadPatients() {
    try {
        const result = await api.getPatients();

        if (result.success && result.data.length > 0) {
            // Use first patient for now
            currentPatient = result.data[0];
            updatePatientInfo(currentPatient);
        } else {
            // No patients, show create patient modal
            showCreatePatientModal();
        }
    } catch (error) {
        console.error('Error loading patients:', error);
        showToast('Error al cargar pacientes', 'error');
    }
}

// Update patient info in UI
function updatePatientInfo(patient) {
    const patientNameEl = document.getElementById('patientName');
    const patientIdEl = document.getElementById('patientId');

    if (patientNameEl) {
        patientNameEl.textContent = `${patient.first_name} ${patient.last_name}`;
    }
    if (patientIdEl) {
        patientIdEl.textContent = `ID: #${patient.id.slice(0, 8)}`;
    }
}

// Start BPM updates (polling every 5 seconds)
function startBPMUpdates() {
    if (!currentPatient) return;

    // Initial load
    updateBPM();

    // Poll every 5 seconds
    bpmUpdateInterval = setInterval(updateBPM, 5000);
}

// Stop BPM updates
function stopBPMUpdates() {
    if (bpmUpdateInterval) {
        clearInterval(bpmUpdateInterval);
        bpmUpdateInterval = null;
    }
}

// Update BPM display
async function updateBPM() {
    if (!currentPatient) return;

    try {
        const result = await api.getLatestMeasurement(currentPatient.id);

        if (result.success && result.data) {
            const measurement = result.data;
            displayBPM(measurement);
            updateRecentHistory();
        } else {
            displayNoBPM();
        }
    } catch (error) {
        console.error('Error updating BPM:', error);
        displayNoBPM();
    }
}

// Display BPM value
function displayBPM(measurement) {
    const bpmValueEl = document.getElementById('bpmValue');
    const bpmStatusEl = document.getElementById('bpmStatus');
    const lastUpdateEl = document.getElementById('lastUpdate');
    const liveIndicator = document.getElementById('liveIndicator');

    if (bpmValueEl) {
        bpmValueEl.textContent = measurement.bpm;

        // Animate value change
        bpmValueEl.classList.add('scale-110');
        setTimeout(() => bpmValueEl.classList.remove('scale-110'), 200);
    }

    if (bpmStatusEl) {
        const status = getBPMStatus(measurement.bpm);
        bpmStatusEl.textContent = status.status;
        bpmStatusEl.className = `text-xs font-medium ${status.color}`;
    }

    if (lastUpdateEl) {
        lastUpdateEl.textContent = timeAgo(measurement.timestamp);
    }

    if (liveIndicator) {
        liveIndicator.classList.add('animate-pulse');
    }
}

// Display no BPM data
function displayNoBPM() {
    const bpmValueEl = document.getElementById('bpmValue');
    const bpmStatusEl = document.getElementById('bpmStatus');
    const lastUpdateEl = document.getElementById('lastUpdate');

    if (bpmValueEl) {
        bpmValueEl.textContent = '--';
    }

    if (bpmStatusEl) {
        bpmStatusEl.textContent = 'Sin datos';
        bpmStatusEl.className = 'text-xs font-medium text-slate-400';
    }

    if (lastUpdateEl) {
        lastUpdateEl.textContent = 'Esperando datos...';
    }
}

// Update recent history
async function updateRecentHistory() {
    if (!currentPatient) return;

    try {
        const result = await api.getMeasurements(currentPatient.id, {
            limit: 5,
            sort: 'desc'
        });

        if (result.success && result.data.measurements) {
            displayRecentHistory(result.data.measurements);
        }
    } catch (error) {
        console.error('Error loading history:', error);
    }
}

// Display recent history
function displayRecentHistory(measurements) {
    const historyContainer = document.getElementById('recentHistory');
    if (!historyContainer) return;

    if (measurements.length === 0) {
        historyContainer.innerHTML = `
            <div class="text-center py-8 text-slate-400">
                <span class="material-symbols-outlined text-4xl mb-2">history</span>
                <p class="text-sm">No hay mediciones recientes</p>
            </div>
        `;
        return;
    }

    historyContainer.innerHTML = measurements.map(m => {
        const status = getBPMStatus(m.bpm);
        return `
            <div class="flex items-center justify-between border-b border-rose-50 dark:border-rose-900/30 pb-3">
                <div>
                    <p class="text-sm font-bold">${m.bpm} BPM</p>
                    <p class="text-xs text-rose-600/70">${formatDate(m.timestamp)}</p>
                </div>
                <span class="px-2 py-1 rounded-full text-xs font-bold ${status.bg} ${status.color}">
                    ${status.status}
                </span>
            </div>
        `;
    }).join('');
}

// Show create patient modal
function showCreatePatientModal() {
    // For now, just show a toast
    showToast('No tienes pacientes registrados. Por favor, crea uno desde el perfil.', 'warning');
}

// Logout
const logoutButton = document.getElementById('logoutButton');
if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
        stopBPMUpdates();
        await api.logout();
    });
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    stopBPMUpdates();
});
