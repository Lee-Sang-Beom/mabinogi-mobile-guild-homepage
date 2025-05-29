"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Bot,
  Crown,
  Flame,
  Home,
  Pause,
  Play,
  Shield,
  Skull,
  Snowflake,
  Sparkles,
  Sword,
  Users,
  Zap,
} from "lucide-react";
import { GameProps } from "@/app/(auth)/game/internal";

// 게임 설정
const GAME_CONFIG = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  PLAYER_SIZE: 20,
  ENEMY_SIZE: 15,
  BULLET_SIZE: 5,
  PLAYER_SPEED: 3,
  ENEMY_SPEED: 1,
  BULLET_SPEED: 8,
  GAME_DURATION: 30 * 60 * 1000, // 30분
  EXP_ORB_SIZE: 8,
};

// 캐릭터 데이터
const CHARACTERS = [
  {
    id: 1,
    name: "마법사",
    hp: 100,
    speed: 3,
    startWeapon: "fireball" as const,
    color: "#4A90E2",
    icon: Sparkles,
  },
  {
    id: 2,
    name: "전사",
    hp: 150,
    speed: 2,
    startWeapon: "sword" as const,
    color: "#E74C3C",
    icon: Shield,
  },
  {
    id: 3,
    name: "궁수",
    hp: 80,
    speed: 4,
    startWeapon: "arrow" as const,
    color: "#27AE60",
    icon: Users,
  },
];

// 무기 데이터
const WEAPONS = {
  fireball: {
    name: "파이어볼",
    damage: 20,
    cooldown: 1000,
    color: "#FF6B35",
    range: 150,
    type: "projectile" as const,
    explosionRadius: 60,
    explosionDamage: 20,
    icon: Flame,
  },
  sword: {
    name: "검",
    damage: 40,
    cooldown: 800,
    color: "#C0C0C0",
    range: 80,
    type: "melee" as const,
    icon: Sword,
  },
  arrow: {
    name: "화살",
    damage: 20,
    cooldown: 600,
    color: "#8B4513",
    range: 200,
    type: "projectile" as const,
    icon: Users,
  },
  lightning: {
    name: "번개",
    damage: 35,
    cooldown: 1200,
    color: "#FFD700",
    range: 180,
    type: "chain" as const,
    chainRange: 80,
    chainDamage: 15,
    maxChains: 3,
    icon: Zap,
  },
  ice: {
    name: "얼음",
    damage: 30,
    cooldown: 1000,
    color: "#87CEEB",
    range: 120,
    type: "projectile" as const,
    slowEffect: 0.5,
    slowDuration: 2000,
    icon: Snowflake,
  },
};

// 적 유형
const ENEMY_TYPES = [
  {
    type: "zombie" as const,
    hp: 100,
    speed: 1,
    color: "#8B4513",
    exp: 10,
    size: 15,
    icon: Bot,
  },
  {
    type: "skeleton" as const,
    hp: 150,
    speed: 1.5,
    color: "#F5F5DC",
    exp: 15,
    size: 12,
    icon: Skull,
  },
  {
    type: "orc" as const,
    hp: 150,
    speed: 0.8,
    color: "#228B22",
    exp: 25,
    size: 18,
    icon: Users,
  },
  {
    type: "demon" as const,
    hp: 200,
    speed: 1.2,
    color: "#8B0000",
    exp: 40,
    size: 20,
    icon: Crown,
  },
];

// 타입 정의
type WeaponType = keyof typeof WEAPONS;

interface Player {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  level: number;
  exp: number;
  expToNext: number;
  weapons: WeaponType[];
  passives: string[];
}

interface Enemy {
  id: number;
  x: number;
  y: number;
  type: string;
  hp: number;
  maxHp: number;
  speed: number;
  color: string;
  exp: number;
  size: number;
  slowEffect?: number;
  slowEndTime?: number;
}

interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  color: string;
  range: number;
  traveled: number;
  weaponType: WeaponType;
  targetId?: number;
}

interface ExpOrb {
  id: number;
  x: number;
  y: number;
  exp: number;
}

