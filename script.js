
const colors = ['red', 'blue', 'green', 'yellow'];
let sequence = [];
let userSequence = [];
let level = 0;
let gameStarted = false;

const startButton = document.getElementById('start');
const message = document.getElementById('message');

startButton.addEventListener('click', startGame);

function startGame() {
    sequence = [];
    userSequence = [];
    level = 0;
    gameStarted = true;
    message.textContent = '';
    nextLevel();
}

function nextLevel() {
    userSequence = [];
    level++;
    message.textContent = `Nível ${level}`;
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    sequence.push(randomColor);
    playSequence();
}

function playSequence() {
    let index = 0;
    const interval = setInterval(() => {
        if (index >= sequence.length) {
            clearInterval(interval);
            return;
        }
        const color = sequence[index];
        flashButton(color);
        index++;
    }, 1000);
}

function flashButton(color) {
    const button = document.querySelector(`.${color}`);
    button.style.opacity = '1';
    setTimeout(() => {
        button.style.opacity = '0.8';
    }, 500);
}

document.querySelectorAll('.button').forEach(button => {
    button.addEventListener('click', () => {
        if (!gameStarted) return;
        const color = button.classList[1];
        userSequence.push(color);
        flashButton(color);
        checkSequence(userSequence.length - 1);
    });
});

function checkSequence(index) {
    if (userSequence[index] !== sequence[index]) {
        message.textContent = 'Errou! Tente novamente.';
        gameStarted = false;
        return;
    }
    if (userSequence.length === sequence.length) {
        setTimeout(nextLevel, 1000);
    }
}