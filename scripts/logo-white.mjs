/**
 * 어두운 배경(첫 화면 위)에 얹을 로고 — 남색 글자만 흰색으로 바꾼다.
 *
 * ★ 해 마크(주황)와 그 안의 흰 글자는 그대로 둔다. 모양·비율은 손대지 않는다.
 * ★ 마크 아래의 옅은 회색 '반사 그림자'는 지운다 — 흰 바탕에서는 안 보이지만
 *   어두운 바탕에서는 흰 덩어리처럼 떠 보인다(오너 화면에서 확인).
 */
import sharp from 'sharp';

const SRC = 'public/img/brand/logo.png';
const OUT = 'public/img/brand/logo-white.png';

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height } = info;
const at = (x, y) => (y * width + x) * 4;

// 1) 해 마크(주황)가 어디까지인지 찾는다
let markRight = 0;
let markBottom = 0;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = at(x, y);
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
    if (a > 200 && r > 200 && g > 80 && g < 200 && b < 100) {
      if (x > markRight) markRight = x;
      if (y > markBottom) markBottom = y;
    }
  }
}

// 2) 남색 글자 → 흰색 / 마크 아래 반사 그림자 → 투명
let recolored = 0;
let cleared = 0;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = at(x, y);
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
    if (a < 8) continue;
    if (x <= markRight && y > markBottom) {
      data[i + 3] = 0;
      cleared++;
      continue;
    }
    // 남색(29,50,112) 계열만 — 파랑이 빨강보다 확실히 세고 어두운 픽셀
    if (b - r > 45 && r < 130) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      recolored++;
    }
  }
}

await sharp(data, { raw: { width, height, channels: 4 } }).png().toFile(OUT);
console.log('logo-white', `${width}x${height}`, 'mark', `${markRight}x${markBottom}`, 'recolored', recolored, 'cleared', cleared);
