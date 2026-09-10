/**
 * 폴더 → zip. 넷리파이·윈도우 탐색기·맥 모두에서 열리는 표준 zip 을 만든다.
 *
 * ★ 왜 직접 만드나
 *   - PowerShell 의 Compress-Archive 는 경로 구분자를 역슬래시로 적어 넷리파이가 폴더 구조를 못 읽는다.
 *   - Git Bash 의 tar 는 zip 을 만들 수 있지만 .NET·탐색기가 못 여는 형식이 나온다(스트리밍 헤더).
 *   그래서 표준대로(로컬 헤더 + 중앙 디렉터리 + EOCD, 경로는 슬래시) 직접 적는다.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const dosTime = (d) => ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)) & 0xffff;
const dosDate = (d) => (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xffff;

function walk(dir, base = dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p, base));
    else out.push({ abs: p, rel: path.relative(base, p).split(path.sep).join('/') });
  }
  return out;
}

/** srcDir 안의 내용을 zip 파일 하나로 묶는다(폴더 자체는 넣지 않는다 — 압축을 풀면 index.html 이 바로 나온다) */
export function zipDir(srcDir, zipPath) {
  const files = walk(srcDir);
  const chunks = [];
  const central = [];
  let offset = 0;

  for (const f of files) {
    const data = fs.readFileSync(f.abs);
    const crc = zlib.crc32(data);
    const deflated = zlib.deflateRawSync(data, { level: 9 });
    const useDeflate = deflated.length < data.length;
    const body = useDeflate ? deflated : data;
    const name = Buffer.from(f.rel, 'utf8');
    const st = fs.statSync(f.abs);
    const t = dosTime(st.mtime);
    const d = dosDate(st.mtime);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4); // version needed
    local.writeUInt16LE(0x0800, 6); // UTF-8 이름
    local.writeUInt16LE(useDeflate ? 8 : 0, 8);
    local.writeUInt16LE(t, 10);
    local.writeUInt16LE(d, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    chunks.push(local, name, body);

    const cen = Buffer.alloc(46);
    cen.writeUInt32LE(0x02014b50, 0);
    cen.writeUInt16LE(20, 4); // version made by
    cen.writeUInt16LE(20, 6);
    cen.writeUInt16LE(0x0800, 8);
    cen.writeUInt16LE(useDeflate ? 8 : 0, 10);
    cen.writeUInt16LE(t, 12);
    cen.writeUInt16LE(d, 14);
    cen.writeUInt32LE(crc, 16);
    cen.writeUInt32LE(body.length, 20);
    cen.writeUInt32LE(data.length, 24);
    cen.writeUInt16LE(name.length, 28);
    cen.writeUInt32LE(0, 38); // external attrs
    cen.writeUInt32LE(offset, 42);
    central.push(cen, name);

    offset += local.length + name.length + body.length;
  }

  const centralBuf = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(offset, 16);

  fs.writeFileSync(zipPath, Buffer.concat([...chunks, centralBuf, end]));
  return { files: files.length, bytes: fs.statSync(zipPath).size };
}
