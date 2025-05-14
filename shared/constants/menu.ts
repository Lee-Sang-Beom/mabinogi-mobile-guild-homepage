import {
  Bell,
  BookmarkIcon,
  FileText,
  ImageIcon,
  Info,
  LayoutDashboard,
  Link as LinkIcon,
  RefreshCw,
  Search,
  Settings,
  Tag,
  UserCog,
  UserPlus,
  Users,
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
    href: "/admin-member",
    icon: Settings,
    submenu: [
      {
        name: "구성원 관리",
        href: "/admin-member",
        icon: UserCog,
        submenu: [
          {
            name: "길드원 관리",
            href: "/admin-member?tab=members",
            icon: UserPlus,
          },
          {
            name: "회원가입 관리",
            href: "/admin-member?tab=approval",
            icon: UserPlus,
          },
        ],
      },
      {
        name: "뱃지 관리",
        href: "/admin-badge",
        icon: Tag,
        submenu: [
          {
            name: "뱃지 요청 관리",
            href: "/admin-badge?tab=approval",
            icon: Tag,
          },
          {
            name: "뱃지 수여",
            href: "/admin-badge?tab=give",
            icon: Tag,
          },
        ],
      },
    ],
  },
  {
    name: "허브",
    href: "/hub",
    icon: LinkIcon,
    submenu: [
      {
        name: "도감",
        href: "/hub?tab=badge",
        icon: BookmarkIcon,
      },
    ],
  },
];
export const loggedOutMenuStructure: MenuItem[] = [
  { name: "소개", href: "/#about" },
  { name: "특징", href: "/#features" },
  { name: "길드 활동", href: "/#activities" },
];
