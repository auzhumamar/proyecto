// Authentication logic for login and register pages

// Check if already authenticated
if (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) {
    requireGuest();
}

// Dark mode toggle
document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
        });

        // Load dark mode preference
        if (localStorage.getItem('darkMode') === 'true') {
            document.documentElement.classList.add('dark');
        }
    }
});

// ============ LOGIN PAGE ============
if (window.location.pathname.includes('login.html')) {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    // Toggle password visibility
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            togglePassword.querySelector('span').textContent = type === 'password' ? 'visibility' : 'visibility_off';
        });
    }

    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;

            // Validate email
            if (!isValidEmail(email)) {
                showToast('Por favor, ingresa un email válido', 'error');
                return;
            }

            const button = document.getElementById('loginButton');
            showLoading(button);

            try {
                const result = await api.login(email, password);

                if (result.success) {
                    // Store tokens
                    localStorage.setItem('accessToken', result.data.accessToken);
                    localStorage.setItem('refreshToken', result.data.refreshToken);
                    localStorage.setItem('user', JSON.stringify(result.data.user));

                    if (rememberMe) {
                        localStorage.setItem('rememberMe', 'true');
                    }

                    showToast('¡Inicio de sesión exitoso!', 'success');

                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 500);
                }
            } catch (error) {
                showToast(error.message || 'Error al iniciar sesión', 'error');
            } finally {
                hideLoading(button);
            }
        });
    }

    // Google login
    const googleLoginButton = document.getElementById('googleLoginButton');
    console.log('Google Login Button:', googleLoginButton); // DEBUG
    if (googleLoginButton) {
        googleLoginButton.addEventListener('click', () => {
            console.log('Google button clicked!'); // DEBUG
            // Check if Google Sign-In is loaded
            if (typeof google === 'undefined' || !google.accounts) {
                console.error('Google Sign-In library not loaded');
                showToast('Google Sign-In no está disponible. Por favor, recarga la página.', 'error');
                return;
            }

            try {
                console.log('Initializing Google Sign-In...'); // DEBUG
                // Initialize Google Sign-In
                google.accounts.id.initialize({
                    client_id: '128530415849-a4uhfnp9b1rsgmsi39qkjqd0a4mh8mjn.apps.googleusercontent.com',
                    callback: handleGoogleLogin
                });

                google.accounts.id.prompt();
            } catch (error) {
                console.error('Error initializing Google Sign-In:', error);
                showToast('Error al inicializar Google Sign-In', 'error');
            }
        });
        console.log('Event listener attached to Google button'); // DEBUG
    }

    async function handleGoogleLogin(response) {
        const button = document.getElementById('googleLoginButton');
        showLoading(button);

        try {
            const result = await api.googleLogin(response.credential);

            if (result.success) {
                localStorage.setItem('accessToken', result.data.accessToken);
                localStorage.setItem('refreshToken', result.data.refreshToken);
                localStorage.setItem('user', JSON.stringify(result.data.user));

                showToast('¡Inicio de sesión con Google exitoso!', 'success');

                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 500);
            }
        } catch (error) {
            showToast(error.message || 'Error al iniciar sesión con Google', 'error');
        } finally {
            hideLoading(button);
        }
    }
}

