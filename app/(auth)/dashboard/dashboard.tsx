'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useAnimation, useInView } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Bell, BookOpen, ImageIcon, Shield, Sparkles, Trophy, Users } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { GuildUserBubble } from './_components/guild-user-bubble'
import { JobClassChart } from './_components/job-class-chart'
import { User } from 'next-auth'
import GuildUserBubbleDialog from '@/app/(auth)/dashboard/_components/guild-user-bubble-dialog'
import { useTheme } from 'next-themes'
import { guildInfo, guildName } from '@/shared/constants/game'


// Mock data

const latestAnnouncement = {
  id: 1,
  title: "길드 홈페이지 추가",
  content: `${guildName} 의 길드 홈페이지가 추가되었습니다!`,
  date: "2025-04-22",
  author: "길드마스터",
}

const latestUpdate = {
  id: 1,
  title: "홈페이지 업데이트 안내",
  content: "길드 홈페이지의 랜딩 페이지와 로그인/회원가입/비밀번호 찾기 기능이 추가되었습니다.",
  date: "2025-04-22",
  version: "v1.0",
}

const latestArtwork = {
  id: 1,
  title: "사격장 개꿀팁",
  description: "사격장에서 쉽게 상품을 얻을 수 있는 방법이 있다고?!",
  author: "호냥이",
  date: "2025-04-22",
  imageUrl: "/images/(test)/img-test-dashboard-artwork.png",
}

