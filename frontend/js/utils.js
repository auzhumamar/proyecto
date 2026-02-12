// Utility functions

// Show toast notification
function showToast(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast-notification fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-0 ${type === 'success' ? 'bg-emerald-500' :
        type === 'error' ? 'bg-red-500' :
            type === 'warning' ? 'bg-amber-500' :
                'bg-blue-500'
        } text-white font-medium`;

    toast.textContent = message;
    document.body.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(400px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Show loading spinner
function showLoading(button) {
    button.disabled = true;
    button.dataset.originalText = button.innerHTML;
    button.innerHTML = `
        <svg class="animate-spin h-5 w-5 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    `;
}

// Hide loading spinner
function hideLoading(button) {
    button.disabled = false;
    if (button.dataset.originalText) {
        button.innerHTML = button.dataset.originalText;
        delete button.dataset.originalText;
    }
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate password strength
function validatePassword(password) {
    const errors = [];

    if (password.length < 8) {
        errors.push('La contraseña debe tener al menos 8 caracteres');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Debe contener al menos una mayúscula');
    }

    if (!/\d/.test(password)) {
        errors.push('Debe contener al menos un número');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Debe contener al menos un símbolo especial');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Format time ago
function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Hace un momento';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} minutos`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} horas`;
    if (seconds < 604800) return `Hace ${Math.floor(seconds / 86400)} días`;

    return formatDate(dateString);
}

// Check if user is authenticated
function isAuthenticated() {
    return !!localStorage.getItem('accessToken');
}

// Get current user
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Redirect if not authenticated
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = '/frontend/login.html';
        return false;
    }
    return true;
}

// Redirect if authenticated
function requireGuest() {
    if (isAuthenticated()) {
        window.location.href = '/frontend/dashboard.html';
        return false;
    }
    return true;
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Format BPM with color
function getBPMStatus(bpm) {
    if (bpm < 60) return { status: 'Bradicardia', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (bpm > 100) return { status: 'Taquicardia', color: 'text-red-600', bg: 'bg-red-50' };
    return { status: 'Normal', color: 'text-emerald-600', bg: 'bg-emerald-50' };
}
