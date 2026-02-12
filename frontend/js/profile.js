// Profile page logic

// Require authentication
if (!requireAuth()) {
    throw new Error('Not authenticated');
}

let currentUser = null;
let userPatients = [];

// Initialize profile page
document.addEventListener('DOMContentLoaded', async () => {
    await loadUserProfile();
    setupEventListeners();
});

// Load user profile
async function loadUserProfile() {
    currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = '/frontend/login.html';
        return;
    }

    // Display user info
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('profileRole').textContent = currentUser.role === 'admin' ? 'Administrador' : 'Usuario';
    document.getElementById('profileVerified').textContent = currentUser.is_verified ? 'Verificado' : 'No verificado';
    document.getElementById('profileCreated').textContent = formatDate(currentUser.created_at);
}


// Setup event listeners
function setupEventListeners() {
    // Logout button
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                await api.logout();
            }
        });
    }

}

