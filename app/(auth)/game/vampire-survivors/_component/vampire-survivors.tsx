"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Home, Pause, Play, Shield, Sparkles, Sword, Zap } from "lucide-react";
import { GameProps } from "@/app/(auth)/game/internal";
import {
  Bullet,
  Effect,
  Enemy,
  ExpOrb,
  Player,
  WeaponType,
} from "@/app/(auth)/game/vampire-survivors/internal";
import { getRandomAudio } from "@/app/(auth)/game/util";
import { useCreateGame } from "@/app/(auth)/game/hooks/use-create-game";
import { useGetGamesByGameType } from "@/app/(auth)/game/hooks/use-get-games-by-game-type";
import { GameCreateRequest } from "../../api";
import moment from "moment";
import {
  CHARACTERS,
  ENEMY_TYPES,
  GAME_CONFIG,
  WEAPONS,
} from "@/app/(auth)/game/vampire-survivors/data";

// 유틸리티 함수: 점과 선분 사이의 거리 계산 (레이저용)
function getDistanceToLine(
  lineStart: { x: number; y: number },
  lineEnd: { x: number; y: number },
  point: { x: number; y: number }
): number {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;

  if (lenSq === 0) return Math.sqrt(A * A + B * B);

  const param = dot / lenSq;

  let xx: number, yy: number;

  if (param < 0) {
    xx = lineStart.x;
    yy = lineStart.y;
  } else if (param > 1) {
    xx = lineEnd.x;
    yy = lineEnd.y;
  } else {
    xx = lineStart.x + param * C;
    yy = lineStart.y + param * D;
  }

  const dx = point.x - xx;
  const dy = point.y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

export default function VampireSurvivalGame({ user }: GameProps) {
  // CRUD 훅들
  const createGameMutation = useCreateGame();
  const { data: rankingData, refetch: refetchRanking } =
    useGetGamesByGameType("vampire");

  const [selectedAudio, setSelectedAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number | null>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const lastAttackRef = useRef<Record<string, number>>({});
  const enemySpawnRef = useRef<number>(0);

  const [highScore, setHighScore] = useState(0);
  // 게임 상태
  const [gameState, setGameState] = useState<
    "menu" | "playing" | "paused" | "levelup" | "gameover"
  >("menu");
  const [selectedCharacter, setSelectedCharacter] = useState<
    (typeof CHARACTERS)[0] | null
  >(null);

  // 플레이어 상태
  const [player, setPlayer] = useState<Player>({
    x: GAME_CONFIG.CANVAS_WIDTH / 2,
    y: GAME_CONFIG.CANVAS_HEIGHT / 2,
    hp: 100,
    maxHp: 100,
    level: 1,
    exp: 0,
    expToNext: 100,
    weapons: [],
    passives: [],
    invulnerableUntil: 0,
  });

  // 게임 오브젝트
  const [isDead, setIsDead] = useState(false);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [expOrbs, setExpOrbs] = useState<ExpOrb[]>([]);
  const [effects, setEffects] = useState<Effect[]>([]);
  const [gameTime, setGameTime] = useState(0);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [availableUpgrades, setAvailableUpgrades] = useState<any[]>([]);

  // 유틸리티 함수
  const checkCollision = useCallback(
    (
      obj1: { x: number; y: number },
      obj2: { x: number; y: number },
      size1: number = GAME_CONFIG.PLAYER_SIZE,
      size2: number = GAME_CONFIG.ENEMY_SIZE
    ) => {
      const dx = obj1.x - obj2.x;
      const dy = obj1.y - obj2.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < (size1 + size2) / 2;
    },
    []
  );

  const getDistance = useCallback(
    (obj1: { x: number; y: number }, obj2: { x: number; y: number }) => {
      const dx = obj1.x - obj2.x;
      const dy = obj1.y - obj2.y;
      return Math.sqrt(dx * dx + dy * dy);
    },
    []
  );

  function getWeightedEnemyType(maxIndex: number) {
    const weights = Array.from(
      { length: maxIndex + 1 },
      (_, i) => Math.pow(1 / (i + 1), 1.5) // 뒤로 갈수록 가중치가 낮아짐
    );

    const totalWeight = weights.reduce((acc, w) => acc + w, 0);
    const rand = Math.random() * totalWeight;

    let cumulative = 0;
    for (let i = 0; i <= maxIndex; i++) {
      cumulative += weights[i];
      if (rand < cumulative) {
        return ENEMY_TYPES[i];
      }
    }

    return ENEMY_TYPES[0]; // fallback
  }

  const createEffect = useCallback(
    (
      type: string,
      x: number,
      y: number,
      options: { duration?: number; [key: string]: any }
    ) => {
      const effectId = Math.random();
      const effect: Effect = {
        id: effectId,
        type,
        x,
        y,
        duration: options.duration ?? 500,
        startTime: Date.now(),
        ...options,
      };
      setEffects((prev) => [...prev, effect]);

      setTimeout(() => {
        setEffects((prev) => prev.filter((e) => e.id !== effectId));
      }, effect.duration);
    },
    []
  );

  const playerSpeed = useMemo(
    () => selectedCharacter?.speed ?? GAME_CONFIG.PLAYER_SPEED,
    [selectedCharacter]
  );
  const spawnRate = useMemo(() => Math.max(500 - wave * 50, 100), [wave]);

  // 랭킹 데이터에서 최고점수 가져오기
  useEffect(() => {
    if (rankingData?.success && rankingData.data) {
      const userBestScore = rankingData.data
        .filter((game) => game.userId === user.id)
        .reduce((max, game) => Math.max(max, game.score), 0);
      setHighScore(userBestScore);
    }
  }, [rankingData, user.id]);

  // 키보드 이벤트
  useEffect(() => {
    const handleKeyDown = ({ key }: KeyboardEvent) => {
      keysRef.current[key] = true;
      if (key === " ") {
        if (gameState === "playing") {
          setGameState("paused");
        } else if (gameState === "paused") {
          setGameState("playing");
        }
      }
    };

    const handleKeyUp = ({ key }: KeyboardEvent) => {
      keysRef.current[key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState]);

  // 스크롤 방지
  useEffect(() => {
    const preventScroll = (e: Event) => {
      e.preventDefault();
    };

    const isGameActive = ["playing", "paused", "levelup"].includes(gameState);
    if (isGameActive) {
      if (audioRef.current) {
        const audio = audioRef.current;

        if (isGameActive) {
          if (audio.paused) {
            // 정지된 경우에만 재생
            audio.play().catch((err) => {
              console.warn("음악 재생 실패:", err);
            });
          }
        }
      }

      document.body.style.overflow = "hidden";
      window.addEventListener("wheel", preventScroll, { passive: false });
      window.addEventListener("touchmove", preventScroll, { passive: false });
    } else {
      if (gameState === "gameover" && audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      document.body.style.overflow = "";
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
    };
  }, [gameState]);

  // 플레이어 이동
  const movePlayer = useCallback(() => {
    setPlayer((prev) => {
      let newX = prev.x;
      let newY = prev.y;

      if (keysRef.current["ArrowLeft"] || keysRef.current["a"])
        newX -= playerSpeed;
      if (keysRef.current["ArrowRight"] || keysRef.current["d"])
        newX += playerSpeed;
      if (keysRef.current["ArrowUp"] || keysRef.current["w"])
        newY -= playerSpeed;
      if (keysRef.current["ArrowDown"] || keysRef.current["s"])
        newY += playerSpeed;

      newX = Math.max(
        GAME_CONFIG.PLAYER_SIZE / 2,
        Math.min(GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.PLAYER_SIZE / 2, newX)
      );
      newY = Math.max(
        GAME_CONFIG.PLAYER_SIZE / 2,
        Math.min(GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.PLAYER_SIZE / 2, newY)
      );

      return { ...prev, x: newX, y: newY };
    });
  }, [playerSpeed]);

  // 적 생성
  // const spawnEnemies = useCallback(() => {
  //   const now = Date.now();
  //   if (now - enemySpawnRef.current > spawnRate) {
  //     const enemyType =
  //       ENEMY_TYPES[
  //         Math.floor(
  //           Math.random() *
  //             Math.min(ENEMY_TYPES.length, Math.floor(wave / 2) + 1),
  //         )
  //       ];
  //     const side = Math.floor(Math.random() * 4);
  //     let x = 0;
  //     let y = 0;
  //
  //     switch (side) {
  //       case 0:
  //         x = Math.random() * GAME_CONFIG.CANVAS_WIDTH;
  //         y = -enemyType.size;
  //         break;
  //       case 1:
  //         x = GAME_CONFIG.CANVAS_WIDTH + enemyType.size;
  //         y = Math.random() * GAME_CONFIG.CANVAS_HEIGHT;
  //         break;
  //       case 2:
  //         x = Math.random() * GAME_CONFIG.CANVAS_WIDTH;
  //         y = GAME_CONFIG.CANVAS_HEIGHT + enemyType.size;
  //         break;
  //       default:
  //         x = -enemyType.size;
  //         y = Math.random() * GAME_CONFIG.CANVAS_HEIGHT;
  //         break;
  //     }
  //
  //     setEnemies((prev) => [
  //       ...prev,
  //       {
  //         id: Math.random(),
  //         x,
  //         y,
  //         ...enemyType,
  //         maxHp: enemyType.hp,
  //         slowEffect: 1,
  //         slowEndTime: 0,
  //       },
  //     ]);
  //     enemySpawnRef.current = now;
  //   }
  // }, [spawnRate, wave]);

  const spawnEnemies = useCallback(() => {
    const now = Date.now();
    if (now - enemySpawnRef.current > spawnRate) {
      const maxEnemyIndex = Math.min(
        ENEMY_TYPES.length - 1,
        Math.floor(wave / 2)
      );
      const enemyType = getWeightedEnemyType(maxEnemyIndex);

      const side = Math.floor(Math.random() * 4);
      let x = 0;
      let y = 0;

      switch (side) {
        case 0:
          x = Math.random() * GAME_CONFIG.CANVAS_WIDTH;
          y = -enemyType.size;
          break;
        case 1:
          x = GAME_CONFIG.CANVAS_WIDTH + enemyType.size;
          y = Math.random() * GAME_CONFIG.CANVAS_HEIGHT;
          break;
        case 2:
          x = Math.random() * GAME_CONFIG.CANVAS_WIDTH;
          y = GAME_CONFIG.CANVAS_HEIGHT + enemyType.size;
          break;
        default:
          x = -enemyType.size;
          y = Math.random() * GAME_CONFIG.CANVAS_HEIGHT;
          break;
      }

      setEnemies((prev) => [
        ...prev,
        {
          id: Math.random(),
          x,
          y,
          ...enemyType,
          maxHp: enemyType.hp,
          slowEffect: 1,
          slowEndTime: 0,
        },
      ]);
      enemySpawnRef.current = now;
    }
  }, [spawnRate, wave]);

  // 적 이동
  const moveEnemies = useCallback(() => {
    setEnemies((prev) =>
      prev.map((enemy) => {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 0) {
          const currentTime = Date.now();
          const slowMultiplier =
            currentTime < (enemy.slowEndTime ?? 0)
              ? (enemy.slowEffect ?? 1)
              : 1;
          const moveX = (dx / distance) * enemy.speed * slowMultiplier;
          const moveY = (dy / distance) * enemy.speed * slowMultiplier;
          return { ...enemy, x: enemy.x + moveX, y: enemy.y + moveY };
        }
        return enemy;
      })
    );
  }, [player.x, player.y]);

  // 공격
  const attack = useCallback(() => {
    const now = Date.now();
    player.weapons.forEach((weaponId) => {
      const weapon = WEAPONS[weaponId];
      const lastAttackTime = lastAttackRef.current[weaponId] ?? 0;

      if (now - lastAttackTime > weapon.cooldown) {
        if (weapon.type === "melee" || weapon.type === "defensive") {
          // 근접 무기 처리 (sword, axe, shield)
          const enemiesInRange = enemies.filter(
            (enemy) => getDistance(player, enemy) <= weapon.range
          );

          if (enemiesInRange.length > 0) {
            // 이펙트 생성
            if (weaponId === "axe" && "cleave" in weapon) {
              createEffect("cleave", player.x, player.y, {
                radius: weapon.range,
                angle: weapon.cleaveAngle,
                color: weapon.color,
                duration: 400,
              });
            } else if (weaponId === "shield") {
              createEffect("knockback", player.x, player.y, {
                radius: weapon.range,
                color: weapon.color,
                duration: 300,
              });
            } else {
              createEffect("slash", player.x, player.y, {
                radius: weapon.range,
                color: weapon.color,
                duration: 300,
              });
            }

            // ✅ 추가: 실제 데미지 처리
            enemiesInRange.forEach((enemy) => {
              setEnemies((prev) =>
                prev.reduce<Enemy[]>((acc, e) => {
                  if (e.id === enemy.id) {
                    const newHp = e.hp - weapon.damage;
                    if (newHp > 0) {
                      acc.push({ ...e, hp: newHp });
                    } else {
                      // 적 사망 시 경험치 드롭
                      setExpOrbs((prevOrbs) => [
                        ...prevOrbs,
                        { id: Math.random(), x: e.x, y: e.y, exp: e.exp },
                      ]);
                      setScore((prev) => prev + e.exp);
                    }
                  } else {
                    acc.push(e);
                  }
                  return acc;
                }, [])
              );
            });

            lastAttackRef.current[weaponId] = now;
          }
        } else if (weapon.type === "multi") {
          // 수리검 - 여러 발사체
          let closestEnemy: Enemy | null = null;
          let closestDistance = weapon.range;

          enemies.forEach((enemy) => {
            const distance = getDistance(player, enemy);
            if (distance < closestDistance) {
              closestEnemy = enemy;
              closestDistance = distance;
            }
          });

          if (
            closestEnemy &&
            "projectileCount" in weapon &&
            "spread" in weapon
          ) {
            const baseAngle = Math.atan2(
              (closestEnemy as Enemy).y - player.y,
              (closestEnemy as Enemy).x - player.x
            );

            for (let i = 0; i < weapon.projectileCount; i++) {
              const spreadAngle =
                ((weapon.spread * Math.PI) / 180) *
                (i - (weapon.projectileCount - 1) / 2);
              const angle = baseAngle + spreadAngle;

              setBullets((prev) => [
                ...prev,
                {
                  id: Math.random(),
                  x: player.x,
                  y: player.y,
                  vx: Math.cos(angle) * GAME_CONFIG.BULLET_SPEED,
                  vy: Math.sin(angle) * GAME_CONFIG.BULLET_SPEED,
                  damage: weapon.damage,
                  color: weapon.color,
                  range: weapon.range,
                  traveled: 0,
                  weaponType: weaponId,
                  targetId: closestEnemy!.id,
                },
              ]);
            }
            lastAttackRef.current[weaponId] = now;
          }
        } else if (weapon.type === "explosive") {
          // 폭탄 - 지연 폭발
          let closestEnemy: Enemy | null = null;
          let closestDistance = weapon.range;

          enemies.forEach((enemy) => {
            const distance = getDistance(player, enemy);
            if (distance < closestDistance) {
              closestEnemy = enemy;
              closestDistance = distance;
            }
          });

          if (closestEnemy && "delay" in weapon) {
            setBullets((prev) => [
              ...prev,
              {
                id: Math.random(),
                x: closestEnemy!.x,
                y: closestEnemy!.y,
                vx: 0,
                vy: 0,
                damage: weapon.damage,
                color: weapon.color,
                range: weapon.range,
                traveled: 0,
                weaponType: weaponId,
                targetId: closestEnemy!.id,
                targetX: closestEnemy!.x,
                targetY: closestEnemy!.y,
                delay: weapon.delay,
                startTime: now,
              },
            ]);
            lastAttackRef.current[weaponId] = now;
          }
        } else if (weapon.type === "beam") {
          // 레이저 - 차징 필요
          let closestEnemy: Enemy | null = null;
          let closestDistance = weapon.range;

          enemies.forEach((enemy) => {
            const distance = getDistance(player, enemy);
            if (distance < closestDistance) {
              closestEnemy = enemy;
              closestDistance = distance;
            }
          });

          if (closestEnemy && "chargeTime" in weapon) {
            // 차징 이펙트 먼저 생성
            createEffect("charging", player.x, player.y, {
              targetX: (closestEnemy as Enemy).x,
              targetY: (closestEnemy as Enemy).y,
              color: weapon.color,
              duration: weapon.chargeTime,
            });

            // 차징 후 레이저 발사
            setTimeout(() => {
              setBullets((prev) => [
                ...prev,
                {
                  id: Math.random(),
                  x: player.x,
                  y: player.y,
                  vx: 0,
                  vy: 0,
                  damage: weapon.damage,
                  color: weapon.color,
                  range: weapon.range,
                  traveled: 0,
                  weaponType: weaponId,
                  targetId: closestEnemy!.id,
                  targetX: closestEnemy!.x,
                  targetY: closestEnemy!.y,
                },
              ]);
            }, weapon.chargeTime);

            lastAttackRef.current[weaponId] = now;
          }
        } else if (weapon.type === "area") {
          // 회오리바람 처리 - 새로 추가
          if (weaponId === "whirlwind") {
            createEffect("whirlwind", player.x, player.y, {
              radius: weapon.range,
              color: weapon.color,
              duration: weapon.duration,
              pullForce: weapon.pullForce,
            });

            // 지속 데미지를 위한 인터벌 설정
            const whirlwindInterval = setInterval(() => {
              const enemiesInRange = enemies.filter(
                (enemy) => getDistance(player, enemy) <= weapon.range
              );

              enemiesInRange.forEach((enemy) => {
                setEnemies((prev) =>
                  prev.reduce<Enemy[]>((acc, e) => {
                    if (e.id === enemy.id) {
                      const newHp = e.hp - weapon.damage;
                      if (newHp > 0) {
                        // 적을 플레이어 쪽으로 끌어당기기
                        const dx = player.x - e.x;
                        const dy = player.y - e.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance > 0) {
                          const pullX = (dx / distance) * weapon.pullForce;
                          const pullY = (dy / distance) * weapon.pullForce;
                          acc.push({
                            ...e,
                            hp: newHp,
                            x: e.x + pullX,
                            y: e.y + pullY,
                          });
                        } else {
                          acc.push({ ...e, hp: newHp });
                        }
                      } else {
                        setExpOrbs((prevOrbs) => [
                          ...prevOrbs,
                          { id: Math.random(), x: e.x, y: e.y, exp: e.exp },
                        ]);
                        setScore((prev) => prev + e.exp);
                      }
                    } else {
                      acc.push(e);
                    }
                    return acc;
                  }, [])
                );
              });
            }, 300); // 0.3초마다 데미지

            // duration 후에 정리
            setTimeout(() => {
              clearInterval(whirlwindInterval);
            }, weapon.duration);

            lastAttackRef.current[weaponId] = now;
          }
        } else if (weapon.type === "moving") {
          // 토네이도 처리 - 새로 추가
          if (weaponId === "tornado") {
            // 가장 가까운 적을 향해 토네이도 생성
            let closestEnemy: Enemy | null = null;
            let closestDistance = weapon.range;

            enemies.forEach((enemy) => {
              const distance = getDistance(player, enemy);
              if (distance < closestDistance) {
                closestEnemy = enemy;
                closestDistance = distance;
              }
            });

            if (closestEnemy) {
              const tornadoId = Math.random();

              createEffect("tornado", player.x, player.y, {
                id: tornadoId,
                targetX: (closestEnemy as Enemy).x,
                targetY: (closestEnemy as Enemy).y,
                radius: weapon.areaRadius,
                color: weapon.color,
                duration: weapon.duration,
                moveSpeed: weapon.moveSpeed,
                damage: weapon.damage,
              });

              // 토네이도 이동 및 데미지 처리
              let tornadoX = player.x;
              let tornadoY = player.y;
              const targetX = (closestEnemy as Enemy).x;
              const targetY = (closestEnemy as Enemy).y;

              const tornadoInterval = setInterval(() => {
                // 타겟을 향해 이동
                const dx = targetX - tornadoX;
                const dy = targetY - tornadoY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > weapon.moveSpeed) {
                  tornadoX += (dx / distance) * weapon.moveSpeed;
                  tornadoY += (dy / distance) * weapon.moveSpeed;
                }

                // 토네이도 범위 내 적들에게 데미지
                enemies.forEach((enemy) => {
                  if (
                    getDistance({ x: tornadoX, y: tornadoY }, enemy) <=
                    weapon.areaRadius
                  ) {
                    setEnemies((prev) =>
                      prev.reduce<Enemy[]>((acc, e) => {
                        if (e.id === enemy.id) {
                          const newHp = e.hp - weapon.damage;
                          if (newHp > 0) {
                            acc.push({ ...e, hp: newHp });
                          } else {
                            setExpOrbs((prevOrbs) => [
                              ...prevOrbs,
                              { id: Math.random(), x: e.x, y: e.y, exp: e.exp },
                            ]);
                            setScore((prev) => prev + e.exp);
                          }
                        } else {
                          acc.push(e);
                        }
                        return acc;
                      }, [])
                    );
                  }
                });

                // 이펙트 위치 업데이트
                setEffects((prev) =>
                  prev.map((effect) =>
                    effect.id === tornadoId
                      ? { ...effect, x: tornadoX, y: tornadoY }
                      : effect
                  )
                );
              }, 100); // 0.1초마다 업데이트

              setTimeout(() => {
                clearInterval(tornadoInterval);
              }, weapon.duration);
            }

            lastAttackRef.current[weaponId] = now;
          }
        } else {
          // 기존 투사체 무기들 + 새로운 투사체 무기들
          let closestEnemy: Enemy | null = null;
          let closestDistance = weapon.range;

          enemies.forEach((enemy) => {
            const distance = getDistance(player, enemy);
            if (distance < closestDistance) {
              closestEnemy = enemy;
              closestDistance = distance;
            }
          });

          if (closestEnemy != null) {
            const angle = Math.atan2(
              (closestEnemy as Enemy).y - player.y,
              (closestEnemy as Enemy).x - player.x
            );

            const bulletData: Bullet = {
              id: Math.random(),
              x: player.x,
              y: player.y,
              vx: Math.cos(angle) * GAME_CONFIG.BULLET_SPEED,
              vy: Math.sin(angle) * GAME_CONFIG.BULLET_SPEED,
              damage: weapon.damage,
              color: weapon.color,
              range: weapon.range,
              traveled: 0,
              weaponType: weaponId,
              targetId: (closestEnemy as Enemy)!.id,
            };

            // 석궁의 관통 속성 추가
            if (weaponId === "crossbow" && "piercing" in weapon) {
              bulletData.piercing = weapon.piercing;
            }

            setBullets((prev) => [...prev, bulletData]);
            lastAttackRef.current[weaponId] = now;
          }
        }
      }
    });
  }, [player, enemies, getDistance, createEffect]);

  // 총알 이동
  const moveBullets = useCallback(() => {
    setBullets((prev) =>
      prev
        .map((bullet) => ({
          ...bullet,
          x: bullet.x + bullet.vx,
          y: bullet.y + bullet.vy,
          traveled: bullet.traveled + GAME_CONFIG.BULLET_SPEED,
        }))
        .filter(
          (bullet) =>
            bullet.traveled < bullet.range &&
            bullet.x > 0 &&
            bullet.x < GAME_CONFIG.CANVAS_WIDTH &&
            bullet.y > 0 &&
            bullet.y < GAME_CONFIG.CANVAS_HEIGHT
        )
    );
  }, []);

  // 충돌 처리
  const handleCollisions = useCallback(() => {
    // 총알과 적 충돌
    setBullets((prevBullets) => {
      const remainingBullets: Bullet[] = [];
      const hitEnemies = new Set<number>();

      prevBullets.forEach((bullet) => {
        let hit = false;
        const weapon = WEAPONS[bullet.weaponType];

        // 폭탄 타입 처리 (지연 폭발)
        if (weapon.type === "explosive" && bullet.delay && bullet.startTime) {
          const currentTime = Date.now();
          if (currentTime - bullet.startTime >= bullet.delay) {
            // 폭발 처리
            createEffect("explosion", bullet.x, bullet.y, {
              radius: weapon.explosionRadius,
              color: weapon.color,
              duration: 600,
            });

            // 폭발 범위 내 모든 적에게 데미지
            enemies.forEach((enemy) => {
              if (getDistance(bullet, enemy) <= weapon.explosionRadius) {
                setEnemies((prev) =>
                  prev.reduce<Enemy[]>((acc, e) => {
                    if (e.id === enemy.id) {
                      const newHp = e.hp - weapon.explosionDamage;
                      if (newHp > 0) {
                        acc.push({ ...e, hp: newHp });
                      } else {
                        setExpOrbs((prevOrbs) => [
                          ...prevOrbs,
                          { id: Math.random(), x: e.x, y: e.y, exp: e.exp },
                        ]);
                        setScore((prev) => prev + e.exp);
                      }
                    } else {
                      acc.push(e);
                    }
                    return acc;
                  }, [])
                );
              }
            });
            hit = true; // 폭탄은 폭발 후 제거
          } else {
            remainingBullets.push(bullet); // 아직 폭발 시간이 안됨
          }
          return;
        }

        // 레이저 타입 처리 (즉시 히트스캔)
        if (weapon.type === "beam" && bullet.targetX && bullet.targetY) {
          // 레이저 이펙트 생성
          createEffect("beam", bullet.x, bullet.y, {
            targetX: bullet.targetX,
            targetY: bullet.targetY,
            width: weapon.beamWidth,
            color: weapon.color,
            duration: 400,
          });

          // 레이저 경로상의 모든 적에게 데미지
          enemies.forEach((enemy) => {
            const distance = getDistanceToLine(
              { x: bullet.x, y: bullet.y },
              { x: bullet.targetX!, y: bullet.targetY! },
              enemy
            );

            if (distance <= weapon.beamWidth / 2 && !hitEnemies.has(enemy.id)) {
              hitEnemies.add(enemy.id);

              setEnemies((prev) =>
                prev.reduce<Enemy[]>((acc, e) => {
                  if (e.id === enemy.id) {
                    const newHp = e.hp - bullet.damage;
                    if (newHp > 0) {
                      acc.push({ ...e, hp: newHp });
                    } else {
                      setExpOrbs((prevOrbs) => [
                        ...prevOrbs,
                        { id: Math.random(), x: e.x, y: e.y, exp: e.exp },
                      ]);
                      setScore((prev) => prev + e.exp);
                    }
                  } else {
                    acc.push(e);
                  }
                  return acc;
                }, [])
              );
            }
          });
          hit = true; // 레이저는 즉시 제거
          return;
        }

        // 일반 투사체 처리
        enemies.forEach((enemy) => {
          if (
            !hitEnemies.has(enemy.id) &&
            checkCollision(bullet, enemy, GAME_CONFIG.BULLET_SIZE, enemy.size)
          ) {
            hitEnemies.add(enemy.id);

            // 석궁의 관통 처리
            if (
              bullet.weaponType === "crossbow" &&
              bullet.piercing &&
              bullet.piercing > 0
            ) {
              bullet.piercing -= 1;
              if (bullet.piercing <= 0) {
                hit = true;
              }
            } else {
              hit = true;
            }

            // 무기별 특수 효과 처리
            switch (bullet.weaponType) {
              case "fireball":
                if (
                  "explosionRadius" in weapon &&
                  "explosionDamage" in weapon
                ) {
                  createEffect("explosion", enemy.x, enemy.y, {
                    radius: weapon.explosionRadius,
                    color: weapon.color,
                    duration: 400,
                  });

                  // 폭발 범위 내 다른 적들에게도 데미지
                  enemies.forEach((e) => {
                    if (
                      e.id !== enemy.id &&
                      getDistance(enemy, e) <= weapon.explosionRadius
                    ) {
                      setEnemies((prev) =>
                        prev.reduce<Enemy[]>((acc, en) => {
                          if (en.id === e.id) {
                            const newHp = en.hp - weapon.explosionDamage;
                            if (newHp > 0) {
                              acc.push({ ...en, hp: newHp });
                            } else {
                              setExpOrbs((prevOrbs) => [
                                ...prevOrbs,
                                {
                                  id: Math.random(),
                                  x: en.x,
                                  y: en.y,
                                  exp: en.exp,
                                },
                              ]);
                              setScore((prev) => prev + en.exp);
                            }
                          } else {
                            acc.push(en);
                          }
                          return acc;
                        }, [])
                      );
                    }
                  });
                }
                break;

              case "lightning":
                if (
                  "chainRange" in weapon &&
                  "chainDamage" in weapon &&
                  "maxChains" in weapon
                ) {
                  createEffect("lightning", enemy.x, enemy.y, {
                    duration: 600,
                    color: weapon.color,
                  });

                  // 체인 라이트닝 처리
                  const chainTargets: number[] = [];
                  let currentTarget = enemy;

                  for (let i = 0; i < weapon.maxChains; i++) {
                    const nearbyEnemies = enemies.filter(
                      (e) =>
                        e.id !== currentTarget.id &&
                        !chainTargets.includes(e.id) &&
                        !hitEnemies.has(e.id) &&
                        getDistance(currentTarget, e) <= weapon.chainRange
                    );

                    if (nearbyEnemies.length > 0) {
                      const nextTarget = nearbyEnemies[0];
                      chainTargets.push(nextTarget.id);
                      hitEnemies.add(nextTarget.id);

                      createEffect("chain", currentTarget.x, currentTarget.y, {
                        targetX: nextTarget.x,
                        targetY: nextTarget.y,
                        color: weapon.color,
                        duration: 300,
                      });

                      setEnemies((prev) =>
                        prev.reduce<Enemy[]>((acc, e) => {
                          if (e.id === nextTarget.id) {
                            const newHp = e.hp - weapon.chainDamage;
                            if (newHp > 0) {
                              acc.push({ ...e, hp: newHp });
                            } else {
                              setExpOrbs((prevOrbs) => [
                                ...prevOrbs,
                                {
                                  id: Math.random(),
                                  x: e.x,
                                  y: e.y,
                                  exp: e.exp,
                                },
                              ]);
                              setScore((prev) => prev + e.exp);
                            }
                          } else {
                            acc.push(e);
                          }
                          return acc;
                        }, [])
                      );

                      currentTarget = nextTarget;
                    } else {
                      break;
                    }
                  }
                }
                break;

              case "ice":
                createEffect("freeze", enemy.x, enemy.y, {
                  color: weapon.color,
                  duration: 800,
                });
                break;

              case "shuriken":
                createEffect("hit", enemy.x, enemy.y, {
                  color: weapon.color,
                  duration: 200,
                });
                break;

              case "crossbow":
                createEffect("pierce", enemy.x, enemy.y, {
                  color: weapon.color,
                  duration: 300,
                });
                break;

              default:
                createEffect("hit", enemy.x, enemy.y, {
                  color: weapon.color,
                  duration: 200,
                });
                break;
            }

            // 기본 데미지 처리
            setEnemies((prev) =>
              prev.reduce<Enemy[]>((acc, e) => {
                if (e.id === enemy.id) {
                  const newHp = e.hp - bullet.damage;
                  if (newHp > 0) {
                    // 얼음 무기의 슬로우 효과 적용
                    if (
                      bullet.weaponType === "ice" &&
                      "slowEffect" in weapon &&
                      "slowDuration" in weapon
                    ) {
                      acc.push({
                        ...e,
                        hp: newHp,
                        slowEffect: weapon.slowEffect,
                        slowEndTime: Date.now() + weapon.slowDuration,
                      });
                    } else {
                      acc.push({
                        ...e,
                        hp: newHp,
                        slowEffect: e.slowEffect ?? 1,
                        slowEndTime: e.slowEndTime ?? 0,
                      });
                    }
                  } else {
                    // 적 사망 시 경험치 드롭
                    setExpOrbs((prevOrbs) => [
                      ...prevOrbs,
                      { id: Math.random(), x: e.x, y: e.y, exp: e.exp },
                    ]);
                    setScore((prev) => prev + e.exp);
                  }
                } else {
                  acc.push(e);
                }
                return acc;
              }, [])
            );
          }
        });

        // 총알이 살아남을지 결정
        if (!hit) {
          remainingBullets.push(bullet);
        }
      });

      return remainingBullets;
    });

    // 플레이어와 적 충돌 (데미지) - 무적 시간 추가
    const currentTime = Date.now();

    enemies.forEach((enemy) => {
      if (
        checkCollision(player, enemy, GAME_CONFIG.PLAYER_SIZE, enemy.size) &&
        (!player.invulnerableUntil || currentTime > player.invulnerableUntil)
      ) {
        setPlayer((prev) => {
          let damage = 10;

          // 방패 무기가 있으면 데미지 감소
          if (prev.weapons.includes("shield")) {
            const shieldWeapon = WEAPONS["shield"];
            if ("block" in shieldWeapon) {
              damage = Math.floor(damage * (1 - shieldWeapon.block));
            }
          }

          const newHp = prev.hp - damage;
          if (newHp <= 0) {
            setIsDead(true);
          }

          // 피격 시 0.2초간 무적 상태 설정
          return {
            ...prev,
            hp: Math.max(0, newHp),
            invulnerableUntil: currentTime + 100, // 100ms = 0.1초
          };
        });
      }
    });

    // 경험치 오브 충돌 (수집)
    setExpOrbs((prevOrbs) => {
      const remainingOrbs: ExpOrb[] = [];
      let totalExp = 0;

      prevOrbs.forEach((orb) => {
        if (
          checkCollision(
            player,
            orb,
            GAME_CONFIG.PLAYER_SIZE,
            GAME_CONFIG.EXP_ORB_SIZE
          )
        ) {
          totalExp += orb.exp;
        } else {
          remainingOrbs.push(orb);
        }
      });

      // 경험치 획득 시 레벨업 처리
      if (totalExp > 0) {
        setPlayer((prev) => {
          const newExp = prev.exp + totalExp;
          const newLevel = prev.level + Math.floor(newExp / prev.expToNext);
          const remainingExp = newExp % prev.expToNext;

          if (newLevel > prev.level) {
            // 레벨업 시 업그레이드 옵션 생성
            const upgradeOptions: any[] = [];
            const weaponKeys = Object.keys(WEAPONS);
            const availableWeapons = weaponKeys.filter(
              (w) => !prev.weapons.includes(w as WeaponType)
            );

            // 새로운 무기 옵션
            if (availableWeapons.length > 0) {
              const randomWeapon =
                availableWeapons[
                  Math.floor(Math.random() * availableWeapons.length)
                ];
              upgradeOptions.push({
                type: "weapon",
                id: randomWeapon,
                name: WEAPONS[randomWeapon as WeaponType].name,
                icon: WEAPONS[randomWeapon as WeaponType].icon,
              });
            }

            // 체력 회복 옵션
            upgradeOptions.push({
              type: "heal",
              id: "heal",
              name: "체력 회복 (+50 HP)",
              icon: Shield,
            });

            // 스탯 증가 옵션
            upgradeOptions.push({
              type: "stat",
              id: "speed",
              name: "이동 속도 증가",
              icon: Zap,
            });

            setAvailableUpgrades(upgradeOptions.slice(0, 3));
            setGameState("levelup");
          }

          return {
            ...prev,
            exp: remainingExp,
            level: newLevel,
            expToNext: prev.expToNext + (newLevel - prev.level) * 20,
          };
        });
      }

      return remainingOrbs;
    });
  }, [player, enemies, checkCollision, createEffect, getDistance]);

  // 게임 루프
  const gameLoop = useCallback(() => {
    if (gameState !== "playing") return;

    movePlayer();
    spawnEnemies();
    moveEnemies();
    attack();
    moveBullets();
    handleCollisions();

    setGameTime((prev) => {
      const newTime = prev + 16;
      const newWave = Math.floor(newTime / 30000) + 1;
      if (newWave !== wave) {
        setWave(newWave);
      }
      if (newTime >= GAME_CONFIG.GAME_DURATION) {
        setGameState("gameover");
      }
      return newTime;
    });
  }, [
    gameState,
    movePlayer,
    spawnEnemies,
    moveEnemies,
    attack,
    moveBullets,
    handleCollisions,
    wave,
  ]);

  const onSubmit = useCallback(async () => {
    setGameState("gameover");

    try {
      // 현재 랭킹에서 사용자의 순위 계산
      let rank = 1;
      if (rankingData?.success && rankingData.data) {
        rank = rankingData.data.filter((game) => game.score > score).length + 1;
      }

      const postData: GameCreateRequest = {
        gameType: "vampire",
        score: score,
        rank: rank,
        userDocId: user.docId,
        userId: user.id,
        regDt: moment().format("YYYY-MM-DD"),
      };

      await createGameMutation.mutateAsync(postData);

      // 랭킹 데이터 새로고침
      await refetchRanking();
    } catch (error) {
      console.error("점수 저장 실패:", error);
    }
  }, [createGameMutation, rankingData, refetchRanking, user.id, highScore]);

  useEffect(() => {
    if (isDead) {
      onSubmit(); // ✅ 단 한 번만 실행됨
      setIsDead(false);
    }
  }, [isDead]);

  // 게임 루프 실행
  useEffect(() => {
    if (gameState === "playing") {
      gameLoopRef.current = window.setInterval(gameLoop, 16);
    } else if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameLoop, gameState]);

  // 렌더링 부분 (useEffect 내부의 Canvas 렌더링 코드)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);

    if (gameState === "playing" || gameState === "paused") {
      // 배경
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);

      // 플레이어 - 아이콘으로 렌더링
      ctx.save();
      ctx.fillStyle = selectedCharacter?.color ?? "#4A90E2";
      ctx.font = `${GAME_CONFIG.PLAYER_SIZE}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // 캐릭터별 아이콘 심볼
      let playerSymbol = "🧙‍♂️"; // 기본값
      if (selectedCharacter) {
        switch (selectedCharacter.name) {
          case "전사":
            playerSymbol = "👨‍🦲"; // 대머리 남자 (묵직한 전사)
            break;
          case "마법사":
            playerSymbol = "🧙‍♂️";
            break;
          case "궁수":
            playerSymbol = "👨"; // 깔끔한 남자 (날렵한 궁수)
            break;
          default:
            playerSymbol = "🧙‍♂️";
        }
      }

      ctx.fillText(playerSymbol, player.x, player.y);
      ctx.restore();

      // 적들 - 아이콘으로 렌더링
      enemies.forEach((enemy) => {
        ctx.save();
        ctx.fillStyle = enemy.color;
        ctx.font = `${enemy.size}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // 적 타입별 아이콘 심볼
        let enemySymbol; // 기본값
        switch (enemy.type) {
          case "goblin":
            enemySymbol = "👹";
            break;
          case "orc":
            enemySymbol = "👺";
            break;
          case "skeleton":
            enemySymbol = "💀";
            break;
          case "demon":
            enemySymbol = "😈";
            break;
          case "dragon":
            enemySymbol = "🐉";
            break;
          default:
            enemySymbol = "👾";
        }

        ctx.fillText(enemySymbol, enemy.x, enemy.y);

        // 슬로우 이펙트 표시
        if (Date.now() < (enemy.slowEndTime ?? 0)) {
          ctx.strokeStyle = "#87CEEB";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(enemy.x, enemy.y, enemy.size / 2 + 3, 0, Math.PI * 2);
          ctx.stroke();
        }

        // 체력바
        const hpPercent = enemy.hp / enemy.maxHp;
        ctx.fillStyle = "#ff0000";
        ctx.fillRect(enemy.x - 15, enemy.y - enemy.size / 2 - 10, 30, 4);
        ctx.fillStyle = "#00ff00";
        ctx.fillRect(
          enemy.x - 15,
          enemy.y - enemy.size / 2 - 10,
          30 * hpPercent,
          4
        );
        ctx.restore();
      });

      // 총알
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

      // 경험치 오브
      expOrbs.forEach((orb) => {
        ctx.save();
        ctx.fillStyle = "#00BFFF";
        ctx.font = `${GAME_CONFIG.EXP_ORB_SIZE}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("💎", orb.x, orb.y);
        ctx.restore();
      });

      // 이펙트 (나머지 이펙트 코드는 동일)
      effects.forEach((effect) => {
        const progress = (Date.now() - effect.startTime) / effect.duration;
        const alpha = 1 - progress;
        ctx.save();
        ctx.globalAlpha = alpha;

        switch (effect.type) {
          case "explosion":
            ctx.strokeStyle = effect.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(
              effect.x,
              effect.y,
              effect.radius * progress,
              0,
              Math.PI * 2
            );
            ctx.stroke();
            break;
          case "slash":
            ctx.strokeStyle = effect.color;
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
            ctx.stroke();
            break;
          case "lightning":
            ctx.fillStyle = effect.color;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, 10, 0, Math.PI * 2);
            ctx.fill();
            break;
          case "freeze":
            ctx.fillStyle = effect.color;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, 15, 0, Math.PI * 2);
            ctx.fill();
            break;
          case "chain":
            ctx.strokeStyle = effect.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(effect.x, effect.y);
            ctx.lineTo(effect.targetX!, effect.targetY!);
            ctx.stroke();
            break;

          case "cleave":
            ctx.strokeStyle = effect.color;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(
              effect.x,
              effect.y,
              effect.radius,
              (-effect.angle * Math.PI) / 360,
              (effect.angle * Math.PI) / 360
            );
            ctx.stroke();
            break;

          case "knockback":
            ctx.strokeStyle = effect.color;
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.arc(
              effect.x,
              effect.y,
              effect.radius * progress,
              0,
              Math.PI * 2
            );
            ctx.stroke();
            break;

          case "charging":
            ctx.strokeStyle = effect.color;
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(effect.x, effect.y);
            ctx.lineTo(effect.targetX!, effect.targetY!);
            ctx.stroke();
            ctx.setLineDash([]);
            break;

          case "laser":
            ctx.strokeStyle = effect.color;
            ctx.lineWidth = effect.width;
            ctx.beginPath();
            ctx.moveTo(effect.x, effect.y);
            ctx.lineTo(effect.targetX!, effect.targetY!);
            ctx.stroke();
            break;
          case "whirlwind":
            // 회오리바람 시각 효과
            ctx.strokeStyle = effect.color;
            ctx.lineWidth = 3;
            ctx.save();

            // 회전하는 원들로 회오리 표현
            const whirlProgress = (Date.now() - effect.startTime) / 100;
            for (let i = 0; i < 3; i++) {
              const radius = effect.radius * (0.3 + i * 0.35);
              const rotation = whirlProgress * (i + 1) * 0.1;

              ctx.beginPath();
              ctx.arc(
                effect.x + Math.cos(rotation) * 10,
                effect.y + Math.sin(rotation) * 10,
                radius,
                0,
                Math.PI * 2
              );
              ctx.stroke();
            }

            // 중심에서 바깥으로 나선 그리기
            ctx.beginPath();
            for (let angle = 0; angle < Math.PI * 4; angle += 0.1) {
              const spiralRadius = (angle / (Math.PI * 4)) * effect.radius;
              const x =
                effect.x + Math.cos(angle + whirlProgress * 0.2) * spiralRadius;
              const y =
                effect.y + Math.sin(angle + whirlProgress * 0.2) * spiralRadius;

              if (angle === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
            }
            ctx.stroke();
            ctx.restore();
            break;

          case "tornado":
            // 토네이도 시각 효과
            ctx.strokeStyle = effect.color;
            ctx.lineWidth = 4;
            ctx.save();

            const tornadoProgress = (Date.now() - effect.startTime) / 50;

            // 토네이도의 원뿔 모양 그리기
            for (let i = 0; i < 5; i++) {
              const height = i * 15;
              const radius = effect.radius * (1 - i * 0.15);
              const rotation = tornadoProgress * (i + 1) * 0.05;

              ctx.globalAlpha = alpha * (1 - i * 0.15);
              ctx.beginPath();
              ctx.arc(
                effect.x + Math.cos(rotation) * 5,
                effect.y - height + Math.sin(rotation) * 5,
                radius,
                0,
                Math.PI * 2
              );
              ctx.stroke();
            }

            // 중심 소용돌이
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let angle = 0; angle < Math.PI * 6; angle += 0.2) {
              const spiralRadius =
                (angle / (Math.PI * 6)) * effect.radius * 0.5;
              const x =
                effect.x +
                Math.cos(angle + tornadoProgress * 0.3) * spiralRadius;
              const y =
                effect.y +
                Math.sin(angle + tornadoProgress * 0.3) * spiralRadius;

              if (angle === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
            }
            ctx.stroke();
            ctx.restore();
            break;
        }

        ctx.restore();
      });

      // 일시정지 UI
      if (gameState === "paused") {
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
    gameState,
    player,
    enemies,
    bullets,
    expOrbs,
    effects,
    selectedCharacter,
  ]);

  // 게임 시작
  const startGame = useCallback((character: (typeof CHARACTERS)[0]) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const randomAudio = getRandomAudio();
    setSelectedAudio(randomAudio);

    setSelectedCharacter(character);
    setPlayer({
      x: GAME_CONFIG.CANVAS_WIDTH / 2,
      y: GAME_CONFIG.CANVAS_HEIGHT / 2,
      hp: character.hp,
      maxHp: character.hp,
      level: 1,
      exp: 0,
      expToNext: 100,
      weapons: [character.startWeapon],
      passives: [],
      invulnerableUntil: 0, // 게임 시작 시 무적 상태 아님
    });
    setEnemies([]);
    setBullets([]);
    setExpOrbs([]);
    setEffects([]);
    setGameTime(0);
    setScore(0);
    setWave(1);
    setAvailableUpgrades([]);
    lastAttackRef.current = {};
    enemySpawnRef.current = 0;
    setGameState("playing");
  }, []);

  // 업그레이드 선택
  const selectUpgrade = useCallback((upgrade: any) => {
    setPlayer((prev) => {
      switch (upgrade.type) {
        case "weapon":
          return { ...prev, weapons: [...prev.weapons, upgrade.id] };
        case "heal":
          return { ...prev, hp: Math.min(prev.maxHp, prev.hp + 50) };
        case "stat":
          if (upgrade.id === "speed") {
            setSelectedCharacter((prevChar) => {
              if (!prevChar) return prevChar;
              return { ...prevChar, speed: prevChar.speed + 0.5 };
            });
          }
          return prev;
        default:
          return prev;
      }
    });
    setAvailableUpgrades([]);
    setGameState("playing");
  }, []);

  // 게임 재시작
  const restartGame = useCallback(() => {
    setGameState("menu");
    setSelectedCharacter(null);
  }, []);

  // 시간 포맷
  const formatTime = useCallback((ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

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

  // 메뉴 화면
  if (gameState === "menu") {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 p-4 relative overflow-hidden">
        {/* 배경 애니메이션 효과 */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-40 h-40 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-indigo-500 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-pink-500 rounded-full blur-xl animate-pulse delay-500"></div>
          <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-blue-500 rounded-full blur-lg animate-pulse delay-700"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-8 py-12">
          {/* 메인 메뉴 카드 */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl rounded-3xl border border-purple-500/30 shadow-2xl shadow-purple-500/20 p-8 max-w-6xl w-full">
            {/* 타이틀 섹션 */}
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

            {/* 캐릭터 선택 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {CHARACTERS.map((character, index) => {
                const IconComponent = character.icon;
                return (
                  <div
                    key={character.id}
                    onClick={() => startGame(character)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        startGame(character);
                      }
                    }}
                    className="group relative bg-gradient-to-br from-slate-700/80 to-slate-800/80 p-8 rounded-2xl cursor-pointer hover:from-slate-600/80 hover:to-slate-700/80 transition-all duration-500 hover:scale-105 hover:shadow-2xl border border-slate-600/50 hover:border-purple-400/50 backdrop-blur-sm"
                    style={{
                      animationDelay: `${index * 150}ms`,
                    }}
                  >
                    {/* 호버시 글로우 효과 */}
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
                        {/* 캐릭터 아이콘 주변 링 */}
                        <div className="absolute inset-0 rounded-full group-hover:border-purple-400/60 transition-colors duration-300 animate-spin-slow"></div>
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

            {/* 조작법 안내 */}
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
                    <span className="font-medium">
                      스페이스바: 일시정지/재개
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 랭킹 카드 */}
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

  // 레벨업 화면
  if (gameState === "levelup") {
    return (
      <div className="min-h-screen bg-black/90 flex items-center justify-center p-4 relative overflow-hidden">
        {/* 축하 배경 애니메이션 */}
        <div className="absolute inset-0">
          {/* 반짝이는 별들 */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-orange-400 rounded-full animate-ping delay-300"></div>
          <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-yellow-300 rounded-full animate-ping delay-700"></div>
          <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-orange-300 rounded-full animate-ping delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-yellow-500 rounded-full animate-ping delay-500"></div>

          {/* 큰 글로우 효과 */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-yellow-400/30 via-orange-400/30 to-amber-400/30 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 max-w-5xl w-full">
          {/* 메인 레벨업 카드 */}
          <div className="bg-gradient-to-br from-amber-500/95 via-orange-500/95 to-red-500/95 backdrop-blur-xl rounded-3xl border-2 border-yellow-300/50 shadow-2xl shadow-orange-500/50 overflow-hidden">
            {/* 상단 장식 */}
            <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 p-2">
              <div className="flex justify-center items-center gap-2">
                <div className="w-8 h-1 bg-yellow-300 rounded-full animate-pulse"></div>
                <div className="w-4 h-1 bg-orange-300 rounded-full animate-pulse delay-200"></div>
                <div className="w-8 h-1 bg-yellow-300 rounded-full animate-pulse delay-400"></div>
              </div>
            </div>

            <div className="p-10">
              {/* 타이틀 섹션 */}
              <div className="text-center mb-12 relative">
                {/* 배경 장식 원 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-4 border-yellow-300/30 rounded-full animate-spin-slow"></div>
                  <div
                    className="absolute w-32 h-32 border-2 border-orange-300/40 rounded-full animate-spin-slow"
                    style={{ animationDirection: "reverse" }}
                  ></div>
                </div>

                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6 shadow-lg shadow-yellow-500/50 animate-bounce">
                    <span className="text-5xl">🎉</span>
                  </div>

                  <h2 className="text-7xl font-black text-white mb-4 drop-shadow-lg animate-pulse">
                    LEVEL UP!
                  </h2>

                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="w-16 h-1 bg-gradient-to-r from-transparent via-yellow-300 to-transparent rounded-full"></div>
                    <span className="text-3xl animate-spin">⭐</span>
                    <div className="w-16 h-1 bg-gradient-to-r from-transparent via-yellow-300 to-transparent rounded-full"></div>
                  </div>

                  <p className="text-2xl text-yellow-100 font-semibold tracking-wide">
                    ✨ 업그레이드를 선택하여 더 강해지세요 ✨
                  </p>
                </div>
              </div>

              {/* 업그레이드 선택 그리드 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {availableUpgrades.map((upgrade, index) => {
                  const IconComponent = upgrade.icon;
                  return (
                    <div
                      key={index}
                      onClick={() => selectUpgrade(upgrade)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          selectUpgrade(upgrade);
                        }
                      }}
                      className="group relative bg-black/40 backdrop-blur-sm p-8 rounded-2xl cursor-pointer hover:bg-black/60 transition-all duration-500 hover:scale-110 border-2 border-yellow-400/60 hover:border-yellow-300 shadow-lg hover:shadow-2xl hover:shadow-yellow-400/30"
                      style={{
                        animationDelay: `${index * 200}ms`,
                        animation: "fadeInUp 0.6s ease-out forwards",
                      }}
                    >
                      {/* 선택 효과 링 */}
                      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-yellow-300 transition-all duration-300">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400/0 via-yellow-400/20 to-yellow-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </div>

                      {/* 반짝이는 효과 */}
                      <div className="absolute top-2 right-2 w-3 h-3 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
                      <div className="absolute bottom-2 left-2 w-2 h-2 bg-orange-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping delay-300"></div>

                      <div className="relative text-center">
                        {/* 아이콘 배경 */}
                        <div className="relative mb-6">
                          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                            <IconComponent
                              className="text-white group-hover:animate-pulse"
                              size={40}
                            />
                          </div>
                          {/* 아이콘 글로우 */}
                          <div className="absolute inset-0 bg-yellow-400/30 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-yellow-200 transition-colors duration-300">
                          {upgrade.name}
                        </h3>

                        {/* 선택 표시 */}
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center shadow-lg">
                          <span className="text-white text-sm font-bold">
                            ✓
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 하단 장식 */}
            <div className="bg-gradient-to-r from-orange-400/20 to-red-400/20 p-3">
              <div className="flex justify-center items-center gap-1">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 100}ms` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes spin-slow {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  // 게임 오버 화면
  if (gameState === "gameover") {
    const survivedTime = formatTime(gameTime);
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-red-950 to-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* 배경 애니메이션 효과 */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-red-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-orange-500 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-yellow-500 rounded-full blur-xl animate-pulse delay-500"></div>
        </div>

        {/* 메인 게임오버 카드 */}
        <div className="relative z-10 max-w-3xl w-full">
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl rounded-3xl border border-red-500/30 shadow-2xl shadow-red-500/20 p-8 mb-6">
            {/* 헤더 */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full mb-4 shadow-lg shadow-red-500/50">
                <span className="text-4xl">💀</span>
              </div>
              <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 mb-2">
                GAME OVER
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-orange-500 mx-auto rounded-full"></div>
            </div>

            {/* 통계 그리드 */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-2xl p-6 border border-slate-600/30 hover:border-red-400/50 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full group-hover:animate-pulse"></div>
                  <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">
                    생존 시간
                  </span>
                </div>
                <div className="text-3xl font-bold text-white">
                  {survivedTime}
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
                  {score.toLocaleString()}
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-2xl p-6 border border-slate-600/30 hover:border-blue-400/50 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full group-hover:animate-pulse"></div>
                  <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">
                    웨이브
                  </span>
                </div>
                <div className="text-3xl font-bold text-white">{wave}</div>
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

            {/* 액션 버튼 */}
            <div className="flex justify-center">
              <button
                onClick={restartGame}
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

          {/* 랭킹 카드 */}
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {selectedAudio && (
        <audio ref={audioRef} src={selectedAudio} preload="auto" loop />
      )}

      {/* 배경 효과 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-purple-500 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-green-500 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      {/* 상단 게임 UI */}
      <div className="relative z-10 flex justify-between w-full max-w-5xl mb-4">
        {/* 게임 정보 */}
        <div className="flex gap-3">
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl px-4 py-2 rounded-xl border border-slate-600/50 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-slate-400 font-medium text-sm">시간</span>
              <span className="text-white font-bold">
                {formatTime(gameTime)}
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl px-4 py-2 rounded-xl border border-slate-600/50 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-slate-400 font-medium text-sm">점수</span>
              <span className="text-white font-bold">
                {score.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl px-4 py-2 rounded-xl border border-slate-600/50 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-slate-400 font-medium text-sm">웨이브</span>
              <span className="text-white font-bold">{wave}</span>
            </div>
          </div>
        </div>

        {/* 컨트롤 버튼 */}
        <div className="flex gap-2">
          <button
            onClick={() =>
              setGameState(gameState === "paused" ? "playing" : "paused")
            }
            className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 shadow-lg hover:shadow-xl border border-blue-400/30"
          >
            <div className="group-hover:scale-110 transition-transform duration-200">
              {gameState === "paused" ? (
                <Play size={16} />
              ) : (
                <Pause size={16} />
              )}
            </div>
            <span className="font-semibold text-sm">
              {gameState === "paused" ? "재개" : "일시정지"}
            </span>
          </button>

          <button
            onClick={restartGame}
            className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 shadow-lg hover:shadow-xl border border-red-400/30"
          >
            <div className="group-hover:rotate-12 transition-transform duration-200">
              <Home size={16} />
            </div>
            <span className="font-semibold text-sm">메뉴</span>
          </button>
        </div>
      </div>

      {/* 게임 캔버스 - 높이 축소 */}
      <div className="relative z-10 mb-4">
        <div className="relative">
          {/* 캔버스 글로우 효과 */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-green-600/20 rounded-xl blur-lg"></div>

          <canvas
            ref={canvasRef}
            width={GAME_CONFIG.CANVAS_WIDTH} // 너비 20% 축소
            height={GAME_CONFIG.CANVAS_HEIGHT * 0.9} // 높이 30% 축소
            className="relative border-2 border-slate-600/50 rounded-lg bg-gradient-to-br from-gray-900 to-black shadow-2xl"
          />

          {/* 캔버스 모서리 장식 */}
          <div className="absolute top-1 left-1 w-3 h-3 border-l-2 border-t-2 border-blue-400/60 rounded-tl-lg"></div>
          <div className="absolute top-1 right-1 w-3 h-3 border-r-2 border-t-2 border-blue-400/60 rounded-tr-lg"></div>
          <div className="absolute bottom-1 left-1 w-3 h-3 border-l-2 border-b-2 border-blue-400/60 rounded-bl-lg"></div>
          <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-blue-400/60 rounded-br-lg"></div>
        </div>
      </div>

      {/* 플레이어 상태 UI - 컴팩트하게 조정 */}
      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 체력 */}
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
                {player.hp} / {player.maxHp}
              </span>
              <span className="text-xs text-red-400 font-bold">
                {Math.round((player.hp / player.maxHp) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* 경험치 */}
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

        {/* 무기 */}
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl p-4 rounded-xl border border-slate-600/50 shadow-lg hover:border-yellow-400/50 transition-all duration-300 group">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Sword className="text-white" size={16} />
            </div>
            <span className="text-white font-bold text-lg">무기</span>
          </div>

          <div className="flex gap-2 flex-wrap">
            {player.weapons.map((weaponId, index) => {
              const weapon = WEAPONS[weaponId];
              const IconComponent = weapon.icon;
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-slate-700/80 to-slate-800/80 p-2 rounded-lg flex items-center gap-1 border border-slate-600/30 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105 group/weapon"
                  title={weapon.name}
                >
                  <div className="group-hover/weapon:animate-pulse">
                    <IconComponent size={14} style={{ color: weapon.color }} />
                  </div>
                  <span className="text-xs text-white font-medium">
                    {weapon.name}
                  </span>
                </div>
              );
            })}

            {/* 빈 슬롯 표시 */}
            {player.weapons.length < 6 && (
              <div className="bg-slate-700/30 border-2 border-dashed border-slate-600/50 p-2 rounded-lg flex items-center justify-center min-w-[50px]">
                <span className="text-slate-500 text-xs">빈 슬롯</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
