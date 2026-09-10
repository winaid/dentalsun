'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { CLINIC, HOURS } from '@/lib/clinic';
import { INQUIRY_TOPICS, validateInquiry } from '@/lib/inquiry';

/**
 * 간편 상담예약 — 버튼을 누르면 팝업이 뜨고, 연락처만 남기면 병원이 먼저 연락한다.
 *
 * ★ 받는 값은 진료 항목 · 성함 · 연락처 셋뿐이다. 증상·병력 같은 민감정보는 받지 않는다(PIPA).
 * ★ 서버(/api/inquiry)는 저장하지 않고 병원이 보는 곳으로 넘기기만 한다.
 * ★ 접수가 안 되면 접수된 척하지 않는다 — 전화·톡톡 버튼을 크게 띄운다.
 */
export function ConsultButton({ className, label = '간편 상담예약' }: { className?: string; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 4c-4.4 0-8 2.9-8 6.4 0 2.2 1.4 4.2 3.6 5.4L7 20l3.7-2.2c.4.1.9.1 1.3.1 4.4 0 8-2.9 8-6.5S16.4 4 12 4z"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinejoin="round"
          />
        </svg>
        {label}
      </button>
      {open && <ConsultModal onClose={() => setOpen(false)} />}
    </>
  );
}

type Status = 'idle' | 'sending' | 'done';

function ConsultModal({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [topic, setTopic] = useState<string>(INQUIRY_TOPICS[0]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [fallback, setFallback] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const t = setTimeout(() => nameRef.current?.focus(), 220);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
      clearTimeout(t);
    };
  }, [onClose]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'sending') return;
    const bad = validateInquiry({ topic, name, phone, consent });
    if (bad) {
      setError(bad.message);
      setFallback(false);
      return;
    }
    setStatus('sending');
    setError('');
    try {
      const r = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ topic, name, phone, consent, page: window.location.pathname }),
      });
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string; fallback?: boolean };
      if (!r.ok || !j.ok) {
        setStatus('idle');
        setFallback(Boolean(j.fallback));
        setError(j.error ?? '접수 중 문제가 생겼습니다. 전화로 연락 주세요.');
        return;
      }
      setStatus('done');
    } catch {
      setStatus('idle');
      setFallback(true);
      setError('연결이 끊겼습니다. 전화나 네이버 톡톡으로 연락 주세요.');
    }
  }

  if (!mounted) return null;

  const field = 'h-[52px] w-full rounded-2xl border border-hairline bg-canvas px-4 text-[15.5px] text-ink transition-all placeholder:text-ink-muted/70 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100 focus:outline-none';

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal aria-label="간편 상담예약">
      <button type="button" aria-label="닫기" onClick={onClose} className="modal-fade absolute inset-0 cursor-default bg-night/65 backdrop-blur-[3px]" />

      <div className="modal-in relative w-full max-w-[540px] overflow-hidden rounded-t-[28px] bg-white shadow-[0_40px_120px_rgba(9,14,35,0.45)] sm:rounded-[28px]">
        {/* 머리 — 남색 띠 */}
        <div className="relative overflow-hidden bg-[linear-gradient(135deg,#111c3d_0%,#1b2f66_60%,#24408a_100%)] px-7 pt-7 pb-8 text-white">
          <span aria-hidden className="pointer-events-none absolute -top-16 -right-10 h-48 w-48 rounded-full bg-sun-500/25 blur-3xl" />
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <span className="relative inline-flex items-center gap-1.5 rounded-full bg-sun-500 px-3 py-1 text-[12px] font-extrabold">
            1분이면 충분합니다
          </span>
          <h2 className="relative mt-3.5 text-[26px] font-extrabold tracking-[-0.02em]">간편 상담예약</h2>
          <p className="relative mt-2 text-[14.5px] leading-[1.6] text-white/70">
            연락처만 남겨 주시면 진료시간에 먼저 연락드립니다.
            <br className="hidden sm:block" /> 진료 항목은 상담 중에 바꾸셔도 됩니다.
          </p>
        </div>

        {status === 'done' ? (
          <div className="px-7 py-10 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sun-50 text-sun-600">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <p className="mt-5 text-[20px] font-extrabold text-ink">접수됐습니다</p>
            <p className="mt-2.5 text-[15px] leading-[1.7] text-ink-soft">
              {HOURS.display[0].label} {HOURS.display[0].time} 등 진료시간에 순서대로 연락드립니다.
              <br />
              급하시면 {CLINIC.phone} 으로 전화 주세요.
            </p>
            <button type="button" onClick={onClose} className="btn-brand mt-7 w-full !py-4 !text-[16px]">
              닫기
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="px-7 pt-6 pb-7" noValidate>
            <label className="block">
              <span className="text-[13px] font-bold text-ink-muted">진료 항목</span>
              <span className="relative mt-2 block">
                <select value={topic} onChange={(e) => setTopic(e.target.value)} className={`${field} appearance-none pr-11`}>
                  {INQUIRY_TOPICS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-ink-muted">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </label>

            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1.3fr]">
              <label className="block">
                <span className="text-[13px] font-bold text-ink-muted">성함</span>
                <input ref={nameRef} value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" autoComplete="name" className={`${field} mt-2`} />
              </label>
              <label className="block">
                <span className="text-[13px] font-bold text-ink-muted">연락처</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010-1234-5678"
                  inputMode="tel"
                  autoComplete="tel"
                  className={`${field} mt-2`}
                />
              </label>
            </div>

            {/* 봇이 채우는 빈 칸 */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

            <label className="mt-5 flex items-start gap-3 rounded-2xl bg-canvas px-4 py-3.5">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-brand-700"
              />
              <span className="text-[13.5px] leading-[1.6] text-ink-soft">
                상담 연락을 위해 성함과 연락처를 수집·이용하는 데 동의합니다. 상담이 끝나면 파기합니다.{' '}
                <Link href="/privacy" target="_blank" className="font-bold text-brand-700 underline underline-offset-2">
                  개인정보 처리방침
                </Link>
              </span>
            </label>

            {error && (
              <div className="mt-4 rounded-2xl border border-[#f3c9c2] bg-[#fdf3f1] px-4 py-3 text-[14px] leading-[1.6] text-[#a83a26]">
                {error}
                {fallback && (
                  <span className="mt-3 flex flex-wrap gap-2">
                    <a href={CLINIC.phoneHref} className="rounded-full bg-sun-500 px-4 py-2 text-[13.5px] font-bold text-white">
                      {CLINIC.phone} 전화
                    </a>
                    <a href={CLINIC.booking.naverTalk} target="_blank" rel="noopener" className="rounded-full bg-[#03C75A] px-4 py-2 text-[13.5px] font-bold text-white">
                      네이버 톡톡
                    </a>
                  </span>
                )}
              </div>
            )}

            <button type="submit" disabled={status === 'sending'} className="btn-brand mt-5 w-full !py-4 !text-[16px] disabled:opacity-60">
              {status === 'sending' ? '접수 중…' : '상담 신청'}
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-[13.5px] text-ink-muted">
              <span>바로 통화를 원하시면</span>
              <a href={CLINIC.phoneHref} className="font-extrabold text-brand-700 hover:underline">
                {CLINIC.phone}
              </a>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