export default function Dashboard() {
  const theme = useTheme();  // 테마 정보 가져오기
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, {
    once: false,
    amount: 0, // 더 빠르게 트리거
    margin: "0px 0px -20% 0px"
  })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  }

  return (
    <div className="min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-purple-500/10 to-blue-500/10 blur-3xl"
          animate={{
            x: [0, 20, 0],
            y: [0, 15, 0],
          }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 20, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/2 -translate-x-1/2 h-[350px] w-[350px] rounded-full bg-gradient-to-br from-amber-500/10 to-red-500/10 blur-3xl"
          animate={{
            x: [0, -15, 0],
            y: [0, 25, 0],
          }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 25, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <div className="max-w-7xl mx-auto" ref={containerRef}>
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-foreground font-cinzel">
            <motion.span
              className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600"
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%"],
              }}
              transition={{
                duration: 5,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            >
              대시보드
            </motion.span>
          </h1>
          <p className="text-muted-foreground mt-2">길드의 최신 정보와 활동을 확인하세요.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <motion.div custom={0} initial="hidden" animate={controls} variants={fadeInUpVariants}>
            <Card className="bg-background/40 backdrop-blur-sm border-primary/10 shadow-xl h-full overflow-hidden group">
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-amber-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                animate={{
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />
              <CardHeader className="pb-2 relative z-10">
                <CardTitle className="flex items-center gap-2 text-lg font-cinzel">
                  <Shield className="h-5 w-5 text-primary" />
                  길드 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">길드명</span>
                    <span className="font-medium">{guildInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">길드 레벨</span>
                    <span className="font-medium">{guildInfo.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">길드원 수</span>
                    <span className="font-medium">
                      {guildInfo.memberCount}/{guildInfo.maxMembers}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">길드 생성일</span>
                    <span className="font-medium">{guildInfo.regDt}</span>
                  </div>
                  <div className="pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full group-hover:bg-primary/10 transition-colors duration-300"
                    >
                      <Link href="/members" className="flex items-center justify-center w-full">
                        길드 정보 상세보기
                        <motion.span
                          animate={{ x: [0, 5, 0] }}
                          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
                          className="ml-2"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </motion.span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div custom={1} initial="hidden" animate={controls} variants={fadeInUpVariants}>
            <Card className="bg-background/40 backdrop-blur-sm border-primary/10 shadow-xl h-full overflow-hidden group">
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                animate={{
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                  delay: 0.5,
                }}
              />
              <CardHeader className="pb-2 relative z-10">
                <CardTitle className="flex items-center gap-2 text-lg font-cinzel">
                  <Bell className="h-5 w-5 text-primary" />
                  공지사항
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-2 bg-red-500" />
                    <div>
                      <p className="font-medium">{latestAnnouncement.title}</p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{latestAnnouncement.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {latestAnnouncement.date} by {latestAnnouncement.author}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full group-hover:bg-primary/10 transition-colors duration-300"
                    >
                      <Link href="/announcements" className="flex items-center justify-center w-full">
                        모든 공지 보기
                        <motion.span
                          animate={{ x: [0, 5, 0] }}
                          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
                          className="ml-2"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </motion.span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div custom={2} initial="hidden" animate={controls} variants={fadeInUpVariants}>
            <Card className="bg-background/40 backdrop-blur-sm border-primary/10 shadow-xl h-full overflow-hidden group">
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                animate={{
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                  delay: 1,
                }}
              />
              <CardHeader className="pb-2 relative z-10">
                <CardTitle className="flex items-center gap-2 text-lg font-cinzel">
                  <BookOpen className="h-5 w-5 text-primary" />
                  최신 업데이트
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{latestUpdate.title}</p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{latestUpdate.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {latestUpdate.date} - {latestUpdate.version}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full group-hover:bg-primary/10 transition-colors duration-300"
                    >
                      <Link href="/updates" className="flex items-center justify-center w-full">
                        모든 업데이트 보기
                        <motion.span
                          animate={{ x: [0, 5, 0] }}
                          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
                          className="ml-2"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </motion.span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
          <motion.div custom={3} initial="hidden" animate={controls} variants={fadeInUpVariants}>
            <Card className="bg-background/40 backdrop-blur-sm border-primary/10 shadow-xl h-full overflow-hidden group">
              <CardHeader className="pb-2 relative z-10">
                <CardTitle className="flex items-center gap-2 text-lg font-cinzel">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  최신 아트워크
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 flex flex-col justify-between overflow-hidden ">
                <div className="space-y-4 flex-grow">
                  <div className="relative overflow-hidden rounded-lg aspect-video bg-black">
                    <Image
                      src={latestArtwork.imageUrl}
                      alt={latestArtwork.title}
                      fill
                      className="object-contain transition-transform duration-500"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{latestArtwork.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{latestArtwork.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      by {latestArtwork.author} • {latestArtwork.date}
                    </p>
                  </div>
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full group-hover:bg-primary/10 transition-colors duration-300"
                    >
                      <Link href="/community?tab=artwork" className="flex items-center justify-center w-full">
                        모든 아트워크 보기
                        <motion.span
                          animate={{ x: [0, 5, 0] }}
                          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
                          className="ml-2"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </motion.span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div custom={4} initial="hidden" animate={controls} variants={fadeInUpVariants}>
            <Card className="bg-background/40 backdrop-blur-sm border-primary/10 shadow-xl h-full overflow-hidden group ">
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                animate={{
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                  delay: 2,
                }}
              />
              <CardHeader className="pb-2 relative z-10">
                <CardTitle className="flex items-center gap-2 text-lg font-cinzel">
                  <Users className="h-5 w-5 text-primary" />
                  직업별 길드원 분포 (대표 캐릭터 기준)
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="h-[400px] w-full">
                  <JobClassChart theme={theme.theme as 'light' | 'dark'}/>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div custom={5} initial="hidden" animate={controls} variants={fadeInUpVariants} className="mb-8">
          <Card className="bg-background/40 backdrop-blur-sm border-primary/10 shadow-xl overflow-hidden">
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2 text-lg font-cinzel">
                <Trophy className="h-5 w-5 text-primary" />
                길드원 소개
              </CardTitle>
              <CardDescription>
                {guildInfo.name} 길드의 멤버들을 만나보세요. 멤버를 클릭하면 상세 정보를 볼 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 pb-8">
              <div className="relative h-[500px] w-full rounded-lg bg-gradient-to-br from-background/50 to-background/80 p-4 overflow-hidden border border-primary/10">
                {/* Guild name in the center */}
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, 0, -2, 0],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                >
                  <div className="flex flex-col items-center justify-center">
                    <motion.div
                      className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 font-cinzel"
                      animate={{
                        backgroundPosition: ["0% 0%", "100% 100%"],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                      }}
                    >
                      {guildInfo.name}
                    </motion.div>
                    <motion.div
                      className="text-sm text-muted-foreground mt-1"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{
                        duration: 3,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                      }}
                    >
                      함께하는 길드원들
                    </motion.div>
                  </div>
                </motion.div>

                {/* Guild members bubbles */}
                <GuildUserBubble
                  setSelectedUserAction={setSelectedUser}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Member detail dialog */}
      {selectedUser && <GuildUserBubbleDialog selectedUser={selectedUser} setSelectedUser={setSelectedUser}/>}
     </div>
  )
}
