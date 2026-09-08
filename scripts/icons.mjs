// 파비콘 — 로고의 해 마크를 흰 바탕 위에 올린다 (iOS 는 투명 영역을 검게 채우므로 흰 바탕 필수).
import sharp from 'sharp';
const m = 'public/img/brand/mark.png';
const white = { r: 255, g: 255, b: 255, alpha: 1 };
const mark512 = await sharp(m).resize({ width: 400, height: 400, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: white } }).composite([{ input: mark512, left: 56, top: 56 }]).png().toFile('app/icon.png');
const mark180 = await sharp(m).resize({ width: 132, height: 132, fit: 'contain', background: white }).png().toBuffer();
await sharp({ create: { width: 180, height: 180, channels: 4, background: white } }).composite([{ input: mark180, left: 24, top: 24 }]).png().toFile('app/apple-icon.png');
console.log('icons ok');
