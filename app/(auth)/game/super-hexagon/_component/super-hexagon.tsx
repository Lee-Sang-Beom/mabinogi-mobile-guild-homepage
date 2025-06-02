"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as Phaser from "phaser";
import * as Tone from "tone";
import moment from "moment";
import type { GameProps } from "../../internal";
import { useCreateGame } from "../../hooks/use-create-game";
import { useGetGamesByGameType } from "../../hooks/use-get-games-by-game-type";
import type { GameCreateRequest } from "../../api";

// 게임 상수 - 점진적 난이도 증가 시스템
const GAME_CONFIG = {
  width: 800,
  height: 600,
  centerX: 400,
  centerY: 300,
  innerRadius: 35,
  playerRadius: 8,
  wallThickness: 25,
  // 난이도 단계별 설정
  difficulty: {
    // 초급 (0-15초)
    beginner: {
      wallSpeed: 2.5,
      spawnInterval: 140,
      wallCount: { min: 1, max: 2 },
      safeZoneMin: 3,
      rotationChance: 0.001,
    },
    // 중급 (15-45초)
    intermediate: {
      wallSpeed: 5,
      spawnInterval: 100,
      wallCount: { min: 1, max: 3 },
      safeZoneMin: 2,
      rotationChance: 0.004,
    },
    // 고급 (45-90초)
    advanced: {
      wallSpeed: 8,
      spawnInterval: 70,
      wallCount: { min: 2, max: 4 },
      safeZoneMin: 2,
      rotationChance: 0.007,
    },
    // 전문가 (90초+)
    expert: {
      wallSpeed: 12,
      spawnInterval: 50,
      wallCount: { min: 2, max: 4 },
      safeZoneMin: 1,
      rotationChance: 0.01,
    },
  },
  maxWallSpeed: 15,
  minSpawnInterval: 40,
  mazeSpawnInterval: 25,
  pulseFrequency: 3,
  pulseIntensity: 0.3,
  rotationDelay: 600, // 10초 지연
  // 3D 네온 효과 설정
  neon: {
    glowIntensity: 0.8,
    pulseSpeed: 0.05,
    shadowBlur: 15,
    outerGlow: 25,
    coreIntensity: 1.2,
  },
  // 회전 패턴들
  rotationPatterns: [
    {
      type: "short",
      durationRange: [25, 45],
      angle: Math.PI / 3,
      reverses: true,
    },
    {
      type: "medium",
      durationRange: [50, 90],
      angle: Math.PI,
      reverses: false,
    },
    {
      type: "long",
      durationRange: [90, 160],
      angle: Math.PI * 2,
      reverses: false,
    },
    {
      type: "ultra_fast",
      durationRange: [15, 30],
      angle: Math.PI / 2,
      reverses: true,
    },
  ],
  // 화면 흔들림 효과
  screenShake: {
    intensity: 3,
    frequency: 0.15,
  },
  // 벽 패턴 타입들
  wallPatterns: [
    "solo",
    "double_c",
    "triple_c",
    "double_spiral",
    "bat",
    "ladder",
    "multi_c",
    "spin_2",
    "spin_4",
    "stair_2",
    "mode_changer",
    "spiral_right",
    "spiral_left",
    "zigzag",
    "wave",
    "tunnel",
    // 새로 추가되는 패턴들
    "whirlpool", // 소용돌이 패턴
    "rain", // 비 패턴
    "double_turn", // 이중 회전 패턴
    "alternating", // 교차 패턴
    "pattern_321", // 3-2-1 패턴
    "stair_1", // 계단 1 패턴 (새로 추가)
    "mirror_spiral", // 미러 스파이럴
    "box_with_cap", // 뚜껑 있는 상자 패턴
  ],
  // 배경음 파일들
  backgroundTracks: ["/audios/super-hexagon.mp3", "/audios/hexagon.mp3"],
};

