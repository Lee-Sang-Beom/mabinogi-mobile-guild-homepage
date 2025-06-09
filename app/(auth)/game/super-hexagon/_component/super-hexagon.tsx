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
  width: 1000, // 800 → 1000으로 확대
  height: 750, // 600 → 750으로 확대
  centerX: 500, // 400 → 500으로 조정
  centerY: 375, // 300 → 375로 조정
  innerRadius: 35,
  playerRadius: 8,
  wallThickness: 25,
  // 난이도 단계별 설정
  difficulty: {
    // 초급 (0-15초) - 기본 속도 약간 증가
    beginner: {
      wallSpeed: 5, // 4 → 5로 증가
      spawnInterval: 250, // 300 → 250으로 감소 (더 빠른 생성)
      wallCount: { min: 1, max: 2 },
      safeZoneMin: 3,
      rotationChance: 0.001,
    },
    // 중급 (15-45초)
    intermediate: {
      wallSpeed: 6, // 5 → 6으로 증가
      spawnInterval: 130, // 150 → 130으로 감소
      wallCount: { min: 1, max: 3 },
      safeZoneMin: 2,
      rotationChance: 0.004,
    },
    // 고급 (45-90초)
    advanced: {
      wallSpeed: 6.5, // 5 → 6.5로 증가
      spawnInterval: 110, // 130 → 110으로 감소
      wallCount: { min: 2, max: 4 },
      safeZoneMin: 2,
      rotationChance: 0.007,
    },
    // 전문가 (90초+)
    expert: {
      wallSpeed: 7.5, // 6 → 7.5로 증가
      spawnInterval: 70, // 80 → 70으로 감소
      wallCount: { min: 2, max: 4 },
      safeZoneMin: 1,
      rotationChance: 0.01,
    },
  },
  maxWallSpeed: 15,
  minSpawnInterval: 40,
  mazeSpawnInterval: 60, // 80 → 60으로 감소 (패턴 모드 더 빠르게)
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
    // 기본 단계 (Hexagon/Hyper Hexagon)
    "solo",
    "triple_c",
    "whirlpool",
    "bat",
    "ladder",
    "mode_changer",
    "stair_1", // Hyper 모드 한정
    "pattern_321", // 3→2→1 M자형 패턴

    // 중간 단계 (Pentagon/Square)
    "double_c",
    "box_with_cap",

    // 고난도 단계 (Hexagoner/Hyper Hexagoner)
    "multi_c",
    "double_whirlpool",
    "spin_2",
    "spin_3",
    "spin_4",
    "rain",

    // 최종 단계 (Hexagonest/Hyper Hexagonest)
    "stair_2",

    // 특별 모드
    "black_white_mode",
  ],
  // 난이도별 사용 가능한 패턴 정의
  patternsByDifficulty: {
    // 0-15초: 기본 패턴만
    beginner: ["solo"],

    // 15-30초: 기본 + 일부 중급
    intermediate: ["solo", "triple_c", "bat", "ladder"],

    // 30-60초: 중급 패턴 추가
    advanced: [
      "solo",
      "triple_c",
      "whirlpool",
      "bat",
      "ladder",
      "double_c",
      "spin_2",
    ],

    // 60-90초: 고급 패턴
    expert: [
      "triple_c",
      "whirlpool",
      "bat",
      "ladder",
      "double_c",
      "box_with_cap",
      "multi_c",
      "double_whirlpool",
      "spin_2",
      "spin_3",
      "rain",
    ],

    // 90-120초: 최고급 패턴
    master: [
      "multi_c",
      "double_whirlpool",
      "spin_3",
      "spin_4",
      "rain",
      "stair_1",
      "pattern_321",
      "stair_2",
    ],

    // 120초+: 모든 패턴
    grandmaster: [
      "multi_c",
      "double_whirlpool",
      "spin_4",
      "rain",
      "stair_2",
      "pattern_321",
      "black_white_mode",
    ],
  },
  // 패턴별 상세 설정 추가:
  patternConfigs: {
    solo: {
      holes: [1, 2, 3],
      duration: [4, 8],
      description: "1-3홀 구성의 단일 파트",
    },
    triple_c: {
      cCount: 3,
      spacing: [2, 3],
      duration: [8, 12],
      description: "C자형 장애물 3개가 2-3단위 간격",
    },
    whirlpool: {
      rotationSpeed: [1, 2],
      duration: [12, 20],
      description: "시계/반시계 방향 회전 소용돌이",
    },
    bat: {
      alternateSpeed: 2,
      duration: [6, 10],
      description: "두 방향으로 빠르게 번갈아 움직임",
    },
    ladder: {
      zigzagPattern: true,
      duration: [8, 15],
      description: "지그재그 형태로 구멍 위치 이동",
    },
    double_c: {
      cCount: 2,
      consecutive: true,
      duration: [6, 10],
      description: "C자형 장애물 2개 연속",
    },
    box_with_cap: {
      cThenBlock: true,
      duration: [8, 12],
      description: "C 다음에 막힌 형태",
    },
    multi_c: {
      cCount: [4, 5],
      sameDirection: true,
      duration: [12, 18],
      description: "같은 방향으로 4-5번 연속 C자 회전",
    },
    double_whirlpool: {
      bidirectional: true,
      duration: [15, 25],
      description: "양방향 회전 동시",
    },
    spin_2: {
      units: 2,
      alternating: true,
      duration: [8, 12],
      description: "2단위 좌우 반복",
    },
    spin_3: {
      units: 3,
      alternating: true,
      duration: [10, 15],
      description: "3단위 회전 반복",
    },
    spin_4: {
      units: 4,
      alternating: true,
      duration: [12, 18],
      description: "4단위 회전 반복",
    },
    rain: {
      holes: 3,
      irregular: true,
      duration: [10, 16],
      description: "3홀 구조와 막이 함께, 불규칙 위치",
    },
    stair_1: {
      units: 3,
      stairPattern: true,
      duration: [8, 14],
      description: "3단위 홀 이동이 계단형 반복",
    },
    pattern_321: {
      sequence: [3, 2, 1],
      mShape: true,
      duration: [18, 18],
      description: "3→2→1 유닛 순서 M자형",
    },
    stair_2: {
      pattern: "RR LLL",
      sequence: [2, 3],
      duration: [10, 16],
      description: "2단위 우→3단위 좌 반복",
    },
    black_white_mode: {
      noRotation: true,
      highSpeed: true,
      duration: [20, 30],
      description: "회전 없이 고속 직선 패턴",
    },
  },
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
    try {
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

      // 1초 후 첫 벽 생성
      this.time.delayedCall(1000, () => {
        if (!this.gameData.isGameOver) {
          this.createWallRing();
        }
      });
    } catch (error) {
      console.error("게임 초기화 중 오류:", error);
      // 오류 발생 시 기본 설정으로 계속 진행
      this.initializeGameData();
      this.setupPlayer();
      this.setupInput();
      this.setupCenterHexagon();
    }
  }

  private setupNeonBackground() {
    try {
      // 동적 네온 배경 그라디언트
      this.backgroundGradient = this.add.graphics();
      this.backgroundGradient.setDepth(-100);

      // 네온 효과용 그래픽
      this.neonEffects = this.add.graphics();
      this.neonEffects.setDepth(-50);
    } catch (error) {
      console.error("네온 배경 설정 오류:", error);
    }
  }

  private async setupAudio() {
    try {
      // 랜덤 배경음 선택
      this.selectedTrack =
        GAME_CONFIG.backgroundTracks[
          Math.floor(Math.random() * GAME_CONFIG.backgroundTracks.length)
        ];

      this.backgroundMusic = new Tone.Player({
        url: this.selectedTrack,
        loop: true,
        volume: -12,
      }).toDestination();

      await this.backgroundMusic.load(this.selectedTrack);
      this.backgroundMusic.start();

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
    } catch (error) {
      console.warn("오디오 설정 실패:", error);
      // 오디오 실패 시에도 게임은 계속 진행
    }
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
      // 패턴 모드에서의 연속 안전지대 방지
      lastPatternSafeZones: [], // 마지막 3개 패턴의 안전지대 기록
      consecutiveSameCount: 0, // 연속으로 같은 안전지대가 나온 횟수
      // 난이도 시스템
      currentDifficulty: "beginner",
      difficultyTransition: 0,
    };
  }

  private setupPlayer() {
    try {
      const { innerRadius, playerRadius } = GAME_CONFIG;

      // 네온 스타일 플레이어 생성
      this.gameData.player = this.add.graphics();
      this.gameData.player.setPosition(0, -(innerRadius + playerRadius + 8));

      // 컨테이너에 추가
      this.gameContainer?.add(this.gameData.player);
    } catch (error) {
      console.error("플레이어 설정 오류:", error);
    }
  }

  private setupInput() {
    try {
      this.gameData.cursors = this.input.keyboard?.createCursorKeys();
      this.gameData.wasd = this.input.keyboard?.addKeys("W,S,A,D");

      // 디버그 모드 토글 (스페이스바)
      this.input.keyboard?.on("keydown-SPACE", () => {
        this.gameData.debug = !this.gameData.debug;
        console.log("디버그 모드:", this.gameData.debug);
      });

      // 모바일 터치 입력 설정
      this.setupTouchInput();
    } catch (error) {
      console.error("입력 설정 오류:", error);
    }
  }

  private setupTouchInput() {
    try {
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
    } catch (error) {
      console.error("터치 입력 설정 오류:", error);
    }
  }

  private setupCenterHexagon() {
    try {
      this.centerHexagon = this.add.graphics();
      this.gameContainer?.add(this.centerHexagon);
    } catch (error) {
      console.error("중심 헥사곤 설정 오류:", error);
    }
  }

  private updateGame() {
    try {
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
    } catch (error) {
      console.error("게임 업데이트 오류:", error);
      // 치명적 오류 시 게임 종료
      this.triggerGameOver();
    }
  }

  private updateDifficulty() {
    try {
      const timeInSeconds = this.gameData.gameTime / 60;

      let targetDifficulty = "beginner";
      let difficultyConfig = GAME_CONFIG.difficulty.beginner;

      if (timeInSeconds >= 120) {
        targetDifficulty = "grandmaster";
        difficultyConfig = GAME_CONFIG.difficulty.expert; // 최고 설정 사용
      } else if (timeInSeconds >= 90) {
        targetDifficulty = "master";
        difficultyConfig = GAME_CONFIG.difficulty.expert;
      } else if (timeInSeconds >= 60) {
        targetDifficulty = "expert";
        difficultyConfig = GAME_CONFIG.difficulty.expert;
      } else if (timeInSeconds >= 30) {
        targetDifficulty = "advanced";
        difficultyConfig = GAME_CONFIG.difficulty.advanced;
      } else if (timeInSeconds >= 15) {
        targetDifficulty = "intermediate";
        difficultyConfig = GAME_CONFIG.difficulty.intermediate;
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
    } catch (error) {
      console.error("난이도 업데이트 오류:", error);
    }
  }

  private updateNeonBackground() {
    try {
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
    } catch (error) {
      console.error("네온 배경 업데이트 오류:", error);
    }
  }

  private updateVisuals() {
    try {
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
    } catch (error) {
      console.error("비주얼 업데이트 오류:", error);
    }
  }

  private updateRotation() {
    try {
      // 현재 난이도에 따른 설정 가져오기 (안전한 방식)
      const difficultyKeys = Object.keys(GAME_CONFIG.difficulty) as Array<
        keyof typeof GAME_CONFIG.difficulty
      >;
      const currentDifficultyKey = difficultyKeys.includes(
        this.gameData.currentDifficulty as any,
      )
        ? (this.gameData
            .currentDifficulty as keyof typeof GAME_CONFIG.difficulty)
        : "beginner";

      const currentDifficultyConfig =
        GAME_CONFIG.difficulty[currentDifficultyKey];

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
    } catch (error) {
      console.error("회전 업데이트 오류:", error);
    }
  }

  private handleInput() {
    try {
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
        try {
          this.moveSound?.triggerAttackRelease("C6", "64n");
        } catch (soundError) {
          // 사운드 오류는 무시하고 계속 진행
        }
        this.gameData.lastMoveTime = currentTime;
      }
    } catch (error) {
      console.error("입력 처리 오류:", error);
    }
  }

  private updatePlayer() {
    try {
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
      const glowColor = Phaser.Display.Color.HSVToRGB(
        playerHue / 360,
        0.8,
        0.6,
      );

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
    } catch (error) {
      console.error("플레이어 업데이트 오류:", error);
    }
  }

  private updateCenterHexagon() {
    try {
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
    } catch (error) {
      console.error("중심 헥사곤 업데이트 오류:", error);
    }
  }

  private drawCenterShape(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    radius: number,
  ) {
    try {
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
    } catch (error) {
      console.error("중심 도형 그리기 오류:", error);
    }
  }

  private spawnWalls() {
    try {
      this.gameData.spawnTimer++;

      // 패턴 모드일 때는 더 빠른 간격으로 생성
      const currentInterval = this.gameData.isPatternMode
        ? Math.max(30, GAME_CONFIG.mazeSpawnInterval * 0.5) // 더 빠르게 조정
        : this.gameData.spawnInterval;

      if (this.gameData.spawnTimer >= currentInterval) {
        this.createWallRing();
        this.gameData.spawnTimer = 0;
      }
    } catch (error) {
      console.error("벽 생성 오류:", error);
    }
  }

  private createWallRing() {
    try {
      const startRadius = 550; // 450 → 550으로 증가 (화면 확대에 맞춤)
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
    } catch (error) {
      console.error("벽 링 생성 오류:", error);
    }
  }

  private generateWallPattern(): boolean[] {
    try {
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
    } catch (error) {
      console.error("벽 패턴 생성 오류:", error);
      // 오류 시 기본 패턴 반환
      return this.generateBasicWalls();
    }
  }

  private startNewPattern() {
    try {
      const timeInSeconds = this.gameData.gameTime / 60;

      // 시간대별 사용 가능한 패턴 정의
      let availablePatterns: string[] = [];

      if (timeInSeconds < 15) {
        availablePatterns = GAME_CONFIG.patternsByDifficulty.beginner;
      } else if (timeInSeconds < 30) {
        availablePatterns = GAME_CONFIG.patternsByDifficulty.intermediate;
      } else if (timeInSeconds < 60) {
        availablePatterns = GAME_CONFIG.patternsByDifficulty.advanced;
      } else if (timeInSeconds < 90) {
        availablePatterns = GAME_CONFIG.patternsByDifficulty.expert;
      } else if (timeInSeconds < 120) {
        availablePatterns = GAME_CONFIG.patternsByDifficulty.master;
      } else {
        availablePatterns = GAME_CONFIG.patternsByDifficulty.grandmaster;
      }

      // 연속 패턴 방지 로직
      if (this.gameData.consecutivePatternCount >= 2) {
        availablePatterns = availablePatterns.filter(
          (pattern) => pattern !== this.gameData.currentWallPattern,
        );
        this.gameData.consecutivePatternCount = 0;
      }

      const selectedPattern =
        availablePatterns[Math.floor(Math.random() * availablePatterns.length)];

      // 패턴 설정
      this.gameData.currentWallPattern = selectedPattern;
      this.gameData.isPatternMode = true;
      this.gameData.patternProgress = 0;
      this.gameData.patternDirection = Math.floor(Math.random() * 6);

      // 패턴별 길이 설정
      const config =
        GAME_CONFIG.patternConfigs[
          selectedPattern as keyof typeof GAME_CONFIG.patternConfigs
        ];
      if (config && config.duration) {
        const [min, max] = config.duration;
        this.gameData.patternLength =
          Math.floor(Math.random() * (max - min + 1)) + min;
      } else {
        this.gameData.patternLength = 8; // 기본값
      }

      if (this.gameData.debug) {
        console.log(
          `패턴 시작: ${selectedPattern} (${config?.description}) - ${timeInSeconds.toFixed(1)}초`,
        );
      }
    } catch (error) {
      console.error("새 패턴 시작 오류:", error);
    }
  }

  private generatePatternWalls(): boolean[] {
    try {
      const pattern = new Array(6).fill(true);
      let safeZones: number[] = [];

      switch (this.gameData.currentWallPattern) {
        case "solo":
          safeZones = this.generateSoloPattern();
          break;
        case "triple_c":
          safeZones = this.generateTripleCPattern();
          break;
        case "whirlpool":
          safeZones = this.generateWhirlpoolPattern();
          break;
        case "bat":
          safeZones = this.generateBatPattern();
          break;
        case "ladder":
          safeZones = this.generateLadderPattern();
          break;
        case "double_c":
          safeZones = this.generateDoubleCPattern();
          break;
        case "box_with_cap":
          safeZones = this.generateBoxWithCapPattern();
          break;
        case "multi_c":
          safeZones = this.generateMultiCPattern();
          break;
        case "double_whirlpool":
          safeZones = this.generateDoubleWhirlpoolPattern();
          break;
        case "spin_2":
          safeZones = this.generateSpinPattern(2);
          break;
        case "spin_3":
          safeZones = this.generateSpinPattern(3);
          break;
        case "spin_4":
          safeZones = this.generateSpinPattern(4);
          break;
        case "rain":
          safeZones = this.generateRainPattern();
          break;
        case "stair_1":
          safeZones = this.generateStair1Pattern();
          break;
        case "pattern_321":
          safeZones = this.generatePattern321();
          break;
        case "stair_2":
          safeZones = this.generateStair2Pattern();
          break;
        case "black_white_mode":
          safeZones = this.generateBlackWhitePattern();
          break;
        default:
          safeZones = [this.gameData.patternDirection];
      }

      // 안전지대 설정
      safeZones.forEach((zone) => {
        if (zone >= 0 && zone < 6) {
          pattern[zone] = false;
        }
      });

      this.gameData.patternProgress++;
      if (this.gameData.patternProgress >= this.gameData.patternLength) {
        this.gameData.isPatternMode = false;
        this.gameData.consecutiveSameCount = 0;
      }

      return pattern;
    } catch (error) {
      console.error("패턴 벽 생성 오류:", error);
      return this.generateBasicWalls();
    }
  }

  private generateBasicWalls(): boolean[] {
    try {
      // 안전한 난이도 설정 접근
      const difficultyKeys = Object.keys(GAME_CONFIG.difficulty) as Array<
        keyof typeof GAME_CONFIG.difficulty
      >;
      const currentDifficultyKey = difficultyKeys.includes(
        this.gameData.currentDifficulty as any,
      )
        ? (this.gameData
            .currentDifficulty as keyof typeof GAME_CONFIG.difficulty)
        : "beginner";

      const currentDifficultyConfig =
        GAME_CONFIG.difficulty[currentDifficultyKey];

      const pattern = new Array(6).fill(true);
      const minSafeZones = currentDifficultyConfig.safeZoneMin;
      const maxSafeZones = Math.min(4, minSafeZones + 2);
      const safeZoneCount =
        Math.floor(Math.random() * (maxSafeZones - minSafeZones + 1)) +
        minSafeZones;

      // 연속 안전지대 방지를 위한 로직
      let attempts = 0;
      let safeZones: number[] = [];

      while (attempts < 10) {
        safeZones = [];
        const startPosition = Math.floor(Math.random() * 6);

        for (let i = 0; i < safeZoneCount; i++) {
          safeZones.push((startPosition + i) % 6);
        }

        // 이전 패턴과 너무 유사한지 확인
        const similarity = this.calculateSimilarity(
          safeZones,
          this.gameData.lastSafeZones,
        );
        if (similarity < 0.7) break;

        attempts++;
      }

      // 안전지대 설정
      safeZones.forEach((zone) => {
        pattern[zone] = false;
      });

      // 기록 업데이트
      this.gameData.lastSafeZones = [...safeZones];

      return pattern;
    } catch (error) {
      console.error("기본 벽 생성 오류:", error);
      // 오류 시 최소한의 안전 패턴 반환
      const pattern = new Array(6).fill(true);
      pattern[0] = false;
      pattern[1] = false;
      return pattern;
    }
  }

  private calculateSimilarity(zones1: number[], zones2: number[]): number {
    try {
      if (!zones2 || zones2.length === 0) return 0;

      const matches = zones1.filter((zone) => zones2.includes(zone)).length;
      return matches / Math.max(zones1.length, zones2.length);
    } catch (error) {
      console.error("유사도 계산 오류:", error);
      return 0;
    }
  }

  // 패턴 생성 메서드들 (오류 처리 추가)
  private generateWhirlpoolPattern(): number[] {
    try {
      const progress = this.gameData.patternProgress;
      const basePosition = this.gameData.patternDirection;
      const rotationSpeed = Math.floor(Math.random() * 2) + 1;

      if (progress === 0) {
        this.gameData.spinDirection = Math.random() < 0.5 ? 1 : -1;
      }

      const currentPosition =
        (basePosition +
          progress * rotationSpeed * this.gameData.spinDirection +
          6) %
        6;
      const holeCount = Math.floor(Math.random() * 2) + 2;
      const safeZones = [];

      for (let i = 0; i < holeCount; i++) {
        safeZones.push((currentPosition + i) % 6);
      }

      return safeZones;
    } catch (error) {
      console.error("소용돌이 패턴 생성 오류:", error);
      return [0, 1];
    }
  }

  private generateBatPattern(): number[] {
    try {
      const progress = this.gameData.patternProgress;
      const basePosition = this.gameData.patternDirection;

      if (progress % 4 < 2) {
        return [(basePosition - 2 + 6) % 6, (basePosition - 1 + 6) % 6];
      } else {
        return [(basePosition + 1) % 6, (basePosition + 2) % 6];
      }
    } catch (error) {
      console.error("박쥐 패턴 생성 오류:", error);
      return [0, 1];
    }
  }

  private generateLadderPattern(): number[] {
    try {
      const progress = this.gameData.patternProgress;
      const basePosition = this.gameData.patternDirection;

      const zigzagOffset = Math.sin(progress * 0.5) * 2;
      const currentPosition = (basePosition + Math.floor(zigzagOffset) + 6) % 6;

      return [currentPosition, (currentPosition + 1) % 6];
    } catch (error) {
      console.error("사다리 패턴 생성 오류:", error);
      return [0, 1];
    }
  }

  private generateDoubleCPattern(): number[] {
    try {
      const progress = this.gameData.patternProgress;
      const cIndex = Math.floor(progress / 3) % 2;
      const basePosition = (this.gameData.patternDirection + cIndex * 3) % 6;

      return [basePosition, (basePosition + 1) % 6, (basePosition + 2) % 6];
    } catch (error) {
      console.error("더블 C 패턴 생성 오류:", error);
      return [0, 1, 2];
    }
  }

  private generateBoxWithCapPattern(): number[] {
    try {
      const progress = this.gameData.patternProgress;
      const basePosition = this.gameData.patternDirection;
      const cycleLength = 8;
      const cyclePosition = progress % cycleLength;

      if (cyclePosition < 4) {
        return [basePosition, (basePosition + 1) % 6, (basePosition + 2) % 6];
      } else {
        return [basePosition];
      }
    } catch (error) {
      console.error("박스 캡 패턴 생성 오류:", error);
      return [0];
    }
  }

  private generateMultiCPattern(): number[] {
    try {
      const progress = this.gameData.patternProgress;
      const cCount = Math.floor(Math.random() * 2) + 4;
      const cIndex = Math.floor(progress / 3) % cCount;

      const direction = this.gameData.spinDirection;
      const basePosition =
        (this.gameData.patternDirection + cIndex * direction + 6) % 6;

      return [basePosition, (basePosition + 1) % 6, (basePosition + 2) % 6];
    } catch (error) {
      console.error("멀티 C 패턴 생성 오류:", error);
      return [0, 1, 2];
    }
  }

  private generateDoubleWhirlpoolPattern(): number[] {
    try {
      const progress = this.gameData.patternProgress;
      const basePosition = this.gameData.patternDirection;

      const clockwise = (basePosition + progress) % 6;
      const counterClockwise = (basePosition - progress + 6) % 6;

      const safeZone1 = (clockwise + 2) % 6;
      const safeZone2 = (counterClockwise + 2) % 6;

      return [safeZone1, safeZone2].filter(
        (zone, index, arr) => arr.indexOf(zone) === index,
      );
    } catch (error) {
      console.error("더블 소용돌이 패턴 생성 오류:", error);
      return [0, 3];
    }
  }

  private generateSpinPattern(units: number): number[] {
    try {
      const progress = this.gameData.patternProgress;
      const cycleLength = units * 2;
      const cyclePosition = progress % cycleLength;

      const basePosition = this.gameData.patternDirection;
      let direction = 1;

      if (cyclePosition >= units) {
        direction = -1;
      }

      const moveAmount = (cyclePosition % units) * direction;
      const currentPosition = (basePosition + moveAmount + 6) % 6;

      return [currentPosition];
    } catch (error) {
      console.error("스핀 패턴 생성 오류:", error);
      return [0];
    }
  }

  private generateStair2Pattern(): number[] {
    try {
      const progress = this.gameData.patternProgress;
      const cycleLength = 5;
      const cyclePosition = progress % cycleLength;

      const basePosition = this.gameData.patternDirection;
      let moveAmount = 0;

      if (cyclePosition < 2) {
        moveAmount = cyclePosition;
      } else {
        moveAmount = -(cyclePosition - 2);
      }

      const currentPosition = (basePosition + moveAmount + 6) % 6;
      return [currentPosition];
    } catch (error) {
      console.error("계단2 패턴 생성 오류:", error);
      return [0];
    }
  }

  private generateBlackWhitePattern(): number[] {
    try {
      const progress = this.gameData.patternProgress;
      const basePosition = this.gameData.patternDirection;

      const straightMove = Math.floor(progress / 2);
      const currentPosition = (basePosition + straightMove) % 6;

      return [currentPosition];
    } catch (error) {
      console.error("흑백 패턴 생성 오류:", error);
      return [0];
    }
  }

  private generateRainPattern(): number[] {
    try {
      const progress = this.gameData.patternProgress;
      const basePosition = this.gameData.patternDirection;

      const seed = Math.floor(progress / 3);
      const irregularOffset = (seed * 7) % 6;

      if (progress % 6 < 3) {
        const position = (basePosition + irregularOffset) % 6;
        return [position, (position + 1) % 6, (position + 2) % 6];
      } else {
        const holeCount = (seed % 2) + 1;
        const position = (basePosition + irregularOffset + 3) % 6;
        const safeZones = [];

        for (let i = 0; i < holeCount; i++) {
          safeZones.push((position + i) % 6);
        }

        return safeZones;
      }
    } catch (error) {
      console.error("비 패턴 생성 오류:", error);
      return [0, 1, 2];
    }
  }

  private generateStair1Pattern(): number[] {
    try {
      const progress = this.gameData.patternProgress;
      const basePosition = this.gameData.patternDirection;
      const stairStep = Math.floor(progress / 3) % 3;

      const currentPosition = (basePosition + stairStep) % 6;

      return [
        currentPosition,
        (currentPosition + 1) % 6,
        (currentPosition + 2) % 6,
      ];
    } catch (error) {
      console.error("계단1 패턴 생성 오류:", error);
      return [0, 1, 2];
    }
  }

  private generatePattern321(): number[] {
    try {
      const progress = this.gameData.patternProgress;
      const basePosition = this.gameData.patternDirection;
      const totalLength = 18;
      const cyclePosition = progress % totalLength;

      let holeCount = 3;
      let phaseOffset = 0;

      if (cyclePosition < 6) {
        holeCount = 3;
        phaseOffset = 0;
      } else if (cyclePosition < 12) {
        holeCount = 2;
        phaseOffset = 1;
      } else {
        holeCount = 1;
        phaseOffset = 2;
      }

      const mShapeOffset =
        Math.sin((cyclePosition / totalLength) * Math.PI * 2) * 2;
      const currentPosition =
        (basePosition + phaseOffset + Math.floor(mShapeOffset) + 6) % 6;

      const safeZones = [];
      for (let i = 0; i < holeCount; i++) {
        safeZones.push((currentPosition + i) % 6);
      }

      return safeZones;
    } catch (error) {
      console.error("321 패턴 생성 오류:", error);
      return [0, 1, 2];
    }
  }

  private generateSoloPattern(): number[] {
    try {
      const holeCount = Math.floor(Math.random() * 3) + 1;
      const basePosition = this.gameData.patternDirection;
      const safeZones = [];

      for (let i = 0; i < holeCount; i++) {
        safeZones.push((basePosition + i) % 6);
      }

      return safeZones;
    } catch (error) {
      console.error("솔로 패턴 생성 오류:", error);
      return [0];
    }
  }

  private generateTripleCPattern(): number[] {
    try {
      const progress = this.gameData.patternProgress;
      const spacing = Math.floor(Math.random() * 2) + 2;
      const cIndex = Math.floor(progress / 4) % 3;

      const basePosition =
        (this.gameData.patternDirection + cIndex * spacing) % 6;

      return [basePosition, (basePosition + 1) % 6, (basePosition + 2) % 6];
    } catch (error) {
      console.error("트리플 C 패턴 생성 오류:", error);
      return [0, 1, 2];
    }
  }

  private updateWalls() {
    try {
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
    } catch (error) {
      console.error("벽 업데이트 오류:", error);
    }
  }

  private updateWallRing(wallRing: Phaser.GameObjects.Graphics) {
    try {
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
    } catch (error) {
      console.error("벽 링 업데이트 오류:", error);
    }
  }

  private checkCollision(wall: Phaser.GameObjects.Graphics): boolean {
    try {
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
    } catch (error) {
      console.error("충돌 검사 오류:", error);
      return false;
    }
  }

  private triggerGameOver() {
    try {
      this.gameData.isGameOver = true;
      this.gameData.cameraShake = 15;

      // 강화된 게임오버 사운드
      try {
        this.hitSound?.triggerAttackRelease("C1", "2n");
      } catch (soundError) {
        // 사운드 오류는 무시
      }

      if (this.backgroundMusic) {
        try {
          this.backgroundMusic.stop();
        } catch (musicError) {
          // 음악 정지 오류는 무시
        }
      }

      const finalScore = Math.floor(this.gameData.gameTime / 60);
      if (this.onGameOver) {
        this.onGameOver(finalScore);
      }
    } catch (error) {
      console.error("게임 오버 처리 오류:", error);
      // 최소한 콜백은 실행
      if (this.onGameOver) {
        this.onGameOver(0);
      }
    }
  }

  private updateDebugInfo() {
    try {
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
    } catch (error) {
      console.error("디버그 정보 업데이트 오류:", error);
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
  const [apiError, setApiError] = useState<string | null>(null);

  // API Hooks with error handling
  const createGameMutation = useCreateGame();
  const {
    data: rankingData,
    refetch: refetchRanking,
    error: rankingError,
  } = useGetGamesByGameType("super_hexagon");

  useEffect(() => {
    try {
      if (rankingError) {
        console.error("랭킹 데이터 로드 오류:", rankingError);
        setApiError("랭킹 정보를 불러올 수 없습니다.");
        setIsLoading(false);
        return;
      }

      if (!rankingData || !rankingData.data) {
        setBestScore(0);
        setIsLoading(false);
        return;
      }

      const savedMyData = rankingData.data.find(
        (item) => user.docId === item.userDocId,
      );
      setBestScore(savedMyData?.score || 0);
      setIsLoading(false);
      setApiError(null);
    } catch (error) {
      console.error("랭킹 데이터 처리 오류:", error);
      setApiError("데이터 처리 중 오류가 발생했습니다.");
      setIsLoading(false);
    }
  }, [rankingData, user.docId, user.id, rankingError]);

  const saveScore = useCallback(
    async (finalScore: number) => {
      try {
        if (!user?.docId || !user?.id) {
          console.error("사용자 정보가 없습니다.");
          return;
        }

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
        setApiError(null);
      } catch (error) {
        console.error("점수 저장 실패:", error);
        setApiError("점수 저장에 실패했습니다.");
      }
    },
    [rankingData, createGameMutation, refetchRanking, user.docId, user.id],
  );

  const startGame = async () => {
    try {
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
          setGameStarted(false);
        }
      }, 100);
    } catch (error) {
      console.error("게임 시작 오류:", error);
      setGameStarted(false);
    }
  };

  const restartGame = () => {
    try {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
      }
      startGame();
    } catch (error) {
      console.error("게임 재시작 오류:", error);
    }
  };

  useEffect(() => {
    return () => {
      try {
        if (phaserGameRef.current) {
          phaserGameRef.current.destroy(true);
        }
      } catch (error) {
        console.error("게임 정리 오류:", error);
      }
    };
  }, []);

  const renderRanking = () => {
    if (apiError) {
      return <div className="text-center text-red-400">{apiError}</div>;
    }

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

      {/* 게임 캔버스 - 크기 확대 */}
      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-cyan-600/20 via-purple-600/20 to-pink-600/20 rounded-xl blur-lg animate-pulse shadow-2xl"></div>
        <div
          ref={gameRef}
          className="relative border-2 border-purple-500/50 rounded-lg shadow-2xl w-[1000px] h-[750px] bg-black/95 backdrop-blur-sm"
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

              {apiError && (
                <div className="bg-red-900/40 backdrop-blur-sm rounded-xl p-4 border border-red-500/30">
                  <div className="text-red-400 text-sm">{apiError}</div>
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
                  try {
                    setGameStarted(false);
                    setGameOver(false);
                    if (phaserGameRef.current) {
                      phaserGameRef.current.destroy(true);
                    }
                  } catch (error) {
                    console.error("메뉴 이동 오류:", error);
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
