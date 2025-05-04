import { Clock, Edit, Trash2, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScheduleResponse } from "@/app/(auth)/schedule/api";
import { User } from "next-auth";
import { useEffect, useState } from "react";

interface ScheduleListItemProps {
  schData: ScheduleResponse;
  user: User;
  handleEditEvent: (data: ScheduleResponse) => void;
  handleDeleteEvent: (docId: string) => void;
  handleParticipateEvent: (data: ScheduleResponse) => void;
}

interface PartipateCountObjType {
  currentParticipateUserCount: number;
  maxParticipateUserCount: number;
}

export default function ScheduleListItem({
  schData,
  user,
  handleEditEvent,
  handleDeleteEvent,
  handleParticipateEvent,
}: ScheduleListItemProps) {
  const [partipateUserCountObj, setPartipateUserCountObj] =
    useState<PartipateCountObjType>({
      currentParticipateUserCount: 0,
      maxParticipateUserCount: 0,
    });

  useEffect(() => {
    const currentParticipateUserCount =
      1 + (schData.participateEtcUser.length || 0);
    const maxParticipateUserCount = schData.maxParticipateCount;

    setPartipateUserCountObj({
      currentParticipateUserCount,
      maxParticipateUserCount,
    });
  }, [schData]);

  return (
    <div className="p-4 bg-background/50 rounded-lg border border-primary/10 space-y-3">
      {/* 상단 정보: 시간, 파티원 수 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-primary" />
          <span className="font-medium">{schData.time}</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          {partipateUserCountObj.currentParticipateUserCount} /{" "}
          {partipateUserCountObj.maxParticipateUserCount}
        </div>
      </div>

      {/* 파티 제목 */}
      <p className="text-base font-semibold">{schData.title}</p>

      {/* 등록자 + 버튼들 */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          파티장: {schData.participateWriteUser.participateUserId}
        </span>
        {schData.userDocId === user.docId ? (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleEditEvent(schData)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
              onClick={() => handleDeleteEvent(schData.docId)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="w-auto px-2 hover:bg-background"
              onClick={() => handleParticipateEvent(schData)}
            >
              <UserPlus className="mr-1 h-4 w-4" />
              자세히 보기
            </Button>
          </div>
        )}
      </div>

      {/* 등록일자 */}
      <div className="text-xs text-muted-foreground text-right">
        등록일: {new Date(schData.mngDt).toLocaleDateString()}
      </div>
    </div>
  );
}
