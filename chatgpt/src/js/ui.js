class UI {
    static showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.classList.add('modal-open');
        }
    }

    static hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    }

    static showScoreModal(score, details = {}) {
        const modal = document.getElementById('scoreModal');
        if (!modal) return;

        const scoreValue = document.getElementById('scoreValue');
        const scoreLetter = document.getElementById('scoreLetter');
        const scoreLevel = document.getElementById('scoreLevel');
        const scoreTime = document.getElementById('scoreTime');
        const scoreTitle = document.getElementById('scoreTitle');
        const scoreIcon = document.getElementById('scoreIcon');
        
        // Configurar detalles por defecto
        const {
            letter = 'a',
            level = 1,
            practiceTime = 0,
            message = 'Resultado'
        } = details;
        
        // Actualizar contenido del modal
        if (scoreValue) scoreValue.textContent = score + '%';
        if (scoreLetter) scoreLetter.textContent = letter;
        if (scoreLevel) scoreLevel.textContent = level;
        if (scoreTime) scoreTime.textContent = practiceTime + 's';
        if (scoreTitle) scoreTitle.textContent = message;
        
        // Configurar estilo según la puntuación
        this.configureScoreStyle(score, modal, scoreTitle, scoreIcon);
        
        // Animar círculo de puntuación
        this.animateScoreCircle(score);
        
        // Mostrar confeti si la puntuación es alta
        if (score >= 80) {
            this.createConfetti();
        }
        
        // Mostrar modal
        this.showModal('scoreModal');
    }

    static configureScoreStyle(score, modal, title, icon) {
        if (!modal || !title || !icon) return;
        
        // Limpiar clases anteriores
        modal.classList.remove('score-excellent', 'score-good', 'score-poor');
        
        if (score >= 85) {
            modal.classList.add('score-excellent');
            title.textContent = '¡Excelente!';
            icon.className = 'fas fa-trophy';
        } else if (score >= 70) {
            modal.classList.add('score-good');
            title.textContent = '¡Buen Trabajo!';
            icon.className = 'fas fa-star';
        } else {
            modal.classList.add('score-poor');
            title.textContent = 'Sigue Practicando';
            icon.className = 'fas fa-redo';
        }
    }

    static animateScoreCircle(score) {
        const scoreCircle = document.querySelector('.score-circle');
        if (!scoreCircle) return;
        
        const percent = (score / 100) * 360;
        
        // Establecer variable CSS para la animación
        document.documentElement.style.setProperty('--score-percent', percent + 'deg');
        
        // Reiniciar animación
        scoreCircle.style.animation = 'none';
        setTimeout(() => {
            scoreCircle.style.animation = 'scoreFill 1.5s ease-out forwards';
        }, 10);
    }

    static createConfetti() {
        const colors = ['#4B8FE2', '#FF6B6B', '#4CAF50', '#FFC107', '#9C27B0'];
        const confettiCount = 50;
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDelay = (Math.random() * 2) + 's';
                
                document.body.appendChild(confetti);
                
                // Remover después de la animación
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                }, 3000);
            }, i * 100);
        }
    }

    static showNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;

        // Estilos para la notificación
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            z-index: 3000;
            max-width: 300px;
            animation: slideInRight 0.3s ease;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
        `;

        // Colores según el tipo
        const colors = {
            success: '#4CAF50',
            error: '#F44336',
            warning: '#FFC107',
            info: '#2196F3'
        };

        notification.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(notification);

        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    static showFeedback(message, type) {
        const feedbackElement = document.getElementById('feedbackMessage');
        if (!feedbackElement) return;
        
        feedbackElement.textContent = message;
        feedbackElement.className = `feedback-message ${type}`;
        
        // Auto-ocultar después de 3 segundos
        setTimeout(() => {
            feedbackElement.textContent = '';
            feedbackElement.className = 'feedback-message';
        }, 3000);
    }

    static updateUserInterface(user) {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const userMenu = document.getElementById('userMenu');
        const userName = document.getElementById('userName');

        if (user) {
            if (loginBtn) loginBtn.classList.add('hidden');
            if (registerBtn) registerBtn.classList.add('hidden');
            if (userMenu) userMenu.classList.remove('hidden');
            if (userName) userName.textContent = user.username;
        } else {
            if (loginBtn) loginBtn.classList.remove('hidden');
            if (registerBtn) registerBtn.classList.remove('hidden');
            if (userMenu) userMenu.classList.add('hidden');
        }
    }

    static createProgressBar(percentage, color = 'var(--primary-color)') {
        return `
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${percentage}%; background-color: ${color};"></div>
            </div>
        `;
    }

    static animateElement(element, animation) {
        if (!element) return;
        
        element.style.animation = 'none';
        setTimeout(() => {
            element.style.animation = `${animation} 0.5s ease`;
        }, 10);
    }

    static formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

// Añadir estilos CSS para las notificaciones y animaciones
const notificationStyles = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .notification button {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    /* Animaciones para el modal de puntuación */
    @keyframes scoreFill {
        from {
            background: conic-gradient(var(--primary-color) 0%, #f0f0f0 0%);
        }
        to {
            background: conic-gradient(var(--primary-color) var(--score-percent, 0%), #f0f0f0 var(--score-percent, 0%));
        }
    }

    @keyframes confettiFall {
        0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }

    .confetti {
        position: fixed;
        width: 10px;
        height: 10px;
        background: var(--confetti-color);
        opacity: 0;
        animation: confettiFall 3s ease-in forwards;
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);