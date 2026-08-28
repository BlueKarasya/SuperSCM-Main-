// 서버 컴포넌트와 Server Action에서 쿠키 세션을 유지하는 클라이언트입니다.

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { requireSupabaseEnv } from './env';

export async function createSupabaseServerClient() {
  const { url, publishableKey } = requireSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Component에서는 쿠키 쓰기가 불가능할 수 있습니다.
        }
      },
    },
  });
}
