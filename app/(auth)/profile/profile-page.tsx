'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User as UserIcon, UserPlus } from 'lucide-react'
import SubUsersForm from '@/app/(auth)/profile/sub-users-form'
import ProfileForm from '@/app/(auth)/profile/profile-form'
import { User } from "next-auth";

interface ProfilePageProps {
  user: User;
}
export default function ProfilePage({user}: ProfilePageProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden">
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

      <div className="max-w-4xl mx-auto">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-foreground">
            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
              내 정보 관리
            </span>
          </h1>
          <p className="text-muted-foreground mt-2">내 계정 정보와 서브캐릭터를 관리할 수 있습니다.</p>
        </motion.div>

        <Tabs defaultValue="profile" className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              프로필 정보
            </TabsTrigger>
            <TabsTrigger value="subcharacters" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              서브캐릭터 관리
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileForm user={user}/>
          </TabsContent>

          <TabsContent value="subcharacters">
            <SubUsersForm user={user}/>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
