export default function EmptyValue({ reasonCode = 'CALCULATION_UNAVAILABLE' }: { reasonCode?: string }) {
  return <span className="ui-empty-value" title={reasonCode}><span>—</span><small>+ {reasonCode}</small></span>;
}
