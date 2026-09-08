import sharp from 'sharp';
for (const f of process.argv.slice(2)) {
  const src = `C:/tmp/sun-shots/${f}.png`;
  const m = await sharp(src).metadata();
  const H = 2000;
  let n = 0;
  for (let top = 0; top < m.height; top += H) {
    const h = Math.min(H, m.height - top);
    await sharp(src).extract({ left: 0, top, width: m.width, height: h }).jpeg({ quality: 78 }).toFile(`C:/tmp/sun-shots/${f}_s${++n}.jpg`);
  }
  console.log(f, m.width, m.height, n);
}
