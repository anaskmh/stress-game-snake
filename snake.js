export const DEFAULT_GRID_SIZE = 20;

export const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export function createInitialState(gridSize = DEFAULT_GRID_SIZE, rng = Math.random) {
  const center = Math.floor(gridSize / 2);
  const snake = [
    { x: center + 1, y: center },
    { x: center, y: center },
    { x: center - 1, y: center },
  ];
  const food = placeFood(snake, gridSize, rng);

  return {
    gridSize,
    snake,
    direction: "right",
    queuedDirection: "right",
    food,
    score: 0,
    gameOver: false,
    rng,
  };
}

export function placeFood(snake, gridSize, rng) {
  const occupied = new Set(snake.map((cell) => `${cell.x},${cell.y}`));
  const openCells = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const key = `${x},${y}`;
      if (!occupied.has(key)) {
        openCells.push({ x, y });
      }
    }
  }

  if (openCells.length === 0) {
    return null;
  }

  const index = Math.floor(rng() * openCells.length);
  return openCells[index];
}

export function isOpposite(dirA, dirB) {
  const a = DIRECTIONS[dirA];
  const b = DIRECTIONS[dirB];
  if (!a || !b) return false;
  return a.x + b.x === 0 && a.y + b.y === 0;
}

export function step(state) {
  if (state.gameOver) return state;

  const nextDirection = isOpposite(state.direction, state.queuedDirection)
    ? state.direction
    : state.queuedDirection;

  const delta = DIRECTIONS[nextDirection];
  const head = state.snake[0];
  const nextHead = {
    x: head.x + delta.x,
    y: head.y + delta.y,
  };

  const outOfBounds =
    nextHead.x < 0 ||
    nextHead.y < 0 ||
    nextHead.x >= state.gridSize ||
    nextHead.y >= state.gridSize;

  const hitsSelf = state.snake.some(
    (segment) => segment.x === nextHead.x && segment.y === nextHead.y
  );

  if (outOfBounds || hitsSelf) {
    return {
      ...state,
      direction: nextDirection,
      gameOver: true,
    };
  }

  const eatsFood =
    state.food && nextHead.x === state.food.x && nextHead.y === state.food.y;

  const nextSnake = [nextHead, ...state.snake];
  if (!eatsFood) {
    nextSnake.pop();
  }

  const nextFood = eatsFood
    ? placeFood(nextSnake, state.gridSize, state.rng)
    : state.food;

  return {
    ...state,
    snake: nextSnake,
    direction: nextDirection,
    food: nextFood,
    score: eatsFood ? state.score + 1 : state.score,
  };
}

export function queueDirection(state, direction) {
  if (!DIRECTIONS[direction]) return state;
  return {
    ...state,
    queuedDirection: direction,
  };
}
