import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isAppRole, type AppRole } from './auth-policy';

export { isAppRole, safeNextPath, type AppRole } from './auth-policy';

export async function getRole(): Promise<AppRole | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .schema('core')
    .from('app_user')
    .select('role, active')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!data || data.active !== true || !isAppRole(data.role)) return null;
  return data.role;
}

export async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile, error } = await supabase
    .schema('core')
    .from('app_user')
    .select('user_id, email, name, department, role, active, last_login_at')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !profile || profile.active !== true || !isAppRole(profile.role)) {
    redirect('/login?error=account_inactive');
  }

  return { user, profile: { ...profile, role: profile.role as AppRole } };
}

export async function requireAdmin() {
  const session = await requireUser();
  if (session.profile.role !== 'ADMIN') {
    throw new Response('Forbidden', { status: 403 });
  }
  return session;
}
