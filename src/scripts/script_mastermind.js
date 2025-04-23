// Configuration du jeu
const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
const CODE_LENGTH = 4;
const MAX_ATTEMPTS = 10;

// État du jeu
let gameState = {
    secretCode: [],
    currentGuess: [],
    attempts: [],
    currentAttempt: 0,
    gameOver: false
};

// Éléments du DOM
const attemptElement = document.getElementById('attempt');
const newGameBtn = document.getElementById('new-game-btn');
const colorPaletteElement = document.getElementById('color-palette');
const currentSelectionElement = document.getElementById('current-selection');
const submitGuessBtn = document.getElementById('submit-guess');
const gameBoardElement = document.getElementById('game-board');
const resultMessageElement = document.getElementById('result-message');

// Initialiser le jeu
function initGame() {
    // Générer le code secret
    gameState.secretCode = Array.from({length: CODE_LENGTH}, () => 
        COLORS[Math.floor(Math.random() * COLORS.length)]
    );
    
    // Réinitialiser l'état du jeu
    gameState.currentGuess = [];
    gameState.attempts = [];
    gameState.currentAttempt = 0;
    gameState.gameOver = false;
    
    // Mettre à jour l'interface
    attemptElement.textContent = '1';
    resultMessageElement.classList.add('hidden');
    gameBoardElement.innerHTML = '';
    currentSelectionElement.innerHTML = '';
    
    // Créer la palette de couleurs
    renderColorPalette();
    
    console.log("Code secret:", gameState.secretCode); // Pour le débogage
}

// Créer la palette de couleurs
function renderColorPalette() {
    colorPaletteElement.innerHTML = '';
    
    COLORS.forEach(color => {
        const colorBtn = document.createElement('button');
        colorBtn.className = `peg w-8 h-8 rounded-full bg-${color}-500 hover:bg-${color}-600 border-2 border-${color}-700`;
        colorBtn.dataset.color = color;
        colorBtn.addEventListener('click', () => selectColor(color));
        colorPaletteElement.appendChild(colorBtn);
    });
}

// Sélectionner une couleur
function selectColor(color) {
    if (gameState.gameOver || gameState.currentGuess.length >= CODE_LENGTH) return;
    
    gameState.currentGuess.push(color);
    updateCurrentSelection();
}

// Mettre à jour l'affichage de la sélection actuelle
function updateCurrentSelection() {
    currentSelectionElement.innerHTML = '';
    
    gameState.currentGuess.forEach(color => {
        const peg = document.createElement('div');
        peg.className = `peg w-6 h-6 rounded-full bg-${color}-500 border border-${color}-700`;
        currentSelectionElement.appendChild(peg);
    });
    
    // Ajouter des cases vides si nécessaire
    for (let i = gameState.currentGuess.length; i < CODE_LENGTH; i++) {
        const emptyPeg = document.createElement('div');
        emptyPeg.className = 'w-6 h-6 rounded-full border-2 border-gray-600';
        currentSelectionElement.appendChild(emptyPeg);
    }
}

// Valider une tentative
function submitGuess() {
    if (gameState.gameOver || 
        gameState.currentGuess.length !== CODE_LENGTH || 
        gameState.currentAttempt >= MAX_ATTEMPTS) return;
    
    // Calculer les feedbacks
    const feedback = calculateFeedback(gameState.currentGuess, gameState.secretCode);
    
    // Enregistrer la tentative
    gameState.attempts.push({
        guess: [...gameState.currentGuess],
        feedback
    });
    
    gameState.currentAttempt++;
    attemptElement.textContent = gameState.currentAttempt + 1;
    gameState.currentGuess = [];
    updateCurrentSelection();
    
    // Afficher les tentatives
    renderAttempts();
    
    // Vérifier si le joueur a gagné
    if (feedback.correctPosition === CODE_LENGTH) {
        endGame(true);
        return;
    }
    
    // Vérifier si le joueur a perdu
    if (gameState.currentAttempt >= MAX_ATTEMPTS) {
        endGame(false);
    }
}

