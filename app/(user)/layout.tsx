import Sidebar from '@/components/shell/sidebar';
import Topbar from '@/components/shell/topbar';

export default function UserLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="scm-shell"><Sidebar /><div className="scm-main"><Topbar /><main>{children}</main></div></div>;
}
