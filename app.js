import {
  createInitialState,
  step,
  queueDirection,
  DEFAULT_GRID_SIZE,
} from "./snake.js";

const canvas = document.getElementById("game");
const scoreEl = document.getElementById("score");
const overlay = document.getElementById("overlay");
const restartBtn = document.getElementById("restart");
const pauseBtn = document.getElementById("pause");
const touchButtons = document.querySelectorAll(".touch-btn");

const ctx = canvas.getContext("2d");
const gridSize = DEFAULT_GRID_SIZE;
const cellSize = canvas.width / gridSize;
const tickMs = 120;

let state = createInitialState(gridSize);
let paused = false;
let lastTick = 0;

function drawCell(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawGrid();

  if (state.food) {
    drawCell(state.food.x, state.food.y, "#f4c36a");
  }

  state.snake.forEach((segment, index) => {
    const isHead = index === 0;
    drawCell(segment.x, segment.y, isHead ? "#4cd37b" : "#2f8f57");
  });
}

function drawGrid() {
  ctx.strokeStyle = "#1a2029";
  ctx.lineWidth = 1;
  for (let i = 0; i <= gridSize; i += 1) {
    ctx.beginPath();
    ctx.moveTo(i * cellSize, 0);
    ctx.lineTo(i * cellSize, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * cellSize);
    ctx.lineTo(canvas.width, i * cellSize);
    ctx.stroke();
  }
}

function setOverlay(text) {
  if (text) {
    overlay.textContent = text;
    overlay.classList.add("visible");
  } else {
    overlay.textContent = "";
    overlay.classList.remove("visible");
  }
}

function updateScore() {
  scoreEl.textContent = String(state.score);
}

function gameTick() {
  state = step(state);
  updateScore();

  if (state.gameOver) {
    setOverlay("Game over. Press R or Restart.");
  }

  render();
}

function loop(timestamp) {
  if (!lastTick) lastTick = timestamp;
  const delta = timestamp - lastTick;

  if (!paused && delta >= tickMs) {
    lastTick = timestamp;
    gameTick();
  }

  requestAnimationFrame(loop);
}

function restart() {
  state = createInitialState(gridSize);
  updateScore();
  setOverlay("");
  paused = false;
  pauseBtn.setAttribute("aria-pressed", "false");
  pauseBtn.textContent = "Pause";
  lastTick = 0;
  render();
}

function togglePause() {
  if (state.gameOver) return;
  paused = !paused;
  pauseBtn.setAttribute("aria-pressed", String(paused));
  pauseBtn.textContent = paused ? "Resume" : "Pause";
  setOverlay(paused ? "Paused" : "");
}

function handleDirectionInput(direction) {
  if (state.gameOver) return;
  state = queueDirection(state, direction);
}

const keyMap = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  a: "left",
  s: "down",
  d: "right",
};

window.addEventListener("keydown", (event) => {
  const key = event.key;
  if (key === " ") {
    event.preventDefault();
    togglePause();
    return;
  }

  if (key === "r" || key === "R") {
    restart();
    return;
  }

  const direction = keyMap[key];
  if (direction) {
    event.preventDefault();
    handleDirectionInput(direction);
  }
});

restartBtn.addEventListener("click", restart);

pauseBtn.addEventListener("click", togglePause);

touchButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const direction = button.dataset.dir;
    handleDirectionInput(direction);
  });
});

updateScore();
render();
requestAnimationFrame(loop);
