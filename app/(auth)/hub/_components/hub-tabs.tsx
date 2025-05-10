"use client";

import { useState } from "react";
import { Grid3X3, LayoutGrid } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AchievementsTab } from "@/app/(auth)/hub/_components/achievements/achievements-tab";
import { CollectionsTab } from "@/app/(auth)/hub/_components/collections/collections-tab";
import { BadgesTab } from "@/app/(auth)/hub/_components/badges/badges-tab";
import { useCreateBadge } from "../hooks/badges/use-create-badge";
import { useDeleteBadge } from "@/app/(auth)/hub/hooks/badges/use-delete-badge";
import { useUpdateBadge } from "@/app/(auth)/hub/hooks/badges/use-update-badge";
import { BadgeFormSchemaType } from "@/app/(auth)/hub/schema";
import { toast } from "sonner";
import {
  AnimatedLoading,
  SkeletonCardLoading,
} from "@/components/animated-loading";
import { NoticeListProps } from "@/shared/notice/internal";
import { useGetApprovalBadges } from "../hooks/badges/use-get-approval-badges";

export default function HubTabs({ user }: NoticeListProps) {
  const [viewMode, setViewMode] = useState<"grid" | "cards">("grid");
  const [activeTab, setActiveTab] = useState("badges");

  // hooks
  const { data: badgeData, isPending: badgesLoading } = useGetApprovalBadges();
  const createBadge = useCreateBadge();
  const updateBadge = useUpdateBadge();
  const deleteBadge = useDeleteBadge();

  // loading
  const isLoading =
    createBadge.isPending || updateBadge.isPending || deleteBadge.isPending;

  // 뱃지 추가 핸들러
  const handleBadgeAdd = (badge: BadgeFormSchemaType) => {
    createBadge.mutate({
      ...badge,
      approvalYn: "N",
    });
  };

  // 뱃지 수정 핸들러
  const handleBadgeEdit = (
    docId: string | null,
    badge: BadgeFormSchemaType
  ) => {
    if (docId) {
      // 수정요청은 승인상태를 다시 N으로!
      updateBadge.mutate({
        docId: docId!,
        data: { ...badge, approvalYn: "N" },
      });
    } else {
      toast.error(
        "수정할 뱃지정보를 찾을 수 없습니다. 페이지 새로고침 후 다시 시도해주세요."
      );
    }
  };

  // 뱃지 삭제 핸들러
  const handleBadgeDelete = (docId: string) => {
    deleteBadge.mutate(docId);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-full overflow-x-hidden">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">도감</h1>
        <p className="text-muted-foreground">
          다양한 뱃지와 업적을 수집하고 관리하세요.
        </p>
      </div>

      <Tabs
        defaultValue="badges"
        className="w-full"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <div className="flex justify-between items-center mb-6">
          <TabsList className="mb-0">
            <TabsTrigger value="badges">뱃지</TabsTrigger>
            <TabsTrigger value="achievements" disabled>
              업적
            </TabsTrigger>
            <TabsTrigger value="collections" disabled>
              컬렉션
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode("grid")}
              className={
                viewMode === "grid" ? "bg-primary text-primary-foreground" : ""
              }
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode("cards")}
              className={
                viewMode === "cards" ? "bg-primary text-primary-foreground" : ""
              }
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="badges" className="mt-0">
          {badgesLoading ? (
            <SkeletonCardLoading className="bg-background/60 backdrop-blur-sm border-primary/10 shadow-xl overflow-hidden rounded-2xl p-4" />
          ) : (
            <BadgesTab
              user={user}
              badges={badgeData?.data || []}
              onBadgeAddAction={handleBadgeAdd}
              onBadgeEditAction={handleBadgeEdit}
              onBadgeDeleteAction={handleBadgeDelete}
              viewMode={viewMode}
            />
          )}
        </TabsContent>

        <TabsContent value="achievements">
          <AchievementsTab />
        </TabsContent>

        <TabsContent value="collections">
          <CollectionsTab />
        </TabsContent>
      </Tabs>

      {isLoading && <AnimatedLoading />}
    </div>
  );
}
