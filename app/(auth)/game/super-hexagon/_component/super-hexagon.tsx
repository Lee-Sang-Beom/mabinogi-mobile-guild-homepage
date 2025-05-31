// "use client";

// import { useEffect, useRef, useState } from "react";
// import Phaser from "phaser";
// import * as Tone from "tone";

// interface GameUser {
//   id: string;
//   docId: string;
// }

// interface GameProps {
//   user: GameUser;
// }

// export default function SuperHexagonGame({ user }: GameProps) {
//   const gameRef = useRef<HTMLDivElement>(null);
//   const phaserGameRef = useRef<Phaser.Game | null>(null);
//   const [gameStarted, setGameStarted] = useState(false);
//   const [score, setScore] = useState(0);
//   const [bestScore, setBestScore] = useState(0);
//   const [gameOver, setGameOver] = useState(false);

//   useEffect(() => {
//     // Load best score from localStorage
//     const saved = localStorage.getItem("super-hexagon-best");
//     if (saved) {
//       setBestScore(Number.parseInt(saved));
//     }
//   }, []);

//   const startGame = async () => {
//     if (phaserGameRef.current) {
//       phaserGameRef.current.destroy(true);
//     }

//     // Initialize Tone.js
//     await Tone.start();

//     setGameStarted(true);
//     setGameOver(false);
//     setScore(0);

//     const config: Phaser.Types.Core.GameConfig = {
//       type: Phaser.AUTO,
//       width: 800,
//       height: 600,
//       parent: gameRef.current!,
//       backgroundColor: "#000000",
//       physics: {
//         default: "arcade",
//         arcade: {
//           gravity: { x: 0, y: 0 },
//           debug: false,
//         },
//       },
//       scene: {
//         preload: preload,
//         create: create,
//         update: update,
//       },
//     };

//     phaserGameRef.current = new Phaser.Game(config);
//   };

//   const preload = function (this: Phaser.Scene) {
//     // Create simple colored rectangles for walls
//     this.add
//       .graphics()
//       .fillStyle(0xff0000)
//       .fillRect(0, 0, 1, 1)
//       .generateTexture("wall", 1, 1);
//     this.add
//       .graphics()
//       .fillStyle(0x00ff00)
//       .fillRect(0, 0, 1, 1)
//       .generateTexture("player", 1, 1);
//   };

//   const create = function (this: Phaser.Scene) {
//     const centerX = 400;
//     const centerY = 300;
//     const hexRadius = 80;

//     // Game state
//     const gameData = {
//       player: null as Phaser.GameObjects.Rectangle | null,
//       walls: [] as Phaser.GameObjects.Rectangle[],
//       playerAngle: 0,
//       gameSpeed: 1,
//       wallSpeed: 2,
//       spawnTimer: 0,
//       spawnInterval: 120,
//       gameTime: 0,
//       isGameOver: false,
//       cursors: null as Phaser.Types.Input.Keyboard.CursorKeys | null,
//       wasd: null as any,
//       hexagon: null as Phaser.GameObjects.Graphics | null,
//       centerPulse: 0,
//     };

//     // Create hexagon outline
//     gameData.hexagon = this.add.graphics();
//     drawHexagon(gameData.hexagon, centerX, centerY, hexRadius);

//     // Create player
//     gameData.player = this.add.rectangle(
//       centerX,
//       centerY - hexRadius + 10,
//       8,
//       8,
//       0x00ff00
//     );

//     // Input
//     gameData.cursors = this.input.keyboard!.createCursorKeys();
//     gameData.wasd = this.input.keyboard!.addKeys("W,S,A,D");

//     // Audio setup
//     const synth = new Tone.Synth().toDestination();
//     const bass = new Tone.FMSynth({
//       harmonicity: 0.5,
//       modulationIndex: 2,
//     }).toDestination();

//     // Background music pattern
//     const pattern = new Tone.Pattern(
//       (time, note) => {
//         bass.triggerAttackRelease(note, "8n", time);
//       },
//       ["C2", "E2", "G2", "C3"],
//       "up"
//     );

//     const melody = new Tone.Pattern(
//       (time, note) => {
//         synth.triggerAttackRelease(note, "16n", time);
//       },
//       ["C4", "E4", "G4", "C5", "G4", "E4"],
//       "upDown"
//     );

