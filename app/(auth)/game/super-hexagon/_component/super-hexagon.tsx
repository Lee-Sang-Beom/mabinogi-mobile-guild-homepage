"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import * as Tone from "tone";
import moment from "moment";
import type { GameProps } from "../../internal";
import { useCreateGame } from "../../hooks/use-create-game";
import { useGetGamesByGameType } from "../../hooks/use-get-games-by-game-type";
import type { GameCreateRequest } from "../../api";

// 게임 상수 - 균형 잡힌 난이도로 조정
const GAME_CONFIG = {
  width: 800,
  height: 600,
  centerX: 400,
  centerY: 300,
  innerRadius: 35,
  playerRadius: 8,
  wallThickness: 25, // 3D 효과를 위해 두께 증가
  initialWallSpeed: 7, // 8 -> 7로 감소 (약간 느리게)
  maxWallSpeed: 14, // 16 -> 14로 감소 (최대 속도 조정)
  spawnInterval: 100, // 90 -> 100으로 증가 (벽 생성 간격 늘리기)
  minSpawnInterval: 45, // 35 -> 45로 증가 (최소 간격 늘리기)
  mazeSpawnInterval: 25, // 20 -> 25로 증가 (미로 모드 간격 늘리기)
  pulseFrequency: 3,
  pulseIntensity: 0.2,
  rotationChance: 0.006, // 0.008 -> 0.006으로 감소 (회전 빈도 줄이기)
  rotationDelay: 250, // 200 -> 250으로 증가 (회전 시작 지연 늘리기)
  // 3D 효과 설정
  wall3D: {
    depth: 40, // 벽의 깊이
    perspective: 0.7, // 원근감 강도
    shadowOffset: 8, // 그림자 오프셋
  },
  // 다양한 회전 패턴 정의 (속도 다양화)
  rotationPatterns: [
    // 짧은 회전 (왔다갔다) - 다양한 속도
    {
      type: "short",
      durationRange: [25, 45],
      angle: Math.PI / 3,
      reverses: true,
    }, // 약간 느리게
    {
      type: "short",
      durationRange: [30, 55],
      angle: Math.PI / 2,
      reverses: true,
    },
    {
      type: "short",
      durationRange: [20, 40],
      angle: Math.PI / 4,
      reverses: true,
    },

    // 중간 회전 - 다양한 속도
    {
      type: "medium",
      durationRange: [50, 90],
      angle: Math.PI,
      reverses: false,
    }, // 약간 느리게
    {
      type: "medium",
      durationRange: [60, 110],
      angle: Math.PI * 1.5,
      reverses: false,
    },
    {
      type: "medium",
      durationRange: [40, 80],
      angle: Math.PI * 0.75,
      reverses: false,
    },

    // 긴 연속 회전 (한 방향으로 쭈우우우욱) - 다양한 속도
    {
      type: "long",
      durationRange: [90, 160],
      angle: Math.PI * 2,
      reverses: false,
    }, // 약간 느리게
    {
      type: "long",
      durationRange: [110, 190],
      angle: Math.PI * 3,
      reverses: false,
    },
    {
      type: "long",
      durationRange: [70, 130],
      angle: Math.PI * 1.5,
      reverses: false,
    },

    // 새로운 초고속/초저속 회전 패턴 (빈도 조정)
    {
      type: "ultra_fast",
      durationRange: [15, 30],
      angle: Math.PI / 2,
      reverses: true,
    }, // 약간 느리게
    {
      type: "ultra_slow",
      durationRange: [140, 220],
      angle: Math.PI * 4,
      reverses: false,
    },
  ],
  // 화면 흔들림 효과
  screenShake: {
    intensity: 2,
    frequency: 0.1,
  },
  // 미로 패턴 타입
  mazePatterns: [
    "spiral_right", // 오른쪽으로 나선형 (꾸우우욱)
    "spiral_left", // 왼쪽으로 나선형 (꾸우우욱)
    "zigzag", // 지그재그 (좌우좌우)
    "wave", // 물결 패턴
    "tunnel", // 터널 패턴
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

    // 게임 컨테이너 생성 (모든 게임 요소를 담음)
    this.gameContainer = this.add.container(
      GAME_CONFIG.centerX,
      GAME_CONFIG.centerY
    );

    // 랜덤 배경음 선택
    this.selectedTrack =
      GAME_CONFIG.backgroundTracks[
        Math.floor(Math.random() * GAME_CONFIG.backgroundTracks.length)
      ];
    console.log(`선택된 배경음: ${this.selectedTrack}`);

    // 배경음 설정
    try {
      this.backgroundMusic = new Tone.Player({
        url: this.selectedTrack,
        loop: true,
        volume: -10,
      }).toDestination();

      // 로드 완료 후 재생
      this.backgroundMusic
        .load(this.selectedTrack)
        .then(() => {
          this.backgroundMusic?.start();
        })
        .catch((error) => {
          console.warn("배경음 로드 실패:", error);
        });
    } catch (error) {
      console.warn("배경음 초기화 실패:", error);
    }

    // 사운드 이펙트 설정
    this.hitSound = new Tone.Synth({
      oscillator: { type: "sawtooth" },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.1 },
    }).toDestination();

    this.moveSound = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.01, decay: 0.05, sustain: 0, release: 0.05 },
    }).toDestination();
    this.moveSound.volume.value = -20;

    // 디버그 그래픽 (충돌 판정 시각화)
    this.debugGraphics = this.add.graphics();
    this.gameContainer.add(this.debugGraphics);

    // 게임 데이터 초기화
    this.gameData = {
      player: null,
      playerAngle: 0,
      walls: [],
      gameTime: 0,
      isGameOver: false,
      cursors: null,
      wasd: null,
      wallSpeed: GAME_CONFIG.initialWallSpeed,
      spawnTimer: 0,
      spawnInterval: GAME_CONFIG.spawnInterval,
      currentHue: 0,
      pulsePhase: 0,
      lastMoveTime: 0,
      cameraShake: 0,
      beatTime: 0,
      debug: false,
      // 화면 회전 관련
      isRotating: false,
      rotationDirection: 0,
      rotationTimer: 0,
      rotationStartDelay: GAME_CONFIG.rotationDelay,
      totalRotation: 0,
      targetRotation: 0,
      currentRotationPattern: null,
      rotationPhase: 0,
      // 화면 효과
      screenShakeOffset: { x: 0, y: 0 },
      globalPulse: 0,
      // 벽 패턴 관련
      mazeMode: false,
      mazeDirection: 0,
      mazeLength: 0,
      mazeProgress: 0,
      mazePattern: "spiral_right",
      // 강화된 안전지대 연속 방지
      lastSafeZones: [], // 최근 안전지대 위치들
      consecutivePreventionStrength: 0, // 연속 방지 강도
    };

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

  private setupPlayer() {
    const { innerRadius, playerRadius } = GAME_CONFIG;

    // 플레이어 생성 (삼각형)
    this.gameData.player = this.add.triangle(
      0,
      -(innerRadius + playerRadius + 5),
      0,
      -playerRadius,
      -playerRadius * 0.8,
      playerRadius,
      playerRadius * 0.8,
      playerRadius,
      0xffffff
    );
    this.gameData.player.setStrokeStyle(2, 0x00ffff);

    // 컨테이너에 추가
    this.gameContainer?.add(this.gameData.player);
  }

  private setupInput() {
    this.gameData.cursors = this.input.keyboard?.createCursorKeys();
    this.gameData.wasd = this.input.keyboard?.addKeys("W,S,A,D");

    // 디버그 모드 토글 (D 키)
    this.input.keyboard?.on("keydown-D", () => {
      this.gameData.debug = !this.gameData.debug;
      console.log("디버그 모드:", this.gameData.debug);
    });
  }

  private setupCenterHexagon() {
    const { innerRadius } = GAME_CONFIG;

    // 중앙 육각형 생성 (별도 객체로 저장)
    this.centerHexagon = this.add.graphics();
    this.drawHexagon(this.centerHexagon, 0, 0, innerRadius, 0xffffff, 3);

    // 컨테이너에 추가
    this.gameContainer?.add(this.centerHexagon);
  }

  private drawHexagon(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    radius: number,
    color: number,
    lineWidth = 2
  ) {
    graphics.clear();
    graphics.lineStyle(lineWidth, color, 1);
    graphics.beginPath();

    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
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

  private updateGame() {
    if (this.gameData.isGameOver) return;

    this.gameData.gameTime++;
    const currentScore = Math.floor(this.gameData.gameTime / 60);

    // 스코어 업데이트
    if (this.onScoreUpdate) {
      this.onScoreUpdate(currentScore);
    }

    this.updateVisuals();
    this.updateRotation();
    this.handleInput();
    this.updatePlayer();
    this.updateCenterHexagon();
    this.spawnWalls();
    this.updateWalls();
    this.updateDifficulty();

    // 디버그 정보 업데이트
    if (this.gameData.debug) {
      this.updateDebugInfo();
    } else {
      this.debugGraphics?.clear();
    }
  }

  private updateVisuals() {
    // 색상 변화
    this.gameData.currentHue = (this.gameData.currentHue + 0.8) % 360;
    const bgColor = Phaser.Display.Color.HSVToRGB(
      this.gameData.currentHue / 360,
      0.7,
      0.1
    );
    this.cameras.main.setBackgroundColor(bgColor.color);

    // 전체적인 화면 펄스 효과
    this.gameData.globalPulse += 0.08;
    const globalPulseIntensity = Math.sin(this.gameData.globalPulse) * 0.5;

    // 화면 흔들림 효과 (항상 적용)
    const { screenShake } = GAME_CONFIG;
    this.gameData.screenShakeOffset.x =
      (Math.random() - 0.5) * screenShake.intensity + globalPulseIntensity;
    this.gameData.screenShakeOffset.y =
      (Math.random() - 0.5) * screenShake.intensity + globalPulseIntensity;

    // 게임 컨테이너에 흔들림 적용
    if (this.gameContainer) {
      this.gameContainer.x =
        GAME_CONFIG.centerX + this.gameData.screenShakeOffset.x;
      this.gameContainer.y =
        GAME_CONFIG.centerY + this.gameData.screenShakeOffset.y;
    }

    // 펄스 효과
    this.gameData.pulsePhase += 0.05;

    // 카메라 흔들림 효과 (게임오버 시에만)
    if (this.gameData.cameraShake > 0) {
      this.cameras.main.shake(100, 0.01);
      this.gameData.cameraShake--;
    }
  }

  private updateRotation() {
    const { rotationChance, rotationPatterns } = GAME_CONFIG;

    // 시작 지연 시간 감소
    if (this.gameData.rotationStartDelay > 0) {
      this.gameData.rotationStartDelay--;
      return;
    }

    // 랜덤하게 회전 시작
    if (!this.gameData.isRotating && Math.random() < rotationChance) {
      this.gameData.isRotating = true;
      this.gameData.rotationDirection = Math.random() < 0.5 ? -1 : 1;

      // 랜덤한 회전 패턴 선택
      const pattern =
        rotationPatterns[Math.floor(Math.random() * rotationPatterns.length)];

      // 패턴의 duration 범위에서 랜덤하게 선택
      const minDuration = pattern.durationRange[0];
      const maxDuration = pattern.durationRange[1];
      const randomDuration =
        Math.floor(Math.random() * (maxDuration - minDuration + 1)) +
        minDuration;

      this.gameData.currentRotationPattern = {
        ...pattern,
        duration: randomDuration, // 랜덤 duration 적용
      };
      this.gameData.rotationTimer = randomDuration;
      this.gameData.rotationPhase = 0;

      console.log(
        `회전 시작: ${pattern.type} 패턴 (${randomDuration}프레임), ${this.gameData.rotationDirection > 0 ? "오른쪽" : "왼쪽"}`
      );
    }

    // 회전 중일 때
    if (this.gameData.isRotating && this.gameData.currentRotationPattern) {
      this.gameData.rotationTimer--;
      const pattern = this.gameData.currentRotationPattern;

      const progress = 1 - this.gameData.rotationTimer / pattern.duration;
      let currentAngle = 0;

      if (
        pattern.reverses &&
        (pattern.type === "short" || pattern.type === "ultra_fast")
      ) {
        // 왔다갔다 회전 (짧은 회전, 초고속 회전)
        if (progress < 0.5) {
          // 첫 번째 절반: 정방향 회전
          currentAngle =
            progress * 2 * pattern.angle * this.gameData.rotationDirection;
        } else {
          // 두 번째 절반: 역방향 회전
          const reverseProgress = (progress - 0.5) * 2;
          currentAngle =
            (1 - reverseProgress) *
            pattern.angle *
            this.gameData.rotationDirection;
        }
      } else {
        // 연속 회전 (중간/긴 회전, 초저속 회전)
        currentAngle =
          progress * pattern.angle * this.gameData.rotationDirection;
      }

      // 게임 컨테이너 회전 적용
      if (this.gameContainer) {
        this.gameContainer.setRotation(
          this.gameData.totalRotation + currentAngle
        );
      }

      // 회전 완료
      if (this.gameData.rotationTimer <= 0) {
        this.gameData.isRotating = false;

        if (!pattern.reverses) {
          // 연속 회전의 경우 누적 각도 업데이트
          this.gameData.totalRotation =
            (this.gameData.totalRotation +
              pattern.angle * this.gameData.rotationDirection) %
            (Math.PI * 2);
        }

        if (this.gameContainer) {
          this.gameContainer.setRotation(this.gameData.totalRotation);
        }

        console.log("회전 완료");
      }
    }
  }

  private updateCenterHexagon() {
    const { innerRadius, pulseFrequency, pulseIntensity } = GAME_CONFIG;

    // 비트 시간 업데이트 (초당 pulseFrequency 횟수로 맥동)
    this.gameData.beatTime += 0.016;
    const beatPhase = Math.sin(
      this.gameData.beatTime * Math.PI * 2 * pulseFrequency
    );

    // 크기 변화 계산 (기본 크기의 ±pulseIntensity%)
    const scaleFactor = 1 + beatPhase * pulseIntensity;
    const currentRadius = innerRadius * scaleFactor;

    // 육각형 다시 그리기
    if (this.centerHexagon) {
      this.drawHexagon(this.centerHexagon, 0, 0, currentRadius, 0xffffff, 3);
    }
  }

  private handleInput() {
    const { cursors, wasd } = this.gameData;
    const currentTime = this.time.now;
    const moveSpeed = 0.12; // 0.15 -> 0.14로 약간 감소 (플레이어 속도 조정)

    let moved = false;

    if (cursors?.left.isDown || wasd?.A.isDown) {
      this.gameData.playerAngle -= moveSpeed;
      moved = true;
    }
    if (cursors?.right.isDown || wasd?.D.isDown) {
      this.gameData.playerAngle += moveSpeed;
      moved = true;
    }

    // 이동 사운드
    if (moved && currentTime - this.gameData.lastMoveTime > 100) {
      this.moveSound?.triggerAttackRelease("C5", "32n");
      this.gameData.lastMoveTime = currentTime;
    }
  }

  private updatePlayer() {
    const { innerRadius, playerRadius } = GAME_CONFIG;
    const { playerAngle } = this.gameData;

    // 플레이어 위치 업데이트
    const playerDistance = innerRadius + playerRadius + 8;
    const playerX = Math.cos(playerAngle) * playerDistance;
    const playerY = Math.sin(playerAngle) * playerDistance;

    this.gameData.player?.setPosition(playerX, playerY);
    this.gameData.player?.setRotation(playerAngle + Math.PI / 2);

    // 플레이어 색상 변화
    const playerColor = Phaser.Display.Color.HSVToRGB(
      (this.gameData.currentHue + 180) / 360,
      1,
      1
    );
    this.gameData.player?.setFillStyle(playerColor.color);
  }

  private spawnWalls() {
    this.gameData.spawnTimer++;

    // 미로 모드일 때는 더 빠른 간격으로 벽 생성
    const currentInterval = this.gameData.mazeMode
      ? GAME_CONFIG.mazeSpawnInterval
      : this.gameData.spawnInterval;

    if (this.gameData.spawnTimer >= currentInterval) {
      this.createWallRing();
      this.gameData.spawnTimer = 0;
    }
  }

  private createWallRing() {
    const startRadius = 450;

    // 벽 패턴 생성
    const wallPattern = this.generateWallPattern();

    // 현재 색상
    const wallColor = Phaser.Display.Color.HSVToRGB(
      this.gameData.currentHue / 360,
      0.9,
      0.8
    );

    const wallRing = this.add.graphics();

    // 컨테이너에 추가
    this.gameContainer?.add(wallRing);

    // 벽 데이터를 안전하게 저장
    wallRing.setData("radius", startRadius);
    wallRing.setData("wallPattern", [...wallPattern]);
    wallRing.setData("originalPattern", [...wallPattern]);
    wallRing.setData("color", wallColor.color);
    wallRing.setData("collisionChecked", false);
    wallRing.setData("wallId", Date.now() + Math.random());

    this.updateWallRing(wallRing);
    this.gameData.walls.push(wallRing);
  }

  private generateWallPattern(): boolean[] {
    // 35% 확률로 미로 모드 활성화 (40% -> 35%로 감소)
    if (Math.random() < 0.35 && !this.gameData.mazeMode) {
      this.gameData.mazeMode = true;
      this.gameData.mazeDirection = Math.floor(Math.random() * 6);
      this.gameData.mazeLength = Math.floor(Math.random() * 10) + 6; // 8-17 -> 6-15로 조정
      this.gameData.mazeProgress = 0;

      // 랜덤한 미로 패턴 선택
      const patterns = GAME_CONFIG.mazePatterns;
      this.gameData.mazePattern =
        patterns[Math.floor(Math.random() * patterns.length)];

      console.log(
        `미로 모드 시작: ${this.gameData.mazePattern} 패턴, 시작위치 ${this.gameData.mazeDirection}, 길이 ${this.gameData.mazeLength}`
      );
    }

    if (this.gameData.mazeMode) {
      // 미로 패턴 생성 (기존 로직 유지)
      const pattern = new Array(6).fill(true);
      let escapeGap = this.gameData.mazeDirection;

      switch (this.gameData.mazePattern) {
        case "spiral_right":
          escapeGap =
            (this.gameData.mazeDirection +
              Math.floor(this.gameData.mazeProgress / 2)) %
            6;
          break;

        case "spiral_left":
          escapeGap =
            (this.gameData.mazeDirection -
              Math.floor(this.gameData.mazeProgress / 2) +
              6) %
            6;
          break;

        case "zigzag":
          if (this.gameData.mazeProgress % 4 < 2) {
            escapeGap =
              (this.gameData.mazeDirection + (this.gameData.mazeProgress % 2)) %
              6;
          } else {
            escapeGap =
              (this.gameData.mazeDirection -
                (this.gameData.mazeProgress % 2) +
                6) %
              6;
          }
          break;

        case "wave":
          const waveOffset = Math.floor(
            Math.sin(this.gameData.mazeProgress * 0.5) * 2
          );
          escapeGap = (this.gameData.mazeDirection + waveOffset + 6) % 6;
          break;

        case "tunnel":
          if (
            this.gameData.mazeProgress % 6 === 0 &&
            this.gameData.mazeProgress > 0
          ) {
            this.gameData.mazeDirection = (this.gameData.mazeDirection + 2) % 6;
          }
          escapeGap = this.gameData.mazeDirection;
          break;
      }

      pattern[escapeGap] = false;

      this.gameData.mazeProgress++;

      // 미로 모드 종료 조건
      if (this.gameData.mazeProgress >= this.gameData.mazeLength) {
        this.gameData.mazeMode = false;
        console.log("미로 모드 종료");
      }

      return pattern;
    } else {
      // 균형 잡힌 기본 패턴 - 연속 안전지대 방지 + 적절한 난이도
      const pattern = new Array(6).fill(false);

      // 시간에 따른 난이도 증가 (더 완만하게)
      const timeInSeconds = this.gameData.gameTime / 60;
      const difficultyFactor = Math.min(timeInSeconds / 20, 1); // 15초 -> 20초로 증가 (더 완만한 증가)

      // 기본 벽 개수를 적절하게 (2-4개)
      const baseWallCount = Math.floor(Math.random() * 3) + 2; // 2-4개 벽

      // 난이도에 따라 벽 개수 추가 (더 완만하게)
      const bonusWalls = Math.floor(difficultyFactor * 1.5); // 최대 1.5개 추가 (2개 -> 1.5개로 감소)
      const maxWalls = Math.min(4, baseWallCount + bonusWalls); // 최대 4개 (최소 2개 안전지대 보장)

      // 모든 위치에서 시작
      let availablePositions = [0, 1, 2, 3, 4, 5];

      // 강화된 연속 방지 로직 (기존과 동일)
      if (this.gameData.lastSafeZones.length > 0) {
        const recentSafeZones: number[] = this.gameData.lastSafeZones;
        const strictlyForbiddenPositions = new Set<number>();

        // 최근 안전지대들과 완전히 다른 위치만 허용
        recentSafeZones.forEach((recentZone: number) => {
          // 해당 위치와 인접한 모든 위치를 엄격하게 금지
          strictlyForbiddenPositions.add(recentZone); // 정확히 같은 위치
          strictlyForbiddenPositions.add((recentZone - 1 + 6) % 6); // 왼쪽 인접
          strictlyForbiddenPositions.add((recentZone + 1) % 6); // 오른쪽 인접

          // 최근 안전지대가 2개 이상이면 더 넓은 범위 금지
          if (recentSafeZones.length >= 2) {
            strictlyForbiddenPositions.add((recentZone - 2 + 6) % 6); // 2칸 왼쪽
            strictlyForbiddenPositions.add((recentZone + 2) % 6); // 2칸 오른쪽
          }
        });

        // 금지된 위치들을 완전히 제외
        availablePositions = availablePositions.filter(
          (pos) => !strictlyForbiddenPositions.has(pos)
        );

        // 디버그 로그
        if (this.gameData.debug) {
          console.log(
            `금지된 위치들: [${Array.from(strictlyForbiddenPositions).join(", ")}]`
          );
          console.log(`사용 가능한 위치들: [${availablePositions.join(", ")}]`);
        }
      }

      // 사용 가능한 위치가 너무 적으면 게임 진행을 위해 최소한만 허용
      if (availablePositions.length < 2) {
        // 최소한의 안전장치: 바로 직전 안전지대만 피하기
        availablePositions = [0, 1, 2, 3, 4, 5];

        if (this.gameData.lastSafeZones.length > 0) {
          const lastSafeZone =
            this.gameData.lastSafeZones[this.gameData.lastSafeZones.length - 1];
          // 바로 직전 안전지대와 정확히 같은 위치만 제외
          availablePositions = availablePositions.filter(
            (pos: number) => pos !== lastSafeZone
          );
        }

        // 연속 방지 강도 증가
        this.gameData.consecutivePreventionStrength = Math.min(
          this.gameData.consecutivePreventionStrength + 1,
          5
        );

        if (this.gameData.debug) {
          console.log(
            `안전장치 발동! 연속 방지 강도: ${this.gameData.consecutivePreventionStrength}`
          );
        }
      } else {
        // 성공적으로 연속을 방지했으면 강도 감소
        this.gameData.consecutivePreventionStrength = Math.max(
          this.gameData.consecutivePreventionStrength - 1,
          0
        );
      }

      // 벽 배치 (반드시 최소 2개 안전지대 남겨두기)
      const wallsToPlace = Math.min(
        maxWalls,
        Math.max(0, availablePositions.length - 2)
      );

      for (let i = 0; i < wallsToPlace; i++) {
        if (availablePositions.length <= 2) break; // 안전지대 2개는 반드시 보장

        const randomIndex = Math.floor(
          Math.random() * availablePositions.length
        );
        const position = availablePositions[randomIndex];
        pattern[position] = true;
        availablePositions.splice(randomIndex, 1);
      }

      // 새로운 안전지대 위치들 중에서 가장 적절한 것 선택
      const newSafeZones = [];
      for (let i = 0; i < 6; i++) {
        if (!pattern[i]) {
          newSafeZones.push(i);
        }
      }

      // 안전지대가 있는 경우에만 기록 업데이트
      if (newSafeZones.length > 0) {
        let selectedSafeZone = newSafeZones[0];

        // 이전 안전지대들과 가장 멀리 떨어진 위치 선택
        if (this.gameData.lastSafeZones.length > 0) {
          let maxMinDistance = 0;

          newSafeZones.forEach((zone: number) => {
            let minDistanceToRecent = 6; // 최대 거리로 초기화

            this.gameData.lastSafeZones.forEach((recentZone: number) => {
              const distance = Math.min(
                Math.abs(zone - recentZone),
                6 - Math.abs(zone - recentZone)
              );
              minDistanceToRecent = Math.min(minDistanceToRecent, distance);
            });

            if (minDistanceToRecent > maxMinDistance) {
              maxMinDistance = minDistanceToRecent;
              selectedSafeZone = zone;
            }
          });
        }

        // 선택된 안전지대 기록
        this.gameData.lastSafeZones.push(selectedSafeZone);

        // 최근 3개만 유지 (더 긴 기억으로 연속 방지 강화)
        if (this.gameData.lastSafeZones.length > 3) {
          this.gameData.lastSafeZones.shift();
        }
      }

      // 디버그 로그
      if (this.gameData.debug) {
        const safeZoneCount = pattern.filter((wall) => !wall).length;
        console.log(
          `벽 패턴 생성: 벽 ${pattern.filter((wall) => wall).length}개, 안전지대 ${safeZoneCount}개`
        );
        console.log(
          `최근 안전지대: [${this.gameData.lastSafeZones.join(", ")}]`
        );
        console.log(
          `연속 방지 강도: ${this.gameData.consecutivePreventionStrength}`
        );
        console.log(
          `난이도 계수: ${difficultyFactor.toFixed(2)}, 벽 개수: ${wallsToPlace}`
        );
      }

      return pattern;
    }
  }

  // 3D 스타일 벽 렌더링
  private updateWallRing(wallRing: Phaser.GameObjects.Graphics) {
    const { wallThickness, wall3D } = GAME_CONFIG;
    const radius = wallRing.getData("radius");
    let wallPattern = wallRing.getData("wallPattern");
    const baseColor = wallRing.getData("color");
    const wallId = wallRing.getData("wallId");

    // 패턴 유효성 검사
    if (
      !wallPattern ||
      !Array.isArray(wallPattern) ||
      wallPattern.length !== 6
    ) {
      const originalPattern = wallRing.getData("originalPattern");
      if (
        originalPattern &&
        Array.isArray(originalPattern) &&
        originalPattern.length === 6
      ) {
        wallPattern = [...originalPattern];
        wallRing.setData("wallPattern", wallPattern);
      } else {
        wallRing.destroy();
        return;
      }
    }

    wallRing.clear();

    // 거리에 따른 원근감 계산
    const distanceFromCenter = Math.abs(radius - 200); // 200은 기준 거리
    const perspectiveFactor =
      1 - (distanceFromCenter / 400) * wall3D.perspective;
    const currentThickness = wallThickness * perspectiveFactor;

    // 색상 계산 (거리에 따른 밝기 조절)
    const brightness = Math.max(0.3, perspectiveFactor);
    const baseColorObj = Phaser.Display.Color.ValueToColor(baseColor);
    const lightColor = Phaser.Display.Color.Interpolate.ColorWithColor(
      baseColorObj,
      Phaser.Display.Color.ValueToColor(0xffffff),
      255,
      Math.floor(brightness * 76) // 0-255 범위로 변환
    );
    const shadowColor = Phaser.Display.Color.Interpolate.ColorWithColor(
      baseColorObj,
      Phaser.Display.Color.ValueToColor(0x000000),
      255,
      Math.floor((1 - brightness) * 127) // 0-255 범위로 변환
    );

    // 6개의 육각형 변을 3D 스타일로 그리기
    for (let i = 0; i < 6; i++) {
      if (wallPattern[i]) {
        const segmentStartAngle = (i * Math.PI) / 3;
        const segmentEndAngle = ((i + 1) * Math.PI) / 3;

        // 외부 벽 좌표
        const outerStartX = Math.cos(segmentStartAngle) * radius;
        const outerStartY = Math.sin(segmentStartAngle) * radius;
        const outerEndX = Math.cos(segmentEndAngle) * radius;
        const outerEndY = Math.sin(segmentEndAngle) * radius;

        // 내부 벽 좌표
        const innerRadius = radius - currentThickness;
        const innerStartX = Math.cos(segmentStartAngle) * innerRadius;
        const innerStartY = Math.sin(segmentStartAngle) * innerRadius;
        const innerEndX = Math.cos(segmentEndAngle) * innerRadius;
        const innerEndY = Math.sin(segmentEndAngle) * innerRadius;

        // 그림자 효과 (뒤쪽 면)
        wallRing.fillStyle(shadowColor.color, 0.8);
        wallRing.beginPath();
        wallRing.moveTo(
          outerStartX + wall3D.shadowOffset,
          outerStartY + wall3D.shadowOffset
        );
        wallRing.lineTo(
          outerEndX + wall3D.shadowOffset,
          outerEndY + wall3D.shadowOffset
        );
        wallRing.lineTo(
          innerEndX + wall3D.shadowOffset,
          innerEndY + wall3D.shadowOffset
        );
        wallRing.lineTo(
          innerStartX + wall3D.shadowOffset,
          innerStartY + wall3D.shadowOffset
        );
        wallRing.closePath();
        wallRing.fillPath();

        // 메인 벽 면 (밝은 색상)
        wallRing.fillStyle(lightColor.color, 1);
        wallRing.beginPath();
        wallRing.moveTo(outerStartX, outerStartY);
        wallRing.lineTo(outerEndX, outerEndY);
        wallRing.lineTo(innerEndX, innerEndY);
        wallRing.lineTo(innerStartX, innerStartY);
        wallRing.closePath();
        wallRing.fillPath();

        // 측면 효과 (더 어두운 색상)
        const sideColor = Phaser.Display.Color.Interpolate.ColorWithColor(
          baseColorObj,
          Phaser.Display.Color.ValueToColor(0x000000),
          255,
          76 // 30% 어둡게
        );

        // 왼쪽 측면
        wallRing.fillStyle(sideColor.color, 0.9);
        wallRing.beginPath();
        wallRing.moveTo(outerStartX, outerStartY);
        wallRing.lineTo(innerStartX, innerStartY);
        wallRing.lineTo(
          innerStartX + wall3D.shadowOffset,
          innerStartY + wall3D.shadowOffset
        );
        wallRing.lineTo(
          outerStartX + wall3D.shadowOffset,
          outerStartY + wall3D.shadowOffset
        );
        wallRing.closePath();
        wallRing.fillPath();

        // 오른쪽 측면
        wallRing.fillStyle(sideColor.color, 0.9);
        wallRing.beginPath();
        wallRing.moveTo(outerEndX, outerEndY);
        wallRing.lineTo(innerEndX, innerEndY);
        wallRing.lineTo(
          innerEndX + wall3D.shadowOffset,
          innerEndY + wall3D.shadowOffset
        );
        wallRing.lineTo(
          outerEndX + wall3D.shadowOffset,
          outerEndY + wall3D.shadowOffset
        );
        wallRing.closePath();
        wallRing.fillPath();

        // 하이라이트 효과 (가장 밝은 부분)
        const highlightColor = Phaser.Display.Color.Interpolate.ColorWithColor(
          baseColorObj,
          Phaser.Display.Color.ValueToColor(0xffffff),
          255,
          153 // 60% 밝게
        );

        wallRing.lineStyle(2, highlightColor.color, 0.8);
        wallRing.beginPath();
        wallRing.moveTo(outerStartX, outerStartY);
        wallRing.lineTo(outerEndX, outerEndY);
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

      const wallPattern = wall.getData("wallPattern");
      if (
        wallPattern &&
        Array.isArray(wallPattern) &&
        wallPattern.length === 6
      ) {
        this.updateWallRing(wall);
      } else {
        wall.destroy();
        this.gameData.walls.splice(i, 1);
        continue;
      }

      // 충돌 검사
      const playerDistance = innerRadius + 13;

      if (Math.abs(newRadius - playerDistance) < 4) {
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

    const collision = wallPattern[clampedSegmentIndex];

    if (this.gameData.debug) {
      wall.setData("debugInfo", {
        playerAngle: normalizedPlayerAngle,
        segmentIndex: clampedSegmentIndex,
        wallPattern: [...wallPattern],
        collision,
      });
    }

    return collision;
  }

  private updateDebugInfo() {
    if (!this.debugGraphics) return;

    const { innerRadius } = GAME_CONFIG;
    this.debugGraphics.clear();

    // 플레이어 위치 표시
    const playerDistance = innerRadius + 13;
    const playerAngle = this.gameData.playerAngle;
    const playerX = Math.cos(playerAngle) * playerDistance;
    const playerY = Math.sin(playerAngle) * playerDistance;

    this.debugGraphics.fillStyle(0xff0000, 0.5);
    this.debugGraphics.fillCircle(playerX, playerY, 5);

    // 플레이어가 있는 세그먼트 표시
    const normalizeAngle = (angle: number) => {
      let normalized = angle % (Math.PI * 2);
      if (normalized < 0) normalized += Math.PI * 2;
      return normalized;
    };

    const normalizedPlayerAngle = normalizeAngle(playerAngle);
    const segmentIndex = Math.floor(normalizedPlayerAngle / (Math.PI / 3));
    const clampedSegmentIndex = Math.max(0, Math.min(5, segmentIndex));

    // 플레이어 세그먼트 하이라이트
    const segmentStartAngle = clampedSegmentIndex * (Math.PI / 3);
    const segmentEndAngle = (clampedSegmentIndex + 1) * (Math.PI / 3);

    this.debugGraphics.lineStyle(3, 0x00ff00, 0.8);
    this.debugGraphics.beginPath();
    this.debugGraphics.arc(
      0,
      0,
      playerDistance,
      segmentStartAngle,
      segmentEndAngle
    );
    this.debugGraphics.strokePath();

    // 회전 상태 표시
    if (this.gameData.isRotating) {
      this.debugGraphics.fillStyle(0xffff00, 0.5);
      this.debugGraphics.fillCircle(0, 0, 10);
    }
  }

  private updateDifficulty() {
    const timeInSeconds = this.gameData.gameTime / 60;

    // 더 완만한 난이도 증가
    this.gameData.wallSpeed = Math.min(
      GAME_CONFIG.maxWallSpeed,
      GAME_CONFIG.initialWallSpeed + timeInSeconds / 25
    ); // 20 -> 25로 변경 (더 완만)
    this.gameData.spawnInterval = Math.max(
      GAME_CONFIG.minSpawnInterval,
      GAME_CONFIG.spawnInterval - timeInSeconds * 2.5
    ); // 3 -> 2.5로 변경 (더 완만)

    // 회전 빈도도 시간에 따라 증가 (더 완만하게)
    const baseRotationChance = 0.006;
    const maxRotationChance = 0.012; // 0.015 -> 0.012로 감소
    const rotationIncrease =
      Math.min(timeInSeconds / 60, 1) *
      (maxRotationChance - baseRotationChance);

    // 실시간으로 회전 확률 업데이트는 하지 않고, 로그만 출력
    if (this.gameData.debug && this.gameData.gameTime % 300 === 0) {
      // 5초마다 로그
      console.log(
        `난이도 업데이트: 벽속도 ${this.gameData.wallSpeed.toFixed(1)}, 생성간격 ${this.gameData.spawnInterval.toFixed(0)}`
      );
    }
  }

  private triggerGameOver() {
    this.gameData.isGameOver = true;
    this.gameData.cameraShake = 10;

    this.hitSound?.triggerAttackRelease("C2", "4n");

    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
    }

    const finalScore = Math.floor(this.gameData.gameTime / 60);
    if (this.onGameOver) {
      this.onGameOver(finalScore);
    }
  }

  destroy() {
    // 리소스 정리
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
    // Scene의 destroy는 Phaser에서 자동 처리되므로 호출하지 않음
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
    // 최고 점수 로드
    const saved = localStorage.getItem("super-hexagon-best");
    if (saved) {
      setBestScore(Number.parseInt(saved));
    }
    setIsLoading(false);
  }, []);

  // 스코어 저장 함수
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
    [rankingData, createGameMutation, refetchRanking, user]
  );

  const startGame = async () => {
    if (phaserGameRef.current) {
      phaserGameRef.current.destroy(true);
    }

    setGameStarted(true);
    setGameOver(false);
    setScore(0);

    // DOM 렌더링 후 게임 초기화
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

        // 씬에 콜백 전달
        phaserGameRef.current.scene.start("GameScene", {
          onScoreUpdate: (newScore: number) => setScore(newScore),
          onGameOver: (finalScore: number) => {
            setGameOver(true);

            // 최고 점수 업데이트
            if (finalScore > bestScore) {
              setBestScore(finalScore);
              localStorage.setItem("super-hexagon-best", finalScore.toString());
            }

            // 점수 저장
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
      <div className="h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* 애니메이션 배경 요소들 */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-pink-400 rounded-full animate-ping"></div>
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-purple-400 rounded-full animate-ping delay-300"></div>
          <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-cyan-400 rounded-full animate-ping delay-700"></div>
          <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-pink-300 rounded-full animate-ping delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative z-10 max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 게임 시작 섹션 */}
          <div className="bg-black/80 backdrop-blur-xl rounded-2xl border-2 border-pink-500/30 shadow-2xl shadow-pink-500/20 p-8 text-center">
            <div className="mb-6">
              {/* 애니메이션 육각형 로고 */}
              <div className="relative mx-auto w-24 h-24 mb-4">
                <div
                  className="absolute inset-0 border-4 border-pink-500/50 transform rotate-0 animate-spin-slow"
                  style={{
                    clipPath:
                      "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                  }}
                ></div>
                <div
                  className="absolute inset-2 border-4 border-purple-500/50 transform rotate-180 animate-spin-slow"
                  style={{
                    clipPath:
                      "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                  }}
                ></div>
                <div
                  className="absolute inset-4 border-4 border-cyan-500/50 transform rotate-0 animate-spin-slow"
                  style={{
                    clipPath:
                      "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                  }}
                ></div>
              </div>

              <h1 className="text-4xl font-black mb-3 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
                SUPER HEXAGON
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto rounded-full mb-4"></div>
              <p className="text-lg text-gray-300 font-light">
                극한의 반사신경 테스트!
              </p>
            </div>

            <div className="mb-6 space-y-3">
              <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
                <h3 className="text-md font-bold text-white mb-2 flex items-center justify-center gap-2">
                  <span className="text-xl">🎮</span> 조작법
                </h3>
                <div className="text-gray-300 space-y-1 text-sm">
                  <p>← → 또는 A D: 좌우 회전</p>
                  <p>다가오는 벽들 사이의 틈을 통과하세요!</p>
                  <p className="text-pink-400 font-semibold">
                    5초 후 화면 회전 시작!
                  </p>
                </div>
              </div>

              {bestScore > 0 && (
                <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-xl p-3 border border-yellow-500/30">
                  <h3 className="text-md font-bold text-yellow-400 mb-1 flex items-center justify-center gap-2">
                    <span className="text-xl">🏆</span> 최고 기록
                  </h3>
                  <p className="text-2xl font-bold text-white">{bestScore}초</p>
                </div>
              )}
            </div>

            <button
              onClick={startGame}
              className="group relative overflow-hidden bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 hover:from-pink-500 hover:via-purple-500 hover:to-cyan-500 text-white px-8 py-4 rounded-xl font-bold text-xl shadow-lg shadow-purple-500/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/40"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="relative flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                <span>게임 시작</span>
              </div>
            </button>
          </div>

          {/* 랭킹 섹션 */}
          <div className="bg-black/80 backdrop-blur-xl rounded-2xl border-2 border-slate-600/30 shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-sm font-bold text-slate-900">🏆</span>
              </div>
              <h3 className="text-2xl font-bold text-white">명예의 전당</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-yellow-400/50 to-transparent"></div>
            </div>
            {renderRanking()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* 게임 UI */}
      <div className="absolute top-4 left-4 z-10 space-y-4">
        <div className="bg-black/80 backdrop-blur-xl px-6 py-3 rounded-xl border border-cyan-500/30 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-cyan-400 font-medium">시간</span>
            <span className="text-white font-bold text-xl">{score}초</span>
          </div>
        </div>

        <div className="bg-black/80 backdrop-blur-xl px-6 py-3 rounded-xl border border-yellow-500/30 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="text-yellow-400 font-medium">최고</span>
            <span className="text-white font-bold text-xl">{bestScore}초</span>
          </div>
        </div>
      </div>

      {/* 게임 캔버스 */}
      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-pink-600/20 via-purple-600/20 to-cyan-600/20 rounded-xl blur-lg animate-pulse"></div>
        <div
          ref={gameRef}
          className="relative border-2 border-purple-500/50 rounded-lg shadow-2xl w-[800px] h-[600px] bg-black"
        />
      </div>

      {/* 게임 오버 화면 */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-20">
          <div className="bg-gradient-to-br from-red-900/90 to-purple-900/90 backdrop-blur-xl rounded-3xl border border-red-500/30 shadow-2xl shadow-red-500/20 p-12 max-w-lg w-full text-center mx-4">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full mb-4 shadow-lg shadow-red-500/50 animate-pulse">
                <span className="text-4xl">💥</span>
              </div>
              <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 mb-2">
                GAME OVER
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-orange-500 mx-auto rounded-full"></div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-black/50 rounded-xl p-4 border border-gray-700/50">
                <div className="text-gray-400 text-sm mb-1">생존 시간</div>
                <div className="text-3xl font-bold text-white">{score}초</div>
              </div>

              {score === bestScore && score > 0 && (
                <div className="bg-yellow-900/30 rounded-xl p-4 border border-yellow-500/30 animate-pulse">
                  <div className="text-yellow-400 font-bold flex items-center justify-center gap-2">
                    <span className="text-2xl">🎉</span> 새로운 기록!
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={restartGame}
                className="flex-1 group relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-6 py-4 rounded-xl font-bold shadow-lg shadow-green-500/30 transition-all duration-300 hover:scale-105"
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
                className="flex-1 group relative overflow-hidden bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-6 py-4 rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105"
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
        <div className="bg-black/80 backdrop-blur-xl px-6 py-3 rounded-xl border border-gray-500/30 shadow-lg">
          <div className="text-gray-300 text-sm text-center">
            ← → 또는 A D로 회전하여 벽을 피하세요! (D키: 디버그 모드)
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

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-spin-reverse {
          animation: spin-reverse 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
