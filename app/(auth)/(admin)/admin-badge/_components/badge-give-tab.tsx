"use client";

import { useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { UserCard } from "./user-card";
import { BadgeSelectionDialog } from "./badge-selection-dialog";
import { useGetUserList } from "@/app/(auth)/dashboard/hooks/use-get-user-list";
import { User } from "next-auth";

interface BadgesGiveTabProps {
  user: User;
}

export default function BadgeGiveTab({ user }: BadgesGiveTabProps) {
  console.log("useData is ", user);
  const { data: guildMembers } = useGetUserList();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleBadgeConfirm = (docId: string) => {
    console.log("docId ", docId);

    // 실제로는 API 호출을 통해 뱃지 수여 처리
    toast.success(
      `${selectedUser?.id}님에게 뱃지가 성공적으로 수여되었습니다!`,
    );
    setIsDialogOpen(false);
  };

  return (
    <TabsContent value="give" className="space-y-6">
      <AnimatePresence mode="wait">
        {guildMembers && guildMembers.length > 0 ? (
          <motion.div
            key="users-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {guildMembers.map((user) => (
              <UserCard
                key={user.docId}
                user={user}
                onClickAction={() => handleUserClick(user)}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="no-users"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-12 text-center bg-background/60 backdrop-blur-sm border-primary/10 shadow-xl overflow-hidden rounded-2xl"
          >
            <div className="w-auto p-6">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              조회된 길드원 목록이 없습니다.
            </h3>
          </motion.div>
        )}
      </AnimatePresence>

      <BadgeSelectionDialog
        isOpen={isDialogOpen}
        onCloseAction={() => setIsDialogOpen(false)}
        onConfirmAction={handleBadgeConfirm}
        selectedUser={selectedUser}
      />
    </TabsContent>
  );
}
