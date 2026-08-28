-- 참가자가 값을 확정하는 두 테이블의 쓰기 정책입니다.
--
-- core.leadtime_plan 과 core.usage_profile 은 dump.sql 에서 RLS 만 켜져 있고
-- 정책이 하나도 없습니다(dump.sql:10936, 10948). 정책이 없는 RLS 는 "전부 거부"라
-- 앱에서 읽기도 쓰기도 되지 않습니다.
--
-- SQL Editor / Table Editor 로만 값을 바꿀 거면 이 파일은 실행하지 않아도 됩니다.
-- (그쪽은 postgres 롤이라 RLS 를 우회합니다.)
-- 앱 화면에서 확정값을 저장하게 하려면 01-grants.sql 다음에 실행하세요.

-- 1) 테이블 권한 — RLS 와 별개로 필요합니다.
--    01-grants.sql 은 select 만 줬으므로 쓰기 권한을 여기서 더합니다.
revoke all on core.leadtime_plan from anon;
revoke all on core.usage_profile from anon;
grant select on core.leadtime_plan, core.usage_profile to authenticated;
grant insert, update, delete on core.leadtime_plan, core.usage_profile to authenticated;

-- 2) RLS 정책
--    USER 는 조회만 가능하고, 쓰기는 core.is_admin() 을 통과한 ADMIN 만 가능합니다.
drop policy if exists "수업용 전체 허용" on core.leadtime_plan;
drop policy if exists leadtime_plan_authenticated_select on core.leadtime_plan;
create policy leadtime_plan_authenticated_select
  on core.leadtime_plan
  for select to authenticated using (true);

drop policy if exists leadtime_plan_admin_mutation on core.leadtime_plan;
create policy leadtime_plan_admin_mutation
  on core.leadtime_plan
  for all to authenticated
  using (core.is_admin())
  with check (core.is_admin());

drop policy if exists "수업용 전체 허용" on core.usage_profile;
drop policy if exists usage_profile_authenticated_select on core.usage_profile;
create policy usage_profile_authenticated_select
  on core.usage_profile
  for select to authenticated using (true);

drop policy if exists usage_profile_admin_mutation on core.usage_profile;
create policy usage_profile_admin_mutation
  on core.usage_profile
  for all to authenticated
  using (core.is_admin())
  with check (core.is_admin());

-- 확인 — 두 줄이 나와야 합니다.
select schemaname, tablename, policyname, roles, cmd
  from pg_policies
 where schemaname = 'core'
   and tablename in ('leadtime_plan', 'usage_profile');

-- 되돌리기 (필요 시)
-- drop policy "수업용 전체 허용" on core.leadtime_plan;
-- drop policy "수업용 전체 허용" on core.usage_profile;
-- revoke insert, update, delete on core.leadtime_plan from anon, authenticated;
-- revoke insert, update, delete on core.usage_profile from anon, authenticated;
