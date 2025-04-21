"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface IntroAnimationProps {
  onCompleteAction: () => void;
}

export default function IntroAnimation({ onCompleteAction }: IntroAnimationProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    setStep(0);

    const timer1 = setTimeout(() => setStep(1), 1000); // 첫 번째 텍스트
    const timer2 = setTimeout(() => setStep(2), 3500); // 두 번째 텍스트
    const timer3 = setTimeout(() => setStep(3), 6000); // 이미지 애니메이션 (회전 및 사라짐)
    const timer4 = setTimeout(() => onCompleteAction(), 8000); // 컴포넌트 제거

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onCompleteAction]);

  return (
    <AnimatePresence>
      {step <= 3 && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black text-white w-screen h-screen"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
        >
          {/* 파비콘 이미지 */}
          <motion.img
            src="/images/favicon-mabinogi-mobile.png"
            alt="마비노기 모바일 파비콘 아이콘"
            className="absolute left-1/2 transform -translate-x-1/2 z-0"
            initial={{ opacity: 0, rotate: 0, scale: 1, top: "40%" }}
            animate={
              step === 3
                ? { opacity: 0, rotate: 720, scale: 0.5, top: "20%" }
                : {
                    opacity: 1,
                    rotate: 0,
                    scale: 1,
                    top: step === 0 ? "40%" : "20%",
                  }
            }
            transition={{ duration: 1.5, ease: "easeInOut" }}
            style={{ position: "absolute", width: "180px", height: "180px" }}
          />

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center p-8 z-10"
              />
            )}

            {step === 1 && (
              <motion.div
                key="text1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center p-8 z-10"
              >
                <p className="text-2xl md:text-4xl font-bold mb-4 z-10">
                  우리가 그리는 마비노기 모바일의 세계로 이동합니다
                </p>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="text2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center p-8 z-10"
              >
                <p className="text-3xl md:text-5xl font-bold z-10">준비되셨나요?</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
