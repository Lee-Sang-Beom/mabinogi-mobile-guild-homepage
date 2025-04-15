"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import Image from "next/image";

export default function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative isolate overflow-hidden py-24 sm:py-32">
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute left-1/2 top-0 -z-10 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 blur-3xl"
          animate={{
            x: mousePosition.x * 0.02,
            y: mousePosition.y * 0.02,
          }}
          transition={{ type: "spring", damping: 15 }}
        />
        <motion.div
          className="absolute right-1/4 bottom-0 -z-10 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-amber-500/20 to-red-500/20 blur-3xl"
          animate={{
            x: -mousePosition.x * 0.01,
            y: -mousePosition.y * 0.01,
          }}
          transition={{ type: "spring", damping: 15 }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl">
          <motion.div
            className="mb-8 flex items-center gap-x-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 backdrop-blur">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <span className="font-cinzel text-base font-semibold leading-7 text-primary">
              마비노기 모바일
            </span>
          </motion.div>

          <motion.h1
            className="font-cinzel text-4xl font-bold tracking-tight text-foreground sm:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600">
              판타지 세계의 모험
            </span>
            <br />
            <span className="mt-2 inline-block">함께하는 길드</span>
          </motion.h1>

          <motion.p
            className="mt-6 text-lg leading-8 "
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            마비노기 모바일의 세계에서 함께 모험을 떠날 동료를 찾고 계신가요?
            우리 길드와 함께라면 더 넓은 세계, 더 강한 도전, 더 깊은 우정을
            경험할 수 있습니다.
          </motion.p>

          <motion.div
            className="mt-10 flex items-center gap-x-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-cinzel"
            >
              <Link href="/register">길드 가입하기</Link>
            </Button>
            <Link
              href="#about"
              className="text-sm font-semibold leading-6 text-foreground group flex items-center"
            >
              더 알아보기
              <motion.span
                className="ml-1"
                initial={{ x: 0 }}
                animate={{ x: [0, 5, 0] }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 1.5,
                  repeatType: "loop",
                }}
              >
                →
              </motion.span>
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="mt-16 sm:mt-24 relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-purple-600 rounded-2xl blur opacity-30"></div>
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl shadow-2xl">
              <Image
                src="/images/bg-mabinogi-mobile-03.jpg"
                alt="마비노기 모바일 길드 스크린샷"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="font-cinzel text-2xl font-bold text-white mb-2">
                  판타지 세계의 모험
                </h3>
                <p className="text-white/80">
                  마비노기 모바일에서 펼쳐지는 우리 길드의 모험
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
