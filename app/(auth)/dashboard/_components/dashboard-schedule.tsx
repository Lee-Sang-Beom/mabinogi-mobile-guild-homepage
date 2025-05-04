import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Info, Shield } from "lucide-react";
import Link from "next/link";
import { useGetLatestSchedule } from "../hooks/use-get-latest-schedule";
import { useEffect, useState } from "react";
import moment from "moment";
import { cn } from "@/lib/utils";

interface PartipateCountObjType {
  currentParticipateUserCount: number;
  maxParticipateUserCount: number;
}

export default function DashboardSchedule() {
  const { data } = useGetLatestSchedule();
  const [partipateUserCountObj, setPartipateUserCountObj] =
    useState<PartipateCountObjType>({
      currentParticipateUserCount: 0,
      maxParticipateUserCount: 0,
    });

  const [isPartyDepartCurrentDate, setIsPartyDepartCurrentDate] =
    useState<boolean>(false);
  useEffect(() => {
    if (!data || !data.data) {
      setIsPartyDepartCurrentDate(false);
      return;
    }

    // count 세팅
    const currentParticipateUserCount =
      1 + (data.data.participateEtcUser.length || 0);
    const maxParticipateUserCount = data.data.maxParticipateCount;

    setPartipateUserCountObj({
      currentParticipateUserCount,
      maxParticipateUserCount,
    });

    // 파티출발일자가 오늘인지 확인
    const currentDateString = moment(new Date()).format("YYYY-MM-DD");
    const partyDepartDate = data.data.date;

    if (partyDepartDate === currentDateString) {
      setIsPartyDepartCurrentDate(true);
    } else {
      setIsPartyDepartCurrentDate(false);
    }
  }, [data]);

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
        <CardTitle className="flex items-center justify-between text-lg font-cinzel">
          <span className="flex gap-2 items-center">
            <Shield className="h-5 w-5 text-primary" />
            파티 찾기
          </span>
          <span className="text-primary text-sm flex gap-1 items-center">
            <Clock className="w-4 h-4" />
            {isPartyDepartCurrentDate && "출발 임박!"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="space-y-2">
          {data?.data ? (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">파티 제목</span>
                <span className="font-medium">{data.data.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">파티장</span>
                <span className="font-medium">
                  {data.data.participateWriteUser.participateUserId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">파티원 수</span>
                <span className="font-medium">
                  {partipateUserCountObj.currentParticipateUserCount} /{" "}
                  {partipateUserCountObj.maxParticipateUserCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">출발 시간</span>
                <span
                  className={cn(
                    "font-medium",
                    isPartyDepartCurrentDate && "text-red-400"
                  )}
                >
                  {`${data.data.date} ${data.data.time} `}
                </span>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="w-full flex flex-col justify-center items-center gap-5">
                <Info className="w-15 h-15 text-blue-500" />
                아직 작성된 구인글이 없습니다.
              </div>
            </div>
          )}
          <div className="pt-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full group-hover:bg-primary/10 transition-colors duration-300"
            >
              <Link
                href="/schedule"
                className="flex items-center justify-center w-full"
              >
                파티찾기 페이지 이동
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
