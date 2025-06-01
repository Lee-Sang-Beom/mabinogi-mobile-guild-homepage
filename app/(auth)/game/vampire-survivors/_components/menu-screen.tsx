"use client";
import type { Character, GameRankingData } from "../internal";
import { WEAPONS } from "../data/weapons";
import { GameProps } from "../../internal";

interface MenuScreenProps {
  onStartGame: (character: Character) => void;
  user: GameProps["user"];
  characters: Character[];
  rankingData?: GameRankingData;
}

export function MenuScreen({
  onStartGame,
  user,
  characters,
  rankingData,
}: MenuScreenProps) {
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
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-40 h-40 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-indigo-500 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-pink-500 rounded-full blur-xl animate-pulse delay-500"></div>
        <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-blue-500 rounded-full blur-lg animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 py-12">
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl rounded-3xl border border-purple-500/30 shadow-2xl shadow-purple-500/20 p-8 max-w-6xl w-full">
          <div className="text-center mb-12">
            <div className="relative mb-6">
              <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-red-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
                🧛 뱀파이어 서바이벌
              </h1>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-2 bg-gradient-to-r from-red-500 via-purple-500 to-pink-500 rounded-full blur-sm"></div>
            </div>
            <p className="text-lg text-slate-300 font-light tracking-wide">
              ⚔️ 캐릭터를 선택하여 생존의 여정을 시작하세요 ⚔️
            </p>
          </div>

          {/* Character Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {characters.map((character, index) => {
              const IconComponent = character.icon;
              return (
                <div
                  key={character.id}
                  onClick={() => onStartGame(character)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      onStartGame(character);
                    }
                  }}
                  className="group relative bg-gradient-to-br from-slate-700/80 to-slate-800/80 p-8 rounded-2xl cursor-pointer hover:from-slate-600/80 hover:to-slate-700/80 transition-all duration-500 hover:scale-105 hover:shadow-2xl border border-slate-600/50 hover:border-purple-400/50 backdrop-blur-sm"
                  style={{
                    animationDelay: `${index * 150}ms`,
                  }}
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative text-center">
                    <div className="relative mb-6">
                      <div
                        className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-4xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110"
                        style={{
                          backgroundColor: character.color,
                          boxShadow: `0 0 20px ${character.color}40`,
                        }}
                      >
                        <IconComponent
                          className="text-white group-hover:animate-bounce"
                          size={36}
                        />
                      </div>
                    </div>

                    <h3 className="text-3xl font-bold text-white mb-6 group-hover:text-purple-200 transition-colors duration-300">
                      {character.name}
                    </h3>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <span className="text-slate-400 font-medium">
                          💗 체력
                        </span>
                        <span className="text-green-400 font-bold text-lg">
                          {character.hp}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <span className="text-slate-400 font-medium">
                          ⚡ 속도
                        </span>
                        <span className="text-blue-400 font-bold text-lg">
                          {character.speed}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <span className="text-slate-400 font-medium">
                          🗡️ 시작 무기
                        </span>
                        <span className="text-yellow-400 font-bold text-md">
                          {WEAPONS[character.startWeapon].name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-2xl p-6 border border-slate-600/30">
            <div className="text-center">
              <h4 className="text-xl font-bold text-white mb-4 flex items-center justify-center gap-2">
                <span>🎮</span> 게임 조작법
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
                <div className="flex items-center justify-center gap-3 bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-sm font-bold">
                    ⌨️
                  </div>
                  <span className="font-medium">WASD 또는 방향키로 이동</span>
                </div>
                <div className="flex items-center justify-center gap-3 bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
                  <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-sm font-bold">
                    ⏸️
                  </div>
                  <span className="font-medium">스페이스바: 일시정지/재개</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ranking Card */}
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl rounded-3xl border border-slate-600/30 shadow-2xl max-w-6xl w-full p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-lg font-bold text-slate-900">🏆</span>
            </div>
            <h3 className="text-3xl font-bold text-white">명예의 전당</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-yellow-400/50 to-transparent"></div>
          </div>
          {renderRanking()}
        </div>
      </div>
    </div>
  );
}
