"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: { name: string; href: string }[];
  isLoggedIn: boolean;
}

export default function MobileMenu({
  isOpen,
  onClose,
  navItems,
  isLoggedIn,
}: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black lg:hidden"
          initial={{ opacity: 0, x: "100%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <div className="flex flex-col min-h-screen">
            {/* Header with close button */}
            <div className="flex justify-end p-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/10"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            {/* Navigation items */}
            <div className="flex-1 flex flex-col items-center justify-center w-full px-6 py-8 bg-gradient-to-b from-gray-800 via-gray-900 to-black">
              <div className="w-full flex flex-col items-center gap-6 mb-8">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="w-full"
                  >
                    <Link
                      href={item.href}
                      className="text-xl font-bold text-white hover:text-primary transition-colors block text-center py-3 px-4 rounded-lg hover:bg-white/5"
                      onClick={onClose}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Login/Profile buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navItems.length * 0.1 }}
                className="w-full max-w-xs"
              >
                {isLoggedIn ? (
                  <div className="flex flex-col gap-4">
                    <Button
                      variant="outline"
                      className="w-full text-white border-white hover:bg-white/10"
                    >
                      <Link
                        href="/profile"
                        onClick={onClose}
                        className="w-full"
                      >
                        프로필
                      </Link>
                    </Button>
                    <Button variant="destructive" className="w-full">
                      <Link href="/logout" onClick={onClose} className="w-full">
                        로그아웃
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white">
                      <Link href="/login" onClick={onClose} className="w-full">
                        로그인
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full text-white border-white hover:bg-white/10"
                    >
                      <Link
                        href="/register"
                        onClick={onClose}
                        className="w-full"
                      >
                        회원가입
                      </Link>
                    </Button>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
