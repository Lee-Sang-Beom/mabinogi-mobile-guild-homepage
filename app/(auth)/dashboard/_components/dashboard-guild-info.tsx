import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { guildInfo } from "@/shared/constants/game";
import { motion } from "framer-motion";
import { ArrowRight, Shield } from "lucide-react";
import Link from "next/link";

export default function DashboardGuildInfo() {
  return (
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
              <Link
                href="/members"
                className="flex items-center justify-center w-full"
              >
                길드 정보 상세보기
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 1.5,
                  }}
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
  );
}
