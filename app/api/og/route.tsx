import { ImageResponse } from 'next/og';
import { CLINIC } from '@/lib/clinic';

/**
 * 페이지별 공유 카드 — 제목을 쿼리로 받아 1200×630 그림 하나를 그린다.
 * 쪽마다 다른 카드가 나가야 카카오톡·검색 결과에서 어느 쪽인지 보인다.
 * ⚠️ satori 규칙: 자식이 둘 이상인 div 에는 display 를 반드시 명시. 문자열은 미리 합쳐 하나로.
 */
export const runtime = 'nodejs';
const SIZE = { width: 1200, height: 630 };

export function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get('t') ?? '';
  const title = raw.replace(/\s+/g, ' ').trim().slice(0, 60);
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '72px 80px',
          background: 'linear-gradient(135deg, #0b132e 0%, #12204a 55%, #1f376f 100%)',
          color: '#fff',
          fontSize: 32,
        }}
      >
        <div style={{ position: 'absolute', right: -160, top: -180, width: 560, height: 560, borderRadius: 560, background: 'rgba(242,111,30,0.16)', display: 'flex' }} />
        <div style={{ position: 'absolute', right: 120, bottom: -260, width: 420, height: 420, borderRadius: 420, border: '2px solid rgba(255,255,255,0.10)', display: 'flex' }} />
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 16, height: 16, borderRadius: 16, background: '#f26f1e', marginRight: 16, display: 'flex' }} />
          <div style={{ display: 'flex', fontSize: 26, letterSpacing: 6, color: 'rgba(255,255,255,0.72)' }}>SUN DENTAL CLINIC</div>
        </div>
        <div style={{ display: 'flex', marginTop: 26, fontSize: title.length > 24 ? 58 : 74, fontWeight: 800, letterSpacing: -2, lineHeight: 1.18 }}>{title || CLINIC.shortName}</div>
        <div style={{ marginTop: 44, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.16)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 40, fontWeight: 800 }}>{CLINIC.shortName}</div>
          <div style={{ display: 'flex', marginTop: 12, fontSize: 26, color: 'rgba(255,255,255,0.68)' }}>{`서울 중구 세종대로 · 광화문역 6번 출구 도보 2분   ·   ${CLINIC.phone}`}</div>
        </div>
      </div>
    ),
    { ...SIZE, headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
  );
}
