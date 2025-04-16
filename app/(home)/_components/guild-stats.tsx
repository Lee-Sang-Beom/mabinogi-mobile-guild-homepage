"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Users, Award, Calendar, Clock } from "lucide-react";

const stats = [
  { name: "활동 길드원", value: "30+", icon: Users },
  { name: "길드 레벨", value: "3", icon: Award },
  { name: "설립일", value: "2025.03", icon: Calendar },
  { name: "주간 활동 시간", value: "80시간+", icon: Clock },
];

export default function GuildStats() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [100, 0, 0, 100]);

  return (
    <section id="about" className="py-16 relative overflow-hidden" ref={containerRef}>
      <motion.div className="absolute inset-0 -z-10" style={{ opacity }}>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-3xl"></div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
          style={{ y }}
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.name}
              className="relative p-8 bg-background/40 backdrop-blur-sm rounded-2xl border border-primary/10 shadow-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{
                y: -5,
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                background:
                  "linear-gradient(to bottom right, rgba(245, 158, 11, 0.1), rgba(147, 51, 234, 0.1))",
              }}
            >
              <div className="flex items-center justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <stat.icon className="h-8 w-8" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-center text-foreground font-cinzel">
                {stat.value}
              </h3>
              <p className="text-center text-muted-foreground mt-2">
                {stat.name}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
