/*
 * 쪽마다 **실제로 본문이 바뀐 날**을 git 에서 뽑아 lib/contentModified.generated.json 에 적는다.
 *
 * ★★ 왜 필요한가 (2026-09-07 실측) ★★
 *   dateModified 가 117쪽 전부 2026-08-18 로 굳어 있었다. 그런데 그 뒤로 심미보철·임플란트
 *   재수술·증상 묶음·인사이트 허브가 통째로 다시 쓰였다. 3주 전 날짜를 달고 나가는 것은
 *   신선도 신호를 버리는 일이자, 무엇보다 **사실이 아니다**.
 *
 * ★★ 왜 그냥 커밋 날짜를 쓰지 않는가 ★★
 *   lib/contentMeta.ts 의 경고가 옳다 — 오탈자·클래스 이름 수정 커밋까지 '내용 갱신' 으로
 *   잡히면 날짜가 부풀고, 부푼 날짜는 없는 날짜보다 나쁘다.
 *   그래서 **한글 글자가 실제로 바뀐 커밋만** 센다. 스타일·클래스·리팩터 커밋은 한글
 *   문자열을 건드리지 않으므로 저절로 걸러진다. (검사: git log -G'[가-힣]')
 *
 * ★ 빌드 때가 아니라 **여기서 한 번** 계산해 파일로 남긴다 — 배포 환경의 git 히스토리가
 *   얕게 복제되어 있어도 안전하고, 결과가 커밋에 남아 사람이 검토할 수 있다.
 *
 * 쓰는 법:  node scripts/contentDates.mjs
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SITE_PUBLISHED = '2026-08-10';

/** 그 파일에서 **한글이 바뀐** 마지막 커밋 날짜. 없으면 null. */
function lastKoreanChange(file) {
  try {
    const out = execSync(`git log -1 --format=%cs -G"[가-힣]" -- "${file}"`, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return out || null;
  } catch {
    return null;
  }
}

/** 그 파일이 같은 저장소 안에서 가져다 쓰는 파일들(한 단계). */
function localImports(file) {
  if (!fs.existsSync(file)) return [];
  const src = fs.readFileSync(file, 'utf8');
  const out = [];
  /* ⚠️ components 는 제외한다 — 공용 UI 는 그 쪽의 **본문**이 아니다. 주석 한 줄만 고쳐도
     사이트 전체 날짜가 같이 올라가 하루로 뭉개진다(2026-09-07 실측: 서로 다른 날짜 2개).*/
  for (const m of src.matchAll(/from\s+'@\/(lib)\/([^']+)'/g)) {
    for (const ext of ['.ts', '.tsx']) {
      const p = path.join(ROOT, m[1], m[2] + ext);
      if (fs.existsSync(p)) out.push(path.relative(ROOT, p).replace(/\\/g, '/'));
    }
  }
  return out;
}

/** 주소 → 그 쪽을 이루는 소스 파일들. 동적 구간은 [xxx] 폴더로 되돌린다. */
function sourcesFor(url) {
  const seg = url.split('/').filter(Boolean);
  const cands = [];
  // 정적 경로 그대로
  cands.push(path.join('app', ...seg, 'page.tsx'));
  // 마지막 조각이 동적일 때 — 실제 폴더를 뒤져 [..] 를 찾는다
  for (let i = seg.length; i > 0; i--) {
    const dir = path.join(ROOT, 'app', ...seg.slice(0, i - 1));
    if (!fs.existsSync(dir)) continue;
    const dyn = fs.readdirSync(dir).find((d) => d.startsWith('[') && d.endsWith(']'));
    if (dyn) cands.push(path.join('app', ...seg.slice(0, i - 1), dyn, 'page.tsx'));
  }
  const files = cands.filter((c) => fs.existsSync(path.join(ROOT, c)));
  if (!files.length) return [];
  const first = files[0].replace(/\\/g, '/');
  // 그 쪽이 쓰는 데이터 파일도 본문이다 — 글이 거기 들어 있다.
  // ★ 2026-11-03: 공용 lib(clinic·seo·docs 등)까지 세면 그날 하나만 고쳐도 73쪽 날짜가 같이 올라 두 날짜로 뭉개졌다 →
  //   그 쪽만의 파일(정적 쪽의 page.tsx · 본문 파일 · 전용 화면)만 센다. 여러 쪽이 함께 쓰는 동적 page.tsx([...slug] 등)는 뺀다.
  return [...(first.includes('[') ? [] : [first]), ...contentSources(url)];
}

