'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BodyEditor, charCount } from '@/components/admin/BodyEditor';

/**
 * 블로그 관리 — 마케터가 쓰는 화면 (2026-09-08 오너: "사용하기 편하고 직관적이면서 최대한 자동화").
 *
 * ★★ 흐름은 두 단계다 ★★
 *   1) '어떤 글을 쓸까요' 한 줄 → [초안 만들기] → Gemini 가 제목·요약·본문·사진 장면을 쓰고,
 *      이어서 gpt-image-2 가 그 장면으로 대표 사진까지 만든다. 사람은 기다리기만 한다.
 *   2) 검토 화면 — 사진(다시 만들기 / 내 사진 올리기)과 글(문서처럼 고치는 편집기)을 보고,
 *      [지금 바로 올리기] 또는 날짜·시각을 골라 [예약 발행].
 *
 * ★ '발행' 은 저장소에 커밋하는 것이다. content/blog/{날짜}-{주소}.json 이 GitHub 에 올라가고
 *   Vercel 이 2~3분 안에 다시 빌드한다. 날짜·시각이 미래면 그때까지 숨어 있다가 저절로 실린다(lib/blog.ts publishKey).
 * ★ 초안이 자동으로 발행되는 일은 없다 — 의료광고라 사람이 한 번은 읽어야 한다. 이 순서를 바꾸지 말 것.
 * ★ 권한은 두 겹. 비밀번호는 이 화면을 여는 문, GitHub 토큰은 저장소에 쓰는 힘. 키 셋은 Vercel 환경변수가
 *   정석이고(목록 머리에 ✓/✗ 로 보인다), 없으면 이 브라우저에만 붙여 넣어 쓸 수 있다.
 * ⚠️ 이 화면은 noindex + robots disallow 다(layout.tsx · app/robots.ts).
 * ⚠️ 사진은 만들거나 올릴 때 **커밋하지 않는다** — 미리보기(data URL)만 들고 있다가 발행할 때 글과 함께 보낸다(imageData).
 *    그래서 '다시 만들기' 를 열 번 눌러도 저장소와 Vercel 은 조용하다.
 */
type Post = {
  file?: string;
  sha?: string;
  slug: string;
  title: string;
  date: string;
  time?: string;
  updated?: string;
  summary: string;
  category?: string;
  image?: string;
  imageAlt?: string;
  html: string;
};
type View = 'list' | 'topic' | 'edit';

const CATEGORIES = ['임플란트', '턱관절', '심미치료', '보험 틀니·임플란트', '사랑니', '자연치아 살리기', '무통·수면치료', '잇몸·예방', '치과 선택'];
/* 입력칸의 회색 예시 문구 — 칩으로 두면 그대로 눌러서 겹치는 글이 생긴다(2026-09-08 오너). 열 때마다 하나씩 돌아가며 보인다. */
const EXAMPLES = [
  '임플란트 심고 며칠 뒤부터 씹어도 되나요',
  '턱에서 소리만 나고 안 아픈데 치료해야 하나요',
  '내비게이션 임플란트는 일반 임플란트와 뭐가 다른가요',
  '수면치료로 임플란트 수술을 받으면 기억이 안 나나요',
  '보험 임플란트는 몇 개까지 되나요',
  '사랑니 뽑고 며칠이나 붓나요',
  '신경치료 중간에 안 아프면 그만 다녀도 되나요',
];
const AUTO_COUNTS = [3, 5, 10, 15, 20];
const AUTO_GAP_DAYS = 3;
const AUTO_TIME = '09:00';
const addDays = (iso: string, n: number) => new Date(new Date(`${iso}T00:00:00Z`).getTime() + n * 86400000).toISOString().slice(0, 10);
const EMPTY: Post = { slug: '', title: '', date: '', time: '09:00', summary: '', category: '', image: '', imageAlt: '', html: '' };

const nowKST = () => new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 16);
const todayKST = () => nowKST().slice(0, 10);
const keyOf = (p: { date: string; time?: string }) => `${p.date}T${p.time || '00:00'}`;
const koDate = (iso: string, time?: string) => {
  const [y, m, d] = iso.split('-');
  return `${y}. ${Number(m)}. ${Number(d)}.${time && time !== '00:00' ? ` ${time}` : ''}`;
};

const inputCls = 'w-full rounded-xl border border-hairline bg-white px-4 py-3 text-[15.5px] text-ink outline-none focus:border-sun-500';
const labelCls = 'text-[13px] font-black text-sun-700';
const btn = 'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[15px] font-bold transition-opacity disabled:opacity-40';
const btnDark = `${btn} bg-ink text-white hover:opacity-90`;
const btnLine = `${btn} border-[1.5px] border-ink/40 text-ink hover:bg-ink hover:text-white`;

