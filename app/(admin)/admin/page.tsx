import PageHeader from '@/components/shell/page-header';
import Panel from '@/components/ui/panel';

export default function AdminPage() {
  return <div className="ui-page"><PageHeader eyebrow="ADMIN" title="관리자 대시보드" description="SCM 분석과 기준정보를 관리하는 관리자 영역입니다." /><Panel title="관리자 기능" description="관리 메뉴의 상세 기능은 다음 단계에서 연결합니다."><p className="muted">현재 관리자 화면은 공통 라우팅과 디자인 시스템 검증용입니다.</p></Panel></div>;
}
