"use client";

import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit, Lock, Trash2, Unlock } from "lucide-react";
import { BadgeImage } from "@/app/(auth)/hub/_components/badges/badge-image";
import { BadgeResponse } from "../../hub/api";
import { AnimatedLoading } from "@/components/animated-loading";
import { useGetUserByDocId } from "@/app/(auth)/(admin)/admin-badge/hooks/use-get-user-by-doc-id";

interface BadgeDialogProps {
  isHomePageAdmin: boolean;
  badge: BadgeResponse | null;
  isOpen: boolean;
  onCloseAction: () => void;
  onApprovalAction: (docId: string) => void;
  onUnApprovalAction: (docId: string) => void;
}

export function BadgeApprovalDialog({
  isHomePageAdmin,
  badge,
  isOpen,
  onCloseAction,
  onApprovalAction,
  onUnApprovalAction,
}: BadgeDialogProps) {
  const { data: badgeUser, isPending } = useGetUserByDocId(
    badge ? badge.registerUserDocId : "",
  );

  if (!badge) return null;

  const handleApproval = () => {
    onApprovalAction(badge.docId);
  };

  const handleUnApproval = () => {
    onUnApprovalAction(badge.docId);
    onCloseAction();
  };

  if (isPending) {
    <AnimatedLoading />;
    return;
  }
  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            onCloseAction();
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
                  <BadgeImage badge={badge} isHovered={false} />
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
                      ${badge.difficultyLevel === "쉬움" ? "bg-green-500" : ""}
                      ${badge.difficultyLevel === "보통" ? "bg-blue-500" : ""}
                      ${badge.difficultyLevel === "어려움" ? "bg-orange-500" : ""}
                      ${badge.difficultyLevel === "매우 어려움" ? "bg-red-500" : ""}
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

                {badge.isAcquisitionConditionsOpen || isHomePageAdmin ? (
                  <p className="text-sm">{badge.acquisitionConditions}</p>
                ) : (
                  <div className="bg-muted/50 p-3 rounded-md text-sm text-muted-foreground italic">
                    획득 조건이 비공개입니다. 도전하며 발견해보세요!
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="flex justify-between sm:justify-end gap-2">
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                onClick={handleUnApproval}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                거절
              </Button>
              <Button onClick={handleApproval}>
                <Edit className="h-4 w-4 mr-2" />
                승인
              </Button>
            </DialogFooter>
          </>
          {/* BadgeForm 부분 제거 */}
        </DialogContent>
      </Dialog>
    </>
  );
}
