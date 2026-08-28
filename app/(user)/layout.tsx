import Sidebar from '@/components/shell/sidebar';
import Topbar from '@/components/shell/topbar';
import { requireUser } from '@/lib/auth';

export default async function UserLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireUser();
  return <div className="scm-shell"><Sidebar /><div className="scm-main"><Topbar /><main>{children}</main></div></div>;
}
