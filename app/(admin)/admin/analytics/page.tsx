import PageHeader from '@/components/shell/page-header';
import Panel from '@/components/ui/panel';

export default function AdminAnalyticsPage() {
  return <div className="ui-page"><PageHeader eyebrow="ADMIN" title="분석 관리" description="분석 뷰와 화면 연결 상태를 관리합니다." /><Panel title="분석 관리 준비 중"><p className="muted">분석 뷰 관리 기능은 다음 구현 단계에서 연결합니다.</p></Panel></div>;
}
