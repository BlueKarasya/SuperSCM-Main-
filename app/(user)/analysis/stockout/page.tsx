import PageHeader from '@/components/shell/page-header';
import Badge, { type Status } from '@/components/ui/badge';
import DataTable, { type Column } from '@/components/ui/data-table';
import EmptyValue from '@/components/ui/empty-value';
import InsightBanner from '@/components/ui/insight-banner';
import KpiCard from '@/components/ui/kpi-card';
import Panel from '@/components/ui/panel';
import { getStockoutKpi, getStockoutRisks } from '@/lib/scm';
import type { StockoutKpi, StockoutRisk } from '@/lib/scm-model';

export const dynamic = 'force-dynamic';

function NumberValue({ value, suffix = '', reasonCode = 'CALCULATION_UNAVAILABLE' }: { value: number | null; suffix?: string; reasonCode?: string }) {
  return value === null ? <EmptyValue reasonCode={reasonCode} /> : <>{Number.isInteger(value) ? value : value.toFixed(1)}{suffix}</>;
}

function riskStatus(status: StockoutRisk['riskStatus']): Status {
  if (status === 'SAFE') return 'SAFE';
  if (status === 'CRITICAL') return 'CRITICAL';
  return 'CALCULATION_UNAVAILABLE';
}

const columns: Column<StockoutRisk>[] = [
  { key: 'itemId', label: '품목코드' },
  { key: 'itemName', label: '품목명' },
  { key: 'supplier', label: '공급처' },
  { key: 'availableQty', label: '가용수량', align: 'right', render: (row) => <NumberValue value={row.availableQty} /> },
  { key: 'dailyUsageAvg', label: '일평균사용', align: 'right', render: (row) => <NumberValue value={row.dailyUsageAvg} reasonCode="NO_USAGE" /> },
  { key: 'plannedLeadTime', label: '리드타임', align: 'right', render: (row) => <NumberValue value={row.plannedLeadTime} suffix="일" reasonCode="NO_LEADTIME" /> },
  { key: 'stockoutDays', label: '소진예상', align: 'right', render: (row) => <NumberValue value={row.stockoutDays} suffix="일" reasonCode={row.reason ?? 'CALCULATION_UNAVAILABLE'} /> },
  { key: 'stockoutDate', label: '소진예상일', render: (row) => row.stockoutDate ?? <EmptyValue reasonCode={row.reason ?? 'CALCULATION_UNAVAILABLE'} /> },
  { key: 'riskStatus', label: '판정', render: (row) => <Badge status={riskStatus(row.riskStatus)}>{row.riskStatus === 'SAFE' ? '안전' : row.riskStatus === 'CRITICAL' ? '위험' : '판정 불가'}</Badge> },
];

function KpiCards({ kpi }: { kpi: StockoutKpi }) {
  return <div className="ui-kpi-grid">
    <KpiCard label="전체 품목" value={kpi.n_items} foot="소진 위험 분석 대상" />
    <KpiCard label="위험" value={kpi.n_critical} foot="리드타임 내 소진" status="CRITICAL" />
    <KpiCard label="안전" value={kpi.n_safe} foot="리드타임 이후 소진" status="SAFE" />
    <KpiCard label="판정 불가" value={kpi.n_unknown} foot="사용량 또는 리드타임 없음" status="CALCULATION_UNAVAILABLE" />
    <KpiCard label="30일 이내 소진" value={kpi.n_within_30d} foot="우선 확인 대상" status="WARNING" />
    <KpiCard label="평균 소진일수" value={<NumberValue value={kpi.avg_stockout_days} suffix="일" />} foot="계산 가능한 품목 기준" />
  </div>;
}

export default async function StockoutPage() {
  const [{ rows, error }, { data: kpi, error: kpiError }] = await Promise.all([getStockoutRisks(), getStockoutKpi()]);
  return <div className="ui-page">
    <PageHeader title="재고 소진 위험" description="가용수량과 일평균 사용량을 기준으로 품목별 소진 위험을 확인합니다." />
    {error ? <Panel><p className="text-danger">조회에 실패했습니다: {error}</p></Panel> : <>
      {kpi && <KpiCards kpi={kpi} />}
      {kpiError && <Panel><p className="text-danger">요약 지표 조회에 실패했습니다: {kpiError}</p></Panel>}
      {!kpi && !kpiError && <Panel><p className="muted">요약 지표가 없습니다.</p></Panel>}
      <InsightBanner title="판정 기준">가용수량을 일평균 사용량으로 나눈 소진예상일이 계획 리드타임 이내면 위험으로 표시합니다.</InsightBanner>
      <Panel title="품목별 소진 위험" description="계산 불가 값은 0이 아닌 —와 사유 코드로 표시합니다."><DataTable columns={columns} rows={rows} rowKey={(row) => row.itemId} empty="데이터가 없습니다. analytics.v_stockout_risk와 Exposed schemas를 확인하세요." /></Panel>
    </>}
  </div>;
}
