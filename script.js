const board = document.getElementById("board");
const cells = document.querySelectorAll("[data-cell]");
const status = document.getElementById("status");
const restartButton = document.getElementById("restartButton");
const resetScoreButton = document.getElementById("resetScore");
const playerXInput = document.getElementById("playerX");
const playerOInput = document.getElementById("playerO");
const scoreX = document.getElementById("scoreX");
const scoreO = document.getElementById("scoreO");
const scoreXName = document.getElementById("scoreXName");
const scoreOName = document.getElementById("scoreOName");
const humanVsHumanBtn = document.getElementById("humanVsHuman");
const humanVsComputerBtn = document.getElementById("humanVsComputer");
const targetScoreInput = document.getElementById("targetScore");
const startMatchButton = document.getElementById("startMatch");
const congratsModal = document.getElementById("congratsModal");
const MatchWinnerSpan = document.getElementById("MatchWinner");
const newMatchButton = document.getElementById("newMatch");

const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

let currentPlayer = "X";
let gameActive = true;
let gameState = ["", "", "", "", "", "", "", "", ""];
let scores = { X: 0, O: 0 };
let vsComputer = false;
let aiDifficulty = 0.7;
let startingPlayer = "X";
let MatchMode = false;
let targetScore = 0;

function minimax(gameState, depth, isMaximizing) {
    const winner = checkGameOver();
    if (winner === "X") return { score: -10 + depth };
    if (winner === "O") return { score: 10 - depth };
    if (checkDraw()) return { score: 0 };

    if (isMaximizing) {
        let bestScore = -Infinity;
        let bestMove;
        getEmptyCells().forEach(index => {
            gameState[index] = "O";
            const score = minimax(gameState, depth + 1, false).score;
            gameState[index] = "";
            if (score > bestScore) {
                bestScore = score;
                bestMove = index;
            }
        });
        return { score: bestScore, index: bestMove };
    } else {
        let bestScore = Infinity;
        let bestMove;
        getEmptyCells().forEach(index => {
            gameState[index] = "X";
            const score = minimax(gameState, depth + 1, true).score;
            gameState[index] = "";
            if (score < bestScore) {
                bestScore = score;
                bestMove = index;
            }
        });
        return { score: bestScore, index: bestMove };
    }
}

function getEmptyCells() {
    return gameState
        .map((cell, index) => cell === "" ? index : null)
        .filter(cell => cell !== null);
}

function checkGameOver() {
    for (const combo of winningCombinations) {
        const [a, b, c] = combo;
        if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            return gameState[a];
        }
    }
    return null;
}

function initGame() {
    cells.forEach(cell => {
        cell.classList.remove("x", "o", "winning-cell");
        cell.textContent = "";
    });
    gameState = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = startingPlayer;
    gameActive = true;
    updateStatus();

    if (vsComputer && currentPlayer === "O") {
        setTimeout(() => computerMove(), 500);
    }
}

function updateNames() {
    scoreXName.textContent = playerXInput.value || "Player X";
    scoreOName.textContent = vsComputer ? "Neon AI" : (playerOInput.value || "Player O");
    if (vsComputer) {
        playerOInput.disabled = true;
        playerOInput.value = "Neon AI";
    } else {
        playerOInput.disabled = false;
    }
}

function updateStatus() {
    if (vsComputer) {
        status.textContent = gameActive
            ? `${currentPlayer === "X" ? playerXInput.value || "Your" : "AI"} Turn!`
            : "Game Over";
    } else {
        const xName = playerXInput.value || "Player X";
        const oName = playerOInput.value || "Player O";
        status.textContent = `${currentPlayer === "X" ? xName : oName}'s Turn!`;
    }
}

function handleCellClick(e) {
    if (!gameActive || (vsComputer && currentPlayer === "O")) return;
    const cell = e.target;
    const cellIndex = Array.from(cells).indexOf(cell);
    if (gameState[cellIndex] !== "") return;
    makeMove(cellIndex);
    if (vsComputer && gameActive) setTimeout(() => computerMove(), 500);
}

