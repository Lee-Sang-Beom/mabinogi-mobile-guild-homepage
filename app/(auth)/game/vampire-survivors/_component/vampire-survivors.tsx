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
  GAME_CONFIG,
  CHARACTERS,
  WEAPONS,
  ENEMY_TYPES,
} from "@/app/(auth)/game/vampire-survivors/data";
import {
  Player,
  Enemy,
  Bullet,
  ExpOrb,
  Effect,
  WeaponType,
} from "@/app/(auth)/game/vampire-survivors/internal";

// 유틸리티 함수: 점과 선분 사이의 거리 계산 (레이저용)
function getDistanceToLine(
  lineStart: { x: number; y: number },
  lineEnd: { x: number; y: number },
  point: { x: number; y: number },
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

export default function VampireSurvivalGame({ user: _user }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number | null>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const lastAttackRef = useRef<Record<string, number>>({});
  const enemySpawnRef = useRef<number>(0);

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
  });

  // 게임 오브젝트
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
      size2: number = GAME_CONFIG.ENEMY_SIZE,
    ) => {
      const dx = obj1.x - obj2.x;
      const dy = obj1.y - obj2.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < (size1 + size2) / 2;
    },
    [],
  );

  const getDistance = useCallback(
    (obj1: { x: number; y: number }, obj2: { x: number; y: number }) => {
      const dx = obj1.x - obj2.x;
      const dy = obj1.y - obj2.y;
      return Math.sqrt(dx * dx + dy * dy);
    },
    [],
  );

  const createEffect = useCallback(
    (
      type: string,
      x: number,
      y: number,
      options: { duration?: number; [key: string]: any },
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
    [],
  );

  const playerSpeed = useMemo(
    () => selectedCharacter?.speed ?? GAME_CONFIG.PLAYER_SPEED,
    [selectedCharacter],
  );
  const spawnRate = useMemo(() => Math.max(500 - wave * 50, 100), [wave]);

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
      document.body.style.overflow = "hidden";
      window.addEventListener("wheel", preventScroll, { passive: false });
      window.addEventListener("touchmove", preventScroll, { passive: false });
    } else {
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
        Math.min(GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.PLAYER_SIZE / 2, newX),
      );
      newY = Math.max(
        GAME_CONFIG.PLAYER_SIZE / 2,
        Math.min(GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.PLAYER_SIZE / 2, newY),
      );

      return { ...prev, x: newX, y: newY };
    });
  }, [playerSpeed]);

  // 적 생성
  const spawnEnemies = useCallback(() => {
    const now = Date.now();
    if (now - enemySpawnRef.current > spawnRate) {
      const enemyType =
        ENEMY_TYPES[
          Math.floor(
            Math.random() *
              Math.min(ENEMY_TYPES.length, Math.floor(wave / 2) + 1),
          )
        ];
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
      }),
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
            (enemy) => getDistance(player, enemy) <= weapon.range,
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
                }, []),
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
              (closestEnemy as Enemy).x - player.x,
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
                (enemy) => getDistance(player, enemy) <= weapon.range,
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
                  }, []),
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
                      }, []),
                    );
                  }
                });

                // 이펙트 위치 업데이트
                setEffects((prev) =>
                  prev.map((effect) =>
                    effect.id === tornadoId
                      ? { ...effect, x: tornadoX, y: tornadoY }
                      : effect,
                  ),
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
              (closestEnemy as Enemy).x - player.x,
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
            bullet.y < GAME_CONFIG.CANVAS_HEIGHT,
        ),
    );
  }, []);

  // 충돌 처리
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
                  }, []),
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
              enemy,
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
                }, []),
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
                        }, []),
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
                        getDistance(currentTarget, e) <= weapon.chainRange,
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
                        }, []),
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
              }, []),
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

    // 플레이어와 적 충돌 (데미지)
    enemies.forEach((enemy) => {
      if (checkCollision(player, enemy, GAME_CONFIG.PLAYER_SIZE, enemy.size)) {
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
            setGameState("gameover");
          }
          return { ...prev, hp: Math.max(0, newHp) };
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
            GAME_CONFIG.EXP_ORB_SIZE,
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
              (w) => !prev.weapons.includes(w as WeaponType),
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

  // 렌더링
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
            playerSymbol = "⚔️";
            break;
          case "마법사":
            playerSymbol = "🧙‍♂️";
            break;
          case "궁수":
            playerSymbol = "🏹";
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
          4,
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
          Math.PI * 2,
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
              Math.PI * 2,
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
              (effect.angle * Math.PI) / 360,
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
              Math.PI * 2,
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
                Math.PI * 2,
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
                Math.PI * 2,
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
          GAME_CONFIG.CANVAS_HEIGHT / 2,
        );
        ctx.font = "24px Arial";
        ctx.fillText(
          "스페이스바를 눌러 계속하기",
          GAME_CONFIG.CANVAS_WIDTH / 2,
          GAME_CONFIG.CANVAS_HEIGHT / 2 + 50,
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

  // 메뉴 화면
  if (gameState === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-8 max-w-4xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent">
              🧛 뱀파이버 서바이벌
            </h1>
            <p className="text-xl text-gray-300">
              캐릭터를 선택하여 게임을 시작하세요
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CHARACTERS.map((character) => {
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
                  className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl cursor-pointer hover:from-gray-700 hover:to-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-gray-700"
                >
                  <div className="text-center">
                    <div
                      className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl"
                      style={{ backgroundColor: character.color }}
                    >
                      <IconComponent className="text-white" size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {character.name}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex justify-between">
                        <span>체력:</span>
                        <span className="text-green-400">{character.hp}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>속도:</span>
                        <span className="text-blue-400">{character.speed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>시작 무기:</span>
                        <span className="text-yellow-400">
                          {WEAPONS[character.startWeapon].name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-8 text-center text-gray-400">
            <p className="mb-2">🎮 조작법: WASD 또는 방향키로 이동</p>
            <p>⏸️ 스페이스바: 일시정지/재개</p>
          </div>
        </div>
      </div>
    );
  }

  // 레벨업 화면
  if (gameState === "levelup") {
    return (
      <div className="min-h-screen bg-black/80 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-yellow-600 to-orange-600 p-8 rounded-2xl max-w-4xl w-full">
          <div className="text-center mb-8">
            <h2 className="text-5xl font-bold text-white mb-4">🎉 레벨 업!</h2>
            <p className="text-xl text-yellow-100">업그레이드를 선택하세요</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  className="bg-black/30 p-6 rounded-xl cursor-pointer hover:bg-black/50 transition-all duration-300 hover:scale-105 border border-yellow-400"
                >
                  <div className="text-center">
                    <IconComponent
                      className="text-yellow-300 mx-auto mb-4"
                      size={48}
                    />
                    <h3 className="text-xl font-bold text-white mb-2">
                      {upgrade.name}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 게임 오버 화면
  if (gameState === "gameover") {
    const survivedTime = formatTime(gameTime);
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-900 to-black flex items-center justify-center p-4">
        <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-8 max-w-2xl w-full text-center">
          <h2 className="text-6xl font-bold text-red-500 mb-4">💀 게임 오버</h2>
          <div className="space-y-4 mb-8">
            <div className="text-2xl text-white">
              <span className="text-gray-400">생존 시간:</span> {survivedTime}
            </div>
            <div className="text-2xl text-white">
              <span className="text-gray-400">점수:</span>{" "}
              {score.toLocaleString()}
            </div>
            <div className="text-2xl text-white">
              <span className="text-gray-400">웨이브:</span> {wave}
            </div>
            <div className="text-2xl text-white">
              <span className="text-gray-400">레벨:</span> {player.level}
            </div>
          </div>
          <div className="flex justify-center gap-4">
            <button
              onClick={restartGame}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-xl font-bold text-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <Home size={24} /> 메뉴로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 게임 플레이 화면
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      {/* 게임 UI */}
      <div className="flex justify-between w-full max-w-4xl mb-4">
        <div className="flex gap-4 text-white">
          <div className="bg-black/50 px-4 py-2 rounded-lg">
            <span className="text-gray-400">시간:</span> {formatTime(gameTime)}
          </div>
          <div className="bg-black/50 px-4 py-2 rounded-lg">
            <span className="text-gray-400">점수:</span>{" "}
            {score.toLocaleString()}
          </div>
          <div className="bg-black/50 px-4 py-2 rounded-lg">
            <span className="text-gray-400">웨이브:</span> {wave}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() =>
              setGameState(gameState === "paused" ? "playing" : "paused")
            }
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            {gameState === "paused" ? <Play size={16} /> : <Pause size={16} />}
            {gameState === "paused" ? "재개" : "일시정지"}
          </button>
          <button
            onClick={restartGame}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <Home size={16} /> 메뉴
          </button>
        </div>
      </div>

      {/* 게임 캔버스 */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={GAME_CONFIG.CANVAS_WIDTH}
          height={GAME_CONFIG.CANVAS_HEIGHT}
          className="border-2 border-gray-600 rounded-lg bg-gray-900"
        />
      </div>

      {/* 플레이어 상태 UI */}
      <div className="w-full max-w-4xl mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 체력 */}
        <div className="bg-black/50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="text-red-500" size={20} />
            <span className="text-white font-semibold">체력</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="bg-red-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
            />
          </div>
          <div className="text-sm text-gray-300 mt-1">
            {player.hp} / {player.maxHp}
          </div>
        </div>

        {/* 경험치 */}
        <div className="bg-black/50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="text-blue-500" size={20} />
            <span className="text-white font-semibold">
              레벨 {player.level}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(player.exp / player.expToNext) * 100}%` }}
            />
          </div>
          <div className="text-sm text-gray-300 mt-1">
            {player.exp} / {player.expToNext}
          </div>
        </div>

        {/* 무기 */}
        <div className="bg-black/50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sword className="text-yellow-500" size={20} />
            <span className="text-white font-semibold">무기</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {player.weapons.map((weaponId, index) => {
              const weapon = WEAPONS[weaponId];
              const IconComponent = weapon.icon;
              return (
                <div
                  key={index}
                  className="bg-gray-700 p-2 rounded flex items-center gap-1"
                  title={weapon.name}
                >
                  <IconComponent size={16} style={{ color: weapon.color }} />
                  <span className="text-xs text-white">{weapon.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
