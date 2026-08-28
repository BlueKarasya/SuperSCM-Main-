import { logout } from '@/lib/auth-actions';

export default function Topbar({ title = 'SCM 분석' }: { title?: string }) {
  return <header className="scm-topbar"><h1 className="scm-topbar__title">{title}</h1><div className="scm-topbar__meta"><span className="local-badge">SUPABASE LIVE</span><span>기준월도 <b>2026.09</b></span><form action={logout}><button className="ui-button" type="submit">로그아웃</button></form></div></header>;
}
