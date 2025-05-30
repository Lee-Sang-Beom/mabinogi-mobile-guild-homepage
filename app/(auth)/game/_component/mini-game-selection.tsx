"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Gamepad2, Lock, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const games = [
  {
    id: "snake",
    title: "뱀 게임",
    description: "클래식한 뱀 게임으로 추억을 되살려보세요!",
    icon: "🐍",
    url: "/game/snake",
    available: true,
    difficulty: "쉬움",
    players: "1인",
  },
  {
    id: "vampire-survivors",
    title: "뱀파이어 서바이벌",
    description: "몰려오는 동굴이.. 아아니 몬스터들을 물리치며 생존하세요!",
    icon: "🧛",
    url: "/game/vampire-survivors",
    available: true,
    difficulty: "보통",
    players: "1인",
  },
  {
    id: "breakout",
    title: "벽돌깨기",
    description: "공을 튕겨서 모든 벽돌을 깨트리세요!",
    icon: "🧱",
    url: "/game/breakout",
    available: false,
    difficulty: "보통",
    players: "1인",
  },
];

export default function MiniGameSelection() {
  const router = useRouter();

  const handleGameSelect = (game: (typeof games)[0]) => {
    if (game.available) {
      router.push(game.url);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "쉬움":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "보통":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "어려움":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] py-8 sm:py-12 px-3 sm:px-6 lg:px-8 relative w-full max-w-full overflow-x-hidden">
      {/* Animated Background Elements */}
      <motion.div
        className="absolute left-1/4 top-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-purple-500/10 to-blue-500/10 blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 20,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute right-1/4 bottom-1/4 -z-10 h-[350px] w-[350px] rounded-full bg-gradient-to-br from-amber-500/10 to-red-500/10 blur-3xl"
        animate={{
          x: [0, -30, 0],
          y: [0, 50, 0],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 25,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Gamepad2 className="h-8 w-8 text-amber-500" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                미니게임 선택
              </span>
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            재미있는 미니게임으로 잠시 휴식을 취해보세요!
          </p>
        </motion.div>

        {/* Games Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              whileHover={game.available ? { y: -5 } : {}}
              className="h-full"
            >
              <Card
                className={`h-full transition-all duration-300 relative overflow-hidden ${
                  game.available
                    ? "cursor-pointer hover:shadow-lg hover:shadow-amber-500/20 border-amber-500/20"
                    : "opacity-60 cursor-not-allowed"
                }`}
                onClick={() => handleGameSelect(game)}
              >
                {!game.available && (
                  <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <div className="text-center">
                      <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <Badge variant="secondary" className="text-xs">
                        개발 예정
                      </Badge>
                    </div>
                  </div>
                )}

                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{game.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{game.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className={`text-xs ${getDifficultyColor(game.difficulty)}`}
                          >
                            {game.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {game.players}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {game.available && (
                      <Zap className="h-5 w-5 text-amber-500" />
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {game.description}
                  </p>

                  <div className="mt-4">
                    <Button
                      className="w-full"
                      disabled={!game.available}
                      variant={game.available ? "default" : "secondary"}
                    >
                      {game.available ? "게임 시작" : "개발 중"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Back Button */}
        <motion.div
          className="flex justify-start"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            돌아가기
          </Button>
        </motion.div>

        {/* Footer Info */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-muted-foreground text-sm">
            <Gamepad2 className="h-4 w-4" />더 많은 게임이 곧 추가될 예정입니다!
          </div>
        </motion.div>
      </div>
    </div>
  );
}
