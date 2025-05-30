// 게임 상수
export const BOARD_SIZE = 20;
export const INITIAL_SPEED = 150;
export const SPEED_INCREASE = 5;

// 방향 상수
export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
} as const;

// 게임 상태
export const GAME_STATES = {
  LOADING: "loading",
  IDLE: "idle",
  COUNTDOWN: "countdown",
  RUNNING: "running",
  GAME_OVER: "gameOver",
  SAVING_SCORE: "savingScore",
} as const;
