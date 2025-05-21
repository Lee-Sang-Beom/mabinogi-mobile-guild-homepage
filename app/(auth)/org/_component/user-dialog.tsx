"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Info, Sword } from "lucide-react";
import type { User } from "next-auth";
import {
  getJobClassColor,
  JobClassIcons,
} from "../../dashboard/job-class-utils";
import { useGetUserBadgesByUserDocId } from "@/app/(auth)/(admin)/admin-badge/hooks/use-get-user-badges-by-user-doc-id";
import { useEffect, useState } from "react";
import type { BadgeResponse } from "@/app/(auth)/hub/api";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getBadgeDifficultyColorClassName } from "@/shared/utils/badge-utils";
import Image from "next/image";
import { BlurFade } from "@/components/magicui/blur-fade";
import { getBadgeTierKo } from "@/app/(auth)/org/utils";

interface BadgeImageProps {
  badge: BadgeResponse;
  isHovered?: boolean;
}

const DialogBadgeImage = ({ badge, isHovered = false }: BadgeImageProps) => {
  const [imgSrc, setImgSrc] = useState(
    badge.imgName && badge.imgName.trim() !== ""
      ? `/images/badges/${badge.imgName}`
      : "/images/favicon-mabinogi-mobile.png",
  );

  return (
    <div className="relative h-full w-full">
      <BlurFade delay={0.25} inView className={"w-auto h-[100%]"}>
        <Image
          src={imgSrc || "/placeholder.svg"}
          alt={badge.badge.name}
          fill
          className="object-cover transition-transform duration-500"
          style={{ transform: isHovered ? "scale(1.1)" : "scale(1)" }}
          onError={() => setImgSrc("/images/favicon-mabinogi-mobile.png")}
        />
      </BlurFade>
    </div>
  );
};

interface UserDialogProps {
  user: User;
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
}

export function UserDialog({
  user,
  open,
  onOpenChangeAction,
}: UserDialogProps) {
  const { data, isPending } = useGetUserBadgesByUserDocId(user.docId);
  const [haveBadges, setHaveBadges] = useState<BadgeResponse[]>([]);
  const [expandedBadgeId, setExpandedBadgeId] = useState<string | null>(null);
  const [hoveredBadgeId, setHoveredBadgeId] = useState<string | null>(null);
  const Icon = JobClassIcons[user.job] || Sword;
  const iconColor = getJobClassColor(user.job);

  useEffect(() => {
    if (!isPending && data && data.badges?.length > 0) {
      setHaveBadges(data.badges);
    } else {
      setHaveBadges([]);
    }
  }, [data, isPending]);

  const toggleBadgeExpand = (badgeId: string) => {
    if (expandedBadgeId === badgeId) {
      setExpandedBadgeId(null);
    } else {
      setExpandedBadgeId(badgeId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="sm:max-w-md bg-background/80 backdrop-blur-sm max-h-[80vh] overflow-y-auto">
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
                <>
                  {!isPending && haveBadges.length > 0 ? (
                    <Badge>보유</Badge>
                  ) : (
                    <Badge variant="destructive">미보유</Badge>
                  )}
                </>
              </td>
            </tr>
            <tr>
              <th className="py-2 text-muted-foreground">별의 등급</th>
              <td>
                <Badge className={"bg-sky-400 text-white"}>
                  {getBadgeTierKo(
                    !isPending && haveBadges.length > 0 ? haveBadges.length : 0,
                  )}
                </Badge>
              </td>
            </tr>
          </tbody>
        </table>

        {/* 뱃지 섹션 - 아코디언 사용 */}
        {haveBadges.length > 0 ? (
          <>
            <Separator className="my-4" />
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="badges" className="border-none">
                <AccordionTrigger className="py-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">보유 뱃지</h3>
                    <Badge
                      variant="outline"
                      className="font-normal bg-primary text-black"
                    >
                      {haveBadges.length}개
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {haveBadges.length > 0 ? (
                    <div className="grid gap-3 mt-2">
                      {haveBadges.map((badge) => {
                        const isHovered = hoveredBadgeId === badge.docId;
                        return (
                          <div
                            key={badge.docId}
                            className="rounded-lg border bg-card p-3 shadow-sm transition-all hover:shadow-md"
                            onMouseEnter={() => setHoveredBadgeId(badge.docId)}
                            onMouseLeave={() => setHoveredBadgeId(null)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                                <DialogBadgeImage
                                  badge={badge}
                                  isHovered={isHovered}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-sm truncate">
                                    {badge.badge.name}
                                  </h4>
                                  <div className="flex items-center gap-1">
                                    <span
                                      className={cn(
                                        "text-xs px-2 py-0.5 rounded-full border",
                                        getBadgeDifficultyColorClassName(badge),
                                      )}
                                    >
                                      {badge.difficultyLevel}
                                    </span>
                                    {badge.isAcquisitionConditionsOpen && (
                                      <button
                                        onClick={() =>
                                          toggleBadgeExpand(badge.docId)
                                        }
                                        className="ml-1 p-1 rounded-full hover:bg-muted"
                                        aria-label={
                                          expandedBadgeId === badge.docId
                                            ? "접기"
                                            : "펼치기"
                                        }
                                      >
                                        {expandedBadgeId === badge.docId ? (
                                          <ChevronUp className="h-4 w-4" />
                                        ) : (
                                          <ChevronDown className="h-4 w-4" />
                                        )}
                                      </button>
                                    )}
                                    {!badge.isAcquisitionConditionsOpen && (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <div className="ml-1 p-1 rounded-full text-muted-foreground">
                                              <Info className="h-4 w-4" />
                                            </div>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>획득 조건이 비공개입니다</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}
                                  </div>
                                </div>
                                {badge.isAcquisitionConditionsOpen &&
                                  expandedBadgeId === badge.docId && (
                                    <div className="mt-2 text-xs text-muted-foreground bg-muted p-2 rounded-md">
                                      <p className="font-medium mb-1">
                                        획득 조건:
                                      </p>
                                      <p>{badge.acquisitionConditions}</p>
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <div className="text-3xl mb-2">🏅</div>
                      <p>보유한 뱃지가 없습니다</p>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        ) : (
          <></>
        )}
      </DialogContent>
    </Dialog>
  );
}
