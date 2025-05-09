"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BadgeResponse } from "@/app/(auth)/hub/api";
import { BadgeCard } from "@/app/(auth)/hub/_components/badges/badge-card";
import { BadgeDialog } from "@/app/(auth)/hub/_components/badges/badge-dialog";
import { BadgeForm } from "./badge-form";
import { BadgeFormSchemaType } from "@/app/(auth)/hub/schema";

interface BadgesTabProps {
  badges: BadgeResponse[];
  onBadgeAddAction: (badge: BadgeFormSchemaType) => void;
  onBadgeEditAction: (docId: string | null, badge: BadgeFormSchemaType) => void;
  onBadgeDeleteAction: (docId: string) => void;
  viewMode: "grid" | "cards";
}

export function BadgesTab({
  badges,
  onBadgeAddAction,
  onBadgeEditAction,
  onBadgeDeleteAction,
  viewMode,
}: BadgesTabProps) {
  const [selectedBadge, setSelectedBadge] = useState<BadgeResponse | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<BadgeResponse | null>(null);

  const handleBadgeClick = (badge: BadgeResponse) => {
    setSelectedBadge(badge);
    setIsDialogOpen(true);
  };

  const handleAddBadge = () => {
    setEditingBadge(null);
    setIsFormOpen(true);
  };

  const handleEditBadge = (badge: BadgeResponse) => {
    setEditingBadge(badge);
    setIsFormOpen(true);
    setIsDialogOpen(false);
  };

  const handleDeleteBadge = (docId: string) => {
    onBadgeDeleteAction(docId);
    setIsDialogOpen(false);
  };

  const handleSaveBadge = (
    docId: string | null,
    badge: BadgeFormSchemaType,
  ) => {
    if (editingBadge) {
      // 기존 뱃지 수정
      onBadgeEditAction(docId, badge);
    } else {
      // 새 뱃지 추가
      onBadgeAddAction(badge);
    }
    setIsFormOpen(false);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Button onClick={handleAddBadge} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> 뱃지 추가
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {badges.length > 0 ? (
          <motion.div
            key="badges-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`grid gap-4 ${
              viewMode === "grid"
                ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {badges.map((badge) => (
              <BadgeCard
                key={`${badge.docId}_${badge.imgName}`}
                badge={badge}
                onClickAction={() => handleBadgeClick(badge)}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="no-badges"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-12 text-center bg-background/60 backdrop-blur-sm border-primary/10 shadow-xl overflow-hidden rounded-2xl "
          >
            <div className="w-auto p-6 ">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              조회된 뱃지 목록이 없습니다.
            </h3>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedBadge && (
        <BadgeDialog
          badge={selectedBadge}
          isOpen={isDialogOpen}
          onCloseAction={() => setIsDialogOpen(false)}
          onEditAction={handleEditBadge}
          onDeleteAction={handleDeleteBadge}
        />
      )}

      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => !open && setIsFormOpen(false)}
      >
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <BadgeForm
            defaultValues={
              editingBadge
                ? {
                    badge: editingBadge.badge,
                    isAcquisitionConditionsOpen:
                      editingBadge.isAcquisitionConditionsOpen,
                    acquisitionConditions: editingBadge.acquisitionConditions,
                    difficultyLevel: editingBadge.difficultyLevel,
                    imgName: editingBadge.imgName,
                  }
                : undefined
            }
            onSubmitAction={(data: BadgeFormSchemaType) => {
              if (editingBadge) {
                handleSaveBadge(editingBadge.docId, {
                  ...data,
                });
              } else {
                handleSaveBadge(null, {
                  ...data,
                });
              }
            }}
            onCancelAction={() => setIsFormOpen(false)}
            isEditing={!!editingBadge}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
