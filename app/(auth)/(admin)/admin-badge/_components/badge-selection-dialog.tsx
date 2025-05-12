"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { User } from "next-auth";
import { useGetUnApprovedBadges } from "@/app/(auth)/hub/hooks/badges/use-get-unapproval-badges";
import { BadgeCard } from "@/app/(auth)/(admin)/admin-badge/_components/badge-card";
import { BadgeResponse } from "@/app/(auth)/hub/api";

interface BadgeSelectionDialogProps {
  isOpen: boolean;
  onCloseAction: () => void;
  onConfirmAction: (badgeId: string) => void;
  selectedUser: User | null;
}

export function BadgeSelectionDialog({
  isOpen,
  onCloseAction,
  onConfirmAction,
  selectedUser,
}: BadgeSelectionDialogProps) {
  const { data: badges } = useGetUnApprovedBadges();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);

  const handleConfirm = () => {
    if (selectedBadge) {
      onConfirmAction(selectedBadge);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCloseAction}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
              뱃지 수여
            </span>
            {selectedUser && (
              <span className="text-sm font-normal text-gray-500">
                - {selectedUser.id}님에게 수여할 뱃지를 선택해주세요
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
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

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-4">
          {badges && badges.data.length > 0 ? (
            badges.data.map((badge: BadgeResponse) => (
              <BadgeCard
                key={badge.docId}
                badge={badge}
                isSelected={selectedBadge === badge.docId}
                onClickAction={() => setSelectedBadge(badge.docId)}
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
            disabled={!selectedBadge}
            className="bg-gradient-to-r from-amber-400 to-amber-600 text-white hover:from-amber-500 hover:to-amber-700"
          >
            수여하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
