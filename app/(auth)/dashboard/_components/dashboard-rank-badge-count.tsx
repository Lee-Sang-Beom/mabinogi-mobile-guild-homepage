import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import { useGetAllUserBadgeCounts } from "@/app/(auth)/(admin)/admin-badge/hooks/use-get-all-user-badge-count";
import { UserBadgeCountResponse } from "@/app/(auth)/(admin)/admin-badge/api";
import { useEffect, useState } from "react";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { HyperText } from "@/components/magicui/hyper-text";

export default function DashboardRankBadgeCount() {
  const { data: userBadgeCountList } = useGetAllUserBadgeCounts();
  const [top3BadgeUsers, setTop3BadgeUsers] = useState<
    UserBadgeCountResponse[]
  >([]);

  useEffect(() => {
    if (!userBadgeCountList) return;
    const newTop3BadgeUsers = [...userBadgeCountList]
      .sort((a, b) => b.badgeCount - a.badgeCount)
      .slice(0, 3);
    setTop3BadgeUsers(newTop3BadgeUsers);
  }, [userBadgeCountList]);

  const getBadgeTierKo = (userBadgeCount: number) => {
    if (userBadgeCount === 0) return "우주먼지(novice)";
    if (userBadgeCount <= 5) return "소성(beginner)";
    if (userBadgeCount <= 15) return "항성(intermediate)";
    if (userBadgeCount <= 20) return "거성(advanced)";
    if (userBadgeCount <= 30) return "초신성(expert)";
    return "은하(legendary)";
  };

  return (
    <Card className="bg-background/40 backdrop-blur-sm border-primary/10 shadow-xl h-full overflow-hidden group">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-yellow-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        animate={{ opacity: [0, 0.5, 0] }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      />
      <CardHeader className="pb-2 relative z-10">
        <CardTitle className="flex items-center gap-2 text-lg font-cinzel">
          <BadgeCheck className="h-5 w-5 text-yellow-500" />
          뱃지 랭킹 Top 3
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 space-y-3">
        {top3BadgeUsers.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            랭킹 정보를 불러오고 있습니다...
          </div>
        ) : (
          <ul className="space-y-2">
            {top3BadgeUsers.map((user, index) => {
              const rankColors = [
                "text-yellow-500",
                "text-sky-500",
                "text-orange-500",
              ];
              const medals = ["🥇", "🥈", "🥉"];
              return (
                <li
                  key={user.userDocId}
                  className="flex justify-between items-center px-3 py-2 rounded-md bg-muted/50"
                >
                  <span
                    className={`font-semibold ${rankColors[index]} flex items-center gap-2`}
                  >
                    {medals[index]}
                    <HyperText className={"text-sm"}>{user.user.id}</HyperText>
                  </span>
                  <p>
                    <span className={"flex items-center gap-2 text-sm"}>
                      <span>뱃지 개수 : </span>
                      <NumberTicker
                        value={user.badgeCount}
                        className="text-muted-foreground font-bold"
                      />
                    </span>
                    <span className={"flex items-center gap-2 text-sm"}>
                      <span>별들의 모임/별의 성장수준: </span>
                      {getBadgeTierKo(user.badgeCount)}
                    </span>
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
