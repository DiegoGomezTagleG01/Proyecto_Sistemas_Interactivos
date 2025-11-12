class Storage {
    static DB_NAME = 'LearningApp';
    static DB_VERSION = 1;

    static init() {
        // Inicializar IndexedDB si es necesario
        if (!window.indexedDB) {
            console.warn('IndexedDB no está soportado, usando localStorage');
        }
        
        // Inicializar estructura para logros si no existe
        this.initAchievementsStructure();
    }

    static initAchievementsStructure() {
        // Inicializar historial de logros si no existe
        if (!localStorage.getItem('achievementsHistory')) {
            localStorage.setItem('achievementsHistory', JSON.stringify({}));
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

        // Inicializar progreso del usuario
        this.initializeUserProgress(newUser.id);

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
        const progress = JSON.parse(localStorage.getItem(`user_progress_${userId}`) || 'null');
        
        // Si no existe progreso, inicializarlo
        if (!progress) {
            return this.initializeUserProgress(userId);
        }
        
        return progress;
    }

    static saveUserProgress(userId, progress) {
        localStorage.setItem(`user_progress_${userId}`, JSON.stringify(progress));
    }

    static initializeUserProgress(userId) {
        const defaultProgress = {
            spelling: { 
                level: 1, 
                score: 0, 
                exercisesCompleted: 0, 
                accuracy: 0,
                perfectRuns: 0,
                consecutiveCorrect: 0
            },
            handwriting: { 
                level: 1, 
                lettersMastered: [], 
                practiceCount: 0, 
                sessionMastered: 0 
            },
            general: { 
                firstLogin: true, 
                consecutiveDays: 1, 
                lastPracticeDate: new Date().toISOString(),
                totalPracticeTime: 0
            },
            achievements: []
        };
        
        this.saveUserProgress(userId, defaultProgress);
        return defaultProgress;
    }

    // Gestión de logros
    static saveAchievementsHistory(history) {
        localStorage.setItem('achievementsHistory', JSON.stringify(history));
    }

    static getAchievementsHistory() {
        return JSON.parse(localStorage.getItem('achievementsHistory')) || {};
    }

    static updateUserAchievements(userId, achievements) {
        const userProgress = this.getUserProgress(userId);
        userProgress.achievements = achievements;
        this.saveUserProgress(userId, userProgress);
    }

    static getUserAchievements(userId) {
        const achievementsHistory = this.getAchievementsHistory();
        return achievementsHistory[userId] || [];
    }

    static addUnlockedAchievement(userId, achievement) {
        const achievementsHistory = this.getAchievementsHistory();
        
        if (!achievementsHistory[userId]) {
            achievementsHistory[userId] = [];
        }
        
        // Verificar si el logro ya existe para evitar duplicados
        const existingAchievement = achievementsHistory[userId].find(a => a.id === achievement.id);
        if (!existingAchievement) {
            achievementsHistory[userId].push({
                id: achievement.id,
                title: achievement.title,
                description: achievement.description,
                icon: achievement.icon,
                unlockedAt: new Date().toISOString()
            });
            
            this.saveAchievementsHistory(achievementsHistory);
            
            // Actualizar también en el progreso del usuario
            const userProgress = this.getUserProgress(userId);
            if (!userProgress.achievements.includes(achievement.id)) {
                userProgress.achievements.push(achievement.id);
                this.saveUserProgress(userId, userProgress);
            }
            
            return true;
        }
        
        return false;
    }

    // Gestión de estadísticas de logros
    static getAchievementsStats(userId) {
        const unlockedAchievements = this.getUserAchievements(userId);
        const totalAchievements = 12; // Total de logros definidos en achievements.js
        
        return {
            unlocked: unlockedAchievements.length,
            total: totalAchievements,
            progress: Math.round((unlockedAchievements.length / totalAchievements) * 100)
        };
    }

    // Configuración de usuario
    static getUserSettings(userId) {
        return JSON.parse(localStorage.getItem(`user_settings_${userId}`) || '{}');
    }

    static saveUserSettings(userId, settings) {
        localStorage.setItem(`user_settings_${userId}`, JSON.stringify(settings));
    }

    // Gestión de sesiones de práctica
    static updatePracticeSession(userId, module, duration) {
        const progress = this.getUserProgress(userId);
        
        // Actualizar fecha de última práctica
        progress.general.lastPracticeDate = new Date().toISOString();
        
        // Actualizar tiempo total de práctica
        progress.general.totalPracticeTime = (progress.general.totalPracticeTime || 0) + duration;
        
        // Verificar días consecutivos
        this.updateConsecutiveDays(progress);
        
        this.saveUserProgress(userId, progress);
    }

    static updateConsecutiveDays(progress) {
        const today = new Date().toDateString();
        const lastPracticeDate = new Date(progress.general.lastPracticeDate).toDateString();
        
        if (lastPracticeDate === today) {
            // Ya se practicó hoy, no hacer nada
            return;
        }
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toDateString();
        
        if (lastPracticeDate === yesterdayString) {
            // Se practicó ayer, incrementar días consecutivos
            progress.general.consecutiveDays = (progress.general.consecutiveDays || 0) + 1;
        } else {
            // Romper la racha, reiniciar a 1
            progress.general.consecutiveDays = 1;
        }
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

    // Backup y restauración de datos
    static exportUserData(userId) {
        const progress = this.getUserProgress(userId);
        const achievements = this.getUserAchievements(userId);
        const settings = this.getUserSettings(userId);
        
        return {
            progress: progress,
            achievements: achievements,
            settings: settings,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    }

    static importUserData(userId, data) {
        if (data.progress) {
            this.saveUserProgress(userId, data.progress);
        }
        
        if (data.achievements) {
            const achievementsHistory = this.getAchievementsHistory();
            achievementsHistory[userId] = data.achievements;
            this.saveAchievementsHistory(achievementsHistory);
        }
        
        if (data.settings) {
            this.saveUserSettings(userId, data.settings);
        }
    }

    // Limpieza de datos (para desarrollo)
    static clearAllData() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('user_') || key === 'users' || key === 'achievementsHistory') {
                localStorage.removeItem(key);
            }
        });
    }

    // Métodos para debugging
    static getAllData() {
        const data = {};
        const keys = Object.keys(localStorage);
        
        keys.forEach(key => {
            try {
                data[key] = JSON.parse(localStorage.getItem(key));
            } catch (e) {
                data[key] = localStorage.getItem(key);
            }
        });
        
        return data;
    }
}

// Inicializar el almacenamiento al cargar
Storage.init();