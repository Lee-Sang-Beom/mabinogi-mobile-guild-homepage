"use client";

import { useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Search, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { UserCard } from "./user-card";
import { BadgeSelectionDialog } from "./badge-selection-dialog";
import { useGetUserList } from "@/app/(auth)/dashboard/hooks/use-get-user-list";
import { User } from "next-auth";
import { Input } from "@/components/ui/input";
import { getSearchTermData } from "@/shared/utils/utils";
import {
  CreateUserBadgeCollectionType,
  UserBadgeCollectionType,
  UserBadgeResponse,
} from "@/app/(auth)/(admin)/admin-badge/api";
import { useCreateUserBadge } from "@/app/(auth)/(admin)/admin-badge/hooks/use-create-user-badge";
import { useUpdateUserBadge } from "@/app/(auth)/(admin)/admin-badge/hooks/use-update-user-badge";

export default function BadgeGiveTab() {
  const { data: guildMembers } = useGetUserList();
  const { mutate: createUserBadge } = useCreateUserBadge();
  const { mutate: updateUserBadge } = useUpdateUserBadge();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // 다이얼로그로 선택된 유저
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // 다이얼로그로 선택된 뱃지
  const [selectedBadgeDocId, setSelectedBadgeDocId] = useState<string | null>(
    null,
  );

  // 유저가 가지고 있는 현재 collection_user_badge 정보
  const [selectedUserBadge, setSelectedUserBadge] =
    useState<UserBadgeResponse | null>(null);

  // 검색어 관리
  const filterMembers = getSearchTermData<User>(
    guildMembers || [],
    searchTerm,
    ["id", "job"],
  );

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleBadgeConfirm = (docId: string) => {
    if (!selectedUser) {
      toast.error(`유저 정보를 불러오는 중 문제가 발생했습니다.`);
      return;
    }
    const type = selectedUserBadge != null ? "UPDATE" : "CREATE";

    if (type === "CREATE") {
      const newUserBadgeData: CreateUserBadgeCollectionType = {
        userDocId: selectedUser!.docId,
        badgeDocIds: [docId],
      };

      createUserBadge(newUserBadgeData);
    } else {
      const badgeDocIds = selectedUserBadge!.badges.map((badge) => badge.docId);
      const updateUserBadgeData: UserBadgeCollectionType = {
        docId: selectedUserBadge!.docId,
        userDocId: selectedUser!.docId,
        badgeDocIds: [...badgeDocIds, docId],
      };

      updateUserBadge({
        docId: selectedUserBadge!.docId,
        data: updateUserBadgeData,
        appendBadgeDocId: docId,
      });
    }
    setIsDialogOpen(false);
    setSelectedBadgeDocId(null);
    setSearchTerm("");
    setSelectedUser(null);
  };

  return (
    <TabsContent value="give" className="space-y-6">
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={18}
        />
        <Input
          placeholder="유저 ID 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10 bg-muted"
        />
        {searchTerm && (
          <X
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
            size={18}
            onClick={() => setSearchTerm("")}
          />
        )}
      </div>

      <AnimatePresence mode="wait">
        {filterMembers && filterMembers.length > 0 ? (
          <motion.div
            key="users-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {filterMembers.map((user) => (
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

      {selectedUser && (
        <BadgeSelectionDialog
          isOpen={isDialogOpen}
          onCloseAction={() => {
            setIsDialogOpen(false);
            setSelectedBadgeDocId(null);
          }}
          onConfirmAction={handleBadgeConfirm}
          selectedUser={selectedUser}
          selectedBadgeDocId={selectedBadgeDocId}
          setSelectedBadgeDocIdAction={setSelectedBadgeDocId}
          setSelectedUserBadgeAction={setSelectedUserBadge}
        />
      )}
    </TabsContent>
  );
}
