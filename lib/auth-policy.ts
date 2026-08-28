export type AppRole = 'ADMIN' | 'USER';

export function isAppRole(value: unknown): value is AppRole {
  return value === 'ADMIN' || value === 'USER';
}

export function safeNextPath(value: string | null | undefined) {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/';
}