// 게임 씬 클래스
class GameScene extends Phaser.Scene {
  private gameData: any = {};
  private onScoreUpdate?: (score: number) => void;
  private onGameOver?: (score: number) => void;
  private backgroundMusic?: Tone.Player;
  private hitSound?: Tone.Synth;
  private moveSound?: Tone.Synth;
  private centerHexagon?: Phaser.GameObjects.Graphics;
  private debugGraphics?: Phaser.GameObjects.Graphics;
  private gameContainer?: Phaser.GameObjects.Container;
  private selectedTrack?: string;
  private backgroundGradient?: Phaser.GameObjects.Graphics;
  private neonEffects?: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: "GameScene" });
  }

  init(data: any) {
    this.onScoreUpdate = data.onScoreUpdate;
    this.onGameOver = data.onGameOver;
  }

  preload() {
    // 기본 텍스처 생성
    this.add
      .graphics()
      .fillStyle(0xffffff)
      .fillRect(0, 0, 1, 1)
      .generateTexture("white", 1, 1);
  }

  async create() {
    // Tone.js 초기화
    await Tone.start();

    // 네온 배경 설정
    this.setupNeonBackground();

    // 게임 컨테이너 생성
    this.gameContainer = this.add.container(
      GAME_CONFIG.centerX,
      GAME_CONFIG.centerY,
    );

    // 배경음 설정
    await this.setupAudio();

    // 디버그 그래픽
    this.debugGraphics = this.add.graphics();
    this.gameContainer.add(this.debugGraphics);

    // 게임 데이터 초기화
    this.initializeGameData();

    this.setupPlayer();
    this.setupInput();
    this.setupCenterHexagon();

    // 게임 루프 시작
    this.time.addEvent({
      delay: 16, // 60 FPS
      callback: this.updateGame,
      callbackScope: this,
      loop: true,
    });
  }

  private setupNeonBackground() {
    // 동적 네온 배경 그라디언트
    this.backgroundGradient = this.add.graphics();
    this.backgroundGradient.setDepth(-100);

    // 네온 효과용 그래픽
    this.neonEffects = this.add.graphics();
    this.neonEffects.setDepth(-50);
  }

  private async setupAudio() {
    // 랜덤 배경음 선택
    this.selectedTrack =
      GAME_CONFIG.backgroundTracks[
        Math.floor(Math.random() * GAME_CONFIG.backgroundTracks.length)
      ];

    try {
      this.backgroundMusic = new Tone.Player({
        url: this.selectedTrack,
        loop: true,
        volume: -12,
      }).toDestination();

      await this.backgroundMusic.load(this.selectedTrack);
      this.backgroundMusic.start();
    } catch (error) {
      console.warn("배경음 로드 실패:", error);
    }

    // 사운드 이펙트 설정
    this.hitSound = new Tone.Synth({
      oscillator: { type: "sawtooth" },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.2 },
    }).toDestination();

    this.moveSound = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.01, decay: 0.05, sustain: 0, release: 0.05 },
    }).toDestination();
    this.moveSound.volume.value = -25;
  }

  private initializeGameData() {
    this.gameData = {
      player: null,
      playerAngle: 0,
      walls: [],
      gameTime: 0,
      isGameOver: false,
      cursors: null,
      wasd: null,
      wallSpeed: GAME_CONFIG.difficulty.beginner.wallSpeed,
      spawnTimer: 0,
      spawnInterval: GAME_CONFIG.difficulty.beginner.spawnInterval,
      currentHue: 0,
      pulsePhase: 0,
      lastMoveTime: 0,
      cameraShake: 0,
      beatTime: 0,
      debug: false,
      // 터치 입력
      touchInput: {
        leftPressed: false,
        rightPressed: false,
      },
      // 화면 회전 관련
      isRotating: false,
      rotationDirection: 0,
      rotationTimer: 0,
      rotationStartDelay: GAME_CONFIG.rotationDelay,
      totalRotation: 0,
      currentRotationPattern: null,
      // 화면 효과
      screenShakeOffset: { x: 0, y: 0 },
      globalPulse: 0,
      neonPulse: 0,
      // 벽 패턴 관련
      currentWallPattern: "basic",
      patternProgress: 0,
      patternLength: 0,
      patternDirection: 0,
      patternPhase: 0,
      spinCount: 0,
      spinDirection: 1,
      stairSequence: [],
      stairIndex: 0,
      centerShape: "hexagon",
      centerShapeProgress: 0,
      isPatternMode: false,
      // 연속 방지 시스템
      lastSafeZones: [],
      lastPatterns: [],
      patternCounter: 0,
      consecutivePatternCount: 0,
      // 난이도 시스템
      currentDifficulty: "beginner",
      difficultyTransition: 0,
    };
  }

  private setupPlayer() {
    const { innerRadius, playerRadius } = GAME_CONFIG;

    // 네온 스타일 플레이어 생성
    this.gameData.player = this.add.graphics();
    this.gameData.player.setPosition(0, -(innerRadius + playerRadius + 8));

    // 컨테이너에 추가
    this.gameContainer?.add(this.gameData.player);
  }

  private setupInput() {
    this.gameData.cursors = this.input.keyboard?.createCursorKeys();
    this.gameData.wasd = this.input.keyboard?.addKeys("W,S,A,D");

    // 디버그 모드 토글 (스페이스바)
    this.input.keyboard?.on("keydown-SPACE", () => {
      this.gameData.debug = !this.gameData.debug;
      console.log("디버그 모드:", this.gameData.debug);
    });

    // 모바일 터치 입력 설정
    this.setupTouchInput();
  }

  private setupTouchInput() {
    const { width } = GAME_CONFIG;

    // 터치 시작
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (pointer.x < width / 2) {
        this.gameData.touchInput.leftPressed = true;
      } else {
        this.gameData.touchInput.rightPressed = true;
      }
    });

    // 터치 이동 (영역 변경 감지)
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown) {
        this.gameData.touchInput.leftPressed = pointer.x < width / 2;
        this.gameData.touchInput.rightPressed = pointer.x >= width / 2;
      }
    });

    // 터치 종료
    this.input.on("pointerup", () => {
      this.gameData.touchInput.leftPressed = false;
      this.gameData.touchInput.rightPressed = false;
    });
  }

  private setupCenterHexagon() {
    this.centerHexagon = this.add.graphics();
    this.gameContainer?.add(this.centerHexagon);
  }

  private updateGame() {
    if (this.gameData.isGameOver) return;

    this.gameData.gameTime++;
    const currentScore = Math.floor(this.gameData.gameTime / 60);

    if (this.onScoreUpdate) {
      this.onScoreUpdate(currentScore);
    }

    this.updateDifficulty();
    this.updateNeonBackground();
    this.updateVisuals();
    this.updateRotation();
    this.handleInput();
    this.updatePlayer();
    this.updateCenterHexagon();
    this.spawnWalls();
    this.updateWalls();

    if (this.gameData.debug) {
      this.updateDebugInfo();
    } else {
      this.debugGraphics?.clear();
    }
  }

  private updateDifficulty() {
    const timeInSeconds = this.gameData.gameTime / 60;
    const { difficulty } = GAME_CONFIG;

    let targetDifficulty = "beginner";
    let difficultyConfig = difficulty.beginner;

    if (timeInSeconds >= 90) {
      targetDifficulty = "expert";
      difficultyConfig = difficulty.expert;
    } else if (timeInSeconds >= 45) {
      targetDifficulty = "advanced";
      difficultyConfig = difficulty.advanced;
    } else if (timeInSeconds >= 15) {
      targetDifficulty = "intermediate";
      difficultyConfig = difficulty.intermediate;
    }

    // 부드러운 난이도 전환
    if (this.gameData.currentDifficulty !== targetDifficulty) {
      this.gameData.currentDifficulty = targetDifficulty;
      this.gameData.difficultyTransition = 0;

      if (this.gameData.debug) {
        console.log(
          `난이도 변경: ${targetDifficulty} (${timeInSeconds.toFixed(1)}초)`,
        );
      }
    }

    // 점진적 수치 조정
    const transitionSpeed = 0.02;
    this.gameData.difficultyTransition = Math.min(
      1,
      this.gameData.difficultyTransition + transitionSpeed,
    );

    // 현재 설정과 목표 설정 사이의 보간
    this.gameData.wallSpeed = Phaser.Math.Linear(
      this.gameData.wallSpeed,
      difficultyConfig.wallSpeed,
      transitionSpeed,
    );

    this.gameData.spawnInterval = Phaser.Math.Linear(
      this.gameData.spawnInterval,
      difficultyConfig.spawnInterval,
      transitionSpeed,
    );

    // 디버그 정보 (5초마다)
    if (this.gameData.debug && this.gameData.gameTime % 300 === 0) {
      console.log(
        `현재 난이도: ${targetDifficulty}, 벽속도: ${this.gameData.wallSpeed.toFixed(2)}, 생성간격: ${this.gameData.spawnInterval.toFixed(0)}`,
      );
    }
  }

  private updateNeonBackground() {
    if (!this.backgroundGradient || !this.neonEffects) return;

    this.gameData.neonPulse += GAME_CONFIG.neon.pulseSpeed;
    this.gameData.currentHue = (this.gameData.currentHue + 0.5) % 360;

    // 동적 배경 그라디언트
    this.backgroundGradient.clear();

    // 메인 배경 색상 (어두운 사이버 톤)
    const bgColor1 = Phaser.Display.Color.HSVToRGB(
      this.gameData.currentHue / 360,
      0.8,
      0.05,
    );

    // 방사형 그라디언트 효과
    for (let i = 0; i < 5; i++) {
      const radius = 100 + i * 80;
      const alpha = 0.3 - i * 0.05;
      const pulseOffset = Math.sin(this.gameData.neonPulse + i * 0.5) * 0.1;

      this.backgroundGradient.fillStyle(bgColor1.color, alpha + pulseOffset);
      this.backgroundGradient.fillCircle(
        GAME_CONFIG.centerX,
        GAME_CONFIG.centerY,
        radius,
      );
    }

    // 네온 링 효과
    this.neonEffects.clear();
    for (let i = 0; i < 3; i++) {
      const ringRadius = 150 + i * 100;
      const glowIntensity =
        Math.sin(this.gameData.neonPulse * 2 + (i * Math.PI) / 3) * 0.3 + 0.7;
      const ringColor = Phaser.Display.Color.HSVToRGB(
        (this.gameData.currentHue + i * 40) / 360,
        0.9,
        glowIntensity,
      );

      this.neonEffects.lineStyle(2, ringColor.color, 0.3);
      this.neonEffects.strokeCircle(
        GAME_CONFIG.centerX,
        GAME_CONFIG.centerY,
        ringRadius,
      );
    }

    // 전체 배경 색상 설정
    const mainBgColor = Phaser.Display.Color.HSVToRGB(
      this.gameData.currentHue / 360,
      0.9,
      0.02,
    );
    this.cameras.main.setBackgroundColor(mainBgColor.color);
  }

  private updateVisuals() {
    // 전체적인 화면 펄스 효과
    this.gameData.globalPulse += 0.08;
    const globalPulseIntensity = Math.sin(this.gameData.globalPulse) * 0.8;

    // 네온 스타일 화면 흔들림
    const { screenShake } = GAME_CONFIG;
    this.gameData.screenShakeOffset.x =
      (Math.random() - 0.5) * screenShake.intensity +
      globalPulseIntensity * 0.5;
    this.gameData.screenShakeOffset.y =
      (Math.random() - 0.5) * screenShake.intensity +
      globalPulseIntensity * 0.5;

    // 게임 컨테이너에 흔들림 적용
    if (this.gameContainer) {
      this.gameContainer.x =
        GAME_CONFIG.centerX + this.gameData.screenShakeOffset.x;
      this.gameContainer.y =
        GAME_CONFIG.centerY + this.gameData.screenShakeOffset.y;
    }

    // 카메라 흔들림 효과 (게임오버 시)
    if (this.gameData.cameraShake > 0) {
      this.cameras.main.shake(150, 0.02);
      this.gameData.cameraShake--;
    }
  }

  private updateRotation() {
    const currentDifficultyConfig =
      GAME_CONFIG.difficulty[
        this.gameData.currentDifficulty as keyof typeof GAME_CONFIG.difficulty
      ];

    // 시작 지연 시간 감소
    if (this.gameData.rotationStartDelay > 0) {
      this.gameData.rotationStartDelay--;
      return;
    }

    // 난이도에 따른 회전 확률
    if (
      !this.gameData.isRotating &&
      Math.random() < currentDifficultyConfig.rotationChance
    ) {
      this.gameData.isRotating = true;
      this.gameData.rotationDirection = Math.random() < 0.5 ? -1 : 1;

      const pattern =
        GAME_CONFIG.rotationPatterns[
          Math.floor(Math.random() * GAME_CONFIG.rotationPatterns.length)
        ];
      const minDuration = pattern.durationRange[0];
      const maxDuration = pattern.durationRange[1];
      const randomDuration =
        Math.floor(Math.random() * (maxDuration - minDuration + 1)) +
        minDuration;

      this.gameData.currentRotationPattern = {
        ...pattern,
        duration: randomDuration,
      };
      this.gameData.rotationTimer = randomDuration;

      if (this.gameData.debug) {
        console.log(`회전 시작: ${pattern.type} (${randomDuration}프레임)`);
      }
    }

    // 회전 실행
    if (this.gameData.isRotating && this.gameData.currentRotationPattern) {
      this.gameData.rotationTimer--;
      const pattern = this.gameData.currentRotationPattern;
      const progress = 1 - this.gameData.rotationTimer / pattern.duration;
      let currentAngle = 0;

      if (
        pattern.reverses &&
        (pattern.type === "short" || pattern.type === "ultra_fast")
      ) {
        if (progress < 0.5) {
          currentAngle =
            progress * 2 * pattern.angle * this.gameData.rotationDirection;
        } else {
          const reverseProgress = (progress - 0.5) * 2;
          currentAngle =
            (1 - reverseProgress) *
            pattern.angle *
            this.gameData.rotationDirection;
        }
      } else {
        currentAngle =
          progress * pattern.angle * this.gameData.rotationDirection;
      }

      if (this.gameContainer) {
        this.gameContainer.setRotation(
          this.gameData.totalRotation + currentAngle,
        );
      }

      if (this.gameData.rotationTimer <= 0) {
        this.gameData.isRotating = false;
        if (!pattern.reverses) {
          this.gameData.totalRotation =
            (this.gameData.totalRotation +
              pattern.angle * this.gameData.rotationDirection) %
            (Math.PI * 2);
        }
        if (this.gameContainer) {
          this.gameContainer.setRotation(this.gameData.totalRotation);
        }
      }
    }
  }

  private handleInput() {
    const { cursors, wasd, touchInput } = this.gameData;
    const currentTime = this.time.now;
    const moveSpeed = 0.13;

    let moved = false;

    // 키보드 입력
    if (cursors?.left.isDown || wasd?.A.isDown || touchInput.leftPressed) {
      this.gameData.playerAngle -= moveSpeed;
      moved = true;
    }
    if (cursors?.right.isDown || wasd?.D.isDown || touchInput.rightPressed) {
      this.gameData.playerAngle += moveSpeed;
      moved = true;
    }

    // 이동 사운드
    if (moved && currentTime - this.gameData.lastMoveTime > 80) {
      this.moveSound?.triggerAttackRelease("C6", "64n");
      this.gameData.lastMoveTime = currentTime;
    }
  }

  private updatePlayer() {
    const { innerRadius, playerRadius } = GAME_CONFIG;
    const { playerAngle } = this.gameData;

    if (!this.gameData.player) return;

    // 플레이어 위치 계산
    const playerDistance = innerRadius + playerRadius + 10;
    const playerX = Math.cos(playerAngle) * playerDistance;
    const playerY = Math.sin(playerAngle) * playerDistance;

    // 네온 스타일 플레이어 렌더링
    this.gameData.player.clear();

    // 플레이어 색상 (현재 색상의 보색)
    const playerHue = (this.gameData.currentHue + 180) % 360;
    const coreColor = Phaser.Display.Color.HSVToRGB(playerHue / 360, 1, 1);
    const glowColor = Phaser.Display.Color.HSVToRGB(playerHue / 360, 0.8, 0.6);

    // 외부 글로우
    this.gameData.player.fillStyle(glowColor.color, 0.3);
    this.gameData.player.fillTriangle(
      0,
      -playerRadius * 1.8,
      -playerRadius * 1.4,
      playerRadius * 1.2,
      playerRadius * 1.4,
      playerRadius * 1.2,
    );

    // 메인 삼각형
    this.gameData.player.fillStyle(coreColor.color, 1);
    this.gameData.player.fillTriangle(
      0,
      -playerRadius,
      -playerRadius * 0.8,
      playerRadius,
      playerRadius * 0.8,
      playerRadius,
    );

    // 네온 테두리
    this.gameData.player.lineStyle(2, coreColor.color, 1);
    this.gameData.player.strokeTriangle(
      0,
      -playerRadius,
      -playerRadius * 0.8,
      playerRadius,
      playerRadius * 0.8,
      playerRadius,
    );

    // 위치 및 회전 설정
    this.gameData.player.setPosition(playerX, playerY);
    this.gameData.player.setRotation(playerAngle + Math.PI / 2);
  }

  private updateCenterHexagon() {
    const { innerRadius, pulseFrequency, pulseIntensity } = GAME_CONFIG;

    if (!this.centerHexagon) return;

    this.gameData.beatTime += 0.02;
    const beatPhase = Math.sin(
      this.gameData.beatTime * Math.PI * 2 * pulseFrequency,
    );
    const scaleFactor = 1 + beatPhase * pulseIntensity;
    const currentRadius = innerRadius * scaleFactor;

    // 네온 스타일 중심 도형
    this.centerHexagon.clear();

    const centerColor = Phaser.Display.Color.HSVToRGB(
      this.gameData.currentHue / 360,
      0.9,
      0.9,
    );
    const glowColor = Phaser.Display.Color.HSVToRGB(
      this.gameData.currentHue / 360,
      0.7,
      0.5,
    );

    // 외부 글로우
    this.centerHexagon.lineStyle(8, glowColor.color, 0.4);
    this.drawCenterShape(this.centerHexagon, 0, 0, currentRadius + 4);

    // 메인 라인
    this.centerHexagon.lineStyle(3, centerColor.color, 1);
    this.drawCenterShape(this.centerHexagon, 0, 0, currentRadius);

    // 내부 글로우
    this.centerHexagon.lineStyle(1, 0xffffff, 0.8);
    this.drawCenterShape(this.centerHexagon, 0, 0, currentRadius - 2);
  }

  private drawCenterShape(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    radius: number,
  ) {
    let sides = 6;
    switch (this.gameData.centerShape) {
      case "pentagon":
        sides = 5;
        break;
      case "square":
        sides = 4;
        break;
      case "hexagon":
      default:
        sides = 6;
        break;
    }

    graphics.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = (i * Math.PI * 2) / sides;
      const pointX = x + Math.cos(angle) * radius;
      const pointY = y + Math.sin(angle) * radius;

      if (i === 0) {
        graphics.moveTo(pointX, pointY);
      } else {
        graphics.lineTo(pointX, pointY);
      }
    }
    graphics.closePath();
    graphics.strokePath();
  }

  private spawnWalls() {
    this.gameData.spawnTimer++;
    const currentInterval = this.gameData.isPatternMode
      ? GAME_CONFIG.mazeSpawnInterval
      : this.gameData.spawnInterval;

    if (this.gameData.spawnTimer >= currentInterval) {
      this.createWallRing();
      this.gameData.spawnTimer = 0;
    }
  }

  private createWallRing() {
    const startRadius = 450;
    const wallPattern = this.generateWallPattern();

    const wallRing = this.add.graphics();
    this.gameContainer?.add(wallRing);

    wallRing.setData("radius", startRadius);
    wallRing.setData("wallPattern", [...wallPattern]);
    wallRing.setData("originalPattern", [...wallPattern]);
    wallRing.setData("collisionChecked", false);
    wallRing.setData("wallId", Date.now() + Math.random());

    this.updateWallRing(wallRing);
    this.gameData.walls.push(wallRing);
  }

  private generateWallPattern(): boolean[] {
    const timeInSeconds = this.gameData.gameTime / 60;
    const difficultyFactor = Math.min(timeInSeconds / 30, 1);
    const patternChance = 0.15 + difficultyFactor * 0.25;

    if (!this.gameData.isPatternMode && Math.random() < patternChance) {
      this.startNewPattern();
    }

    if (this.gameData.isPatternMode) {
      return this.generatePatternWalls();
    } else {
      return this.generateBasicWalls();
    }
  }

  private startNewPattern() {
    const timeInSeconds = this.gameData.gameTime / 60;

    // 시간대별 사용 가능한 패턴 정의
    let availablePatterns: string[] = [];

    if (timeInSeconds < 10) {
      // 0-10초: 초급 패턴만
      availablePatterns = ["solo", "double_c", "stair_1"];
    } else if (timeInSeconds < 25) {
      // 10-25초: 초급 + 중급 패턴
      availablePatterns = [
        "solo",
        "double_c",
        "triple_c",
        "stair_1",
        "stair_2",
        "ladder",
        "alternating",
        "bat",
      ];
    } else if (timeInSeconds < 45) {
      // 25-45초: 중급 + 고급 패턴
      availablePatterns = [
        "double_c",
        "triple_c",
        "double_spiral",
        "bat",
        "ladder",
        "multi_c",
        "spin_2",
        "alternating",
        "pattern_321",
        "spiral_right",
        "spiral_left",
        "zigzag",
        "wave",
      ];
    } else if (timeInSeconds < 75) {
      // 45-75초: 고급 패턴
      availablePatterns = [
        "triple_c",
        "double_spiral",
        "multi_c",
        "spin_2",
        "spin_4",
        "whirlpool",
        "rain",
        "double_turn",
        "mirror_spiral",
        "spiral_right",
        "spiral_left",
        "zigzag",
        "wave",
        "tunnel",
      ];
    } else {
      // 75초+: 모든 패턴 (최고 난이도)
      availablePatterns = GAME_CONFIG.wallPatterns;
    }

    // 연속 패턴 방지 (최대 2회)
    if (this.gameData.consecutivePatternCount >= 2) {
      availablePatterns = availablePatterns.filter(
        (pattern) => pattern !== this.gameData.currentWallPattern,
      );
      this.gameData.consecutivePatternCount = 0;
    }

    const selectedPattern =
      availablePatterns[Math.floor(Math.random() * availablePatterns.length)];

    if (selectedPattern === this.gameData.currentWallPattern) {
      this.gameData.consecutivePatternCount++;
    } else {
      this.gameData.consecutivePatternCount = 1;
    }

    this.gameData.currentWallPattern = selectedPattern;
    this.gameData.isPatternMode = true;
    this.gameData.patternProgress = 0;
    this.gameData.patternDirection = Math.floor(Math.random() * 6);

    // 패턴 길이 설정 (기존 코드와 동일)
    const patternLengths: { [key: string]: [number, number] } = {
      solo: [4, 8],
      double_c: [6, 10],
      triple_c: [8, 12],
      double_spiral: [10, 15],
      bat: [4, 8],
      ladder: [6, 10],
      multi_c: [8, 15],
      spin_2: [8, 8],
      spin_4: [16, 16],
      stair_2: [5, 7],
      mode_changer: [10, 20],
      whirlpool: [12, 21],
      rain: [8, 15],
      double_turn: [10, 21],
      alternating: [8, 15],
      pattern_321: [18, 18],
      stair_1: [6, 13],
      mirror_spiral: [10, 21],
      box_with_cap: [8, 17],
    };

    const [min, max] = patternLengths[selectedPattern] || [6, 12];

    switch (selectedPattern) {
      case "whirlpool":
        this.gameData.patternLength = Math.floor(Math.random() * 10) + 12; // 12-21
        break;
      case "rain":
        this.gameData.patternLength = Math.floor(Math.random() * 8) + 8; // 8-15
        break;
      case "double_turn":
        this.gameData.patternLength = Math.floor(Math.random() * 12) + 10; // 10-21
        break;
      case "alternating":
        this.gameData.patternLength = Math.floor(Math.random() * 8) + 8; // 8-15
        break;
      case "pattern_321":
        this.gameData.patternLength = 18; // 고정 길이 (3+2+1) * 3 사이클
        break;
      case "stair_1":
        this.gameData.patternLength = Math.floor(Math.random() * 8) + 6; // 6-13
        break;
      case "mirror_spiral":
        this.gameData.patternLength = Math.floor(Math.random() * 12) + 10; // 10-21
        break;
      case "box_with_cap":
        this.gameData.patternLength = Math.floor(Math.random() * 10) + 8; // 8-17
        break;
      default:
        this.gameData.patternLength =
          Math.floor(Math.random() * (max - min + 1)) + min;
        break;
    }

    if (this.gameData.debug) {
      console.log(
        `패턴 시작: ${selectedPattern} (${timeInSeconds.toFixed(1)}초, 연속: ${this.gameData.consecutivePatternCount})`,
      );
    }
  }

  private generatePatternWalls(): boolean[] {
    const pattern = new Array(6).fill(true);
    let safeZones: number[] = [];

    // 패턴별 안전지대 생성 로직 (기존과 동일)
    switch (this.gameData.currentWallPattern) {
      case "solo":
        safeZones = [this.gameData.patternDirection];
        break;
      case "double_c":
        const basePos =
          (this.gameData.patternDirection + this.gameData.patternProgress) % 6;
        safeZones = [basePos, (basePos + 1) % 6, (basePos + 2) % 6];
        break;
      // ... 다른 패턴들도 동일하게 구현
      case "whirlpool":
        safeZones = this.generateWhirlpoolPattern();
        break;
      case "rain":
        safeZones = this.generateRainPattern();
        break;
      case "double_turn":
        safeZones = this.generateDoubleTurnPattern();
        break;
      case "alternating":
        safeZones = this.generateAlternatingPattern();
        break;
      case "pattern_321":
        safeZones = this.generatePattern321();
        break;
      case "stair_1":
        safeZones = this.generateStair1Pattern();
        break;
      case "mirror_spiral":
        safeZones = this.generateMirrorSpiralPattern();
        break;
      case "box_with_cap":
        safeZones = this.generateBoxWithCapPattern();
        break;
      default:
        safeZones = [this.gameData.patternDirection];
    }

    safeZones.forEach((zone) => {
      if (zone >= 0 && zone < 6) {
        pattern[zone] = false;
      }
    });

    this.gameData.patternProgress++;
    if (this.gameData.patternProgress >= this.gameData.patternLength) {
      this.gameData.isPatternMode = false;
    }

    return pattern;
  }

  private generateBasicWalls(): boolean[] {
    const pattern = new Array(6).fill(false);
    const currentDifficultyConfig =
      GAME_CONFIG.difficulty[
        this.gameData.currentDifficulty as keyof typeof GAME_CONFIG.difficulty
      ];

    // 난이도에 따른 벽 개수 및 안전지대 설정
    const wallCount =
      Math.floor(
        Math.random() *
          (currentDifficultyConfig.wallCount.max -
            currentDifficultyConfig.wallCount.min +
            1),
      ) + currentDifficultyConfig.wallCount.min;
    const minSafeZones = currentDifficultyConfig.safeZoneMin;

    let availablePositions = [0, 1, 2, 3, 4, 5];

    // 연속 방지 로직
    if (this.gameData.lastSafeZones.length > 0) {
      const recentSafeZones = this.gameData.lastSafeZones;
      const forbiddenPositions = new Set<number>();

      recentSafeZones.forEach((recentZone: number) => {
        forbiddenPositions.add(recentZone);
        if (
          this.gameData.currentDifficulty === "beginner" ||
          this.gameData.currentDifficulty === "intermediate"
        ) {
          forbiddenPositions.add((recentZone - 1 + 6) % 6);
          forbiddenPositions.add((recentZone + 1) % 6);
        }
      });

      availablePositions = availablePositions.filter(
        (pos) => !forbiddenPositions.has(pos),
      );
    }

    // 최소 안전지대 보장
    if (availablePositions.length < minSafeZones) {
      availablePositions = [0, 1, 2, 3, 4, 5];
    }

    const wallsToPlace = Math.min(
      wallCount,
      Math.max(0, availablePositions.length - minSafeZones),
    );

    for (let i = 0; i < wallsToPlace; i++) {
      if (availablePositions.length <= minSafeZones) break;

      const randomIndex = Math.floor(Math.random() * availablePositions.length);
      const position = availablePositions[randomIndex];
      pattern[position] = true;
      availablePositions.splice(randomIndex, 1);
    }

    // 안전지대 기록
    const newSafeZones = [];
    for (let i = 0; i < 6; i++) {
      if (!pattern[i]) {
        newSafeZones.push(i);
      }
    }

    if (newSafeZones.length > 0) {
      this.gameData.lastSafeZones.push(newSafeZones[0]);
      if (this.gameData.lastSafeZones.length > 3) {
        this.gameData.lastSafeZones.shift();
      }
    }

    return pattern;
  }

  private updateWallRing(wallRing: Phaser.GameObjects.Graphics) {
    const { wallThickness } = GAME_CONFIG;
    const radius = wallRing.getData("radius");
    const wallPattern = wallRing.getData("wallPattern");

    if (
      !wallPattern ||
      !Array.isArray(wallPattern) ||
      wallPattern.length !== 6
    ) {
      wallRing.destroy();
      return;
    }

    wallRing.clear();

    // 거리에 따른 원근감 및 네온 효과 계산
    const distanceFromCenter = Math.abs(radius - 200);
    const perspectiveFactor = Math.max(
      0.3,
      1 - (distanceFromCenter / 400) * 0.7,
    );
    const currentThickness = wallThickness * perspectiveFactor;

    // 네온 색상 계산
    const wallHue = (this.gameData.currentHue + 30) % 360;
    const coreColor = Phaser.Display.Color.HSVToRGB(
      wallHue / 360,
      0.9,
      perspectiveFactor,
    );
    const glowColor = Phaser.Display.Color.HSVToRGB(
      wallHue / 360,
      0.7,
      perspectiveFactor * 0.6,
    );

    // 6개의 육각형 변을 네온 스타일로 그리기
    for (let i = 0; i < 6; i++) {
      if (wallPattern[i]) {
        const segmentStartAngle = (i * Math.PI) / 3;
        const segmentEndAngle = ((i + 1) * Math.PI) / 3;

        // 외부 및 내부 좌표
        const outerStartX = Math.cos(segmentStartAngle) * radius;
        const outerStartY = Math.sin(segmentStartAngle) * radius;
        const outerEndX = Math.cos(segmentEndAngle) * radius;
        const outerEndY = Math.sin(segmentEndAngle) * radius;

        const innerRadius = radius - currentThickness;
        const innerStartX = Math.cos(segmentStartAngle) * innerRadius;
        const innerStartY = Math.sin(segmentStartAngle) * innerRadius;
        const innerEndX = Math.cos(segmentEndAngle) * innerRadius;
        const innerEndY = Math.sin(segmentEndAngle) * innerRadius;

        // 외부 글로우 (가장 넓은 범위)
        wallRing.fillStyle(glowColor.color, 0.2);
        wallRing.beginPath();
        wallRing.moveTo(outerStartX + 6, outerStartY + 6);
        wallRing.lineTo(outerEndX + 6, outerEndY + 6);
        wallRing.lineTo(innerEndX + 6, innerEndY + 6);
        wallRing.lineTo(innerStartX + 6, innerStartY + 6);
        wallRing.closePath();
        wallRing.fillPath();

        // 중간 글로우
        wallRing.fillStyle(glowColor.color, 0.4);
        wallRing.beginPath();
        wallRing.moveTo(outerStartX + 3, outerStartY + 3);
        wallRing.lineTo(outerEndX + 3, outerEndY + 3);
        wallRing.lineTo(innerEndX + 3, innerEndY + 3);
        wallRing.lineTo(innerStartX + 3, innerStartY + 3);
        wallRing.closePath();
        wallRing.fillPath();

        // 메인 벽 면
        wallRing.fillStyle(coreColor.color, 0.9);
        wallRing.beginPath();
        wallRing.moveTo(outerStartX, outerStartY);
        wallRing.lineTo(outerEndX, outerEndY);
        wallRing.lineTo(innerEndX, innerEndY);
        wallRing.lineTo(innerStartX, innerStartY);
        wallRing.closePath();
        wallRing.fillPath();

        // 네온 테두리 (외부)
        wallRing.lineStyle(2, coreColor.color, 1);
        wallRing.beginPath();
        wallRing.moveTo(outerStartX, outerStartY);
        wallRing.lineTo(outerEndX, outerEndY);
        wallRing.strokePath();

        // 내부 하이라이트
        wallRing.lineStyle(1, 0xffffff, 0.8);
        wallRing.beginPath();
        wallRing.moveTo(innerStartX, innerStartY);
        wallRing.lineTo(innerEndX, innerEndY);
        wallRing.strokePath();
      }
    }
  }

  private updateWalls() {
    const { innerRadius } = GAME_CONFIG;

    for (let i = this.gameData.walls.length - 1; i >= 0; i--) {
      const wall = this.gameData.walls[i];

      if (!wall || !wall.active) {
        this.gameData.walls.splice(i, 1);
        continue;
      }

      const currentRadius = wall.getData("radius");
      const newRadius = currentRadius - this.gameData.wallSpeed;

      if (newRadius < innerRadius - 20) {
        wall.destroy();
        this.gameData.walls.splice(i, 1);
        continue;
      }

      wall.setData("radius", newRadius);
      this.updateWallRing(wall);

      // 충돌 검사
      const playerDistance = innerRadius + 15;
      if (Math.abs(newRadius - playerDistance) < 5) {
        if (!wall.getData("collisionChecked")) {
          if (this.checkCollision(wall)) {
            this.triggerGameOver();
            return;
          }
          wall.setData("collisionChecked", true);
        }
      } else {
        wall.setData("collisionChecked", false);
      }
    }
  }

  private checkCollision(wall: Phaser.GameObjects.Graphics): boolean {
    const { playerAngle } = this.gameData;
    const wallPattern = wall.getData("wallPattern");

    if (
      !wallPattern ||
      !Array.isArray(wallPattern) ||
      wallPattern.length !== 6
    ) {
      return false;
    }

    const normalizeAngle = (angle: number) => {
      let normalized = angle % (Math.PI * 2);
      if (normalized < 0) normalized += Math.PI * 2;
      return normalized;
    };

    const normalizedPlayerAngle = normalizeAngle(playerAngle);
    const segmentIndex = Math.floor(normalizedPlayerAngle / (Math.PI / 3));
    const clampedSegmentIndex = Math.max(0, Math.min(5, segmentIndex));

    return wallPattern[clampedSegmentIndex];
  }

  private updateDebugInfo() {
    if (!this.debugGraphics) return;

    const { innerRadius } = GAME_CONFIG;
    this.debugGraphics.clear();

    // 플레이어 위치 표시
    const playerDistance = innerRadius + 15;
    const playerAngle = this.gameData.playerAngle;
    const playerX = Math.cos(playerAngle) * playerDistance;
    const playerY = Math.sin(playerAngle) * playerDistance;

    this.debugGraphics.fillStyle(0xff0000, 0.7);
    this.debugGraphics.fillCircle(playerX, playerY, 8);

    // 플레이어 세그먼트 하이라이트
    const normalizeAngle = (angle: number) => {
      let normalized = angle % (Math.PI * 2);
      if (normalized < 0) normalized += Math.PI * 2;
      return normalized;
    };

    const normalizedPlayerAngle = normalizeAngle(playerAngle);
    const segmentIndex = Math.floor(normalizedPlayerAngle / (Math.PI / 3));
    const clampedSegmentIndex = Math.max(0, Math.min(5, segmentIndex));

    const segmentStartAngle = clampedSegmentIndex * (Math.PI / 3);
    const segmentEndAngle = (clampedSegmentIndex + 1) * (Math.PI / 3);

    this.debugGraphics.lineStyle(4, 0x00ff00, 0.8);
    this.debugGraphics.beginPath();
    this.debugGraphics.arc(
      0,
      0,
      playerDistance,
      segmentStartAngle,
      segmentEndAngle,
    );
    this.debugGraphics.strokePath();

    // 터치 영역 표시
    if (
      this.gameData.touchInput.leftPressed ||
      this.gameData.touchInput.rightPressed
    ) {
      this.debugGraphics.fillStyle(0xffff00, 0.3);
      if (this.gameData.touchInput.leftPressed) {
        this.debugGraphics.fillRect(
          -GAME_CONFIG.centerX,
          -GAME_CONFIG.centerY,
          GAME_CONFIG.width / 2,
          GAME_CONFIG.height,
        );
      }
      if (this.gameData.touchInput.rightPressed) {
        this.debugGraphics.fillRect(
          0,
          -GAME_CONFIG.centerY,
          GAME_CONFIG.width / 2,
          GAME_CONFIG.height,
        );
      }
    }
  }

  private triggerGameOver() {
    this.gameData.isGameOver = true;
    this.gameData.cameraShake = 15;

    // 강화된 게임오버 사운드
    this.hitSound?.triggerAttackRelease("C1", "2n");

    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
    }

    const finalScore = Math.floor(this.gameData.gameTime / 60);
    if (this.onGameOver) {
      this.onGameOver(finalScore);
    }
  }

  destroy() {
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
      this.backgroundMusic.dispose();
    }
    if (this.hitSound) {
      this.hitSound.dispose();
    }
    if (this.moveSound) {
      this.moveSound.dispose();
    }
    Tone.Transport.stop();
  }

  private generateWhirlpoolPattern(): number[] {
    // 소용돌이 패턴: 회전 방향에 따라 벽이 소용돌이처럼 등장
    const progress = this.gameData.patternProgress;
    const whirlDirection = this.gameData.spinDirection;
    const basePosition = this.gameData.patternDirection;

    // 소용돌이 속도 (점점 빨라짐)
    const whirlSpeed = Math.floor(progress / 3) + 1;
    const currentPosition =
      (basePosition + progress * whirlSpeed * whirlDirection) % 6;

    return [currentPosition, (currentPosition + 3) % 6]; // 대각선 위치에 안전지대
  }

  private generateRainPattern(): number[] {
    // 비 패턴: 벽이 위에서 아래로 떨어지는 형태
    const progress = this.gameData.patternProgress;
    const rainSpeed = 2; // 빠른 반응 속도 요구

    // 여러 개의 "빗방울"이 다른 속도로 떨어짐
    const drop1 = (this.gameData.patternDirection + progress * rainSpeed) % 6;
    const drop2 =
      (this.gameData.patternDirection +
        2 +
        Math.floor(progress * rainSpeed * 0.7)) %
      6;
    const drop3 =
      (this.gameData.patternDirection +
        4 +
        Math.floor(progress * rainSpeed * 1.3)) %
      6;

    // 빗방울 사이의 안전지대
    const allPositions = [0, 1, 2, 3, 4, 5];
    const rainPositions = [drop1, drop2, drop3];
    return allPositions.filter((pos) => !rainPositions.includes(pos));
  }

  private generateDoubleTurnPattern(): number[] {
    // 이중 회전 패턴: 연속적인 회전을 요구
    const progress = this.gameData.patternProgress;
    const cycleLength = 8;
    const cyclePosition = progress % cycleLength;

    let direction1 = this.gameData.spinDirection;
    let direction2 = -this.gameData.spinDirection;

    if (cyclePosition < 2) {
      // 첫 번째 회전
      direction1 = this.gameData.spinDirection;
      direction2 = 0;
    } else if (cyclePosition < 4) {
      // 정지
      direction1 = 0;
      direction2 = 0;
    } else if (cyclePosition < 6) {
      // 두 번째 회전 (반대 방향)
      direction1 = 0;
      direction2 = -this.gameData.spinDirection;
    } else {
      // 정지
      direction1 = 0;
      direction2 = 0;
    }

    const basePosition = this.gameData.patternDirection;
    const offset1 = Math.floor(progress / 2) * direction1;
    const offset2 = Math.floor(progress / 2) * direction2;

    const safeZone1 = (basePosition + offset1 + 6) % 6;
    const safeZone2 = (basePosition + offset2 + 6) % 6;

    return [safeZone1, safeZone2].filter(
      (zone, index, arr) => arr.indexOf(zone) === index,
    );
  }

  private generateAlternatingPattern(): number[] {
    // 교차 패턴: 좌우로 교차하는 벽
    const progress = this.gameData.patternProgress;
    const basePosition = this.gameData.patternDirection;

    if (progress % 4 < 2) {
      // 왼쪽으로 이동
      return [(basePosition - 1 + 6) % 6, (basePosition - 2 + 6) % 6];
    } else {
      // 오른쪽으로 이동
      return [(basePosition + 1) % 6, (basePosition + 2) % 6];
    }
  }

  private generatePattern321(): number[] {
    // 3-2-1 패턴: 세 번, 두 번, 한 번의 연속적인 이동
    const progress = this.gameData.patternProgress;
    const cycleLength = 6; // 3+2+1
    const cyclePosition = progress % cycleLength;

    const basePosition = this.gameData.patternDirection;
    let moveCount = 0;

    if (cyclePosition < 3) {
      moveCount = 3; // 3번 이동
    } else if (cyclePosition < 5) {
      moveCount = 2; // 2번 이동
    } else {
      moveCount = 1; // 1번 이동
    }

    const safeZones = [];
    for (let i = 0; i < moveCount; i++) {
      safeZones.push((basePosition + i) % 6);
    }

    return safeZones;
  }

  private generateStair1Pattern(): number[] {
    // 계단 1 패턴: 일정한 간격으로 계단 형태
    const progress = this.gameData.patternProgress;
    const basePosition = this.gameData.patternDirection;

    // 간단한 계단 (한 칸씩 이동)
    const stairStep = Math.floor(progress / 2) % 6;
    return [(basePosition + stairStep) % 6];
  }

  private generateMirrorSpiralPattern(): number[] {
    // 미러 스파이럴: 양쪽에서 대칭적으로 나선형
    const progress = this.gameData.patternProgress;
    const basePosition = this.gameData.patternDirection;

    // 두 개의 대칭 나선
    const spiral1 = (basePosition + Math.floor(progress / 2)) % 6;
    const spiral2 = (basePosition - Math.floor(progress / 2) + 6) % 6;

    // 나선 사이의 안전지대
    const midPoint1 = (spiral1 + 2) % 6;
    const midPoint2 = (spiral2 + 2) % 6;

    return [midPoint1, midPoint2].filter(
      (zone, index, arr) => arr.indexOf(zone) === index,
    );
  }

  private generateBoxWithCapPattern(): number[] {
    // 뚜껑 있는 상자 패턴: C자 형태 뒤에 막대기
    const progress = this.gameData.patternProgress;
    const basePosition = this.gameData.patternDirection;

    if (progress % 6 < 3) {
      // C자 형태 (3칸 열린 공간)
      return [basePosition, (basePosition + 1) % 6, (basePosition + 2) % 6];
    } else {
      // 뚜껑 (막대기) - 더 좁은 공간
      return [basePosition];
    }
  }
}

