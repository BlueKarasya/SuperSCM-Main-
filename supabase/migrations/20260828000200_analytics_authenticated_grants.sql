-- 로그인 사용자에게 화면용 analytics 뷰의 읽기 권한을 부여합니다.
-- anon 접근은 계속 차단하고, 계산 뷰와 원본 데이터는 변경하지 않습니다.

revoke all on schema analytics from anon;
grant usage on schema analytics to authenticated;

grant select on all tables in schema analytics to authenticated;
grant select on analytics.v_leadtime_gap to authenticated;
grant select on analytics.v_stockout_risk to authenticated;
grant select on analytics.v_stockout_kpi to authenticated;

alter default privileges in schema analytics
  grant select on tables to authenticated;

-- 네 항목이 모두 true인지 확인합니다.
select
  has_schema_privilege('authenticated', 'analytics', 'usage') as analytics_schema_usage,
  has_table_privilege('authenticated', 'analytics.v_leadtime_gap', 'select') as leadtime_select,
  has_table_privilege('authenticated', 'analytics.v_stockout_risk', 'select') as stockout_select,
  has_table_privilege('authenticated', 'analytics.v_stockout_kpi', 'select') as stockout_kpi_select;
