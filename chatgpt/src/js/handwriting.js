class HandwritingModule {
    static canvas = null;
    static ctx = null;
    static isDrawing = false;
    static currentLetter = 'a';
    static lastX = 0;
    static lastY = 0;

    static init() {
        this.canvas = document.getElementById('handwritingCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.setupCanvas();
        this.setupEventListeners();
        this.loadUserProgress();
        this.updateLetterGuide();
    }

    static setupCanvas() {
        // Configurar el contexto del canvas
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = '#4B8FE2';
        
        // Limpiar canvas
        this.clearCanvas();
    }

    static setupEventListeners() {
        // Eventos del canvas
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));
        
        // Eventos táctiles
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.stopDrawing.bind(this));

        // Controles
        document.getElementById('clearCanvas').addEventListener('click', () => {
            this.clearCanvas();
        });

        document.getElementById('checkLetter').addEventListener('click', () => {
            this.checkLetter();
        });

        document.getElementById('letterSelect').addEventListener('change', (e) => {
            this.currentLetter = e.target.value;
            this.updateLetterGuide();
            this.clearCanvas();
        });
    }

    static startDrawing(e) {
        this.isDrawing = true;
        const pos = this.getMousePos(e);
        [this.lastX, this.lastY] = [pos.x, pos.y];
    }

    static draw(e) {
        if (!this.isDrawing) return;
        
        e.preventDefault();
        const pos = this.getMousePos(e);
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();
        
        [this.lastX, this.lastY] = [pos.x, pos.y];
    }

    static stopDrawing() {
        this.isDrawing = false;
    }

    static handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.canvas.dispatchEvent(mouseEvent);
    }

    static handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.canvas.dispatchEvent(mouseEvent);
    }

    static getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        let clientX, clientY;
        
        if (e.type.includes('touch')) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    static clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Fondo blanco
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    static updateLetterGuide() {
        document.getElementById('letterGuide').textContent = this.currentLetter;
    }

    static checkLetter() {
        // Aquí iría la lógica de IA para evaluar la caligrafía
        // Por ahora, usaremos una simulación básica
        
        const canvasData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const drawnPixels = this.countDrawnPixels(canvasData);
        
        if (drawnPixels < 100) {
            UI.showNotification('Dibuja la letra más claramente', 'warning');
            return;
        }

        // Simular evaluación (en un sistema real, esto usaría machine learning)
        const score = this.simulateLetterEvaluation();
        this.handleEvaluationResult(score);
    }

    static countDrawnPixels(imageData) {
        let count = 0;
        for (let i = 0; i < imageData.data.length; i += 4) {
            // Verificar si el pixel no es blanco
            if (imageData.data[i] !== 255 || 
                imageData.data[i + 1] !== 255 || 
                imageData.data[i + 2] !== 255) {
                count++;
            }
        }
        return count;
    }

    static simulateLetterEvaluation() {
        // Simular una evaluación de la calidad del trazado
        // En una implementación real, esto usaría computer vision
        return Math.random() * 100;
    }

    static handleEvaluationResult(score) {
        const scoreElement = document.getElementById('handwritingScore');
        
        if (score >= 80) {
            scoreElement.innerHTML = `
                <div class="feedback-message correct">
                    <i class="fas fa-check-circle"></i>
                    ¡Excelente! Puntuación: ${Math.round(score)}%
                </div>
            `;
            this.handleSuccessfulPractice();
        } else if (score >= 60) {
            scoreElement.innerHTML = `
                <div class="feedback-message" style="background-color: rgba(255, 193, 7, 0.1); color: #FFC107; border-color: #FFC107;">
                    <i class="fas fa-exclamation-circle"></i>
                    Buen intento. Puntuación: ${Math.round(score)}%. Sigue practicando.
                </div>
            `;
        } else {
            scoreElement.innerHTML = `
                <div class="feedback-message incorrect">
                    <i class="fas fa-times-circle"></i>
                    Necesitas más práctica. Puntuación: ${Math.round(score)}%
                </div>
            `;
        }

        // Actualizar progreso del usuario
        if (window.app.currentUser && score >= 60) {
            this.updateUserProgress();
        }
    }

    static handleSuccessfulPractice() {
        if (window.app.currentUser) {
            const progress = Storage.getUserProgress(window.app.currentUser.id);
            const handwritingProgress = progress.handwriting;
            
            // Agregar letra a las dominadas si no está ya
            if (!handwritingProgress.lettersMastered.includes(this.currentLetter)) {
                handwritingProgress.lettersMastered.push(this.currentLetter);
                UI.showNotification(`¡Has dominado la letra ${this.currentLetter.toUpperCase()}!`, 'success');
            }
            
            // Incrementar contador de práctica
            handwritingProgress.practiceCount += 1;
            
            // Subir de nivel cada 10 prácticas
            if (handwritingProgress.practiceCount % 10 === 0) {
                handwritingProgress.level += 1;
                UI.showNotification(`¡Felicidades! Nivel de caligrafía: ${handwritingProgress.level}`, 'success');
            }
            
            window.app.updateUserProgress('handwriting', handwritingProgress);
        }
    }

    static updateUserProgress() {
        if (!window.app.currentUser) return;
        
        const progress = Storage.getUserProgress(window.app.currentUser.id);
        const handwritingProgress = progress.handwriting;
        
        const updatedProgress = {
            practiceCount: handwritingProgress.practiceCount + 1,
            lettersMastered: handwritingProgress.lettersMastered
        };
        
        // Si la letra actual no está en las dominadas y el score es alto, agregarla
        if (!updatedProgress.lettersMastered.includes(this.currentLetter)) {
            // En un sistema real, esto dependería del score de evaluación
            const shouldAddLetter = Math.random() > 0.7; // Simulación
            if (shouldAddLetter) {
                updatedProgress.lettersMastered.push(this.currentLetter);
                UI.showNotification(`¡Has dominado la letra ${this.currentLetter.toUpperCase()}!`, 'success');
            }
        }
        
        window.app.updateUserProgress('handwriting', updatedProgress);
    }

    static loadUserProgress() {
        if (window.app.currentUser) {
            const progress = Storage.getUserProgress(window.app.currentUser.id);
            if (progress && progress.handwriting) {
                // Podríamos usar esta información para personalizar la experiencia
            }
        }
    }
}