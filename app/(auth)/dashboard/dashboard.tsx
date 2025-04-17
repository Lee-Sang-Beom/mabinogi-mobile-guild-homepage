'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bell, Calendar, Shield, Sword, Trophy, Users } from 'lucide-react'
import Link from 'next/link'

// Mock data
const guildEvents = [
  { id: 1, title: "주간 레이드", date: "2023-09-30", time: "20:00", type: "raid" },
  { id: 2, title: "길드 대전", date: "2023-10-05", time: "21:00", type: "pvp" },
  { id: 3, title: "신규 길드원 환영회", date: "2023-10-07", time: "19:00", type: "social" },
]

const announcements = [
  { id: 1, title: "길드 레벨 50 달성!", date: "2023-09-25", priority: "high" },
  { id: 2, title: "신규 길드 시스템 업데이트", date: "2023-09-20", priority: "medium" },
  { id: 3, title: "길드 기부 이벤트 안내", date: "2023-09-15", priority: "low" },
]

const guildRanking = [
  { rank: 1, name: "드래곤슬레이어", points: 12500 },
  { rank: 2, name: "나이트메어", points: 11200 },
  { rank: 3, name: "크리스탈가드", points: 10800 },
  { rank: 4, name: "마비노기 길드", points: 9700 },
  { rank: 5, name: "판타지워리어", points: 8900 },
]

export default function Dashboard() {

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

      <div className="max-w-7xl mx-auto">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-foreground font-cinzel">
            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
              길드 대시보드
            </span>
          </h1>
          <p className="text-muted-foreground mt-2">마비노기 모바일 길드의 최신 정보와 활동을 확인하세요.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-background/40 backdrop-blur-sm border-primary/10 shadow-xl h-full">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg font-cinzel">
                  <Shield className="h-5 w-5 text-primary" />
                  길드 정보
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">길드 레벨</span>
                    <span className="font-medium">45</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">길드원 수</span>
                    <span className="font-medium">120/150</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">길드 자금</span>
                    <span className="font-medium">1,250,000 골드</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">길드 랭킹</span>
                    <span className="font-medium">4위</span>
                  </div>
                  <div className="pt-4">
                    <Button variant="outline" size="sm" className="w-full">
                      <Link href="/members">길드원 목록 보기</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-background/40 backdrop-blur-sm border-primary/10 shadow-xl h-full">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg font-cinzel">
                  <Bell className="h-5 w-5 text-primary" />
                  공지사항
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          announcement.priority === "high"
                            ? "bg-red-500"
                            : announcement.priority === "medium"
                              ? "bg-amber-500"
                              : "bg-green-500"
                        }`}
                      />
                      <div>
                        <p className="font-medium">{announcement.title}</p>
                        <p className="text-xs text-muted-foreground">{announcement.date}</p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Link href="/announcements">모든 공지 보기</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-background/40 backdrop-blur-sm border-primary/10 shadow-xl h-full">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg font-cinzel">
                  <Calendar className="h-5 w-5 text-primary" />
                  다가오는 이벤트
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {guildEvents.map((event) => (
                    <div key={event.id} className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          event.type === "raid"
                            ? "bg-red-500/10 text-red-500"
                            : event.type === "pvp"
                              ? "bg-amber-500/10 text-amber-500"
                              : "bg-green-500/10 text-green-500"
                        }`}
                      >
                        {event.type === "raid" ? (
                          <Sword className="h-5 w-5" />
                        ) : event.type === "pvp" ? (
                          <Trophy className="h-5 w-5" />
                        ) : (
                          <Users className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.date} {event.time}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Link href="/events">모든 이벤트 보기</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-background/40 backdrop-blur-sm border-primary/10 shadow-xl mb-8">
            <CardHeader>
              <CardTitle className="font-cinzel">길드 활동</CardTitle>
              <CardDescription>최근 길드 활동과 업적을 확인하세요.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="ranking">
                <TabsList className="mb-4">
                  <TabsTrigger value="ranking">길드 랭킹</TabsTrigger>
                  <TabsTrigger value="achievements">업적</TabsTrigger>
                  <TabsTrigger value="contributions">기여도</TabsTrigger>
                </TabsList>
                <TabsContent value="ranking">
                  <div className="space-y-4">
                    <div className="grid grid-cols-12 gap-4 font-medium text-muted-foreground">
                      <div className="col-span-2">순위</div>
                      <div className="col-span-6">길드명</div>
                      <div className="col-span-4 text-right">점수</div>
                    </div>
                    {guildRanking.map((guild) => (
                      <div
                        key={guild.rank}
                        className={`grid grid-cols-12 gap-4 p-3 rounded-lg ${
                          guild.name === "마비노기 길드" ? "bg-primary/10 font-medium" : ""
                        }`}
                      >
                        <div className="col-span-2">{guild.rank}</div>
                        <div className="col-span-6">{guild.name}</div>
                        <div className="col-span-4 text-right">{guild.points.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="achievements">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">업적 데이터를 불러오는 중...</p>
                  </div>
                </TabsContent>
                <TabsContent value="contributions">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">기여도 데이터를 불러오는 중...</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="bg-background/40 backdrop-blur-sm border-primary/10 shadow-xl">
            <CardHeader>
              <CardTitle className="font-cinzel">빠른 링크</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <Button
                  variant="outline"
                  className="h-auto py-3 sm:py-4 flex flex-col items-center justify-center text-sm sm:text-base"
                >
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 mb-1 sm:mb-2" />
                  <span>길드원 정보</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-3 sm:py-4 flex flex-col items-center justify-center text-sm sm:text-base"
                >
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5 mb-1 sm:mb-2" />
                  <span>공지사항</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-3 sm:py-4 flex flex-col items-center justify-center text-sm sm:text-base"
                >
                  <Sword className="h-4 w-4 sm:h-5 sm:w-5 mb-1 sm:mb-2" />
                  <span>길드 전투</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-3 sm:py-4 flex flex-col items-center justify-center text-sm sm:text-base"
                >
                  <Trophy className="h-4 w-4 sm:h-5 sm:w-5 mb-1 sm:mb-2" />
                  <span>업적</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/40 backdrop-blur-sm border-primary/10 shadow-xl">
            <CardHeader>
              <CardTitle className="font-cinzel">내 캐릭터 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">용사의이름</h3>
                  <p className="text-muted-foreground">레벨 85 전사</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">길드 기여도</span>
                  <span className="font-medium">1,250 포인트</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">길드 랭크</span>
                  <span className="font-medium">부길드장</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">가입일</span>
                  <span className="font-medium">2023.05.15</span>
                </div>
                <div className="pt-4">
                  <Button variant="outline" size="sm" className="w-full">
                    <Link href="/profile">프로필 관리</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