/** 휴대폰 사진(3~8MB)을 브라우저에서 먼저 줄인다 — 서버 한도(4.5MB) 때문. 긴 변 1600px, JPEG 0.86 → 보통 300~600KB. */
async function shrink(file: File): Promise<string> {
  const bmp = await createImageBitmap(file).catch(() => null);
  if (!bmp) throw new Error('이 형식은 브라우저가 읽지 못합니다. 아이폰 HEIC 는 사진 앱에서 JPG 로 내보내거나, 설정 > 카메라 > 포맷을 "높은 호환성" 으로 바꿔 주세요.');
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * scale);
  c.height = Math.round(bmp.height * scale);
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.86);
}

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [pw, setPw] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [view, setView] = useState<View>('list');
  const [editing, setEditing] = useState<Post | null>(null);
  /* 새로 만들거나 올린 사진의 data URL. 발행 때 imageData 로 함께 간다. 저장소에 이미 있는 사진이면 null. */
  const [preview, setPreview] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err' | 'info'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [server, setServer] = useState({ hasServerToken: true, hasOpenAI: true, hasGemini: true, repo: '' });
  const [ghToken, setGhToken] = useState('');
  const [oaKey, setOaKey] = useState('');
  const [gmKey, setGmKey] = useState('');
  const [topic, setTopic] = useState('');
  const [scene, setScene] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [cautions, setCautions] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [example, setExample] = useState(EXAMPLES[0]);
  /* 자동 흐름 상태 — 진행 줄과 중단 신호. stopRef 는 렌더와 무관하게 루프가 읽는다. */
  const [autoCount, setAutoCount] = useState(10);
  const [auto, setAuto] = useState<{ step: string; done: Array<{ title: string; date: string }>; skipped: string[]; running: boolean } | null>(null);
  const stopRef = useRef(false);
  /* 무인 발행(크론) 설정 — /api/admin/auto. null 이면 아직 못 읽음. */
  const [autoCfg, setAutoCfg] = useState<{ enabled: boolean; everyDays: number; time: string; last?: { at: string; result: string } } | null>(null);
  const [autoNext, setAutoNext] = useState<{ due: boolean; date: string } | null>(null);
  /* 중앙(winaid)에서 오는 글 — 여기서는 숨기기만 된다(lib/centralHidden.ts). */
  const [central, setCentral] = useState<{ items: Array<{ slug: string; title: string; post_type: string; published_at: string; hasCover: boolean; hidden: boolean }> } | null>(null);
  const [cronReady, setCronReady] = useState(true);

  useEffect(() => {
    setGhToken(localStorage.getItem('cd_gh_token') || '');
    setOaKey(localStorage.getItem('cd_oa_key') || '');
    setGmKey(localStorage.getItem('cd_gm_key') || '');
  }, []);

  const headers = useCallback(() => {
    const h: Record<string, string> = { 'content-type': 'application/json' };
    if (ghToken) h['x-github-token'] = ghToken;
    if (oaKey) h['x-openai-key'] = oaKey;
    if (gmKey) h['x-gemini-key'] = gmKey;
    return h;
  }, [ghToken, oaKey, gmKey]);

  const load = useCallback(async () => {
    setBusy(true);
    const r = await fetch('/api/admin/posts', { headers: headers(), cache: 'no-store' });
    setBusy(false);
    if (r.status === 401) { setAuthed(false); return; }
    const j = await r.json();
    if (!r.ok) {
      setAuthed(true);
      setMsg({ kind: 'err', text: j.error || '목록을 못 읽었습니다.' });
      if (r.status === 428) setServer((s) => ({ ...s, hasServerToken: false }));
      return;
    }
    setAuthed(true);
    setPosts(j.posts);
    setServer({ hasServerToken: j.hasServerToken, hasOpenAI: j.hasOpenAI, hasGemini: j.hasGemini, repo: `${j.repo}@${j.branch}` });
    fetch('/api/admin/auto', { headers: headers(), cache: 'no-store' })
      .then((r) => r.json())
      .then((a) => { if (a.ok) { setAutoCfg(a.config); setAutoNext(a.next); setCronReady(a.cronReady); } })
      .catch(() => {});
    fetch('/api/admin/central', { headers: headers(), cache: 'no-store' })
      .then((r) => r.json())
      .then((c) => { if (c.ok) setCentral({ items: c.items }); })
      .catch(() => {});
  }, [headers]);

  useEffect(() => { load(); }, [load]);

  /* 중앙 글 숨기기/다시 보이기 — 저장소에 한 줄 커밋. 반영은 재빌드 뒤(1~2분). */
  const toggleCentral = async (slug: string, hidden: boolean) => {
    setBusy(true);
    const r = await fetch('/api/admin/central', { method: 'POST', headers: headers(), body: JSON.stringify({ slug, hidden }) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { setMsg({ kind: 'err', text: j.error || '못 바꿨습니다.' }); return; }
    setCentral((c) => (c ? { items: c.items.map((it) => (it.slug === slug ? { ...it, hidden } : it)) } : c));
    setMsg({ kind: 'ok', text: hidden ? '숨겼습니다. 1~2분 뒤 사이트에서 빠집니다(중앙 데이터는 그대로).' : '다시 보이게 했습니다. 1~2분 뒤 사이트에 실립니다.' });
  };

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: pw }) });
    setBusy(false);
    if (!r.ok) { setMsg({ kind: 'err', text: '비밀번호가 맞지 않습니다.' }); return; }
    setPw(''); setMsg(null); load();
  };

  const logout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    setAuthed(false); setPosts([]); setEditing(null); setView('list');
  };

  const saveKeys = () => {
    localStorage.setItem('cd_gh_token', ghToken.trim());
    localStorage.setItem('cd_oa_key', oaKey.trim());
    localStorage.setItem('cd_gm_key', gmKey.trim());
    setMsg({ kind: 'ok', text: '이 브라우저에 저장했습니다. 다시 불러옵니다.' });
    load();
  };

  const openNew = () => { setEditing({ ...EMPTY, date: todayKST() }); setPreview(null); setWarnings([]); setCautions([]); setTopic(''); setScene(''); setMsg(null); setExample(EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)]); setView('topic'); };
  const openEdit = (p: Post) => { setEditing({ ...p, time: p.time || '00:00' }); setPreview(null); setWarnings([]); setCautions([]); setScene(''); setMsg(null); setView('edit'); };
  const backToList = () => { setEditing(null); setView('list'); setMsg(null); };

  /* ── 사진: 만들기 / 올리기 ─────────────────────────────────── */
  const imageName = (p: Post) => (p.image ? `${p.slug || 'post'}-${Date.now().toString(36).slice(-4)}` : p.slug || 'post');

  const makeImage = async (p: Post, sceneText: string): Promise<Post> => {
    const r = await fetch('/api/admin/image', { method: 'POST', headers: headers(), body: JSON.stringify({ prompt: sceneText, name: imageName(p) }) });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || '사진을 못 만들었습니다.');
    setPreview(j.preview || null);
    return { ...p, image: j.image };
  };

  const regenImage = async () => {
    if (!editing) return;
    if (!scene.trim()) { setMsg({ kind: 'err', text: '어떤 장면인지 한 줄 적어 주세요. 예: 흰 상판 위의 임플란트 하나와 크라운' }); return; }
    setBusy(true); setMsg({ kind: 'info', text: '사진을 만드는 중입니다 (30~40초)…' });
    try {
      const p = await makeImage(editing, scene);
      setEditing(p);
      setMsg({ kind: 'ok', text: '사진을 바꿨습니다. 올릴 때 함께 저장됩니다. 마음에 안 들면 장면을 고쳐 다시 만들거나, 내 사진을 올리세요.' });
    } catch (e) { setMsg({ kind: 'err', text: String((e as Error).message) }); }
    setBusy(false);
  };

  const upload = async (file: File | undefined) => {
    if (!editing || !file) return;
    setBusy(true); setMsg({ kind: 'info', text: '사진을 올리는 중입니다…' });
    try {
      const data = await shrink(file);
      const r = await fetch('/api/admin/upload', { method: 'POST', headers: headers(), body: JSON.stringify({ name: imageName(editing), data }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || '사진을 못 올렸습니다.');
      setPreview(j.preview || null);
      setEditing({ ...editing, image: j.image });
      setMsg({ kind: 'ok', text: `사진을 받았습니다 (${Math.round(j.bytes / 1024)}KB). 올릴 때 함께 저장됩니다. '사진 설명' 이 사진과 맞는지 봐 주세요.` });
    } catch (e) { setMsg({ kind: 'err', text: String((e as Error).message) }); }
    setBusy(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  /* ── 1단계: 초안 → 사진까지 한 번에 ─────────────────────────── */
  const makeDraft = async () => {
    if (!editing) return;
    if (topic.trim().length < 2) { setMsg({ kind: 'err', text: '어떤 글을 쓸지 한 줄 적어 주세요.' }); return; }
    setBusy(true); setMsg(null);
    setProgress('1/2 · 글을 쓰는 중입니다 (30~60초). 잠시만요.');
    const r = await fetch('/api/admin/draft', { method: 'POST', headers: headers(), body: JSON.stringify({ topic, existingTitles: posts.map((p) => p.title) }) });
    const j = await r.json();
    if (!r.ok) {
      setBusy(false); setProgress(null);
      setMsg({ kind: 'err', text: j.error || '글을 못 썼습니다. 한 번 더 눌러 보세요.' });
      if (r.status === 428) setServer((s) => ({ ...s, hasGemini: false }));
      return;
    }
    const d = j.draft;
    let p: Post = { ...editing, title: d.title, slug: d.slug, summary: d.summary, category: d.category || '', imageAlt: d.imageAlt, html: d.html };
    setWarnings(j.warnings || []);
    setCautions(j.cautions || []);
    setScene(d.imagePrompt || '');
    setProgress('2/2 · 글에 맞는 사진을 만드는 중입니다 (30~40초).');
    let photoNote = '';
    try {
      p = await makeImage(p, d.imagePrompt || d.title);
    } catch (e) {
      photoNote = ` 사진은 못 만들었습니다 (${String((e as Error).message).slice(0, 80)}) — 검토 화면에서 다시 만들거나 올려 주세요.`;
    }
    setEditing(p);
    setBusy(false); setProgress(null);
    setView('edit');
    setMsg({ kind: (j.warnings || []).length ? 'err' : 'ok', text: `초안이 준비됐습니다 (공백 제외 ${charCount(d.html)}자). 읽어 보고 고친 뒤 올리세요.${photoNote}` });
  };

  /* ── 발행 ─────────────────────────────────────────────────── */
  const publish = async (mode: 'now' | 'schedule') => {
    if (!editing) return;
    let p = editing;
    if (mode === 'now') {
      const n = nowKST();
      p = { ...p, date: n.slice(0, 10), time: n.slice(11, 16) };
    }
    if (!p.title.trim() || !p.summary.trim() || !p.html.trim()) { setMsg({ kind: 'err', text: '제목·요약·본문은 비울 수 없습니다.' }); return; }
    if (p.image && !p.imageAlt?.trim()) { setMsg({ kind: 'err', text: '사진 설명(무엇이 찍혔는지)을 채워 주세요. 검색과 화면 낭독기가 읽는 글입니다.' }); return; }
    if (p.file && preview) p = { ...p, updated: todayKST() };
    setBusy(true); setMsg(null);
    const r = await fetch('/api/admin/publish', { method: 'POST', headers: headers(), body: JSON.stringify({ posts: [{ ...p, ...(preview ? { imageData: preview } : {}) }] }) });
    const j = await r.json();
    setBusy(false);
    if (!r.ok) { setMsg({ kind: 'err', text: j.error || '올리지 못했습니다.' }); return; }
    const future = keyOf(p) > nowKST();
    setEditing(null); setView('list');
    setMsg({
      kind: 'ok',
      text: future
        ? `예약했습니다. ${koDate(p.date, p.time)} 에 저절로 실립니다 (그 시각 뒤 최대 한 시간 안).`
        : `올렸습니다. 2~3분 뒤 사이트에 보입니다: /insight/blog/${p.slug}`,
    });
    load();
  };

  /*
   * ★★ 자동으로 쓰고 예약 (2026-09-08 오너: "자동 10건 쓰기 하면 3일 간격으로 … 내용이랑 이미지까지 해서 발행 예약") ★★
   *   주제 N개 고르기 → 편마다 (글 → 사진) → 마지막에 **커밋 하나**로 전부 예약.
   *   날짜는 이미 예약된 마지막 글 다음부터 3일 간격, 09:00. 그래서 이어서 누르면 달력이 그대로 이어진다.
   * ⚠️ 사람 검토가 없는 흐름이다. 그래서 의료법 낱말 경고가 있는 글은 **예약하지 않고 건너뛴다**(목록에 사유가 남는다).
   *    첫 글이 오늘이 아니라 사흘 뒤인 것도 그 때문 — 목록에서 '고치기' 로 읽어 볼 시간이 있다.
   * ⚠️ 탭을 닫으면 멈춘다. 중간까지 만든 것은 커밋되지 않는다(커밋은 끝에 한 번). '중단' 을 누르면 그때까지 만든 것만 예약한다.
   */
  const runAuto = async () => {
    if (auto?.running) return;
    const n = autoCount;
    if (!confirm(`${n}편을 자동으로 쓰고 ${AUTO_GAP_DAYS}일 간격으로 예약할까요? 글마다 1~2분, 전부 ${Math.round((n * 90) / 60)}분쯤 걸립니다. 그동안 이 탭을 닫지 마세요.`)) return;
    stopRef.current = false;
    setMsg(null);
    setAuto({ step: '주제를 고르는 중입니다…', done: [], skipped: [], running: true });
    const fail = (text: string) => { setAuto((a) => (a ? { ...a, running: false, step: '' } : a)); setMsg({ kind: 'err', text }); };
    const rt = await fetch('/api/admin/topics', { method: 'POST', headers: headers(), body: JSON.stringify({ count: n, existing: posts.map((p) => ({ title: p.title, summary: p.summary })) }) });
    const jt = await rt.json();
    if (!rt.ok) return fail(jt.error || '주제를 못 골랐습니다.');
    const topics: Array<{ topic: string; category: string }> = jt.topics;

    /* 시작 날짜: 예약된 마지막 글 다음. 없으면 오늘. 거기서 3일 뒤부터. */
    const lastDate = posts.reduce((m, p) => (p.date > m ? p.date : m), todayKST());
    let date = addDays(lastDate, AUTO_GAP_DAYS);
    const made: Post[] = [];
    const skipped: string[] = [];
    const titlesSoFar = posts.map((p) => p.title);
    const usedSlugs = new Set(posts.map((p) => p.slug));
    for (let i = 0; i < topics.length; i++) {
      if (stopRef.current) break;
      const t = topics[i];
      setAuto((a) => (a ? { ...a, step: `${i + 1}/${topics.length} · 글을 쓰는 중 — ${t.topic}` } : a));
      let rd = await fetch('/api/admin/draft', { method: 'POST', headers: headers(), body: JSON.stringify({ topic: t.topic, existingTitles: titlesSoFar, review: true }) });
      let jd = await rd.json();
      if (!rd.ok) { skipped.push(`${t.topic} — ${jd.error || '글 실패'}`); continue; }
      /* 의료법 낱말이 걸리면 그 낱말을 피해서 한 번 다시 쓴다. 그래도 HARD 가 남으면 버리고, SOFT 만 남으면 예약하되 사유를 남긴다. */
      let flagged = [...(jd.warnings || []), ...(jd.cautions || [])];
      if (flagged.length) {
        setAuto((a) => (a ? { ...a, step: `${i + 1}/${topics.length} · 의료법 낱말(${flagged.join(', ')})을 피해 다시 쓰는 중 — ${t.topic}` } : a));
        rd = await fetch('/api/admin/draft', { method: 'POST', headers: headers(), body: JSON.stringify({ topic: t.topic, existingTitles: titlesSoFar, avoid: flagged, review: true }) });
        jd = await rd.json();
        if (!rd.ok) { skipped.push(`${t.topic} — ${jd.error || '글 실패'}`); continue; }
        flagged = [...(jd.warnings || []), ...(jd.cautions || [])];
      }
      if ((jd.warnings || []).length) { skipped.push(`${t.topic} — 두 번 모두 의료법 낱말: ${jd.warnings.join(', ')}`); continue; }
      const softNote = (jd.cautions || []).length ? ` (확인 권장: ${jd.cautions.join(', ')})` : '';
      const d = jd.draft;
      let slug = d.slug || `post-${i + 1}`;
      while (usedSlugs.has(slug)) slug = `${slug}-2`;
      usedSlugs.add(slug);
      let p: Post = { slug, title: d.title, date, time: AUTO_TIME, summary: d.summary, category: d.category || t.category, imageAlt: d.imageAlt, html: d.html };
      let imageData: string | undefined;
      setAuto((a) => (a ? { ...a, step: `${i + 1}/${topics.length} · 사진을 만드는 중 — ${d.title}` } : a));
      try {
        const ri = await fetch('/api/admin/image', { method: 'POST', headers: headers(), body: JSON.stringify({ prompt: d.imagePrompt || d.title, name: slug }) });
        const ji = await ri.json();
        if (ri.ok) { p = { ...p, image: ji.image }; imageData = ji.preview; }
      } catch { /* 사진 없이도 글은 예약한다 — 목록 카드가 제목 카드로 대신한다. */ }
      made.push({ ...p, ...(imageData ? ({ imageData } as object) : {}) } as Post);
      titlesSoFar.push(d.title);
      date = addDays(date, AUTO_GAP_DAYS);
      setAuto((a) => (a ? { ...a, done: [...a.done, { title: d.title + softNote, date: p.date }], skipped: [...skipped] } : a));
    }
    if (!made.length) return fail(`예약할 글이 없습니다. ${skipped.length ? '건너뛴 사유: ' + skipped.join(' / ') : ''}`);
    setAuto((a) => (a ? { ...a, step: `${made.length}편을 저장소에 올리는 중…` } : a));
    const rp = await fetch('/api/admin/publish', { method: 'POST', headers: headers(), body: JSON.stringify({ posts: made }) });
    const jp = await rp.json();
    if (!rp.ok) return fail(jp.error || '올리지 못했습니다.');
    setAuto((a) => (a ? { ...a, running: false, step: '', skipped } : a));
    setMsg({ kind: 'ok', text: `${made.length}편을 예약했습니다 — ${koDate(made[0].date)} 부터 ${koDate(made[made.length - 1].date)} 까지 ${AUTO_GAP_DAYS}일 간격, ${AUTO_TIME}. 목록에서 '고치기' 로 미리 읽어 보실 수 있습니다.${skipped.length ? ` 건너뛴 글 ${skipped.length}편은 아래에 사유가 있습니다.` : ''}` });
    load();
  };

  /*
   * ★ 무인 발행 토글 (2026-09-08 오너: "마케터 손에 안 가게 3일마다 자동으로") — 켜 두면 Vercel 크론이 매일 0시(한국)에
   *   /api/cron/blog 를 부르고, 미래 글이 없으면 한 편을 만들어 everyDays 뒤로 예약한다. 사람은 아무것도 안 해도 된다.
   * ⚠️ 설정은 저장소 파일(content/auto-blog.json)이라 토글 = 커밋 = 빌드 한 번. 자주 누를 것이 아니다.
   */
  const toggleAuto = async (enabled: boolean, everyDays?: number) => {
    if (!autoCfg) return;
    const days = everyDays ?? autoCfg.everyDays;
    if (enabled && !confirm(`무인 발행을 켤까요? 사람이 읽지 않은 글이 ${days}일에 한 편씩 올라갑니다. 의료법 낱말 검사와 감수를 거치지만 완벽하지는 않습니다 — 목록을 가끔 훑어봐 주세요.`)) return;
    setBusy(true);
    const r = await fetch('/api/admin/auto', { method: 'POST', headers: headers(), body: JSON.stringify({ enabled, everyDays: days }) });
    const j = await r.json();
    setBusy(false);
    if (!r.ok) { setMsg({ kind: 'err', text: j.error || '설정을 저장하지 못했습니다.' }); return; }
    setAutoCfg(j.config);
    setMsg({ kind: 'ok', text: enabled ? `무인 발행을 켰습니다 — ${days}일에 한 편, ${j.config.time}. 다음 글은 예약된 마지막 글 ${days}일 뒤에 저절로 만들어집니다.` : '무인 발행을 껐습니다. 예약된 글은 그대로 실립니다.' });
  };

  /* 시험 — 크론이 하는 일을 지금 한 번 (미래 글이 있어도 그 뒤에 잇는다). 2~3분. */
  const runCronNow = async () => {
    if (!confirm('지금 한 편을 자동으로 만들어 예약할까요? 2~3분 걸립니다.')) return;
    setBusy(true); setMsg({ kind: 'info', text: '무인 발행을 한 번 돌리는 중입니다 (주제 → 글 → 감수 → 사진, 2~3분)…' });
    const r = await fetch('/api/cron/blog?force=1', { cache: 'no-store' });
    const j = await r.json();
    setBusy(false);
    if (!r.ok) { setMsg({ kind: 'err', text: j.error || '실패했습니다.' }); return; }
    if (j.skipped) { setMsg({ kind: 'err', text: `이번엔 올리지 않았습니다 — ${j.skipped}${j.topic ? ` (${j.topic})` : ''}. 내일 다시 시도합니다.` }); load(); return; }
    setMsg({ kind: 'ok', text: `${koDate(j.date)} 에 예약했습니다 — ${j.title}${j.cautions?.length ? ` · 확인 권장: ${j.cautions.join(', ')}` : ''}${j.fixes?.length ? ` · 감수: ${j.fixes.join(' / ')}` : ''}` });
    load();
  };

  const remove = async (p: Post) => {
    if (!p.file || !confirm(`"${p.title}" 을 지울까요? 사이트에서도 사라집니다.`)) return;
    setBusy(true);
    const r = await fetch('/api/admin/posts', { method: 'DELETE', headers: headers(), body: JSON.stringify({ file: p.file }) });
    const j = await r.json();
    setBusy(false);
    if (!r.ok) { setMsg({ kind: 'err', text: j.error || '삭제에 실패했습니다.' }); return; }
    setMsg({ kind: 'ok', text: '지웠습니다. 2~3분 뒤 사이트에서 사라집니다.' });
    setEditing(null); setView('list');
    load();
  };

  const now = nowKST();
  const stats = useMemo(() => {
    const live = posts.filter((p) => keyOf(p) <= now).length;
    return { live, queued: posts.length - live };
  }, [posts, now]);

  const Msg = () =>
    msg ? (
      <p className={`mt-6 rounded-xl px-4 py-3 text-[14.5px] leading-[1.7] ${msg.kind === 'ok' ? 'bg-green-50 text-green-900' : msg.kind === 'err' ? 'bg-red-50 text-red-800' : 'bg-canvas-2 text-ink'}`}>
        {msg.text}
      </p>
    ) : null;

  /* ── 로그인 ───────────────────────────────────────────────── */
  if (authed === false) {
    return (
      <main className="mx-auto max-w-[420px] px-6 py-24">
        <p className="text-[13px] font-black tracking-[0.14em] text-sun-600">광화문 선치과 · 블로그 관리</p>
        <h1 className="display-sm mt-3 text-[28px] text-ink">로그인</h1>
        <form onSubmit={login} className="mt-8 space-y-4">
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="비밀번호" autoFocus className={inputCls} />
          <button type="submit" disabled={busy || !pw} className={`${btnDark} w-full`}>들어가기</button>
        </form>
        {msg && <p className="mt-4 text-[14.5px] text-red-700">{msg.text}</p>}
      </main>
    );
  }
  if (authed === null) return <main className="px-6 py-24 text-center text-ink-soft">불러오는 중…</main>;

  /* ── 1단계: 무엇을 쓸까 ───────────────────────────────────── */
  if (view === 'topic' && editing) {
    return (
      <main className="mx-auto max-w-[760px] px-6 py-14">
        <button onClick={backToList} className="text-[14.5px] font-bold text-sun-700">← 목록으로</button>
        <h1 className="display-sm mt-4 text-[28px] text-ink">새 글</h1>
        <p className="mt-2 text-[15.5px] leading-[1.8] text-ink-soft">
          환자가 실제로 묻는 말을 그대로 적어 주세요. 제목·요약·본문·대표 사진까지 한 번에 만들어 드립니다. 만든 뒤에 읽어 보고 고칠 수 있습니다.
        </p>

        <label className="mt-8 block">
          <span className={labelCls}>어떤 글을 쓸까요?</span>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={2}
            autoFocus
            disabled={busy}
            className={`${inputCls} mt-2 text-[17px]`}
            placeholder={`예: ${example}`}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); makeDraft(); } }}
          />
        </label>
        <p className="mt-2 text-[13.5px] text-ink-muted">이미 있는 글과 겹치면 다른 각도로 씁니다. 그래도 목록을 한 번 훑고 적으면 더 좋습니다.</p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button onClick={makeDraft} disabled={busy || topic.trim().length < 2} className={`${btnDark} px-7 py-3 text-[16px]`}>
            {busy ? '만드는 중…' : '초안 만들기'}
          </button>
          <button onClick={() => { setView('edit'); setMsg(null); }} disabled={busy} className="text-[14px] font-bold text-ink-muted underline underline-offset-2">
            AI 없이 빈 글로 직접 쓰기
          </button>
        </div>

        {progress && (
          <div className="mt-8 rounded-2xl border border-hairline bg-white p-5">
            <div className="flex items-center gap-3">
              <span className="inline-block size-3 animate-pulse rounded-full bg-sun-500" />
              <p className="text-[15px] font-bold text-ink">{progress}</p>
            </div>
            <p className="mt-2 text-[14px] text-ink-soft">이 화면을 닫지 마세요. 끝나면 검토 화면으로 넘어갑니다.</p>
          </div>
        )}
        <Msg />
      </main>
    );
  }

  /* ── 2단계: 검토하고 올리기 ───────────────────────────────── */
  if (view === 'edit' && editing) {
    const e = editing;
    const set = (k: keyof Post, v: string) => setEditing({ ...e, [k]: v });
    const img = preview || e.image || '';
    const scheduledFuture = keyOf(e) > now;
    return (
      <main className="mx-auto max-w-[1180px] px-6 py-12">
        <button onClick={backToList} className="text-[14.5px] font-bold text-sun-700">← 목록으로</button>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="display-sm text-[26px] text-ink">{e.file ? '글 고치기' : '읽어 보고 올리기'}</h1>
            <p className="mt-1 text-[13.5px] text-ink-muted">
              {e.file ? `주소 /insight/blog/${e.slug} (바꿀 수 없습니다)` : e.slug ? `주소 /insight/blog/${e.slug}` : '주소는 올릴 때 자동으로 정해집니다'}
            </p>
          </div>
        </div>

        {warnings.length > 0 && (
          <div className="mt-6 rounded-2xl border border-red-300 bg-red-50 p-5 text-[14.5px] leading-[1.7] text-red-900">
            <p className="font-black">이 낱말은 의료광고 심의에 걸릴 수 있습니다: {warnings.join(', ')}</p>
            <p className="mt-1">본문에서 찾아서 다른 말로 바꿔 주세요. 그대로 올리면 병원이 책임을 집니다.</p>
          </div>
        )}
        {cautions.length > 0 && (
          <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-[14.5px] leading-[1.7] text-amber-900">
            <p className="font-black">확인해 보세요: {cautions.join(', ')}</p>
            <p className="mt-1">문맥에 따라 괜찮을 수도 있는 말입니다. &lsquo;통증이 없어도 오세요&rsquo; 는 되고 &lsquo;통증이 없는 시술&rsquo; 은 안 됩니다. 효과를 단정하는 문장이면 고쳐 주세요.</p>
          </div>
        )}
        <Msg />

        <div className="mt-8 grid gap-8 lg:grid-cols-[380px_1fr]">
          {/* 왼쪽: 사진 */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-2xl border border-hairline bg-canvas-2">
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img} alt="" className="aspect-[3/2] w-full object-cover" />
              ) : (
                <div className="flex aspect-[3/2] items-center justify-center text-[14.5px] text-ink-muted">아직 사진이 없습니다</div>
              )}
            </div>
            <div className="rounded-2xl border border-hairline bg-white p-4">
              <p className={labelCls}>사진 바꾸기</p>
              <input value={scene} onChange={(ev) => setScene(ev.target.value)} className={`${inputCls} mt-2`} placeholder="장면 한 줄 (영어·한국어 모두 됩니다)" />
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={regenImage} disabled={busy || (!server.hasOpenAI && !oaKey)} className={btnLine}>AI 로 다시 만들기</button>
                <button onClick={() => fileRef.current?.click()} disabled={busy} className={btnLine}>내 사진 올리기</button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(ev) => upload(ev.target.files?.[0])} />
              </div>
              <p className="mt-2 text-[12.5px] leading-[1.6] text-ink-muted">JPG·PNG 아무 크기나 됩니다. 사람 얼굴·치료 전후 사진은 올리지 마세요(의료법).</p>
            </div>
            <label className="block">
              <span className={labelCls}>사진 설명 · 무엇이 찍혔는지</span>
              <input value={e.imageAlt || ''} onChange={(ev) => set('imageAlt', ev.target.value)} className={`${inputCls} mt-2`} placeholder="예: 흰 상판 위의 임플란트 모형과 크라운" />
            </label>
          </aside>

          {/* 오른쪽: 글 */}
          <section className="space-y-5">
            <label className="block">
              <span className={labelCls}>제목</span>
              <input value={e.title} onChange={(ev) => set('title', ev.target.value)} className={`${inputCls} mt-2 text-[18px] font-bold`} placeholder="환자가 묻는 문장 그대로" />
            </label>
            <div className="grid gap-5 sm:grid-cols-[1fr_200px]">
              <label className="block">
                <span className={labelCls}>요약 · 검색 결과와 목록 카드에 나가는 한두 문장</span>
                <textarea value={e.summary} onChange={(ev) => set('summary', ev.target.value)} rows={3} className={`${inputCls} mt-2`} />
                <span className="mt-1 block text-[12.5px] text-ink-muted">{e.summary.length}자 · 70~160자가 좋습니다</span>
              </label>
              <label className="block">
                <span className={labelCls}>분류</span>
                <select value={e.category || ''} onChange={(ev) => set('category', ev.target.value)} className={`${inputCls} mt-2`}>
                  <option value="">고르기</option>
                  {[...new Set([...CATEGORIES, ...posts.map((p) => p.category).filter(Boolean)])].map((c) => (
                    <option key={c} value={c as string}>{c}</option>
                  ))}
                </select>
              </label>
            </div>
            <div>
              <span className={labelCls}>본문 · 보이는 그대로 사이트에 실립니다</span>
              <div className="mt-2">
                <BodyEditor value={e.html} onChange={(html) => set('html', html)} />
              </div>
            </div>
            {!e.file && (
              <details className="text-[13.5px] text-ink-muted">
                <summary className="cursor-pointer font-bold">고급 · 주소(영문) 바꾸기</summary>
                <input value={e.slug} onChange={(ev) => set('slug', ev.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} className={`${inputCls} mt-2`} placeholder="when-to-chew-after-implant" />
                <p className="mt-1">올린 뒤에는 바꿀 수 없습니다. 영문 소문자·숫자·하이픈만.</p>
              </details>
            )}
          </section>
        </div>

        {/* 아래 고정 띠: 언제 올릴까 */}
        {/* ★ 띠 배경은 본문과 다른 베이지(brand-100) — 흰 바탕에 흰 띠라 어디서 끊기는지 안 보였다(2026-09-08 오너). */}
        <div className="sticky bottom-0 mt-10 -mx-6 border-t-2 border-sun-500/40 bg-canvas-2 px-6 py-4 shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
          <div className="mx-auto flex max-w-[1180px] flex-wrap items-end gap-4">
            <label className="block">
              <span className={labelCls}>올릴 날짜</span>
              <input type="date" value={e.date} min={e.file ? undefined : todayKST()} onChange={(ev) => set('date', ev.target.value)} className={`${inputCls} mt-1.5 w-[170px]`} />
            </label>
            <label className="block">
              <span className={labelCls}>시각</span>
              <select value={e.time || '00:00'} onChange={(ev) => set('time', ev.target.value)} className={`${inputCls} mt-1.5 w-[110px]`}>
                {Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, '0')}:00`).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>
            <div className="ml-auto flex flex-wrap items-center gap-3">
              {e.file && <button onClick={() => remove(e)} disabled={busy} className="text-[14px] font-bold text-red-700">이 글 삭제</button>}
              {e.file ? (
                <button onClick={() => publish('schedule')} disabled={busy} className={btnDark}>고친 내용 저장</button>
              ) : (
                <>
                  <button onClick={() => publish('schedule')} disabled={busy || !scheduledFuture} className={btnLine} title={scheduledFuture ? '' : '날짜·시각을 지금 이후로 고르면 예약할 수 있습니다'}>
                    {scheduledFuture ? `${koDate(e.date, e.time)} 예약 발행` : '예약 발행 (미래 시각을 고르세요)'}
                  </button>
                  <button onClick={() => publish('now')} disabled={busy} className={btnDark}>지금 바로 올리기</button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ── 목록 ─────────────────────────────────────────────────── */
  return (
    <main className="mx-auto max-w-[1000px] px-6 py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-black tracking-[0.14em] text-sun-600">광화문 선치과 · 블로그 관리</p>
          <h1 className="display-sm mt-3 text-[28px] text-ink">글 {posts.length}편</h1>
          <p className="mt-1 text-[14.5px] text-ink-soft">실린 글 {stats.live} · 예약 {stats.queued} · 지금 {now.replace('T', ' ')}</p>
          {/* ★ 어느 저장소에 쓰는지 보인다 — GITHUB_REPO 를 안 넣으면 옛 저장소로 가는 사고를 눈으로 잡는다. */}
          <p className="mt-1 text-[13px] text-ink-muted">
            저장소 {server.repo || '…'} · 연결: 저장소 {server.hasServerToken ? '✓' : '✗'} · 사진 {server.hasOpenAI ? '✓' : '✗'} · 글쓰기 {server.hasGemini ? '✓' : '✗'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* ★ 무인 발행 토글 — 자동 N편 버튼 왼쪽 (2026-09-08 오너). 켜짐이면 초록 점, 다음 글 날짜를 아래 줄에. */}
          {autoCfg && (
            <div className={`flex items-center gap-3 rounded-full border-[1.5px] px-4 py-2 ${autoCfg.enabled ? 'border-green-700/50 bg-green-50' : 'border-ink/25 bg-white'}`}>
              <button
                type="button"
                role="switch"
                aria-checked={autoCfg.enabled}
                disabled={busy || !!auto?.running}
                onClick={() => toggleAuto(!autoCfg.enabled)}
                className={`relative h-[26px] w-[46px] shrink-0 rounded-full transition-colors ${autoCfg.enabled ? 'bg-green-700' : 'bg-ink/25'} disabled:opacity-40`}
                title={autoCfg.enabled ? '무인 발행 끄기' : '무인 발행 켜기'}
              >
                <span className={`absolute top-[3px] size-[20px] rounded-full bg-white shadow transition-[left] ${autoCfg.enabled ? 'left-[23px]' : 'left-[3px]'}`} />
              </button>
              <div className="leading-tight">
                <p className="text-[14px] font-black text-ink">
                  무인 발행 {autoCfg.enabled ? '켜짐' : '꺼짐'} ·{' '}
                  <select value={autoCfg.everyDays} disabled={busy} onChange={(ev) => toggleAuto(autoCfg.enabled, Number(ev.target.value))} className="bg-transparent font-black outline-none" aria-label="며칠에 한 편">
                    {[1, 2, 3, 4, 5, 7].map((d) => <option key={d} value={d}>{d}일</option>)}
                  </select>
                  에 1편
                </p>
                <p className="text-[12px] text-ink-muted">
                  {!cronReady ? '⚠️ 서버에 CRON_SECRET 이 없어 크론이 못 돕니다' : autoCfg.enabled && autoNext ? (autoNext.due ? '오늘 밤 0시에 다음 글을 만듭니다' : `${koDate(autoNext.date)} 글이 실린 날 밤에 다음 글을 만듭니다`) : '켜면 사람이 안 건드려도 이어집니다'}
                  {' · '}
                  <button type="button" onClick={runCronNow} disabled={busy || !!auto?.running} className="underline underline-offset-2 disabled:opacity-40">지금 한 편</button>
                </p>
              </div>
            </div>
          )}
          <div className="flex items-center overflow-hidden rounded-full border-[1.5px] border-ink/40">
            <select value={autoCount} onChange={(ev) => setAutoCount(Number(ev.target.value))} disabled={!!auto?.running} className="h-[44px] bg-white pl-4 pr-2 text-[15px] font-bold text-ink outline-none" aria-label="자동으로 쓸 편수">
              {AUTO_COUNTS.map((c) => <option key={c} value={c}>{c}편</option>)}
            </select>
            <button onClick={runAuto} disabled={!!auto?.running || busy} className="h-[44px] bg-white px-4 text-[15px] font-bold text-ink hover:bg-ink hover:text-white disabled:opacity-40">
              자동으로 쓰고 예약
            </button>
          </div>
          <button onClick={openNew} disabled={!!auto?.running} className={btnDark}>새 글 쓰기</button>
          <button onClick={logout} className={btnLine}>나가기</button>
        </div>
      </div>

      {(!server.hasServerToken || !server.hasOpenAI || !server.hasGemini) && (
        <div className="mt-8 rounded-2xl border border-sun-500/40 bg-sun-300/[0.07] p-5">
          <p className="text-[14.5px] font-black text-ink">서버에 키가 없습니다 — 이 브라우저에만 저장해 두고 쓸 수 있습니다</p>
          <p className="mt-1 text-[14px] leading-[1.7] text-ink-soft">
            정석은 Vercel 프로젝트의 Environment Variables 에 <code>GITHUB_TOKEN</code>
            {!server.hasOpenAI && <> · <code>OPENAI_API_KEY</code></>}
            {!server.hasGemini && <> · <code>GEMINI_API_KEY</code></>} 를 넣고 Redeploy 하는 것입니다. 그러면 아래 칸은 필요 없습니다.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {!server.hasServerToken && <input type="password" value={ghToken} onChange={(ev) => setGhToken(ev.target.value)} className={inputCls} placeholder="GitHub 토큰 (github_pat_…)" />}
            {!server.hasOpenAI && <input type="password" value={oaKey} onChange={(ev) => setOaKey(ev.target.value)} className={inputCls} placeholder="OpenAI 키 (sk-…) — 사진용" />}
            {!server.hasGemini && <input type="password" value={gmKey} onChange={(ev) => setGmKey(ev.target.value)} className={inputCls} placeholder="Gemini 키 (AIza…) — 글쓰기용" />}
          </div>
          <button onClick={saveKeys} className={`${btnLine} mt-4`}>저장하고 다시 불러오기</button>
        </div>
      )}

      <Msg />

      {autoCfg?.last && (
        <p className="mt-6 rounded-xl bg-canvas-2 px-4 py-3 text-[13.5px] leading-[1.7] text-ink-soft">
          무인 발행 마지막 기록 · {autoCfg.last.at} — {autoCfg.last.result}
        </p>
      )}

      {auto && (auto.running || auto.done.length > 0 || auto.skipped.length > 0) && (
        <div className="mt-8 rounded-2xl border border-hairline bg-white p-5">
          {auto.running ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-block size-3 animate-pulse rounded-full bg-sun-500" />
              <p className="min-w-0 flex-1 text-[15px] font-bold text-ink">{auto.step}</p>
              <button onClick={() => { stopRef.current = true; setAuto((a) => (a ? { ...a, step: '지금 글까지 마치고 멈춥니다…' } : a)); }} className="text-[14px] font-bold text-red-700">중단</button>
            </div>
          ) : (
            <p className="text-[15px] font-bold text-ink">자동 쓰기 결과</p>
          )}
          {auto.running && <p className="mt-2 text-[13.5px] text-ink-soft">이 탭을 닫지 마세요. 전부 만든 뒤 한 번에 예약합니다.</p>}
          {auto.done.length > 0 && (
            <ul className="mt-3 space-y-1 text-[14px] text-ink">
              {auto.done.map((d) => <li key={d.title}>✓ {koDate(d.date)} · {d.title}</li>)}
            </ul>
          )}
          {auto.skipped.length > 0 && (
            <ul className="mt-3 space-y-1 text-[13.5px] text-red-800">
              {auto.skipped.map((s) => <li key={s}>건너뜀 · {s}</li>)}
            </ul>
          )}
          {!auto.running && <button onClick={() => setAuto(null)} className="mt-3 text-[13.5px] font-bold text-ink-muted underline underline-offset-2">닫기</button>}
        </div>
      )}

      <ul className="mt-8 divide-y divide-brand-200/70 border-t border-hairline">
        {posts.map((p) => {
          const live = keyOf(p) <= now;
          return (
            <li key={p.file || p.slug} className="flex flex-wrap items-center gap-x-5 gap-y-2 py-4">
              <span className={`w-[52px] rounded-full px-2 py-0.5 text-center text-[12.5px] font-black ${live ? 'bg-green-100 text-green-800' : 'bg-canvas-2 text-sun-700'}`}>
                {live ? '실림' : '예약'}
              </span>
              <span className="w-[150px] text-[14.5px] tabular-nums text-ink-soft">{koDate(p.date, p.time)}</span>
              <button onClick={() => openEdit(p)} className="min-w-0 flex-1 truncate text-left text-[16px] font-bold text-ink hover:text-sun-700">{p.title}</button>
              <span className="text-[13.5px] text-ink-muted">{p.category}</span>
              {live && <a href={`/insight/blog/${p.slug}`} target="_blank" rel="noreferrer" className="text-[14px] font-bold text-sun-700">보기</a>}
              <button onClick={() => openEdit(p)} className="text-[14px] font-bold text-ink">고치기</button>
            </li>
          );
        })}
        {posts.length === 0 && !busy && <li className="py-10 text-center text-[15px] text-ink-soft">아직 글이 없습니다. '새 글 쓰기' 로 시작하세요.</li>}
      </ul>

      {/*
        ★ 중앙(winaid)에서 오는 글 (2026-09-08 오너: "중앙에서 올린 거 admin 에서 삭제 못 해?")
          이 글들은 우리 저장소에 없다 — 사이트가 그릴 때 API 로 받는다(lib/insightFeed.ts). 그래서 '지우기' 는
          없고 '숨기기' 만 있다. 고치기·사진·발행 취소는 중앙 관리자에서. 숨김은 목록·상세·사이트맵에 함께 적용된다.
      */}
      {central && central.items.length > 0 && (
        <section className="mt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-[18px] font-black text-ink">중앙(winaid)에서 오는 글 {central.items.length}편</h2>
            <p className="text-[13px] text-ink-muted">여기서는 숨기기만 됩니다. 글을 고치거나 지우는 건 중앙에서.</p>
          </div>
          <ul className="mt-4 divide-y divide-brand-200/70 border-t border-hairline">
            {central.items.map((c) => {
              const k = new Date(new Date(c.published_at).getTime() + 9 * 3600 * 1000).toISOString();
              return (
                <li key={c.slug} className="flex flex-wrap items-center gap-x-5 gap-y-2 py-4">
                  <span className={`w-[52px] rounded-full px-2 py-0.5 text-center text-[12.5px] font-black ${c.hidden ? 'bg-ink/10 text-ink-muted' : 'bg-green-100 text-green-800'}`}>
                    {c.hidden ? '숨김' : '실림'}
                  </span>
                  <span className="w-[150px] text-[14.5px] tabular-nums text-ink-soft">{koDate(k.slice(0, 10), k.slice(11, 16))}</span>
                  <span className={`min-w-0 flex-1 truncate text-[16px] font-bold ${c.hidden ? 'text-ink-muted line-through' : 'text-ink'}`}>{c.title}</span>
                  <span className="text-[13.5px] text-ink-muted">{c.post_type === 'column' ? '칼럼' : '블로그'}{c.hasCover ? '' : ' · 사진 없음'}</span>
                  {!c.hidden && <a href={`/insight/blog/${c.slug}`} target="_blank" rel="noreferrer" className="text-[14px] font-bold text-sun-700">보기</a>}
                  <button onClick={() => toggleCentral(c.slug, !c.hidden)} disabled={busy} className={`text-[14px] font-bold ${c.hidden ? 'text-ink' : 'text-red-700'} disabled:opacity-40`}>
                    {c.hidden ? '다시 보이기' : '숨기기'}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-[13px] leading-[1.7] text-ink-muted">숨기면 저장소에 기록되고 1~2분 뒤 사이트에서 빠집니다(목록·상세·사이트맵 모두). 중앙 쪽 데이터는 그대로라 다시 보이기도 됩니다. 사진이 없는 글은 중앙에서 사진을 붙이면 저절로 따라옵니다.</p>
        </section>
      )}

      <details className="mt-12 rounded-2xl border border-hairline bg-white p-5 text-[14.5px] leading-[1.85] text-ink">
        <summary className="cursor-pointer text-[15px] font-black">처음이라면 · 사용법</summary>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5">
          <li><strong>새 글 쓰기</strong> → 환자가 묻는 말을 한 줄 적고 <strong>초안 만들기</strong>. 1~2분 기다리면 글과 사진이 함께 준비됩니다.</li>
          <li>검토 화면에서 <strong>끝까지 읽습니다.</strong> 원장님 말투나 병원 사정과 다른 곳을 고치세요. 빨간 경고가 있으면 그 낱말은 꼭 바꿉니다.</li>
          <li>사진이 별로면 장면을 고쳐 <strong>AI 로 다시 만들기</strong>, 또는 <strong>내 사진 올리기</strong>. 사진 설명 칸은 사진과 맞게.</li>
          <li><strong>지금 바로 올리기</strong> 또는 날짜·시각을 골라 <strong>예약 발행</strong>. 한 달 10편이면 3일 간격이 좋습니다.</li>
          <li><strong>무인 발행</strong> 토글을 켜 두면 사람이 아무것도 안 해도 며칠에 한 편씩 만들어 예약됩니다(매일 밤 0시에 확인). 감수까지 거치지만 완벽하지는 않으니 목록을 가끔 훑어봐 주세요. 예약된 글은 실리기 전에 '고치기' 로 읽고 고칠 수 있습니다.</li>
          <li>한꺼번에 하려면 <strong>자동으로 쓰고 예약</strong> — 편수를 고르면 주제부터 사진까지 만들어 3일 간격으로 예약합니다. 의료법 낱말이 걸린 글은 건너뛰고 사유를 보여 줍니다. 예약된 글은 실리기 전에 '고치기' 로 읽어 보세요.</li>
          <li>올린 글은 2~3분 뒤 사이트에 보입니다. 예약 글은 그 시각이 지나면 저절로 실립니다.</li>
        </ol>
        <p className="mt-3 font-black">하지 말 것</p>
        <p>치료 후기·전후 사진·'최고/유일/완벽' 같은 표현은 의료법 위반입니다. 사이트에 이미 있는 주제(증상·시술·비용 페이지)를 통째로 다시 쓰지 마세요. 올린 글의 주소(영문)는 바꾸지 마세요.</p>
      </details>
    </main>
  );
}
