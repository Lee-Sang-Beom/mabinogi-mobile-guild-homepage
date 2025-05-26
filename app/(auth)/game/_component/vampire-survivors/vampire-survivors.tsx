// "use client";
//
// import React, { useState, useEffect, useCallback, useRef } from "react";
// import {
//   Skull,
//   Zap,
//   Shield,
//   Target,
//   Heart,
//   Star,
//   Swords,
//   Crown,
// } from "lucide-react";
//
// const GAME_WIDTH = 800;
// const GAME_HEIGHT = 600;
// const PLAYER_SIZE = 20;
// const ENEMY_SIZE = 16;
// const XP_ORB_SIZE = 8;
// const WEAPON_DAMAGE = 25;
// const WEAPON_COOLDOWN = 1000;
//
// // 캐릭터 데이터
// const characters = [
//   {
//     id: "warrior",
//     name: "전사",
//     icon: Swords,
//     stats: { hp: 120, speed: 2, damage: 1.2, armor: 1.1 },
//     color: "#ff6b6b",
//   },
//   {
//     id: "mage",
//     name: "마법사",
//     icon: Zap,
//     stats: { hp: 80, speed: 2.2, damage: 1.5, armor: 0.9 },
//     color: "#4ecdc4",
//   },
//   {
//     id: "archer",
//     name: "궁수",
//     icon: Target,
//     stats: { hp: 100, speed: 2.5, damage: 1.3, armor: 1.0 },
//     color: "#95e1d3",
//   },
// ];
//
// // 무기 데이터
// const weapons = [
//   {
//     id: "fireball",
//     name: "파이어볼",
//     icon: "🔥",
//     damage: 30,
//     cooldown: 800,
//     range: 150,
//     evolution: {
//       id: "meteor",
//       name: "메테오",
//       damage: 80,
//       cooldown: 600,
//       range: 200,
//     },
//   },
//   {
//     id: "lightning",
//     name: "번개",
//     icon: "⚡",
//     damage: 45,
//     cooldown: 1200,
//     range: 120,
//     evolution: {
//       id: "storm",
//       name: "폭풍",
//       damage: 90,
//       cooldown: 1000,
//       range: 180,
//     },
//   },
//   {
//     id: "ice",
//     name: "얼음창",
//     icon: "❄️",
//     damage: 25,
//     cooldown: 600,
//     range: 100,
//     evolution: {
//       id: "blizzard",
//       name: "블리자드",
//       damage: 60,
//       cooldown: 500,
//       range: 160,
//     },
//   },
//   {
//     id: "holy",
//     name: "성스러운 빛",
//     icon: "✨",
//     damage: 35,
//     cooldown: 1000,
//     range: 140,
//     evolution: {
//       id: "divine",
//       name: "신성한 심판",
//       damage: 100,
//       cooldown: 800,
//       range: 220,
//     },
//   },
// ];
//
// // 패시브 아이템
// const passives = [
//   { id: "speed", name: "속도 증가", icon: "💨", effect: "speed", value: 0.3 },
//   {
//     id: "damage",
//     name: "공격력 증가",
//     icon: "💪",
//     effect: "damage",
//     value: 0.2,
//   },
//   { id: "health", name: "체력 증가", icon: "❤️", effect: "maxHp", value: 20 },
//   {
//     id: "cooldown",
//     name: "쿨다운 감소",
//     icon: "⏰",
//     effect: "cooldown",
//     value: 0.15,
//   },
// ];
//
// export default function VampireSurvivorsGame() {
//   const canvasRef = useRef(null);
//   const gameLoopRef = useRef(null);
//   const [gameState, setGameState] = useState("character-select"); // character-select, playing, paused, levelup, gameover
//   const [selectedCharacter, setSelectedCharacter] = useState(null);
//   const [gameTime, setGameTime] = useState(0);
//   const [score, setScore] = useState(0);
//
//   // 게임 객체들
//   const [player, setPlayer] = useState({
//     x: GAME_WIDTH / 2,
//     y: GAME_HEIGHT / 2,
//     hp: 100,
//     maxHp: 100,
//     xp: 0,
//     level: 1,
//     xpToNext: 100,
//     weapons: [],
//     passives: [],
//     stats: { speed: 2, damage: 1, armor: 1, maxHp: 100, cooldown: 1 },
//   });
//
//   const [enemies, setEnemies] = useState([]);
//   const [projectiles, setProjectiles] = useState([]);
//   const [xpOrbs, setXpOrbs] = useState([]);
//   const [levelUpOptions, setLevelUpOptions] = useState([]);
//   const [keys, setKeys] = useState({});
//   const [mouse, setMouse] = useState({ x: 0, y: 0 });
//
//   // 키보드 입력 처리
//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       setKeys((prev) => ({ ...prev, [e.key]: true }));
//       if (e.key === " " && gameState === "playing") {
//         setGameState("paused");
//       } else if (e.key === " " && gameState === "paused") {
//         setGameState("playing");
//       }
//     };
//
//     const handleKeyUp = (e) => {
//       setKeys((prev) => ({ ...prev, [e.key]: false }));
//     };
//
//     window.addEventListener("keydown", handleKeyDown);
//     window.addEventListener("keyup", handleKeyUp);
//
//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//       window.removeEventListener("keyup", handleKeyUp);
//     };
//   }, [gameState]);
//
//   // 마우스 입력 처리
//   useEffect(() => {
//     const handleMouseMove = (e) => {
//       const canvas = canvasRef.current;
//       if (canvas) {
//         const rect = canvas.getBoundingClientRect();
//         setMouse({
//           x: e.clientX - rect.left,
//           y: e.clientY - rect.top,
//         });
//       }
//     };
//
//     window.addEventListener("mousemove", handleMouseMove);
//     return () => window.removeEventListener("mousemove", handleMouseMove);
//   }, []);
//
//   // 캐릭터 선택
//   const selectCharacter = (character) => {
//     setSelectedCharacter(character);
//     setPlayer((prev) => ({
//       ...prev,
//       maxHp: character.stats.hp,
//       hp: character.stats.hp,
//       stats: { ...prev.stats, ...character.stats },
//       weapons: [
//         {
//           ...weapons[0], // 기본 무기 파이어볼
//           level: 1,
//           lastFired: 0,
//         },
//       ],
//     }));
//     setGameState("playing");
//   };
//
//   // 레벨업 옵션 생성
//   const generateLevelUpOptions = useCallback(() => {
//     const options = [];
//     const availableWeapons = weapons.filter(
//       (w) =>
//         !player.weapons.some(
//           (pw) => pw.id === w.id || pw.id === w.evolution?.id,
//         ),
//     );
//     const availablePassives = passives.filter(
//       (p) =>
//         !player.passives.some((pp) => pp.id === p.id) ||
//         player.passives.find((pp) => pp.id === p.id)?.level < 5,
//     );
//
//     // 무기 진화 옵션
//     player.weapons.forEach((weapon) => {
//       const baseWeapon = weapons.find((w) => w.id === weapon.id);
//       if (
//         baseWeapon?.evolution &&
//         weapon.level >= 3 &&
//         !player.weapons.some((w) => w.id === baseWeapon.evolution.id)
//       ) {
//         options.push({
//           type: "evolution",
//           weapon: baseWeapon.evolution,
//           baseWeapon: weapon,
//         });
//       }
//     });
//
//     // 새 무기
//     if (availableWeapons.length > 0 && player.weapons.length < 6) {
//       options.push({
//         type: "weapon",
//         weapon:
//           availableWeapons[Math.floor(Math.random() * availableWeapons.length)],
//       });
//     }
//
//     // 무기 강화
//     if (player.weapons.length > 0) {
//       const upgradeableWeapons = player.weapons.filter((w) => w.level < 5);
//       if (upgradeableWeapons.length > 0) {
//         options.push({
//           type: "upgrade",
//           weapon:
//             upgradeableWeapons[
//               Math.floor(Math.random() * upgradeableWeapons.length)
//             ],
//         });
//       }
//     }
//
//     // 패시브 아이템
//     if (availablePassives.length > 0) {
//       options.push({
//         type: "passive",
//         passive:
//           availablePassives[
//             Math.floor(Math.random() * availablePassives.length)
//           ],
//       });
//     }
//
//     // 3개 옵션 선택
//     const finalOptions = [];
//     while (finalOptions.length < 3 && options.length > 0) {
//       const randomIndex = Math.floor(Math.random() * options.length);
//       finalOptions.push(options.splice(randomIndex, 1)[0]);
//     }
//
//     return finalOptions;
//   }, [player.weapons, player.passives]);
//
//   // 레벨업 옵션 선택
//   const selectLevelUpOption = (option) => {
//     setPlayer((prev) => {
//       const newPlayer = { ...prev };
//
//       if (option.type === "weapon") {
//         newPlayer.weapons.push({
//           ...option.weapon,
//           level: 1,
//           lastFired: 0,
//         });
//       } else if (option.type === "upgrade") {
//         const weaponIndex = newPlayer.weapons.findIndex(
//           (w) => w.id === option.weapon.id,
//         );
//         if (weaponIndex !== -1) {
//           newPlayer.weapons[weaponIndex].level++;
//         }
//       } else if (option.type === "evolution") {
//         const baseIndex = newPlayer.weapons.findIndex(
//           (w) => w.id === option.baseWeapon.id,
//         );
//         if (baseIndex !== -1) {
//           newPlayer.weapons[baseIndex] = {
//             ...option.weapon,
//             level: 1,
//             lastFired: 0,
//           };
//         }
//       } else if (option.type === "passive") {
//         const existingIndex = newPlayer.passives.findIndex(
//           (p) => p.id === option.passive.id,
//         );
//         if (existingIndex !== -1) {
//           newPlayer.passives[existingIndex].level++;
//         } else {
//           newPlayer.passives.push({
//             ...option.passive,
//             level: 1,
//           });
//         }
//
//         // 패시브 효과 적용
//         if (option.passive.effect === "maxHp") {
//           newPlayer.maxHp += option.passive.value;
//           newPlayer.hp += option.passive.value;
//         } else if (option.passive.effect in newPlayer.stats) {
//           newPlayer.stats[option.passive.effect] += option.passive.value;
//         }
//       }
//
//       return newPlayer;
//     });
//
//     setGameState("playing");
//   };
//
//   // 적 스폰
//   const spawnEnemy = useCallback(() => {
//     const side = Math.floor(Math.random() * 4);
//     let x, y;
//
//     switch (side) {
//       case 0: // top
//         x = Math.random() * GAME_WIDTH;
//         y = -ENEMY_SIZE;
//         break;
//       case 1: // right
//         x = GAME_WIDTH + ENEMY_SIZE;
//         y = Math.random() * GAME_HEIGHT;
//         break;
//       case 2: // bottom
//         x = Math.random() * GAME_WIDTH;
//         y = GAME_HEIGHT + ENEMY_SIZE;
//         break;
//       case 3: // left
//         x = -ENEMY_SIZE;
//         y = Math.random() * GAME_HEIGHT;
//         break;
//       default:
//         x = 0;
//         y = 0;
//     }
//
//     const enemyTypes = [
//       { hp: 50, speed: 1, color: "#ff4757", xp: 5, icon: "👹" },
//       { hp: 30, speed: 1.5, color: "#ff6348", xp: 3, icon: "🧟" },
//       { hp: 80, speed: 0.8, color: "#8b0000", xp: 8, icon: "💀" },
//     ];
//
//     const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
//
//     return {
//       id: Date.now() + Math.random(),
//       x,
//       y,
//       ...type,
//       maxHp: type.hp,
//     };
//   }, []);
//
//   // 발사체 생성
//   const createProjectile = useCallback(
//     (weapon, targetX, targetY) => {
//       const dx = targetX - player.x;
//       const dy = targetY - player.y;
//       const distance = Math.sqrt(dx * dx + dy * dy);
//
//       if (distance > weapon.range) return null;
//
//       const speed = 5;
//
//       return {
//         id: Date.now() + Math.random(),
//         x: player.x,
//         y: player.y,
//         vx: (dx / distance) * speed,
//         vy: (dy / distance) * speed,
//         damage: weapon.damage * player.stats.damage,
//         weapon: weapon.id,
//         icon: weapon.icon,
//       };
//     },
//     [player.x, player.y, player.stats.damage],
//   );
//
//   // XP 오브 생성
//   const createXpOrb = useCallback((x, y, xp) => {
//     return {
//       id: Date.now() + Math.random(),
//       x: x + (Math.random() - 0.5) * 20,
//       y: y + (Math.random() - 0.5) * 20,
//       xp,
//       life: 300, // 5초
//     };
//   }, []);
//
//   // 게임 업데이트
//   const updateGame = useCallback(() => {
//     if (gameState !== "playing") return;
//
//     const currentTime = Date.now();
//
//     setGameTime((prev) => prev + 1);
//
//     // 플레이어 이동
//     setPlayer((prev) => {
//       let newX = prev.x;
//       let newY = prev.y;
//
//       if (keys["ArrowLeft"] || keys["a"]) newX -= prev.stats.speed;
//       if (keys["ArrowRight"] || keys["d"]) newX += prev.stats.speed;
//       if (keys["ArrowUp"] || keys["w"]) newY -= prev.stats.speed;
//       if (keys["ArrowDown"] || keys["s"]) newY += prev.stats.speed;
//
//       // 화면 경계 제한
//       newX = Math.max(PLAYER_SIZE, Math.min(GAME_WIDTH - PLAYER_SIZE, newX));
//       newY = Math.max(PLAYER_SIZE, Math.min(GAME_HEIGHT - PLAYER_SIZE, newY));
//
//       return { ...prev, x: newX, y: newY };
//     });
//
//     // 적 스폰
//     if (Math.random() < 0.02 + gameTime * 0.00001) {
//       setEnemies((prev) => [...prev, spawnEnemy()]);
//     }
//
//     // 적 이동 및 무기 발사
//     setEnemies((prevEnemies) => {
//       const updatedEnemies = prevEnemies.map((enemy) => {
//         const dx = player.x - enemy.x;
//         const dy = player.y - enemy.y;
//         const distance = Math.sqrt(dx * dx + dy * dy);
//
//         return {
//           ...enemy,
//           x: enemy.x + (dx / distance) * enemy.speed,
//           y: enemy.y + (dy / distance) * enemy.speed,
//         };
//       });
//
//       // 무기 발사 로직을 여기서 실행
//       setPlayer((prevPlayer) => {
//         const updatedWeapons = prevPlayer.weapons.map((weapon) => {
//           if (
//             currentTime - weapon.lastFired >=
//             weapon.cooldown / prevPlayer.stats.cooldown
//           ) {
//             // 가장 가까운 적 찾기
//             let closestEnemy = null;
//             let closestDistance = Infinity;
//
//             updatedEnemies.forEach((enemy) => {
//               const distance = Math.sqrt(
//                 (enemy.x - prevPlayer.x) ** 2 + (enemy.y - prevPlayer.y) ** 2,
//               );
//               if (distance < closestDistance && distance <= weapon.range) {
//                 closestDistance = distance;
//                 closestEnemy = enemy;
//               }
//             });
//
//             if (closestEnemy) {
//               const projectile = createProjectile(
//                 weapon,
//                 closestEnemy.x,
//                 closestEnemy.y,
//               );
//               if (projectile) {
//                 setProjectiles((prevProj) => [...prevProj, projectile]);
//               }
//
//               return { ...weapon, lastFired: currentTime };
//             }
//           }
//           return weapon;
//         });
//
//         return { ...prevPlayer, weapons: updatedWeapons };
//       });
//
//       return updatedEnemies;
//     });
//
//     // 발사체 이동
//     setProjectiles((prev) =>
//       prev
//         .map((proj) => ({
//           ...proj,
//           x: proj.x + proj.vx,
//           y: proj.y + proj.vy,
//         }))
//         .filter(
//           (proj) =>
//             proj.x >= 0 &&
//             proj.x <= GAME_WIDTH &&
//             proj.y >= 0 &&
//             proj.y <= GAME_HEIGHT,
//         ),
//     );
//
//     // 충돌 검사 - 발사체와 적
//     setEnemies((prev) => {
//       const newEnemies = [];
//       const hitProjectiles = new Set();
//
//       prev.forEach((enemy) => {
//         let enemyHit = false;
//
//         projectiles.forEach((proj) => {
//           if (hitProjectiles.has(proj.id)) return;
//
//           const distance = Math.sqrt(
//             (proj.x - enemy.x) ** 2 + (proj.y - enemy.y) ** 2,
//           );
//
//           if (distance < ENEMY_SIZE) {
//             enemy.hp -= proj.damage;
//             hitProjectiles.add(proj.id);
//             enemyHit = true;
//           }
//         });
//
//         if (enemy.hp > 0) {
//           newEnemies.push(enemy);
//         } else {
//           // 적 죽음 - XP 오브 생성
//           setXpOrbs((prevOrbs) => [
//             ...prevOrbs,
//             createXpOrb(enemy.x, enemy.y, enemy.xp),
//           ]);
//           setScore((prevScore) => prevScore + enemy.xp * 10);
//         }
//       });
//
//       // 맞은 발사체 제거
//       setProjectiles((prev) =>
//         prev.filter((proj) => !hitProjectiles.has(proj.id)),
//       );
//
//       return newEnemies;
//     });
//
//     // 충돌 검사 - 플레이어와 적
//     setPlayer((prev) => {
//       let damage = 0;
//       enemies.forEach((enemy) => {
//         const distance = Math.sqrt(
//           (enemy.x - prev.x) ** 2 + (enemy.y - prev.y) ** 2,
//         );
//         if (distance < PLAYER_SIZE + ENEMY_SIZE) {
//           damage += 10;
//         }
//       });
//
//       const newHp = Math.max(0, prev.hp - damage / prev.stats.armor);
//       if (newHp <= 0) {
//         setGameState("gameover");
//       }
//
//       return { ...prev, hp: newHp };
//     });
//
//     // XP 오브 수집
//     setPlayer((prev) => {
//       let xpGained = 0;
//
//       setXpOrbs((prevOrbs) =>
//         prevOrbs.filter((orb) => {
//           const distance = Math.sqrt(
//             (orb.x - prev.x) ** 2 + (orb.y - prev.y) ** 2,
//           );
//
//           if (distance < PLAYER_SIZE + XP_ORB_SIZE) {
//             xpGained += orb.xp;
//             return false;
//           }
//
//           orb.life--;
//           return orb.life > 0;
//         }),
//       );
//
//       if (xpGained > 0) {
//         const newXp = prev.xp + xpGained;
//         if (newXp >= prev.xpToNext) {
//           // 레벨업
//           const newLevel = prev.level + 1;
//           const options = generateLevelUpOptions();
//           setLevelUpOptions(options);
//           setGameState("levelup");
//
//           return {
//             ...prev,
//             xp: newXp - prev.xpToNext,
//             level: newLevel,
//             xpToNext: prev.xpToNext + 50,
//             hp: Math.min(prev.maxHp, prev.hp + 20), // 레벨업시 체력 회복
//           };
//         }
//
//         return { ...prev, xp: newXp };
//       }
//
//       return prev;
//     });
//
//     // 게임 시간 체크 (30분 = 108000 프레임)
//     if (gameTime >= 108000) {
//       setGameState("gameover");
//     }
//   }, [
//     gameState,
//     gameTime,
//     keys,
//     player.x,
//     player.y,
//     enemies,
//     projectiles,
//     spawnEnemy,
//     createProjectile,
//     createXpOrb,
//     generateLevelUpOptions,
//   ]);
//
//   // 게임 루프
//   useEffect(() => {
//     if (gameState === "playing") {
//       gameLoopRef.current = setInterval(updateGame, 16); // 60 FPS
//     } else {
//       if (gameLoopRef.current) {
//         clearInterval(gameLoopRef.current);
//       }
//     }
//
//     return () => {
//       if (gameLoopRef.current) {
//         clearInterval(gameLoopRef.current);
//       }
//     };
//   }, [gameState, updateGame]);
//
//   // 스크롤 방지
//   useEffect(() => {
//     if (
//       gameState === "playing" ||
//       gameState === "paused" ||
//       gameState === "levelup"
//     ) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "auto";
//     }
//
//     return () => {
//       document.body.style.overflow = "auto";
//     };
//   }, [gameState]);
//
//   // 캔버스 렌더링
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//
//     const ctx = canvas.getContext("2d");
//     ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
//
//     // 배경 그라디언트
//     const gradient = ctx.createLinearGradient(0, 0, GAME_WIDTH, GAME_HEIGHT);
//     gradient.addColorStop(0, "#1a1a2e");
//     gradient.addColorStop(0.5, "#16213e");
//     gradient.addColorStop(1, "#0f0f23");
//     ctx.fillStyle = gradient;
//     ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
//
//     // 격자 패턴
//     ctx.strokeStyle = "#333";
//     ctx.lineWidth = 1;
//     for (let x = 0; x < GAME_WIDTH; x += 50) {
//       ctx.beginPath();
//       ctx.moveTo(x, 0);
//       ctx.lineTo(x, GAME_HEIGHT);
//       ctx.stroke();
//     }
//     for (let y = 0; y < GAME_HEIGHT; y += 50) {
//       ctx.beginPath();
//       ctx.moveTo(0, y);
//       ctx.lineTo(GAME_WIDTH, y);
//       ctx.stroke();
//     }
//
//     if (
//       gameState === "playing" ||
//       gameState === "paused" ||
//       gameState === "levelup"
//     ) {
//       // XP 오브 렌더링
//       xpOrbs.forEach((orb) => {
//         ctx.fillStyle = "#ffd700";
//         ctx.beginPath();
//         ctx.arc(orb.x, orb.y, XP_ORB_SIZE, 0, 2 * Math.PI);
//         ctx.fill();
//
//         ctx.fillStyle = "#fff";
//         ctx.beginPath();
//         ctx.arc(orb.x, orb.y, XP_ORB_SIZE * 0.6, 0, 2 * Math.PI);
//         ctx.fill();
//       });
//
//       // 적 렌더링
//       enemies.forEach((enemy) => {
//         ctx.fillStyle = enemy.color;
//         ctx.beginPath();
//         ctx.arc(enemy.x, enemy.y, ENEMY_SIZE, 0, 2 * Math.PI);
//         ctx.fill();
//
//         // 적 아이콘
//         ctx.font = "16px Arial";
//         ctx.textAlign = "center";
//         ctx.fillText(enemy.icon, enemy.x, enemy.y + 5);
//
//         // HP 바
//         if (enemy.hp < enemy.maxHp) {
//           ctx.fillStyle = "#333";
//           ctx.fillRect(
//             enemy.x - ENEMY_SIZE,
//             enemy.y - ENEMY_SIZE - 8,
//             ENEMY_SIZE * 2,
//             4,
//           );
//           ctx.fillStyle = "#ff4757";
//           ctx.fillRect(
//             enemy.x - ENEMY_SIZE,
//             enemy.y - ENEMY_SIZE - 8,
//             ENEMY_SIZE * 2 * (enemy.hp / enemy.maxHp),
//             4,
//           );
//         }
//       });
//
//       // 발사체 렌더링
//       projectiles.forEach((proj) => {
//         ctx.font = "12px Arial";
//         ctx.textAlign = "center";
//         ctx.fillText(proj.icon, proj.x, proj.y + 4);
//       });
//
//       // 플레이어 렌더링
//       if (selectedCharacter) {
//         ctx.fillStyle = selectedCharacter.color;
//         ctx.beginPath();
//         ctx.arc(player.x, player.y, PLAYER_SIZE, 0, 2 * Math.PI);
//         ctx.fill();
//
//         ctx.fillStyle = "#fff";
//         ctx.beginPath();
//         ctx.arc(player.x, player.y, PLAYER_SIZE * 0.7, 0, 2 * Math.PI);
//         ctx.fill();
//
//         // 플레이어 아이콘
//         ctx.fillStyle = selectedCharacter.color;
//         ctx.font = "20px Arial";
//         ctx.textAlign = "center";
//         const IconComponent = selectedCharacter.icon;
//         ctx.fillText("🎯", player.x, player.y + 6);
//       }
//     }
//   }, [gameState, player, enemies, projectiles, xpOrbs, selectedCharacter]);
//
//   const formatTime = (frames) => {
//     const totalSeconds = Math.floor(frames / 60);
//     const minutes = Math.floor(totalSeconds / 60);
//     const seconds = totalSeconds % 60;
//     return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
//   };
//
//   const resetGame = () => {
//     setPlayer({
//       x: GAME_WIDTH / 2,
//       y: GAME_HEIGHT / 2,
//       hp: selectedCharacter?.stats.hp || 100,
//       maxHp: selectedCharacter?.stats.hp || 100,
//       xp: 0,
//       level: 1,
//       xpToNext: 100,
//       weapons: [],
//       passives: [],
//       stats: selectedCharacter
//         ? { ...selectedCharacter.stats }
//         : { speed: 2, damage: 1, armor: 1, maxHp: 100, cooldown: 1 },
//     });
//     setEnemies([]);
//     setProjectiles([]);
//     setXpOrbs([]);
//     setGameTime(0);
//     setScore(0);
//     setGameState("playing");
//   };
//
//   return (
//     <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-4">
//       <h1 className="text-4xl font-bold mb-4 text-red-500">
//         🧛 Vampire Survivors
//       </h1>
//
//       {gameState === "character-select" && (
//         <div className="text-center">
//           <h2 className="text-2xl mb-6">캐릭터를 선택하세요</h2>
//           <div className="grid grid-cols-3 gap-4">
//             {characters.map((char) => {
//               const IconComponent = char.icon;
//               return (
//                 <button
//                   key={char.id}
//                   onClick={() => selectCharacter(char)}
//                   className="p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors border-2 border-transparent hover:border-red-500"
//                 >
//                   <IconComponent
//                     className="w-12 h-12 mx-auto mb-2"
//                     style={{ color: char.color }}
//                   />
//                   <h3 className="text-xl font-bold mb-2">{char.name}</h3>
//                   <div className="text-sm text-gray-400">
//                     <p>체력: {char.stats.hp}</p>
//                     <p>속도: {char.stats.speed}</p>
//                     <p>공격력: {char.stats.damage}x</p>
//                     <p>방어력: {char.stats.armor}x</p>
//                   </div>
//                 </button>
//               );
//             })}
//           </div>
//         </div>
//       )}
//
//       {(gameState === "playing" ||
//         gameState === "paused" ||
//         gameState === "levelup") && (
//         <>
//           {/* UI 정보 */}
//           <div className="flex justify-between w-full max-w-4xl mb-4">
//             <div className="flex items-center gap-4">
//               <div className="flex items-center gap-2">
//                 <Heart className="w-5 h-5 text-red-500" />
//                 <div className="w-32 bg-gray-700 rounded-full h-4">
//                   <div
//                     className="bg-red-500 h-4 rounded-full"
//                     style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
//                   />
//                 </div>
//                 <span>
//                   {Math.round(player.hp)}/{player.maxHp}
//                 </span>
//               </div>
//
//               <div className="flex items-center gap-2">
//                 <Star className="w-5 h-5 text-blue-500" />
//                 <div className="w-32 bg-gray-700 rounded-full h-4">
//                   <div
//                     className="bg-blue-500 h-4 rounded-full"
//                     style={{ width: `${(player.xp / player.xpToNext) * 100}%` }}
//                   />
//                 </div>
//                 <span>Lv.{player.level}</span>
//               </div>
//             </div>
//
//             <div className="flex items-center gap-4">
//               <span>시간: {formatTime(gameTime)}</span>
//               <span>점수: {score.toLocaleString()}</span>
//               <button
//                 onClick={() =>
//                   setGameState(gameState === "paused" ? "playing" : "paused")
//                 }
//                 className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
//               >
//                 {gameState === "paused" ? "계속" : "일시정지"}
//               </button>
//             </div>
//           </div>
//
//           {/* 게임 캔버스 */}
//           <canvas
//             ref={canvasRef}
//             width={GAME_WIDTH}
//             height={GAME_HEIGHT}
//             className="border-2 border-gray-600 rounded-lg bg-gray-800"
//           />
//
//           {/* 무기 및 패시브 정보 */}
//           <div className="flex gap-4 mt-4 w-full max-w-4xl">
//             <div className="flex-1">
//               <h3 className="text-lg font-bold mb-2">무기</h3>
//               <div className="grid grid-cols-3 gap-2">
//                 {player.weapons.map((weapon, index) => (
//                   <div
//                     key={index}
//                     className="bg-gray-800 p-2 rounded text-center"
//                   >
//                     <div className="text-2xl mb-1">{weapon.icon}</div>
//                     <div className="text-sm">{weapon.name}</div>
//                     <div className="text-xs text-gray-400">
//                       Lv.{weapon.level}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//
//             <div className="flex-1">
//               <h3 className="text-lg font-bold mb-2">패시브</h3>
//               <div className="grid grid-cols-3 gap-2">
//                 {player.passives.map((passive, index) => (
//                   <div
//                     key={index}
//                     className="bg-gray-800 p-2 rounded text-center"
//                   >
//                     <div className="text-2xl mb-1">{passive.icon}</div>
//                     <div className="text-sm">{passive.name}</div>
//                     <div className="text-xs text-gray-400">
//                       Lv.{passive.level}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//
//           {/* 모바일 조작 버튼 */}
//           <div className="fixed bottom-4 left-4 md:hidden">
//             <div className="grid grid-cols-3 gap-2 w-32 h-32">
//               <div></div>
//               <button
//                 onTouchStart={() =>
//                   setKeys((prev) => ({ ...prev, ArrowUp: true }))
//                 }
//                 onTouchEnd={() =>
//                   setKeys((prev) => ({ ...prev, ArrowUp: false }))
//                 }
//                 className="bg-gray-700 rounded p-2"
//               >
//                 ↑
//               </button>
//               <div></div>
//               <button
//                 onTouchStart={() =>
//                   setKeys((prev) => ({ ...prev, ArrowLeft: true }))
//                 }
//                 onTouchEnd={() =>
//                   setKeys((prev) => ({ ...prev, ArrowLeft: false }))
//                 }
//                 className="bg-gray-700 rounded p-2"
//               >
//                 ←
//               </button>
//               <div></div>
//               <button
//                 onTouchStart={() =>
//                   setKeys((prev) => ({ ...prev, ArrowRight: true }))
//                 }
//                 onTouchEnd={() =>
//                   setKeys((prev) => ({ ...prev, ArrowRight: false }))
//                 }
//                 className="bg-gray-700 rounded p-2"
//               >
//                 →
//               </button>
//               <div></div>
//               <button
//                 onTouchStart={() =>
//                   setKeys((prev) => ({ ...prev, ArrowDown: true }))
//                 }
//                 onTouchEnd={() =>
//                   setKeys((prev) => ({ ...prev, ArrowDown: false }))
//                 }
//                 className="bg-gray-700 rounded p-2"
//               >
//                 ↓
//               </button>
//               <div></div>
//             </div>
//           </div>
//
//           {gameState === "paused" && (
//             <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
//               <div className="bg-gray-800 p-8 rounded-lg text-center">
//                 <h2 className="text-3xl font-bold mb-4">게임 일시정지</h2>
//                 <div className="space-y-4">
//                   <button
//                     onClick={() => setGameState("playing")}
//                     className="block w-full px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold"
//                   >
//                     게임 계속
//                   </button>
//                   <button
//                     onClick={() => setGameState("character-select")}
//                     className="block w-full px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg font-bold"
//                   >
//                     캐릭터 선택으로
//                   </button>
//                 </div>
//                 <p className="text-sm text-gray-400 mt-4">
//                   조작법: 방향키 또는 WASD로 이동, 스페이스바로 일시정지
//                 </p>
//               </div>
//             </div>
//           )}
//         </>
//       )}
//
//       {gameState === "levelup" && (
//         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
//           <div className="bg-gray-800 p-8 rounded-lg">
//             <h2 className="text-3xl font-bold mb-6 text-center text-yellow-400">
//               <Crown className="w-8 h-8 inline-block mr-2" />
//               레벨 업! (Lv.{player.level})
//             </h2>
//             <p className="text-center mb-6 text-gray-300">
//               강화할 항목을 선택하세요
//             </p>
//
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               {levelUpOptions.map((option, index) => (
//                 <button
//                   key={index}
//                   onClick={() => selectLevelUpOption(option)}
//                   className="p-6 bg-gray-700 hover:bg-gray-600 rounded-lg border-2 border-transparent hover:border-yellow-400 transition-colors"
//                 >
//                   {option.type === "weapon" && (
//                     <>
//                       <div className="text-4xl mb-2">{option.weapon.icon}</div>
//                       <h3 className="text-xl font-bold mb-2 text-blue-400">
//                         {option.weapon.name}
//                       </h3>
//                       <p className="text-sm text-gray-300">새로운 무기</p>
//                       <p className="text-xs text-gray-400">
//                         피해: {option.weapon.damage} | 쿨다운:{" "}
//                         {option.weapon.cooldown}ms
//                       </p>
//                     </>
//                   )}
//
//                   {option.type === "upgrade" && (
//                     <>
//                       <div className="text-4xl mb-2">{option.weapon.icon}</div>
//                       <h3 className="text-xl font-bold mb-2 text-green-400">
//                         {option.weapon.name}
//                       </h3>
//                       <p className="text-sm text-gray-300">
//                         레벨 업 (Lv.{option.weapon.level} →{" "}
//                         {option.weapon.level + 1})
//                       </p>
//                       <p className="text-xs text-gray-400">
//                         피해량과 효과 증가
//                       </p>
//                     </>
//                   )}
//
//                   {option.type === "evolution" && (
//                     <>
//                       <div className="text-4xl mb-2">{option.weapon.icon}</div>
//                       <h3 className="text-xl font-bold mb-2 text-purple-400">
//                         {option.weapon.name}
//                       </h3>
//                       <p className="text-sm text-gray-300">진화!</p>
//                       <p className="text-xs text-gray-400">
//                         {option.baseWeapon.name}에서 진화
//                       </p>
//                     </>
//                   )}
//
//                   {option.type === "passive" && (
//                     <>
//                       <div className="text-4xl mb-2">{option.passive.icon}</div>
//                       <h3 className="text-xl font-bold mb-2 text-orange-400">
//                         {option.passive.name}
//                       </h3>
//                       <p className="text-sm text-gray-300">패시브 강화</p>
//                       <p className="text-xs text-gray-400">
//                         {option.passive.effect} +{option.passive.value}
//                       </p>
//                     </>
//                   )}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//
//       {gameState === "gameover" && (
//         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
//           <div className="bg-gray-800 p-8 rounded-lg text-center">
//             <Skull className="w-16 h-16 mx-auto mb-4 text-red-500" />
//             <h2 className="text-4xl font-bold mb-4 text-red-500">게임 오버</h2>
//
//             <div className="mb-6 space-y-2">
//               <p className="text-2xl">생존 시간: {formatTime(gameTime)}</p>
//               <p className="text-xl">최종 점수: {score.toLocaleString()}</p>
//               <p className="text-lg">도달 레벨: {player.level}</p>
//               <p className="text-md text-gray-400">
//                 처치한 적: {Math.floor(score / 30)}
//               </p>
//             </div>
//
//             <div className="space-y-4">
//               <button
//                 onClick={resetGame}
//                 className="block w-full px-6 py-3 bg-red-600 hover:bg-red-500 rounded-lg font-bold"
//               >
//                 다시 도전
//               </button>
//               <button
//                 onClick={() => setGameState("character-select")}
//                 className="block w-full px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg font-bold"
//               >
//                 캐릭터 선택
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//
//       {/* 게임 설명 */}
//       {gameState === "character-select" && (
//         <div className="mt-8 max-w-2xl text-center text-gray-400">
//           <h3 className="text-lg font-bold mb-2">게임 방법</h3>
//           <p className="mb-4">
//             30분 동안 살아남으세요! 적을 처치하여 경험치를 얻고 레벨업하여 더
//             강해지세요.
//           </p>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//             <div>
//               <h4 className="font-bold text-white mb-2">조작법</h4>
//               <ul className="space-y-1">
//                 <li>이동: 방향키 또는 WASD</li>
//                 <li>일시정지: 스페이스바</li>
//                 <li>공격: 자동 (가장 가까운 적)</li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="font-bold text-white mb-2">팁</h4>
//               <ul className="space-y-1">
//                 <li>경험치 오브를 수집하여 레벨업</li>
//                 <li>무기는 레벨 3에서 진화 가능</li>
//                 <li>패시브로 캐릭터 강화</li>
//                 <li>적이 시간이 지날수록 강해집니다</li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
