import Link from 'next/link';
import { getMenu, type MenuRole } from '@/lib/menu';

export default function Sidebar({ role = 'USER', pathname = '' }: { role?: MenuRole; pathname?: string }) {
  return (
    <aside className="scm-sidebar">
      <div className="scm-sidebar__brand">
        <div className="scm-sidebar__mark">SCM</div>
        <div><strong>월간 발주계획</strong><span>Procurement Planning</span></div>
      </div>
      <div className="scm-sidebar__section">{role}</div>
      <nav className="scm-sidebar__menu" aria-label={`${role} 메뉴`}>
        {getMenu(role).map((item) => {
          const Icon = item.icon;
          return <Link key={item.href} href={item.href} className="scm-sidebar__link" aria-current={pathname === item.href ? 'page' : undefined}>
            <span className="scm-sidebar__icon"><Icon size={15} /></span><span>{item.label}</span>
          </Link>;
        })}
      </nav>
    </aside>
  );
}
