"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { BadgeResponse } from "@/app/(auth)/hub/api";
import { User } from "next-auth";
import { useGetUserBadgesByUserDocId } from "@/app/(auth)/(admin)/admin-badge/hooks/use-get-user-badges-by-user-doc-id";
import { MyBadgeCard } from "@/app/(auth)/profile/_components/my-badge-card";
import { MyBadgeDialog } from "@/app/(auth)/profile/_components/my-badge-dialog";

interface MyBadgesListProps {
  user: User;
}

export function MyBadgeList({ user }: MyBadgesListProps) {
  const { data, isPending } = useGetUserBadgesByUserDocId(user.docId);
  const [haveBages, setHaveBadges] = useState<BadgeResponse[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<BadgeResponse | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleBadgeClick = (badge: BadgeResponse) => {
    setSelectedBadge(badge);
    setIsDialogOpen(true);
  };

  useEffect(() => {
    if (!isPending && data && data.badges?.length > 0) {
      setHaveBadges(data.badges);
    } else {
      setHaveBadges([]);
    }
  }, [data, isPending]);

  return (
    <>
      <AnimatePresence mode="wait">
        {!isPending && haveBages.length > 0 ? (
          <motion.div
            key="badges-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`grid gap-4 ${"grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"}`}
          >
            {haveBages.map((badge) => (
              <MyBadgeCard
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

      <MyBadgeDialog
        badge={selectedBadge}
        isOpen={isDialogOpen}
        onCloseAction={() => setIsDialogOpen(false)}
      />
    </>
  );
}
