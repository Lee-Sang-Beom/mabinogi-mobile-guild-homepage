"use client";

import { useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import {
  MoonIcon,
  SunIcon,
  Menu,
  LogOut,
  LayoutDashboard,
  Users,
  BarChart,
  Briefcase,
  FileText,
  Settings,
  Info,
  Bell,
  RefreshCw,
  UserCog,
  UserPlus,
  Calendar,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { usePathname } from "next/navigation";
import MobileMenu from "./mobile-menu";

export interface MenuItem {
  name: string;
  href: string;
  icon?: ReactNode;
  submenu?: MenuItem[]; // 재귀적으로 서브메뉴 포함 가능
}

// 메뉴 구조 정의
const loggedInMenuStructure: MenuItem[] = [
  {
    name: "대시보드",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-4 w-4 mr-2" />,
  },
  {
    name: "일정관리",
    href: "/schedule",
    icon: <Calendar className="h-4 w-4 mr-2" />,
  },
  {
    name: "길드원 정보",
    href: "/members",
    icon: <Users className="h-4 w-4 mr-2" />,
    submenu: [
      {
        name: "직급별 분포",
        href: "/members?tab=rank",
        icon: <BarChart className="h-4 w-4 mr-2" />,
      },
      {
        name: "직업별 분포",
        href: "/members?tab=job",
        icon: <Briefcase className="h-4 w-4 mr-2" />,
      },
    ],
  },
  // 게시판 메뉴 수정 - href를 첫 번째 서브메뉴 항목으로 변경
  {
    name: "게시판",
    href: "/community",
    icon: <FileText className="h-4 w-4 mr-2" />,
    submenu: [
      {
        name: "커뮤니티",
        href: "/community",
        icon: <ImageIcon className="h-4 w-4 mr-2" />,
        submenu: [
          {
            name: "아트워크",
            href: "/community?tab=artwork",
            icon: <ImageIcon className="h-4 w-4 mr-2" />,
          },
          {
            name: "정보(팁)",
            href: "/community?tab=tips",
            icon: <Info className="h-4 w-4 mr-2" />,
          },
        ],
      },
      {
        name: "공지사항",
        href: "/announcements",
        icon: <Bell className="h-4 w-4 mr-2" />,
      },
      {
        name: "업데이트",
        href: "/updates",
        icon: <RefreshCw className="h-4 w-4 mr-2" />,
      },
    ],
  },
  {
    name: "서비스 관리",
    href: "/admin",
    icon: <Settings className="h-4 w-4 mr-2" />,
    submenu: [
      {
        name: "길드원 관리",
        href: "/admin",
        icon: <UserCog className="h-4 w-4 mr-2" />,
      },
      {
        name: "회원가입 관리",
        href: "/admin?tab=applications",
        icon: <UserPlus className="h-4 w-4 mr-2" />,
      },
    ],
  },
];

const loggedOutMenuStructure: MenuItem[] = [
  { name: "소개", href: "/#about" },
  { name: "특징", href: "/#features" },
  { name: "길드 활동", href: "/#activities" },
];

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Simulate checking login status
  useEffect(() => {
    // This would be replaced with actual auth check
    const checkLoginStatus = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };

    checkLoginStatus();
  }, [pathname]);

  useEffect(() => setMounted(true), []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
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
            <span className="sr-only">마비노기 모바일 길드</span>
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
                        {item.icon}
                        {item.name}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-56">
                      {item.submenu.map((subItem) =>
                        subItem.submenu ? (
                          <DropdownMenuSub key={subItem.name}>
                            <DropdownMenuSubTrigger className="flex items-center gap-2">
                              {subItem.icon}
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
                                      {subSubItem.icon}
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
                              {subItem.icon}
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
                    {item.icon}
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
              <Button variant="outline">
                <Link href="/profile">프로필</Link>
              </Button>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="flex items-center gap-1"
              >
                <LogOut className="h-4 w-4" />
                로그아웃
              </Button>
            </div>
          ) : (
            <Button variant="default" className="hidden lg:flex">
              <Link href="/login">로그인</Link>
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
