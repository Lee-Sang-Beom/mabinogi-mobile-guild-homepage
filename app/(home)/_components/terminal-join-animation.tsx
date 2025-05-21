"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
} from "@/components/magicui/terminal";
import { guildName } from "@/shared/constants/game";

export default function TerminalJoinAnimation() {
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

  return (
    <section
      className="py-12 sm:py-24 relative overflow-hidden"
      ref={containerRef}
    >
      <motion.div className="absolute inset-0 -z-10" style={{ opacity }}>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[800px] rounded-full bg-gradient-to-br from-amber-500/10 to-purple-600/10 blur-3xl"></div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl"
          style={{ scale }}
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-purple-600 rounded-2xl sm:rounded-3xl blur opacity-30"></div>
          <div className="relative bg-background/40 backdrop-blur-sm p-4 sm:p-8 md:p-12 border border-primary/10 rounded-2xl sm:rounded-3xl">
            <div className="mx-auto max-w-2xl text-center">
              <motion.h2
                className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground md:text-4xl font-cinzel"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                  합류 여정
                </span>
              </motion.h2>

              <motion.div
                className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg leading-7 sm:leading-8 text-muted-foreground w-full"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Terminal
                  className="w-full max-w-full min-w-full text-left overflow-y-auto"
                  infinite={true}
                  infiniteDelay={25000}
                >
                  <TypingAnimation className="text-amber-500 font-semibold text-left">
                    『시스템: 마비노기 모바일』
                  </TypingAnimation>

                  <AnimatedSpan
                    delay={1000}
                    className="text-white text-left block overflow-hidden text-ellipsis whitespace-normal break-words"
                  >
                    <span>1. 마비노기 모바일에 접속하세요.</span>
                  </AnimatedSpan>

                  <AnimatedSpan
                    delay={2000}
                    className="text-blue-300 text-left block overflow-hidden text-ellipsis whitespace-normal break-words"
                  >
                    <span>⟳ 게임 접속 중...</span>
                  </AnimatedSpan>

                  <AnimatedSpan
                    delay={3000}
                    className="text-green-500 text-left block overflow-hidden text-ellipsis whitespace-normal break-words"
                  >
                    <span>✔ 마비노기 모바일 접속 완료!</span>
                  </AnimatedSpan>

                  <AnimatedSpan
                    delay={4000}
                    className="text-white text-left block overflow-hidden text-ellipsis whitespace-normal break-words"
                  >
                    <span>
                      {`2. 시스템 접속 후 『${guildName}』 길드 관리자와 1:1대화를
                      진행하거나 오픈채팅방에 접속하세요.`}
                    </span>
                  </AnimatedSpan>

                  <AnimatedSpan
                    delay={5000}
                    className="text-blue-300 text-left block overflow-hidden text-ellipsis whitespace-normal break-words"
                  >
                    <span>⟳ 길드 관리자 검색 중...</span>
                  </AnimatedSpan>

                  <AnimatedSpan
                    delay={6000}
                    className="text-green-500 text-left block overflow-hidden text-ellipsis whitespace-normal break-words"
                  >
                    <span>✔ 길드 관리자 찾기 완료!</span>
                  </AnimatedSpan>

                  <AnimatedSpan
                    delay={7000}
                    className="text-white text-left block overflow-hidden text-ellipsis whitespace-normal break-words"
                  >
                    <span>3. 입장 규칙을 안내받고 가입 의사를 알려주세요.</span>
                  </AnimatedSpan>

                  <AnimatedSpan
                    delay={8000}
                    className="text-blue-300 text-left block overflow-hidden text-ellipsis whitespace-normal break-words"
                  >
                    <span>⟳ 규칙 확인 중...</span>
                  </AnimatedSpan>

                  <AnimatedSpan
                    delay={9000}
                    className="text-green-500 text-left block overflow-hidden text-ellipsis whitespace-normal break-words"
                  >
                    <span>✔ 가입 의사 전달 완료!</span>
                  </AnimatedSpan>

                  <AnimatedSpan
                    delay={10000}
                    className="text-white text-left block overflow-hidden text-ellipsis whitespace-normal break-words"
                  >
                    <span>
                      {`4. 길드 관리자에게 『${guildName}』 길드 그룹채팅방,
                      디스코드 링크를 받아 입장하세요.`}
                    </span>
                  </AnimatedSpan>

                  <AnimatedSpan
                    delay={11000}
                    className="text-blue-300 text-left block overflow-hidden text-ellipsis whitespace-normal break-words"
                  >
                    <span>⟳ 디스코드 링크 접속 중...</span>
                  </AnimatedSpan>

                  <AnimatedSpan
                    delay={12000}
                    className="text-green-500 text-left block overflow-hidden text-ellipsis whitespace-normal break-words"
                  >
                    <span>✔ 디스코드 및 그룹채팅방 입장 완료!</span>
                  </AnimatedSpan>

                  <AnimatedSpan
                    delay={13000}
                    className="text-white text-left block overflow-hidden text-ellipsis whitespace-normal break-words"
                  >
                    <span>
                      5. 길드원과 인사를 나눈 후, 해당 길드 홈페이지에서
                      회원가입을 진행하세요.
                    </span>
                  </AnimatedSpan>

                  <AnimatedSpan
                    delay={14000}
                    className="text-blue-300 text-left block overflow-hidden text-ellipsis whitespace-normal break-words"
                  >
                    <span>⟳ 회원가입 절차 진행 중...</span>
                  </AnimatedSpan>

                  <AnimatedSpan
                    delay={15000}
                    className="text-green-500 text-left block overflow-hidden text-ellipsis whitespace-normal break-words"
                  >
                    <span>✔ 회원가입 양식 제출 완료!</span>
                  </AnimatedSpan>

                  <AnimatedSpan
                    delay={16000}
                    className="text-white text-left block overflow-hidden text-ellipsis whitespace-normal break-words"
                  >
                    <span>
                      6. 회원가입 완료 후, 홈페이지 활동을 진행할 수 있도록
                      회원가입 최종 승인을 받아달라고 관리자에게 내용을
                      전달하세요.
                    </span>
                  </AnimatedSpan>

                  <AnimatedSpan
                    delay={17000}
                    className="text-blue-300 text-left block overflow-hidden text-ellipsis whitespace-normal break-words"
                  >
                    <span>⟳ 승인 요청 중...</span>
                  </AnimatedSpan>

                  <AnimatedSpan
                    delay={18000}
                    className="text-green-500 text-left block overflow-hidden text-ellipsis whitespace-normal break-words"
                  >
                    <span>✔ 승인 요청 전달 완료!</span>
                  </AnimatedSpan>

                  <AnimatedSpan
                    delay={19000}
                    className="text-white text-left block overflow-hidden text-ellipsis whitespace-normal break-words"
                  >
                    <span>
                      7. 관리자가 회원가입 승인을 최종 승인했다면 로그인하고
                      길드 활동을 시작하세요.
                    </span>
                  </AnimatedSpan>

                  <AnimatedSpan
                    delay={20000}
                    className="text-blue-300 text-left block overflow-hidden text-ellipsis whitespace-normal break-words"
                  >
                    <span>⟳ 승인 대기 중...</span>
                  </AnimatedSpan>

                  <AnimatedSpan
                    delay={21000}
                    className="text-green-500 text-left block overflow-hidden text-ellipsis whitespace-normal break-words"
                  >
                    <span>✔ 승인 완료!</span>
                  </AnimatedSpan>

                  <TypingAnimation
                    delay={22000}
                    className="text-amber-500 font-semibold text-left block overflow-hidden text-ellipsis whitespace-normal break-words"
                  >
                    {`『${guildName}』 길드 가입 절차가 모두 완료되었습니다!`}
                  </TypingAnimation>

                  <TypingAnimation
                    delay={23000}
                    className="text-blue-400 text-left block overflow-hidden text-ellipsis whitespace-normal break-words"
                  >
                    이제 함께 모험을 시작하세요.
                  </TypingAnimation>
                </Terminal>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
