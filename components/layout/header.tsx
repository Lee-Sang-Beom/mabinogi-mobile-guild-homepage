"use client";

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import { LogOut, Menu, MoonIcon, SunIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePathname, useRouter } from 'next/navigation'
import MobileMenu from './mobile-menu'
import { signOut, useSession } from 'next-auth/react'
import { clearCache } from '@/shared/utils/utils'
import { toast } from 'sonner'
import { loggedInMenuStructure, loggedOutMenuStructure } from '@/shared/constants/menu'

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const session = useSession();
  const router = useRouter()

  // Simulate checking login status
  useEffect(() => {
    if(session.status === "authenticated" && session.data?.user) {
      setIsLoggedIn(true)
    } else {
      setIsLoggedIn(false)
    }
  }, [session]);

  useEffect(() => setMounted(true), []);

  const handleLogout = async() => {
    await signOut({
      redirect: false,
    });

    toast.success('로그아웃이 완료되었습니다.')
    clearCache();
    router.push("/login");
  };

  const navItems = isLoggedIn ? loggedInMenuStructure : loggedOutMenuStructure;

  return (
    <motion.header
      className="sticky top-0 z-50 bg-background/30 backdrop-blur-md border-b border-primary/20"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
            <span className="sr-only">럭키비키 길드</span>
            <motion.div
              className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <span className="font-cinzel text-white text-xl font-bold">
                M
              </span>
            </motion.div>
            <span className="font-cinzel text-xl font-bold text-primary">
              럭키비키
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:gap-x-8">
          {isLoggedIn ? (
            // 로그인 상태일 때 드롭다운 메뉴 표시
            <>
              {navItems.map((item) =>
                item.submenu ? (
                  <DropdownMenu key={item.name}>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={`text-sm font-semibold leading-6 transition-colors relative group flex items-center ${
                          pathname.startsWith(item.href)
                            ? "text-primary"
                            : "text-foreground hover:text-primary"
                        }`}
                      >
                        {item.icon && <item.icon className="h-4 w-4 mr-2" />}
                        {item.name}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-56">
                      {item.submenu.map((subItem) =>
                        subItem.submenu ? (
                          <DropdownMenuSub key={subItem.name}>
                            <DropdownMenuSubTrigger className="flex items-center gap-2">
                              {subItem.icon && <subItem.icon className="h-4 w-4 mr-2" />}
                              {subItem.name}
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                              <DropdownMenuSubContent className="w-48">
                                {subItem.submenu.map((subSubItem) => (
                                  <DropdownMenuItem
                                    key={subSubItem.name}
                                    asChild
                                  >
                                    <Link
                                      href={subSubItem.href}
                                      className="flex items-center w-full"
                                    >
                                      {subItem.icon && <subItem.icon className="h-4 w-4 mr-2" />}

                                      {subSubItem.name}
                                    </Link>
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>
                        ) : (
                          <DropdownMenuItem key={subItem.name} asChild>
                            <Link
                              href={subItem.href}
                              className="flex items-center w-full"
                            >
                              {subItem.icon && <subItem.icon className="h-4 w-4 mr-2" />}

                              {subItem.name}
                            </Link>
                          </DropdownMenuItem>
                        )
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-sm font-semibold leading-6 transition-colors relative group flex items-center ${
                      pathname === item.href
                        ? "text-primary"
                        : "text-foreground hover:text-primary"
                    }`}
                  >
                    {item.icon && <item.icon className="h-4 w-4 mr-2" />}
                    {item.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                  </Link>
                )
              )}
            </>
          ) : (
            // 로그아웃 상태일 때 기본 메뉴 표시
            <>
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-semibold leading-6 transition-colors relative group ${
                    pathname === item.href
                      ? "text-primary"
                      : "text-foreground hover:text-primary"
                  }`}
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </Link>
              ))}
            </>
          )}
        </div>

        <div className="flex flex-1 justify-end items-center gap-4">
          {mounted && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  {theme === "dark" ? (
                    <SunIcon className="h-5 w-5" />
                  ) : (
                    <MoonIcon className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setTheme("dark");
                    location.reload();
                  }}
                >
                  다크 모드
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setTheme("light");
                    location.reload();
                  }}
                >
                  라이트 모드
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {isLoggedIn ? (
            <div className="hidden lg:flex gap-2">
              <Button variant="outline" className={'p-0'}>
                <Link href="/profile" className={"p-3"}>프로필</Link>
              </Button>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="flex items-center gap-1 "
              >
                <LogOut className="h-4 w-4" />
                로그아웃
              </Button>
            </div>
          ) : (
            <Button variant="default" className="hidden lg:flex p-0">
              <Link href="/login" className={"p-3"}>로그인</Link>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </nav>

      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        navItems={navItems}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />
    </motion.header>
  );
}
