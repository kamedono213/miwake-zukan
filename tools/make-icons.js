// PWA用アイコン(PNG)を外部ライブラリなしで描く。緑の地に虫めがねと黄色のひし形。
// 出力: app/icons/icon-192.png, icon-512.png, maskable-512.png, apple-touch-icon.png
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

function crc32(buf) { let c, crc = 0xffffffff; for (let n = 0; n < buf.length; n++) { c = (crc ^ buf[n]) & 0xff; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crc = (crc >>> 8) ^ c; } return (crc ^ 0xffffffff) >>> 0; }
function chunk(type, data) { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td)); return Buffer.concat([len, td, crc]); }
function png(w, h, px) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) px.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const BG = hex('#1f7a5a'), Y = hex('#ffd34d'), K = hex('#23262f'), W = hex('#ffffff'), G = hex('#cfe9de');
function draw(size, pad) {
  const S = 4, px = Buffer.alloc(size * size * 4), sc = 1 - 2 * pad, u = v => v * sc + pad;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const acc = [0, 0, 0];
    for (let sy = 0; sy < S; sy++) for (let sx = 0; sx < S; sx++) {
      const fx = (x + (sx + 0.5) / S) / size, fy = (y + (sy + 0.5) / S) / size;
      let col = BG;
      const cx = u(0.42), cy = u(0.42), dx = fx - cx, dy = fy - cy, r = Math.hypot(dx, dy) / sc;
      // 虫めがねの柄
      const t = ((fx - u(0.6)) + (fy - u(0.6))) / Math.SQRT2 / sc, n = ((fx - u(0.6)) - (fy - u(0.6))) / Math.SQRT2 / sc;
      if (t > 0 && t < 0.3 && Math.abs(n) < 0.055) col = K;
      if (r < 0.27) col = G;
      if (r >= 0.24 && r < 0.29) col = W;
      // レンズの中に黄色のひし形(警戒標識)
      if (Math.abs(dx) / sc + Math.abs(dy) / sc < 0.15) col = Y;
      if (Math.abs(dx) / sc + Math.abs(dy) / sc < 0.15 && Math.abs(Math.abs(dx) / sc + Math.abs(dy) / sc - 0.13) < 0.012) col = K;
      acc[0] += col[0]; acc[1] += col[1]; acc[2] += col[2];
    }
    const i = (y * size + x) * 4; px[i] = acc[0] / 16; px[i + 1] = acc[1] / 16; px[i + 2] = acc[2] / 16; px[i + 3] = 255;
  }
  return png(size, size, px);
}
const out = path.join(__dirname, '../app/icons');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'icon-192.png'), draw(192, 0.03));
fs.writeFileSync(path.join(out, 'icon-512.png'), draw(512, 0.03));
fs.writeFileSync(path.join(out, 'maskable-512.png'), draw(512, 0.14));
fs.writeFileSync(path.join(out, 'apple-touch-icon.png'), draw(180, 0.05));
console.log('icons written');
