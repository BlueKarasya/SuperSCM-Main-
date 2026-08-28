import Sidebar from '@/components/shell/sidebar';
import Topbar from '@/components/shell/topbar';
import { requireAdmin } from '@/lib/auth';

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireAdmin();
  return <div className="scm-shell"><Sidebar role="ADMIN" /><div className="scm-main"><Topbar title="SCM 관리자" /><main>{children}</main></div></div>;
}
