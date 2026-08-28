import type { ReactNode } from 'react';

export type Status = 'SAFE' | 'WARNING' | 'CRITICAL' | 'CALCULATION_UNAVAILABLE';

export default function Badge({ status, children }: { status: Status; children?: ReactNode }) {
  const label = children ?? status;
  return <span className={`ui-badge ui-badge--${status.toLowerCase().replaceAll('_', '-')}`}>{label}</span>;
}
