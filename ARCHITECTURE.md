# SuperSCM 아키텍처

> 이 문서는 2026-08-27 현재 저장소의 실제 파일과 구현을 기준으로 작성한 구조 요약입니다.
> 구현 예정 기능과 현재 동작하는 기능을 구분해서 기술합니다.

## 1. 프로젝트 개요

SuperSCM은 한국후지필름BI의 월간 발주계획 업무를 웹 화면으로 표현한 Next.js 15 프로토타입입니다.
수요 확정부터 재고·공급 확인, 마스터 검증, 발주량 계산, 보고자료 생성까지의 업무 흐름을 보여주며,
리드타임 분석 화면은 Supabase의 `analytics` 뷰를 실제로 조회합니다.

현재 구현은 두 성격이 공존합니다.

- `/`: 브라우저 상태로 동작하는 Phase 1 업무 흐름 프로토타입
- `/analysis/leadtime`: 서버에서 Supabase `analytics.v_leadtime_gap`을 조회하는 분석 예제
- `/analysis/stockout`: 아직 페이지가 없어 404이며, `lib/scm.ts`에 KPI 조회 함수만 준비됨

## 2. 기술 스택과 실행 구조

| 항목 | 사용 기술 및 역할 |
|---|---|
| 웹 프레임워크 | Next.js 15 App Router |
| UI | React 19, TypeScript |
| 스타일 | `app/globals.css` 순수 CSS |
| 아이콘 | `lucide-react` |
| 데이터베이스 | Supabase PostgreSQL |
| DB 클라이언트 | `@supabase/supabase-js`, `@supabase/ssr` |
| 배포 설정 | Vercel (`vercel.json`) |
| 테스트 | Node.js 내장 테스트 러너 |

실행 명령은 `package.json`의 스크립트에 정의되어 있습니다.

```text
npm run dev       개발 서버
npm run build     프로덕션 빌드
npm run start     빌드 결과 실행
npm test          lib/**/*.test.ts 테스트
```

## 3. 전체 구조 요약

