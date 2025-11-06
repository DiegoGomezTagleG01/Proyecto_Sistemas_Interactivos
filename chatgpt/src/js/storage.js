class Storage {
    static DB_NAME = 'LearningApp';
    static DB_VERSION = 1;

    static init() {
        // Inicializar IndexedDB si es necesario
        if (!window.indexedDB) {
            console.warn('IndexedDB no está soportado, usando localStorage');
        }
    }

    // Gestión de usuarios
    static registerUser(username, email, password) {
        const users = this.getUsers();
        
        // Verificar si el usuario ya existe
        if (users.find(u => u.username === username)) {
            return { success: false, message: 'El nombre de usuario ya existe' };
        }
        
        if (users.find(u => u.email === email)) {
            return { success: false, message: 'El email ya está registrado' };
        }

        const newUser = {
            id: this.generateId(),
            username: username,
            email: email,
            password: this.hashPassword(password), // En un caso real, usaríamos un hash seguro
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        return { success: true, user: newUser };
    }

    static authenticateUser(username, password) {
        const users = this.getUsers();
        const hashedPassword = this.hashPassword(password);
        
        return users.find(u => 
            (u.username === username || u.email === username) && 
            u.password === hashedPassword
        );
    }

    static getUsers() {
        return JSON.parse(localStorage.getItem('users') || '[]');
    }

    // Gestión de sesión
    static setCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    static getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser') || 'null');
    }

    static clearCurrentUser() {
        localStorage.removeItem('currentUser');
    }

    // Gestión de progreso
    static getUserProgress(userId) {
        return JSON.parse(localStorage.getItem(`user_progress_${userId}`) || 'null');
    }

    static saveUserProgress(userId, progress) {
        localStorage.setItem(`user_progress_${userId}`, JSON.stringify(progress));
    }

    // Configuración de usuario
    static getUserSettings(userId) {
        return JSON.parse(localStorage.getItem(`user_settings_${userId}`) || '{}');
    }

    static saveUserSettings(userId, settings) {
        localStorage.setItem(`user_settings_${userId}`, JSON.stringify(settings));
    }

    // Utilidades
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    static hashPassword(password) {
        // En una aplicación real, usaríamos una librería de hashing segura
        // Esta es solo una simulación básica
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convertir a 32-bit integer
        }
        return hash.toString();
    }

    // Limpieza de datos (para desarrollo)
    static clearAllData() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('user_') || key === 'users') {
                localStorage.removeItem(key);
            }
        });
    }
}

// Inicializar el almacenamiento al cargar
Storage.init();