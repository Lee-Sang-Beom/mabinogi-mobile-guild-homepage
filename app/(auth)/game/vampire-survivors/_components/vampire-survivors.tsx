"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  Player,
  Enemy,
  Bullet,
  ExpOrb,
  Effect,
  GameState,
  LevelUpOption,
  Character,
} from "../internal";
import { GAME_CONFIG } from "../data/config";
import { WEAPONS } from "../data/weapons";
import { PASSIVES } from "../data/passives";
import { ENEMIES } from "../data/enemies";
import { CHARACTERS } from "../data/characters";
import { GameCanvas } from "./game-canvas";
import { GameUI } from "./game-ui";
import { LevelUpScreen } from "./level-up-screen";
import { GameOverScreen } from "./game-over-screen";
import { MenuScreen } from "./menu-screen";
import { useCreateGame } from "../../hooks/use-create-game";
import { useGetGamesByGameType } from "../../hooks/use-get-games-by-game-type";
import { getRandomAudio } from "../../util";
import { GameProps } from "../../internal";

export default function VampireSurvivalGame({ user }: GameProps) {
  // API Hooks
  const createGameMutation = useCreateGame();
  const { data: rankingData, refetch: refetchRanking } =
    useGetGamesByGameType("vampire");

  // Refs
  const gameLoopRef = useRef<number | null>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const lastUpdateRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const orbitalHitCooldownRef = useRef<Map<string, number>>(new Map());
  const areaEffectsRef = useRef<
    Map<string, { x: number; y: number; damage: number; lastHit: number }[]>
  >(new Map());

  // Game State
  const [gameState, setGameState] = useState<GameState>({
    state: "menu",
    gameTime: 0,
    score: 0,
    wave: 1,
    enemiesKilled: 0,
    highScore: 0,
    isGameOverProcessed: false,
  });

  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null
  );

  // Player State
  const [player, setPlayer] = useState<Player>({
    x: GAME_CONFIG.CANVAS_WIDTH / 2,
    y: GAME_CONFIG.CANVAS_HEIGHT / 2,
    hp: GAME_CONFIG.PLAYER_BASE_HP,
    maxHp: GAME_CONFIG.PLAYER_BASE_HP,
    level: 1,
    exp: 0,
    expToNext: GAME_CONFIG.BASE_EXP_TO_NEXT,
    weapons: [],
    passives: [],
    invulnerableUntil: 0,
    speed: GAME_CONFIG.PLAYER_BASE_SPEED,
    weaponSlots: GAME_CONFIG.PLAYER_BASE_WEAPON_SLOTS,
    passiveSlots: GAME_CONFIG.PLAYER_BASE_PASSIVE_SLOTS,
  });

  // Game Objects
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [expOrbs, setExpOrbs] = useState<ExpOrb[]>([]);
  const [effects, setEffects] = useState<Effect[]>([]);
  const [levelUpOptions, setLevelUpOptions] = useState<LevelUpOption[]>([]);
  const [orbitalWeapons, setOrbitalWeapons] = useState<any[]>([]);

  // 배경음악 재생 함수
  const playBackgroundMusic = useCallback(() => {
    // audioRef가 null이 아닌지 확인
    if (!audioRef.current) {
      console.error("Audio element not found");
      return;
    }

    const randomAudio = getRandomAudio();

    audioRef.current.src = randomAudio;
    audioRef.current.volume = 0.3;
    audioRef.current.loop = true;

    // 오디오 로드 후 재생 시도
    audioRef.current.load();
    audioRef.current.play().catch((error) => {
      console.error("Audio play failed:", error);
    });
  }, []);

  // 배경음악 정지 함수
  const stopBackgroundMusic = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  // Get high score from ranking data
  useEffect(() => {
    if (rankingData?.success && rankingData.data) {
      const userBestScore = rankingData.data
        .filter((game) => game.userId === user.id)
        .reduce((max, game) => Math.max(max, game.score), 0);
      setGameState((prev) => ({ ...prev, highScore: userBestScore }));
    }
  }, [rankingData, user.id]);

  // Computed values - 패시브 효과 계산 (삭제된 패시브 제거)
  const playerStats = useMemo(() => {
    let damageMultiplier = 1;
    let cooldownReduction = 0;
    let rangeMultiplier = 1;
    let expMultiplier = 1;
    let magnetRange = GAME_CONFIG.EXP_MAGNET_BASE_RANGE;
    let healthRegen = 0;
    let projectileCount = 0;

    player.passives.forEach((passive) => {
      const passiveData = PASSIVES[passive.id];
      const level = passive.level - 1;

      if (passiveData.effects.damageMultiplier) {
        const multiplier = passiveData.effects.damageMultiplier[level] || 1;
        damageMultiplier *= multiplier;
      }
      if (passiveData.effects.cooldownReduction) {
        const reduction = passiveData.effects.cooldownReduction[level] || 0;
        cooldownReduction += reduction;
      }
      if (passiveData.effects.rangeMultiplier) {
        const multiplier = passiveData.effects.rangeMultiplier[level] || 1;
        rangeMultiplier *= multiplier;
      }
      if (passiveData.effects.expMultiplier) {
        const multiplier = passiveData.effects.expMultiplier[level] || 1;
        expMultiplier *= multiplier;
      }
      if (passiveData.effects.magnetRange) {
        const multiplier = passiveData.effects.magnetRange[level] || 1;
        magnetRange *= multiplier;
      }
      if (passiveData.effects.healthRegen) {
        const regen = passiveData.effects.healthRegen[level] || 0;
        healthRegen += regen;
      }
      if (passiveData.effects.projectileCount) {
        const count = passiveData.effects.projectileCount[level] || 0;
        projectileCount += count;
      }
    });

    const stats = {
      damageMultiplier,
      cooldownReduction,
      rangeMultiplier,
      expMultiplier,
      magnetRange,
      healthRegen,
      projectileCount,
    };

    return stats;
  }, [player.passives]);

  // Utility functions
  const checkCollision = useCallback(
    (
      obj1: { x: number; y: number },
      obj2: { x: number; y: number },
      size1: number = GAME_CONFIG.PLAYER_SIZE,
      size2 = 15
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

  const createEffect = useCallback(
    (
      type: string,
      x: number,
      y: number,
      options: { duration?: number; [key: string]: any } = {}
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

  // Game mechanics
  const spawnEnemies = useCallback(() => {
    const currentTime = Date.now();
    const spawnRate = Math.max(
      GAME_CONFIG.ENEMY_SPAWN_RATE_MIN,
      GAME_CONFIG.ENEMY_SPAWN_RATE_BASE - gameState.wave * 50
    );

    if (currentTime - lastUpdateRef.current > spawnRate) {
      // 스폰 가능한 적 타입 필터링
      const availableEnemies = Object.entries(ENEMIES).filter(
        ([_, enemyData]) => gameState.wave >= enemyData.minWave
      );

      if (availableEnemies.length === 0) return;

      // 가중치 기반 선택
      const totalWeight = availableEnemies.reduce(
        (sum, [_, enemyData]) => sum + enemyData.spawnWeight,
        0
      );

      let random = Math.random() * totalWeight;
      let selectedEnemy = availableEnemies[0];

      for (const [enemyType, enemyData] of availableEnemies) {
        random -= enemyData.spawnWeight;
        if (random <= 0) {
          selectedEnemy = [enemyType, enemyData];
          break;
        }
      }

      const [enemyType, enemyData] = selectedEnemy;

      // 스폰 위치 계산 (화면 밖에서)
      const side = Math.floor(Math.random() * 4);
      let x = 0,
        y = 0;

      switch (side) {
        case 0: // 위
          x = Math.random() * GAME_CONFIG.CANVAS_WIDTH;
          y = -enemyData.size;
          break;
        case 1: // 오른쪽
          x = GAME_CONFIG.CANVAS_WIDTH + enemyData.size;
          y = Math.random() * GAME_CONFIG.CANVAS_HEIGHT;
          break;
        case 2: // 아래
          x = Math.random() * GAME_CONFIG.CANVAS_WIDTH;
          y = GAME_CONFIG.CANVAS_HEIGHT + enemyData.size;
          break;
        case 3: // 왼쪽
          x = -enemyData.size;
          y = Math.random() * GAME_CONFIG.CANVAS_HEIGHT;
          break;
      }

      // 웨이브에 따른 스탯 보정
      const waveMultiplier = 1 + (gameState.wave - 1) * 0.1;

      setEnemies((prev) => [
        ...prev,
        {
          id: Math.random(),
          x,
          y,
          type: enemyType as any,
          hp: Math.floor(enemyData.hp * waveMultiplier),
          maxHp: Math.floor(enemyData.hp * waveMultiplier),
          speed: enemyData.speed,
          color: enemyData.color,
          exp: Math.floor(enemyData.exp * (1 + gameState.wave * 0.1)),
          size: enemyData.size,
          isBoss: enemyData.isBoss,
          slowEffect: 1,
          slowEndTime: 0,
        },
      ]);

      lastUpdateRef.current = currentTime;
    }
  }, [gameState.wave]);

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

          return {
            ...enemy,
            x: enemy.x + moveX,
            y: enemy.y + moveY,
          };
        }
        return enemy;
      })
    );
  }, [player.x, player.y]);

  const movePlayer = useCallback(() => {
    setPlayer((prev) => {
      let newX = prev.x;
      let newY = prev.y;

      if (keysRef.current["ArrowLeft"] || keysRef.current["a"])
        newX -= prev.speed;
      if (keysRef.current["ArrowRight"] || keysRef.current["d"])
        newX += prev.speed;
      if (keysRef.current["ArrowUp"] || keysRef.current["w"])
        newY -= prev.speed;
      if (keysRef.current["ArrowDown"] || keysRef.current["s"])
        newY += prev.speed;

      // 화면 경계 체크
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
  }, [player.speed]);

  // handleEnemyDeath 함수를 먼저 선언
  const handleEnemyDeath = useCallback(
    (enemy: Enemy) => {
      const expGain = Math.floor(enemy.exp * playerStats.expMultiplier);

      setExpOrbs((prev) => [
        ...prev,
        {
          id: Math.random(),
          x: enemy.x,
          y: enemy.y,
          exp: expGain,
        },
      ]);

      setGameState((prev) => ({
        ...prev,
        score: prev.score + expGain,
        enemiesKilled: prev.enemiesKilled + 1,
      }));

      createEffect("death", enemy.x, enemy.y, {
        color: enemy.color,
        duration: 500,
      });
    },
    [playerStats.expMultiplier, createEffect]
  );

  // 그 다음 attackMelee 함수 선언
  const attackMelee = useCallback(
    (
      weapon: any,
      weaponData: any,
      damage: number,
      range: number,
      level: number
    ) => {
      // 범위 내 모든 적 찾기
      const enemiesInRange = enemies.filter(
        (enemy) => getDistance(player, enemy) <= range
      );

      if (enemiesInRange.length > 0) {
        // 근접 공격 이펙트 생성 (플레이어 중심 원형)
        createEffect("melee", player.x, player.y, {
          radius: range,
          color: weaponData.color,
          duration: 300,
          weaponType: weapon.id,
        });

        // 범위 내 모든 적에게 즉시 데미지
        enemiesInRange.forEach((enemy) => {
          setEnemies((prev) =>
            prev.reduce<Enemy[]>((acc, e) => {
              if (e.id === enemy.id) {
                const newHp = e.hp - damage;
                if (newHp > 0) {
                  acc.push({ ...e, hp: newHp });
                } else {
                  handleEnemyDeath(e);
                }
              } else {
                acc.push(e);
              }
              return acc;
            }, [])
          );

          // 개별 타격 이펙트
          createEffect("hit", enemy.x, enemy.y, {
            color: weaponData.color,
            duration: 200,
          });
        });
      }
    },
    [player, enemies, getDistance, createEffect, handleEnemyDeath]
  );

  // attackProjectile 함수 개선 - 패시브 효과 적용
  const attackProjectile = useCallback(
    (
      weapon: any,
      weaponData: any,
      damage: number,
      range: number,
      level: number
    ) => {
      // 가장 가까운 적 찾기
      let closestEnemy: Enemy | null = null;
      let closestDistance = range;

      enemies.forEach((enemy) => {
        const distance = getDistance(player, enemy);
        if (distance < closestDistance) {
          closestEnemy = enemy;
          closestDistance = distance;
        }
      });

      if (closestEnemy) {
        const angle = Math.atan2(
          (closestEnemy as Enemy).y - player.y,
          (closestEnemy as Enemy).x - player.x
        );

        // 기본 투사체 개수 + 패시브 효과
        const baseProjectileCount = Math.floor(
          (weaponData.special?.projectileCount || 1) +
            (level - 1) * (weaponData.levelScaling.projectileCount || 0)
        );
        const totalProjectileCount =
          baseProjectileCount + Math.floor(playerStats.projectileCount);

        for (let i = 0; i < totalProjectileCount; i++) {
          const spreadAngle =
            totalProjectileCount > 1
              ? (i - (totalProjectileCount - 1) / 2) * 0.2
              : 0;
          const finalAngle = angle + spreadAngle;

          setBullets((prev) => [
            ...prev,
            {
              id: Math.random(),
              x: player.x,
              y: player.y,
              vx: Math.cos(finalAngle) * GAME_CONFIG.BULLET_SPEED,
              vy: Math.sin(finalAngle) * GAME_CONFIG.BULLET_SPEED,
              damage,
              color: weaponData.color,
              range,
              traveled: 0,
              weaponId: weapon.id,
              weaponLevel: level,
              targetId: closestEnemy!.id,
            },
          ]);
        }
      }
    },
    [player, enemies, getDistance, playerStats.projectileCount]
  );

  // attackArea 함수 개선 - 성수 문제 해결
  const attackArea = useCallback(
    (
      weapon: any,
      weaponData: any,
      damage: number,
      range: number,
      level: number
    ) => {
      const areaCount = Math.floor(
        (weaponData.special?.areaCount || 1) + (level - 1) * 0.5
      );
      const duration = weaponData.special?.duration || 3000;

      for (let i = 0; i < areaCount; i++) {
        let x: number, y: number;

        // 성수는 캐릭터 근처 랜덤 위치에 생성
        if (weapon.id === "santaWater") {
          // 캐릭터 주변 랜덤 위치 (range 범위 내)
          const randomAngle = Math.random() * Math.PI * 2;
          const randomDistance = Math.random() * range * 0.8 + range * 0.2; // 20%~100% 거리
          x = player.x + Math.cos(randomAngle) * randomDistance;
          y = player.y + Math.sin(randomAngle) * randomDistance;

          // 화면 경계 체크
          x = Math.max(60, Math.min(GAME_CONFIG.CANVAS_WIDTH - 60, x));
          y = Math.max(60, Math.min(GAME_CONFIG.CANVAS_HEIGHT - 60, y));
        } else {
          // 다른 지역 무기는 기존 방식 (원형 배치)
          const angle = (Math.PI * 2 * i) / areaCount;
          const distance = range * 0.8;
          x = player.x + Math.cos(angle) * distance;
          y = player.y + Math.sin(angle) * distance;
        }

        // 지역 효과 생성
        const areaId = `${weapon.id}-${Date.now()}-${i}`;
        const areaRadius = range * 0.6;

        createEffect("area", x, y, {
          radius: areaRadius,
          color: weaponData.color,
          duration: duration,
          damage,
          weaponId: weapon.id,
          areaId: areaId,
        });

        // 지속적인 데미지를 위한 영역 등록
        const currentAreas = areaEffectsRef.current.get(weapon.id) || [];
        currentAreas.push({
          x,
          y,
          damage,
          lastHit: Date.now(),
        });
        areaEffectsRef.current.set(weapon.id, currentAreas);

        // 지속시간 후 영역 제거
        setTimeout(() => {
          const areas = areaEffectsRef.current.get(weapon.id) || [];
          const filteredAreas = areas.filter(
            (area) => !(area.x === x && area.y === y)
          );
          if (filteredAreas.length > 0) {
            areaEffectsRef.current.set(weapon.id, filteredAreas);
          } else {
            areaEffectsRef.current.delete(weapon.id);
          }
        }, duration);
      }
    },
    [player, createEffect]
  );

  // 지역 효과 데미지 처리 함수 추가
  const processAreaDamage = useCallback(() => {
    const currentTime = Date.now();

    areaEffectsRef.current.forEach((areas, weaponId) => {
      areas.forEach((area) => {
        // 0.5초마다 데미지 적용
        if (currentTime - area.lastHit > 500) {
          const enemiesInArea = enemies.filter(
            (enemy) => getDistance({ x: area.x, y: area.y }, enemy) <= 60 // 영역 반지름
          );

          if (enemiesInArea.length > 0) {
            enemiesInArea.forEach((enemy) => {
              setEnemies((prev) =>
                prev.reduce<Enemy[]>((acc, e) => {
                  if (e.id === enemy.id) {
                    const newHp = e.hp - area.damage;
                    if (newHp > 0) {
                      acc.push({ ...e, hp: newHp });
                    } else {
                      handleEnemyDeath(e);
                    }
                  } else {
                    acc.push(e);
                  }
                  return acc;
                }, [])
              );

              createEffect("hit", enemy.x, enemy.y, {
                color: "#87CEEB",
                duration: 200,
              });
            });

            area.lastHit = currentTime;
          }
        }
      });
    });
  }, [enemies, getDistance, createEffect, handleEnemyDeath]);

  // attackMulti 함수 선언
  const attackMulti = useCallback(
    (
      weapon: any,
      weaponData: any,
      damage: number,
      range: number,
      level: number
    ) => {
      const targetCount = Math.floor(
        (weaponData.special?.targetCount || 3) +
          (level - 1) * (weaponData.levelScaling.targetCount || 0)
      );

      const nearbyEnemies = enemies
        .filter((enemy) => getDistance(player, enemy) <= range)
        .sort((a, b) => getDistance(player, a) - getDistance(player, b))
        .slice(0, targetCount);

      nearbyEnemies.forEach((enemy, index) => {
        // 즉시 데미지 적용
        setTimeout(() => {
          setEnemies((prev) =>
            prev.reduce<Enemy[]>((acc, e) => {
              if (e.id === enemy.id) {
                const newHp = e.hp - damage;
                if (newHp > 0) {
                  acc.push({ ...e, hp: newHp });
                } else {
                  handleEnemyDeath(e);
                }
              } else {
                acc.push(e);
              }
              return acc;
            }, [])
          );

          createEffect("lightning", enemy.x, enemy.y, {
            color: weaponData.color,
            duration: 400,
          });
        }, index * 100); // 순차적으로 공격
      });
    },
    [player, enemies, getDistance, createEffect, handleEnemyDeath]
  );

  // attackBeam 함수 선언
  const attackBeam = useCallback(
    (
      weapon: any,
      weaponData: any,
      damage: number,
      range: number,
      level: number
    ) => {
      // 가장 가까운 적 찾기
      let closestEnemy: Enemy | null = null;
      let closestDistance = range;

      enemies.forEach((enemy) => {
        const distance = getDistance(player, enemy);
        if (distance < closestDistance) {
          closestEnemy = enemy;
          closestDistance = distance;
        }
      });

      if (closestEnemy) {
        const chargeTime = weaponData.special?.chargeTime || 500;

        // 차징 이펙트
        createEffect("charging", player.x, player.y, {
          targetX: (closestEnemy as Enemy).x,
          targetY: (closestEnemy as Enemy).y,
          color: weaponData.color,
          duration: chargeTime,
        });

        // 차징 후 레이저 발사
        setTimeout(() => {
          createEffect("beam", player.x, player.y, {
            targetX: closestEnemy!.x,
            targetY: closestEnemy!.y,
            width: weaponData.special?.beamWidth || 20,
            color: weaponData.color,
            duration: 800,
          });

          // 레이저 경로상의 모든 적에게 데미지
          enemies.forEach((enemy) => {
            const distance = getDistanceToLine(
              { x: player.x, y: player.y },
              { x: closestEnemy!.x, y: closestEnemy!.y },
              enemy
            );

            if (distance <= (weaponData.special?.beamWidth || 20) / 2) {
              setEnemies((prev) =>
                prev.reduce<Enemy[]>((acc, e) => {
                  if (e.id === enemy.id) {
                    const newHp = e.hp - damage;
                    if (newHp > 0) {
                      acc.push({ ...e, hp: newHp });
                    } else {
                      handleEnemyDeath(e);
                    }
                  } else {
                    acc.push(e);
                  }
                  return acc;
                }, [])
              );
            }
          });
        }, chargeTime);
      }
    },
    [player, enemies, getDistance, createEffect, handleEnemyDeath]
  );

  // updateOrbitalWeapon 함수 - 캔버스와 동일한 계산 사용
  const updateOrbitalWeapon = useCallback(
    (
      weapon: any,
      weaponData: any,
      damage: number,
      range: number,
      level: number
    ) => {
      const orbitCount = Math.floor(
        (weaponData.special?.orbitCount || 1) +
          (level - 1) * (weaponData.levelScaling.orbitCount || 0)
      );
      // 무기별 궤도 속도 설정 (캔버스와 동일)
      const orbitSpeed = weapon.id === "kingBible" ? 1.5 : 2;
      const currentTime = Date.now();

      // 궤도 무기 상태 업데이트
      setOrbitalWeapons((prev) => {
        const existing = prev.find((o) => o.weaponId === weapon.id);

        if (existing) {
          return prev.map((o) =>
            o.weaponId === weapon.id
              ? {
                  ...o,
                  damage,
                  range,
                  orbitCount,
                }
              : o
          );
        } else {
          return [
            ...prev,
            {
              weaponId: weapon.id,
              damage,
              range,
              orbitCount,
              color: weaponData.color,
            },
          ];
        }
      });

      // 충돌 검사 - 캔버스와 정확히 동일한 계산
      const hitboxSize = weapon.id === "kingBible" ? 50 : 35;

      for (let i = 0; i < orbitCount; i++) {
        // 캔버스와 정확히 동일한 각도 계산
        const angle =
          currentTime * orbitSpeed * 0.001 + (i * Math.PI * 2) / orbitCount;
        const orbitalX = player.x + Math.cos(angle) * range;
        const orbitalY = player.y + Math.sin(angle) * range;

        // 현재 궤도 위치 근처의 적들 찾기
        enemies.forEach((enemy) => {
          const distance = getDistance({ x: orbitalX, y: orbitalY }, enemy);

          if (distance < hitboxSize) {
            const hitKey = `${weapon.id}-${i}-${enemy.id}`;
            const lastHitTime = orbitalHitCooldownRef.current.get(hitKey) || 0;
            const hitCooldown = weapon.id === "kingBible" ? 150 : 250;

            if (currentTime - lastHitTime > hitCooldown) {
              orbitalHitCooldownRef.current.set(hitKey, currentTime);

              // 즉시 적 상태 업데이트
              setEnemies((prevEnemies) => {
                return prevEnemies.reduce<Enemy[]>((acc, e) => {
                  if (e.id === enemy.id) {
                    const newHp = e.hp - damage;

                    if (newHp > 0) {
                      acc.push({ ...e, hp: newHp });
                    } else {
                      // 적 사망 처리
                      const expGain = Math.floor(
                        e.exp * playerStats.expMultiplier
                      );

                      setExpOrbs((prevOrbs) => [
                        ...prevOrbs,
                        {
                          id: Math.random(),
                          x: e.x,
                          y: e.y,
                          exp: expGain,
                        },
                      ]);

                      setGameState((prevState) => ({
                        ...prevState,
                        score: prevState.score + expGain,
                        enemiesKilled: prevState.enemiesKilled + 1,
                      }));

                      createEffect("death", e.x, e.y, {
                        color: e.color,
                        duration: 500,
                      });
                    }
                  } else {
                    acc.push(e);
                  }
                  return acc;
                }, []);
              });

              // 타격 이펙트 - 적의 위치에 생성
              createEffect("hit", enemy.x, enemy.y, {
                color: weaponData.color,
                duration: 300,
              });

              // 궤도 무기 타격 이펙트 - 궤도 무기의 위치에 생성
              createEffect("orbital-hit", orbitalX, orbitalY, {
                color: weaponData.color,
                duration: 200,
              });
            }
          }
        });
      }
    },
    [player, enemies, getDistance, createEffect, playerStats.expMultiplier]
  );

  // attackWithWeapons 함수에서 이제 모든 함수들이 정의되어 있으므로 정상 작동
  // attackWithWeapons 함수에서 궤도 무기 부분 수정
  const attackWithWeapons = useCallback(() => {
    const currentTime = Date.now();

    player.weapons.forEach((weapon) => {
      const weaponData = WEAPONS[weapon.id];
      const level = weapon.level;

      // 레벨에 따른 스탯 계산
      const damage = Math.floor(
        (weaponData.baseDamage + (level - 1) * weaponData.levelScaling.damage) *
          playerStats.damageMultiplier
      );

      const cooldown =
        Math.max(
          100,
          weaponData.baseCooldown +
            (level - 1) * weaponData.levelScaling.cooldown
        ) *
        (1 - playerStats.cooldownReduction);

      const range = Math.floor(
        (weaponData.baseRange +
          (level - 1) * (weaponData.levelScaling.range || 0)) *
          playerStats.rangeMultiplier
      );

      // 궤도 무기는 매 프레임마다 업데이트
      if (weaponData.type === "orbital") {
        updateOrbitalWeapon(weapon, weaponData, damage, range, level);
        return;
      }

      // 다른 무기들은 쿨다운 체크
      if (currentTime - weapon.lastAttack > cooldown) {
        switch (weaponData.type) {
          case "melee":
            attackMelee(weapon, weaponData, damage, range, level);
            break;
          case "area":
            attackArea(weapon, weaponData, damage, range, level);
            break;
          case "multi":
            attackMulti(weapon, weaponData, damage, range, level);
            break;
          case "beam":
            attackBeam(weapon, weaponData, damage, range, level);
            break;
          default:
            attackProjectile(weapon, weaponData, damage, range, level);
            break;
        }

        // 공격 시간 업데이트
        setPlayer((prev) => ({
          ...prev,
          weapons: prev.weapons.map((w) =>
            w.id === weapon.id ? { ...w, lastAttack: currentTime } : w
          ),
        }));
      }
    });
  }, [
    player.weapons,
    playerStats,
    attackMelee,
    attackArea,
    attackMulti,
    attackBeam,
    attackProjectile,
    updateOrbitalWeapon,
  ]);

  // 유틸리티 함수: 점과 선분 사이의 거리 계산 (레이저용)
  const getDistanceToLine = useCallback(
    (
      lineStart: { x: number; y: number },
      lineEnd: { x: number; y: number },
      point: { x: number; y: number }
    ): number => {
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
    },
    []
  );

  const moveBullets = useCallback(() => {
    setBullets((prev) =>
      prev
        .map((bullet) => ({
          ...bullet,
          x: bullet.x + bullet.vx,
          y: bullet.y + bullet.vy,
          traveled:
            bullet.traveled +
            Math.sqrt(bullet.vx * bullet.vx + bullet.vy * bullet.vy),
        }))
        .filter(
          (bullet) =>
            bullet.traveled < bullet.range &&
            bullet.x > -50 &&
            bullet.x < GAME_CONFIG.CANVAS_WIDTH + 50 &&
            bullet.y > -50 &&
            bullet.y < GAME_CONFIG.CANVAS_HEIGHT + 50
        )
    );
  }, []);

  const handleCollisions = useCallback(() => {
    const currentTime = Date.now();

    // 총알과 적 충돌 부분을 다음과 같이 수정
    setBullets((prevBullets) => {
      const remainingBullets: Bullet[] = [];
      const hitEnemies = new Set<number>();

      prevBullets.forEach((bullet) => {
        let hit = false;

        enemies.forEach((enemy) => {
          if (
            !hitEnemies.has(enemy.id) &&
            checkCollision(bullet, enemy, GAME_CONFIG.BULLET_SIZE, enemy.size)
          ) {
            hitEnemies.add(enemy.id);
            hit = true;

            // 적에게 데미지 적용
            setEnemies((prev) =>
              prev.reduce<Enemy[]>((acc, e) => {
                if (e.id === enemy.id) {
                  const newHp = e.hp - bullet.damage;
                  if (newHp > 0) {
                    acc.push({ ...e, hp: newHp });
                  } else {
                    handleEnemyDeath(e);
                  }
                } else {
                  acc.push(e);
                }
                return acc;
              }, [])
            );

            // 기본 타격 이펙트
            createEffect("hit", enemy.x, enemy.y, {
              color: bullet.color,
              duration: 200,
            });

            // 마법 지팡이와 화염 지팡이의 범위 공격 효과
            if (
              bullet.weaponId === "magicWand" ||
              bullet.weaponId === "fireWand"
            ) {
              const areaRadius = bullet.weaponId === "magicWand" ? 40 : 80; // 마법 지팡이: 좁은 범위, 화염 지팡이: 넓은 범위
              const areaDamage = Math.floor(bullet.damage * 0.6); // 범위 데미지는 60%

              // 범위 공격 이펙트 생성
              createEffect("area", enemy.x, enemy.y, {
                radius: areaRadius,
                color: bullet.weaponId === "magicWand" ? "#4A90E2" : "#FF4500",
                duration: 600,
                weaponId: bullet.weaponId,
              });

              // 범위 내 다른 적들에게 데미지
              enemies.forEach((areaEnemy) => {
                if (
                  areaEnemy.id !== enemy.id &&
                  getDistance(enemy, areaEnemy) <= areaRadius
                ) {
                  setEnemies((prev) =>
                    prev.reduce<Enemy[]>((acc, e) => {
                      if (e.id === areaEnemy.id) {
                        const newHp = e.hp - areaDamage;
                        if (newHp > 0) {
                          acc.push({ ...e, hp: newHp });
                        } else {
                          handleEnemyDeath(e);
                        }
                      } else {
                        acc.push(e);
                      }
                      return acc;
                    }, [])
                  );

                  // 범위 데미지 이펙트
                  createEffect("hit", areaEnemy.x, areaEnemy.y, {
                    color:
                      bullet.weaponId === "magicWand" ? "#87CEEB" : "#FFA500",
                    duration: 300,
                  });
                }
              });
            }
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
      if (
        checkCollision(player, enemy, GAME_CONFIG.PLAYER_SIZE, enemy.size) &&
        (!player.invulnerableUntil || currentTime > player.invulnerableUntil)
      ) {
        setPlayer((prev) => {
          const damage = enemy.isBoss ? 30 : 20;
          const newHp = prev.hp - damage;

          if (newHp <= 0 && !gameState.isGameOverProcessed) {
            setGameState((prevState) => ({
              ...prevState,
              state: "gameover",
              isGameOverProcessed: true,
            }));
          }

          return {
            ...prev,
            hp: Math.max(0, newHp),
            invulnerableUntil: currentTime + GAME_CONFIG.INVULNERABLE_TIME,
          };
        });

        createEffect("damage", player.x, player.y, {
          color: "#FF0000",
          duration: 300,
        });
      }
    });

    // 경험치 오브 수집
    setExpOrbs((prevOrbs) => {
      const remainingOrbs: ExpOrb[] = [];
      let totalExp = 0;

      prevOrbs.forEach((orb) => {
        const distance = getDistance(player, orb);

        if (distance <= playerStats.magnetRange) {
          orb.magnetized = true;
        }

        if (orb.magnetized) {
          // 자석 효과로 플레이어에게 이동
          const dx = player.x - orb.x;
          const dy = player.y - orb.y;
          const moveDistance = Math.min(distance, 5);

          if (distance > 0) {
            orb.x += (dx / distance) * moveDistance;
            orb.y += (dy / distance) * moveDistance;
          }
        }

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

      if (totalExp > 0) {
        setPlayer((prev) => {
          const newExp = prev.exp + totalExp;
          let newLevel = prev.level;
          let remainingExp = newExp;
          let expToNext = prev.expToNext;

          while (remainingExp >= expToNext) {
            remainingExp -= expToNext;
            newLevel++;
            expToNext = Math.floor(
              GAME_CONFIG.BASE_EXP_TO_NEXT *
                Math.pow(GAME_CONFIG.EXP_SCALING, newLevel - 1)
            );
          }

          if (newLevel > prev.level) {
            generateLevelUpOptions();
            setGameState((prevState) => ({ ...prevState, state: "levelup" }));
          }

          return {
            ...prev,
            exp: remainingExp,
            level: newLevel,
            expToNext,
          };
        });
      }

      return remainingOrbs;
    });
  }, [
    player,
    enemies,
    checkCollision,
    getDistance,
    playerStats,
    gameState.isGameOverProcessed,
    handleEnemyDeath,
    createEffect,
  ]);

  // generateLevelUpOptions 함수 개선 (더 다양한 무기 선택)
  const generateLevelUpOptions = useCallback(() => {
    const options: LevelUpOption[] = [];

    // 새로운 무기 옵션 (더 많이 추가)
    const availableWeapons = Object.entries(WEAPONS).filter(
      ([weaponId, _]) =>
        !player.weapons.some((w) => w.id === weaponId) &&
        player.weapons.length < player.weaponSlots
    );

    // 새로운 무기 2개까지 추가 가능
    const newWeaponCount = Math.min(2, availableWeapons.length);
    for (let i = 0; i < newWeaponCount; i++) {
      const randomIndex = Math.floor(Math.random() * availableWeapons.length);
      const [weaponId, weaponData] = availableWeapons.splice(randomIndex, 1)[0];
      options.push({
        type: "weapon",
        id: weaponId,
        name: weaponData.name,
        description: weaponData.description,
        icon: weaponData.icon,
        isNew: true,
      });
    }

    // 무기 업그레이드 옵션 (더 많이 추가)
    const upgradableWeapons = player.weapons.filter(
      (w) => w.level < WEAPONS[w.id].maxLevel
    );
    const upgradeCount = Math.min(2, upgradableWeapons.length);
    for (let i = 0; i < upgradeCount; i++) {
      const randomIndex = Math.floor(Math.random() * upgradableWeapons.length);
      const weapon = upgradableWeapons.splice(randomIndex, 1)[0];
      const weaponData = WEAPONS[weapon.id];
      options.push({
        type: "weapon",
        id: weapon.id,
        name: `${weaponData.name} 강화`,
        description: `레벨 ${weapon.level} → ${weapon.level + 1}`,
        icon: weaponData.icon,
        currentLevel: weapon.level,
        maxLevel: weaponData.maxLevel,
      });
    }

    // 새로운 패시브 옵션
    const availablePassives = Object.entries(PASSIVES).filter(
      ([passiveId, _]) =>
        !player.passives.some((p) => p.id === passiveId) &&
        player.passives.length < player.passiveSlots
    );

    if (availablePassives.length > 0) {
      const [passiveId, passiveData] =
        availablePassives[Math.floor(Math.random() * availablePassives.length)];
      options.push({
        type: "passive",
        id: passiveId,
        name: passiveData.name,
        description: passiveData.description,
        icon: passiveData.icon,
        isNew: true,
      });
    }

    // 패시브 업그레이드 옵션
    const upgradablePassives = player.passives.filter(
      (p) => p.level < PASSIVES[p.id].maxLevel
    );
    if (upgradablePassives.length > 0) {
      const passive =
        upgradablePassives[
          Math.floor(Math.random() * upgradablePassives.length)
        ];
      const passiveData = PASSIVES[passive.id];
      options.push({
        type: "passive",
        id: passive.id,
        name: `${passiveData.name} 강화`,
        description: `레벨 ${passive.level} → ${passive.level + 1}`,
        icon: passiveData.icon,
        currentLevel: passive.level,
        maxLevel: passiveData.maxLevel,
      });
    }

    // 옵션이 부족하면 랜덤하게 더 추가
    while (
      options.length < 3 &&
      (availableWeapons.length > 0 || availablePassives.length > 0)
    ) {
      if (availableWeapons.length > 0 && Math.random() > 0.5) {
        const [weaponId, weaponData] = availableWeapons.splice(
          Math.floor(Math.random() * availableWeapons.length),
          1
        )[0];
        options.push({
          type: "weapon",
          id: weaponId,
          name: weaponData.name,
          description: weaponData.description,
          icon: weaponData.icon,
          isNew: true,
        });
      } else if (availablePassives.length > 0) {
        const [passiveId, passiveData] = availablePassives.splice(
          Math.floor(Math.random() * availablePassives.length),
          1
        )[0];
        options.push({
          type: "passive",
          id: passiveId,
          name: passiveData.name,
          description: passiveData.description,
          icon: passiveData.icon,
          isNew: true,
        });
      }
    }

    // 3개 옵션 선택 (셔플 후)
    const shuffled = options.sort(() => Math.random() - 0.5);
    setLevelUpOptions(shuffled.slice(0, 3));
  }, [
    player.weapons,
    player.passives,
    player.weaponSlots,
    player.passiveSlots,
  ]);

  const selectLevelUpOption = useCallback((option: LevelUpOption) => {
    setPlayer((prev) => {
      if (option.type === "weapon") {
        if (option.isNew) {
          // 새로운 무기 추가
          return {
            ...prev,
            weapons: [
              ...prev.weapons,
              { id: option.id as any, level: 1, lastAttack: 0 },
            ],
          };
        } else {
          // 무기 업그레이드
          return {
            ...prev,
            weapons: prev.weapons.map((w) =>
              w.id === option.id ? { ...w, level: w.level + 1 } : w
            ),
          };
        }
      } else if (option.type === "passive") {
        if (option.isNew) {
          // 새로운 패시브 추가
          return {
            ...prev,
            passives: [...prev.passives, { id: option.id as any, level: 1 }],
          };
        } else {
          // 패시브 업그레이드
          return {
            ...prev,
            passives: prev.passives.map((p) =>
              p.id === option.id ? { ...p, level: p.level + 1 } : p
            ),
          };
        }
      }
      return prev;
    });

    setLevelUpOptions([]);
    setGameState((prev) => ({ ...prev, state: "playing" }));
  }, []);

  // Game loop
  const gameLoop = useCallback(() => {
    if (gameState.state !== "playing") return;

    movePlayer();
    spawnEnemies();
    moveEnemies();
    attackWithWeapons();
    processAreaDamage(); // 지역 효과 데미지 처리 추가
    moveBullets();
    handleCollisions();

    // 체력 회복
    if (playerStats.healthRegen > 0) {
      setPlayer((prev) => ({
        ...prev,
        hp: Math.min(prev.maxHp, prev.hp + playerStats.healthRegen / 60), // 초당 회복량
      }));
    }

    // 게임 시간 업데이트
    setGameState((prev) => {
      const newTime = prev.gameTime + 16;
      const newWave = Math.floor(newTime / GAME_CONFIG.WAVE_DURATION) + 1;

      if (newTime >= GAME_CONFIG.GAME_DURATION && !prev.isGameOverProcessed) {
        return {
          ...prev,
          gameTime: newTime,
          wave: newWave,
          state: "gameover",
          isGameOverProcessed: true,
        };
      }

      return {
        ...prev,
        gameTime: newTime,
        wave: newWave,
      };
    });
  }, [
    gameState.state,
    movePlayer,
    spawnEnemies,
    moveEnemies,
    attackWithWeapons,
    processAreaDamage,
    moveBullets,
    handleCollisions,
    playerStats.healthRegen,
  ]);

  // Event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
      if (e.key === " ") {
        e.preventDefault();
        if (gameState.state === "playing") {
          setGameState((prev) => ({ ...prev, state: "paused" }));
        } else if (gameState.state === "paused") {
          setGameState((prev) => ({ ...prev, state: "playing" }));
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState.state]);

  // Scroll prevention during game
  useEffect(() => {
    const preventScroll = (e: Event) => e.preventDefault();
    const isGameActive = ["playing", "paused", "levelup"].includes(
      gameState.state
    );

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
  }, [gameState.state]);

  // Game loop effect
  useEffect(() => {
    if (gameState.state === "playing") {
      gameLoopRef.current = window.setInterval(gameLoop, 16);
    } else if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameLoop, gameState.state]);

  const startGame = useCallback(
    (character: Character) => {
      window.scrollTo({ top: 50, behavior: "smooth" });

      setSelectedCharacter(character);
      setGameState({
        state: "playing",
        gameTime: 0,
        score: 0,
        wave: 1,
        enemiesKilled: 0,
        highScore: gameState.highScore,
        isGameOverProcessed: false,
      });

      setPlayer({
        x: GAME_CONFIG.CANVAS_WIDTH / 2,
        y: GAME_CONFIG.CANVAS_HEIGHT / 2,
        hp: character.hp,
        maxHp: character.hp,
        level: 1,
        exp: 0,
        expToNext: GAME_CONFIG.BASE_EXP_TO_NEXT,
        weapons: [{ id: character.startWeapon, level: 1, lastAttack: 0 }],
        passives: [],
        invulnerableUntil: 0,
        speed: character.speed,
        weaponSlots: GAME_CONFIG.PLAYER_BASE_WEAPON_SLOTS,
        passiveSlots: GAME_CONFIG.PLAYER_BASE_PASSIVE_SLOTS,
      });

      setEnemies([]);
      setBullets([]);
      setExpOrbs([]);
      setEffects([]);
      setLevelUpOptions([]);
      setOrbitalWeapons([]);
      orbitalHitCooldownRef.current.clear();
      areaEffectsRef.current.clear(); // 지역 효과 초기화
      lastUpdateRef.current = 0;

      // 게임 시작 시 배경음악 재생 - setTimeout으로 지연시켜 DOM이 렌더링된 후 실행
      setTimeout(() => {
        playBackgroundMusic();
      }, 100);
    },
    [gameState.highScore, playBackgroundMusic]
  );

  const restartGame = useCallback(() => {
    // 게임 종료 시 배경음악 정지
    stopBackgroundMusic();
    setGameState((prev) => ({ ...prev, state: "menu" }));
    setSelectedCharacter(null);
  }, [stopBackgroundMusic]);

  // 게임 오버 시 음악 정지
  useEffect(() => {
    if (gameState.state === "gameover") {
      stopBackgroundMusic();
    }
  }, [gameState.state, stopBackgroundMusic]);

  // Render based on game state
  if (gameState.state === "menu") {
    return (
      <MenuScreen
        onStartGame={startGame}
        user={user}
        characters={CHARACTERS}
        rankingData={rankingData}
      />
    );
  }

  if (gameState.state === "levelup") {
    return (
      <LevelUpScreen
        options={levelUpOptions}
        onSelectOption={selectLevelUpOption}
      />
    );
  }

  if (gameState.state === "gameover") {
    return (
      <GameOverScreen
        gameState={gameState}
        player={player}
        onRestart={restartGame}
        user={user}
        rankingData={rankingData}
        createGameMutation={createGameMutation}
        refetchRanking={refetchRanking}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* 오디오 엘리먼트 */}
      <audio ref={audioRef} preload="auto" loop />

      {/* 배경 효과 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-purple-500 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-green-500 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      <GameUI
        gameState={gameState}
        player={player}
        playerStats={playerStats}
        onPause={() =>
          setGameState((prev) => ({
            ...prev,
            state: prev.state === "paused" ? "playing" : "paused",
          }))
        }
        onRestart={restartGame}
      />

      <GameCanvas
        player={player}
        enemies={enemies}
        bullets={bullets}
        expOrbs={expOrbs}
        effects={effects}
        gameState={gameState}
        selectedCharacter={selectedCharacter}
        orbitalWeapons={orbitalWeapons}
      />
    </div>
  );
}