export default function SuperHexagon({ user }: GameProps) {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // API Hooks
  const createGameMutation = useCreateGame();
  const { data: rankingData, refetch: refetchRanking } =
    useGetGamesByGameType("super_hexagon");

  useEffect(() => {
    if (!rankingData || !rankingData.data) {
      setBestScore(0);
      return;
    }

    const savedMyData = rankingData.data.find(
      (item) => user.docId === item.userDocId,
    );
    setBestScore(savedMyData?.score || 0);
    setIsLoading(false);
  }, [rankingData]);

  const saveScore = useCallback(
    async (finalScore: number) => {
      try {
        let rank = 1;
        if (rankingData?.success && rankingData.data) {
          rank =
            rankingData.data.filter((game) => game.score > finalScore).length +
            1;
        }

        const postData: GameCreateRequest = {
          gameType: "super_hexagon",
          score: finalScore,
          rank: rank,
          userDocId: user.docId,
          userId: user.id,
          regDt: moment().format("YYYY-MM-DD"),
        };

        await createGameMutation.mutateAsync(postData);
        await refetchRanking();
      } catch (error) {
        console.error("점수 저장 실패:", error);
      }
    },
    [rankingData, createGameMutation, refetchRanking, user],
  );

  const startGame = async () => {
    if (phaserGameRef.current) {
      phaserGameRef.current.destroy(true);
    }

    setGameStarted(true);
    setGameOver(false);
    setScore(0);

    setTimeout(() => {
      if (!gameRef.current) return;

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: GAME_CONFIG.width,
        height: GAME_CONFIG.height,
        parent: gameRef.current,
        backgroundColor: "#000000",
        scene: GameScene,
        physics: {
          default: "arcade",
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false,
          },
        },
      };

      try {
        phaserGameRef.current = new Phaser.Game(config);

        phaserGameRef.current.scene.start("GameScene", {
          onScoreUpdate: (newScore: number) => setScore(newScore),
          onGameOver: (finalScore: number) => {
            setGameOver(true);
            if (finalScore > bestScore) {
              setBestScore(finalScore);
            }
            saveScore(finalScore);
          },
        });
      } catch (error) {
        console.error("Phaser 게임 초기화 실패:", error);
      }
    }, 100);
  };

  const restartGame = () => {
    if (phaserGameRef.current) {
      phaserGameRef.current.destroy(true);
    }
    startGame();
  };

  useEffect(() => {
    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
      }
    };
  }, []);

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
          🏆 슈퍼 헥사곤 랭킹 TOP 10
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
                  {game.score}초
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 border-4 border-pink-500/30 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-32 h-32 border-4 border-t-pink-500 rounded-full animate-spin"></div>
            <div className="absolute inset-4 w-24 h-24 border-4 border-purple-500/30 rounded-full animate-spin-reverse"></div>
            <div className="absolute inset-8 w-16 h-16 border-4 border-t-purple-500 rounded-full animate-spin-reverse"></div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 animate-pulse">
            SUPER HEXAGON
          </h2>
          <p className="text-pink-300 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* 네온 배경 효과 */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping shadow-lg shadow-cyan-400/50"></div>
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-purple-400 rounded-full animate-ping delay-300 shadow-lg shadow-purple-400/50"></div>
          <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-pink-400 rounded-full animate-ping delay-700 shadow-lg shadow-pink-400/50"></div>
          <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-emerald-400 rounded-full animate-ping delay-1000 shadow-lg shadow-emerald-400/50"></div>

          {/* 네온 그라디언트 배경 */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-purple-500/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 게임 시작 섹션 */}
          <div className="bg-black/90 backdrop-blur-xl rounded-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 p-8 text-center relative overflow-hidden">
            {/* 내부 네온 효과 */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl"></div>

            <div className="relative z-10 mb-6">
              {/* 네온 스타일 육각형 로고 */}
              <div className="relative mx-auto w-24 h-24 mb-4">
                <div
                  className="absolute inset-0 border-4 border-cyan-500/60 transform rotate-0 animate-spin-slow shadow-lg shadow-cyan-500/30"
                  style={{
                    clipPath:
                      "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                  }}
                ></div>
                <div
                  className="absolute inset-2 border-4 border-purple-500/60 transform rotate-180 animate-spin-slow shadow-lg shadow-purple-500/30"
                  style={{
                    clipPath:
                      "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                  }}
                ></div>
                <div
                  className="absolute inset-4 border-4 border-pink-500/60 transform rotate-0 animate-spin-slow shadow-lg shadow-pink-500/30"
                  style={{
                    clipPath:
                      "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                  }}
                ></div>
              </div>

              <h1 className="text-4xl font-black mb-3 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse drop-shadow-lg">
                SUPER HEXAGON
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto rounded-full mb-4 shadow-lg shadow-cyan-500/50"></div>
              <p className="text-lg text-gray-300 font-light">
                사이버 네온 세계의 극한 도전!
              </p>
            </div>

            <div className="relative z-10 mb-6 space-y-3">
              <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl p-3 border border-gray-700/50 shadow-inner">
                <h3 className="text-md font-bold text-white mb-2 flex items-center justify-center gap-2">
                  <span className="text-xl">🎮</span> 조작법
                </h3>
                <div className="text-gray-300 space-y-1 text-sm">
                  <p>← → 또는 A D: 좌우 회전</p>
                  <p className="text-cyan-400">📱 모바일: 화면 좌/우 터치</p>
                  <p>다가오는 네온 벽들을 피하세요!</p>
                  <p className="text-pink-400 font-semibold">
                    10초 후 화면 회전 시작!
                  </p>
                  <p className="text-emerald-400 font-semibold">
                    점진적 난이도 증가 시스템!
                  </p>
                </div>
              </div>

              {bestScore > 0 && (
                <div className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 backdrop-blur-sm rounded-xl p-3 border border-yellow-500/30 shadow-lg shadow-yellow-500/20">
                  <h3 className="text-md font-bold text-yellow-400 mb-1 flex items-center justify-center gap-2">
                    <span className="text-xl">🏆</span> 최고 기록
                  </h3>
                  <p className="text-2xl font-bold text-white drop-shadow-lg">
                    {bestScore}초
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={startGame}
              className="relative group overflow-hidden bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 hover:from-cyan-500 hover:via-purple-500 hover:to-pink-500 text-white px-8 py-4 rounded-xl font-bold text-xl shadow-lg shadow-purple-500/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/40 border border-purple-500/30"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="relative flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                <span>게임 시작</span>
              </div>
            </button>
          </div>

          {/* 랭킹 섹션 */}
          <div className="bg-black/90 backdrop-blur-xl rounded-2xl border border-slate-600/30 shadow-2xl p-6 relative overflow-hidden">
            {/* 내부 네온 효과 */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-blue-500/5 to-purple-500/5 rounded-2xl"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-500/50">
                  <span className="text-sm font-bold text-slate-900">🏆</span>
                </div>
                <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                  명예의 전당
                </h3>
                <div className="flex-1 h-px bg-gradient-to-r from-yellow-400/50 to-transparent"></div>
              </div>
              {renderRanking()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* 네온 배경 효과 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping shadow-lg shadow-cyan-400/50"></div>
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-purple-400 rounded-full animate-ping delay-300 shadow-lg shadow-purple-400/50"></div>
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-pink-400 rounded-full animate-ping delay-700 shadow-lg shadow-pink-400/50"></div>
        <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-emerald-400 rounded-full animate-ping delay-1000 shadow-lg shadow-emerald-400/50"></div>
      </div>

      {/* 게임 UI */}
      <div className="absolute top-4 left-4 z-10 space-y-4">
        <div className="bg-black/90 backdrop-blur-xl px-6 py-3 rounded-xl border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-sm shadow-cyan-400/50"></div>
            <span className="text-cyan-400 font-medium">시간</span>
            <span className="text-white font-bold text-xl drop-shadow-lg">
              {score}초
            </span>
          </div>
        </div>

        <div className="bg-black/90 backdrop-blur-xl px-6 py-3 rounded-xl border border-yellow-500/30 shadow-lg shadow-yellow-500/20">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-sm shadow-yellow-400/50"></div>
            <span className="text-yellow-400 font-medium">최고</span>
            <span className="text-white font-bold text-xl drop-shadow-lg">
              {bestScore}초
            </span>
          </div>
        </div>
      </div>

      {/* 게임 캔버스 */}
      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-cyan-600/20 via-purple-600/20 to-pink-600/20 rounded-xl blur-lg animate-pulse shadow-2xl"></div>
        <div
          ref={gameRef}
          className="relative border-2 border-purple-500/50 rounded-lg shadow-2xl w-[800px] h-[600px] bg-black/95 backdrop-blur-sm"
        />
      </div>

      {/* 게임 오버 화면 */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center z-20 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-red-900/90 to-purple-900/90 backdrop-blur-xl rounded-3xl border border-red-500/30 shadow-2xl shadow-red-500/20 p-12 max-w-lg w-full text-center mx-4 relative overflow-hidden">
            {/* 내부 네온 효과 */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl"></div>

            <div className="relative z-10 mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full mb-4 shadow-lg shadow-red-500/50 animate-pulse">
                <span className="text-4xl">💥</span>
              </div>
              <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 mb-2 drop-shadow-lg">
                GAME OVER
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-orange-500 mx-auto rounded-full shadow-lg shadow-red-500/50"></div>
            </div>

            <div className="relative z-10 space-y-4 mb-8">
              <div className="bg-black/70 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 shadow-inner">
                <div className="text-gray-400 text-sm mb-1">생존 시간</div>
                <div className="text-3xl font-bold text-white drop-shadow-lg">
                  {score}초
                </div>
              </div>

              {score === bestScore && score > 0 && (
                <div className="bg-yellow-900/40 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/30 animate-pulse shadow-lg shadow-yellow-500/20">
                  <div className="text-yellow-400 font-bold flex items-center justify-center gap-2">
                    <span className="text-2xl">🎉</span> 새로운 기록!
                  </div>
                </div>
              )}
            </div>

            <div className="relative z-10 flex gap-4">
              <button
                onClick={restartGame}
                className="flex-1 group relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-6 py-4 rounded-xl font-bold shadow-lg shadow-green-500/30 transition-all duration-300 hover:scale-105 border border-green-500/30"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <div className="relative flex items-center justify-center gap-2">
                  <span>🔄</span>
                  <span>다시 시작</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setGameStarted(false);
                  setGameOver(false);
                  if (phaserGameRef.current) {
                    phaserGameRef.current.destroy(true);
                  }
                }}
                className="flex-1 group relative overflow-hidden bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-6 py-4 rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 border border-gray-500/30"
              >
                <div className="relative flex items-center justify-center gap-2">
                  <span>🏠</span>
                  <span>메뉴</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 조작 안내 */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-black/90 backdrop-blur-xl px-6 py-3 rounded-xl border border-gray-500/30 shadow-lg">
          <div className="text-gray-300 text-sm text-center">
            ← → 또는 A D로 회전 | 📱 화면 좌/우 터치 | 스페이스바: 디버그
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
      `}</style>
    </div>
  );
}
