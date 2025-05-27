"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { GameProps } from "@/app/(auth)/game/internal";
import moment from "moment";
import { useCreateGame } from "@/app/(auth)/game/hooks/use-create-game";
import { useGetGamesByGameType } from "@/app/(auth)/game/hooks/use-get-games-by-game-type";
import { GameCreateRequest } from "@/app/(auth)/game/api";

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
  SAVING_SCORE: "savingScore",
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
export default function SnakeGame({ user }: GameProps) {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // CRUD 훅들
  const createGameMutation = useCreateGame();
  const { data: rankingData, refetch: refetchRanking } =
    useGetGamesByGameType("snake");

  // 게임 상태
  const [gameState, setGameState] = useState<GameState>(GAME_STATES.LOADING);
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [_direction, setDirection] = useState<Direction>(DIRECTIONS.RIGHT);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [countdown, setCountdown] = useState(3);
  const [showRanking, setShowRanking] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [cellSize, setCellSize] = useState(20); // 반응형 셀 크기

  // refs - 개선된 방향 관리 시스템
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const currentDirectionRef = useRef<Direction>(DIRECTIONS.RIGHT);
  const nextDirectionRef = useRef<Direction>(DIRECTIONS.RIGHT);
  const inputBufferRef = useRef<Direction[]>([]);
  const gameBoardRef = useRef<HTMLDivElement>(null);

  // 중복 저장 방지를 위한 ref 추가
  const isSavingScoreRef = useRef(false);
  const gameOverProcessedRef = useRef(false);

  // 화면 크기에 따른 셀 크기 계산
  useEffect(() => {
    const calculateCellSize = () => {
      if (typeof window === "undefined") return;

      const padding = 32; // 좌우 패딩 (2rem)
      const maxWidth = window.innerWidth - padding;
      const maxHeight = window.innerHeight * 0.6; // 화면 높이의 60%까지 사용

      // 가로세로 중 더 작은 값을 기준으로 셀 크기 결정
      const maxCellSizeByWidth = Math.floor(maxWidth / BOARD_SIZE);
      const maxCellSizeByHeight = Math.floor(maxHeight / BOARD_SIZE);
      const newCellSize = Math.min(maxCellSizeByWidth, maxCellSizeByHeight, 25); // 최대 25px로 증가

      setCellSize(Math.max(newCellSize, 10)); // 최소 10px로 증가
    };

    calculateCellSize();
    window.addEventListener("resize", calculateCellSize);

    return () => window.removeEventListener("resize", calculateCellSize);
  }, []);

  // 랭킹 데이터에서 최고점수 가져오기
  useEffect(() => {
    if (rankingData?.success && rankingData.data) {
      const userBestScore = rankingData.data
        .filter((game) => game.userId === user.id)
        .reduce((max, game) => Math.max(max, game.score), 0);
      setHighScore(userBestScore);
    }
  }, [rankingData, user.id]);

  // 점수 저장 함수 - 중복 방지 로직 추가
  const saveScore = useCallback(
    async (finalScore: number) => {
      // 이미 저장 중이거나 점수가 0이면 리턴
      if (isSavingScoreRef.current || finalScore == 0) {
        setGameState(GAME_STATES.GAME_OVER);
        return;
      }

      // 저장 시작 플래그 설정
      isSavingScoreRef.current = true;
      setGameState(GAME_STATES.SAVING_SCORE);

      try {
        // 현재 랭킹에서 사용자의 순위 계산
        let rank = 1;
        if (rankingData?.success && rankingData.data) {
          rank =
            rankingData.data.filter((game) => game.score > finalScore).length +
            1;
        }

        const postData: GameCreateRequest = {
          gameType: "snake",
          score: finalScore,
          rank: rank,
          userDocId: user.docId,
          userId: user.id,
          regDt: moment().format("YYYY-MM-DD"),
        };

        await createGameMutation.mutateAsync(postData);

        // 랭킹 데이터 새로고침
        await refetchRanking();

        // 신기록 체크
        if (finalScore > highScore) {
          setIsNewRecord(true);
          setHighScore(finalScore);
        }
      } catch (error) {
        console.error("점수 저장 실패:", error);
      } finally {
        // 저장 완료 후 상태 변경
        setGameState(GAME_STATES.GAME_OVER);
        // 다음 게임을 위해 플래그 리셋은 게임 재시작 시에 수행
      }
    },
    [createGameMutation, rankingData, refetchRanking, user.id, highScore],
  );

  // 게임 초기화 - 플래그들도 함께 리셋
  const initializeGame = useCallback(() => {
    // 기존 게임 루프가 있다면 확실히 정리
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }

    const initialSnake = [{ x: 10, y: 10 }];
    const initialFood = generateRandomFood(initialSnake);

    setSnake(initialSnake);
    setFood(initialFood);
    setDirection(DIRECTIONS.RIGHT);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setIsNewRecord(false);

    currentDirectionRef.current = DIRECTIONS.RIGHT;
    nextDirectionRef.current = DIRECTIONS.RIGHT;
    inputBufferRef.current = [];

    // 모든 플래그 완전 리셋
    isSavingScoreRef.current = false;
    gameOverProcessedRef.current = false;
  }, []);

  // 개선된 방향 변경 - 즉시 반영
  const changeDirection = useCallback(
    (newDirection: Direction) => {
      if (gameState !== GAME_STATES.RUNNING) {
        return;
      }

      if (isOppositeDirection(newDirection, currentDirectionRef.current)) {
        return;
      }

      nextDirectionRef.current = newDirection;

      const buffer = inputBufferRef.current;
      if (
        buffer.length === 0 ||
        buffer[buffer.length - 1].x !== newDirection.x ||
        buffer[buffer.length - 1].y !== newDirection.y
      ) {
        if (buffer.length >= 3) {
          buffer.shift();
        }
        buffer.push(newDirection);
      }

      setDirection(newDirection);
    },
    [gameState],
  );

  // 게임 오버 처리 함수 분리
  const handleGameOver = useCallback(
    (currentScore: number) => {
      // 이미 게임오버 처리가 진행중이거나 게임이 실행중이 아니면 리턴
      if (gameOverProcessedRef.current || gameState !== GAME_STATES.RUNNING) {
        return;
      }

      gameOverProcessedRef.current = true;

      // 게임 루프 즉시 중지
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }

      // 게임 상태를 즉시 변경
      setGameState(GAME_STATES.SAVING_SCORE);

      // 점수 저장
      saveScore(currentScore);
    },
    [saveScore, gameState],
  );

  // 개선된 게임 루프
  const moveSnake = useCallback(() => {
    if (gameState !== GAME_STATES.RUNNING) return;

    setSnake((currentSnake) => {
      if (currentSnake.length === 0) return currentSnake;

      let directionToUse = nextDirectionRef.current;

      const buffer = inputBufferRef.current;
      if (buffer.length > 0) {
        const bufferedDirection = buffer.shift()!;
        if (
          !isOppositeDirection(bufferedDirection, currentDirectionRef.current)
        ) {
          directionToUse = bufferedDirection;
          nextDirectionRef.current = bufferedDirection;
        }
      }

      currentDirectionRef.current = directionToUse;

      const newHead = {
        x: currentSnake[0].x + directionToUse.x,
        y: currentSnake[0].y + directionToUse.y,
      };

      // 즉시 충돌 검사 - 벽 충돌과 자신과의 충돌을 분리하여 확실히 검사
      const wallCollision = checkWallCollision(newHead);
      const selfCollision = checkSelfCollision(newHead, currentSnake.slice(1));

      if (wallCollision || selfCollision) {
        // 게임 상태를 즉시 변경하여 추가 움직임 방지
        setTimeout(() => {
          setGameState(GAME_STATES.GAME_OVER); // 먼저 상태 변경
          handleGameOver(score);
        }, 0); // setTimeout을 0으로 변경하여 즉시 실행

        return currentSnake; // 현재 뱀 상태 유지
      }

      const newSnake = [newHead, ...currentSnake];

      // 음식 먹기 처리
      setFood((currentFood) => {
        if (newHead.x === currentFood.x && newHead.y === currentFood.y) {
          setScore((prevScore) => prevScore + 10);
          setSpeed((prevSpeed) => Math.max(50, prevSpeed - SPEED_INCREASE));
          return generateRandomFood(newSnake);
        }
        return currentFood;
      });

      // 음식을 먹지 않았다면 꼬리 제거
      if (newHead.x !== food.x || newHead.y !== food.y) {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [gameState, food.x, food.y, score, handleGameOver]);

  // 키보드 입력 처리
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState !== GAME_STATES.RUNNING) return;

      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }

      let newDirection: Direction | null = null;

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          newDirection = DIRECTIONS.UP;
          break;
        case "ArrowDown":
        case "s":
        case "S":
          newDirection = DIRECTIONS.DOWN;
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          newDirection = DIRECTIONS.LEFT;
          break;
        case "ArrowRight":
        case "d":
        case "D":
          newDirection = DIRECTIONS.RIGHT;
          break;
      }

      if (newDirection) {
        changeDirection(newDirection);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => handleKeyPress(e);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameState, changeDirection]);

  // 게임 루프 관리
  useEffect(() => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }

    if (gameState === GAME_STATES.RUNNING) {
      gameLoopRef.current = setInterval(() => {
        // 게임 상태를 다시 한번 확인
        if (
          gameState === GAME_STATES.RUNNING &&
          !gameOverProcessedRef.current
        ) {
          moveSnake();
        }
      }, speed);
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

  // 오디오 및 스크롤 관리
  useEffect(() => {
    if (gameState === GAME_STATES.RUNNING) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((err) => {
          console.warn("음악 재생 실패:", err);
        });
      }
      document.body.style.overflow = "hidden";
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [gameState]);

  // 게임 보드로 스크롤하는 함수
  const scrollToGameBoard = useCallback(() => {
    if (gameBoardRef.current) {
      gameBoardRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "center",
      });
    } else {
      // 요소가 없을 경우 화면 상단에서 100px 아래로 스크롤
      window.scrollTo({
        top: 250,
        behavior: "smooth",
      });
    }
  }, [gameBoardRef]);

  // 게임 시작
  const startGame = useCallback(() => {
    initializeGame();
    setGameState(GAME_STATES.COUNTDOWN);
    setCountdown(3);

    setTimeout(() => {
      scrollToGameBoard();
    }, 500);

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
  }, [initializeGame, scrollToGameBoard]);

  const restartGame = useCallback(() => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }

    setTimeout(() => {
      scrollToGameBoard();
    }, 500);

    startGame();
  }, [startGame, scrollToGameBoard]);

  // 게임 보드 렌더링
  const renderGameBoard = () => {
    const board = [];
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        let cellClass =
          "border border-slate-800/30 transition-all duration-100";

        if (snake.length > 0 && snake[0].x === x && snake[0].y === y) {
          cellClass +=
            " bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30 scale-110 rounded-sm";
        } else if (
          snake.slice(1).some((segment) => segment.x === x && segment.y === y)
        ) {
          cellClass +=
            " bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-md shadow-emerald-500/20 rounded-sm";
        } else if (food.x === x && food.y === y) {
          cellClass +=
            " bg-gradient-to-br from-rose-400 to-rose-600 shadow-lg shadow-rose-500/40 rounded-full animate-pulse scale-110";
        } else {
          cellClass += " bg-slate-950/40 backdrop-blur-sm";
        }

        board.push(<div key={`${x}-${y}`} className={cellClass} />);
      }
    }
    return board;
  };

  // 랭킹 렌더링
  const renderRanking = () => {
    if (!rankingData?.success || !rankingData.data) {
      return (
        <div className="text-center text-slate-400">
          랭킹 정보를 불러오는 중...
        </div>
      );
    }

    const topRankings = rankingData.data.slice(0, 10);

    return (
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-center text-emerald-400 mb-4">
          🏆 Snake 게임 랭킹 TOP 10
        </h3>
        {topRankings.length === 0 ? (
          <div className="text-center text-slate-400">
            아직 기록이 없습니다. 첫 번째 기록을 남겨보세요!
          </div>
        ) : (
          topRankings.map((game, index) => (
            <div
              key={game.docId}
              className={`flex justify-between items-center p-3 rounded-lg ${
                game.userId === user.id
                  ? "bg-emerald-900/30 border border-emerald-500/30"
                  : "bg-slate-800/30 border border-gray-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0
                      ? "bg-yellow-500 text-black"
                      : index === 1
                        ? "bg-gray-400 text-black"
                        : index === 2
                          ? "bg-amber-600 text-white"
                          : "bg-slate-600 text-white"
                  }`}
                >
                  {index + 1}
                </div>
                <div>
                  <div className="font-semibold text-white">
                    {game.userId === user.id
                      ? `${user.id}`
                      : `${game.userId.slice(0, 8)}`}
                  </div>
                  <div className="text-sm text-primary">{game.regDt}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-sm text-yellow-400">
                  {game.score} 점
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  // 게임 오버 화면
  const renderGameOverScreen = () => {
    return (
      <div className="space-y-6">
        <Card className="max-w-lg mx-auto bg-slate-900/90 backdrop-blur-xl border-slate-700/50 shadow-2xl">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">{isNewRecord ? "🎉" : "💀"}</div>
            <CardTitle
              className={`text-3xl ${isNewRecord ? "text-yellow-400" : "text-red-400"}`}
            >
              {isNewRecord ? "신기록 달성!" : "게임 오버"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-yellow-400">
                  최종 점수: {score}
                </div>
                <div className="text-lg text-slate-300">
                  뱀 길이: {snake.length}
                </div>
                {isNewRecord && (
                  <div className="text-lg text-green-400 font-semibold animate-pulse">
                    ✨ 개인 최고 기록 갱신! ✨
                  </div>
                )}
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
                <div className="text-slate-300">통계</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-slate-400">현재 점수</div>
                    <div className="font-bold text-yellow-400">{score}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">최고 점수</div>
                    <div className="font-bold text-orange-400">{highScore}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">뱀 길이</div>
                    <div className="font-bold text-cyan-400">
                      {snake.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">최종 속도</div>
                    <div className="font-bold text-emerald-400">
                      {((200 - speed) / 10).toFixed(1)}배
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={restartGame}
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold py-3 text-lg shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:scale-105"
              >
                다시 플레이
              </Button>
              <Button
                onClick={() => setGameState(GAME_STATES.IDLE)}
                variant="outline"
                className="w-full backdrop-blur py-3"
              >
                메인 메뉴로
              </Button>
              <Button
                onClick={() => setShowRanking(!showRanking)}
                variant="outline"
                className="w-full backdrop-blur py-3"
              >
                {showRanking ? "랭킹 숨기기" : "랭킹 보기"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 게임 오버 후 랭킹 표시 */}
        {showRanking && (
          <Card className="max-w-lg mx-auto bg-slate-900/60 backdrop-blur-xl border-slate-700/50 shadow-2xl">
            <CardContent className="p-6">{renderRanking()}</CardContent>
          </Card>
        )}
      </div>
    );
  };

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

  // 점수 저장 중 화면
  if (gameState === GAME_STATES.SAVING_SCORE) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="text-8xl animate-spin">💾</div>
          <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            점수 저장 중...
          </div>
          <div className="text-xl text-slate-300">
            최종 점수:{" "}
            <span className="text-yellow-400 font-bold">{score}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-2 sm:p-4 flex items-center justify-center">
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

          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 p-3 sm:p-4  rounded-xl shadow-sm backdrop-blur-sm">
            <Badge
              variant="secondary"
              className="text-sm sm:text-base md:text-lg px-2.5 sm:px-3.5 md:px-4 py-1.5 sm:py-2 text-muted-foreground border border-slate-700"
            >
              점수:
              <span className="font-semibold ml-1 text-muted-foreground">
                {score}
              </span>
            </Badge>
            <Badge
              variant="secondary"
              className="text-sm sm:text-base md:text-lg px-2.5 sm:px-3.5 md:px-4 py-1.5 sm:py-2 text-muted-foreground border border-slate-700 "
            >
              최고점수:
              <span className="font-semibold ml-1 text-orange-500">
                {highScore}
              </span>
            </Badge>
            <Badge
              variant="secondary"
              className="text-sm sm:text-base md:text-lg px-2.5 sm:px-3.5 md:px-4 py-1.5 sm:py-2 text-muted-foreground border border-slate-700 "
            >
              길이:
              <span className="font-semibold ml-1 text-muted-foreground">
                {snake.length}
              </span>
            </Badge>
          </div>
        </div>

        {/* 메인 메뉴 */}
        {gameState === GAME_STATES.IDLE && (
          <div className="space-y-6">
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
                    <span>방향키 또는 WASD로 뱀을 조작하세요</span>
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
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-cyan-500 rounded flex items-center justify-center text-xs">
                      💾
                    </div>
                    <span>게임 종료 시 점수가 자동으로 저장됩니다</span>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={startGame}
                    className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold py-3 text-lg shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:scale-105"
                  >
                    게임 시작
                  </Button>
                  <Button
                    onClick={() => setShowRanking(!showRanking)}
                    variant="outline"
                    className="w-full backdrop-blur py-3"
                  >
                    {showRanking ? "랭킹 숨기기" : "랭킹 보기"}
                  </Button>
                  <Button
                    onClick={() => router.back()}
                    variant="outline"
                    className="w-full backdrop-blur py-3"
                  >
                    돌아가기
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 메인 메뉴에서 랭킹 표시 */}
            {showRanking && (
              <Card className="max-w-lg mx-auto bg-slate-900/60 backdrop-blur-xl border-slate-700/50 shadow-2xl">
                <CardContent className="p-6">{renderRanking()}</CardContent>
              </Card>
            )}
          </div>
        )}

        {/* 게임 실행 중 화면 */}
        {gameState === GAME_STATES.RUNNING && (
          <div className="space-y-6">
            {/* 컨트롤 가이드 */}
            <div className="text-center text-slate-400 text-sm">
              방향키 또는 WASD로 조작
            </div>

            {/* 게임 보드 */}
            <div
              ref={gameBoardRef}
              className="mx-auto p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-2xl"
              style={{ width: "fit-content", maxWidth: "100%" }}
            >
              <div
                className="grid gap-0 border-2 border-slate-600/50 rounded-lg overflow-hidden shadow-inner"
                style={{
                  gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
                  width: `${BOARD_SIZE * cellSize}px`, // 20 대신 cellSize 사용
                  height: `${BOARD_SIZE * cellSize}px`, // 20 대신 cellSize 사용
                  maxWidth: "calc(100vw - 2rem)", // 화면 너비를 넘지 않도록
                  maxHeight: "calc(100vw - 2rem)", // 정사각형 유지
                }}
              >
                {renderGameBoard()}
              </div>
            </div>

            {/* 모바일 컨트롤 */}
            <div className="flex justify-center md:hidden px-4">
              <div className="grid grid-cols-3 gap-2 w-40 sm:w-48">
                <div></div>
                <Button
                  onTouchStart={() => changeDirection(DIRECTIONS.UP)}
                  className="h-10 sm:h-12 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 text-sm" // 높이 조정
                >
                  ⬆️
                </Button>
                <div></div>
                <Button
                  onTouchStart={() => changeDirection(DIRECTIONS.LEFT)}
                  className="h-10 sm:h-12 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 text-sm" // 높이 조정
                >
                  ⬅️
                </Button>
                <div></div>
                <Button
                  onTouchStart={() => changeDirection(DIRECTIONS.RIGHT)}
                  className="h-10 sm:h-12 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 text-sm" // 높이 조정
                >
                  ➡️
                </Button>
                <div></div>
                <Button
                  onTouchStart={() => changeDirection(DIRECTIONS.DOWN)}
                  className="h-10 sm:h-12 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 text-sm" // 높이 조정
                >
                  ⬇️
                </Button>
                <div></div>
              </div>
            </div>

            {/* 현재 속도 표시 */}
            <div className="text-center">
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                속도: {((200 - speed) / 10).toFixed(1)}배
              </Badge>
            </div>
          </div>
        )}

        {/* 게임 오버 화면 */}
        {gameState === GAME_STATES.GAME_OVER && renderGameOverScreen()}
      </div>
    </div>
  );
}
