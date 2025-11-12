// src/js/achievements.js
class AchievementsModule {
    static achievements = {
        spelling: [
            {
                id: 'spelling_beginner',
                title: 'Principiante en Ortografía',
                description: 'Completa 5 ejercicios de ortografía',
                icon: 'fas fa-spell-check',
                condition: (progress) => progress.spelling.exercisesCompleted >= 5,
                unlocked: false
            },
            {
                id: 'spelling_expert',
                title: 'Experto en Ortografía',
                description: 'Completa 25 ejercicios de ortografía',
                icon: 'fas fa-award',
                condition: (progress) => progress.spelling.exercisesCompleted >= 25,
                unlocked: false
            },
            {
                id: 'spelling_master',
                title: 'Maestro en Ortografía',
                description: 'Completa 50 ejercicios de ortografía',
                icon: 'fas fa-crown',
                condition: (progress) => progress.spelling.exercisesCompleted >= 50,
                unlocked: false
            },
            {
                id: 'perfect_score',
                title: 'Puntuación Perfecta',
                description: 'Obtén 100% de precisión en 10 ejercicios consecutivos',
                icon: 'fas fa-star',
                condition: (progress) => progress.spelling.perfectRuns >= 10,
                unlocked: false
            }
        ],
        handwriting: [
            {
                id: 'handwriting_beginner',
                title: 'Principiante en Caligrafía',
                description: 'Practica caligrafía 10 veces',
                icon: 'fas fa-pen-nib',
                condition: (progress) => progress.handwriting.practiceCount >= 10,
                unlocked: false
            },
            {
                id: 'handwriting_expert',
                title: 'Experto en Caligrafía',
                description: 'Practica caligrafía 50 veces',
                icon: 'fas fa-pen-fancy',
                condition: (progress) => progress.handwriting.practiceCount >= 50,
                unlocked: false
            },
            {
                id: 'alphabet_master',
                title: 'Maestro del Alfabeto',
                description: 'Domina todas las letras del alfabeto',
                icon: 'fas fa-font',
                condition: (progress) => progress.handwriting.lettersMastered.length >= 26,
                unlocked: false
            },
            {
                id: 'quick_learner',
                title: 'Aprendiz Rápido',
                description: 'Domina 5 letras en una sola sesión',
                icon: 'fas fa-bolt',
                condition: (progress) => progress.handwriting.sessionMastered >= 5,
                unlocked: false
            }
        ],
        general: [
            {
                id: 'first_login',
                title: 'Primeros Pasos',
                description: 'Inicia sesión por primera vez',
                icon: 'fas fa-user',
                condition: (progress) => progress.general.firstLogin,
                unlocked: false
            },
            {
                id: 'daily_practicer',
                title: 'Practicante Diario',
                description: 'Practica durante 7 días consecutivos',
                icon: 'fas fa-calendar-check',
                condition: (progress) => progress.general.consecutiveDays >= 7,
                unlocked: false
            },
            {
                id: 'balanced_learner',
                title: 'Aprendiz Equilibrado',
                description: 'Completa ejercicios en ambos módulos',
                icon: 'fas fa-balance-scale',
                condition: (progress) => progress.spelling.exercisesCompleted > 0 && progress.handwriting.practiceCount > 0,
                unlocked: false
            },
            {
                id: 'persistent_learner',
                title: 'Aprendiz Persistente',
                description: 'Alcanza el nivel 10 en ambos módulos',
                icon: 'fas fa-trophy',
                condition: (progress) => progress.spelling.level >= 10 && progress.handwriting.level >= 10,
                unlocked: false
            }
        ]
    };

    static checkAchievements(progress) {
        const unlockedAchievements = [];
        const allAchievements = [...this.achievements.spelling, ...this.achievements.handwriting, ...this.achievements.general];
        
        allAchievements.forEach(achievement => {
            if (!achievement.unlocked && achievement.condition(progress)) {
                achievement.unlocked = true;
                unlockedAchievements.push(achievement);
            }
        });

        return unlockedAchievements;
    }

    static unlockAchievement(achievement, userId) {
        const userProgress = Storage.getUserProgress(userId);
        if (!userProgress.achievements) {
            userProgress.achievements = [];
        }

        if (!userProgress.achievements.includes(achievement.id)) {
            userProgress.achievements.push(achievement.id);
            Storage.saveUserProgress(userId, userProgress);
            
            // Mostrar notificación del logro
            this.showAchievementNotification(achievement);
            
            // Guardar en el historial de logros desbloqueados
            this.saveUnlockedAchievement(userId, achievement);
        }
    }

    static showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-popup">
                <div class="achievement-icon">
                    <i class="${achievement.icon}"></i>
                </div>
                <div class="achievement-content">
                    <h4>¡Logro Desbloqueado!</h4>
                    <h5>${achievement.title}</h5>
                    <p>${achievement.description}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animación de entrada
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    static saveUnlockedAchievement(userId, achievement) {
        const achievementsHistory = Storage.getAchievementsHistory() || {};
        if (!achievementsHistory[userId]) {
            achievementsHistory[userId] = [];
        }
        
        achievementsHistory[userId].push({
            id: achievement.id,
            title: achievement.title,
            description: achievement.description,
            icon: achievement.icon,
            unlockedAt: new Date().toISOString()
        });
        
        Storage.saveAchievementsHistory(achievementsHistory);
    }

    static getUnlockedAchievements(userId) {
        const achievementsHistory = Storage.getAchievementsHistory() || {};
        return achievementsHistory[userId] || [];
    }

    static renderAchievementsSection(userId) {
        const unlockedAchievements = this.getUnlockedAchievements(userId);
        const allAchievements = [...this.achievements.spelling, ...this.achievements.handwriting, ...this.achievements.general];
        
        const container = document.getElementById('achievementsSection');
        if (!container) return;

        container.innerHTML = `
            <div class="achievements-container">
                <h3>Tus Logros</h3>
                <div class="achievements-stats">
                    <div class="stat">
                        <span class="stat-number">${unlockedAchievements.length}</span>
                        <span class="stat-label">Logros Desbloqueados</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">${allAchievements.length}</span>
                        <span class="stat-label">Total de Logros</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">${Math.round((unlockedAchievements.length / allAchievements.length) * 100)}%</span>
                        <span class="stat-label">Progreso Total</span>
                    </div>
                </div>
                
                <div class="achievements-grid">
                    ${allAchievements.map(achievement => {
                        const isUnlocked = unlockedAchievements.some(a => a.id === achievement.id);
                        return `
                            <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
                                <div class="achievement-icon">
                                    <i class="${achievement.icon}"></i>
                                </div>
                                <div class="achievement-info">
                                    <h4>${achievement.title}</h4>
                                    <p>${achievement.description}</p>
                                </div>
                                <div class="achievement-status">
                                    ${isUnlocked ? 
                                        '<i class="fas fa-check-circle"></i>' : 
                                        '<i class="fas fa-lock"></i>'
                                    }
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
}