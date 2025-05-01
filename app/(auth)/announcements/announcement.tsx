"use client"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { guildName } from "@/shared/constants/game"
import { useState } from "react"
import { Announcement, columns } from "./columns"
import { toast } from "sonner"
import { DataTable } from "@/components/table/data-table"
import { useRouter } from "next/navigation"

// Mock data for announcements
const announcements = [
  {
    id: 1,
    title: "[중요] 길드 레벨 50 달성 기념 이벤트",
    author: "드래곤슬레이어",
    date: "2023-09-28",
    views: 1240,
    comments: 32,
    excerpt: "길드 레벨 50 달성을 기념하여 특별 이벤트를 진행합니다. 모든 길드원에게 특별 보상이 지급됩니다...",
    priority: "high",
  },
  {
    id: 2,
    title: "주간 레이드 일정 안내",
    author: "마법사의지팡이",
    date: "2023-09-25",
    views: 980,
    comments: 24,
    excerpt: "이번 주 레이드 일정을 안내드립니다. 토요일 저녁 8시부터 드래곤 던전 레이드가 진행됩니다...",
    priority: "medium",
  },
  {
    id: 3,
    title: "길드 규칙 개정 안내",
    author: "그림자암살자",
    date: "2023-09-22",
    views: 870,
    comments: 18,
    excerpt: "길드 규칙이 일부 개정되었습니다. 모든 길드원은 필수로 확인해주시기 바랍니다...",
    priority: "high",
  },
  {
    id: 4,
    title: "신규 길드원 모집 안내",
    author: "신성한치유사",
    date: "2023-09-20",
    views: 760,
    comments: 15,
    excerpt: "현재 신규 길드원을 모집 중입니다. 레벨 70 이상, 주 3회 이상 접속 가능한 분들을 찾고 있습니다...",
    priority: "medium",
  },
  {
    id: 5,
    title: "길드 창고 이용 안내",
    author: "자연의수호자",
    date: "2023-09-18",
    views: 650,
    comments: 12,
    excerpt: "길드 창고 이용 규칙을 안내드립니다. 모든 길드원은 주간 한도 내에서 자유롭게 이용 가능합니다...",
    priority: "low",
  },
  {
    id: 6,
    title: "길드 대전 참가자 모집",
    author: "대장장이의망치",
    date: "2023-09-15",
    views: 540,
    comments: 10,
    excerpt: "다음 주 토요일에 있을 길드 대전 참가자를 모집합니다. 참가를 원하시는 분들은 댓글로 신청해주세요...",
    priority: "medium",
  },
  {
    id: 7,
    title: "길드 기부 이벤트 안내",
    author: "현자의지혜",
    date: "2023-09-12",
    views: 430,
    comments: 8,
    excerpt: "길드 발전을 위한 기부 이벤트를 진행합니다. 참여하시는 모든 분들께 특별 칭호를 드립니다...",
    priority: "low",
  },
  {
    id: 8,
    title: "길드 홈페이지 업데이트 안내",
    author: "용사의이름",
    date: "2023-09-10",
    views: 320,
    comments: 6,
    excerpt: "길드 홈페이지가 새롭게 업데이트되었습니다. 새로운 기능과 개선된 디자인을 확인해보세요...",
    priority: "medium",
  },
] as Announcement[]

export default function AnnouncementsPage() {
  const [announcementData, setAnnouncementData] = useState<Announcement[]>(announcements)
  const [selectedAnnouncements, setSelectedAnnouncements] = useState<Announcement[]>([])
  const router = useRouter()

  console.log('selectedAnnouncements ', selectedAnnouncements)
  // 공지사항 삭제 처리 함수 (실제로는 API 호출)
  const handleDeleteAnnouncements = async (selectedRows: Announcement[]) => {
    try {
      // 여기서 API 호출을 수행할 수 있습니다
      // 예: await deleteAnnouncementsAPI(selectedRows.map(row => row.id))

      // 성공적으로 삭제된 후 UI 업데이트
      const selectedIds = selectedRows.map((row) => row.id)
      setAnnouncementData((prev) => prev.filter((item) => !selectedIds.includes(item.id)))

      toast.success(`${selectedRows.length}개의 공지사항이 삭제되었습니다.`);
    } catch (error) {
      console.error("삭제 중 오류 발생:", error)
      toast.success('공지사항 삭제 중 오류가 발생했습니다.');
      
    }
  }

  // 공지사항 상세 페이지로 이동
  const handleAnnouncementClick = (announcement: Announcement) => {
    console.log("공지사항 클릭:", announcement)
    router.push(`/announcements/${announcement.id}`)
  }

  // 선택된 공지사항 상태 업데이트
  const handleSelectionChange = (selectedRows: Announcement[]) => {
    setSelectedAnnouncements(selectedRows)
    console.log("선택된 공지사항:", selectedRows)
  }

  const columnLabels = {
    title: "제목",
    author: "작성자",
    date: "작성일",
    views: "조회수",
    comments: "댓글",
    priority: "중요도",
  }

  return (
    <div className="min-h-[calc(100vh-200px)] py-8 sm:py-12 px-3 sm:px-6 lg:px-8 relative">
      {/* Animated background elements */}
      <motion.div
        className="absolute left-1/4 top-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-purple-500/10 to-blue-500/10 blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 20, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-1/4 bottom-1/4 -z-10 h-[350px] w-[350px] rounded-full bg-gradient-to-br from-amber-500/10 to-red-500/10 blur-3xl"
        animate={{
          x: [0, -30, 0],
          y: [0, 50, 0],
        }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 25, ease: "easeInOut", delay: 2 }}
      />

      <div className="max-w-7xl mx-auto">
        <motion.div
          className="mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
              공지사항
            </span>
          </h1>
          <p className="text-muted-foreground mt-2">{guildName}의 중요 소식과 안내사항을 확인하세요.</p>
        </motion.div>

        <div className="flex items-center justify-end mb-4 w-full">
          <Button variant="outline"
           onClick={()=>{
            router.push("/announcements/create")
           }}
          >작성하기</Button>
        </div>

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* 데이터 테이블 컴포넌트 */}
          <Card>
            <CardContent className="p-3 sm:p-6">
              <DataTable
                columns={columns}
                data={announcementData}
                searchKey="title"
                searchPlaceholder="제목으로 검색..."
                onRowClick={handleAnnouncementClick}
                onSelectionChange={handleSelectionChange}
                onDeleteSelected={handleDeleteAnnouncements}
                columnLabels={columnLabels}
                deleteButtonText="선택 삭제"
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
