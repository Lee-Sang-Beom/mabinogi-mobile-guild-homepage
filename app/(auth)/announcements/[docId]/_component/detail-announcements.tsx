'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Calendar, User as UserIcon } from 'lucide-react'
import { AnnouncementResponse } from '@/app/(auth)/announcements/api'
import { User } from 'next-auth'
import DisplayEditorContent from '@/components/editor/display-editor-content'
import { useDeleteAnnouncement } from '@/app/(auth)/announcements/hooks/use-delete-announcement'
import { isRoleAdmin } from '@/shared/utils/utils'
import { cn } from '@/lib/utils'

interface AnnouncementDetailProps {
  user: User;
  announcementData: AnnouncementResponse;
}

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'high':
      return <Badge variant="destructive">중요</Badge>
    case 'medium':
      return <Badge variant="default">일반</Badge>
    case 'low':
      return <Badge variant="secondary">참고</Badge>
    default:
      return null
  }
}

export default function AnnouncementDetailPage({ user, announcementData }: AnnouncementDetailProps) {
  const router = useRouter()
  const { mutate: deleteAnnouncements } = useDeleteAnnouncement()
  const isAdmin = isRoleAdmin(user)

  // 공지사항 삭제
  const handleDeleteAnnouncements = async () => {
    await deleteAnnouncements(announcementData.docId)
    router.push('/announcements')
  }

  return (
    <div className="min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8 relative w-full max-w-full overflow-x-hidden">
      {/* Animated background elements */}
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

      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="bg-background/40 backdrop-blur-sm border-primary/10 shadow-xl overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl">타이틀</CardTitle>
                </div>
                {getPriorityBadge(announcementData.priority)}
              </div>
              <div className="flex items-center text-sm text-muted-foreground mt-4">
                <UserIcon className="h-3 w-3 mr-1" />
                {announcementData.writeUserId}
                <p className={'mx-2'}>{'/'}</p>
                <Calendar className="h-3 w-3 mr-1" />
                {announcementData.mngDt}
              </div>
            </CardHeader>
            <CardContent>
              <div className="border-t border-primary/10"></div>
              <DisplayEditorContent content={announcementData.content || ''} />
            </CardContent>
            <CardFooter className={cn('flex justify-between', !isAdmin && "flex-row-reverse")}>
              <Button variant="outline" onClick={() => router.push('/announcements')}>
                목록으로
              </Button>
              {
                isAdmin &&
                <div className="flex gap-2">
                  <Button variant="destructive" onClick={()=>{handleDeleteAnnouncements()}}>삭제하기</Button>
                  <Button
                    variant="outline"
                    className={'text-black bg-primary'}
                    onClick={() => {
                      router.push(`/announcements/${announcementData.docId}/edit`)
                    }}
                  >
                    수정하기
                  </Button>
                </div>
              }
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
