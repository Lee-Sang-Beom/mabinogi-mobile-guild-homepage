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
          <DialogDescription className="mt-2 w-full text-left">
            <span className="font-bold">{user.id}</span>님의 상세 정보입니다.
          </DialogDescription>
        </DialogHeader>

        {/* 사용자 정보 테이블 */}
        <table className="w-full text-left text-sm">
          <tbody>
            <tr>
              <th className="py-2 text-muted-foreground">직업</th>
              <td>
                <p className={"flex items-center gap-2"}>
                  <Icon className="h-4 w-4" style={{ color: iconColor }} />
                  {user.job}
                </p>
              </td>
            </tr>
            <tr>
              <th className="py-2 text-muted-foreground">역할</th>
              <td>
                {user.role === "GUILD_MASTER" && <Badge>길드마스터</Badge>}
                {user.role === "GUILD_SUB_MASTER" && <Badge>서브마스터</Badge>}
                {user.role === "GUILD_MEMBER" && <Badge>길드원</Badge>}
              </td>
            </tr>
            <tr>
              <th className="py-2 text-muted-foreground">정보 수정일</th>
              <td>{user.mngDt}</td>
            </tr>
            <tr>
              <th className="py-2 text-muted-foreground">이벤트 뱃지</th>
              <td>
                {user.isHaveEventBadge === "Y" ? (
                  <Badge>보유</Badge>
                ) : (
                  <Badge variant="destructive">미보유</Badge>
                )}
              </td>
            </tr>
            <tr>
              <th className="py-2 text-muted-foreground">가입 승인</th>
              <td>
                {user.approvalJoinYn === "Y" ? (
                  <Badge className="bg-sky-300 text-white">승인됨</Badge>
                ) : (
                  <Badge variant="destructive">미승인</Badge>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </DialogContent>
    </Dialog>
  );
}
