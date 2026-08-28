import Sidebar from '@/components/shell/sidebar';
import Topbar from '@/components/shell/topbar';

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="scm-shell"><Sidebar role="ADMIN" /><div className="scm-main"><Topbar title="SCM 관리자" /><main>{children}</main></div></div>;
}
