import { BarChart3, Gauge, GitCompare, ShieldCheck, type LucideIcon } from 'lucide-react';

export type MenuRole = 'USER' | 'ADMIN';

export type MenuItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const userMenu: MenuItem[] = [
  { href: '/analysis/leadtime', label: '리드타임 격차', icon: GitCompare },
  { href: '/analysis/stockout', label: '재고 소진 위험', icon: ShieldCheck },
];

export const adminMenu: MenuItem[] = [
  { href: '/admin', label: '관리자 대시보드', icon: Gauge },
  { href: '/admin/analytics', label: '분석 관리', icon: BarChart3 },
];

export function getMenu(role: MenuRole): MenuItem[] {
  return role === 'ADMIN' ? adminMenu : userMenu;
}
