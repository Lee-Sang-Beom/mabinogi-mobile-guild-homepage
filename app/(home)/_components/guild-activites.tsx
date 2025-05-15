"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const activities = [
  {
    title: "도전! 어비스 타임어택 올클리어",
    description:
      "잘 모르더라도, 스펙이 조금 낮더라도 OK! 모두가 함께 어비스 컨텐츠에서 최고의 보상을 받을 수 있도록 지원합니다.",
    images: ["/images/(home)/img-challenge-the-abyss.jpg"],
  },
  {
    title: "도전! 레이드",
    description:
      "레이드 신규 컨텐츠에 대한 근거없이 폭주하는 자신감, 그리고 도전과 열망이 가득합니다.",
    images: ["/images/(home)/img-prepare-raid.jpeg"],
  },
  {
    title: "신규 길드원 지원",
    description:
      "새로운 길드원을 정착을 위해 모두가 빠르게 적응할 수 있도록 노력합니다.",
    images: ["/images/(home)/img-support-guild-member.png"],
  },
];

export default function GuildActivities() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0.8, 1, 1, 0.8],
  );

  // 이미지 캐러셀을 위한 상태 관리
  const [currentImageIndex, setCurrentImageIndex] = useState<
    Record<string, number>
  >({});

  // 이미지 이전/다음 함수
  const prevImage = (title: string, maxIndex: number) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [title]: (prev[title] - 1 + maxIndex) % maxIndex,
    }));
  };

  const nextImage = (title: string, maxIndex: number) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [title]: (prev[title] + 1) % maxIndex,
    }));
  };

  // 컴포넌트 마운트 시 초기 인덱스 설정
  useEffect(() => {
    const initialIndexes: Record<string, number> = {};
    activities.forEach((activity) => {
      initialIndexes[activity.title] = 0;
    });
    setCurrentImageIndex(initialIndexes);
  }, []);

  return (
    <section
      id="activities"
      className="py-24 relative overflow-hidden"
      ref={containerRef}
    >
      <motion.div className="absolute inset-0 -z-10" style={{ opacity }}>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background"></div>
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-3xl"></div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          className="max-w-2xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-cinzel">
            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
              길드 활동
            </span>
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            마비노기 모바일에서 우리 길드가 진행하는 다양한 활동들을 소개합니다.
            함께 도전하고 성장하는 즐거움을 경험해보세요.
          </p>
        </motion.div>

        <motion.div className="grid gap-12" style={{ scale }}>
          {activities.map((activity, index) => (
            <motion.div
              key={activity.title}
              className={`flex flex-col ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} gap-8 items-center`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <div className="lg:w-1/2">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-purple-600 rounded-2xl blur opacity-30"></div>
                  <div className="relative overflow-hidden rounded-xl shadow-2xl">
                    {currentImageIndex[activity.title] !== undefined && (
                      <>
                        <div className="relative">
                          <Image
                            src={
                              activity.images[
                                currentImageIndex[activity.title]
                              ] || "/placeholder.svg"
                            }
                            alt={`${activity.title} - 이미지 ${currentImageIndex[activity.title] + 1}`}
                            width={800}
                            height={600}
                            className="w-full h-auto object-cover"
                          />

                          {/* 이미지 인디케이터 */}
                          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                            {activity.images.map((_, idx) => (
                              <div
                                key={idx}
                                className={`w-2 h-2 rounded-full ${
                                  idx === currentImageIndex[activity.title]
                                    ? "bg-amber-500"
                                    : "bg-gray-400"
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* 좌우 화살표 버튼 */}
                        {activity.images.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                prevImage(
                                  activity.title,
                                  activity.images.length,
                                );
                              }}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                              aria-label="이전 이미지"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 19l-7-7 7-7"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                nextImage(
                                  activity.title,
                                  activity.images.length,
                                );
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                              aria-label="다음 이미지"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2">
                <h3 className="text-2xl font-bold text-foreground mb-4 font-cinzel">
                  {activity.title}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {activity.description}
                </p>
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground p-0"
                >
                  <Link href="/community" className={"p-3"}>
                    커뮤니티 페이지 이동
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
