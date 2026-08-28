export type LeadtimeGap = {
  supplier: string;
  country: string;
  masterLeadTime: number | null;
  sampleCount: number;
  actualAverage: number | null;
  p80: number | null;
  gap: number | null;
};

export type StockoutRisk = {
  itemId: string;
  itemName: string;
  supplier: string;
  currentStock: number;
  inboundQty: number;
  availableQty: number;
  dailyUsageAvg: number | null;
  plannedLeadTime: number | null;
  stockoutDays: number | null;
  stockoutDate: string | null;
  riskStatus: 'SAFE' | 'CRITICAL' | 'UNKNOWN';
  reason: 'NO_USAGE' | 'NO_LEADTIME' | null;
};

export type StockoutKpi = {
  n_items: number;
  n_critical: number;
  n_safe: number;
  n_unknown: number;
  n_within_30d: number;
  avg_stockout_days: number | null;
};

function value(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') return row[key];
  }
  return null;
}

function numberValue(row: Record<string, unknown>, keys: string[]) {
  const raw = value(row, keys);
  if (raw === null) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeLeadtimeGap(row: Record<string, unknown>): LeadtimeGap {
  return {
    supplier: String(value(row, ['supplier_name', 'supplier', '법인', '공급처', '공급업체명']) ?? '미정'),
    country: String(value(row, ['country', '국가']) ?? '미정'),
    masterLeadTime: numberValue(row, ['std_lead_time', 'master_lt', 'master_lead_time', 'planned_lead_time', '표준리드타임', '표준리드타임(일)', '마스터값']),
    sampleCount: numberValue(row, ['n_samples', 'sample_count', 'samples', '표본수']) ?? 0,
    actualAverage: numberValue(row, ['mean_days', 'actual_avg', 'actual_average', 'avg_lead_time', '실적평균']),
    p80: numberValue(row, ['p80_days', 'p80', 'P80']),
    gap: numberValue(row, ['gap_days', 'gap', 'leadtime_gap', '격차']),
  };
}

export function normalizeStockoutRisk(row: Record<string, unknown>): StockoutRisk {
  const riskStatus = value(row, ['risk_status', 'riskStatus', '위험상태']);
  const reason = value(row, ['reason', '사유']);

  return {
    itemId: String(value(row, ['item_id', 'item_code', '품목코드']) ?? '미정'),
    itemName: String(value(row, ['item_name', '품목명']) ?? '미정'),
    supplier: String(value(row, ['supplier_name', 'supplier_id', 'supplier', '공급처', '법인']) ?? '미정'),
    currentStock: numberValue(row, ['current_stock', 'currentStock', '현재고']) ?? 0,
    inboundQty: numberValue(row, ['inbound_qty', 'inboundQty', '입고예정']) ?? 0,
    availableQty: numberValue(row, ['available_qty', 'availableQty', '가용수량']) ?? 0,
    dailyUsageAvg: numberValue(row, ['daily_usage_avg', 'dailyUsageAvg', '일평균사용량']),
    plannedLeadTime: numberValue(row, ['planned_lead_time', 'plannedLeadTime', '계획리드타임']),
    stockoutDays: numberValue(row, ['stockout_days', 'stockoutDays', '소진일수']),
    stockoutDate: value(row, ['stockout_date', 'stockoutDate', '소진예상일']) === null
      ? null
      : String(value(row, ['stockout_date', 'stockoutDate', '소진예상일'])),
    riskStatus: riskStatus === 'SAFE' || riskStatus === 'CRITICAL' ? riskStatus : 'UNKNOWN',
    reason: reason === 'NO_USAGE' || reason === 'NO_LEADTIME' ? reason : null,
  };
}
