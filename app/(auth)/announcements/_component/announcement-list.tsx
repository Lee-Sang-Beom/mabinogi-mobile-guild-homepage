'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { guildName } from '@/shared/constants/game'
import { DataTable } from '@/components/table/data-table'
import { useRouter } from 'next/navigation'
import { useGetAnnouncements } from '@/app/(auth)/announcements/hooks/use-get-announcements'
import { AnnouncementResponse } from '@/app/(auth)/announcements/api'
import { useDeleteAnnouncement } from '@/app/(auth)/announcements/hooks/use-delete-announcement'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { columns } from '@/app/(auth)/announcements/_component/columns'
import { SkeletonLoading } from '@/components/animated-loading'

const columnLabels = {
  title: '제목',
  priority: '중요도',
  writeUserId: '작성자',
  mngDt: '작성일',
}

export default function AnnouncementsList() {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState<boolean>(false)
  const { data: announcementResponse, isPending } = useGetAnnouncements()
  const { mutate: deleteAnnouncements } = useDeleteAnnouncement()

  // 데이터 메모이제이션
  const announcementData = useMemo(() => {
    return announcementResponse?.data || []
  }, [announcementResponse])

  // 공지사항 삭제 - useCallback으로 메모이제이션
  const handleDeleteAnnouncements = useCallback((selectedRows: AnnouncementResponse[]) => {
    if (selectedRows.length === 0) return

    const selectedDocIds = selectedRows.map((row) => row.docId)
    deleteAnnouncements(selectedDocIds)
  }, [deleteAnnouncements])

  // 공지사항 상세 페이지로 이동 - useCallback으로 메모이제이션
  const handleAnnouncementClick = useCallback((announcement: AnnouncementResponse) => {
    if (!announcement?.docId) return
    router.push(`/announcements/${announcement.docId}`)
  }, [router])

  // 선택 변경 핸들러 - useCallback으로 메모이제이션
  const handleSelectionChange = useCallback((selectedRows: AnnouncementResponse[]) => {
    // 필요한 경우 여기서 선택된 행 처리
    console.log('선택된 행:', selectedRows.length)
  }, [])

  // 컴포넌트 마운트 시 한 번만 실행
  useEffect(() => {
    setIsMounted(true)

    // 컴포넌트 언마운트 시 정리
    return () => {
      setIsMounted(false)
    }
  }, [])

  return (
    <div className="min-h-[calc(100vh-200px)] py-8 sm:py-12 px-3 sm:px-6 lg:px-8 relative">
      {/* 배경 애니메이션 */}
      <motion.div
        className="absolute left-1/4 top-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-purple-500/10 to-blue-500/10 blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 20, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-1/4 bottom-1/4 -z-10 h-[350px] w-[350px] rounded-full bg-gradient-to-br from-amber-500/10 to-red-500/10 blur-3xl"
        animate={{
          x: [0, -30, 0],
          y: [0, 50, 0],
        }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 25, ease: 'easeInOut', delay: 2 }}
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

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <>
            <div className="flex items-center justify-end mb-4 w-full">
              <Button
                variant="outline"
                onClick={() => router.push('/announcements/create')}
              >
                작성하기
              </Button>
            </div>

            <Card>
              <CardContent className="p-3 sm:p-6">
                {isMounted && !isPending ? (
                  <DataTable
                    key={`announcements-table-${announcementData.length}`}
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
                ) : <SkeletonLoading />  }
              </CardContent>
            </Card>
          </>
        </motion.div>
      </div>
    </div>
  )
}