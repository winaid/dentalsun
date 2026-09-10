/**
 * 의료진 사진 배경 지우기(누끼) — 진료실 배경만 걷어 내고 사람은 원본 그대로 둔다.
 *
 * ★ AI 로 사람을 다시 그리지 않는다. 실제 의료인 사진을 재생성하면 얼굴·표정이 달라진다(허위 표시).
 *   여기서는 배경 분리 모델(@imgly/background-removal, ISNet)만 쓰고 사람 픽셀은 손대지 않는다.
 * ★ 이 PC 에서는 node 판(@imgly/background-removal-node)이 onnxruntime 세그폴트로 죽어서
 *   크로미움(WASM) 안에서 돌린다. 실행 전 playwright 가 필요하다:  npm i -D playwright
 *   모델은 jsdelivr 에서 받으므로 인터넷이 있어야 한다.
 *
 * 실행:  node scripts/doctor-cutout.mjs
 * 결과:  public/img/doctors/{이름}-cut.webp (투명 배경)
 */
import { chromium } from 'playwright';
import sharp from 'sharp';

const JOBS = [{ src: 'public/img/doctors/yang.webp', out: 'public/img/doctors/yang-cut.webp' }];

const browser = await chromium.launch();
const page = await browser.newPage();
page.on('console', (m) => console.log('[page]', m.text().slice(0, 160)));
await page.goto('https://cdn.jsdelivr.net/', { waitUntil: 'domcontentloaded' });

for (const job of JOBS) {
  const t0 = Date.now();
  // 화면에서 쓰는 480px 의 2.5배면 충분하다 — 원본을 통째로 넣으면 느리다
  const png = await sharp(job.src).resize({ width: 1200, withoutEnlargement: true }).png().toBuffer();
  const b64 = await page.evaluate(async (url) => {
    const mod = await import('https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.5/+esm');
    const blob = await mod.removeBackground(url, { output: { format: 'image/png', quality: 1 } });
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  }, `data:image/png;base64,${png.toString('base64')}`);

  // 남은 투명 여백을 잘라 내 화면에서 크게 쓸 수 있게 한다
  await sharp(Buffer.from(b64, 'base64')).trim({ threshold: 1 }).webp({ quality: 88, alphaQuality: 90 }).toFile(job.out);
  const m = await sharp(job.out).metadata();
  console.log(job.out, `${m.width}x${m.height}`, `${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

await browser.close();
