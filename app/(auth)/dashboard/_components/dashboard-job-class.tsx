import { Users } from "lucide-react";
import { DashboardJobClassChart } from "./dashboard-job-class-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

export default function DashboardJobClass() {
  const theme = useTheme(); // 테마 정보 가져오기

  return (
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
          <DashboardJobClassChart theme={theme.theme as "light" | "dark"} />
        </div>
      </CardContent>
    </Card>
  );
}
