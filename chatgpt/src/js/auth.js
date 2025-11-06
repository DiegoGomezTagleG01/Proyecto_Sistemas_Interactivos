class Auth {
    static showLoginForm() {
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('registerForm').classList.add('hidden');
        UI.showModal('authModal');
    }

    static showRegisterForm() {
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('registerForm').classList.remove('hidden');
        UI.showModal('authModal');
    }

    static handleLogin() {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        if (!username || !password) {
            UI.showNotification('Por favor, completa todos los campos', 'error');
            return;
        }

        const user = Storage.authenticateUser(username, password);
        if (user) {
            Storage.setCurrentUser(user);
            window.app.currentUser = user;
            UI.updateUserInterface(user);
            UI.hideModal('authModal');
            UI.showNotification(`¡Bienvenido de nuevo, ${user.username}!`, 'success');
            
            // Limpiar formulario
            document.getElementById('loginForm').reset();
        } else {
            UI.showNotification('Usuario o contraseña incorrectos', 'error');
        }
    }

    static handleRegister() {
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        if (!username || !email || !password) {
            UI.showNotification('Por favor, completa todos los campos', 'error');
            return;
        }

        if (password.length < 6) {
            UI.showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }

        const result = Storage.registerUser(username, email, password);
        if (result.success) {
            Storage.setCurrentUser(result.user);
            window.app.currentUser = result.user;
            UI.updateUserInterface(result.user);
            UI.hideModal('authModal');
            UI.showNotification(`¡Cuenta creada exitosamente! Bienvenido, ${username}`, 'success');
            
            // Limpiar formulario
            document.getElementById('registerForm').reset();
            
            // Inicializar progreso para el nuevo usuario
            const initialProgress = {
                spelling: { level: 1, score: 0, exercisesCompleted: 0, accuracy: 0 },
                handwriting: { level: 1, lettersMastered: [], practiceCount: 0 },
                achievements: ['primer_ejercicio']
            };
            Storage.saveUserProgress(result.user.id, initialProgress);
        } else {
            UI.showNotification(result.message, 'error');
        }
    }

    static logout() {
        Storage.clearCurrentUser();
        window.app.currentUser = null;
        UI.updateUserInterface(null);
        UI.showNotification('Sesión cerrada correctamente', 'info');
        window.app.showSection('home');
    }
}