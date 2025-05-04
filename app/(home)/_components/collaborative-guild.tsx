"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { guildName } from "@/shared/constants/game";

const collaborationIntroduceDescriptions = [
  {
    title: "천상힐러",
    description: `${guildName}와 함께하는 최강힐러분들이 모인 길드입니다. 보스의 뚝배기를 박살내고, 빈사상태의 파티원을 살려주는 것을 아마도 누구보다 좋아하시는 활기찬 분들이 모여게십니다.`,
    images: [
      "/images/(home)/img-collaboration-guild-thumbnail-1.jpg",
      "/images/(home)/img-collaboration-guild-thumbnail-2.jpg",
    ],
  },
];

export default function CollaborativeGuild() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0.8, 1, 1, 0.8]
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
    collaborationIntroduceDescriptions.forEach((activity) => {
      initialIndexes[activity.title] = 0;
    });
    setCurrentImageIndex(initialIndexes);
  }, []);

  return (
    <section
      id="collaborative-guild"
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
              협력 길드
            </span>
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            마비노기 모바일에서 {guildName}와 함께해주시는 멋지고 자랑스러운
            길드를 소개합니다!
          </p>
        </motion.div>

        <motion.div className="grid gap-12" style={{ scale }}>
          {collaborationIntroduceDescriptions.map((activity, index) => (
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
                                  activity.images.length
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
                                  activity.images.length
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
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
