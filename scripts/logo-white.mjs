/**
 * 어두운 배경(첫 화면 위)에 얹을 로고 — 남색 글자만 흰색으로 바꾼다.
 * 해 마크(주황)와 그 안의 흰 글자는 그대로 둔다. 모양·비율은 손대지 않는다.
 */
import sharp from 'sharp';

const SRC = 'public/img/brand/logo.png';
const OUT = 'public/img/brand/logo-white.png';

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
let changed = 0;
for (let i = 0; i < data.length; i += 4) {
  const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
  if (a < 8) continue;
  // 남색(29,50,112) 계열 — 파랑이 가장 세고 전체적으로 어두운 픽셀
  if (b > r && b > 60 && r < 150 && g < 150) {
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
    changed++;
  }
}
await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toFile(OUT);
console.log('logo-white', `${info.width}x${info.height}`, 'recolored', changed);
