import { LucideIcon } from 'lucide-react'

export interface MenuItem {
  name: string;
  href: string;
  icon?: LucideIcon; // 아이콘 컴포넌트 자체
  submenu?: MenuItem[]; // 재귀적으로 서브메뉴 포함 가능
}
