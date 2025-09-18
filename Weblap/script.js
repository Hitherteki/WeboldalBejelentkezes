document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    const loginSection = document.getElementById('login-section');
    const registerBox = document.getElementById('register-box');
    const forgotPasswordBox = document.getElementById('forgot-password-box');

    const createAccountLink = document.getElementById('create-account-link');
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const backToLoginFromReg = document.getElementById('back-to-login-from-reg');
    const backToLoginFromForgot = document.getElementById('back-to-login-from-forgot');

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');

    // Theme loading from memory instead of localStorage
    let currentTheme = 'dark'; // Default theme

    const applyThemeTransition = () => {
        const overlay = document.createElement('div');
        overlay.classList.add('theme-transition-overlay');
        
        const rootStyle = getComputedStyle(document.documentElement);
        const lightLineColor = rootStyle.getPropertyValue('--light-line').trim();
        const darkLineColor = rootStyle.getPropertyValue('--dark-line').trim();

        const lineColor = body.classList.contains('light-mode') ? darkLineColor : lightLineColor;
        overlay.style.setProperty('--line-color', lineColor);
        
        document.body.appendChild(overlay);

        requestAnimationFrame(() => {
            overlay.classList.add('animate');
        });

        setTimeout(() => {
            body.classList.toggle('light-mode');
            currentTheme = body.classList.contains('light-mode') ? 'light' : 'dark';
        }, parseFloat(rootStyle.getPropertyValue('--transition')) * 1000 / 2);

        setTimeout(() => {
            if (overlay) {
                overlay.remove();
            }
        }, parseFloat(rootStyle.getPropertyValue('--transition')) * 1000);
    };
    
    themeToggle.addEventListener('change', applyThemeTransition);

    createAccountLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginSection.classList.add('hidden');
        registerBox.classList.remove('hidden');
    });

    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginSection.classList.add('hidden');
        forgotPasswordBox.classList.remove('hidden');
    });

    backToLoginFromReg.addEventListener('click', (e) => {
        e.preventDefault();
        registerBox.classList.add('hidden');
        loginSection.classList.remove('hidden');
    });

    backToLoginFromForgot.addEventListener('click', (e) => {
        e.preventDefault();
        forgotPasswordBox.classList.add('hidden');
        loginSection.classList.remove('hidden');
    });

    const getRandomLoadingTime = () => {
        return Math.floor(Math.random() * (7000 - 3000 + 1)) + 3000; 
    };

    const showHexLoading = () => {
        const overlay = document.createElement('div');
        overlay.classList.add('hex-loading-overlay');
        
        const container = document.createElement('div');
        container.classList.add('hex-loading-container');
        
        const hexGrid = document.createElement('div');
        hexGrid.classList.add('hex-grid');
        
        for (let i = 0; i < 25; i++) {
            const hex = document.createElement('div');
            hex.classList.add('hex');
            hexGrid.appendChild(hex);
        }
        
        const loadingText = document.createElement('div');
        loadingText.classList.add('hex-loading-text');
        loadingText.textContent = 'FELDOLGOZÁS';
        
        container.appendChild(hexGrid);
        container.appendChild(loadingText);
        overlay.appendChild(container);
        document.body.appendChild(overlay);
        
        requestAnimationFrame(() => {
            overlay.classList.add('show');
        });
        
        const loadingTime = getRandomLoadingTime();
        
        return new Promise((resolve) => {
            setTimeout(() => {
                overlay.classList.remove('show');
                setTimeout(() => {
                    if (overlay.parentNode) {
                        overlay.parentNode.removeChild(overlay);
                    }
                    resolve();
                }, 300);
            }, loadingTime);
        });
    };

    const redirectToMainPage = () => {
        window.location.href = 'main.html';
    };

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await showHexLoading();
        redirectToMainPage();
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await showHexLoading();
        registerBox.classList.add('hidden');
        loginSection.classList.remove('hidden');
    });

    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await showHexLoading();
        forgotPasswordBox.classList.add('hidden');
        loginSection.classList.remove('hidden');
    });
});