function makeMove(cellIndex) {
    gameState[cellIndex] = currentPlayer;
    cells[cellIndex].textContent = currentPlayer;
    cells[cellIndex].classList.add(currentPlayer.toLowerCase());
    const winner = checkGameOver();
    if (winner) {
        handleWin(winner);
    } else if (checkDraw()) {
        status.textContent = "Draw!";
        gameActive = false;
        setTimeout(initGame, 1500);
    } else {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        updateStatus();
    }
}

function computerMove() {
    if (!gameActive || !vsComputer || currentPlayer !== "O") return;
    if (Math.random() > aiDifficulty) {
        const emptyCells = getEmptyCells();
        const randomMove = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        makeMove(randomMove);
    } else {
        const { index: bestMove } = minimax(gameState, 0, true);
        makeMove(bestMove);
    }
}

function handleWin(winner) {
    scores[winner]++;
    updateScores();

    // Update AI difficulty based on score difference
    const scoreDiff = scores.X - scores.O;
    aiDifficulty = Math.min(0.7 + (Math.abs(scoreDiff) * 0.03), 0.95);

    // Check Match win
    if (MatchMode && (scores.X >= targetScore || scores.O >= targetScore)) {
        endMatch(winner);
    } else {
        startingPlayer = winner;
        status.textContent = vsComputer
            ? `${winner === "X" ? playerXInput.value || "Player" : "Neon AI"} wins!`
            : `${winner === "X" ? playerXInput.value : playerOInput.value} wins!`;
        highlightWinningCombination();
        gameActive = false;
        setTimeout(initGame, 1500);
    }
}

function checkDraw() {
    return gameState.every(cell => cell !== "");
}

function highlightWinningCombination() {
    for (const combo of winningCombinations) {
        const [a, b, c] = combo;
        if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            cells[a].classList.add("winning-cell");
            cells[b].classList.add("winning-cell");
            cells[c].classList.add("winning-cell");
            break;
        }
    }
}

function updateScores() {
    scoreX.textContent = scores.X;
    scoreO.textContent = scores.O;
}

function resetScores() {
    scores = { X: 0, O: 0 };
    startingPlayer = "X";
    MatchMode = false;
    updateScores();
    startMatchButton.disabled = false;
    targetScoreInput.disabled = false;
    congratsModal.style.display = "none";
}

function startMatch() {
    const target = parseInt(targetScoreInput.value);
    if (target > 0) {
        targetScore = target;
        MatchMode = true;
        scores = { X: 0, O: 0 };
        updateScores();
        startMatchButton.disabled = true;
        targetScoreInput.disabled = true;
        initGame();
    }
}

function endMatch(winner) {
    MatchMode = false;
    congratsModal.style.display = "flex";
    const winnerName = winner === "X"
        ? playerXInput.value || "Player X"
        : (vsComputer ? "Neon AI" : playerOInput.value);
    MatchWinnerSpan.textContent = winnerName;
    startMatchButton.disabled = false;
    targetScoreInput.disabled = false;
}

// Event Listeners
cells.forEach(cell => cell.addEventListener("click", handleCellClick));
restartButton.addEventListener("click", () => {
    startingPlayer = "X";
    initGame();
});
resetScoreButton.addEventListener("click", resetScores);
playerXInput.addEventListener("input", updateNames);
playerOInput.addEventListener("input", updateNames);
humanVsHumanBtn.addEventListener("click", () => {
    vsComputer = false;
    startingPlayer = "X";
    updateNames();
    initGame();
});
humanVsComputerBtn.addEventListener("click", () => {
    vsComputer = true;
    startingPlayer = "X";
    updateNames();
    initGame();
});
startMatchButton.addEventListener("click", startMatch);
newMatchButton.addEventListener("click", () => {
    congratsModal.style.display = "none";
    scores = { X: 0, O: 0 };
    updateScores();
});

// Initialize
updateNames();
initGame();