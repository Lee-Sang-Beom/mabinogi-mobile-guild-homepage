"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit, Lock, Trash2, Unlock } from "lucide-react";
import { BadgeResponse } from "../../api";
import { BadgeImage } from "@/app/(auth)/hub/_components/badges/badge-image";
import { User } from "next-auth";
import { AnimatedLoading } from "@/components/animated-loading";
import { isHomePageAdmin } from "@/shared/utils/utils";
import { useGetUserByDocId } from "@/app/(auth)/(admin)/admin-badge/hooks/use-get-user-by-doc-id";
import { getBadgeDifficultyColorClassName } from "@/shared/utils/badge-utils";

interface BadgeDialogProps {
  user: User;
  badge: BadgeResponse | null;
  haveBadges: BadgeResponse[];
  isOpen: boolean;
  onCloseAction: () => void;
  onEditAction: (badge: BadgeResponse) => void;
  onDeleteAction: (docId: string) => void;
}

export function BadgeDialog({
  user,
  badge,
  haveBadges,
  isOpen,
  onCloseAction,
  onEditAction,
  onDeleteAction,
}: BadgeDialogProps) {
  const [isHave, setIsHave] = useState(false);

  // isEditing 상태 제거
  const { data: badgeUser, isPending } = useGetUserByDocId(
    badge ? badge.registerUserDocId : "",
  );

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  if (!badge) return null;

  const isMe = badge.registerUserDocId === user.docId;
  const isHAdmin = isHomePageAdmin(user);

  // 수정된 handleEdit 함수
  const handleEdit = () => {
    onEditAction(badge);
  };

  const handleDelete = () => {
    onDeleteAction(badge.docId);
    setIsDeleteDialogOpen(false);
    onCloseAction();
  };

  if (isPending) {
    <AnimatedLoading />;
    return;
  }

  useEffect(() => {
    if (!badge) return;
    const isHaveBadge = haveBadges.some((haveBadgeItem) => {
      return haveBadgeItem.docId === badge.docId;
    });

    setIsHave(isHaveBadge);
  }, [badge, haveBadges]);

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            onCloseAction();
            // setIsEditing(false) 제거
          }
        }}
      >
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          {/* isEditing 조건 제거, 항상 뱃지 상세 정보만 표시 */}
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {badge.badge.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="flex flex-col sm:flex-row gap-6 items-center">
                <motion.div
                  className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-lg overflow-hidden border-4 border-amber-500/50 shadow-lg"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <BadgeImage badge={badge} isHovered={false} isHave={isHave} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </motion.div>

                <div className="flex-1 space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      난이도
                    </h4>
                    <span
                      className={`
                      inline-block mt-1 text-sm px-3 py-1 rounded-full text-white
                      ${getBadgeDifficultyColorClassName(badge)}
                    `}
                    >
                      {badge.difficultyLevel}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  설명
                </h4>
                <p className="text-sm">{badge.badge.description}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  뱃지 등록자
                </h4>
                <p className="text-sm">
                  {badgeUser ? badgeUser.id : "불러오는 중..."}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    획득 조건
                  </h4>
                  {badge.isAcquisitionConditionsOpen ? (
                    <Unlock className="h-4 w-4 text-green-500" />
                  ) : (
                    <Lock className="h-4 w-4 text-orange-500" />
                  )}
                </div>

                {badge.isAcquisitionConditionsOpen || isHAdmin ? (
                  <p className="text-sm">{badge.acquisitionConditions}</p>
                ) : (
                  <div className="bg-muted/50 p-3 rounded-md text-sm text-muted-foreground italic">
                    획득 조건이 비공개입니다. 도전하며 발견해보세요!
                  </div>
                )}
              </div>
            </div>

            {isMe && (
              <DialogFooter className="flex justify-between sm:justify-end gap-2">
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  삭제
                </Button>
                <Button onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  수정
                </Button>
              </DialogFooter>
            )}
          </>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>뱃지 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              {`정말로 '${badge.badge.name}' 뱃지를 삭제하시겠습니까? 이 작업은
              되돌릴 수 없습니다.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
