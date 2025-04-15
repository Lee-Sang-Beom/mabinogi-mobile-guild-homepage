"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const activities = [
  {
    title: "주간 레이드",
    description:
      "매주 토요일 저녁, 길드원들과 함께 도전하는 고난이도 레이드. 전략을 세우고 협력하여 강력한 보스를 물리치세요.",
    image: "/images/bg-mabinogi-mobile-sky-user.jpg",
  },
  {
    title: "길드 대전",
    description:
      "다른 길드와의 경쟁을 통해 우리 길드의 실력을 증명하세요. 승리하면 특별한 보상이 기다립니다.",
    image: "/images/bg-mabinogi-mobile-sky-user.jpg",
  },
  {
    title: "신규 길드원 지원",
    description:
      "새로운 길드원을 위한 특별 지원 프로그램. 장비, 아이템, 가이드를 제공하여 빠르게 적응할 수 있도록 돕습니다.",
    image: "/images/bg-mabinogi-mobile-sky-user.jpg",
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
    [0.8, 1, 1, 0.8]
  );

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
              className={`flex flex-col ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } gap-8 items-center`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <div className="lg:w-1/2">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-purple-600 rounded-2xl blur opacity-30"></div>
                  <div className="relative overflow-hidden rounded-xl shadow-2xl">
                    <Image
                      src={
                        activity.image || "/images/bg-mabinogi-mobile-sky-user.jpg"
                      }
                      alt={activity.title}
                      width={800}
                      height={600}
                      className="w-full h-auto object-cover"
                    />
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
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Link href="/community">자세히 보기</Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