interface Effect {
  id: number;
  type: string;
  x: number;
  y: number;
  duration: number;
  startTime: number;
  [key: string]: any;
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
        if (weapon.type === "melee") {
          const enemiesInRange = enemies.filter(
            (enemy) => getDistance(player, enemy) <= weapon.range,
          );
          if (enemiesInRange.length > 0) {
            createEffect("slash", player.x, player.y, {
              radius: weapon.range,
              color: weapon.color,
              duration: 300,
            });

            setEnemies((prev) =>
              prev.reduce<Enemy[]>((acc, e) => {
                if (enemiesInRange.some((enemy) => enemy.id === e.id)) {
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
            lastAttackRef.current[weaponId] = now;
          }
        } else {
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
  const handleCollisions = useCallback(() => {
    // 총알과 적 충돌
    setBullets((prevBullets) => {
      const remainingBullets: Bullet[] = [];
      const hitEnemies = new Set<number>();

      prevBullets.forEach((bullet) => {
        let hit = false;
        const weapon = WEAPONS[bullet.weaponType];

        enemies.forEach((enemy) => {
          if (
            !hitEnemies.has(enemy.id) &&
            checkCollision(bullet, enemy, GAME_CONFIG.BULLET_SIZE, enemy.size)
          ) {
            hitEnemies.add(enemy.id);
            hit = true;

            if (
              bullet.weaponType === "fireball" &&
              "explosionRadius" in weapon
            ) {
              createEffect("explosion", enemy.x, enemy.y, {
                radius: weapon.explosionRadius,
                color: weapon.color,
                duration: 400,
              });

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
            } else if (
              bullet.weaponType === "lightning" &&
              "chainRange" in weapon
            ) {
              createEffect("lightning", enemy.x, enemy.y, {
                duration: 600,
                color: weapon.color,
              });

              const chainTargets: number[] = [];
              let currentTarget = enemy;

              for (let i = 0; i < weapon.maxChains; i++) {
                const nearbyEnemies = enemies.filter(
                  (e) =>
                    e.id !== currentTarget.id &&
                    !chainTargets.includes(e.id) &&
                    getDistance(currentTarget, e) <= weapon.chainRange,
                );

                if (nearbyEnemies.length > 0) {
                  const nextTarget = nearbyEnemies[0];
                  chainTargets.push(nextTarget.id);
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

                  currentTarget = nextTarget;
                } else {
                  break;
                }
              }
            } else if (bullet.weaponType === "ice") {
              createEffect("freeze", enemy.x, enemy.y, {
                color: weapon.color,
                duration: 800,
              });
            }

            setEnemies((prev) =>
              prev.reduce<Enemy[]>((acc, e) => {
                if (e.id === enemy.id) {
                  const newHp = e.hp - bullet.damage;
                  if (newHp > 0) {
                    // 타입 가드 추가
                    if ("slowEffect" in weapon && "slowDuration" in weapon) {
                      acc.push({
                        ...e,
                        hp: newHp,
                        slowEffect:
                          bullet.weaponType === "ice"
                            ? weapon.slowEffect
                            : e.slowEffect,
                        slowEndTime:
                          bullet.weaponType === "ice"
                            ? Date.now() + weapon.slowDuration
                            : e.slowEndTime,
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
        if (!hit) {
          remainingBullets.push(bullet);
        }
      });
      return remainingBullets;
    });

    // 플레이어와 적 충돌
    enemies.forEach((enemy) => {
      if (checkCollision(player, enemy, GAME_CONFIG.PLAYER_SIZE, enemy.size)) {
        setPlayer((prev) => {
          const newHp = prev.hp - 10;
          if (newHp <= 0) {
            setGameState("gameover");
          }
          return { ...prev, hp: Math.max(0, newHp) };
        });
      }
    });

    // 경험치 오브 충돌
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

      if (totalExp > 0) {
        setPlayer((prev) => {
          const newExp = prev.exp + totalExp;
          const newLevel = prev.level + Math.floor(newExp / prev.expToNext);
          const remainingExp = newExp % prev.expToNext;

          if (newLevel > prev.level) {
            const upgradeOptions: any[] = [];
            const weaponKeys = Object.keys(WEAPONS);
            const availableWeapons = weaponKeys.filter(
              (w) => !prev.weapons.includes(w as WeaponType),
            );
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

            upgradeOptions.push({
              type: "heal",
              id: "heal",
              name: "체력 회복 (+50 HP)",
              icon: Shield,
            });

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

      // 플레이어
      ctx.fillStyle = selectedCharacter?.color ?? "#4A90E2";
      ctx.beginPath();
      ctx.arc(player.x, player.y, GAME_CONFIG.PLAYER_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();

      // 적
      enemies.forEach((enemy) => {
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.size / 2, 0, Math.PI * 2);
        ctx.fill();

        if (Date.now() < (enemy.slowEndTime ?? 0)) {
          ctx.strokeStyle = "#87CEEB";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(enemy.x, enemy.y, enemy.size / 2 + 3, 0, Math.PI * 2);
          ctx.stroke();
        }

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
        ctx.fillStyle = "#00BFFF";
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, GAME_CONFIG.EXP_ORB_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // 이펙트
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
