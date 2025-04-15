"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, ChevronDown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MenuItem } from "./header";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: MenuItem[];
  isLoggedIn: boolean;
  onLogout: () => void;
}

export default function MobileMenu({
  isOpen,
  onClose,
  navItems,
  isLoggedIn,
  onLogout,
}: MobileMenuProps) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const isExpanded = expandedItems[item.name] || false;
    const hasSubmenu = item.submenu && item.submenu.length > 0;

    return (
      <div key={item.name} className="w-full">
        <div
          className={`flex items-center justify-between w-full text-white py-3 px-4 rounded-lg hover:bg-white/5 ${
            depth > 0 ? "pl-" + depth * 6 : ""
          }`}
        >
          {hasSubmenu ? (
            <button
              className="flex items-center text-xl font-bold text-white"
              onClick={() => toggleExpand(item.name)}
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.name}
            </button>
          ) : (
            <Link
              href={item.href}
              className="flex items-center text-xl font-bold"
              onClick={onClose}
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.name}
            </Link>
          )}
          {hasSubmenu && (
            <button onClick={() => toggleExpand(item.name)}>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>
          )}
        </div>

        {hasSubmenu && isExpanded && (
          <div className="ml-4 border-l border-white/20 pl-4 mt-1 mb-2">
            {item.submenu?.map((subItem: MenuItem) =>
              renderMenuItem(subItem, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

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
              <div className="w-full flex flex-col items-center gap-2 mb-8">
                {navItems.map((item) => renderMenuItem(item))}
              </div>

              {/* Login/Profile/Logout buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navItems.length * 0.1 }}
                className="w-full max-w-xs mt-6"
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
                    <Button
                      variant="destructive"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={() => {
                        onLogout();
                        onClose();
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      로그아웃
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
