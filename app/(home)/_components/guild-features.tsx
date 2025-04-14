"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Shield, Users, Trophy, Sword, Scroll, Heart } from "lucide-react";

const features = [
  {
    name: "강력한 길드 시스템",
    description:
      "길드원들과 함께 성장하고 발전할 수 있는 체계적인 길드 시스템을 제공합니다.",
    icon: Shield,
  },
  {
    name: "활발한 커뮤니티",
    description:
      "언제나 활기찬 대화와 정보 공유가 이루어지는 친절한 커뮤니티입니다.",
    icon: Users,
  },
  {
    name: "정기적인 이벤트",
    description:
      "주간 레이드, 월간 대회 등 다양한 이벤트로 함께 즐기는 게임 경험을 제공합니다.",
    icon: Trophy,
  },
  {
    name: "전략적 길드전",
    description:
      "전략을 세우고 함께 승리를 향해 나아가는 짜릿한 길드전을 경험해보세요.",
    icon: Sword,
  },
  {
    name: "길드 퀘스트",
    description:
      "길드원들과 함께 도전하는 특별한 퀘스트로 더 많은 보상을 획득하세요.",
    icon: Scroll,
  },
  {
    name: "길드원 지원",
    description:
      "초보자부터 고수까지, 모든 길드원이 함께 성장할 수 있도록 지원합니다.",
    icon: Heart,
  },
];

export default function GuildFeatures() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [100, 0, 0, 100]);

  return (
    <section
      id="features"
      className="py-24 relative overflow-hidden"
      ref={containerRef}
    >
      <motion.div className="absolute inset-0 -z-10" style={{ opacity }}>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-purple-500/10 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-3xl"></div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-cinzel">
            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
              길드의 특별함
            </span>
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            마비노기 모바일에서 우리 길드만의 특별한 장점들을 경험해보세요.
            함께하는 모험은 언제나 더 즐겁습니다.
          </p>
        </motion.div>

        <motion.div
          className="mt-16 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
          style={{ y }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              className="relative p-8 bg-background/40 backdrop-blur-sm rounded-2xl border border-primary/10 shadow-xl group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{
                y: -5,
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
            >
              <div className="absolute -inset-px bg-gradient-to-r from-amber-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3 font-cinzel">
                  {feature.name}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