//     Tone.Transport.bpm.value = 140;
//     pattern.start(0);
//     melody.start(0);
//     Tone.Transport.start();

//     // Game update function
//     this.updateGame = () => {
//       if (gameData.isGameOver) return;

//       gameData.gameTime++;
//       setScore(Math.floor(gameData.gameTime / 60));

//       // Increase difficulty over time
//       gameData.gameSpeed = 1 + gameData.gameTime / 3600;
//       gameData.wallSpeed = 2 + gameData.gameTime / 1800;

//       // Player movement
//       if (gameData.cursors!.left.isDown || gameData.wasd.A.isDown) {
//         gameData.playerAngle -= 0.05 * gameData.gameSpeed;
//       }
//       if (gameData.cursors!.right.isDown || gameData.wasd.D.isDown) {
//         gameData.playerAngle += 0.05 * gameData.gameSpeed;
//       }

//       // Update player position
//       const playerX =
//         centerX + Math.cos(gameData.playerAngle) * (hexRadius - 10);
//       const playerY =
//         centerY + Math.sin(gameData.playerAngle) * (hexRadius - 10);
//       gameData.player!.setPosition(playerX, playerY);

//       // Spawn walls
//       gameData.spawnTimer++;
//       if (gameData.spawnTimer >= gameData.spawnInterval / gameData.gameSpeed) {
//         spawnWallPattern(this, gameData, centerX, centerY);
//         gameData.spawnTimer = 0;
//       }

//       // Update walls
//       gameData.walls.forEach((wall, index) => {
//         const angle = wall.getData("angle");
//         const distance =
//           wall.getData("distance") - gameData.wallSpeed * gameData.gameSpeed;
//         wall.setData("distance", distance);

//         if (distance < 0) {
//           wall.destroy();
//           gameData.walls.splice(index, 1);
//           return;
//         }

//         const wallX = centerX + Math.cos(angle) * distance;
//         const wallY = centerY + Math.sin(angle) * distance;
//         wall.setPosition(wallX, wallY);

//         // Collision detection
//         if (distance < hexRadius && distance > hexRadius - 20) {
//           const playerAngleNorm =
//             ((gameData.playerAngle % (Math.PI * 2)) + Math.PI * 2) %
//             (Math.PI * 2);
//           const wallAngleNorm =
//             ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
//           const angleDiff = Math.abs(playerAngleNorm - wallAngleNorm);
//           const minAngleDiff = Math.min(angleDiff, Math.PI * 2 - angleDiff);

//           if (minAngleDiff < 0.3) {
//             // Game over
//             gameData.isGameOver = true;
//             setGameOver(true);
//             Tone.Transport.stop();

//             // Update best score
//             const currentScore = Math.floor(gameData.gameTime / 60);
//             if (currentScore > bestScore) {
//               setBestScore(currentScore);
//               localStorage.setItem(
//                 "super-hexagon-best",
//                 currentScore.toString()
//               );
//             }

//             // Play game over sound
//             synth.triggerAttackRelease("C2", "4n");
//           }
//         }
//       });

//       // Update hexagon pulse effect
//       gameData.centerPulse = (gameData.centerPulse + 0.1) % (Math.PI * 2);
//       const pulseRadius = hexRadius + Math.sin(gameData.centerPulse) * 5;
//       gameData.hexagon!.clear();
//       drawHexagon(gameData.hexagon!, centerX, centerY, pulseRadius);

//       // Update background color based on time
//       const hue = (gameData.gameTime / 60) % 360;
//       const color = Phaser.Display.Color.HSVToRGB(hue / 360, 0.8, 0.3);
//       this.cameras.main.setBackgroundColor(color.color);
//     };

//     // Add update to scene
//     this.events.on("postupdate", this.updateGame);
//   };

//   const update = function (this: Phaser.Scene) {
//     // Update is handled in the postupdate event
//   };

//   const drawHexagon = (
//     graphics: Phaser.GameObjects.Graphics,
//     x: number,
//     y: number,
//     radius: number
//   ) => {
//     graphics.lineStyle(3, 0xffffff, 1);
//     graphics.beginPath();

//     for (let i = 0; i < 6; i++) {
//       const angle = (i * Math.PI) / 3;
//       const pointX = x + Math.cos(angle) * radius;
//       const pointY = y + Math.sin(angle) * radius;