```text
superSCM-main/
├─ app/                         Next.js 라우트, 전역 스타일
├─ components/                  화면 조립용 React 컴포넌트
│  ├─ analysis/                 분석 화면 공통 컴포넌트
│  └─ workflow/                 월간 발주계획 6단계 화면
├─ lib/                         도메인 모델, Supabase 조회, 연결 설정
│  └─ supabase/                 브라우저·서버 클라이언트와 환경변수
├─ supabase/                    Supabase CLI 설정과 앱용 마이그레이션
├─ sql/                         데이터 조회 권한과 수업용 쓰기 정책
├─ docs/                        실습 안내와 설계·실행 문서
├─ outputs/                     프로세스 정의서와 미리보기 산출물
├─ dump.sql                     raw/core/analytics 데이터베이스 덤프
├─ build_*.mjs                  프로세스 정의서용 Excel 생성 스크립트
├─ package.json                 의존성과 실행 명령
├─ next.config.ts               Next.js 설정
├─ tsconfig.json                TypeScript 설정과 `@/*` 별칭
└─ vercel.json                  Vercel Next.js 배포 설정
```

## 4. 폴더별 역할 요약

| 폴더 | 역할 | 주요 파일 |
|---|---|---|
| `app/` | URL 라우트, 레이아웃, 전역 CSS, API 엔드포인트 | `page.tsx`, `layout.tsx`, `analysis/leadtime/page.tsx` |
| `app/analysis/` | 데이터 기반 분석 화면 | `leadtime/` |
| `components/` | 페이지에서 사용하는 화면 컴포넌트 | `procurement-app.tsx`, `analysis/`, `workflow/` |
| `components/analysis/` | 분석 페이지의 공통 껍데기·표·탭 | `analysis-frame.tsx`, `data-table.tsx`, `analysis-tabs.tsx` |
| `components/workflow/` | 월간 발주계획 6단계의 샘플 화면 | `*-step.tsx`, `step-frame.tsx` |
| `lib/` | DB 조회와 화면용 데이터 정규화 | `scm.ts`, `scm-model.ts` |
| `lib/supabase/` | Supabase 환경변수 및 클라이언트 생성 | `env.ts`, `client.ts`, `server.ts` |
| `supabase/` | Supabase 프로젝트 설정과 public 테이블 마이그레이션 | `config.toml`, `migrations/` |
| `sql/` | `core`·`analytics` 스키마 접근 권한과 RLS 정책 | `01-grants.sql`, `02-policies.sql` |
| `docs/` | 실행 안내, 요구사항, 설계·계획 문서 | `04-실습안내.md`, `superpowers/` |
| `outputs/` | 업무 프로세스 Excel 및 PNG 결과물 | 프로세스 정의서와 미리보기 |

## 5. `app/` 상세

### `app/layout.tsx`

모든 라우트에 적용되는 루트 레이아웃입니다. `app/globals.css`를 전역으로 불러오고,
한국어 HTML 문서와 공통 메타데이터를 설정합니다. 실제 페이지 UI는 직접 그리지 않고 `children`을 렌더링합니다.

### `app/page.tsx`

사이트 루트 `/`의 진입점입니다. `ProcurementApp`을 렌더링하여 브라우저에서 동작하는 월간 발주계획 워크플로우를 시작합니다.

### `app/globals.css`

프로젝트 전체의 유일한 스타일 파일입니다. 레이아웃, 사이드바, 진행 단계, 카드, 표, 버튼,
폼, 반응형 규칙, 분석 화면 스타일을 모두 포함합니다. Tailwind나 CSS Module은 사용하지 않습니다.

주요 스타일 영역은 다음과 같습니다.

- `.app-shell`, `.sidebar`, `.main`: 전체 애플리케이션 레이아웃
- `.nav-*`, `.progress-*`: 업무 단계 내비게이션
- `.card`, `.metric`, `.grid-*`: 카드와 KPI 레이아웃
- `.table-wrap`, `.analysis-table-*`: 일반 표와 분석 표
- `.analysis-*`: 분석 페이지용 화면 요소
- `@media`: 1050px와 760px 기준 반응형 처리

### `app/api/health/supabase/route.ts`

`GET /api/health/supabase` API입니다. 실제 DB 쿼리는 하지 않고,
`getSupabaseEnv()` 결과로 Supabase 환경변수의 설정 여부만 확인합니다.

- 설정됨: `{ configured: true }`, HTTP 200
- 설정 안 됨: `{ configured: false }`, HTTP 503

### `app/analysis/leadtime/layout.tsx`

리드타임 분석 라우트의 중첩 레이아웃입니다. 분석 라우트에 메타데이터와 HTML 구조를 제공하고,
현재 위치에서 루트 CSS까지 `../../globals.css`로 불러옵니다.

루트 레이아웃도 같은 CSS와 HTML 구조를 제공하므로, 현재는 중복된 레이아웃 역할이 있습니다.
향후 분석 화면 공통 헤더를 추가할 때 이 레이아웃 또는 별도 `analysis` 레이아웃으로 책임을 정리할 수 있습니다.

### `app/analysis/leadtime/page.tsx`

`/analysis/leadtime` 서버 페이지입니다.

1. `getLeadtimeGap()`으로 DB 조회
2. 오류가 있으면 오류 메시지 카드 표시
3. 조회 결과의 공급처 수, 격차 양수 수, 표본 부족 수를 화면에 표시
4. `DataTable`로 공급처별 리드타임 표 렌더링

페이지는 `dynamic = 'force-dynamic'`으로 설정되어 요청마다 최신 조회 결과를 사용합니다.
표시용 `gap` 색상과 부호만 화면에서 처리하고, 평균·분위수 같은 분석 계산은 DB 뷰에서 수행합니다.

## 6. `components/` 상세

### `components/procurement-app.tsx`

루트 화면의 최상위 클라이언트 컴포넌트입니다. `active` 상태로 6단계 중 현재 단계를 관리하고,
사이드바와 상단 진행 바를 표시합니다.

업무 단계는 다음 `StepId`와 `steps` 배열로 정의됩니다.

```text
dashboard → demand → supply → master → calculation → report
```

`useMemo` 안의 `switch`가 현재 단계에 맞는 워크플로우 컴포넌트를 조립합니다.
최근 수정으로 사이드바에 `/analysis/leadtime` 링크도 추가되었습니다.
이 컴포넌트는 입력값을 DB에 저장하지 않으며, 단계 이동과 샘플 화면 상태만 관리합니다.

`Icons` export는 워크플로우 컴포넌트가 공통으로 사용할 수 있는 Lucide 아이콘 모음입니다.

### `components/analysis/analysis-frame.tsx`

분석 화면의 공통 껍데기입니다. 제목, 설명, `ANALYSIS` eyebrow, `SUPABASE LIVE` 배지를 출력하고
페이지별 콘텐츠를 `children`으로 받습니다.

### `components/analysis/data-table.tsx`

제네릭 타입을 사용하는 재사용 표 컴포넌트입니다.

- `Column<T>`: 컬럼 키, 제목, 정렬, 선택적 렌더러 정의
- `formatNumber()`: 정수·소수 표시와 단위 suffix 처리
- `DataTable<T>`: 컬럼 정의와 행을 HTML table로 렌더링
- 행이 비어 있으면 `empty` 문구를 표시

특정 도메인 타입을 직접 참조하지 않기 때문에 리드타임 표와 이후 재고 소진 표에 함께 사용할 수 있습니다.

### `components/analysis/analysis-tabs.tsx`

`usePathname()`으로 현재 경로를 확인하는 클라이언트 분석 탭입니다.
현재 준비된 리드타임 화면은 링크로, 아직 없는 재고 소진 화면은 `오후 실습` 잠금 표시로 출력합니다.

현재 파일은 공통 컴포넌트로 준비되어 있지만 `analysis-frame.tsx`나 페이지에서 아직 import하지 않습니다.
따라서 현재 화면에는 탭이 자동으로 나타나지 않습니다.

## 7. `components/workflow/` 상세

이 폴더는 실제 계산 서비스가 아니라 월간 발주계획 업무를 설명하는 Phase 1 샘플 화면입니다.
각 단계는 `StepFrame`을 사용하고 `onNext`, `onBack` 콜백으로 부모의 현재 단계를 변경합니다.

### `step-frame.tsx`

모든 단계 화면의 공통 하단 영역입니다. 단계 콘텐츠를 `children`으로 감싸고,
이전·다음 버튼과 프로토타입 안내 문구를 표시합니다.

### `dashboard-step.tsx`

전체 현황 화면입니다. 총 발주금액, 수요 확정 상태, 발주량 예외, 보고자료 상태,
프로세스 체크리스트와 발주계획 목록을 대표 샘플값으로 보여줍니다.
카드 클릭과 키보드 입력으로 다른 단계로 이동할 수 있습니다.

### `demand-step.tsx`

수요 확정 화면입니다. OL, SFDC, Bulk-deal, 전년 실적 탭을 보여주고,
수급회의 날짜·참석자·결정사항·사전재고 확보 여부를 브라우저 상태로 입력합니다.
검증 상태와 확정 후보 수를 샘플 계산으로 표시하지만 현재 DB 저장은 하지 않습니다.

### `supply-step.tsx`

재고·Open PO 준비 화면입니다. 가용재고, Open PO, 납기 위험과 재고 상태별 처리 기준을
샘플 데이터로 표현합니다.

### `master-step.tsx`

마스터 데이터 검증 화면입니다. 품목·Supplier·BOM·MOQ·단가·Flex Rule 등 발주 계산 전에 확인해야 할
기준정보를 체크리스트와 표로 보여줍니다.

### `calculation-step.tsx`

발주량 계산 결과 미리보기입니다. 확정수요, 가용재고, 순소요량, MOQ 반영 최종량,
금액과 예외 검토 순서를 대표값으로 표시합니다. 실제 계산 함수나 저장 로직은 아직 연결되지 않았습니다.

### `report-step.tsx`

경영진 보고자료 미리보기입니다. 전월 대비 금액, 전년 대비, OL 대비 차이와 주요 감소 품목을 표시하고,
Excel/PDF 출력 버튼은 Phase 2 예정 기능으로 비활성화되어 있습니다.

## 8. `lib/` 상세

### `lib/scm-model.ts`

분석 화면이 사용할 도메인 타입과 원본 행 정규화 함수를 둡니다.

- `LeadtimeGap`: 공급처, 국가, 마스터 리드타임, 표본수, 실적 평균, P80, 격차
- `value()`: 여러 후보 컬럼명 중 먼저 유효한 값을 선택
- `numberValue()`: 숫자 변환 실패를 `null`로 처리
- `normalizeLeadtimeGap()`: Supabase 행을 `LeadtimeGap`으로 변환

뷰 컬럼명이 영어·한글·예전 별칭 중 무엇이더라도 화면 모델은 일정한 필드명을 사용하게 하는 경계층입니다.
계산 불가능한 값은 임의의 숫자로 채우지 않고 `null`로 유지합니다.

### `lib/scm.ts`

Supabase 조회 함수를 모아두는 Repository 성격의 모듈입니다. 화면 컴포넌트가 Supabase를 직접 호출하지 않도록 합니다.

- `getLeadtimeGap()`: `analytics.v_leadtime_gap` 전체 조회 후 `normalizeLeadtimeGap()` 적용
- `getStockoutKpi()`: `analytics.v_stockout_kpi` 한 건 조회

조회 오류는 `{ rows/data: ..., error: string | null }` 구조로 반환하여 화면이 오류와 빈 결과를 구분할 수 있게 합니다.

### `lib/scm-model.test.ts`

Node 내장 테스트 러너로 `normalizeLeadtimeGap()`를 검증합니다.

- 실제 analytics 컬럼명(`supplier_name`, `std_lead_time`, `p80_days` 등)
- 한글 별칭 컬럼명
- 기본값과 숫자 정규화

### `lib/supabase.ts`

`lib/supabase/client.ts`, `server.ts`, `env.ts`의 공개 함수를 한 곳에서 re-export하는 진입점입니다.

### `lib/supabase/env.ts`

Supabase 환경변수를 읽고 검증합니다.

- `getSupabaseEnv()`: 변수가 없으면 `null` 반환
- `requireSupabaseEnv()`: 변수가 없으면 한국어 오류를 throw
- 사용 변수: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

secret 키는 클라이언트 코드에서 사용하지 않습니다.

### `lib/supabase/client.ts`

브라우저에서 사용할 Supabase 클라이언트를 생성합니다. 현재 화면의 조회 함수는 서버 클라이언트를 사용하며,
이 모듈은 이후 클라이언트 저장 기능을 연결할 때 사용할 기반입니다.

### `lib/supabase/server.ts`

서버 컴포넌트와 서버 조회 함수에서 사용할 Supabase 클라이언트를 생성합니다.
읽기 중심 프로토타입이므로 세션 유지와 자동 토큰 갱신을 끄고 있습니다.

## 9. 데이터베이스와 SQL 구조

### 데이터 흐름

```text
raw 원본 데이터
    ↓ 정제·매핑·계산
core 기준 테이블/뷰
    ↓ 화면용 집계
analytics 뷰
    ↓ lib/scm.ts
서버 페이지
    ↓ 정규화된 모델
분석 컴포넌트와 표
```

화면은 원칙적으로 `raw`를 직접 조회하지 않고 `analytics` 뷰를 조회합니다.
공급처 매핑과 계획 리드타임 같은 기준은 `core`에서 관리합니다.

### `supabase/config.toml`

Supabase CLI 프로젝트 ID, API 활성화, PostgreSQL major version 15, Studio 활성화를 설정합니다.

### `supabase/migrations/20260813000100_create_procurement_demand_core.sql`

현재 수요 확정 기능에 필요한 `public` 스키마 테이블을 생성하는 마이그레이션입니다.

- `planning_runs`: 월간 계획 실행 단위와 상태
- `ol_demand`: 영업 OL 수요
- `sfdc_pipeline`: SFDC 파이프라인 수요
- `bulk_deals`: Bulk-deal과 사전재고 확보 여부
- `historical_actuals`: 과거 실적
- `demand_confirmations`: 수급회의 결과와 최종 확정값

각 계획 데이터는 `planning_run_id`로 연결되고, 필요한 인덱스와 `updated_at` 자동 갱신 트리거가 정의되어 있습니다.
이 마이그레이션의 `public` 테이블은 현재 화면의 `analytics` 리드타임 조회와는 별도의 수요 확정 저장 기반입니다.

### `sql/01-grants.sql`

Supabase Data API 역할(`anon`, `authenticated`)에 `core`와 `analytics` 스키마 사용·조회 권한을 부여합니다.
새로 만들어지는 뷰에도 기본 조회 권한을 부여하며, 원본 `raw` 스키마는 의도적으로 열지 않습니다.

### `sql/02-policies.sql`

`core.leadtime_plan`과 `core.usage_profile`에 수업용 읽기·쓰기 권한과 전체 허용 RLS 정책을 추가합니다.
브라우저에 노출되는 publishable 키를 가진 사용자가 값을 수정할 수 있는 교육용 설정이므로,
운영 환경에서는 `auth.uid()` 등으로 정책을 제한해야 합니다.

### `dump.sql`

기존 Supabase 데이터베이스의 PostgreSQL 덤프입니다. `raw`, `core`, `analytics` 스키마의 테이블·뷰·함수 및 데이터를
복원하기 위한 자료이며, 앱 코드의 런타임 모듈은 아닙니다.

## 10. 문서와 산출물

### `docs/`

- `04-실습안내.md`: 참가자용 실습 목표, 실행 절차, 화면 기대값
- `superpowers/04-실습안내.md`: Supabase 구축·검증과 오후 실습 상세 안내
- `superpowers/specs/`: 프로덕트 요구사항 문서
- `superpowers/plans/`: 초기 프로토타입 구현 계획

### `outputs/`

업무 프로세스 정의서 Excel 파일, 시트별 PNG 미리보기, 검사 결과 NDJSON를 보관합니다.
실행 애플리케이션의 번들 코드가 아니며, 기획·업무 기준을 확인하는 참고 산출물입니다.

### `build_workbook.mjs`

업무 프로세스, 데이터 정의, KPI, 발주 계산 템플릿, 정책 결정표, FX-LIVE 연계 정의가 포함된 Excel을 생성합니다.
계산 열에는 Excel 수식과 입력 검증을 넣고, 생성 후 검사·렌더링 결과를 `outputs/`에 저장합니다.

### `build_dummy_demand_data.mjs`

수요 확정 화면이나 실습용으로 사용할 더미 수요 데이터를 생성하는 보조 스크립트입니다.

## 11. 루트 설정 파일

### `package.json` / `package-lock.json`

Next.js, React, TypeScript, Supabase, Lucide 아이콘 의존성과 npm 실행 명령을 정의합니다.
`package-lock.json`은 설치 버전을 고정합니다.

### `next.config.ts`

Next.js 설정 파일이며 현재 `reactStrictMode: true`만 활성화되어 있습니다.

### `tsconfig.json`

엄격한 TypeScript 검사, 번들러 모듈 해석, JSX preserve, 경로 별칭 `@/* → ./*`를 설정합니다.

### `vercel.json`

Vercel이 이 프로젝트를 Next.js 프레임워크로 인식하도록 지정합니다.

### `.env.example` / `.env.local.example`

Supabase URL과 publishable key의 예시 파일입니다. 실제 값은 `.env.local`에만 넣고 커밋하지 않습니다.

### `.gitignore`

`node_modules`, `.next`, 환경변수 파일, 빌드 산출물, Vercel 로컬 설정 등을 Git에서 제외합니다.

### `AGENTS.md` / `SCHEMA.md`

`AGENTS.md`는 코드 구조·스타일·데이터 처리 규칙을 정의하고, `SCHEMA.md`는 raw/core/analytics 스키마와
각 뷰의 컬럼·기대 행 수를 설명합니다. 새 분석 화면을 만들 때 반드시 먼저 읽어야 하는 프로젝트 기준 문서입니다.

## 12. 주요 런타임 흐름

### 루트 업무 흐름

```text
app/page.tsx
    ↓
ProcurementApp (client)
    ↓ active StepId
DashboardStep / DemandStep / SupplyStep / MasterStep /
CalculationStep / ReportStep
    ↓ onNext / onBack
ProcurementApp 상태 변경
```

이 흐름은 현재 DB와 분리되어 있으며, 화면에 표시되는 수량·금액·상태는 대부분 샘플값입니다.

### 리드타임 분석 흐름

```text
GET /analysis/leadtime
    ↓
LeadtimePage (server component)
    ↓
getLeadtimeGap()
    ↓
createSupabaseServerClient()
    ↓
analytics.v_leadtime_gap
    ↓
normalizeLeadtimeGap()
    ↓
AnalysisFrame + DataTable
```

DB 오류는 오류 카드로 표시하고, 빈 행은 `DataTable`의 빈 결과 문구로 표시합니다.

## 13. 현재 구조의 주의사항

1. 워크플로우 화면은 아직 로컬 React 상태 기반이며, `planning_runs` 등 public 테이블과 연결되지 않았습니다.
2. `getStockoutKpi()`는 준비되어 있지만 `/analysis/stockout` 페이지와 재고 소진 상세 조회 함수는 아직 없습니다.
3. `AnalysisTabs`는 구현되어 있으나 현재 페이지에서 사용하지 않아 탭 UI가 자동 표시되지 않습니다.
4. `app/analysis/leadtime/layout.tsx`는 루트 레이아웃과 HTML·CSS import가 일부 중복됩니다.
5. `sql/02-policies.sql`의 전체 허용 RLS는 교육용 설정입니다. 운영 배포 전 권한 모델을 다시 설계해야 합니다.
6. 계산식은 향후 화면 컴포넌트가 아니라 `lib`의 순수 모델 함수 또는 DB 뷰·서비스로 이동해야 합니다.
7. `supabase/.temp/` 같은 CLI 임시 파일과 `~$`로 시작하는 Office 잠금 파일은 소스·산출물에 포함하지 않습니다.

## 14. 새 분석 화면을 추가하는 표준 순서

프로젝트 규칙상 새 분석 기능은 아래 순서로 추가합니다.

1. `lib/scm-model.ts`: 타입과 원본 컬럼 정규화 함수 추가
2. `lib/scm.ts`: `analytics` 뷰 조회 함수 추가
3. `app/analysis/<기능이름>/page.tsx`: 서버 페이지 조립
4. `components/analysis/*`: `AnalysisFrame`, `DataTable` 등 공통 컴포넌트 재사용
5. 필요한 DB 계산은 SQL 뷰 또는 순수 모델 함수로 분리
6. `npm run build`와 관련 테스트 실행

화면은 `analytics`만 조회하고, 조회 오류와 빈 결과를 구분하며, 계산 불가능한 값은 `null`과 사유 코드로 표현하는 것을 원칙으로 합니다.
