document.addEventListener('DOMContentLoaded', () => {

    // --- DOM ELEMEK ---
    const ui = {
        body: document.body,
        loginPanel: document.getElementById('login-section'),
        registerPanel: document.getElementById('register-box'),
        forgotPassPanel: document.getElementById('forgot-password-box'),
        showRegisterLink: document.getElementById('create-account-link'),
        showForgotPassLink: document.getElementById('forgot-password-link'),
        backToLoginLinks: document.querySelectorAll('.back-to-login-link'),
        loginForm: document.getElementById('loginForm'),
        registerForm: document.getElementById('registerForm'),
        forgotPassForm: document.getElementById('forgotPasswordForm'),
        nextBtn: document.getElementById('next-step'),
        prevBtn: document.getElementById('prev-step'),
        loginEmailInput: document.getElementById('login-email'),
        loginPassInput: document.getElementById('password'),
        registerPassInput: document.getElementById('reg-password'),
        registerEmailInput: document.getElementById('reg-email'),
        loginPassToggle: document.getElementById('password-toggle'),
        registerPassToggle: document.getElementById('reg-password-toggle'),
        submitRegBtn: document.getElementById('final-reg-button'),
        themeSwitches: document.querySelectorAll('.theme-box'),
    };
    
    // --- ÁLLAPOT ÉS KONSTANSOK ---
    const allPanels = [ui.loginPanel, ui.registerPanel, ui.forgotPassPanel];
    const iconEyeOpen = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
    const iconEyeClosed = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
    let currentStep = 1;
    const totalSteps = 4;

    // --- FELÜLETKEZELŐ FÜGGVÉNYEK ---
    const showPanel = (panelToShow) => {
        allPanels.forEach(panel => panel.classList.toggle('hidden', panel !== panelToShow));
    };

    const showLoader = () => {
        const overlay = document.createElement('div');
        overlay.className = 'hex-loading-overlay';
        overlay.innerHTML = `<div class="hex-loading-container"><div class="hex-grid">${[1, 3, 5, 3, 1].map((hexCount, rowIndex) => `<div class="hex-row">${Array.from({ length: hexCount }, (_, i) => `<div class="hex" style="animation-delay: ${rowIndex * 0.15 + i * 0.05}s"></div>`).join('')}</div>`).join('')}</div><div class="hex-loading-text">FELDOLGOZÁS</div></div>`;
        ui.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('show'));

        return new Promise(resolve => {
            setTimeout(() => {
                overlay.classList.remove('show');
                setTimeout(() => {
                    overlay.remove();
                    resolve();
                }, 300);
            }, Math.random() * 2000 + 1500);
        });
    };

    const showSuccess = (message) => {
        return new Promise(resolve => {
            const overlay = document.createElement('div');
            overlay.className = 'panel success-message-box';
            overlay.innerHTML = `<p>${message}</p><button class="btn btn-primary btn-auto">OK</button>`;
            ui.body.appendChild(overlay);
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
    
    const showError = (message) => {
        return new Promise(resolve => {
            const overlay = document.createElement('div');
            overlay.className = 'panel success-message-box';
            overlay.innerHTML = `<p style="color: var(--invalid-color);">${message}</p><button class="btn btn-primary btn-auto" style="background-color: var(--invalid-color);">OK</button>`;
            ui.body.appendChild(overlay);
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

    // --- TÉMA KEZELÉS ---
    const setTheme = (themeName) => {
        ui.body.className = themeName;
        localStorage.setItem('selectedTheme', themeName);
    };

    const loadTheme = () => {
        const savedTheme = localStorage.getItem('selectedTheme') || 'theme-default';
        setTheme(savedTheme);
    };
    
    // --- REGISZTRÁCIÓS LOGIKA ---
    const updateProgress = () => {
        document.querySelectorAll('.progress-step').forEach((stepEl, index) => {
            stepEl.classList.toggle('completed', index + 1 < currentStep);
            stepEl.classList.toggle('active', index + 1 === currentStep);
        });
        document.querySelectorAll('.progress-line').forEach((line, index) => {
            line.classList.toggle('completed', index < currentStep - 1);
        });
    };
    
    const validate = (field) => {
        const isValid = field.checkValidity();
        field.classList.toggle('invalid', !isValid);
        field.classList.toggle('valid', isValid && field.value.trim() !== '');
        return isValid;
    };

    const validateStep = () => {
        let isStepValid = true;
        const currentStepEl = document.getElementById(`step-${currentStep}`);
        currentStepEl.querySelectorAll('input[required], select[required]').forEach(field => {
            if (!validate(field)) isStepValid = false;
        });

        if (currentStep === 3) {
            const pass = ui.registerPassInput;
            const confirmPass = document.getElementById('reg-password-confirm');
            const passMatch = pass.value === confirmPass.value && pass.value.trim() !== '';
            confirmPass.classList.toggle('valid', passMatch);
            confirmPass.classList.toggle('invalid', !passMatch);
            if (!pass.checkValidity() || !passMatch) isStepValid = false;
        }
        
        if (currentStep === 4) {
            const allChecked = [...currentStepEl.querySelectorAll('input[required][type="checkbox"]')]
                               .every(cb => cb.checked);
            ui.submitRegBtn.classList.toggle('hidden', !allChecked);
        }

        if (currentStep < totalSteps) {
            ui.nextBtn.disabled = !isStepValid;
        } else {
            ui.nextBtn.disabled = true;
        }
    };
    
    const showStep = (step) => {
    document.querySelectorAll('.registration-step').forEach(s => s.classList.add('hidden'));
    document.getElementById(`step-${step}`)?.classList.remove('hidden');
    updateProgress();
    ui.prevBtn.disabled = (step === 1);
    ui.nextBtn.classList.toggle('hidden', step === totalSteps);
    document.querySelector('.final-registration').classList.toggle('hidden', step !== totalSteps);
    validateStep();
};


    const resetRegisterForm = () => {
        currentStep = 1;
        ui.registerForm.reset();
        document.querySelectorAll('.invalid, .valid').forEach(el => el.classList.remove('invalid', 'valid'));
        showStep(currentStep);
    };
    
    // --- ESEMÉNYKEZELŐK ---
    ui.showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPanel(ui.registerPanel);
        resetRegisterForm();
    });

    ui.showForgotPassLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPanel(ui.forgotPassPanel);
    });

    ui.backToLoginLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showPanel(ui.loginPanel);
            if (ui.registerPanel.contains(link)) resetRegisterForm();
        });
    });

    ui.loginPassToggle.addEventListener('click', () => {
        const passInput = ui.loginPassInput;
        const type = passInput.type === 'password' ? 'text' : 'password';
        passInput.type = type;
        ui.loginPassToggle.innerHTML = type === 'password' ? iconEyeOpen : iconEyeClosed;
    });

    ui.registerPassToggle.addEventListener('click', () => {
        const passInputs = [ui.registerPassInput, document.getElementById('reg-password-confirm')];
        const type = passInputs[0].type === 'password' ? 'text' : 'password';
        passInputs.forEach(input => input.type = type);
        ui.registerPassToggle.innerHTML = type === 'password' ? iconEyeOpen : iconEyeClosed;
    });
    
    ui.themeSwitches.forEach(box => {
        box.addEventListener('click', () => setTheme(box.dataset.theme));
    });

    ui.registerForm.addEventListener('input', validateStep);

    ui.nextBtn.addEventListener('click', () => {
        if (currentStep < totalSteps) showStep(++currentStep);
    });

    ui.prevBtn.addEventListener('click', () => {
        if (currentStep > 1) showStep(--currentStep);
    });

    ui.loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await showLoader();

        const email = ui.loginEmailInput.value;
        const password = ui.loginPassInput.value;
        const storedUser = localStorage.getItem(email);

        if (storedUser) {
            const userData = JSON.parse(storedUser);
            if (userData.password === password) {
                window.location.href = 'main.html';
            } else {
                await showError('Helytelen jelszó!');
            }
        } else {
            await showError('Ez az e-mail cím nincs regisztrálva!');
        }
    });

    ui.registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (currentStep !== totalSteps || ui.submitRegBtn.classList.contains('hidden')) return;
        
        const email = ui.registerEmailInput.value;
        const password = ui.registerPassInput.value;
        const userDetails = { password: password };

        localStorage.setItem(email, JSON.stringify(userDetails));

        await showLoader();
        showPanel(ui.loginPanel);
        await showSuccess('Fiókját sikeresen regisztráltuk. Kérjük, jelentkezzen be.');
        resetRegisterForm();
    });

    ui.forgotPassForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await showLoader();
        await showSuccess('Jelszó visszaállítási link elküldve az e-mail címére.');
        showPanel(ui.loginPanel);
    });
    
    // --- INICIALIZÁLÁS ---
    loadTheme();
    ui.loginPassToggle.innerHTML = iconEyeOpen;
    ui.registerPassToggle.innerHTML = iconEyeOpen;
    showStep(currentStep);
});