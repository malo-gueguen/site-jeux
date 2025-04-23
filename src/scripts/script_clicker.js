// État du jeu
const gameState = {
    points: 5000,
    pointsPerSecond: 0,
    upgrades: [
        {
            id: 1,
            name: "Curseur",
            description: "Gagnez 0.1 point par seconde",
            baseCost: 10,
            owned: 0,
            pointsPerSecond: 0.1
        },
        {
            id: 2,
            name: "Grand-mère",
            description: "Gagnez 1 point par seconde",
            baseCost: 50,
            owned: 0,
            pointsPerSecond: 1
        },
        {
            id: 3,
            name: "Ferme",
            description: "Gagnez 5 points par seconde",
            baseCost: 200,
            owned: 0,
            pointsPerSecond: 5
        },
        {
            id: 4,
            name: "Usine",
            description: "Gagnez 20 points par seconde",
            baseCost: 1000,
            owned: 0,
            pointsPerSecond: 20
        }
    ],
    lastUpdate: Date.now()
};

// Éléments du DOM
const pointsElement = document.getElementById('points');
const ppsElement = document.getElementById('pps');
const clickButton = document.getElementById('clickButton');
const upgradesContainer = document.getElementById('upgrades');

// Fonction pour mettre à jour l'affichage
function updateDisplay() {
    pointsElement.textContent = Math.floor(gameState.points);
    ppsElement.textContent = gameState.pointsPerSecond.toFixed(1);
}

// Fonction pour calculer le coût d'une amélioration
function calculateCost(baseCost, owned) {
    return Math.floor(baseCost * Math.pow(1.15, owned));
}

// Fonction pour créer les éléments d'amélioration
function renderUpgrades() {
    upgradesContainer.innerHTML = '';
    
    gameState.upgrades.forEach(upgrade => {
        const cost = calculateCost(upgrade.baseCost, upgrade.owned);
        const canAfford = gameState.points >= cost;
        
        const upgradeElement = document.createElement('div');
        upgradeElement.className = 'bg-gray-700 p-4 rounded-lg border border-gray-600';
        upgradeElement.innerHTML = `
            <div class="flex justify-between items-center">
                        <div>
                            <h3 class="font-medium text-gray-300">${upgrade.name}</h3>
                            <p class="text-sm text-gray-400">${upgrade.description}</p>
                            <p class="text-xs text-gray-500">Possédé: ${upgrade.owned}</p>
                        </div>
                        <button 
                            data-id="${upgrade.id}" 
                            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition ${!canAfford ? 'opacity-50 cursor-not-allowed' : ''}"
                            ${!canAfford ? 'disabled' : ''}
                        >
                            Acheter (${cost})
                        </button>
                    </div>
                
        `;
        
        // Ajout de l'event listener directement sur le bouton
        const buyButton = upgradeElement.querySelector('button');
        buyButton.addEventListener('click', () => {
            buyUpgrade(upgrade.id);
        });
        
        upgradesContainer.appendChild(upgradeElement);
    });
}

// Fonction pour acheter une amélioration
function buyUpgrade(id) {
    const upgrade = gameState.upgrades.find(u => u.id === id);
    if (!upgrade) return;
    
    const cost = calculateCost(upgrade.baseCost, upgrade.owned);
    
    if (gameState.points >= cost) {
        gameState.points -= cost;
        upgrade.owned += 1;
        
        // Recalculer les points par seconde
        gameState.pointsPerSecond = gameState.upgrades.reduce((total, u) => {
            return total + (u.owned * u.pointsPerSecond);
        }, 0);
        
        updateDisplay();
        renderUpgrades();
    }
}

// Gestionnaire d'événement pour le bouton de clic
clickButton.addEventListener('click', () => {
    gameState.points += 1;
    updateDisplay();
    renderUpgrades();
});

// Boucle de jeu pour les points par seconde
function gameLoop() {
    const now = Date.now();
    const deltaTime = (now - gameState.lastUpdate) / 1000; // en secondes
    gameState.lastUpdate = now;
    
    if (deltaTime > 0) {
        gameState.points += gameState.pointsPerSecond * deltaTime;
        updateDisplay();
        
        // Vérifier si des améliorations sont maintenant abordables
        const anyUpgradeAffordable = gameState.upgrades.some(upgrade => {
            const cost = calculateCost(upgrade.baseCost, upgrade.owned);
            return gameState.points >= cost;
        });
        
        if (anyUpgradeAffordable) {
            renderUpgrades();
        }
    }
    
    requestAnimationFrame(gameLoop);
}

// Initialisation
updateDisplay();
renderUpgrades();
gameState.lastUpdate = Date.now();
requestAnimationFrame(gameLoop);