// ★ 2026-11-03 SEO 점검: 생성 파일이 {} 로 비어 73쪽 전부 2026-09-08 로 나갔다(아래 주석 속 sed 식의 별표+빗금이
//   주석을 일찍 닫아 이 스크립트가 처음부터 문법 오류였다). 게다가 진료·인사이트 쪽 본문은 app/ 가 아니라
//   lib/content/*.ts 에 있고 '@/lib/content' 는 폴더라 localImports 가 못 찾았다. 그 쪽의 **본문 파일**과
//   **그 쪽 전용 화면**을 함께 본다. 공용 화면(DocPage·heroCollage 등)은 여전히 뺀다 — 하나 고치면 전 쪽 날짜가 오른다.
const CONTENT_DIR = path.join(ROOT, 'lib/content');
function contentSources(url) {
  const out = [];
  for (const f of fs.readdirSync(CONTENT_DIR)) {
    if (!f.endsWith('.ts') || f === 'index.ts') continue;
    const src = fs.readFileSync(path.join(CONTENT_DIR, f), 'utf8');
    // path: '/주소' 또는 const HUB = '/주소' … path: HUB 꼴 둘 다
    const consts = [...src.matchAll(/const (\w+) = '([^']+)'/g)].filter((m) => m[2] === url).map((m) => m[1]);
    if (src.includes(`path: '${url}'`) || consts.some((c) => src.includes(`path: ${c},`))) out.push(`lib/content/${f}`);
  }
  if (url.startsWith('/treatment/tmj')) out.push('components/TmjPage.tsx', 'lib/content/tmjLanding.ts', 'lib/content/tmj.ts');
  if (url === '/treatment/implant/navigation' || url === '/treatment/implant/custom') out.push('components/CustomImplantPage.tsx', 'lib/content/customImplantLanding.ts');
  if (url === '/') out.push('components/HomeHero.tsx');
  if (url === '/about/doctors') out.push('lib/doctors.ts');
  if (url === '/faq') out.push('lib/faq.ts');
  if (url.startsWith('/insight/clinical/') || url.startsWith('/insight/blog/')) out.push(...fs.readdirSync(path.join(ROOT, url.startsWith('/insight/clinical/') ? 'content/clinical' : 'content/blog')).filter((n) => n.endsWith(url.split('/').pop() + '.json')).map((n) => (url.startsWith('/insight/clinical/') ? 'content/clinical/' : 'content/blog/') + n));
  return out.filter((f) => fs.existsSync(path.join(ROOT, f)));
}

/*
 * 대상 주소 목록.
 *   ① _urls.txt 가 있으면 그것을 쓴다 (사이트맵에서 뽑는다):
 *      사이트맵의 loc 값에서 도메인을 뗀 경로를 한 줄에 하나씩 (홈은 '/')
 *   ② 없으면 지난번 결과의 주소를 그대로 다시 잰다 — 쪽이 늘지 않았다면 이것으로 충분하다.
 * ⚠️ 쪽을 새로 만들었으면 ① 로 목록을 갱신할 것. 안 그러면 새 쪽만 날짜가 안 붙는다.
 */
const listFile = path.join(ROOT, '_urls.txt');
const prevFile = path.join(ROOT, 'lib/contentModified.generated.json');
const urls = fs.existsSync(listFile)
  ? fs.readFileSync(listFile, 'utf8').trim().split('\n').map((s) => s.trim()).filter(Boolean)
  : Object.keys(JSON.parse(fs.readFileSync(prevFile, 'utf8')));

const out = {};
for (const u of urls) {
  const files = sourcesFor(u);
  if (!files.length) continue;
  const dates = files.map(lastKoreanChange).filter(Boolean).sort();
  const modified = dates[dates.length - 1];
  if (modified && modified > SITE_PUBLISHED) out[u] = modified;
}

const sorted = Object.fromEntries(Object.entries(out).sort());
fs.writeFileSync(
  path.join(ROOT, 'lib/contentModified.generated.json'),
  JSON.stringify(sorted, null, 1) + '\n',
);

const spread = [...new Set(Object.values(sorted))].sort();
console.log(`${Object.keys(sorted).length}쪽 기록. 서로 다른 날짜 ${spread.length}개`);
console.log(spread.join(' '));
