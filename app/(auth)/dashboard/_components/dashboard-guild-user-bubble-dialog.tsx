import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getJobClassColor,
  JobClassIcons,
} from "@/app/(auth)/dashboard/job-class-utils";
import { Award, CheckCircle, Sword, XCircle } from "lucide-react";
import { User } from "next-auth";
import { Dispatch, SetStateAction } from "react";
import { guildRoleOptions } from "@/shared/constants/game";
import { cn } from "@/lib/utils";

interface DashboardGuildUserBubbleDialogProps {
  selectedUser: User | null;
  setSelectedUser: Dispatch<SetStateAction<User | null>>;
}
export default function DashboardGuildUserBubbleDialog({
  selectedUser,
  setSelectedUser,
}: DashboardGuildUserBubbleDialogProps) {
  if (!selectedUser) return null;
  const isBadge =
    selectedUser.isHaveEventBadge && selectedUser.isHaveEventBadge === "Y";

  return (
    <Dialog
      open={!!selectedUser}
      onOpenChange={(open) => !open && setSelectedUser(null)}
    >
      <DialogContent className="sm:max-w-md bg-background/80 backdrop-blur-sm ">
        <DialogHeader>
          <DialogTitle>길드원 정보</DialogTitle>
          <DialogDescription>
            <span className={"font-bold"}>{selectedUser.id}</span>님의 상세
            정보입니다.
          </DialogDescription>
        </DialogHeader>
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div
                className="relative h-16 w-16 rounded-full overflow-hidden flex items-center justify-center bg-background/80 border-2"
                style={{ borderColor: getJobClassColor(selectedUser.job) }}
              >
                {(() => {
                  const IconComponent =
                    JobClassIcons[selectedUser.job] || Sword;
                  return (
                    <IconComponent
                      className="h-10 w-10"
                      style={{ color: getJobClassColor(selectedUser.job) }}
                    />
                  );
                })()}
              </div>
              <div className={"flex items-center"}>
                <h3 className="font-bold text-lg flex items-center relative">
                  <span>
                    {isBadge ? (
                      <Award
                        className={
                          "absolute top-[-20px] left-[-15px] text-primary w-5 h-5"
                        }
                      />
                    ) : null}
                  </span>
                  <span>{selectedUser.name}</span>
                </h3>
                <p
                  className={cn("text-muted-foreground", isBadge ? "ml-1" : "")}
                >
                  {selectedUser.id} / {selectedUser.job}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">등급</span>
                <span className="font-medium">
                  {" "}
                  {
                    guildRoleOptions.find(
                      (role) => role.value === selectedUser.role,
                    )!.name
                  }
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">최종 수정일</span>
                <span className="font-medium">{selectedUser.mngDt}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  자랑스런 길드원 여부
                </span>
                <span className="font-medium">
                  {isBadge ? <CheckCircle /> : <XCircle />}
                </span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
