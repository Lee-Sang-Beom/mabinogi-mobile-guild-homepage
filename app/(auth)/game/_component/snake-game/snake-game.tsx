"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// 게임 상수
const BOARD_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREASE = 5;

// 방향 상수
const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
} as const;

// 게임 상태
const GAME_STATES = {
  LOADING: "loading",
  IDLE: "idle",
  COUNTDOWN: "countdown",
  RUNNING: "running",
  GAME_OVER: "gameOver",
} as const;

// 타입 정의
interface Position {
  x: number;
  y: number;
}

interface Direction {
  x: number;
  y: number;
}

type GameState = (typeof GAME_STATES)[keyof typeof GAME_STATES];

// 유틸리티 함수들
const generateRandomFood = (snake: Position[]): Position => {
  let newFood: Position;
  let attempts = 0;

  do {
    newFood = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };
    attempts++;
  } while (
    snake.some(
      (segment) => segment.x === newFood.x && segment.y === newFood.y,
    ) &&
    attempts < 100
  );

  return newFood;
};

const checkWallCollision = (head: Position): boolean => {
  return (
    head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE
  );
};

const checkSelfCollision = (head: Position, body: Position[]): boolean => {
  return body.some((segment) => segment.x === head.x && segment.y === head.y);
};

const isOppositeDirection = (dir1: Direction, dir2: Direction): boolean => {
  return dir1.x === -dir2.x && dir1.y === -dir2.y;
};

