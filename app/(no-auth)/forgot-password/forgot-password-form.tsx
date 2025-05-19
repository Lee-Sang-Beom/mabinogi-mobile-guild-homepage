"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Step1VerifyIdentity from "@/app/(no-auth)/forgot-password/step1-verify-identity";
import Step2NewPassword from "@/app/(no-auth)/forgot-password/step2-new-password";
import Step3Result from "./step3-result";
import { User } from "next-auth";

export default function ForgotPasswordPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [_verificationSuccess, setVerificationSuccess] = useState(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // 본인확인 성공 시 호출되는 함수
  const handleVerificationSuccess = (user: User) => {
    setVerificationSuccess(true);
    setCurrentStep(2);
    setUser(user);
  };

  // 본인확인 실패 시 호출되는 함수
  const handleVerificationFailure = () => {
    setVerificationSuccess(false);
    setCurrentStep(3); // 실패 화면으로 이동
  };

  // 비밀번호 변경 성공 시 호출되는 함수
  const handlePasswordChangeSuccess = () => {
    setPasswordChangeSuccess(true);
    setCurrentStep(3);
  };

  // 비밀번호 변경 실패 시 호출되는 함수
  const handlePasswordChangeFailure = () => {
    setPasswordChangeSuccess(false);
    setCurrentStep(3);
  };

  // 처음으로 돌아가는 함수
  const handleReset = () => {
    setCurrentStep(1);
    setVerificationSuccess(false);
    setPasswordChangeSuccess(false);
  };

  return (
    <div className="overflow-x-hidden min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background/50 to-background  py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            비밀번호 찾기
          </h2>
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
                  ? "bg-amber-500 text-foreground"
                  : currentStep > step
                    ? "bg-green-500 text-foreground"
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
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-purple-600 rounded-3xl blur opacity-20"></div>
            <div className="relative bg-gradient-to-b from-background via-background/50 to-background p-6 rounded-lg shadow-xl">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <Step1VerifyIdentity
                    onSuccessAction={handleVerificationSuccess}
                    onFailureAction={handleVerificationFailure}
                    key="step1"
                  />
                )}
                {currentStep === 2 && (
                  <Step2NewPassword
                    onSuccessAction={handlePasswordChangeSuccess}
                    onFailureAction={handlePasswordChangeFailure}
                    key="step2"
                    user={user!}
                  />
                )}
                {currentStep === 3 && (
                  <Step3Result
                    success={passwordChangeSuccess}
                    onResetAction={handleReset}
                    key="step3"
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
