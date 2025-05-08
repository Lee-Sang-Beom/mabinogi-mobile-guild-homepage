"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Sword } from "lucide-react";
import { User } from "next-auth";
import {
  getJobClassColor,
  JobClassIcons,
} from "../../dashboard/job-class-utils";

interface UserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
}

export function UserDialog({
  user,
  open,
  onOpenChangeAction,
}: UserDialogProps) {
  if (!user) return null;

  const Icon = JobClassIcons[user.job] || Sword;
  const iconColor = getJobClassColor(user.job);
  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="sm:max-w-md bg-background/80 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Icon className="h-6 w-6" style={{ color: iconColor }} />
            {user.id}
          </DialogTitle>
          <DialogDescription>
            <span className={"font-bold"}>{user.id}</span>님의 상세 정보입니다.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-right text-muted-foreground text-sm">
              직업
            </span>
            <span className="col-span-3">{user.job}</span>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-right text-muted-foreground text-sm">
              역할
            </span>
            <span className="col-span-3">
              {user.role === "GUILD_MASTER" && <Badge>길드마스터</Badge>}
              {user.role === "GUILD_SUB_MASTER" && <Badge>서브마스터</Badge>}
              {user.role === "GUILD_MEMBER" && <Badge>길드원</Badge>}
            </span>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-right text-muted-foreground text-sm">
              정보 수정일
            </span>
            <span className="col-span-3">{user.mngDt}</span>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-right text-muted-foreground text-sm">
              이벤트 뱃지
            </span>
            <span className="col-span-3">
              {user.isHaveEventBadge === "Y" ? (
                <Badge>보유</Badge>
              ) : (
                <Badge variant="destructive">미보유</Badge>
              )}
            </span>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-right text-muted-foreground text-sm">
              가입 승인
            </span>
            <span className="col-span-3">
              {user.approvalJoinYn === "Y" ? (
                <Badge className="bg-sky-300 text-white">승인됨</Badge>
              ) : (
                <Badge variant="destructive">미승인</Badge>
              )}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
