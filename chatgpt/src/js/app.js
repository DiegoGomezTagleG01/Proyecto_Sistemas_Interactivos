class LearningApp {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'home';
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.setupEventListeners();
        this.loadUserProgress();
        this.showSection('home');
        this.setupScoreModal();
    }

    checkAuthStatus() {
        const user = Storage.getCurrentUser();
        if (user) {
            this.currentUser = user;
            UI.updateUserInterface(user);
        }
    }

     setupEventListeners() {
        // Navegación
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.getAttribute('href').substring(1);
                this.showSection(section);
            });
        });

        // Botones del hero
        document.querySelectorAll('.hero-buttons .btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.closest('.btn').dataset.section;
                this.showSection(section);
            });
        });

        // Modal de autenticación
        document.getElementById('loginBtn').addEventListener('click', () => {
            Auth.showLoginForm();
        });

        document.getElementById('registerBtn').addEventListener('click', () => {
            Auth.showRegisterForm();
        });

        document.getElementById('logoutBtn').addEventListener('click', () => {
            Auth.logout();
            this.currentUser = null;
        });

        // Cambio entre login/register
        document.getElementById('showRegister').addEventListener('click', (e) => {
            e.preventDefault();
            Auth.showRegisterForm();
        });

        document.getElementById('showLogin').addEventListener('click', (e) => {
            e.preventDefault();
            Auth.showLoginForm();
        });

        // Cerrar modales
        this.setupModalCloseEvents();

        // Forms de autenticación
        document.querySelector('#loginForm form').addEventListener('submit', (e) => {
            e.preventDefault();
            Auth.handleLogin();
        });

        document.querySelector('#registerForm form').addEventListener('submit', (e) => {
            e.preventDefault();
            Auth.handleRegister();
        });
    }

    setupModalCloseEvents() {
        // Cerrar modal de autenticación
        document.querySelector('#authModal .close-modal').addEventListener('click', () => {
            UI.hideModal('authModal');
        });

        // Cerrar modal de puntuación
        document.querySelector('#scoreModal .close-modal').addEventListener('click', () => {
            UI.hideModal('scoreModal');
        });

        // Cerrar modales al hacer click fuera
        window.addEventListener('click', (e) => {
            const authModal = document.getElementById('authModal');
            const scoreModal = document.getElementById('scoreModal');
            
            if (e.target === authModal) {
                UI.hideModal('authModal');
            }
            if (e.target === scoreModal) {
                UI.hideModal('scoreModal');
            }
        });
    }

    setupScoreModal() {
    const practiceAgainBtn = document.getElementById('practiceAgain');
    const nextLetterBtn = document.getElementById('nextLetterBtn');

    if (practiceAgainBtn) {
        practiceAgainBtn.addEventListener('click', () => {
            UI.hideModal('scoreModal');
            if (typeof HandwritingModule !== 'undefined') {
                HandwritingModule.clearCanvas();
                HandwritingModule.startPracticeTimer();
            }
        });
    }

    if (nextLetterBtn) {
        nextLetterBtn.addEventListener('click', () => {
            UI.hideModal('scoreModal');
            if (typeof HandwritingModule !== 'undefined') {
                HandwritingModule.nextRandomLetter();
                HandwritingModule.clearCanvas();
                HandwritingModule.startPracticeTimer();
            }
        });
    }
}

    showSection(sectionName) {
        // Ocultar todas las secciones
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Remover active de todos los links de navegación
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Mostrar sección seleccionada
        document.getElementById(sectionName).classList.add('active');
        
        // Activar link de navegación correspondiente
        const correspondingLink = document.querySelector(`.nav-link[href="#${sectionName}"]`);
        if (correspondingLink) {
            correspondingLink.classList.add('active');
        }

        this.currentSection = sectionName;

        // Inicializar módulos específicos
        this.initializeSectionModules(sectionName);
    }

    initializeSectionModules(sectionName) {
        switch(sectionName) {
            case 'spelling':
                if (typeof SpellingModule !== 'undefined') {
                    SpellingModule.init();
                }
                break;
            case 'handwriting':
                if (typeof HandwritingModule !== 'undefined') {
                    HandwritingModule.init();
                    HandwritingModule.startPracticeTimer();
                }
                break;
            case 'progress':
                this.loadProgressData();
                break;
        }
    }

    loadUserProgress() {
        if (this.currentUser) {
            const progress = Storage.getUserProgress(this.currentUser.id);
            if (progress) {
                this.updateProgressUI(progress);
            }
        }
    }

    loadProgressData() {
        if (!this.currentUser) {
            document.getElementById('progressStats').innerHTML = `
                <div class="text-center">
                    <p>Inicia sesión para ver tu progreso</p>
                    <button class="btn btn-primary" onclick="Auth.showLoginForm()">Iniciar Sesión</button>
                </div>
            `;
            return;
        }

        const progress = Storage.getUserProgress(this.currentUser.id);
        this.updateProgressUI(progress);
    }

    updateProgressUI(progress) {
        const spelling = progress.spelling || { level: 1, score: 0, exercisesCompleted: 0, accuracy: 0 };
        const handwriting = progress.handwriting || { level: 1, lettersMastered: [], practiceCount: 0 };

        document.getElementById('progressStats').innerHTML = `
            <div class="progress-cards">
                <div class="progress-card">
                    <h3>Ortografía</h3>
                    <div class="progress-item">
                        <span>Nivel:</span>
                        <span>${spelling.level}</span>
                    </div>
                    <div class="progress-item">
                        <span>Puntuación:</span>
                        <span>${spelling.score}</span>
                    </div>
                    <div class="progress-item">
                        <span>Ejercicios completados:</span>
                        <span>${spelling.exercisesCompleted}</span>
                    </div>
                    <div class="progress-item">
                        <span>Precisión:</span>
                        <span>${(spelling.accuracy * 100).toFixed(1)}%</span>
                    </div>
                </div>
                <div class="progress-card">
                    <h3>Caligrafía</h3>
                    <div class="progress-item">
                        <span>Nivel:</span>
                        <span>${handwriting.level}</span>
                    </div>
                    <div class="progress-item">
                        <span>Letras dominadas:</span>
                        <span>${handwriting.lettersMastered.length}</span>
                    </div>
                    <div class="progress-item">
                        <span>Sesiones de práctica:</span>
                        <span>${handwriting.practiceCount}</span>
                    </div>
                </div>
            </div>
        `;
    }

    updateUserProgress(module, data) {
        if (!this.currentUser) return;

        const progress = Storage.getUserProgress(this.currentUser.id) || {
            spelling: { level: 1, score: 0, exercisesCompleted: 0, accuracy: 0 },
            handwriting: { level: 1, lettersMastered: [], practiceCount: 0 },
            achievements: []
        };

        // Actualizar progreso según el módulo
        if (module === 'spelling') {
            progress.spelling = { ...progress.spelling, ...data };
        } else if (module === 'handwriting') {
            progress.handwriting = { ...progress.handwriting, ...data };
        }

        Storage.saveUserProgress(this.currentUser.id, progress);
        this.updateProgressUI(progress);
        
    }
    static showScore(score, details = {}) {
        UI.showScoreModal(score, details);
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new LearningApp();
});