// 메인 컴포넌트
const SnakeGame: React.FC = () => {
  // 🔊 변경됨: 오디오 ref 추가
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 게임 상태
  const [gameState, setGameState] = useState<GameState>(GAME_STATES.LOADING);
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [_direction, setDirection] = useState<Direction>(DIRECTIONS.RIGHT);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [countdown, setCountdown] = useState(3);

  // refs
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const currentDirectionRef = useRef<Direction>(DIRECTIONS.RIGHT);
  const lastProcessedDirectionRef = useRef<Direction>(DIRECTIONS.RIGHT);

  // 게임 초기화
  const initializeGame = useCallback(() => {
    const initialSnake = [{ x: 10, y: 10 }];
    const initialFood = generateRandomFood(initialSnake);

    setSnake(initialSnake);
    setFood(initialFood);
    setDirection(DIRECTIONS.RIGHT);
    setScore(0);
    setSpeed(INITIAL_SPEED);

    currentDirectionRef.current = DIRECTIONS.RIGHT;
    lastProcessedDirectionRef.current = DIRECTIONS.RIGHT;
  }, []);

  // 방향 변경
  const changeDirection = useCallback(
    (newDirection: Direction) => {
      if (gameState !== GAME_STATES.RUNNING) return;

      // 반대 방향으로 이동 방지
      if (
        isOppositeDirection(newDirection, lastProcessedDirectionRef.current)
      ) {
        return;
      }

      currentDirectionRef.current = newDirection;
      setDirection(newDirection);
    },
    [gameState],
  );

  // 게임 루프 - 핵심 로직
  const moveSnake = useCallback(() => {
    if (gameState !== GAME_STATES.RUNNING) return;

    setSnake((currentSnake) => {
      if (currentSnake.length === 0) return currentSnake;

      // 현재 방향으로 새로운 머리 위치 계산
      const currentDir = currentDirectionRef.current;
      const newHead = {
        x: currentSnake[0].x + currentDir.x,
        y: currentSnake[0].y + currentDir.y,
      };

      // 충돌 검사
      if (
        checkWallCollision(newHead) ||
        checkSelfCollision(newHead, currentSnake.slice(1))
      ) {
        setGameState(GAME_STATES.GAME_OVER);
        return currentSnake;
      }

      // 새로운 뱀 생성
      const newSnake = [newHead, ...currentSnake];

      // 먹이 체크
      setFood((currentFood) => {
        if (newHead.x === currentFood.x && newHead.y === currentFood.y) {
          // 먹이를 먹은 경우
          setScore((prevScore) => {
            const newScore = prevScore + 10;
            setHighScore((prevHigh) => Math.max(prevHigh, newScore));
            return newScore;
          });

          setSpeed((prevSpeed) => Math.max(50, prevSpeed - SPEED_INCREASE));

          // 새로운 먹이 생성 (새로운 뱀 길이 고려)
          return generateRandomFood(newSnake);
        }

        return currentFood;
      });

      // 먹이를 먹지 않은 경우에만 꼬리 제거
      if (newHead.x !== food.x || newHead.y !== food.y) {
        newSnake.pop();
      }

      lastProcessedDirectionRef.current = currentDir;
      return newSnake;
    });
  }, [gameState, food.x, food.y]);

  // 키보드 입력 처리
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState !== GAME_STATES.RUNNING) return;

      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case "ArrowUp":
          changeDirection(DIRECTIONS.UP);
          break;
        case "ArrowDown":
          changeDirection(DIRECTIONS.DOWN);
          break;
        case "ArrowLeft":
          changeDirection(DIRECTIONS.LEFT);
          break;
        case "ArrowRight":
          changeDirection(DIRECTIONS.RIGHT);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameState, changeDirection]);

  // 게임 루프 관리
  useEffect(() => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }

    if (gameState === GAME_STATES.RUNNING) {
      gameLoopRef.current = setInterval(moveSnake, speed);
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [gameState, speed, moveSnake]);

  // 초기 로딩
  useEffect(() => {
    const timer = setTimeout(() => {
      setGameState(GAME_STATES.IDLE);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // 스크롤 방지
  useEffect(() => {
    if (gameState === GAME_STATES.RUNNING) {
      // 🔊 변경됨: 오디오 재생
      if (audioRef.current) {
        audioRef.current!.currentTime = 0;
        audioRef.current.play().catch((err) => {
          console.warn("음악 재생 실패:", err);
        });
      }
    }

    if (gameState === GAME_STATES.GAME_OVER) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    }

    if (gameState === GAME_STATES.RUNNING) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [gameState]);

  // 게임 시작
  const startGame = useCallback(() => {
    initializeGame();
    setGameState(GAME_STATES.COUNTDOWN);
    setCountdown(3);

    const countdownTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          setTimeout(() => {
            setGameState(GAME_STATES.RUNNING);
          }, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [initializeGame]);

  const restartGame = useCallback(() => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    startGame();
  }, [startGame]);

  // 로딩 화면
  if (gameState === GAME_STATES.LOADING) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="text-8xl animate-bounce">🐍</div>
          <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            뱀 게임 로딩 중...
          </div>
          <div className="flex justify-center space-x-2">
            <div className="w-4 h-4 bg-emerald-400 rounded-full animate-pulse"></div>
            <div
              className="w-4 h-4 bg-emerald-400 rounded-full animate-pulse"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-4 h-4 bg-emerald-400 rounded-full animate-pulse"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  // 게임 보드 렌더링
  const renderGameBoard = () => {
    const board = [];
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        let cellClass =
          "w-4 h-4 sm:w-5 sm:h-5 border border-slate-800/30 transition-all duration-150";

        // 뱀 머리
        if (snake.length > 0 && snake[0].x === x && snake[0].y === y) {
          cellClass +=
            " bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30 scale-110 rounded-sm";
        }
        // 뱀 몸
        else if (
          snake.slice(1).some((segment) => segment.x === x && segment.y === y)
        ) {
          cellClass +=
            " bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-md shadow-emerald-500/20 rounded-sm";
        }
        // 먹이
        else if (food.x === x && food.y === y) {
          cellClass +=
            " bg-gradient-to-br from-rose-400 to-rose-600 shadow-lg shadow-rose-500/40 rounded-full animate-pulse scale-110";
        }
        // 빈 칸
        else {
          cellClass += " bg-slate-950/40 backdrop-blur-sm";
        }

        board.push(<div key={`${x}-${y}`} className={cellClass} />);
      }
    }
    return board;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 flex items-center justify-center">
      {/* 🔊 변경됨: 오디오 엘리먼트 */}
      <audio ref={audioRef} src="/audios/fergus-song.mp3" preload="auto" loop />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      {/* 카운트다운 화면 */}
      {gameState === GAME_STATES.COUNTDOWN && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-9xl font-bold text-emerald-400 animate-pulse mb-4">
              {countdown > 0 ? countdown : "시작!"}
            </div>
            <div className="text-2xl text-white">
              {countdown > 0 ? "게임 시작까지..." : ""}
            </div>
          </div>
        </div>
      )}
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="text-5xl">🐍</div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              뱀 게임
            </h1>
          </div>

          <div className="flex justify-center items-center gap-6 flex-wrap">
            <Badge
              variant="secondary"
              className="text-lg px-4 py-2 bg-slate-800/50 backdrop-blur border-slate-700"
            >
              점수:{" "}
              <span className="font-bold text-yellow-400 ml-1">{score}</span>
            </Badge>
            <Badge
              variant="secondary"
              className="text-lg px-4 py-2 bg-slate-800/50 backdrop-blur border-slate-700"
            >
              최고점수:{" "}
              <span className="font-bold text-orange-400 ml-1">
                {highScore}
              </span>
            </Badge>
            <Badge
              variant="secondary"
              className="text-lg px-4 py-2 bg-slate-800/50 backdrop-blur border-slate-700"
            >
              길이:{" "}
              <span className="font-bold text-cyan-400 ml-1">
                {snake.length}
              </span>
            </Badge>
          </div>
        </div>

        {/* 메인 메뉴 */}
        {gameState === GAME_STATES.IDLE && (
          <Card className="max-w-lg mx-auto bg-slate-900/60 backdrop-blur-xl border-slate-700/50 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-emerald-400">
                뱀 게임에 오신 것을 환영합니다!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3 text-slate-300">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-700 rounded flex items-center justify-center text-xs">
                    ⬆️
                  </div>
                  <span>방향키로 뱀을 조작하세요</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center">
                    🍎
                  </div>
                  <span>빨간 먹이를 먹으면 점수가 올라갑니다</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-xs">
                    ⚠️
                  </div>
                  <span>벽이나 자신의 몸에 부딪히지 마세요!</span>
                </div>
              </div>
              <Button
                onClick={startGame}
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold py-4 text-xl shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:scale-105"
              >
                게임 시작
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 게임 화면 */}
        {(gameState === GAME_STATES.RUNNING ||
          gameState === GAME_STATES.COUNTDOWN) && (
          <div className="flex flex-col items-center space-y-6">
            <Card className="bg-slate-950/60 backdrop-blur-xl border-slate-700/50 shadow-2xl p-2 sm:p-4">
              <div
                className="grid gap-0.5 rounded-lg overflow-hidden bg-slate-900/50 p-2"
                style={{
                  gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
                  width: "fit-content",
                  margin: "0 auto",
                }}
              >
                {renderGameBoard()}
              </div>
            </Card>

            {gameState === GAME_STATES.RUNNING && (
              <>
                <div className="text-center space-y-2">
                  <p className="text-slate-400">
                    방향키를 사용하여 뱀을 조작하세요
                  </p>
                  <Badge
                    variant="outline"
                    className="border-emerald-500 text-emerald-400"
                  >
                    속도: {((200 - speed) / 10).toFixed(1)}배
                  </Badge>
                </div>

                {/* 모바일 컨트롤 */}
                <div className="grid grid-cols-3 gap-3 sm:hidden mt-6">
                  <div />
                  <Button
                    onClick={() => changeDirection(DIRECTIONS.UP)}
                    variant="outline"
                    size="lg"
                    className="bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 backdrop-blur aspect-square"
                  >
                    ⬆️
                  </Button>
                  <div />
                  <Button
                    onClick={() => changeDirection(DIRECTIONS.LEFT)}
                    variant="outline"
                    size="lg"
                    className="bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 backdrop-blur aspect-square"
                  >
                    ⬅️
                  </Button>
                  <div />
                  <Button
                    onClick={() => changeDirection(DIRECTIONS.RIGHT)}
                    variant="outline"
                    size="lg"
                    className="bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 backdrop-blur aspect-square"
                  >
                    ➡️
                  </Button>
                  <div />
                  <Button
                    onClick={() => changeDirection(DIRECTIONS.DOWN)}
                    variant="outline"
                    size="lg"
                    className="bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 backdrop-blur aspect-square"
                  >
                    ⬇️
                  </Button>
                  <div />
                </div>
              </>
            )}
          </div>
        )}

        {/* 게임 오버 */}
        {gameState === GAME_STATES.GAME_OVER && (
          <Card className="max-w-lg mx-auto bg-slate-900/60 backdrop-blur-xl border-slate-700/50 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-rose-400 mb-4">
                게임 오버!
              </CardTitle>
              <div className="space-y-3">
                <div className="text-xl">
                  최종 점수:{" "}
                  <span className="font-bold text-yellow-400">{score}</span>
                </div>
                <div className="text-lg">
                  뱀 길이:{" "}
                  <span className="font-bold text-cyan-400">
                    {snake.length}
                  </span>
                </div>
                {score === highScore && score > 0 && (
                  <div className="text-orange-400 font-bold text-lg animate-bounce">
                    🎉 신기록 달성! 🎉
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={restartGame}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold py-3 shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:scale-105"
                >
                  다시 하기
                </Button>
                <Button
                  onClick={() => setGameState(GAME_STATES.IDLE)}
                  variant="outline"
                  className="flex-1 border-slate-600 hover:bg-slate-700/50 backdrop-blur py-3"
                >
                  메인 메뉴
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SnakeGame;
