"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  BackgroundStar,
  RenderedPlanet,
  StarryOrganizationProps,
  UserStar,
} from "@/app/(auth)/org/internal";
import type { User } from "next-auth";
import { planets } from "@/app/(auth)/org/data";
import { jobCategoryMap } from "@/shared/constants/game";
import { Planet } from "./planet";
import { UserDialog } from "@/app/(auth)/org/_component/user-dialog";
import { Star } from "@/app/(auth)/org/_component/star";
import { getUserStarSize } from "@/app/(auth)/org/utils";
import { ConstellationLines } from "./constellation-lines";
import { useGetAllUserBadgeCounts } from "@/app/(auth)/(admin)/admin-badge/hooks/use-get-all-user-badge-count";

export default function StarryOrganization({
  user,
  users,
}: StarryOrganizationProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [stars, setStars] = useState<UserStar[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [renderedPlanets, setRenderedPlanets] = useState<RenderedPlanet[]>([]);
  const [backgroundStars, setBackgroundStars] = useState<BackgroundStar[]>([]);
  const { data: userBadgeCountList } = useGetAllUserBadgeCounts();

  // 창 크기에 따라 별 위치 재계산
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // 배경 별 생성 (고정된 위치)
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const numStars = 200;
    const newBackgroundStars: BackgroundStar[] = [];

    for (let i = 0; i < numStars; i++) {
      newBackgroundStars.push({
        id: `bg-${i}`,
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.7 + 0.3,
        animationDuration: 3 + Math.random() * 7,
      });
    }

    setBackgroundStars(newBackgroundStars);
  }, [dimensions]);

  // 행성 위치 계산
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const newPlanets: RenderedPlanet[] = planets.map((planet) => {
      return {
        ...planet,
        x: (dimensions.width * planet.x) / 100,
        y: (dimensions.height * planet.y) / 100,
      };
    });

    setRenderedPlanets(newPlanets);
  }, [dimensions]);

  // 별 위치 계산
  useEffect(() => {
    if (
      dimensions.width === 0 ||
      dimensions.height === 0 ||
      renderedPlanets.length === 0
    )
      return;

    // 직업 계열별로 그룹화
    const categoryGroups: Record<string, User[]> = {};

    // 직업 계열별 행성 매핑
    const categoryToPlanet: Record<string, RenderedPlanet> = {};

    // 행성 정보 매핑 생성
    renderedPlanets.forEach((planet) => {
      categoryToPlanet[planet.category] = planet;
    });

    // 사용자를 직업 계열별로 그룹화
    users.forEach((user) => {
      const jobInfo = jobCategoryMap[user.job];
      if (!jobInfo) return; // 매핑되지 않은 직업은 건너뜀

      const category = jobInfo.category;
      if (!categoryGroups[category]) {
        categoryGroups[category] = [];
      }
      categoryGroups[category].push(user);
    });

    const newStars: UserStar[] = [];

    // 각 직업 계열별로 별 생성
    Object.entries(categoryGroups).forEach(([category, categoryUsers]) => {
      // 해당 계열의 행성 찾기
      const planet = categoryToPlanet[category];

      // 행성이 없으면 건너뜀
      if (!planet) return;

      // 해당 계열의 구성원들을 행성 주변에 배치
      categoryUsers.forEach((user, userIndex) => {
        // 궤도 계산 (타원형)
        const orbitRadius = planet.size * 1.5 + Math.random() * 50; // 행성으로부터의 거리
        const orbitEccentricity = 0.2 + Math.random() * 0.3; // 타원 이심률 (0: 원, 1에 가까울수록 납작한 타원)
        const orbitAngle = Math.random() * Math.PI * 2; // 타원 회전 각도
        const orbitSpeed = 0.003 + Math.random() * 0.005; // 공전 속도 (더 느리게)
        const orbitOffset = (userIndex / categoryUsers.length) * Math.PI * 2; // 시작 위치 (균등 분포)

        // 별의 크기는 "길드 영향력(이벤트 뱃지)"에 따라 다르게!!!!!!!!!!
        const size = getUserStarSize(user);

        // 별의 색상은 직업에 따라 다르게
        const jobInfo = jobCategoryMap[user.job];
        const color = jobInfo ? jobInfo.color : "#ffffff";

        newStars.push({
          ...user,
          size,
          color,
          // 별 움직임을 위한 추가 속성
          orbitSpeed,
          orbitRadius,
          orbitEccentricity,
          orbitAngle,
          orbitOffset,
          centerX: planet.x,
          centerY: planet.y,
          planetId: planet.id, // 공전 중심 행성 ID 저장
        });
      });
    });

    setStars(newStars);
  }, [dimensions, renderedPlanets, users]);

  // 마우스 움직임에 따른 시차 효과
  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const { left, top } = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - left,
        y: e.clientY - top,
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-gradient-to-b from-[#0f1729] to-[#000000] overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* 배경 별 (작은 점들) - 고정된 위치 */}
      <div className="absolute inset-0 pointer-events-none">
        {backgroundStars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              left: `${star.x}px`,
              top: `${star.y}px`,
              opacity: star.opacity,
              animation: `twinkle ${star.animationDuration}s infinite ease-in-out`,
            }}
          />
        ))}
      </div>

      {/* 행성들 */}
      {renderedPlanets.map((planet) => (
        <Planet key={planet.id} planet={planet} mousePosition={mousePosition} />
      ))}

      {/* SVG 별자리 */}
      <ConstellationLines stars={stars} />

      {/* 멤버 별 */}
      {stars.map((star) => {
        const userBadgeCountData =
          userBadgeCountList &&
          userBadgeCountList.length &&
          userBadgeCountList.find(
            (userBadge) => userBadge.userDocId === star.docId,
          );

        const userBadgeCount =
          userBadgeCountData && userBadgeCountData.badgeCount
            ? userBadgeCountData.badgeCount
            : 0;

        return (
          <Star
            user={user}
            userBadgeCount={userBadgeCount}
            key={star.docId}
            star={star}
            mousePosition={mousePosition}
            onClickAction={() => setSelectedUser(star)}
          />
        );
      })}

      {/* 정보 버튼 */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 z-10"
        onClick={() => setShowInfo(!showInfo)}
      >
        <Info className="h-5 w-5" />
      </Button>

      {/* 정보 패널 */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 right-4 w-72 bg-black/70 backdrop-blur-md p-4 rounded-lg text-white/90 text-sm border border-white/20 z-10"
          >
            <h3 className="font-medium mb-2 text-md">
              「 별자리 조직도 안내 」
            </h3>
            <p className="mb-2 text-xs">
              ※ 각 별은 길드의 구성원을 나타냅니다. 별의 크기와 반짝임은 길드 내
              영향력(이벤트 뱃지의 보유 개수)에 따라 달라집니다.
            </p>
            <p className="mb-2 text-xs">
              ※ 행성은 각 직업 계열을 나타내며, 주변에 해당 계열 구성원들이
              배치됩니다.
            </p>
            <p className="mb-2 text-xs">
              ※ 별의 색상은 직업 계열에 따라 다르게 표시됩니다.
            </p>
            <p className="mb-2 text-xs">
              ※ 별을 클릭하면 해당 구성원의 상세 정보를 볼 수 있습니다.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 멤버 정보 다이얼로그 */}
      {selectedUser && (
        <UserDialog
          user={selectedUser}
          open={!!selectedUser}
          onOpenChangeAction={() => setSelectedUser(null)}
        />
      )}

      {/* 별 깜빡임 애니메이션 */}
      <style jsx global>{`
        @keyframes twinkle {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
}
