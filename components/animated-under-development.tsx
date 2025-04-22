"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Cog, Home, Hammer, Wrench } from "lucide-react"

export default function AnimatedUnderDevelopment() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Prevent scrolling
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center bg-black/90 text-white z-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-2xl"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-6"
        >
          <div className="relative mx-auto w-32 h-32 mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 10,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
              className="absolute inset-0"
            >
              <Cog className="w-32 h-32 text-primary" />
            </motion.div>

            <motion.div
              animate={{
                x: [-5, 5, -5],
                y: [5, -5, 5],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <Hammer className="w-10 h-10 text-white" />
            </motion.div>

            <motion.div
              animate={{
                rotate: [-15, 15, -15],
                x: [5, -5, 5],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
              className="absolute bottom-0 right-0"
            >
              <Wrench className="w-12 h-12 text-white/80" />
            </motion.div>
          </div>
          <h1 className="text-4xl font-bold text-primary mb-2">개발 중</h1>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-2xl md:text-3xl font-bold mb-4"
        >
          페이지 준비 중입니다
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="text-white/80 mb-8"
        >
          현재 이 페이지는 개발중입니다!
          <br />
          하루빨리 <span className={"font-semibold"}>럭키비키</span>와 함께할 수 있는 공간을 만들 수 있도록
          노력하겠습니다.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <Link href="/">
            <Button size="lg" className="gap-2">
              <Home className="w-4 h-4" />
              홈으로 돌아가기
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 text-sm text-muted-foreground"
      >
        © 마비노기 모바일 럭키비키 커뮤니티
      </motion.div>
    </div>
  )
}
