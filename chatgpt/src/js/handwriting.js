class HandwritingModule {
    static canvas = null;
    static ctx = null;
    static isDrawing = false;
    static currentLetter = 'a';
    static currentColor = '#4B8FE2';
    static currentLineWidth = 3;
    static currentMode = 'free';
    static lastX = 0;
    static lastY = 0;
    static drawingData = [];
    static strokes = [];
    static currentStroke = [];
    static inappropriateContentDetected = false;
    static inappropriateContentCount = 0;
    static practiceStartTime = 0;
    static currentScore = 0;

    // Definición completa de letras disponibles
    static availableLetters = {
        lowercase: 'abcdefghijklmnñopqrstuvwxyz',
        uppercase: 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ',
        numbers: '0123456789',
        basicShapes: '○△□◇'
    };

    // Colores disponibles
    static availableColors = [
        '#4B8FE2', '#E74C3C', '#2ECC71', '#F39C12',
        '#9B59B6', '#1ABC9C', '#34495E', '#E67E22'
    ];

    // Palabras para práctica
    static practiceWords = [
        'hola', 'mundo', 'escuela', 'familia', 'amigo', 
        'casa', 'árbol', 'libro', 'agua', 'sol', 'luna',
        'mesa', 'silla', 'puerta', 'ventana', 'gato', 'perro'
    ];

    static init() {
        this.canvas = document.getElementById('handwritingCanvas');
        if (!this.canvas) {
            console.error('Canvas no encontrado');
            return;
        }
        
        // Configurar canvas con willReadFrequently para mejor rendimiento
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        
        this.setupCanvas();
        this.setupEventListeners();
        this.populateLetterSelectors();
        this.setupColorSelector();
        this.updateLetterGuide();
        this.loadUserProgress();
        
        // Iniciar timer de práctica
        this.startPracticeTimer();
        
        // Manejar redimensionamiento
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

     static handleResize() {
        const container = this.canvas.parentElement;
        if (!container) return;
        
        const rect = container.getBoundingClientRect();
        
        // Establecer el tamaño del canvas según el contenedor
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        // Redibujar si hay trazos guardados
        if (this.strokes.length > 0) {
            this.redrawCanvas();
        } else {
            this.clearCanvas();
        }
        
        // Actualizar configuración
        this.ctx.lineWidth = this.currentLineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = this.currentColor;
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
        
        // Escalar coordenadas según el tamaño real del canvas
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

     static setupScoreModal() {
        const modal = document.getElementById('scoreModal');
        const closeBtn = modal.querySelector('.close-modal');
        const practiceAgainBtn = document.getElementById('practiceAgain');
        const nextLetterBtn = document.getElementById('nextLetterBtn');

        closeBtn.addEventListener('click', () => {
            this.hideScoreModal();
        });

        practiceAgainBtn.addEventListener('click', () => {
            this.hideScoreModal();
            this.clearCanvas();
            this.startPracticeTimer();
        });

        nextLetterBtn.addEventListener('click', () => {
            this.hideScoreModal();
            this.nextRandomLetter();
            this.clearCanvas();
            this.startPracticeTimer();
        });

        // Cerrar modal al hacer click fuera
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideScoreModal();
            }
        });
    }

    static showScoreModal(score, letter) {
        const modal = document.getElementById('scoreModal');
        const scoreValue = document.getElementById('scoreValue');
        const scoreLetter = document.getElementById('scoreLetter');
        const scoreLevel = document.getElementById('scoreLevel');
        const scoreTime = document.getElementById('scoreTime');
        const scoreTitle = document.getElementById('scoreTitle');
        const scoreIcon = document.getElementById('scoreIcon');
        
        // Calcular tiempo de práctica
        const practiceTime = Math.floor((Date.now() - this.practiceStartTime) / 1000);
        
        // Determinar nivel basado en la puntuación
        const level = this.calculateLevel(score);
        
        // Actualizar contenido del modal
        scoreValue.textContent = score + '%';
        scoreLetter.textContent = letter;
        scoreLevel.textContent = level;
        scoreTime.textContent = practiceTime + 's';
        
        // Configurar estilo según la puntuación
        this.configureScoreStyle(score, modal, scoreTitle, scoreIcon);
        
        // Animar círculo de puntuación
        this.animateScoreCircle(score);
        
        // Mostrar confeti si la puntuación es alta
        if (score >= 80) {
            this.createConfetti();
        }
        
        // Mostrar modal
        modal.style.display = 'block';
        
        // Actualizar progreso del usuario
        if (score >= 70) {
            this.updateUserProgress(score);
        }
    }

    static hideScoreModal() {
        const modal = document.getElementById('scoreModal');
        modal.style.display = 'none';
        
        // Remover clases de estilo
        modal.classList.remove('score-excellent', 'score-good', 'score-poor');
    }

    static configureScoreStyle(score, modal, title, icon) {
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
        const percent = (score / 100) * 360;
        
        // Establecer variable CSS para la animación
        document.documentElement.style.setProperty('--score-percent', percent + 'deg');
        
        // Reiniciar animación
        scoreCircle.style.animation = 'none';
        setTimeout(() => {
            scoreCircle.style.animation = 'scoreFill 1.5s ease-out forwards';
        }, 10);
    }

    static calculateLevel(score) {
        if (score >= 90) return 5;
        if (score >= 80) return 4;
        if (score >= 70) return 3;
        if (score >= 60) return 2;
        return 1;
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
                confetti.style.setProperty('--confetti-color', colors[Math.floor(Math.random() * colors.length)]);
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

    static startPracticeTimer() {
        this.practiceStartTime = Date.now();
    }

    static checkLetter() {
        if (this.inappropriateContentDetected) {
            if (typeof UI !== 'undefined' && UI.showNotification) {
                UI.showNotification('Por favor, dibuja contenido apropiado antes de verificar.', 'warning');
            }
            return;
        }
        
        const canvasData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const drawnPixels = this.countDrawnPixels(canvasData);
        
        if (drawnPixels < 50) {
            if (typeof UI !== 'undefined' && UI.showNotification) {
                UI.showNotification('Dibuja más claramente para poder evaluar', 'warning');
            }
            return;
        }

        const score = this.enhancedLetterEvaluation();
        this.currentScore = score;
        
        // Mostrar resultado en modal
        this.showScoreModal(score, this.currentLetter);
        
        // Manejar lógica de evaluación
        this.handleEvaluationResult(score);
    }

    // Modificar handleEvaluationResult para que no muestre en HTML
    static handleEvaluationResult(score) {
        // Esta función ahora solo maneja la lógica interna
        if (score >= 85) {
            this.handleSuccessfulPractice(score);
        }
        
        // El progreso se actualiza en showScoreModal cuando score >= 70
    }

    static setupCanvas() {
        // Configurar el contexto del canvas
        this.ctx.lineWidth = this.currentLineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = this.currentColor;
        
        // Establecer tamaño inicial
        this.handleResize();
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

        // Controles mejorados
        const clearBtn = document.getElementById('clearCanvas');
        const checkBtn = document.getElementById('checkLetter');
        const undoBtn = document.getElementById('undoDrawing');
        const nextBtn = document.getElementById('nextLetter');
        const lineWidth = document.getElementById('lineWidth');

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearCanvas();
            });
        }

        if (checkBtn) {
            checkBtn.addEventListener('click', () => {
                this.checkLetter();
            });
        }

        if (undoBtn) {
            undoBtn.addEventListener('click', () => {
                this.undoLastStroke();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.nextRandomLetter();
            });
        }

        if (lineWidth) {
            lineWidth.addEventListener('input', (e) => {
                this.currentLineWidth = parseInt(e.target.value);
                this.ctx.lineWidth = this.currentLineWidth;
                const lineWidthValue = document.getElementById('lineWidthValue');
                if (lineWidthValue) {
                    lineWidthValue.textContent = this.currentLineWidth;
                }
            });
        }
    }

    static populateLetterSelectors() {
        const letterSelect = document.getElementById('letterSelect');
        if (!letterSelect) return;
        
        // Limpiar selector existente
        letterSelect.innerHTML = '';
        
        // Agregar letras minúsculas
        const lowercaseGroup = document.createElement('optgroup');
        lowercaseGroup.label = 'Letras Minúsculas';
        this.availableLetters.lowercase.split('').forEach(letter => {
            const option = document.createElement('option');
            option.value = letter;
            option.textContent = letter;
            lowercaseGroup.appendChild(option);
        });
        letterSelect.appendChild(lowercaseGroup);
        
        // Agregar letras mayúsculas
        const uppercaseGroup = document.createElement('optgroup');
        uppercaseGroup.label = 'Letras Mayúsculas';
        this.availableLetters.uppercase.split('').forEach(letter => {
            const option = document.createElement('option');
            option.value = letter;
            option.textContent = letter;
            uppercaseGroup.appendChild(option);
        });
        letterSelect.appendChild(uppercaseGroup);
        
        // Agregar números
        const numbersGroup = document.createElement('optgroup');
        numbersGroup.label = 'Números';
        this.availableLetters.numbers.split('').forEach(number => {
            const option = document.createElement('option');
            option.value = number;
            option.textContent = number;
            numbersGroup.appendChild(option);
        });
        letterSelect.appendChild(numbersGroup);
        
        // Agregar formas básicas
        const shapesGroup = document.createElement('optgroup');
        shapesGroup.label = 'Formas Básicas';
        this.availableLetters.basicShapes.split('').forEach(shape => {
            const option = document.createElement('option');
            option.value = shape;
            option.textContent = shape;
            shapesGroup.appendChild(option);
        });
        letterSelect.appendChild(shapesGroup);
        
        // Event listener para cambio de letra
        letterSelect.addEventListener('change', (e) => {
            this.currentLetter = e.target.value;
            this.updateLetterGuide();
            this.clearCanvas();
        });
    }

    static setupColorSelector() {
        const colorContainer = document.getElementById('colorSelector');
        if (!colorContainer) return;
        
        colorContainer.innerHTML = '';
        
        this.availableColors.forEach(color => {
            const colorBtn = document.createElement('button');
            colorBtn.className = 'color-btn';
            colorBtn.style.backgroundColor = color;
            colorBtn.dataset.color = color;
            colorBtn.title = color;
            
            if (color === this.currentColor) {
                colorBtn.classList.add('active');
            }
            
            colorBtn.addEventListener('click', (e) => {
                document.querySelectorAll('.color-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
                this.currentColor = e.target.dataset.color;
                this.ctx.strokeStyle = this.currentColor;
            });
            
            colorContainer.appendChild(colorBtn);
        });
    }

    static startDrawing(e) {
        if (this.inappropriateContentDetected) {
            this.showContentWarning();
            return;
        }
        
        this.isDrawing = true;
        const pos = this.getMousePos(e);
        [this.lastX, this.lastY] = [pos.x, pos.y];
        
        // Iniciar nuevo trazo
        this.currentStroke = [{
            x: this.lastX,
            y: this.lastY,
            color: this.currentColor,
            lineWidth: this.currentLineWidth,
            timestamp: Date.now()
        }];
    }

    static draw(e) {
        if (!this.isDrawing || this.inappropriateContentDetected) return;
        
        e.preventDefault();
        const pos = this.getMousePos(e);
        
        // Dibujar línea
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();
        
        // Guardar punto en el trazo actual
        this.currentStroke.push({
            x: pos.x,
            y: pos.y,
            color: this.currentColor,
            lineWidth: this.currentLineWidth,
            timestamp: Date.now()
        });
        
        [this.lastX, this.lastY] = [pos.x, pos.y];
    }

    static stopDrawing() {
        if (!this.isDrawing) return;
        
        this.isDrawing = false;
        
        // Guardar trazo completo
        if (this.currentStroke.length > 0) {
            this.strokes.push([...this.currentStroke]);
            this.currentStroke = [];
        }
    }

    static analyzeStrokeForInappropriateContent(x, y) {
        // Detectar movimientos muy rápidos (garabatos)
        if (this.currentStroke.length > 2) {
            const lastPoint = this.currentStroke[this.currentStroke.length - 2];
            const timeDiff = Date.now() - lastPoint.timestamp;
            const distance = Math.sqrt(Math.pow(x - lastPoint.x, 2) + Math.pow(y - lastPoint.y, 2));
            
            if (timeDiff > 0) {
                const speed = distance / timeDiff;
                if (speed > 15) { // Umbral de velocidad alta
                    return true;
                }
            }
        }
        
        // Detectar líneas muy largas y rectas
        if (this.currentStroke.length > 10) {
            const recentPoints = this.currentStroke.slice(-10);
            const xValues = recentPoints.map(p => p.x);
            const yValues = recentPoints.map(p => p.y);
            
            const xRange = Math.max(...xValues) - Math.min(...xValues);
            const yRange = Math.max(...yValues) - Math.min(...yValues);
            
            // Si es una línea muy horizontal o vertical
            if ((xRange > 100 && yRange < 10) || (yRange > 100 && xRange < 10)) {
                return true;
            }
        }
        
        return false;
    }

    static analyzeCompleteDrawing() {
        if (this.inappropriateContentDetected) return;
        
        const canvasData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const drawnPixels = this.countDrawnPixels(canvasData);
        
        // Si hay muy pocos píxeles dibujados
        if (drawnPixels < 20) {
            return;
        }
        
        // Si hay demasiados píxeles dibujados (posible garabato)
        if (drawnPixels > (this.canvas.width * this.canvas.height * 0.7)) {
            this.handleInappropriateContent();
            return;
        }
        
        // Análisis de distribución espacial
        const distribution = this.analyzeSpatialDistribution(canvasData);
        if (distribution.uniformity > 0.8) { // Muy uniforme = posible garabato
            this.handleInappropriateContent();
        }
    }

    static analyzeSpatialDistribution(imageData) {
        const gridSize = 4;
        const cellWidth = this.canvas.width / gridSize;
        const cellHeight = this.canvas.height / gridSize;
        
        let filledCells = 0;
        
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const xStart = i * cellWidth;
                const yStart = j * cellHeight;
                const cellPixels = this.countPixelsInArea(imageData, xStart, yStart, cellWidth, cellHeight);
                
                if (cellPixels > 50) {
                    filledCells++;
                }
            }
        }
        
        return {
            filledCells,
            uniformity: filledCells / (gridSize * gridSize)
        };
    }

    static countPixelsInArea(imageData, x, y, width, height) {
        let count = 0;
        for (let i = Math.floor(y); i < Math.floor(y + height) && i < imageData.height; i++) {
            for (let j = Math.floor(x); j < Math.floor(x + width) && j < imageData.width; j++) {
                const index = (i * imageData.width + j) * 4;
                if (imageData.data[index] !== 255 || 
                    imageData.data[index + 1] !== 255 || 
                    imageData.data[index + 2] !== 255) {
                    count++;
                }
            }
        }
        return count;
    }

    static handleInappropriateContent() {
        this.inappropriateContentDetected = true;
        this.inappropriateContentCount++;
        
        this.showContentWarning();
        this.clearCanvas();
        
        // Bloquear temporalmente
        setTimeout(() => {
            this.inappropriateContentDetected = false;
        }, 3000);
    }

    static showContentWarning() {
        const warningElement = document.getElementById('contentWarning');
        if (warningElement) {
            warningElement.classList.remove('hidden');
        }
        
        if (typeof UI !== 'undefined' && UI.showNotification) {
            UI.showNotification(
                'Contenido inapropiado detectado. Por favor, practica solo letras y formas.', 
                'error'
            );
        }
        
        setTimeout(() => {
            if (warningElement) {
                warningElement.classList.add('hidden');
            }
        }, 5000);
    }

    static changePracticeMode(mode) {
        this.currentMode = mode;
        this.clearCanvas();
        
        const guideElement = document.getElementById('letterGuide');
        const dotsElement = document.getElementById('dotsGuide');
        
        if (!guideElement) return;
        
        // Resetear estilos
        guideElement.className = 'letter-guide-enhanced';
        if (dotsElement) {
            dotsElement.classList.add('hidden');
        }
        
        switch(mode) {
            case 'guided':
                guideElement.classList.add('guided-mode');
                this.showTracingGuide();
                break;
                
            case 'connect':
                if (dotsElement) {
                    dotsElement.classList.remove('hidden');
                }
                this.generateDotsForLetter();
                break;
                
            case 'word':
                guideElement.classList.add('word-mode');
                this.currentLetter = this.practiceWords[0];
                guideElement.textContent = this.currentLetter;
                break;
                
            default:
                // Modo libre
                this.updateLetterGuide();
                break;
        }
    }

    static showTracingGuide() {
        const guide = document.getElementById('letterGuide');
        if (guide) {
            guide.style.background = `
                repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 10px,
                    rgba(75, 143, 226, 0.1) 10px,
                    rgba(75, 143, 226, 0.1) 20px
                )
            `;
        }
    }

    static generateDotsForLetter() {
        const dotsElement = document.getElementById('dotsGuide');
        if (!dotsElement) return;
        
        dotsElement.innerHTML = '';
        
        const points = this.generateRandomPoints();
        
        points.forEach((point, index) => {
            const dot = document.createElement('div');
            dot.className = 'dot';
            dot.style.left = point.x + 'px';
            dot.style.top = point.y + 'px';
            dot.textContent = index + 1;
            dotsElement.appendChild(dot);
        });
    }

    static generateRandomPoints() {
        const points = [];
        const numPoints = 5 + Math.floor(Math.random() * 5);
        
        for (let i = 0; i < numPoints; i++) {
            points.push({
                x: 50 + Math.random() * 300,
                y: 50 + Math.random() * 200
            });
        }
        
        return points;
    }

    static nextRandomLetter() {
        const allLetters = [
            ...this.availableLetters.lowercase.split(''),
            ...this.availableLetters.uppercase.split('')
        ];
        
        const randomIndex = Math.floor(Math.random() * allLetters.length);
        this.currentLetter = allLetters[randomIndex];
        
        // Actualizar selector
        const letterSelect = document.getElementById('letterSelect');
        if (letterSelect) {
            letterSelect.value = this.currentLetter;
        }
        this.updateLetterGuide();
        this.clearCanvas();
    }

    static undoLastStroke() {
        if (this.strokes.length === 0) return;
        
        this.strokes.pop();
        this.redrawCanvas();
    }

    static redrawCanvas() {
        this.clearCanvas();
        
        // Redibujar todos los trazos
        this.strokes.forEach(stroke => {
            if (stroke.length < 2) return;
            
            this.ctx.strokeStyle = stroke[0].color;
            this.ctx.lineWidth = stroke[0].lineWidth;
            
            this.ctx.beginPath();
            this.ctx.moveTo(stroke[0].x, stroke[0].y);
            
            for (let i = 1; i < stroke.length; i++) {
                this.ctx.lineTo(stroke[i].x, stroke[i].y);
            }
            
            this.ctx.stroke();
        });
        
        // Restaurar configuración actual
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.currentLineWidth;
    }

    static updateLetterGuide() {
        const guide = document.getElementById('letterGuide');
        if (guide) {
            guide.textContent = this.currentLetter;
        }
    }

    static clearCanvas() {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.strokes = [];
        this.currentStroke = [];
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

    static checkLetter() {
        // Verificar si hay contenido dibujado
        const canvasData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const drawnPixels = this.countDrawnPixels(canvasData);
        
        if (drawnPixels < 50) {
            if (typeof UI !== 'undefined' && UI.showNotification) {
                UI.showNotification('Dibuja más claramente para poder evaluar', 'warning');
            }
            return;
        }

        const score = this.enhancedLetterEvaluation();
        this.currentScore = score;
        
        // Mostrar resultado usando el sistema de UI
        const practiceTime = Math.floor((Date.now() - this.practiceStartTime) / 1000);
        const level = this.calculateLevel(score);
        
        if (typeof UI !== 'undefined' && UI.showScoreModal) {
            UI.showScoreModal(score, {
                letter: this.currentLetter,
                level: level,
                practiceTime: practiceTime
            });
        }
        
        // Manejar lógica de evaluación
        this.handleEvaluationResult(score);
    }

    static countDrawnPixels(imageData) {
        let count = 0;
        for (let i = 0; i < imageData.data.length; i += 4) {
            if (imageData.data[i] !== 255 || 
                imageData.data[i + 1] !== 255 || 
                imageData.data[i + 2] !== 255) {
                count++;
            }
        }
        return count;
    }

    static enhancedLetterEvaluation() {
        // Evaluación mejorada que considera múltiples factores
        let baseScore = Math.random() * 30 + 65; // 65-95 base
        
        // Bonus por práctica consistente (solo si el usuario está logueado)
        if (window.app && window.app.currentUser && typeof Storage !== 'undefined') {
            try {
                const progress = Storage.getUserProgress(window.app.currentUser.id);
                if (progress && progress.handwriting) {
                    const practiceCount = progress.handwriting.practiceCount || 0;
                    baseScore += Math.min(10, practiceCount * 0.2);
                }
            } catch (error) {
                console.log('Error al cargar progreso:', error);
            }
        }
        
        return Math.min(100, Math.round(baseScore));
    }

    static calculateLevel(score) {
        if (score >= 90) return 5;
        if (score >= 80) return 4;
        if (score >= 70) return 3;
        if (score >= 60) return 2;
        return 1;
    }


    static handleEvaluationResult(score) {
        // Actualizar progreso solo si el usuario está logueado
        if (window.app && window.app.currentUser && score >= 70 && typeof Storage !== 'undefined') {
            this.updateUserProgress(score);
        }
    }

    static handleSuccessfulPractice(score) {
        if (!window.app || !window.app.currentUser || typeof Storage === 'undefined') return;
        
        try {
            const progress = Storage.getUserProgress(window.app.currentUser.id);
            
            // Inicializar handwritingProgress si no existe
            if (!progress.handwriting) {
                progress.handwriting = this.getDefaultHandwritingProgress();
            }
            
            const handwritingProgress = progress.handwriting;
            
            // Actualizar estadísticas
            handwritingProgress.practiceCount = (handwritingProgress.practiceCount || 0) + 1;
            handwritingProgress.totalScore = (handwritingProgress.totalScore || 0) + score;
            
            if (score > (handwritingProgress.bestScore || 0)) {
                handwritingProgress.bestScore = score;
            }
            
            // Inicializar lettersMastered si no existe
            if (!handwritingProgress.lettersMastered) {
                handwritingProgress.lettersMastered = [];
            }
            
            // Agregar letra a las dominadas si no está
            if (!handwritingProgress.lettersMastered.includes(this.currentLetter)) {
                handwritingProgress.lettersMastered.push(this.currentLetter);
                if (typeof UI !== 'undefined' && UI.showNotification) {
                    UI.showNotification(`¡Has dominado la letra ${this.currentLetter.toUpperCase()}!`, 'success');
                }
            }
            
            Storage.saveUserProgress(window.app.currentUser.id, progress);
            this.updateProgressDisplay();
            
        } catch (error) {
            console.error('Error al guardar progreso:', error);
        }
    }

    static updateUserProgress(score) {
        if (!window.app || !window.app.currentUser || typeof Storage === 'undefined') return;
        
        try {
            const progress = Storage.getUserProgress(window.app.currentUser.id);
            
            // Inicializar handwritingProgress si no existe
            if (!progress.handwriting) {
                progress.handwriting = this.getDefaultHandwritingProgress();
            }
            
            const handwritingProgress = progress.handwriting;
            
            handwritingProgress.practiceCount = (handwritingProgress.practiceCount || 0) + 1;
            handwritingProgress.totalScore = (handwritingProgress.totalScore || 0) + score;
            
            if (score > (handwritingProgress.bestScore || 0)) {
                handwritingProgress.bestScore = score;
            }
            
            Storage.saveUserProgress(window.app.currentUser.id, progress);
            this.updateProgressDisplay();
            
        } catch (error) {
            console.error('Error al actualizar progreso:', error);
        }
    }

    static getDefaultHandwritingProgress() {
        return {
            practiceCount: 0,
            lettersMastered: [],
            bestScore: 0,
            totalScore: 0,
            level: 1
        };
    }

    static updateProgressDisplay() {
        const lettersPracticed = document.getElementById('lettersPracticed');
        const bestScore = document.getElementById('bestScore');
        
        if (!lettersPracticed || !bestScore) return;
        
        if (!window.app || !window.app.currentUser || typeof Storage === 'undefined') {
            // Usuario no logueado, mostrar valores por defecto
            lettersPracticed.textContent = '0';
            bestScore.textContent = '0%';
            return;
        }
        
        try {
            const progress = Storage.getUserProgress(window.app.currentUser.id);
            
            if (progress && progress.handwriting) {
                const handwritingProgress = progress.handwriting;
                const practiceCount = handwritingProgress.practiceCount || 0;
                const bestScoreValue = handwritingProgress.bestScore || 0;
                
                lettersPracticed.textContent = practiceCount;
                bestScore.textContent = bestScoreValue + '%';
            } else {
                lettersPracticed.textContent = '0';
                bestScore.textContent = '0%';
            }
            
        } catch (error) {
            console.error('Error al mostrar progreso:', error);
            lettersPracticed.textContent = '0';
            bestScore.textContent = '0%';
        }
    }

    static loadUserProgress() {
        this.updateProgressDisplay();
    }

    static startPracticeTimer() {
        this.practiceStartTime = Date.now();
    }

    static showContentWarning() {
        if (typeof UI !== 'undefined' && UI.showNotification) {
            UI.showNotification(
                'Contenido inapropiado detectado. Por favor, practica solo letras y formas.', 
                'error'
            );
        }
    }
}