class SpellingModule {
    static currentExercise = null;
    static currentDifficulty = 'easy';
    static score = 0;
    static level = 1;

    static init() {
        this.setupEventListeners();
        this.loadUserProgress();
        this.generateExercise();
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
    }

    static loadUserProgress() {
        if (window.app.currentUser) {
            const progress = Storage.getUserProgress(window.app.currentUser.id);
            if (progress && progress.spelling) {
                this.score = progress.spelling.score || 0;
                this.level = progress.spelling.level || 1;
                this.updateProgressDisplay();
            }
        }
    }

    static generateExercise() {
        const exerciseType = document.getElementById('exerciseType').value;
        let exercise;

        switch (exerciseType) {
            case 'complete':
                exercise = this.generateCompleteExercise();
                break;
            case 'correct':
                exercise = this.generateCorrectExercise();
                break;
            case 'dictation':
                exercise = this.generateDictationExercise();
                break;
        }

        this.currentExercise = exercise;
        this.renderExercise(exercise);
    }

    static generateCompleteExercise() {
        const words = {
            easy: ['casa', 'mesa', 'silla', 'libro', 'gato'],
            medium: ['escuela', 'ventana', 'puerta', 'jardín', 'cocina'],
            hard: ['conocimiento', 'oportunidad', 'responsabilidad', 'comunicación', 'transformación']
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
                { word: 'vaca', incorrect: 'baca' }
            ],
            medium: [
                { word: 'escuela', incorrect: 'escwela' },
                { word: 'ventana', incorrect: 'bentana' },
                { word: 'jardín', incorrect: 'jardin' }
            ],
            hard: [
                { word: 'conocimiento', incorrect: 'conosimiento' },
                { word: 'oportunidad', incorrect: 'oportunidad' },
                { word: 'responsabilidad', incorrect: 'responsabilidá' }
            ]
        };

        return {
            type: 'correct',
            ...exercises[this.currentDifficulty][Math.floor(Math.random() * exercises[this.currentDifficulty].length)]
        };
    }

    static generateDictationExercise() {
        const sentences = {
            easy: ['El gato juega en el jardín.', 'La casa es grande y bonita.'],
            medium: ['Los estudiantes aprenden en la escuela.', 'El libro contiene muchas historias.'],
            hard: ['El conocimiento se adquiere con dedicación y esfuerzo constante.', 'La comunicación efectiva es fundamental en las relaciones humanas.']
        };

        const sentence = sentences[this.currentDifficulty][Math.floor(Math.random() * sentences[this.currentDifficulty].length)];
        
        return {
            type: 'dictation',
            sentence: sentence,
            hint: 'Escribe la frase que escucharás'
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
                        <input type="text" id="completeInput" maxlength="1" placeholder="Letra faltante">
                        <button class="btn btn-primary" onclick="SpellingModule.checkCompleteAnswer()">Verificar</button>
                    </div>
                `;
                break;
                
            case 'correct':
                container.innerHTML = `
                    <div class="exercise correct-exercise">
                        <h3>Corrige la palabra</h3>
                        <p class="incorrect-word">${exercise.incorrect}</p>
                        <input type="text" id="correctInput" placeholder="Escribe la corrección">
                        <button class="btn btn-primary" onclick="SpellingModule.checkCorrectAnswer()">Verificar</button>
                    </div>
                `;
                break;
                
            case 'dictation':
                container.innerHTML = `
                    <div class="exercise dictation-exercise">
                        <h3>Ejercicio de Dictado</h3>
                        <p class="hint">${exercise.hint}</p>
                        <button class="btn btn-secondary" onclick="SpellingModule.playDictation()">
                            <i class="fas fa-volume-up"></i> Escuchar
                        </button>
                        <textarea id="dictationInput" placeholder="Escribe lo que escuchas..." rows="3"></textarea>
                        <button class="btn btn-primary" onclick="SpellingModule.checkDictationAnswer()">Verificar</button>
                    </div>
                `;
                break;
        }
    }

    static checkCompleteAnswer() {
        const input = document.getElementById('completeInput');
        const userAnswer = input.value.toLowerCase();
        const correctAnswer = this.currentExercise.word[this.currentExercise.missingIndex].toLowerCase();

        if (userAnswer === correctAnswer) {
            this.handleCorrectAnswer();
        } else {
            this.handleIncorrectAnswer(`La letra correcta era: ${correctAnswer}`);
        }
    }

    static checkCorrectAnswer() {
        const input = document.getElementById('correctInput');
        const userAnswer = input.value.toLowerCase().trim();
        const correctAnswer = this.currentExercise.word.toLowerCase();

        if (userAnswer === correctAnswer) {
            this.handleCorrectAnswer();
        } else {
            this.handleIncorrectAnswer(`La palabra correcta es: ${this.currentExercise.word}`);
        }
    }

    static checkDictationAnswer() {
        const input = document.getElementById('dictationInput');
        const userAnswer = input.value.trim();
        const correctAnswer = this.currentExercise.sentence;

        // Comparación más flexible para dictados
        const normalizedUser = userAnswer.toLowerCase().replace(/[.,]/g, '').trim();
        const normalizedCorrect = correctAnswer.toLowerCase().replace(/[.,]/g, '').trim();

        if (normalizedUser === normalizedCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleIncorrectAnswer(`La frase correcta es: "${correctAnswer}"`);
        }
    }

    static playDictation() {
        // Usar Web Speech API si está disponible
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(this.currentExercise.sentence);
            utterance.lang = 'es-ES';
            utterance.rate = 0.8;
            speechSynthesis.speak(utterance);
        } else {
            UI.showNotification('Tu navegador no soporta la funcionalidad de voz', 'warning');
        }
    }

    static handleCorrectAnswer() {
        UI.showFeedback('¡Correcto! Muy bien hecho.', 'correct');
        this.updateScore(10);
        this.generateExercise();
        
        // Actualizar progreso del usuario
        if (window.app.currentUser) {
            const progress = Storage.getUserProgress(window.app.currentUser.id);
            const spellingProgress = progress.spelling;
            
            const updatedProgress = {
                score: spellingProgress.score + 10,
                exercisesCompleted: spellingProgress.exercisesCompleted + 1,
                accuracy: ((spellingProgress.accuracy * spellingProgress.exercisesCompleted) + 1) / (spellingProgress.exercisesCompleted + 1)
            };
            
            // Subir de nivel cada 5 ejercicios completados
            if (updatedProgress.exercisesCompleted % 5 === 0) {
                updatedProgress.level = spellingProgress.level + 1;
                UI.showNotification(`¡Felicidades! Has subido al nivel ${updatedProgress.level}`, 'success');
            }
            
            window.app.updateUserProgress('spelling', updatedProgress);
        }
    }

    static handleIncorrectAnswer(correctAnswer) {
        UI.showFeedback(`Incorrecto. ${correctAnswer}`, 'incorrect');
        
        // Actualizar precisión
        if (window.app.currentUser) {
            const progress = Storage.getUserProgress(window.app.currentUser.id);
            const spellingProgress = progress.spelling;
            
            const updatedProgress = {
                exercisesCompleted: spellingProgress.exercisesCompleted + 1,
                accuracy: (spellingProgress.accuracy * spellingProgress.exercisesCompleted) / (spellingProgress.exercisesCompleted + 1)
            };
            
            window.app.updateUserProgress('spelling', updatedProgress);
        }
    }

    static updateScore(points) {
        this.score += points;
        this.updateProgressDisplay();
    }

    static updateProgressDisplay() {
        document.getElementById('currentScore').textContent = this.score;
        document.getElementById('currentLevel').textContent = this.level;
    }
}