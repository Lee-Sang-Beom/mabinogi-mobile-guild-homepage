import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { guildInfo } from "@/shared/constants/game";
import { DashboardGuildUserBubble } from "./dashboard-guild-user-bubble";
import { motion } from "framer-motion";
import { Dispatch, SetStateAction } from "react";
import { User } from "next-auth";

interface DashboardIntroduceGuildMemberProps {
  setSelectedUser: Dispatch<SetStateAction<User | null>>;
  user: User;
}
export default function DashboardIntroduceGuildMember({
  setSelectedUser,
  user,
}: DashboardIntroduceGuildMemberProps) {
  return (
    <Card className="bg-background/40 backdrop-blur-sm border-primary/10 shadow-xl overflow-hidden">
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-2 text-lg font-cinzel">
          <Trophy className="h-5 w-5 text-primary" />
          길드원 소개
        </CardTitle>
        <CardDescription>
          {guildInfo.name} 길드의 멤버들을 만나보세요. 멤버를 클릭하면 상세
          정보를 볼 수 있습니다.
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
          <DashboardGuildUserBubble
            currentLoginUser={user}
            setSelectedUserAction={setSelectedUser}
          />
        </div>
      </CardContent>
    </Card>
  );
}
