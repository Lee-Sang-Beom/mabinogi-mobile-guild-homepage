"use client";

import { BadgeResponse } from "@/app/(auth)/hub/api";
import Image from "next/image";
import { useState } from "react";
import { useDeleteUserBadge } from "@/app/(auth)/(admin)/admin-badge/hooks/use-delete-user-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { BlurFade } from "@/components/magicui/blur-fade";

interface AlreadyBadgeCardProps {
  badge: BadgeResponse;
  userDocId: string;
}

export function AlreadyBadgeCard({ badge, userDocId }: AlreadyBadgeCardProps) {
  const [imgSrc, setImgSrc] = useState(
    badge.imgName && badge.imgName.trim() !== ""
      ? `/images/badges/${badge.imgName}`
      : "/images/favicon-mabinogi-mobile.png",
  );

  const { mutate: deleteUserBadge } = useDeleteUserBadge();

  const handleDelete = () => {
    deleteUserBadge({ userDocId, deleteBadgeDocId: badge.docId });
  };

  return (
    <div className="relative bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all hover:shadow-lg border border-gray-200">
      {/* 삭제 버튼 */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            className="absolute top-1 right-3 text-red-500 hover:text-red-700 transition-colors"
            aria-label="뱃지 삭제"
          >
            ✖
          </button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>뱃지 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말 이 뱃지를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col items-center">
        <BlurFade delay={0.25} inView className={"w-auto h-[100%]"}>
          <Image
            src={imgSrc}
            alt={badge.badge.name}
            width={30}
            height={30}
            className="rounded-full mb-3"
            onError={() => setImgSrc("/images/favicon-mabinogi-mobile.png")}
          />
        </BlurFade>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 text-center">
          {badge.badge.name}
        </h3>
      </div>
    </div>
  );
}
