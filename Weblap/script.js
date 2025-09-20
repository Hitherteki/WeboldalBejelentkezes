document.addEventListener('DOMContentLoaded', () => {
    // === VÁLTOZÓK ÉS ELEMEK ===
    const elements = {
        body: document.body,
        themeToggle: document.getElementById('themeToggle'),
        loginSection: document.getElementById('login-section'),
        registerBox: document.getElementById('register-box'),
        forgotPasswordBox: document.getElementById('forgot-password-box'),
        createAccountLink: document.getElementById('create-account-link'),
        forgotPasswordLink: document.getElementById('forgot-password-link'),
        backToLoginLinks: document.querySelectorAll('.back-to-login-link'),
        loginForm: document.getElementById('loginForm'),
        registerForm: document.getElementById('registerForm'),
        forgotPasswordForm: document.getElementById('forgotPasswordForm'),
        nextStepButton: document.getElementById('next-step'),
        prevStepButton: document.getElementById('prev-step'),
        passwordToggle: document.getElementById('password-toggle'),
        regPasswordToggle: document.getElementById('reg-password-toggle'),
        finalRegButton: document.getElementById('final-reg-button'),
    };
    
    // A látható panelek tömbje a könnyebb kezelhetőségért
    const panels = [elements.loginSection, elements.registerBox, elements.forgotPasswordBox];

    // Tematikus SVG ikonok a jelszó megjelenítéséhez
    const eyeOpenIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
    const eyeClosedIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

    let currentStep = 1;
    const totalSteps = 4;
    
    // === ÁLTALÁNOS FÜGGVÉNYEK ===

    // Egyszerűsített függvény a panelek megjelenítésére
    const showPanel = (panelToShow) => {
        panels.forEach(panel => {
            panel.classList.toggle('hidden', panel !== panelToShow);
        });
    };

    const applyThemeTransition = () => {
        const overlay = document.createElement('div');
        overlay.className = 'theme-transition-overlay';
        const rootStyle = getComputedStyle(document.documentElement);
        const lightLineColor = rootStyle.getPropertyValue('--light-line').trim();
        const darkLineColor = rootStyle.getPropertyValue('--dark-line').trim();
        const lineColor = elements.body.classList.contains('light-mode') ? darkLineColor : lightLineColor;
        overlay.style.setProperty('--line-color', lineColor);
        elements.body.appendChild(overlay);

        requestAnimationFrame(() => overlay.classList.add('animate'));

        setTimeout(() => elements.body.classList.toggle('light-mode'), 400);
        setTimeout(() => overlay.remove(), 800);
    };

    const showHexLoading = () => {
        const overlay = document.createElement('div');
        overlay.className = 'hex-loading-overlay';
        const hexRows = [1, 3, 5, 3, 1].map((hexCount, rowIndex) => 
            `<div class="hex-row">${Array.from({ length: hexCount }, (_, i) => 
                `<div class="hex" style="animation-delay: ${rowIndex * 0.15 + i * 0.05}s"></div>`
            ).join('')}</div>`
        ).join('');

        overlay.innerHTML = `
            <div class="hex-loading-container">
                <div class="hex-grid">${hexRows}</div>
                <div class="hex-loading-text">FELDOLGOZÁS</div>
            </div>`;
        
        elements.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('show'));

        const loadingTime = Math.random() * 2000 + 1500; // 1.5-3.5 másodperc
        return new Promise(resolve => {
            setTimeout(() => {
                overlay.classList.remove('show');
                setTimeout(() => {
                    overlay.remove();
                    resolve();
                }, 300);
            }, loadingTime);
        });
    };

    const showSuccessMessage = (message) => {
        return new Promise(resolve => {
            const overlay = document.createElement('div');
            overlay.className = 'panel success-message-box';
            overlay.innerHTML = `
                <p>${message}</p>
                <button class="btn btn-primary btn-auto">OK</button>`;
            
            elements.body.appendChild(overlay);
            requestAnimationFrame(() => overlay.classList.add('show'));

            overlay.querySelector('.btn-auto').addEventListener('click', () => {
                overlay.classList.remove('show');
                setTimeout(() => {
                    overlay.remove();
                    resolve();
                }, 300);
            }, { once: true });
        });
    };

    // === REGISZTRÁCIÓS LOGIKA ===

    const updateProgressBar = () => {
        document.querySelectorAll('.progress-step').forEach((stepEl, index) => {
            const stepNumber = index + 1;
            stepEl.classList.toggle('completed', stepNumber < currentStep);
            stepEl.classList.toggle('active', stepNumber === currentStep);
        });
        document.querySelectorAll('.progress-line').forEach((line, index) => {
            line.classList.toggle('completed', index + 1 < currentStep);
        });
    };
    
    // VALIDÁCIÓS FÜGGVÉNY: Csak a stílusokat módosítja
    const validateField = (field) => {
        const isValid = field.checkValidity();
        field.classList.toggle('invalid', !isValid);
        field.classList.toggle('valid', isValid && field.value.trim() !== '');
        return isValid;
    };

    const validateCurrentStep = () => {
        let isValid = true;
        const currentStepEl = document.getElementById(`step-${currentStep}`);
        if (!currentStepEl) return;

        currentStepEl.querySelectorAll('input, select').forEach(field => {
            if (field.hasAttribute('required')) {
                const fieldIsValid = validateField(field);
                if (!fieldIsValid) {
                    isValid = false;
                }
            }
        });

        // Külön jelszó validáció
        if (currentStep === 3) {
            const password = document.getElementById('reg-password');
            const confirmPassword = document.getElementById('reg-password-confirm');
            const passwordValid = password.checkValidity();
            const passwordsMatch = password.value === confirmPassword.value && password.value.trim() !== '';

            password.classList.toggle('valid', passwordValid);
            password.classList.toggle('invalid', !passwordValid);

            confirmPassword.classList.toggle('valid', passwordsMatch);
            confirmPassword.classList.toggle('invalid', !passwordsMatch);
            
            if (!passwordValid || !passwordsMatch) {
                isValid = false;
            }
        }
        
        if (currentStep === 4) {
            const allRequiredChecked = [...currentStepEl.querySelectorAll('input[required][type="checkbox"]')]
                                         .every(cb => cb.checked);
            elements.finalRegButton.classList.toggle('hidden', !allRequiredChecked);
        }
        
        if (currentStep < totalSteps) {
            elements.nextStepButton.classList.toggle('hidden', !isValid);
        }
    };
    
    const showStep = (stepNumber) => {
        document.querySelectorAll('.registration-step').forEach(step => step.classList.add('hidden'));
        document.getElementById(`step-${stepNumber}`)?.classList.remove('hidden');
        
        updateProgressBar();
        elements.prevStepButton.disabled = (stepNumber === 1);
        
        elements.nextStepButton.classList.add('hidden');
        
        const finalRegButtonContainer = document.querySelector('.final-registration');
        finalRegButtonContainer.classList.toggle('hidden', stepNumber !== totalSteps);
        
        validateCurrentStep();
    };

    const resetRegistrationForm = () => {
        currentStep = 1;
        elements.registerForm.reset();
        document.querySelectorAll('.invalid, .valid').forEach(el => el.classList.remove('invalid', 'valid'));
        showStep(currentStep);
    };
    
    // === ESEMÉNYFIGYELŐK ===
    elements.themeToggle.addEventListener('change', applyThemeTransition);

    elements.createAccountLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPanel(elements.registerBox);
        resetRegistrationForm();
    });

    elements.forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPanel(elements.forgotPasswordBox);
    });

    elements.backToLoginLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showPanel(elements.loginSection);
            if (elements.registerBox.contains(link)) {
                resetRegistrationForm();
            }
        });
    });

    elements.passwordToggle.addEventListener('click', () => {
        const passwordInput = document.getElementById('password');
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        elements.passwordToggle.innerHTML = type === 'password' ? eyeOpenIcon : eyeClosedIcon;
    });

    elements.regPasswordToggle.addEventListener('click', () => {
        const passwordInput = document.getElementById('reg-password');
        const confirmPasswordInput = document.getElementById('reg-password-confirm');
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        confirmPasswordInput.type = type;
        elements.regPasswordToggle.innerHTML = type === 'password' ? eyeOpenIcon : eyeClosedIcon;
    });

    elements.registerForm.addEventListener('input', validateCurrentStep);

    elements.nextStepButton.addEventListener('click', () => {
        if (currentStep < totalSteps) {
            currentStep++;
            showStep(currentStep);
        }
    });

    elements.prevStepButton.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            showStep(currentStep);
        }
    });

    elements.loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await showHexLoading();
        window.location.href = 'main.html';
    });

    elements.registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (currentStep !== totalSteps || elements.finalRegButton.classList.contains('hidden')) return;
        
        await showHexLoading();
        showPanel(elements.loginSection);
        await showSuccessMessage('Fiókját sikeresen regisztráltuk. Kérjük, jelentkezzen be. Ha módosítani szeretné adatait, azt a weboldal bal alsó sarkában, a profil fülön teheti meg.');
        resetRegistrationForm();
    });

    elements.forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await showHexLoading();
        await showSuccessMessage('Jelszó visszaállítási link elküldve az e-mail címére.');
        showPanel(elements.loginSection);
    });
    
    // Kezdő állapot beállítása
    elements.passwordToggle.innerHTML = eyeOpenIcon;
    elements.regPasswordToggle.innerHTML = eyeOpenIcon;
    showStep(currentStep);
});