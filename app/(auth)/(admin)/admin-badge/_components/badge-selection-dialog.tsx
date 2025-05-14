"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { User } from "next-auth";
import { BadgeCard } from "@/app/(auth)/(admin)/admin-badge/_components/badge-card";
import { BadgeResponse } from "@/app/(auth)/hub/api";
import { useGetApprovalBadges } from "@/app/(auth)/hub/hooks/badges/use-get-approval-badges";
import { getSearchTermData } from "@/shared/utils/utils";
import { useGetUserBadgesByUserDocId } from "@/app/(auth)/(admin)/admin-badge/hooks/use-get-user-badges-by-user-doc-id";
import { UserBadgeResponse } from "@/app/(auth)/(admin)/admin-badge/api";
import { AlreadyBadgeCard } from "@/app/(auth)/(admin)/admin-badge/_components/already-have-badge-card";

interface BadgeSelectionDialogProps {
  isOpen: boolean;
  onCloseAction: () => void;
  onConfirmAction: (badgeId: string) => void;
  selectedUser: User;
  selectedBadgeDocId: string | null;
  setSelectedBadgeDocIdAction: Dispatch<SetStateAction<string | null>>;
  setSelectedUserBadgeAction: Dispatch<
    SetStateAction<UserBadgeResponse | null>
  >;
}

export function BadgeSelectionDialog({
  isOpen,
  onCloseAction,
  onConfirmAction,
  selectedUser,
  selectedBadgeDocId,
  setSelectedBadgeDocIdAction,
  setSelectedUserBadgeAction,
}: BadgeSelectionDialogProps) {
  const { data: badges } = useGetApprovalBadges();
  const { data: haveBadges } = useGetUserBadgesByUserDocId(selectedUser.docId);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBadges = getSearchTermData<BadgeResponse>(
    badges?.data || [],
    searchTerm,
    ["badge.name"],
  );

  const handleConfirm = () => {
    if (selectedBadgeDocId) {
      onConfirmAction(selectedBadgeDocId);
    }
  };

  useEffect(() => {
    if (!haveBadges) return;
    setSelectedUserBadgeAction(haveBadges);
  }, [haveBadges, setSelectedUserBadgeAction]);

  return (
    <Dialog open={isOpen} onOpenChange={onCloseAction}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex flex-col md:flex-row items-center md:gap-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
              뱃지 수여
            </span>
            {selectedUser && (
              <span className="text-xs font-normal text-foreground/60">
                ({selectedUser.id}님에게 수여할 뱃지를 선택해주세요)
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* 보유한 뱃지 리스트 */}
        {haveBadges?.badges && haveBadges.badges.length > 0 ? (
          <div className="mb-2">
            <h3 className="text-xs text-primary mb-2">
              ※ {selectedUser.id}님은 아래의 뱃지를 이미 보유하고 있습니다.
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {haveBadges.badges.map((badge: BadgeResponse) => (
                <AlreadyBadgeCard
                  key={badge.docId}
                  badge={badge}
                  userDocId={selectedUser.docId}
                />
              ))}
            </div>
          </div>
        ) : (
          <h3 className="text-xs text-primary">
            ※ {selectedUser.id}님은 아직 뱃지를 보유하고 있지 않습니다.
          </h3>
        )}

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="뱃지 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <X
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
              size={18}
              onClick={() => setSearchTerm("")}
            />
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 my-2">
          {filteredBadges.length > 0 ? (
            filteredBadges.map((badge: BadgeResponse) => (
              <BadgeCard
                key={badge.docId}
                badge={badge}
                isSelected={selectedBadgeDocId === badge.docId}
                onClickAction={() => setSelectedBadgeDocIdAction(badge.docId)}
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-8 text-center">
              <Search className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-gray-500">검색 결과가 없습니다</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCloseAction}>
            취소
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedBadgeDocId}
            className="bg-gradient-to-r from-amber-400 to-amber-600 text-white hover:from-amber-500 hover:to-amber-700"
          >
            수여하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
