/**
 * 넷리파이(Netlify) 에 올릴 정적 파일 묶음 만들기 — 담당자에게 zip 하나로 전달하는 용도.
 *
 * 하는 일
 *  1) 서버가 필요한 부분(관리자 화면·API·크론)을 잠깐 치운다 — 정적 내보내기에서는 동작하지 않는다.
 *  2) llms.txt 는 라우트 대신 파일로 굽는다.
 *  3) 옛 주소 301 과 보안 헤더를 넷리파이 형식(_redirects · _headers)으로 적는다.
 *  4) next.config 를 output:'export' 로 바꿔 빌드 → out/ 생성.
 *  5) out/ 을 zip 으로 묶고, 치운 파일과 설정을 **원래대로 되돌린다**.
 *
 * ⚠️ 이 스크립트는 소스를 잠깐 고쳤다가 되돌린다. 반드시 커밋이 깨끗한 상태에서 실행한다.
 * 실행:  node scripts/handoff-export.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { zipDir } from './zipDir.mjs';

const ROOT = process.cwd();
const STASH = path.join(ROOT, '.handoff-stash');
const STAMP = new Date().toISOString().slice(0, 10);
const TMP_ZIP = '/c/tmp/sun-site.zip'; /* 한글 이름을 셸에 넘기면 깨진다 — 임시로 영문 이름에 만들고 마지막에 복사 */
const OUT_ZIP = 'C:/Users/FORYOUCOM/Desktop/광화문선치과_홈페이지_' + STAMP + '.zip';

/* 정적 내보내기에서 못 쓰는 것들 — 라우트 핸들러와 서버 화면. robots·sitemap 은 라이브에서 받아 파일로 굽는다 */
const MOVE = ['app/api', 'app/admin', 'app/llms.txt', 'app/robots.ts', 'app/sitemap.ts'];
const OLD_SITE = [
  ['/index.html', '/'],
  ['/dental-introduction.html', '/about'],
  ['/implant.html', '/treatment/implant'],
  ['/jaw-joint-treatment.html', '/treatment/tmj'],
  ['/makingteeth.html', '/treatment/aesthetic'],
  ['/dentures.html', '/treatment/insurance'],
  ['/wisdomteeth.html', '/treatment/wisdom-tooth'],
  ['/toothsaving.html', '/treatment/natural-tooth'],
  ['/anesthetic.html', '/treatment/painless'],
];
const CONVENTIONAL = [
  ['/service', '/treatment'],
  ['/services', '/treatment'],
  ['/clinic', '/about'],
  ['/location', '/visit'],
  ['/contact', '/visit'],
  ['/doctors', '/about/doctors'],
  ['/implant', '/treatment/implant'],
  ['/tmj', '/treatment/tmj'],
  ['/treatment/tmj/symptoms', '/treatment/tmj#symptoms'],
  ['/treatment/tmj/treatments', '/treatment/tmj#treatments'],
];

const EXPORT_CONFIG = `import type { NextConfig } from 'next';

/* 담당자 전달용 정적 내보내기 설정 — scripts/handoff-export.mjs 가 잠깐 넣었다 뺀다. 손으로 고치지 말 것. */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  outputFileTracingRoot: __dirname,
  output: 'export',
  images: { unoptimized: true },
};

export default nextConfig;
`;

const rm = (p) => fs.existsSync(p) && fs.rmSync(p, { recursive: true, force: true });

function restore() {
  for (const rel of MOVE) {
    const from = path.join(STASH, rel.replace(/[\\/]/g, '__'));
    if (fs.existsSync(from)) {
      fs.mkdirSync(path.dirname(path.join(ROOT, rel)), { recursive: true });
      rm(path.join(ROOT, rel));
      fs.renameSync(from, path.join(ROOT, rel));
    }
  }
  const cfg = path.join(STASH, 'next.config.ts');
  if (fs.existsSync(cfg)) fs.renameSync(cfg, path.join(ROOT, 'next.config.ts'));
  rm(path.join(ROOT, 'public/_redirects'));
  rm(path.join(ROOT, 'public/_headers'));
  for (const name of ['llms.txt', 'robots.txt', 'sitemap.xml']) rm(path.join(ROOT, 'public', name));
  rm(STASH);
}

try {
  rm(STASH);
  fs.mkdirSync(STASH, { recursive: true });

  // 1) 서버가 필요한 부분 잠깐 치우기
  for (const rel of MOVE) {
    const src = path.join(ROOT, rel);
    if (fs.existsSync(src)) fs.renameSync(src, path.join(STASH, rel.replace(/[\\/]/g, '__')));
  }

  // 2) llms.txt · robots.txt · sitemap.xml 을 파일로 (라이브에서 그대로 가져온다)
  for (const name of ['llms.txt', 'robots.txt', 'sitemap.xml']) {
    const res = await fetch('https://dentalsun-cyan.vercel.app/' + name);
    if (!res.ok) throw new Error(name + ' 가져오기 실패 ' + res.status);
    fs.writeFileSync(path.join(ROOT, 'public', name), await res.text(), 'utf8');
  }

  // 3) 넷리파이 형식의 주소 넘김·헤더
  const redirects = [
    '# 옛 홈페이지 주소 → 새 주소 (301). 색인·외부 링크가 끊기지 않게 한다.',
    ...OLD_SITE.map(([f, t]) => `${f}  ${t}  301!`),
    ...CONVENTIONAL.map(([f, t]) => `${f}  ${t}  301`),
  ].join('\n');
  fs.writeFileSync(path.join(ROOT, 'public/_redirects'), redirects + '\n', 'utf8');
  fs.writeFileSync(
    path.join(ROOT, 'public/_headers'),
    `/*\n  Strict-Transport-Security: max-age=63072000; includeSubDomains\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: SAMEORIGIN\n  Permissions-Policy: camera=(), microphone=(), payment=(), usb=()\n\n/llms.txt\n  Content-Type: text/plain; charset=utf-8\n`,
    'utf8',
  );

  // 4) 설정 바꾸고 빌드
  fs.renameSync(path.join(ROOT, 'next.config.ts'), path.join(STASH, 'next.config.ts'));
  fs.writeFileSync(path.join(ROOT, 'next.config.ts'), EXPORT_CONFIG, 'utf8');
  rm(path.join(ROOT, '.next'));
  rm(path.join(ROOT, 'out'));
  execSync('npm run build', { stdio: 'inherit' });

  // 5) zip — 표준 zip 으로 직접 적는다(scripts/zipDir.mjs). PowerShell·tar 로 만든 zip 은 넷리파이·탐색기가 못 읽었다
  rm(OUT_ZIP);
  const z = zipDir(path.join(ROOT, 'out'), OUT_ZIP);
  console.log('zip', z.files, '개 파일');
  const mb = (z.bytes / 1024 / 1024).toFixed(1);
  const count = (dir) => fs.readdirSync(dir, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? count(path.join(dir, e.name)) : e.name.endsWith('.html') ? 1 : 0), 0);
  const pages = count(path.join(ROOT, 'out'));
  console.log(`\n완료 — ${OUT_ZIP} (${mb}MB, HTML ${pages}장)`);
} finally {
  restore();
  console.log('원래 상태로 되돌렸습니다.');
}
