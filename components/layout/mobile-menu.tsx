"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import Link from "next/link"
import { X, ChevronDown, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MenuItem } from "@/shared/types/menu"
import { guildName } from '@/shared/constants/game'

interface MobileMenuProps {
  isOpen: boolean
  onCloseAction: () => void
  navItems: MenuItem[]
  isLoggedIn: boolean
  onLogoutAction: () => void
}

// 애니메이션 변수 정의
const menuVariants: Variants = {
  closed: {
    opacity: 0,
    x: "100%",
    transition: {
      type: "spring",
      damping: 30,
      stiffness: 300,
      when: "afterChildren",
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
  open: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300,
      when: "beforeChildren",
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants: Variants = {
  closed: {
    opacity: 0,
    x: 50,
    transition: { duration: 0.2 },
  },
  open: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4 },
  },
}

const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
}

export default function MobileMenu({ isOpen, onCloseAction, navItems, isLoggedIn, onLogoutAction }: MobileMenuProps) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const menuRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState(0)

  // 메뉴가 열릴 때 스크롤 위치 저장 및 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      // 현재 스크롤 위치 저장
      setScrollPosition(window.scrollY)

      // body에 고정 스타일 적용
      document.body.style.position = "fixed"
      document.body.style.top = `-${scrollPosition}px`
      document.body.style.width = "100%"
      document.body.style.overflow = "hidden"
    } else {
      // 메뉴가 닫힐 때 원래 스크롤 위치로 복원
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.width = ""
      document.body.style.overflow = ""
      window.scrollTo(0, scrollPosition)
    }

    return () => {
      // 컴포넌트 언마운트 시 스타일 초기화
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.width = ""
      document.body.style.overflow = ""
    }
  }, [isOpen, scrollPosition])

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [name]: !prev[name],
    }))
  }

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const isExpanded = expandedItems[item.name] || false
    const hasSubmenu = item.submenu && item.submenu.length > 0

    return (
      <motion.div key={item.name} className="w-full" variants={itemVariants}>
        <motion.div
          className={`flex items-center justify-between w-full text-white py-4 px-6 rounded-xl hover:bg-white/10 transition-all duration-300 ${
            depth > 0 ? "pl-" + (depth * 6 + 6) : ""
          }`}
          whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
          whileTap={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
        >
          {hasSubmenu ? (
            <button
              className="flex items-center text-xl font-bold text-white w-full justify-between"
              onClick={() => toggleExpand(item.name)}
            >
              <span className="flex items-center">
                {item.icon && (
                  <item.icon className="mr-3 text-amber-400 h-4 w-4" />
                )}
                {item.name}
              </span>
              <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
                <ChevronDown className="h-5 w-5 text-amber-400" />
              </motion.div>
            </button>
          ) : (
            <Link href={item.href} className="flex items-center text-xl font-bold w-full" onClick={onCloseAction}>
              {item.icon && (
                <item.icon className="mr-3 text-amber-400 h-4 w-4" />
              )}
              {item.name}
            </Link>
          )}
        </motion.div>

        {hasSubmenu && (
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="ml-4 border-l-2 border-amber-500/50 pl-4 mt-1 mb-2 space-y-1">
                  {item.submenu?.map((subItem: MenuItem) => (
                    <div key={subItem.name} className="py-2">
                      {subItem.submenu ? (
                        <button
                          className="flex items-center w-full text-lg font-medium text-white pr-2"
                          onClick={() => toggleExpand(subItem.name)}
                        >
                          <span className="flex items-center flex-1">
                            {subItem.icon && (
                              <subItem.icon className="mr-3 text-amber-400 h-4 w-4" />
                            )}
                            {subItem.name}
                          </span>
                          <motion.div
                            animate={{ rotate: expandedItems[subItem.name] ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="mr-3"
                          >
                            <ChevronDown className="h-4 w-4 text-amber-400" />
                          </motion.div>
                        </button>
                      ) : (
                        <Link
                          href={subItem.href}
                          className="flex items-center text-lg font-medium text-white w-full"
                          onClick={onCloseAction}
                        >
                          {subItem.icon && (
                            <subItem.icon className="mr-3 text-amber-400 h-4 w-4" />
                          )}
                          {subItem.name}
                        </Link>
                      )}

                      {subItem.submenu && expandedItems[subItem.name] && (
                        <div className="ml-4 border-l border-amber-500/30 pl-4 mt-2 space-y-2">
                          {subItem.submenu.map((subSubItem) => (
                            <Link
                              key={subSubItem.name}
                              href={subSubItem.href}
                              className="flex items-center text-base text-white py-1"
                              onClick={onCloseAction}
                            >
                              {subItem.icon && (
                                <subItem.icon className="mr-3 text-amber-400 h-4 w-4" />
                              )}
                              {subSubItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] lg:hidden"
          initial="closed"
          animate="open"
          exit="closed"
          variants={menuVariants}
        >
          {/* 배경 오버레이 */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseAction}
          />

          <div
            ref={menuRef}
            className="relative flex flex-col h-[100dvh] w-full max-w-full bg-gradient-to-b from-gray-900 via-gray-900 to-black border-l border-white/10 overflow-hidden"
          >
            {/* 헤더와 닫기 버튼 */}
            <motion.div
              className="flex justify-between items-center p-6 border-b border-white/10"
              variants={itemVariants}
            >
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                  <span className="font-cinzel text-white text-xl font-bold">M</span>
                </div>
                <span className="font-cinzel text-xl font-bold text-white">{guildName}</span>
              </div>
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={onCloseAction}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <X className="h-6 w-6" />
              </motion.button>
            </motion.div>

            {/* 네비게이션 아이템 */}
            <div className="flex-1 overflow-y-auto py-8 px-4 scrollbar-hide overflow-x-hidden">
              <div className="w-full flex flex-col items-center gap-2 mb-8">
                {navItems.map((item) => renderMenuItem(item))}
              </div>

              {/* 로그인/프로필/로그아웃 버튼 */}
              <motion.div variants={itemVariants} className="w-full max-w-xs mx-auto mt-6 space-y-4">
                {isLoggedIn ? (
                  <div className="flex flex-col gap-4">
                    <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                      <Button
                        variant="outline"
                        className="w-full text-foreground border-white/20 hover:bg-white/50 hover:border-white/40 h-12 text-lg"
                      >
                        <Link href="/profile" onClick={onCloseAction} className="w-full">
                          프로필
                        </Link>
                      </Button>
                    </motion.div>
                    <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                      <Button
                        variant="destructive"
                        className="w-full flex items-center justify-center gap-2 h-12 text-lg"
                        onClick={() => {
                          onLogoutAction()
                          onCloseAction()
                        }}
                      >
                        <LogOut className="h-5 w-5" />
                        로그아웃
                      </Button>
                    </motion.div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                      <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white h-12 text-lg">
                        <Link href="/login" onClick={onCloseAction} className="w-full">
                          로그인
                        </Link>
                      </Button>
                    </motion.div>
                    <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                      <Button
                        variant="outline"
                        className="w-full text-foreground border-white/20 hover:bg-white/50 hover:border-white/40 h-12 text-lg"
                      >
                        <Link href="/join" onClick={onCloseAction} className="w-full">
                          회원가입
                        </Link>
                      </Button>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* 푸터 */}
            <motion.div
              variants={itemVariants}
              className="p-6 border-t border-white/10 text-center text-white/60 text-sm"
            >
              © 2023 마비노기 모바일 - {guildName}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