//       if (i === 0) {
//         graphics.moveTo(pointX, pointY);
//       } else {
//         graphics.lineTo(pointX, pointY);
//       }
//     }

//     graphics.closePath();
//     graphics.strokePath();
//   };

//   const spawnWallPattern = (
//     scene: Phaser.Scene,
//     gameData: any,
//     centerX: number,
//     centerY: number
//   ) => {
//     const patterns = [
//       // Single gap
//       () => {
//         const gapAngle = Math.random() * Math.PI * 2;
//         const gapSize = 1.2;

//         for (let i = 0; i < 6; i++) {
//           const angle = (i * Math.PI) / 3;
//           const angleDiff = Math.abs(angle - gapAngle);
//           const minAngleDiff = Math.min(angleDiff, Math.PI * 2 - angleDiff);

//           if (minAngleDiff > gapSize / 2) {
//             createWall(scene, gameData, angle, centerX, centerY);
//           }
//         }
//       },
//       // Double gap
//       () => {
//         const gapAngle1 = Math.random() * Math.PI * 2;
//         const gapAngle2 = gapAngle1 + Math.PI;
//         const gapSize = 1.0;

//         for (let i = 0; i < 6; i++) {
//           const angle = (i * Math.PI) / 3;
//           const angleDiff1 = Math.abs(angle - gapAngle1);
//           const angleDiff2 = Math.abs(angle - gapAngle2);
//           const minAngleDiff1 = Math.min(angleDiff1, Math.PI * 2 - angleDiff1);
//           const minAngleDiff2 = Math.min(angleDiff2, Math.PI * 2 - angleDiff2);

//           if (minAngleDiff1 > gapSize / 2 && minAngleDiff2 > gapSize / 2) {
//             createWall(scene, gameData, angle, centerX, centerY);
//           }
//         }
//       },
//       // Alternating pattern
//       () => {
//         for (let i = 0; i < 6; i += 2) {
//           const angle = (i * Math.PI) / 3;
//           createWall(scene, gameData, angle, centerX, centerY);
//         }
//       },
//     ];

//     const pattern = patterns[Math.floor(Math.random() * patterns.length)];
//     pattern();
//   };

//   const createWall = (
//     scene: Phaser.Scene,
//     gameData: any,
//     angle: number,
//     centerX: number,
//     centerY: number
//   ) => {
//     const distance = 400;
//     const wallX = centerX + Math.cos(angle) * distance;
//     const wallY = centerY + Math.sin(angle) * distance;

//     const wall = scene.add.rectangle(wallX, wallY, 20, 60, 0xff0066);
//     wall.setRotation(angle + Math.PI / 2);
//     wall.setData("angle", angle);
//     wall.setData("distance", distance);

//     gameData.walls.push(wall);
//   };

//   const restartGame = () => {
//     if (phaserGameRef.current) {
//       phaserGameRef.current.destroy(true);
//     }
//     startGame();
//   };

//   useEffect(() => {
//     return () => {
//       if (phaserGameRef.current) {
//         phaserGameRef.current.destroy(true);
//       }
//       Tone.Transport.stop();
//     };
//   }, []);

//   if (!gameStarted) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center p-4">
//         <div className="bg-black/80 backdrop-blur-xl rounded-3xl border border-pink-500/30 shadow-2xl shadow-pink-500/20 p-12 max-w-2xl w-full text-center">
//           <div className="mb-8">
//             <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
//               SUPER HEXAGON
//             </h1>
//             <div className="w-32 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto rounded-full mb-6"></div>
//             <p className="text-xl text-gray-300 font-light">
//               회전하며 다가오는 벽들을 피하세요!
//             </p>
//           </div>

//           <div className="mb-8 space-y-4">
//             <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
//               <h3 className="text-lg font-bold text-white mb-2">🎮 조작법</h3>
//               <div className="text-gray-300 space-y-1">
//                 <p>← → 또는 A D: 좌우 회전</p>
//                 <p>벽 사이의 틈을 통과하세요!</p>
//               </div>
//             </div>

