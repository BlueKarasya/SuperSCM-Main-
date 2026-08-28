'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function updateUser(formData: FormData) {
  const { user } = await requireAdmin();
  const targetId = String(formData.get('user_id') ?? '');
  const role = String(formData.get('role') ?? 'USER');
  const active = formData.get('active') === 'on';
  const fail = (message: string): never => redirect(`/admin/users?error=${encodeURIComponent(message)}`);
  if (!targetId || (role !== 'ADMIN' && role !== 'USER')) fail('잘못된 사용자 변경 요청입니다.');
  if (targetId === user.id && (role !== 'ADMIN' || !active)) fail('자신의 관리자 권한과 활성 상태는 변경할 수 없습니다.');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.schema('core').rpc('update_app_user', {
    p_target_id: targetId,
    p_role: role,
    p_active: active,
  });
  if (error) fail(error.message);
  revalidatePath('/admin/users');
  redirect('/admin/users?updated=1');
}
