class DropCatchGame {
    constructor() {
        this.gameArea = document.getElementById('gameArea');
        this.catcher = document.getElementById('catcher');
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
        this.levelElement = document.getElementById('level');
        this.gameOverElement = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        this.finalLevelElement = document.getElementById('finalLevel');
        this.gameMusic = document.getElementById('gameMusic');
        // Set volume to 50%
        if (this.gameMusic) {
            this.gameMusic.volume = 0.5;
        }

        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameRunning = false;
        this.catcherPosition = 50; // percentage
        this.fallingObjects = [];
        this.gameSpeed = 2000; // milliseconds between drops
        this.dropInterval = null;
        this.musicStarted = false;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startGame();
    }

    startMusic() {
        if (!this.musicStarted && this.gameMusic) {
            this.gameMusic.play().then(() => {
                this.musicStarted = true;
            }).catch(error => {
                console.log('Audio playback failed:', error);
            });
        }
    }

    setupEventListeners() {
        // Enable audio on first user interaction
        const enableAudio = () => {
            this.startMusic();
            document.removeEventListener('keydown', enableAudio);
            document.removeEventListener('click', enableAudio);
            document.removeEventListener('touchstart', enableAudio);
        };
        
        document.addEventListener('keydown', enableAudio);
        document.addEventListener('click', enableAudio);
        document.addEventListener('touchstart', enableAudio);

        document.addEventListener('keydown', (e) => {
            // Start music on first keypress if not started
            if (!this.musicStarted) {
                this.startMusic();
            }
            
            if (!this.gameRunning) return;

            switch(e.key.toLowerCase()) {
                case 'a':
                case 'arrowleft':
                    this.moveCatcher(-10);
                    break;
                case 'd':
                case 'arrowright':
                    this.moveCatcher(10);
                    break;
            }
        });

        // Touch/mouse support for mobile
        this.gameArea.addEventListener('click', (e) => {
            // Start music on first click if not started
            if (!this.musicStarted) {
                this.startMusic();
            }
            
            if (!this.gameRunning) return;
            
            const rect = this.gameArea.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickPercentage = (clickX / rect.width) * 100;
            
            if (clickPercentage < this.catcherPosition) {
                this.moveCatcher(-20);
            } else {
                this.moveCatcher(20);
            }
        });
    }

    moveCatcher(delta) {
        this.catcherPosition = Math.max(0, Math.min(100, this.catcherPosition + delta));
        this.catcher.style.left = this.catcherPosition + '%';
    }

    startGame() {
        this.gameRunning = true;
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameSpeed = 2000;
        this.fallingObjects = [];
        
        this.updateDisplay();
        this.gameOverElement.style.display = 'none';
        
        // Start playing game music (will work after user interaction)
        this.startMusic();
        
        this.dropInterval = setInterval(() => {
            this.createFallingObject();
        }, this.gameSpeed);

        this.gameLoop();
    }

    createFallingObject() {
        if (!this.gameRunning) return;

        const object = document.createElement('div');
        object.className = 'falling-object';
        
        // Random position
        const leftPosition = Math.random() * 85 + 7.5; // 7.5% to 92.5%
        object.style.left = leftPosition + '%';
        
        // Random object type
        const objectType = Math.random();
        let points = 0;
        let isBad = false;
        
        if (objectType < 0.6) {
            // 60% chance for good object
            object.classList.add('good-object');
            points = 10;
        } else if (objectType < 0.9) {
            // 30% chance for bad object
            object.classList.add('bad-object');
            isBad = true;
        } else {
            // 10% chance for bonus object
            object.classList.add('bonus-object');
            points = 50;
        }

        // Random fall speed
        const fallSpeed = Math.random() * 2 + 1; // 1-3 seconds
        object.style.animationDuration = fallSpeed + 's';

        this.gameArea.appendChild(object);
        
        this.fallingObjects.push({
            element: object,
            left: leftPosition,
            points: points,
            isBad: isBad,
            caught: false
        });

        // Remove object after animation
        setTimeout(() => {
            if (object.parentNode) {
                this.removeObject(object, false);
            }
        }, fallSpeed * 1000);
    }