//             {bestScore > 0 && (
//               <div className="bg-yellow-900/30 rounded-xl p-4 border border-yellow-500/30">
//                 <h3 className="text-lg font-bold text-yellow-400 mb-2">
//                   🏆 최고 기록
//                 </h3>
//                 <p className="text-2xl font-bold text-white">{bestScore}초</p>
//               </div>
//             )}
//           </div>

//           <button
//             onClick={startGame}
//             className="group relative overflow-hidden bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 hover:from-pink-500 hover:via-purple-500 hover:to-cyan-500 text-white px-12 py-6 rounded-2xl font-bold text-2xl shadow-lg shadow-purple-500/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/40"
//           >
//             <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
//             <div className="relative flex items-center gap-3">
//               <span className="text-3xl">🎯</span>
//               <span>게임 시작</span>
//             </div>
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
//       {/* Game UI */}
//       <div className="absolute top-4 left-4 z-10 space-y-4">
//         <div className="bg-black/80 backdrop-blur-xl px-6 py-3 rounded-xl border border-cyan-500/30 shadow-lg">
//           <div className="flex items-center gap-3">
//             <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
//             <span className="text-cyan-400 font-medium">시간</span>
//             <span className="text-white font-bold text-xl">{score}초</span>
//           </div>
//         </div>

//         <div className="bg-black/80 backdrop-blur-xl px-6 py-3 rounded-xl border border-yellow-500/30 shadow-lg">
//           <div className="flex items-center gap-3">
//             <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
//             <span className="text-yellow-400 font-medium">최고</span>
//             <span className="text-white font-bold text-xl">{bestScore}초</span>
//           </div>
//         </div>
//       </div>

//       {/* Game Canvas */}
//       <div className="relative">
//         <div className="absolute -inset-2 bg-gradient-to-r from-pink-600/20 via-purple-600/20 to-cyan-600/20 rounded-xl blur-lg"></div>
//         <div
//           ref={gameRef}
//           className="relative border-2 border-purple-500/50 rounded-lg shadow-2xl"
//         />
//       </div>

//       {/* Game Over Screen */}
//       {gameOver && (
//         <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-20">
//           <div className="bg-gradient-to-br from-red-900/90 to-purple-900/90 backdrop-blur-xl rounded-3xl border border-red-500/30 shadow-2xl shadow-red-500/20 p-12 max-w-lg w-full text-center mx-4">
//             <div className="mb-8">
//               <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full mb-4 shadow-lg shadow-red-500/50">
//                 <span className="text-4xl">💥</span>
//               </div>
//               <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 mb-2">
//                 GAME OVER
//               </h2>
//               <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-orange-500 mx-auto rounded-full"></div>
//             </div>

//             <div className="space-y-4 mb-8">
//               <div className="bg-black/50 rounded-xl p-4 border border-gray-700/50">
//                 <div className="text-gray-400 text-sm mb-1">생존 시간</div>
//                 <div className="text-3xl font-bold text-white">{score}초</div>
//               </div>

//               {score === bestScore && score > 0 && (
//                 <div className="bg-yellow-900/30 rounded-xl p-4 border border-yellow-500/30">
//                   <div className="text-yellow-400 font-bold">
//                     🎉 새로운 기록!
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div className="flex gap-4">
//               <button
//                 onClick={restartGame}
//                 className="flex-1 group relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-6 py-4 rounded-xl font-bold shadow-lg shadow-green-500/30 transition-all duration-300 hover:scale-105"
//               >
//                 <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
//                 <div className="relative flex items-center justify-center gap-2">
//                   <span>🔄</span>
//                   <span>다시 시작</span>
//                 </div>
//               </button>

//               <button
//                 onClick={() => {
//                   setGameStarted(false);
//                   setGameOver(false);
//                   if (phaserGameRef.current) {
//                     phaserGameRef.current.destroy(true);
//                   }
//                 }}
//                 className="flex-1 group relative overflow-hidden bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-6 py-4 rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105"
//               >
//                 <div className="relative flex items-center justify-center gap-2">
//                   <span>🏠</span>
//                   <span>메뉴</span>
//                 </div>
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Instructions */}
//       <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
//         <div className="bg-black/80 backdrop-blur-xl px-6 py-3 rounded-xl border border-gray-500/30 shadow-lg">
//           <div className="text-gray-300 text-sm text-center">
//             ← → 또는 A D로 회전하여 벽을 피하세요!
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
