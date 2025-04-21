"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle, XCircle } from "lucide-react"

type Step3Props = {
  success: boolean
  onResetAction: () => void
}

export default function Step3Result({ success, onResetAction }: Step3Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-6"
    >
      {success ? (
        <>
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">비밀번호 변경 완료</h3>
          <p className="text-gray-400 text-center mb-6">
            비밀번호가 성공적으로 변경되었습니다.
            <br />새 비밀번호로 로그인해주세요.
          </p>
          <Link href="/login" className="w-full">
            <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">로그인 페이지로 이동</Button>
          </Link>
        </>
      ) : (
        <>
          <XCircle className="h-16 w-16 text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">비밀번호 변경 실패</h3>
          <p className="text-gray-400 text-center mb-6">
            입력하신 정보와 일치하는 계정을 찾을 수 없습니다.
            <br />
            정보를 다시 확인하고 시도해주세요.
          </p>
          <Button onClick={onResetAction} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
            다시 시도하기
          </Button>
        </>
      )}
    </motion.div>
  )
}