// ============ REGISTER PAGE ============
if (window.location.pathname.includes('register.html')) {
    const registerForm = document.getElementById('registerForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    // Toggle password visibility
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            confirmPasswordInput.type = type;
            togglePassword.querySelector('span').textContent = type === 'password' ? 'visibility' : 'visibility_off';
        });
    }

    // Password strength indicator
    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            const strengthDiv = document.getElementById('passwordStrength');

            if (password.length > 0) {
                strengthDiv.classList.remove('hidden');

                // Check length
                const lengthCheck = document.getElementById('lengthCheck');
                if (password.length >= 8) {
                    lengthCheck.textContent = '✓ Mínimo 8 caracteres';
                    lengthCheck.classList.remove('text-slate-400');
                    lengthCheck.classList.add('text-emerald-600');
                } else {
                    lengthCheck.textContent = '✗ Mínimo 8 caracteres';
                    lengthCheck.classList.remove('text-emerald-600');
                    lengthCheck.classList.add('text-slate-400');
                }

                // Check uppercase
                const uppercaseCheck = document.getElementById('uppercaseCheck');
                if (/[A-Z]/.test(password)) {
                    uppercaseCheck.textContent = '✓ Una letra mayúscula';
                    uppercaseCheck.classList.remove('text-slate-400');
                    uppercaseCheck.classList.add('text-emerald-600');
                } else {
                    uppercaseCheck.textContent = '✗ Una letra mayúscula';
                    uppercaseCheck.classList.remove('text-emerald-600');
                    uppercaseCheck.classList.add('text-slate-400');
                }

                // Check number
                const numberCheck = document.getElementById('numberCheck');
                if (/\d/.test(password)) {
                    numberCheck.textContent = '✓ Un número';
                    numberCheck.classList.remove('text-slate-400');
                    numberCheck.classList.add('text-emerald-600');
                } else {
                    numberCheck.textContent = '✗ Un número';
                    numberCheck.classList.remove('text-emerald-600');
                    numberCheck.classList.add('text-slate-400');
                }

                // Check symbol
                const symbolCheck = document.getElementById('symbolCheck');
                if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
                    symbolCheck.textContent = '✓ Un símbolo especial';
                    symbolCheck.classList.remove('text-slate-400');
                    symbolCheck.classList.add('text-emerald-600');
                } else {
                    symbolCheck.textContent = '✗ Un símbolo especial';
                    symbolCheck.classList.remove('text-emerald-600');
                    symbolCheck.classList.add('text-slate-400');
                }
            } else {
                strengthDiv.classList.add('hidden');
            }
        });
    }

    // Register form submission
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const fullName = document.getElementById('fullName').value;
            const birthDate = document.getElementById('birthDate').value;
            const gender = document.getElementById('gender').value;
            const terms = document.getElementById('terms').checked;

            // Validation
            if (!terms) {
                showToast('Debes aceptar los términos y condiciones', 'warning');
                return;
            }

            if (!isValidEmail(email)) {
                showToast('Por favor, ingresa un email válido', 'error');
                return;
            }

            if (password !== confirmPassword) {
                showToast('Las contraseñas no coinciden', 'error');
                return;
            }

            // Password validation
            const passwordValidation = validatePassword(password);
            if (!passwordValidation.valid) {
                showToast(passwordValidation.errors[0], 'error');
                return;
            }

            const button = document.getElementById('registerButton');
            showLoading(button);

            try {
                const result = await api.register(email, password, fullName, birthDate, gender);

                if (result.success) {
                    showToast('¡Registro exitoso! Revisa tu correo para el código de verificación.', 'success');

                    // Store email for verification page
                    sessionStorage.setItem('pendingVerificationEmail', email);

                    setTimeout(() => {
                        window.location.href = 'verify.html';
                    }, 1500);
                }
            } catch (error) {
                showToast(error.message || 'Error al registrarse', 'error');
            } finally {
                hideLoading(button);
            }
        });
    }

    // Google register
    const googleRegisterButton = document.getElementById('googleRegisterButton');
    if (googleRegisterButton) {
        googleRegisterButton.addEventListener('click', () => {
            // Check if Google Sign-In is loaded
            if (typeof google === 'undefined' || !google.accounts) {
                showToast('Google Sign-In no está disponible. Por favor, recarga la página.', 'error');
                console.error('Google Sign-In library not loaded');
                return;
            }

            try {
                google.accounts.id.initialize({
                    client_id: '128530415849-a4uhfnp9b1rsgmsi39qkjqd0a4mh8mjn.apps.googleusercontent.com',
                    callback: handleGoogleRegister
                });

                google.accounts.id.prompt();
            } catch (error) {
                console.error('Error initializing Google Sign-In:', error);
                showToast('Error al inicializar Google Sign-In', 'error');
            }
        });
    }

    async function handleGoogleRegister(response) {
        const button = document.getElementById('googleRegisterButton');
        showLoading(button);

        try {
            const result = await api.googleLogin(response.credential);

            if (result.success) {
                localStorage.setItem('accessToken', result.data.accessToken);
                localStorage.setItem('refreshToken', result.data.refreshToken);
                localStorage.setItem('user', JSON.stringify(result.data.user));

                showToast('¡Registro con Google exitoso!', 'success');

                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 500);
            }
        } catch (error) {
            showToast(error.message || 'Error al registrarse con Google', 'error');
        } finally {
            hideLoading(button);
        }
    }
}
