"use client";
import { Home, Pause, Play, Shield, Sparkles, Sword } from "lucide-react";
import type { Player, GameState } from "../internal";
import { WEAPONS } from "../data/weapons";
import { PASSIVES } from "../data/passives";

interface GameUIProps {
  gameState: GameState;
  player: Player;
  playerStats: {
    damageMultiplier: number;
    cooldownReduction: number;
    rangeMultiplier: number;
    expMultiplier: number;
    magnetRange: number;
    healthRegen: number;
  };
  onPause: () => void;
  onRestart: () => void;
}

export function GameUI({
  gameState,
  player,
  playerStats,
  onPause,
  onRestart,
}: GameUIProps) {
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {/* Top UI */}
      <div className="relative z-10 flex justify-between w-full max-w-5xl mb-4">
        <div className="flex gap-3">
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl px-4 py-2 rounded-xl border border-slate-600/50 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-slate-400 font-medium text-sm">시간</span>
              <span className="text-white font-bold">
                {formatTime(gameState.gameTime)}
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl px-4 py-2 rounded-xl border border-slate-600/50 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-slate-400 font-medium text-sm">점수</span>
              <span className="text-white font-bold">
                {gameState.score.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl px-4 py-2 rounded-xl border border-slate-600/50 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-slate-400 font-medium text-sm">웨이브</span>
              <span className="text-white font-bold">{gameState.wave}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onPause}
            className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 shadow-lg hover:shadow-xl border border-blue-400/30"
          >
            <div className="group-hover:scale-110 transition-transform duration-200">
              {gameState.state === "paused" ? (
                <Play size={16} />
              ) : (
                <Pause size={16} />
              )}
            </div>
            <span className="font-semibold text-sm">
              {gameState.state === "paused" ? "재개" : "일시정지"}
            </span>
          </button>

          <button
            onClick={onRestart}
            className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 shadow-lg hover:shadow-xl border border-red-400/30"
          >
            <div className="group-hover:rotate-12 transition-transform duration-200">
              <Home size={16} />
            </div>
            <span className="font-semibold text-sm">메뉴</span>
          </button>
        </div>
      </div>

      {/* Bottom UI */}
      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-4 my-1">
        {/* Health */}
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl p-4 rounded-xl border border-slate-600/50 shadow-lg hover:border-red-400/50 transition-all duration-300 group">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Shield className="text-white" size={16} />
            </div>
            <span className="text-white font-bold text-lg">체력</span>
          </div>

          <div className="relative">
            <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden border border-slate-600/30">
              <div
                className="bg-gradient-to-r from-red-500 to-red-400 h-3 rounded-full transition-all duration-500 relative overflow-hidden"
                style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent animate-pulse"></div>
              </div>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-slate-400 font-medium">
                {Math.floor(player.hp)} / {player.maxHp}
              </span>
              <span className="text-xs text-red-400 font-bold">
                {Math.round((player.hp / player.maxHp) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Experience */}
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl p-4 rounded-xl border border-slate-600/50 shadow-lg hover:border-blue-400/50 transition-all duration-300 group">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="text-white" size={16} />
            </div>
            <span className="text-white font-bold text-lg">
              레벨 {player.level}
            </span>
          </div>

          <div className="relative">
            <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden border border-slate-600/30">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full transition-all duration-500 relative overflow-hidden"
                style={{ width: `${(player.exp / player.expToNext) * 100}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent animate-pulse"></div>
              </div>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-slate-400 font-medium">
                {player.exp} / {player.expToNext}
              </span>
              <span className="text-xs text-blue-400 font-bold">
                {Math.round((player.exp / player.expToNext) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Weapons */}
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl p-4 rounded-xl border border-slate-600/50 shadow-lg hover:border-yellow-400/50 transition-all duration-300 group">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Sword className="text-white" size={16} />
            </div>
            <span className="text-white font-bold text-lg">무기</span>
          </div>

          <div className="flex gap-2 flex-wrap">
            {player.weapons.map((weapon, index) => {
              const weaponData = WEAPONS[weapon.id];
              const IconComponent = weaponData.icon;
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-slate-700/80 to-slate-800/80 p-2 rounded-lg flex items-center gap-1 border border-slate-600/30 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105 group/weapon"
                  title={`${weaponData.name} Lv.${weapon.level}`}
                >
                  <div className="group-hover/weapon:animate-pulse">
                    <IconComponent
                      size={14}
                      style={{ color: weaponData.color }}
                    />
                  </div>
                  <span className="text-xs text-white font-medium">
                    {weapon.level}
                  </span>
                </div>
              );
            })}

            {player.weapons.length < player.weaponSlots && (
              <div className="bg-slate-700/30 border-2 border-dashed border-slate-600/50 p-2 rounded-lg flex items-center justify-center min-w-[40px]">
                <span className="text-slate-500 text-xs">+</span>
              </div>
            )}
          </div>

          {/* Passives */}
          {player.passives.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-600/30">
              <div className="flex gap-2 flex-wrap">
                {player.passives.map((passive, index) => {
                  const passiveData = PASSIVES[passive.id];
                  const IconComponent = passiveData.icon;
                  return (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-purple-700/80 to-purple-800/80 p-2 rounded-lg flex items-center gap-1 border border-purple-600/30 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 group/passive"
                      title={`${passiveData.name} Lv.${passive.level}`}
                    >
                      <div className="group-hover/passive:animate-pulse">
                        <IconComponent
                          size={12}
                          style={{ color: passiveData.color }}
                        />
                      </div>
                      <span className="text-xs text-white font-medium">
                        {passive.level}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
