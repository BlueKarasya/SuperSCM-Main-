import type { ReactNode } from 'react';

export default function KpiCard({ label, value, foot, status }: { label: string; value: ReactNode; foot?: ReactNode; status?: 'SAFE' | 'WARNING' | 'CRITICAL' | 'CALCULATION_UNAVAILABLE' }) {
  return <div className="ui-kpi-card" data-status={status}><div className="ui-kpi-card__label">{label}</div><div className="ui-kpi-card__value">{value}</div>{foot && <div className="ui-kpi-card__foot">{foot}</div>}</div>;
}
