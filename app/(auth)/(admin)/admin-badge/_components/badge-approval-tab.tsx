"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { BadgeResponse } from "@/app/(auth)/hub/api";
import { BadgeCard } from "@/app/(auth)/hub/_components/badges/badge-card";
import { User } from "next-auth";
import { AnimatedLoading } from "@/components/animated-loading";
import { BadgeApprovalDialog } from "./badge-approval-dialog";
import { TabsContent } from "@/components/ui/tabs";
import { useGetUnApprovedBadges } from "../../../hub/hooks/badges/use-get-unapproval-badges";
import { isHomePageAdmin } from "@/shared/utils/utils";
import { useUpdateApproveBadge } from "@/app/(auth)/(admin)/admin-badge/hooks/use-update-approval-badge";
import { useUpdateUnApproveBadge } from "@/app/(auth)/(admin)/admin-badge/hooks/use-update-unapproval-badge";

interface BadgesApprovalTabProps {
  user: User;
  viewMode: "grid" | "cards";
}

export function BadgeApprovalTab({ user, viewMode }: BadgesApprovalTabProps) {
  const { data: badges, isPending } = useGetUnApprovedBadges();
  const approveBadgeMutation = useUpdateApproveBadge();
  const unApproveBadgeMutation = useUpdateUnApproveBadge();

  const isHAdmin = isHomePageAdmin(user);
  const [selectedBadge, setSelectedBadge] = useState<BadgeResponse | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleBadgeClick = (badge: BadgeResponse) => {
    setSelectedBadge(badge);
    setIsDialogOpen(true);
  };

  const handleApprovalBadge = (docId: string) => {
    approveBadgeMutation.mutate(
      { docId },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
        },
      },
    );
  };

  const handleUnApprovalBadge = (docId: string) => {
    unApproveBadgeMutation.mutate(docId, {
      onSuccess: () => {
        setIsDialogOpen(false);
      },
    });
  };

  if (isPending) {
    return <AnimatedLoading />;
  }

  return (
    <TabsContent value="approval">
      <AnimatePresence mode="wait">
        {badges && badges.data.length > 0 ? (
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
            {badges.data.map((badge) => (
              <BadgeCard
                key={`${badge.docId}_${badge.imgName}`}
                badge={badge}
                haveBadges={[badge]}
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
        <BadgeApprovalDialog
          isHomePageAdmin={isHAdmin}
          badge={selectedBadge}
          isOpen={isDialogOpen}
          onCloseAction={() => setIsDialogOpen(false)}
          onApprovalAction={handleApprovalBadge}
          onUnApprovalAction={handleUnApprovalBadge}
        />
      )}
    </TabsContent>
  );
}
