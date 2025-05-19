"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { guildName } from "@/shared/constants/game";

interface IntroAnimationProps {
  onCompleteAction: () => void;
}

export default function IntroAnimation({
  onCompleteAction,
}: IntroAnimationProps) {
  const [step, setStep] = useState(0);
  const globeRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeRef3D = useRef<THREE.Mesh | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const connectionsRef = useRef<THREE.Line[]>([]);
  const isInitializedRef = useRef(false);
  const isMountedRef = useRef(true); // 컴포넌트 마운트 상태 추적

  // 메시지 배열
  const messages = [
    "안녕하세요! 방문해주셔서 감사합니다.",
    `여기는 ${guildName} 길드 홈페이지입니다.`,
    "저희는 모든 순간마다 만나는 인연을 소중히 여깁니다.",
    "여러분들이 저희의 여정에 합류하기를 결정하신다면",
    "저희는 언제나 그날을 손꼽아 기다릴 것입니다.",
    "서두가 길었네요! 이제 이동하시겠습니다!",
    "다시 한 번 환영합니다!",
  ];

  // 컴포넌트 마운트/언마운트 추적
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 3D 지구본 초기화 - step 의존성 제거하여 메시지 변경 시 재초기화 방지
  useEffect(() => {
    setTimeout(() => {
      if (!globeRef.current || isInitializedRef.current) return;

      // 초기화 플래그 설정
      isInitializedRef.current = true;

      // 씬, 카메라, 렌더러 설정
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(
        75,
        globeRef.current.clientWidth / globeRef.current.clientHeight,
        0.1,
        1000
      );
      camera.position.z = 2;
      cameraRef.current = camera;

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setSize(
        globeRef.current.clientWidth,
        globeRef.current.clientHeight
      );
      renderer.setClearColor(0x000000, 0); // 투명 배경
      globeRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // 지구본 생성
      const geometry = new THREE.SphereGeometry(1, 64, 64);

      // 지구본 텍스처 생성 (더 밝은 그라데이션)
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 512;
      const context = canvas.getContext("2d");
      if (context) {
        // 더 밝은 그라데이션 배경 생성
        const gradient = context.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, "#3b82f6"); // 더 밝은 파란색
        gradient.addColorStop(1, "#60a5fa"); // 더 밝은 하늘색
        context.fillStyle = gradient;
        context.fillRect(0, 0, 1024, 512);

        // 더 밝은 대륙 모양 추가
        context.fillStyle = "#93c5fd"; // 더 밝은 색상
        // 아시아
        context.beginPath();
        context.ellipse(700, 200, 150, 100, 0, 0, Math.PI * 2);
        context.fill();
        // 북미
        context.beginPath();
        context.ellipse(300, 180, 120, 80, 0, 0, Math.PI * 2);
        context.fill();
        // 남미
        context.beginPath();
        context.ellipse(350, 300, 70, 100, 0, 0, Math.PI * 2);
        context.fill();
        // 유럽
        context.beginPath();
        context.ellipse(550, 170, 60, 40, 0, 0, Math.PI * 2);
        context.fill();
        // 아프리카
        context.beginPath();
        context.ellipse(550, 270, 80, 100, 0, 0, Math.PI * 2);
        context.fill();
        // 호주
        context.beginPath();
        context.ellipse(800, 320, 60, 40, 0, 0, Math.PI * 2);
        context.fill();
      }

      const texture = new THREE.CanvasTexture(canvas);

      // 지구본 머티리얼 생성
      const material = new THREE.MeshPhongMaterial({
        map: texture,
        bumpScale: 0.05,
        shininess: 5,
        transparent: true,
        opacity: 0.9,
      });

      // 지구본 메시 생성
      const globe = new THREE.Mesh(geometry, material);
      scene.add(globe);
      globeRef3D.current = globe;

      // 조명 추가
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // 더 밝은 주변광
      scene.add(ambientLight);

      const pointLight = new THREE.PointLight(0x7c3aed, 1.2); // 더 밝은 포인트 라이트
      pointLight.position.set(5, 3, 5);
      scene.add(pointLight);

      // 마커 위치 정의 (주요 도시 위치)
      const markers = [
        { lat: 37.5665, lng: 126.978, name: "서울" },
        { lat: 35.6762, lng: 139.6503, name: "도쿄" },
        { lat: 40.7128, lng: -74.006, name: "뉴욕" },
        { lat: 51.5074, lng: -0.1278, name: "런던" },
        { lat: 48.8566, lng: 2.3522, name: "파리" },
        { lat: 22.3193, lng: 114.1694, name: "홍콩" },
        { lat: -33.8688, lng: 151.2093, name: "시드니" },
        { lat: 55.7558, lng: 37.6173, name: "모스크바" },
        { lat: 19.4326, lng: -99.1332, name: "멕시코시티" },
        { lat: -22.9068, lng: -43.1729, name: "리우데자네이루" },
        { lat: 1.3521, lng: 103.8198, name: "싱가포르" },
        { lat: 25.2048, lng: 55.2708, name: "두바이" },
        { lat: -1.2921, lng: 36.8219, name: "나이로비" },
        { lat: 41.0082, lng: 28.9784, name: "이스탄불" },
        { lat: 52.52, lng: 13.405, name: "베를린" },
      ];

      // 마커 및 연결선 위치 계산 함수
      const latLngToVector3 = (lat: number, lng: number, radius = 1) => {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);

        const x = -radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        return new THREE.Vector3(x, y, z);
      };

      // 다양한 색상 배열
      const colors = [
        0x4c9eeb, // 파란색
        0xf59e0b, // 주황색
        0x10b981, // 초록색
        0xef4444, // 빨간색
        0x8b5cf6, // 보라색
        0xec4899, // 핑크색
        0x06b6d4, // 청록색
        0xfbbf24, // 노란색
      ];

      // 마커 추가
      const markerPositions: THREE.Vector3[] = [];
      markers.forEach(({ lat, lng }) => {
        const position = latLngToVector3(lat, lng);
        markerPositions.push(position);

        const markerGeometry = new THREE.SphereGeometry(0.03, 16, 16);
        const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.copy(position);
        globe.add(marker);

        // 글로우 효과 추가
        const glowGeometry = new THREE.SphereGeometry(0.045, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: 0xf59e0b,
          transparent: true,
          opacity: 0.3,
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.copy(position);
        globe.add(glow);
      });

      // 연결선 추가 (모두가 연결된다는 느낌을 위해)
      connectionsRef.current = [];

      // 더 많은 연결선 생성 (각 도시에서 여러 도시로 연결)
      for (let i = 0; i < markerPositions.length; i++) {
        // 각 도시에서 최소 3개 이상의 연결선 생성
        const connectionsCount = 3 + Math.floor(Math.random() * 4); // 3~6개 연결
        const connectedCities = new Set<number>();

        for (let c = 0; c < connectionsCount; c++) {
          // 랜덤한 도시 선택 (자기 자신 제외)
          let j;
          do {
            j = Math.floor(Math.random() * markerPositions.length);
          } while (j === i || connectedCities.has(j));

          connectedCities.add(j);

          const start = markerPositions[i];
          const end = markerPositions[j];

          // 랜덤 색상 선택
          const colorIndex = Math.floor(Math.random() * colors.length);
          const lineColor = colors[colorIndex];

          // 곡선 형태의 연결선 생성
          const curvePoints = [];
          const segments = 20;

          for (let k = 0; k <= segments; k++) {
            const t = k / segments;
            const pt = new THREE.Vector3().lerpVectors(start, end, t);

            // 곡선 효과를 위해 중간 지점에서 약간 위로 올림
            if (k > 0 && k < segments) {
              const midPoint = t < 0.5 ? t * 2 : (1 - t) * 2;
              pt.normalize().multiplyScalar(
                1 + 0.1 * Math.sin(Math.PI * midPoint)
              );
            }

            curvePoints.push(pt);
          }

          const curve = new THREE.CatmullRomCurve3(curvePoints);
          const points = curve.getPoints(50);
          const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

          const lineMaterial = new THREE.LineBasicMaterial({
            color: lineColor,
            transparent: true,
            opacity: 0.6,
          });

          const line = new THREE.Line(lineGeometry, lineMaterial);
          globe.add(line);
          connectionsRef.current.push(line);
        }
      }

      // 애니메이션 함수
      const animate = () => {
        // 컴포넌트가 언마운트되었으면 애니메이션 중지
        if (!isMountedRef.current) return;

        if (
          !globeRef3D.current ||
          !rendererRef.current ||
          !sceneRef.current ||
          !cameraRef.current
        )
          return;

        // 지구본 회전 - 항상 일정한 속도로 회전
        if (globeRef3D.current) {
          globeRef3D.current.rotation.y += 0.005;
        }

        // 연결선 애니메이션 (깜빡임 효과)
        connectionsRef.current.forEach((line, index) => {
          const material = line.material as THREE.LineBasicMaterial;
          const time = Date.now() * 0.001;
          const offset = index * 0.1;
          material.opacity = 0.2 + 0.4 * Math.sin(time + offset);
        });

        // 렌더링
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        frameIdRef.current = requestAnimationFrame(animate);
      };

      // 애니메이션 시작
      animate();

      // 창 크기 변경 시 대응
      const handleResize = () => {
        if (!globeRef.current || !cameraRef.current || !rendererRef.current)
          return;

        cameraRef.current.aspect =
          globeRef.current.clientWidth / globeRef.current.clientHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(
          globeRef.current.clientWidth,
          globeRef.current.clientHeight
        );
      };

      window.addEventListener("resize", handleResize);

      // 정리 함수
      return () => {
        isMountedRef.current = false;
        window.removeEventListener("resize", handleResize);
        if (frameIdRef.current !== null) {
          cancelAnimationFrame(frameIdRef.current);
          frameIdRef.current = null;
        }
        if (rendererRef.current && globeRef.current) {
          try {
            globeRef.current.removeChild(rendererRef.current.domElement);
          } catch (e) {
            console.error("Error removing renderer:", e);
          }
        }
        // 참조 정리
        sceneRef.current = null;
        cameraRef.current = null;
        rendererRef.current = null;
        globeRef3D.current = null;
        connectionsRef.current = [];
      };
    }, 0);
  }, []); // 의존성 배열에서 step 제거

  // 애니메이션 단계 관리
  useEffect(() => {
    // 애니메이션 단계를 초기화
    setStep(0);

    // 타이머 설정 - 각 메시지마다 3.5초씩 표시 (간격 늘림)
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < messages.length; i++) {
      timers.push(
        setTimeout(() => {
          if (isMountedRef.current) {
            setStep(i);
          }
        }, i * 3500)
      );
    }

    // 마지막 메시지 후 애니메이션 완료
    const finalTimer = setTimeout(
      () => {
        if (isMountedRef.current) {
          onCompleteAction();
        }
      },
      messages.length * 3500 + 1500
    );

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      clearTimeout(finalTimer);
    };
  }, [onCompleteAction, messages.length]);

  return (
    <AnimatePresence>
      {step < messages.length && (
        <motion.div
          className="fixed inset-0 z-50 bg-black text-white w-screen h-screen"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
        >
          {/* 별이 올라가는 배경 효과 */}
          <div className="absolute inset-0 overflow-hidden ">
            {/* 고정된 별 배경 */}
            {Array.from({ length: 100 }).map((_, i) => (
              <div
                key={`star-${i}`}
                className="absolute rounded-full bg-white"
                style={{
                  width: `${Math.random() * 2 + 1}px`,
                  height: `${Math.random() * 2 + 1}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.7 + 0.3,
                  animation: `twinkle ${Math.random() * 5 + 3}s infinite ${Math.random() * 5}s`,
                }}
              />
            ))}

            {/* 올라가는 별 효과 - 꼬리가 있는 유성 형태 (아래에서 위로) */}
            {Array.from({ length: 30 }).map((_, i) => {
              const tailLength = 30 + Math.random() * 70;
              return (
                <div
                  key={`rising-star-${i}`}
                  className="meteor"
                  style={{
                    position: "absolute",
                    bottom: `-${tailLength}px`,
                    left: `${Math.random() * 100}%`,
                    width: "2px",
                    height: `${tailLength}px`,
                    background:
                      "linear-gradient(to bottom, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0))",
                    animation: `risingStarVertical ${Math.random() * 10 + 5}s linear infinite ${Math.random() * 10}s`,
                  }}
                />
              );
            })}
          </div>

          {/* 중앙 컨텐츠 영역 - 절대 위치로 고정 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="relative"
              style={{ width: "480px", height: "500px" }}
            >
              {/* 3D 지구본 컨테이너 - 절대 위치로 고정 */}
              <div
                className="absolute top-0 left-0 right-0"
                style={{ height: "320px" }}
              >
                <motion.div
                  ref={globeRef}
                  className="w-64 h-64 md:w-80 md:h-80 mx-auto"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{ duration: 1 }}
                />
              </div>

              {/* 텍스트 컨테이너 - 절대 위치로 고정, 너비 증가 */}
              <div
                className="absolute bottom-0 left-0 right-0"
                style={{ height: "150px" }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {step >= 0 && step < messages.length && (
                      <motion.div
                        key={`text-${step}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 1 }}
                        className="text-center px-4 w-full"
                      >
                        <p className="text-md md:text-lg font-bold">
                          {messages[step]}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
