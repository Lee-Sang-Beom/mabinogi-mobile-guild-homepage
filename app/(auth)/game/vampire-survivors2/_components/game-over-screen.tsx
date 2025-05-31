"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { Home } from "lucide-react";
import type {
  GameState,
  Player,
  GameProps,
  GameRankingData,
  GameCreateRequest,
} from "../internal";
import moment from "moment";

interface GameOverScreenProps {
  gameState: GameState;
  player: Player;
  onRestart: () => void;
  user: GameProps["user"];
  rankingData?: GameRankingData;
  createGameMutation: any;
  refetchRanking: () => void;
}

export function GameOverScreen({
  gameState,
  player,
  onRestart,
  user,
  rankingData,
  createGameMutation,
  refetchRanking,
}: GameOverScreenProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const hasSubmittedRef = useRef(false); // 중복 실행 방지를 위한 ref

  const formatTime = useCallback((ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  const submitScore = useCallback(async () => {
    // 이미 제출되었거나 제출 중이면 중단
    if (hasSubmittedRef.current || isSubmitting) return;

    hasSubmittedRef.current = true; // 제출 시작 표시
    setIsSubmitting(true);

    try {
      // Calculate rank based on current ranking data
      let rank = 1;
      if (rankingData?.success && rankingData.data) {
        rank =
          rankingData.data.filter((game) => game.score > gameState.score)
            .length + 1;
      }

      const postData: GameCreateRequest = {
        gameType: "vampire",
        score: gameState.score,
        rank: rank,
        userDocId: user.docId,
        userId: user.id,
        regDt: moment().format("YYYY-MM-DD"),
      };

      await createGameMutation.mutateAsync(postData);
      await refetchRanking();
      setSubmitted(true);
    } catch (error) {
      console.error("점수 저장 실패:", error);
      hasSubmittedRef.current = false; // 실패 시 다시 시도할 수 있도록
    } finally {
      setIsSubmitting(false);
    }
  }, [
    gameState.score,
    user,
    isSubmitting,
    rankingData,
    createGameMutation,
    refetchRanking,
  ]);

  // useEffect의 의존성 배열에서 submitScore 제거하고 직접 로직 구현
  useEffect(() => {
    if (
      !hasSubmittedRef.current &&
      !isSubmitting &&
      gameState.isGameOverProcessed
    ) {
      submitScore();
    }
  }, [gameState.isGameOverProcessed, isSubmitting]); // submitScore 의존성 제거

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
          🏆 뱀파이어 서바이벌 랭킹 TOP 10
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
                  <div className="text-sm text-slate-400">{game.regDt}</div>
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

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-red-950 to-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-red-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-orange-500 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-yellow-500 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-3xl w-full">
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl rounded-3xl border border-red-500/30 shadow-2xl shadow-red-500/20 p-8 mb-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full mb-4 shadow-lg shadow-red-500/50">
              <span className="text-4xl">💀</span>
            </div>
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 mb-2">
              GAME OVER
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-orange-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-2xl p-6 border border-slate-600/30 hover:border-red-400/50 transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-green-400 rounded-full group-hover:animate-pulse"></div>
                <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">
                  생존 시간
                </span>
              </div>
              <div className="text-3xl font-bold text-white">
                {formatTime(gameState.gameTime)}
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-2xl p-6 border border-slate-600/30 hover:border-orange-400/50 transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-orange-400 rounded-full group-hover:animate-pulse"></div>
                <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">
                  점수
                </span>
              </div>
              <div className="text-3xl font-bold text-white">
                {gameState.score.toLocaleString()}
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-2xl p-6 border border-slate-600/30 hover:border-blue-400/50 transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full group-hover:animate-pulse"></div>
                <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">
                  웨이브
                </span>
              </div>
              <div className="text-3xl font-bold text-white">
                {gameState.wave}
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-2xl p-6 border border-slate-600/30 hover:border-purple-400/50 transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-purple-400 rounded-full group-hover:animate-pulse"></div>
                <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">
                  레벨
                </span>
              </div>
              <div className="text-3xl font-bold text-white">
                {player.level}
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            {isSubmitting && (
              <div className="text-yellow-400 mb-2">점수 저장 중...</div>
            )}
            {submitted && (
              <div className="text-green-400 mb-2">점수가 저장되었습니다!</div>
            )}
          </div>

          <div className="flex justify-center">
            <button
              onClick={onRestart}
              className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 hover:from-emerald-500 hover:via-green-500 hover:to-emerald-600 text-white px-12 py-4 rounded-2xl font-bold text-xl shadow-lg shadow-green-500/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/40"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="relative flex items-center gap-3">
                <Home
                  size={24}
                  className="group-hover:rotate-12 transition-transform duration-300"
                />
                <span>메뉴로 돌아가기</span>
              </div>
            </button>
          </div>
        </div>

        {/* Ranking Card */}
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl rounded-3xl border border-slate-600/30 shadow-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-slate-900">🏆</span>
            </div>
            <h3 className="text-2xl font-bold text-white">랭킹</h3>
          </div>
          {renderRanking()}
        </div>
      </div>
    </div>
  );
}
