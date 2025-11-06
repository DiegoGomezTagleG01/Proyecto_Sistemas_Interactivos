class UI {
    static showModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    }

    static hideModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
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
            loginBtn.classList.add('hidden');
            registerBtn.classList.add('hidden');
            userMenu.classList.remove('hidden');
            userName.textContent = user.username;
        } else {
            loginBtn.classList.remove('hidden');
            registerBtn.classList.remove('hidden');
            userMenu.classList.add('hidden');
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

// Añadir estilos CSS para las notificaciones
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
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);