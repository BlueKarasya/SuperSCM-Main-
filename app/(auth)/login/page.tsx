import { login } from '@/lib/auth-actions';

const messages: Record<string, string> = {
  invalid_credentials: '이메일 또는 비밀번호를 확인하세요.',
  account_inactive: '비활성화된 계정이거나 사용자 프로필이 없습니다.',
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const params = await searchParams;
  const errorMessage = params.error ? messages[params.error] ?? '로그인에 실패했습니다.' : null;
  return <main className="ui-page"><div className="ui-panel" style={{ maxWidth: 420, margin: '80px auto' }}>
    <span className="eyebrow">SCM ACCESS</span>
    <h1>로그인</h1>
    <p className="muted">월간 발주계획 시스템에 로그인하세요.</p>
    {errorMessage && <p className="text-danger" role="alert">{errorMessage}</p>}
    <form action={login} className="form-stack">
      <label>이메일<input className="form-input" type="email" name="email" required autoComplete="email" /></label>
      <label>비밀번호<input className="form-input" type="password" name="password" required autoComplete="current-password" /></label>
      <input type="hidden" name="next" value={params.next ?? '/'} />
      <button className="ui-button ui-button--primary" type="submit">로그인</button>
    </form>
  </div></main>;
}
