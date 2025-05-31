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
}

export function GameCanvas({
  player,
  enemies,
  bullets,
  expOrbs,
  effects,
  gameState,
  selectedCharacter,
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
          case "death":
            ctx.strokeStyle = effect.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, 20 * progress, 0, Math.PI * 2);
            ctx.stroke();
            break;
          case "melee":
            // 근접 무기 - 플레이어 중심 원형 공격 표시
            ctx.strokeStyle = effect.color;
            ctx.lineWidth = 5;
            ctx.globalAlpha = alpha * 0.7;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
            ctx.stroke();

            // 추가 시각 효과 - 펄스 효과
            ctx.strokeStyle = effect.color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = alpha * 0.3;
            ctx.beginPath();
            ctx.arc(
              effect.x,
              effect.y,
              effect.radius * (1 + progress * 0.5),
              0,
              Math.PI * 2
            );
            ctx.stroke();
            break;
          case "area":
            ctx.fillStyle = effect.color;
            ctx.globalAlpha = alpha * 0.3;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
            ctx.fill();

            // 테두리 효과
            ctx.strokeStyle = effect.color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = alpha * 0.6;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
            ctx.stroke();
            break;
          case "lightning":
            // 번개 효과 - 여러 개의 번쩍이는 원
            for (let i = 0; i < 3; i++) {
              ctx.fillStyle = effect.color;
              ctx.globalAlpha = alpha * (0.8 - i * 0.2);
              ctx.beginPath();
              ctx.arc(effect.x, effect.y, 12 + i * 4, 0, Math.PI * 2);
              ctx.fill();
            }
            break;
          case "charging":
            // 차징 효과 - 플레이어에서 타겟으로의 선
            ctx.strokeStyle = effect.color;
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.globalAlpha = alpha * 0.8;
            ctx.beginPath();
            ctx.moveTo(effect.x, effect.y);
            ctx.lineTo(effect.targetX!, effect.targetY!);
            ctx.stroke();
            ctx.setLineDash([]);

            // 차징 포인트
            ctx.fillStyle = effect.color;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, 8 * (1 - progress), 0, Math.PI * 2);
            ctx.fill();
            break;
          case "beam":
            // 레이저 빔 효과
            ctx.strokeStyle = effect.color;
            ctx.lineWidth = effect.width;
            ctx.globalAlpha = alpha * 0.8;
            ctx.beginPath();
            ctx.moveTo(effect.x, effect.y);
            ctx.lineTo(effect.targetX!, effect.targetY!);
            ctx.stroke();

            // 빔 중심선
            ctx.strokeStyle = "#FFFFFF";
            ctx.lineWidth = effect.width * 0.3;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.moveTo(effect.x, effect.y);
            ctx.lineTo(effect.targetX!, effect.targetY!);
            ctx.stroke();
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
        <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-blue-400/60 rounded-br-lg"></div>
      </div>
    </div>
  );
}
