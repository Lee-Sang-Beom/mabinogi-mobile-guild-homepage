"use client";

import { motion } from "framer-motion";
import { CircleOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Ripple } from "@/components/magicui/ripple";

interface LoadingProps {
  /**
   * 로딩 컴포넌트의 크기 (전체 화면 또는 컨테이너)
   */
  variant?: "fullscreen" | "container";
  /**
   * 로딩 텍스트 (기본값: "로딩 중...")
   */
  text?: string;
  /**
   * 로딩 설명 텍스트
   */
  description?: string;
  /**
   * 로딩 실패 시 표시할 텍스트
   */
  errorText?: string;
  /**
   * 로딩 실패 여부
   */
  error?: boolean;

  /**
   * 추가 클래스명
   */
  className?: string;
}

export function AnimatedLoading({
  variant = "container",
  text = "로딩 중...",
  description,
  errorText = "데이터를 불러오는 중 오류가 발생했습니다",
  error = false,
  className,
}: LoadingProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [variant]);

  if (!mounted) return null;

  const bgStyle =
    variant === "fullscreen"
      ? `fixed inset-0 z-50 bg-background/40`
      : `absolute inset-0 z-10 bg-background/40`;

  return (
    <div
      className={cn(
        bgStyle,
        "flex flex-col items-center justify-center",
        variant === "container" && "rounded-md",
        className,
      )}
      aria-live="polite"
      aria-busy={!error}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center min-w-screen px-4"
      >
        {!error ? (
          <div className="relative flex w-full h-full flex-col items-center justify-center overflow-hidden rounded-lg mb-4">
            <Ripple />
            <p className="z-10 whitespace-pre-wrap text-center text-xl font-medium tracking-tighter text-white">
              {text}
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative mx-auto mb-4"
          >
            <CircleOff className="w-12 h-12 text-destructive" />
            {errorText}
          </motion.div>
        )}

        {description && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-muted-foreground text-sm"
          >
            {description}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}

// 스켈레톤 로딩 컴포넌트 - 데이터가 로드되기 전 UI의 윤곽을 보여주는 용도
export function SkeletonLoading({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-muted rounded w-5/6"></div>
    </div>
  );
}
export function SkeletonCardLoading({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-muted rounded-lg p-4 animate-pulse h-40 flex flex-col"
          >
            <div className="h-20 bg-muted rounded mb-4"></div>
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