// Calculer les feedbacks (pions noirs et blancs)
function calculateFeedback(guess, secret) {
    let correctPosition = 0;
    let correctColor = 0;
    
    // Faire une copie pour ne pas modifier les tableaux originaux
    const guessCopy = [...guess];
    const secretCopy = [...secret];
    
    // D'abord compter les pions bien placés (noirs)
    for (let i = 0; i < CODE_LENGTH; i++) {
        if (guessCopy[i] === secretCopy[i]) {
            correctPosition++;
            guessCopy[i] = null;
            secretCopy[i] = null;
        }
    }
    
    // Ensuite compter les bonnes couleurs mais mal placées (blancs)
    for (let i = 0; i < CODE_LENGTH; i++) {
        if (guessCopy[i] === null) continue;
        
        const indexInSecret = secretCopy.indexOf(guessCopy[i]);
        if (indexInSecret !== -1) {
            correctColor++;
            secretCopy[indexInSecret] = null;
        }
    }
    
    return { correctPosition, correctColor };
}

// Afficher les tentatives
function renderAttempts() {
    gameBoardElement.innerHTML = '';
    
    gameState.attempts.forEach((attempt, attemptIndex) => {
        const attemptElement = document.createElement('div');
        attemptElement.className = 'flex items-center gap-2 p-2 bg-gray-700 rounded';
        
        // Numéro de tentative
        const attemptNumber = document.createElement('div');
        attemptNumber.className = 'w-6 text-center font-bold text-gray-300';
        attemptNumber.textContent = attemptIndex + 1;
        attemptElement.appendChild(attemptNumber);
        
        // Pions de la tentative
        const pegsContainer = document.createElement('div');
        pegsContainer.className = 'flex gap-1';
        
        attempt.guess.forEach(color => {
            const peg = document.createElement('div');
            peg.className = `peg w-6 h-6 rounded-full bg-${color}-500 border border-${color}-700`;
            pegsContainer.appendChild(peg);
        });
        
        attemptElement.appendChild(pegsContainer);
        
        // Feedback
        const feedbackContainer = document.createElement('div');
        feedbackContainer.className = 'flex flex-wrap gap-1 w-16 ml-auto';
        
        // Pions noirs (bonne couleur et position)
        for (let i = 0; i < attempt.feedback.correctPosition; i++) {
            const fbPeg = document.createElement('div');
            fbPeg.className = 'feedback-peg bg-black';
            feedbackContainer.appendChild(fbPeg);
        }
        
        // Pions blancs (bonne couleur mais mauvaise position)
        for (let i = 0; i < attempt.feedback.correctColor; i++) {
            const fbPeg = document.createElement('div');
            fbPeg.className = 'feedback-peg bg-white border border-gray-400';
            feedbackContainer.appendChild(fbPeg);
        }
        
        attemptElement.appendChild(feedbackContainer);
        gameBoardElement.appendChild(attemptElement);
    });
}

// Terminer le jeu
function endGame(isWin) {
    gameState.gameOver = true;
    
    if (isWin) {
        resultMessageElement.textContent = `Bravo! Vous avez trouvé en ${gameState.currentAttempt} tentatives!`;
        resultMessageElement.className = 'text-center text-xl font-bold text-green-400';
    } else {
        resultMessageElement.textContent = 'Dommage! Le code était:';
        resultMessageElement.className = 'text-center text-xl font-bold text-green-400';
        
        // Afficher le code secret
        const secretCodeElement = document.createElement('div');
        secretCodeElement.className = 'flex gap-1 justify-center mt-2';
        
        gameState.secretCode.forEach(color => {
            const peg = document.createElement('div');
            peg.className = `w-8 h-8 rounded-full bg-${color}-500 border-2 border-${color}-700`;
            secretCodeElement.appendChild(peg);
        });
        
        resultMessageElement.appendChild(secretCodeElement);
    }
    
    resultMessageElement.classList.remove('hidden');
}

// Écouteurs d'événements
newGameBtn.addEventListener('click', initGame);
submitGuessBtn.addEventListener('click', submitGuess);

// Permettre de supprimer des pions avec clic droit
currentSelectionElement.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (!gameState.gameOver && gameState.currentGuess.length > 0) {
        gameState.currentGuess.pop();
        updateCurrentSelection();
    }
});

// Démarrer le jeu
initGame();