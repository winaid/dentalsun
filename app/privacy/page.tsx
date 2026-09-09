import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { Breadcrumb } from '@/components/ui';
import { CLINIC } from '@/lib/clinic';
import { alt } from '@/lib/seo';

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: `${CLINIC.name} 개인정보처리방침 — 홈페이지 이용과 예약·상담 과정에서 수집하는 개인정보의 항목, 이용 목적, 보유 기간을 안내합니다.`,
  alternates: alt('/privacy'),
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-[72px] md:pt-[88px]">
        <section className="section">
          <div className="wrap max-w-[860px]">
            <Breadcrumb trail={[{ name: '개인정보처리방침', path: '/privacy' }]} />
            <h1 className="display-sm mt-6">개인정보처리방침</h1>
            <div className="prose-ko mt-8 space-y-6">
              <p>{CLINIC.name}(이하 &quot;병원&quot;)은 「개인정보 보호법」을 준수하며, 홈페이지를 통해서는 별도의 회원가입이나 개인정보 입력 없이 진료 안내를 제공합니다. 예약과 상담은 네이버 예약·네이버 톡톡·전화로 이루어지며, 해당 서비스에서 처리되는 개인정보는 각 서비스 제공자의 개인정보처리방침을 따릅니다.</p>
              <h2 className="text-[1.15rem] font-bold text-ink">1. 수집하는 개인정보와 목적</h2>
              <p>진료 예약과 상담을 위해 성명, 연락처, 상담 내용을 수집할 수 있으며, 진료 목적 외에는 사용하지 않습니다. 진료 과정에서 수집되는 진료기록은 「의료법」에 따라 보관합니다.</p>
              <h2 className="text-[1.15rem] font-bold text-ink">2. 보유 및 이용 기간</h2>
              <p>예약·상담 정보는 목적 달성 후 지체 없이 파기하며, 진료기록은 의료법이 정한 기간 동안 보관합니다.</p>
              <h2 className="text-[1.15rem] font-bold text-ink">3. 홈페이지 접속 정보</h2>
              <p>이 홈페이지는 광고 추적 스크립트를 사용하지 않습니다. 유튜브 영상은 이용자가 재생 버튼을 누른 뒤에만 불러옵니다.</p>
              <h2 className="text-[1.15rem] font-bold text-ink">4. 문의</h2>
              <p>개인정보에 관한 문의는 {CLINIC.name}(전화 {CLINIC.phone})으로 연락 주시기 바랍니다.</p>
              <p className="text-[14px] text-ink-muted">시행일: 2026년 9월 8일</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
