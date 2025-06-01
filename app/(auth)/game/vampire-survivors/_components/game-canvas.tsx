"use client";

import { useEffect, useRef } from "react";
import type {
  Player,
  Enemy,
  Bullet,
  ExpOrb,
  Effect,
  GameState,
  Character,
} from "../internal";
import { GAME_CONFIG } from "../data/config";
import { ENEMIES } from "../data/enemies";

interface GameCanvasProps {
  player: Player;
  enemies: Enemy[];
  bullets: Bullet[];
  expOrbs: ExpOrb[];
  effects: Effect[];
  gameState: GameState;
  selectedCharacter: Character | null;
  orbitalWeapons: any[];
}

export function GameCanvas({
  player,
  enemies,
  bullets,
  expOrbs,
  effects,
  gameState,
  selectedCharacter,
  orbitalWeapons,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);

    if (gameState.state === "playing" || gameState.state === "paused") {
      // Background
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);

      // Player
      ctx.save();
      ctx.fillStyle = selectedCharacter?.color ?? "#4A90E2";
      ctx.font = `${GAME_CONFIG.PLAYER_SIZE}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Character-specific symbols
      let playerSymbol = "🧙‍♂️"; // default
      if (selectedCharacter) {
        switch (selectedCharacter.name) {
          case "전사":
            playerSymbol = "👨‍🦲";
            break;
          case "마법사":
            playerSymbol = "🧙‍♂️";
            break;
          case "궁수":
            playerSymbol = "👨";
            break;
          default:
            playerSymbol = "🧙‍♂️";
        }
      }

      // Invulnerability effect
      if (player.invulnerableUntil && Date.now() < player.invulnerableUntil) {
        ctx.globalAlpha = 0.5;
      }

      ctx.fillText(playerSymbol, player.x, player.y);
      ctx.restore();

      // Enemies with HP bars
      enemies.forEach((enemy) => {
        ctx.save();
        ctx.fillStyle = enemy.color;
        ctx.font = `${enemy.size}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const enemyData = ENEMIES[enemy.type];

        // Enemy symbols
        let enemySymbol = "👾";
        switch (enemy.type) {
          case "zombie":
            enemySymbol = "🧟";
            break;
          case "skeleton":
            enemySymbol = "💀";
            break;
          case "bat":
            enemySymbol = "🦇";
            break;
          case "ghost":
            enemySymbol = "👻";
            break;
          case "orc":
            enemySymbol = "👹";
            break;
          case "demon":
            enemySymbol = "😈";
            break;
          case "reaper":
            enemySymbol = "☠️";
            break;
          case "dragon":
            enemySymbol = "🐉";
            break;
        }

        ctx.fillText(enemySymbol, enemy.x, enemy.y);

        // Enhanced HP bar for all enemies
        const hpPercent = enemy.hp / enemy.maxHp;
        const barWidth = Math.max(30, enemy.size * 1.5);
        const barHeight = 4;
        const barY = enemy.y - enemy.size / 2 - 12;

        // HP bar background
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(
          enemy.x - barWidth / 2 - 1,
          barY - 1,
          barWidth + 2,
          barHeight + 2
        );

        // HP bar background (red)
        ctx.fillStyle = "#ff0000";
        ctx.fillRect(enemy.x - barWidth / 2, barY, barWidth, barHeight);

        // HP bar foreground (green)
        ctx.fillStyle =
          hpPercent > 0.5
            ? "#00ff00"
            : hpPercent > 0.25
              ? "#ffff00"
              : "#ff4444";
        ctx.fillRect(
          enemy.x - barWidth / 2,
          barY,
          barWidth * hpPercent,
          barHeight
        );

        // HP text for bosses
        if (enemy.isBoss) {
          ctx.fillStyle = "white";
          ctx.font = "10px Arial";
          ctx.fillText(
            `${Math.ceil(enemy.hp)}/${enemy.maxHp}`,
            enemy.x,
            barY - 8
          );
        }

        // Slow effect
        if (Date.now() < (enemy.slowEndTime ?? 0)) {
          ctx.strokeStyle = "#87CEEB";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(enemy.x, enemy.y, enemy.size / 2 + 3, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();
      });

      // Bullets
      bullets.forEach((bullet) => {
        ctx.fillStyle = bullet.color;
        ctx.beginPath();
        ctx.arc(
          bullet.x,
          bullet.y,
          GAME_CONFIG.BULLET_SIZE / 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
      });

      // Experience orbs
      expOrbs.forEach((orb) => {
        ctx.save();
        ctx.fillStyle = orb.magnetized ? "#00FFFF" : "#00BFFF";
        ctx.font = `${GAME_CONFIG.EXP_ORB_SIZE}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("💎", orb.x, orb.y);
        ctx.restore();
      });

      // Effects
      effects.forEach((effect) => {
        const progress = (Date.now() - effect.startTime) / effect.duration;
        const alpha = 1 - progress;
        ctx.save();
        ctx.globalAlpha = alpha;

        switch (effect.type) {
          case "hit":
            ctx.fillStyle = effect.color;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, 8 * progress, 0, Math.PI * 2);
            ctx.fill();
            break;
          case "orbital-hit":
            // 궤도 무기 타격 이펙트
            ctx.strokeStyle = effect.color;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, 15 * progress, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = effect.color;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, 5, 0, Math.PI * 2);
            ctx.fill();
            break;
          case "death":
            ctx.strokeStyle = effect.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, 20 * progress, 0, Math.PI * 2);
            ctx.stroke();
            break;
          case "melee":
            ctx.strokeStyle = effect.color;
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
            ctx.stroke();
            break;
          case "area":
            ctx.fillStyle = effect.color;
            ctx.globalAlpha = alpha * 0.3;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
            ctx.fill();
            break;
          case "lightning":
            ctx.fillStyle = effect.color;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, 12, 0, Math.PI * 2);
            ctx.fill();
            break;
          case "damage":
            ctx.fillStyle = effect.color;
            ctx.font = "16px Arial";
            ctx.textAlign = "center";
            ctx.fillText("!", effect.x, effect.y - 10 * progress);
            break;
        }

        ctx.restore();
      });

      // Orbital weapons 렌더링 - 게임 로직과 동일한 계산 사용
      const currentTime = Date.now();
      orbitalWeapons.forEach((orbital) => {
        for (let i = 0; i < orbital.orbitCount; i++) {
          // 게임 로직과 정확히 동일한 계산 사용
          const orbitSpeed = orbital.weaponId === "kingBible" ? 1.5 : 2;
          const angle =
            currentTime * orbitSpeed * 0.001 +
            (i * Math.PI * 2) / orbital.orbitCount;
          const orbitalX = player.x + Math.cos(angle) * orbital.range;
          const orbitalY = player.y + Math.sin(angle) * orbital.range;

          ctx.save();

          // 궤도 무기 본체
          ctx.fillStyle = orbital.color;
          ctx.shadowColor = orbital.color;
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(orbitalX, orbitalY, 12, 0, Math.PI * 2);
          ctx.fill();

          // 궤도 무기 테두리
          ctx.strokeStyle = "white";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(orbitalX, orbitalY, 12, 0, Math.PI * 2);
          ctx.stroke();

          // 히트박스 시각화 (디버깅용)
          const hitboxSize = orbital.weaponId === "kingBible" ? 50 : 35;
          ctx.strokeStyle = "rgba(255, 0, 0, 0.2)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(orbitalX, orbitalY, hitboxSize, 0, Math.PI * 2);
          ctx.stroke();

          ctx.restore();
        }

        // 궤도 경로 표시
        ctx.save();
        ctx.strokeStyle = `${orbital.color}40`;
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(player.x, player.y, orbital.range, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      // Pause overlay
      if (gameState.state === "paused") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
        ctx.fillStyle = "white";
        ctx.font = "48px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
          "일시정지",
          GAME_CONFIG.CANVAS_WIDTH / 2,
          GAME_CONFIG.CANVAS_HEIGHT / 2
        );
        ctx.font = "24px Arial";
        ctx.fillText(
          "스페이스바를 눌러 계속하기",
          GAME_CONFIG.CANVAS_WIDTH / 2,
          GAME_CONFIG.CANVAS_HEIGHT / 2 + 50
        );
      }
    }
  }, [
    player,
    enemies,
    bullets,
    expOrbs,
    effects,
    gameState,
    selectedCharacter,
    orbitalWeapons,
  ]);

  return (
    <div className="relative mb-4">
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-green-600/20 rounded-xl blur-lg"></div>
        <canvas
          ref={canvasRef}
          width={GAME_CONFIG.CANVAS_WIDTH}
          height={GAME_CONFIG.CANVAS_HEIGHT}
          className="relative border-2 border-slate-600/50 rounded-lg bg-gradient-to-br from-gray-900 to-black shadow-2xl"
        />
        <div className="absolute top-1 left-1 w-3 h-3 border-l-2 border-t-2 border-blue-400/60 rounded-tl-lg"></div>
        <div className="absolute top-1 right-1 w-3 h-3 border-r-2 border-t-2 border-blue-400/60 rounded-tr-lg"></div>
        <div className="absolute bottom-1 left-1 w-3 h-3 border-l-2 border-b-2 border-blue-400/60 rounded-bl-lg"></div>
        <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-blue-400/60 rounded-bl-lg"></div>
      </div>
    </div>
  );
}
