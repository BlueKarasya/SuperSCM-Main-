import PageHeader from '@/components/shell/page-header';
import Badge from '@/components/ui/badge';
import DataTable, { type Column } from '@/components/ui/data-table';
import EmptyValue from '@/components/ui/empty-value';
import InsightBanner from '@/components/ui/insight-banner';
import Panel from '@/components/ui/panel';
import { getLeadtimeGap } from '@/lib/scm';
import type { LeadtimeGap } from '@/lib/scm-model';

export const dynamic = 'force-dynamic';

function NumberValue({ value, suffix = '', reasonCode = 'CALCULATION_UNAVAILABLE' }: { value: number | null; suffix?: string; reasonCode?: string }) {
  return value === null ? <EmptyValue reasonCode={reasonCode} /> : <>{Number.isInteger(value) ? value : value.toFixed(1)}{suffix}</>;
}

const columns: Column<LeadtimeGap>[] = [
  { key: 'supplier', label: '공급처' },
  { key: 'country', label: '국가' },
  { key: 'masterLeadTime', label: '마스터', align: 'right', render: (row) => <NumberValue value={row.masterLeadTime} suffix="일" reasonCode="NO_MASTER_LEADTIME" /> },
  { key: 'sampleCount', label: '표본수', align: 'right', render: (row) => row.sampleCount.toLocaleString() },
  { key: 'actualAverage', label: '실적평균', align: 'right', render: (row) => <NumberValue value={row.actualAverage} suffix="일" reasonCode="NO_VALID_SAMPLE" /> },
  { key: 'p80', label: 'P80', align: 'right', render: (row) => <NumberValue value={row.p80} suffix="일" reasonCode="NO_VALID_SAMPLE" /> },
  { key: 'gap', label: '격차', align: 'right', render: (row) => row.gap === null ? <EmptyValue reasonCode="CALCULATION_UNAVAILABLE" /> : <Badge status={row.gap > 0 ? 'CRITICAL' : 'SAFE'}>{row.gap > 0 ? `+${row.gap}일` : `${row.gap}일`}</Badge> },
];

export default async function LeadtimePage() {
  const { rows, error } = await getLeadtimeGap();
  return <div className="ui-page">
    <PageHeader title="리드타임 격차" description="공급처별 마스터 리드타임과 실제 P80을 비교합니다." />
    {error ? <Panel><p className="text-danger">조회에 실패했습니다: {error}</p></Panel> : <>
      <InsightBanner title="분석 기준">격차가 양수인 공급처는 실제 P80 리드타임이 마스터 기준보다 깁니다.</InsightBanner>
      <Panel title="공급처별 리드타임" description="계산 불가 값은 사유 코드와 함께 표시합니다."><DataTable columns={columns} rows={rows} rowKey={(row, index) => `${row.supplier}-${index}`} empty="데이터가 없습니다. analytics.v_leadtime_gap와 Exposed schemas를 확인하세요." /></Panel>
    </>}
  </div>;
}