    removeObject(objectElement, wasCaught) {
        const objectIndex = this.fallingObjects.findIndex(obj => obj.element === objectElement);
        if (objectIndex !== -1) {
            const object = this.fallingObjects[objectIndex];
            
            if (wasCaught) {
                if (object.isBad) {
                    // Bad object caught - lose life
                    this.lives--;
                    this.updateDisplay();
                    
                    if (this.lives <= 0) {
                        this.gameOver();
                    }
                } else {
                    // Good object caught - add points
                    this.score += object.points;
                    this.updateDisplay();
                    
                    // Check for level up
                    if (this.score > 0 && this.score % 100 === 0) {
                        this.levelUp();
                    }
                }
            } else {
                // Object missed - no penalty for any type
            }
            
            this.fallingObjects.splice(objectIndex, 1);
        }
        
        if (objectElement.parentNode) {
            objectElement.remove();
        }
    }

    levelUp() {
        this.level++;
        this.gameSpeed = Math.max(500, this.gameSpeed - 200); // Faster drops
        
        // Clear current interval and set new one
        clearInterval(this.dropInterval);
        this.dropInterval = setInterval(() => {
            this.createFallingObject();
        }, this.gameSpeed);
        
        this.updateDisplay();
        
        // Visual feedback for level up
        this.showLevelUpEffect();
    }

    showLevelUpEffect() {
        const effect = document.createElement('div');
        effect.style.position = 'absolute';
        effect.style.top = '50%';
        effect.style.left = '50%';
        effect.style.transform = 'translate(-50%, -50%)';
        effect.style.color = '#FFD700';
        effect.style.fontSize = '24px';
        effect.style.fontWeight = 'bold';
        effect.style.pointerEvents = 'none';
        effect.style.zIndex = '1000';
        effect.textContent = `Level ${this.level}!`;
        
        this.gameArea.appendChild(effect);
        
        setTimeout(() => {
            effect.remove();
        }, 2000);
    }

    gameOver() {
        this.gameRunning = false;
        clearInterval(this.dropInterval);
        
        // Stop game music
        if (this.gameMusic) {
            this.gameMusic.pause();
            this.gameMusic.currentTime = 0;
            this.musicStarted = false;
        }
        
        // Clear all falling objects
        this.fallingObjects.forEach(obj => {
            if (obj.element.parentNode) {
                obj.element.remove();
            }
        });
        this.fallingObjects = [];
        
        this.finalScoreElement.textContent = this.score;
        this.finalLevelElement.textContent = this.level;
        this.gameOverElement.style.display = 'block';
    }

    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.livesElement.textContent = this.lives;
        this.levelElement.textContent = this.level;
    }

    gameLoop() {
        if (!this.gameRunning) return;

        // Check collisions
        this.fallingObjects.forEach(obj => {
            if (obj.caught) return;

            const objectRect = obj.element.getBoundingClientRect();
            const catcherRect = this.catcher.getBoundingClientRect();
            
            // Check if object is near the catcher
            if (objectRect.bottom >= catcherRect.top && 
                objectRect.top <= catcherRect.bottom &&
                objectRect.left < catcherRect.right && 
                objectRect.right > catcherRect.left) {
                
                obj.caught = true;
                this.removeObject(obj.element, true);
            }
        });

        requestAnimationFrame(() => this.gameLoop());
    }
}

// Global functions
function restartGame() {
    game.startGame();
    // Restart music when game restarts
    if (game.gameMusic && game.musicStarted) {
        game.gameMusic.currentTime = 0;
        game.gameMusic.play().catch(error => {
            console.log('Audio playback failed:', error);
        });
    }
}

// Initialize game when page loads
let game;
window.addEventListener('load', () => {
    game = new DropCatchGame();
});
