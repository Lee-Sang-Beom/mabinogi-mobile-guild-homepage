import {
  LayoutDashboard,
  Users,
  FileText,
  Search,
  Info,
  Bell,
  RefreshCw,
  ImageIcon,
  Settings,
  UserCog,
  UserPlus,
} from "lucide-react";
import { MenuItem } from "../types/menu";

// 메뉴 구조 정의
export const loggedInMenuStructure: MenuItem[] = [
  {
    name: "대시보드",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "파티찾기",
    href: "/schedule",
    icon: Search,
  },
  {
    name: "길드원 정보",
    href: "/org",
    icon: Users,
  },
  {
    name: "게시판",
    href: "/community",
    icon: FileText,
    submenu: [
      {
        name: "커뮤니티",
        href: "/community",
        icon: ImageIcon,
        submenu: [
          {
            name: "아트워크",
            href: "/community?tab=artwork",
            icon: ImageIcon,
          },
          {
            name: "정보(팁)",
            href: "/community?tab=tips",
            icon: Info,
          },
        ],
      },
      {
        name: "공지사항",
        href: "/announcements",
        icon: Bell,
      },
      {
        name: "업데이트",
        href: "/updates",
        icon: RefreshCw,
      },
    ],
  },
  {
    name: "서비스 관리",
    href: "/admin",
    icon: Settings,
    submenu: [
      {
        name: "길드원 관리",
        href: "/admin",
        icon: UserCog,
      },
      {
        name: "회원가입 관리",
        href: "/admin?tab=approval",
        icon: UserPlus,
      },
    ],
  },
];
export const loggedOutMenuStructure: MenuItem[] = [
  { name: "소개", href: "/#about" },
  { name: "특징", href: "/#features" },
  { name: "길드 활동", href: "/#activities" },
];
