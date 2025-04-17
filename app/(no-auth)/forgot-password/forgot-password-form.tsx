"use client"

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import Step1VerifyIdentity from '@/app/(no-auth)/forgot-password/step1-verify-identity'
import Step2NewPassword from '@/app/(no-auth)/forgot-password/step2-new-password'
import Step3Result from "./step3-result"

export default function ForgotPasswordPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [verificationSuccess, setVerificationSuccess] = useState(false)
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false)

  // 본인확인 성공 시 호출되는 함수
  const handleVerificationSuccess = () => {
    setVerificationSuccess(true)
    setCurrentStep(2)
  }

  // 본인확인 실패 시 호출되는 함수
  const handleVerificationFailure = () => {
    setVerificationSuccess(false)
    setCurrentStep(3) // 실패 화면으로 이동
  }

  // 비밀번호 변경 성공 시 호출되는 함수
  const handlePasswordChangeSuccess = () => {
    setPasswordChangeSuccess(true)
    setCurrentStep(3)
  }

  // 비밀번호 변경 실패 시 호출되는 함수
  const handlePasswordChangeFailure = () => {
    setPasswordChangeSuccess(false)
    setCurrentStep(3)
  }

  // 처음으로 돌아가는 함수
  const handleReset = () => {
    setCurrentStep(1)
    setVerificationSuccess(false)
    setPasswordChangeSuccess(false)
  }

  useEffect(() => {
    console.log('verificationSuccess is ', verificationSuccess)
  }, [verificationSuccess])
  return (
    <div className="overflow-x-hidden min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">비밀번호 찾기</h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            {currentStep === 1
              ? "본인확인을 위해 회원가입 시 입력한 정보를 입력해주세요."
              : currentStep === 2
                ? "새로운 비밀번호를 설정해주세요."
                : passwordChangeSuccess
                  ? "비밀번호 변경이 완료되었습니다."
                  : "비밀번호 변경에 실패했습니다."}
          </p>
        </motion.div>

        {/* 단계 표시 */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === step
                  ? "bg-amber-500 text-white"
                  : currentStep > step
                    ? "bg-green-500 text-white"
                    : "bg-gray-700 text-gray-400"
              }`}
            >
              {step}
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-8"
        >
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-purple-600 rounded-lg blur opacity-25"></div>
            <div className="relative bg-gray-800 p-6 rounded-lg shadow-xl">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <Step1VerifyIdentity
                    onSuccess={handleVerificationSuccess}
                    onFailure={handleVerificationFailure}
                    key="step1"
                  />
                )}
                {currentStep === 2 && (
                  <Step2NewPassword
                    onSuccess={handlePasswordChangeSuccess}
                    onFailure={handlePasswordChangeFailure}
                    key="step2"
                  />
                )}
                {currentStep === 3 && <Step3Result success={passwordChangeSuccess} onReset={handleReset} key="step3" />}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
