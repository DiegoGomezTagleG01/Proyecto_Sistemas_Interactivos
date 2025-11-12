class SpellingModule {
    static currentExercise = null;
    static currentDifficulty = 'easy';
    static score = 0;
    static level = 1;
    static exercisesCompleted = 0;
    static streak = 0;
    static maxStreak = 0;

    static init() {
        this.setupEventListeners();
        this.loadUserProgress();
        this.generateExercise();
        this.focusOnInput();
    }

    static setupEventListeners() {
        // Selector de dificultad
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentDifficulty = e.target.dataset.difficulty;
                this.generateExercise();
            });
        });

        // Selector de tipo de ejercicio
        document.getElementById('exerciseType').addEventListener('change', () => {
            this.generateExercise();
        });

        // Event listener global para Enter
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleEnterKey();
            }
        });
    }

    static handleEnterKey() {
        const activeExercise = document.querySelector('.exercise');
        if (!activeExercise) return;

        if (activeExercise.classList.contains('complete-exercise')) {
            this.checkCompleteAnswer();
        } else if (activeExercise.classList.contains('correct-exercise')) {
            this.checkCorrectAnswer();
        } else if (activeExercise.classList.contains('dictation-exercise')) {
            this.checkDictationAnswer();
        } else if (activeExercise.classList.contains('multiple-choice-exercise')) {
            this.checkMultipleChoiceAnswer();
        } else if (activeExercise.classList.contains('synonym-exercise')) {
            this.checkSynonymAnswer();
        }
    }

    static loadUserProgress() {
        if (window.app && window.app.currentUser) {
            const progress = Storage.getUserProgress(window.app.currentUser.id);
            if (progress && progress.spelling) {
                this.score = progress.spelling.score || 0;
                this.level = progress.spelling.level || 1;
                this.exercisesCompleted = progress.spelling.exercisesCompleted || 0;
                this.streak = progress.spelling.streak || 0;
                this.maxStreak = progress.spelling.maxStreak || 0;
                this.updateProgressDisplay();
            }
        }
    }

    static generateExercise() {
        const exerciseType = document.getElementById('exerciseType').value;
        let exercise;

        // Array de tipos de ejercicio disponibles
        const availableTypes = ['complete', 'correct', 'dictation', 'multiple-choice', 'synonym'];
        
        // Si es "random", elegir un tipo aleatorio
        const selectedType = exerciseType === 'random' 
            ? availableTypes[Math.floor(Math.random() * availableTypes.length)]
            : exerciseType;

        switch (selectedType) {
            case 'complete':
                exercise = this.generateCompleteExercise();
                break;
            case 'correct':
                exercise = this.generateCorrectExercise();
                break;
            case 'dictation':
                exercise = this.generateDictationExercise();
                break;
            case 'multiple-choice':
                exercise = this.generateMultipleChoiceExercise();
                break;
            case 'synonym':
                exercise = this.generateSynonymExercise();
                break;
        }

        this.currentExercise = exercise;
        this.renderExercise(exercise);
        this.focusOnInput();
    }

    static generateCompleteExercise() {
        const words = {
            easy: [
                'casa', 'mesa', 'silla', 'libro', 'gato', 'perro', 'sol', 'luna',
                'agua', 'flor', 'pan', 'mar', 'río', 'pie', 'mano', 'ojo', 'nariz', 'boca'
            ],
            medium: [
                'escuela', 'ventana', 'puerta', 'jardín', 'cocina', 'baño', 'sillón',
                'camino', 'bosque', 'montaña', 'ciudad', 'pueblo', 'calle', 'plaza',
                'árbol', 'flores', 'animal', 'persona', 'trabajo', 'estudio'
            ],
            hard: [
                'conocimiento', 'oportunidad', 'responsabilidad', 'comunicación',
                'transformación', 'desarrollo', 'educación', 'importancia',
                'posibilidad', 'necesidad', 'dificultad', 'experiencia',
                'información', 'situación', 'atención', 'condición', 'producción',
                'organización', 'presentación', 'aplicación'
            ]
        };

        const wordList = words[this.currentDifficulty];
        const word = wordList[Math.floor(Math.random() * wordList.length)];
        const missingIndex = Math.floor(Math.random() * word.length);
        const displayWord = word.split('').map((letter, index) => 
            index === missingIndex ? '_' : letter
        ).join('');

        return {
            type: 'complete',
            word: word,
            display: displayWord,
            missingIndex: missingIndex,
            hint: `Palabra de ${word.length} letras`
        };
    }

    static generateCorrectExercise() {
        const exercises = {
            easy: [
                { word: 'casa', incorrect: 'caza' },
                { word: 'mesa', incorrect: 'meza' },
                { word: 'vaca', incorrect: 'baca' },
                { word: 'hola', incorrect: 'ola' },
                { word: 'huevo', incorrect: 'uevo' },
                { word: 'cero', incorrect: 'sero' },
                { word: 'cima', incorrect: 'sima' }
            ],
            medium: [
                { word: 'escuela', incorrect: 'escwela' },
                { word: 'ventana', incorrect: 'bentana' },
                { word: 'jardín', incorrect: 'jardin' },
                { word: 'allí', incorrect: 'ayí' },
                { word: 'hecho', incorrect: 'echo' },
                { word: 'haber', incorrect: 'aver' },
                { word: 'hacia', incorrect: 'acia' }
            ],
            hard: [
                { word: 'conocimiento', incorrect: 'conosimiento' },
                { word: 'oportunidad', incorrect: 'oportunidad' },
                { word: 'responsabilidad', incorrect: 'responsabilidá' },
                { word: 'absolutamente', incorrect: 'absolutamiente' },
                { word: 'aproximadamente', incorrect: 'aproximademente' },
                { word: 'específicamente', incorrect: 'especificamente' },
                { word: 'extraordinario', incorrect: 'estraordinario' }
            ]
        };

        const exerciseList = exercises[this.currentDifficulty];
        return {
            type: 'correct',
            ...exerciseList[Math.floor(Math.random() * exerciseList.length)]
        };
    }

    static generateDictationExercise() {
        const sentences = {
            easy: [
                'El gato juega en el jardín.',
                'La casa es grande y bonita.',
                'Mi mamá cocina muy bien.',
                'El sol brilla en el cielo.',
                'Los niños van a la escuela.'
            ],
            medium: [
                'Los estudiantes aprenden en la escuela.',
                'El libro contiene muchas historias.',
                'La familia viaja en el verano.',
                'El médico ayuda a las personas.',
                'La música alegra el corazón.'
            ],
            hard: [
                'El conocimiento se adquiere con dedicación y esfuerzo constante.',
                'La comunicación efectiva es fundamental en las relaciones humanas.',
                'La perseverancia es esencial para alcanzar el éxito profesional.',
                'La biodiversidad del planeta requiere protección inmediata.',
                'La tecnología ha transformado radicalmente nuestra sociedad.'
            ]
        };

        const sentenceList = sentences[this.currentDifficulty];
        const sentence = sentenceList[Math.floor(Math.random() * sentenceList.length)];
        
        return {
            type: 'dictation',
            sentence: sentence,
            hint: 'Escribe la frase que escucharás'
        };
    }

    static generateMultipleChoiceExercise() {
        const exercises = {
            easy: [
                {
                    question: "¿Cuál es la escritura correcta?",
                    options: ["Baca", "Vaca", "Baca", "Vaka"],
                    correct: 1,
                    explanation: "'Vaca' se escribe con V"
                },
                {
                    question: "Selecciona la palabra bien escrita:",
                    options: ["Casa", "Caza", "Kasa", "Cassa"],
                    correct: 0,
                    explanation: "'Casa' es la escritura correcta"
                }
            ],
            medium: [
                {
                    question: "¿Cuál opción tiene la ortografía correcta?",
                    options: ["Haber", "A ver", "Haver", "Aber"],
                    correct: 0,
                    explanation: "'Haber' es un verbo, se escribe con H"
                },
                {
                    question: "Identifica la palabra correctamente escrita:",
                    options: ["Echo", "Hecho", "Exo", "Hexo"],
                    correct: 1,
                    explanation: "'Hecho' del verbo hacer lleva H"
                }
            ],
            hard: [
                {
                    question: "¿Cuál es la forma ortográficamente correcta?",
                    options: ["Yerro", "Hierro", "Gierro", "Jerro"],
                    correct: 1,
                    explanation: "'Hierro' se escribe con H"
                },
                {
                    question: "Selecciona la escritura apropiada:",
                    options: ["Vallamos", "Vayamos", "Ballamos", "Bayamos"],
                    correct: 1,
                    explanation: "'Vayamos' es la forma correcta del verbo ir"
                }
            ]
        };

        const exerciseList = exercises[this.currentDifficulty];
        return {
            type: 'multiple-choice',
            ...exerciseList[Math.floor(Math.random() * exerciseList.length)]
        };
    }

    static generateSynonymExercise() {
        const synonyms = {
            easy: [
                { word: "casa", synonym: "hogar", options: ["edificio", "hogar", "construcción", "apartamento"] },
                { word: "feliz", synonym: "alegre", options: ["triste", "alegre", "enojado", "calmado"] },
                { word: "grande", synonym: "enorme", options: ["pequeño", "mediano", "enorme", "regular"] }
            ],
            medium: [
                { word: "rápido", synonym: "veloz", options: ["lento", "veloz", "pausado", "tranquilo"] },
                { word: "inteligente", synonym: "listo", options: ["torpe", "listo", "simple", "complejo"] },
                { word: "hermoso", synonym: "bello", options: ["feo", "bello", "horrible", "común"] }
            ],
            hard: [
                { word: "perseverante", synonym: "tenaz", options: ["débil", "tenaz", "frágil", "inconstante"] },
                { word: "magnífico", synonym: "espléndido", options: ["pobre", "espléndido", "simple", "ordinario"] },
                { word: "minucioso", synonym: "detallista", options: ["general", "detallista", "superficial", "amplio"] }
            ]
        };

        const synonymList = synonyms[this.currentDifficulty];
        return {
            type: 'synonym',
            ...synonymList[Math.floor(Math.random() * synonymList.length)]
        };
    }

    static renderExercise(exercise) {
        const container = document.getElementById('spellingExercise');
        
        switch (exercise.type) {
            case 'complete':
                container.innerHTML = `
                    <div class="exercise complete-exercise">
                        <h3>Completa la palabra</h3>
                        <p class="word-display">${exercise.display}</p>
                        <p class="hint">${exercise.hint}</p>
                        <div class="input-group">
                            <input type="text" id="completeInput" maxlength="1" placeholder="Letra faltante" autocomplete="off">
                            <button class="btn btn-primary" onclick="SpellingModule.checkCompleteAnswer()">Verificar</button>
                        </div>
                        <p class="enter-hint">Presiona Enter para verificar</p>
                    </div>
                `;
                break;
                
            case 'correct':
                container.innerHTML = `
                    <div class="exercise correct-exercise">
                        <h3>Corrige la palabra</h3>
                        <p class="incorrect-word">"${exercise.incorrect}"</p>
                        <div class="input-group">
                            <input type="text" id="correctInput" placeholder="Escribe la corrección" autocomplete="off">
                            <button class="btn btn-primary" onclick="SpellingModule.checkCorrectAnswer()">Verificar</button>
                        </div>
                        <p class="enter-hint">Presiona Enter para verificar</p>
                    </div>
                `;
                break;
                
            case 'dictation':
                container.innerHTML = `
                    <div class="exercise dictation-exercise">
                        <h3>Ejercicio de Dictado</h3>
                        <p class="hint">${exercise.hint}</p>
                        <div class="audio-controls">
                            <button class="btn btn-secondary" onclick="SpellingModule.playDictation()">
                                <i class="fas fa-volume-up"></i> Escuchar
                            </button>
                            <button class="btn btn-outline" onclick="SpellingModule.playDictation()">
                                <i class="fas fa-redo"></i> Repetir
                            </button>
                        </div>
                        <textarea id="dictationInput" placeholder="Escribe lo que escuchas..." rows="3" autocomplete="off"></textarea>
                        <div class="input-group">
                            <button class="btn btn-primary" onclick="SpellingModule.checkDictationAnswer()">Verificar</button>
                        </div>
                        <p class="enter-hint">Presiona Enter para verificar</p>
                    </div>
                `;
                break;

            case 'multiple-choice':
                container.innerHTML = `
                    <div class="exercise multiple-choice-exercise">
                        <h3>Selección Múltiple</h3>
                        <p class="question">${exercise.question}</p>
                        <div class="options-container">
                            ${exercise.options.map((option, index) => `
                                <label class="option">
                                    <input type="radio" name="multipleChoice" value="${index}">
                                    <span class="option-text">${option}</span>
                                </label>
                            `).join('')}
                        </div>
                        <div class="input-group">
                            <button class="btn btn-primary" onclick="SpellingModule.checkMultipleChoiceAnswer()">Verificar</button>
                        </div>
                        <p class="enter-hint">Presiona Enter para verificar</p>
                    </div>
                `;
                break;

            case 'synonym':
                container.innerHTML = `
                    <div class="exercise synonym-exercise">
                        <h3>Sinónimos</h3>
                        <p class="question">Encuentra el sinónimo de: <strong>"${exercise.word}"</strong></p>
                        <div class="options-container">
                            ${exercise.options.map((option, index) => `
                                <label class="option">
                                    <input type="radio" name="synonym" value="${index}">
                                    <span class="option-text">${option}</span>
                                </label>
                            `).join('')}
                        </div>
                        <div class="input-group">
                            <button class="btn btn-primary" onclick="SpellingModule.checkSynonymAnswer()">Verificar</button>
                        </div>
                        <p class="enter-hint">Presiona Enter para verificar</p>
                    </div>
                `;
                break;
        }

        // Agregar event listeners para inputs de opciones
        if (exercise.type === 'multiple-choice' || exercise.type === 'synonym') {
            this.setupOptionListeners();
        }
    }

    static setupOptionListeners() {
        document.querySelectorAll('.option input').forEach(radio => {
            radio.addEventListener('change', () => {
                // Resaltar la opción seleccionada
                document.querySelectorAll('.option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                radio.closest('.option').classList.add('selected');
            });
        });
    }

    static focusOnInput() {
        setTimeout(() => {
            const input = document.querySelector('input[type="text"], textarea');
            if (input) {
                input.focus();
            }
        }, 100);
    }

    static checkCompleteAnswer() {
        const input = document.getElementById('completeInput');
        const userAnswer = input.value.toLowerCase().trim();
        const correctAnswer = this.currentExercise.word[this.currentExercise.missingIndex].toLowerCase();

        if (userAnswer === correctAnswer) {
            this.handleCorrectAnswer();
        } else {
            this.handleIncorrectAnswer(`La letra correcta era: "${correctAnswer.toUpperCase()}"`);
        }
    }

    static checkCorrectAnswer() {
        const input = document.getElementById('correctInput');
        const userAnswer = input.value.toLowerCase().trim();
        const correctAnswer = this.currentExercise.word.toLowerCase();

        if (userAnswer === correctAnswer) {
            this.handleCorrectAnswer();
        } else {
            this.handleIncorrectAnswer(`La palabra correcta es: "${this.currentExercise.word}"`);
        }
    }

    static checkDictationAnswer() {
        const input = document.getElementById('dictationInput');
        const userAnswer = input.value.trim();
        const correctAnswer = this.currentExercise.sentence;

        // Comparación más flexible para dictados
        const normalizedUser = userAnswer.toLowerCase().replace(/[.,!?;]/g, '').replace(/\s+/g, ' ').trim();
        const normalizedCorrect = correctAnswer.toLowerCase().replace(/[.,!?;]/g, '').replace(/\s+/g, ' ').trim();

        if (normalizedUser === normalizedCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleIncorrectAnswer(`La frase correcta es: "${correctAnswer}"`);
        }
    }

    static checkMultipleChoiceAnswer() {
        const selected = document.querySelector('input[name="multipleChoice"]:checked');
        if (!selected) {
            UI.showNotification('Por favor selecciona una opción', 'warning');
            return;
        }

        const userAnswer = parseInt(selected.value);
        const correctAnswer = this.currentExercise.correct;

        if (userAnswer === correctAnswer) {
            this.handleCorrectAnswer(this.currentExercise.explanation);
        } else {
            this.handleIncorrectAnswer(`${this.currentExercise.explanation}. La opción correcta era: "${this.currentExercise.options[correctAnswer]}"`);
        }
    }

    static checkSynonymAnswer() {
        const selected = document.querySelector('input[name="synonym"]:checked');
        if (!selected) {
            UI.showNotification('Por favor selecciona una opción', 'warning');
            return;
        }

        const userAnswer = parseInt(selected.value);
        const correctAnswer = this.currentExercise.options.indexOf(this.currentExercise.synonym);

        if (userAnswer === correctAnswer) {
            this.handleCorrectAnswer(`¡Correcto! "${this.currentExercise.synonym}" es sinónimo de "${this.currentExercise.word}"`);
        } else {
            this.handleIncorrectAnswer(`El sinónimo correcto de "${this.currentExercise.word}" es: "${this.currentExercise.synonym}"`);
        }
    }

    static playDictation() {
        // Usar Web Speech API si está disponible
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(this.currentExercise.sentence);
            utterance.lang = 'es-ES';
            utterance.rate = 0.8;
            utterance.pitch = 1;
            speechSynthesis.speak(utterance);
        } else {
            UI.showNotification('Tu navegador no soporta la funcionalidad de voz', 'warning');
        }
    }

    static handleCorrectAnswer(additionalMessage = '') {
        this.streak++;
        this.maxStreak = Math.max(this.streak, this.maxStreak);
        
        const points = this.calculatePoints();
        const message = `¡Correcto! ${additionalMessage}` + (this.streak > 1 ? ` 🔥 Racha: ${this.streak}` : '');
        
        UI.showFeedback(message, 'correct');
        this.updateScore(points);
        
        // Efecto visual de éxito
        this.showSuccessEffect();
        
        // Avanzar al siguiente ejercicio después de un breve delay
        setTimeout(() => {
            this.generateExercise();
        }, 1500);
        
        this.updateUserProgress(true);
    }

    static handleIncorrectAnswer(correctAnswer) {
        this.streak = 0;
        UI.showFeedback(`Incorrecto. ${correctAnswer}`, 'incorrect');
        this.updateUserProgress(false);
        
        // Mostrar la respuesta correcta brevemente antes de continuar
        setTimeout(() => {
            this.generateExercise();
        }, 2500);
    }

    static calculatePoints() {
        let basePoints = 10;
        let multiplier = 1;

        // Bonus por dificultad
        if (this.currentDifficulty === 'medium') multiplier += 0.5;
        if (this.currentDifficulty === 'hard') multiplier += 1;

        // Bonus por racha
        if (this.streak >= 5) multiplier += 0.5;
        if (this.streak >= 10) multiplier += 0.5;

        return Math.round(basePoints * multiplier);
    }

    static showSuccessEffect() {
        const exerciseContainer = document.getElementById('spellingExercise');
        exerciseContainer.classList.add('success-flash');
        setTimeout(() => {
            exerciseContainer.classList.remove('success-flash');
        }, 500);
    }

    static updateScore(points) {
        this.score += points;
        this.exercisesCompleted++;
        this.updateProgressDisplay();
    }

    static updateProgressDisplay() {
        document.getElementById('currentScore').textContent = this.score;
        document.getElementById('currentLevel').textContent = this.level;
        
        // Actualizar racha si existe el elemento
        const streakElement = document.getElementById('currentStreak');
        if (streakElement) {
            streakElement.textContent = this.streak;
        }
    }

    static updateUserProgress(isCorrect) {
        if (!window.app || !window.app.currentUser) return;

        const progress = Storage.getUserProgress(window.app.currentUser.id);
        if (!progress.spelling) {
            progress.spelling = {
                score: 0,
                level: 1,
                exercisesCompleted: 0,
                accuracy: 0,
                streak: 0,
                maxStreak: 0
            };
        }

        const spellingProgress = progress.spelling;
        
        // Actualizar estadísticas básicas
        spellingProgress.score = this.score;
        spellingProgress.exercisesCompleted = this.exercisesCompleted;
        spellingProgress.streak = this.streak;
        spellingProgress.maxStreak = this.maxStreak;

        // Calcular precisión
        const totalExercises = spellingProgress.exercisesCompleted;
        const correctAnswers = isCorrect ? 
            (spellingProgress.accuracy * (totalExercises - 1) + 1) / totalExercises :
            (spellingProgress.accuracy * (totalExercises - 1)) / totalExercises;
        
        spellingProgress.accuracy = Math.round(correctAnswers * 100) / 100;

        // Subir de nivel cada 10 ejercicios completados
        const newLevel = Math.floor(totalExercises / 10) + 1;
        if (newLevel > spellingProgress.level) {
            spellingProgress.level = newLevel;
            this.level = newLevel;
            UI.showNotification(`¡Felicidades! Has subido al nivel ${newLevel}`, 'success');
        }

        Storage.saveUserProgress(window.app.currentUser.id, progress);
        this.updateProgressDisplay();
    }
}