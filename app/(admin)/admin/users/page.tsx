import PageHeader from '@/components/shell/page-header';
import Badge from '@/components/ui/badge';
import Panel from '@/components/ui/panel';
import { requireAdmin } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { updateUser } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ error?: string; updated?: string }> }) {
  const params = await searchParams;
  const { user } = await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data: users, error } = await supabase.schema('core').from('app_user').select('user_id, email, name, department, role, active, last_login_at').order('created_at', { ascending: true });

  return <div className="ui-page"><PageHeader eyebrow="ADMIN / USERS" title="사용자 관리" description="사용자 역할과 계정 활성 상태를 관리합니다." />
    {params.error && <Panel><p className="text-danger">{params.error}</p></Panel>}
    {params.updated && <Panel><p className="positive">사용자 정보가 변경되고 audit_log에 기록되었습니다.</p></Panel>}
    {error ? <Panel><p className="text-danger">사용자 조회에 실패했습니다: {error.message}</p></Panel> : !users || users.length === 0 ? <Panel><p className="muted">등록된 사용자가 없습니다.</p></Panel> : <Panel title="사용자 목록" description="변경 작업은 서버에서 ADMIN 권한을 확인하고 audit_log에 기록합니다."><div className="ui-data-table-wrap"><table className="ui-data-table"><thead><tr><th>이메일</th><th>이름</th><th>부서</th><th>역할</th><th>상태</th><th>변경</th></tr></thead><tbody>{users.map((row) => { const isSelf = row.user_id === user.id; return <tr key={row.user_id}><td>{row.email}</td><td>{row.name || '—'}</td><td>{row.department || '—'}</td><td><Badge status={row.role === 'ADMIN' ? 'CRITICAL' : 'SAFE'}>{row.role}</Badge></td><td><Badge status={row.active ? 'SAFE' : 'CALCULATION_UNAVAILABLE'}>{row.active ? '활성' : '비활성'}</Badge></td><td><form action={updateUser} className="admin-user-form"><input type="hidden" name="user_id" value={row.user_id} /><select name="role" defaultValue={row.role} disabled={isSelf}><option value="USER">USER</option><option value="ADMIN">ADMIN</option></select><label><input type="checkbox" name="active" defaultChecked={row.active} disabled={isSelf} /> 활성</label><button className="ui-button" type="submit" disabled={isSelf}>{isSelf ? '본인 변경 불가' : '저장'}</button></form></td></tr>; })}</tbody></table></div></Panel>}
  </div>;
}
