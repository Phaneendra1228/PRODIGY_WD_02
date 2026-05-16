// Game State
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let gameMode = 'pvp'; // 'pvp' or 'pva'
let aiDifficulty = 'easy'; // 'easy' or 'hard'

// Scores
let scores = { X: 0, O: 0, Ties: 0 };

// Winning Combinations
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// DOM Elements
const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status-text');
const resetBtn = document.getElementById('reset-btn');
const modeBtns = document.querySelectorAll('.mode-btn');
const difficultyContainer = document.getElementById('difficulty-container');
const diffBtns = document.querySelectorAll('.diff-btn');
const modal = document.getElementById('modal');
const modalMsg = document.getElementById('modal-msg');
const modalClose = document.getElementById('modal-close');

const scoreXEl = document.getElementById('score-x');
const scoreOEl = document.getElementById('score-o');
const scoreTiesEl = document.getElementById('score-ties');

// Initialize Game
function initGame() {
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });
    resetBtn.addEventListener('click', restartGame);
    modalClose.addEventListener('click', closeAndRestart);
    
    modeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            modeBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            gameMode = e.target.getAttribute('data-mode');
            
            if (gameMode === 'pva') {
                difficultyContainer.classList.remove('hidden');
            } else {
                difficultyContainer.classList.add('hidden');
            }
            restartGame();
        });
    });

    diffBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            diffBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            aiDifficulty = e.target.getAttribute('data-level');
            restartGame();
        });
    });
}

// Handle Click
function handleCellClick(e) {
    const clickedCell = e.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    // Check if cell is already played or game is over
    if (board[clickedCellIndex] !== '' || !gameActive) {
        return;
    }

    // Play move
    playMove(clickedCell, clickedCellIndex, currentPlayer);
    
    // Check Result
    checkResult();

    // If game is active and it's AI's turn
    if (gameActive && gameMode === 'pva' && currentPlayer === 'O') {
        setTimeout(makeAIMove, 500); // slight delay for realism
    }
}

function playMove(cell, index, player) {
    board[index] = player;
    cell.innerText = player;
    cell.classList.add(player.toLowerCase());
}

function checkResult() {
    let roundWon = false;
    let winningLine = [];

    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            roundWon = true;
            winningLine = [a, b, c];
            break;
        }
    }

    if (roundWon) {
        // Highlight winning cells
        winningLine.forEach(index => {
            cells[index].classList.add('win');
        });
        
        endGame(false, currentPlayer);
        return;
    }

    // Check for tie
    if (!board.includes('')) {
        endGame(true);
        return;
    }

    // Switch Player
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateStatusText();
}

function updateStatusText() {
    const className = currentPlayer === 'X' ? 'player-x' : 'player-o';
    statusText.innerHTML = `Player <span class="${className}">${currentPlayer}</span>'s Turn`;
}

function endGame(isTie, winner = null) {
    gameActive = false;
    
    if (isTie) {
        statusText.innerHTML = `<span class="tie-text">It's a Tie!</span>`;
        modalMsg.innerHTML = `<span class="tie-text">Match Drawn!</span>`;
        scores.Ties++;
        scoreTiesEl.innerText = scores.Ties;
    } else {
        const className = winner === 'X' ? 'player-x' : 'player-o';
        statusText.innerHTML = `Player <span class="${className}">${winner}</span> Wins!`;
        modalMsg.innerHTML = `Player <span class="${className}">${winner}</span> Wins!`;
        scores[winner]++;
        if(winner === 'X') scoreXEl.innerText = scores.X;
        if(winner === 'O') scoreOEl.innerText = scores.O;
    }

    setTimeout(() => {
        modal.classList.add('active');
    }, 500);
}

function closeAndRestart() {
    modal.classList.remove('active');
    restartGame();
}

function restartGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    updateStatusText();
    
    cells.forEach(cell => {
        cell.innerText = '';
        cell.classList.remove('x', 'o', 'win');
    });
}

// ================= AI LOGIC =================

function makeAIMove() {
    if (!gameActive) return;
    
    let index;
    if (aiDifficulty === 'easy') {
        index = getRandomMove();
    } else {
        index = getBestMove();
    }

    const cell = document.querySelector(`[data-index="${index}"]`);
    playMove(cell, index, currentPlayer);
    checkResult();
}

function getRandomMove() {
    const emptyIndices = [];
    board.forEach((cell, idx) => {
        if (cell === '') emptyIndices.push(idx);
    });
    const randomIndex = Math.floor(Math.random() * emptyIndices.length);
    return emptyIndices[randomIndex];
}

// Minimax algorithm for unbeatable AI
function getBestMove() {
    let bestScore = -Infinity;
    let move;
    
    // If it's the first move, playing in the center or corner is fastest and good.
    // Optimization to make it feel a bit more dynamic and compute faster on turn 1
    const emptySpots = board.filter(s => s === '').length;
    if(emptySpots === 9) return 4; // center
    if(emptySpots === 8 && board[4] === '') return 4; // take center if human didn't

    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            let score = minimax(board, 0, false);
            board[i] = '';
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(boardState, depth, isMaximizing) {
    let result = checkWinnerForMinimax();
    if (result !== null) {
        if (result === 'O') return 10 - depth;
        if (result === 'X') return -10 + depth;
        if (result === 'tie') return 0;
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (boardState[i] === '') {
                boardState[i] = 'O';
                let score = minimax(boardState, depth + 1, false);
                boardState[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (boardState[i] === '') {
                boardState[i] = 'X';
                let score = minimax(boardState, depth + 1, true);
                boardState[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinnerForMinimax() {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    if (!board.includes('')) return 'tie';
    return null;
}

// Start
initGame();
