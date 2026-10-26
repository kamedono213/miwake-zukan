// Commons から画像を取ってきて app/img/ に保存し、ライセンス・作者を app/data.js に書き出す。
// 使ってよいライセンス(パブリックドメイン、CC0、CC BY、CC BY-SA)だけを採用し、それ以外は止める。
// 実行: node tools/fetch-images.js
const fs = require('fs');
const path = require('path');
const SRC = require('./items');
const UA = { 'User-Agent': 'onze-miwake/1.0 (kamedono213 github; contact via github)' };
const OUT = path.join(__dirname, '../app');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const OK_LICENSE = /^(Public domain|PD|CC0|CC BY(-SA)? [0-9.]+( [a-z]+)?)$/i;

async function getJson(u) {
  for (let i = 0; i < 6; i++) {
    const t = await (await fetch(u, { headers: UA })).text();
    if (t.startsWith('{')) return JSON.parse(t);
    await sleep(15000);
  }
  throw new Error('Commons API rate limit');
}
async function getBin(u) {
  for (let i = 0; i < 6; i++) {
    const r = await fetch(u, { headers: UA });
    if (r.ok) return Buffer.from(await r.arrayBuffer());
    await sleep(r.status === 429 ? 60000 : 5000);
  }
  throw new Error('download failed ' + u);
}
async function info(files) {
  const out = {};
  for (let i = 0; i < files.length; i += 40) {
    const chunk = files.slice(i, i + 40);
    const j = await getJson(`https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=500&format=json&titles=${encodeURIComponent(chunk.map(f => 'File:' + f).join('|'))}`);
    const norm = {}; (j.query.normalized || []).forEach(n => norm[n.to] = n.from);
    for (const q of Object.values(j.query.pages)) {
      const name = (norm[q.title] || q.title).replace(/^File:/, '');
      const ii = q.imageinfo && q.imageinfo[0];
      if (!ii) { out[name] = null; continue; }
      const md = ii.extmetadata;
      out[name] = {
        license: md.LicenseShortName ? md.LicenseShortName.value : '',
        artist: md.Artist ? md.Artist.value.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '',
        page: ii.descriptionurl, url: ii.url, thumb: ii.thumburl,
      };
    }
    await sleep(1500);
  }
  return out;
}

(async () => {
  const data = {}, credits = [];
  for (const [deck, def] of Object.entries(SRC)) {
    const files = def.items.map(i => i[0]);
    const meta = await info(files);
    const dir = path.join(OUT, 'img', deck); fs.mkdirSync(dir, { recursive: true });
    data[deck] = { title: def.title, icon: def.icon, intro: def.intro, items: [] };
    let n = 0;
    for (const [file, name, group, desc] of def.items) {
      const m = meta[file] || meta[file.replace(/_/g, ' ')];
      if (!m) throw new Error('見つからない: ' + file);
      if (!OK_LICENSE.test(m.license)) throw new Error(`使えないライセンス: ${file} (${m.license})`);
      const isSvg = /\.svg$/i.test(file);
      const ext = isSvg ? "png" : "jpg";
      const local = `img/${deck}/${String(++n).padStart(2, '0')}.${ext}`;
      const target = path.join(OUT, local);
      if (!fs.existsSync(target)) { fs.writeFileSync(target, await getBin(m.thumb.split("?")[0])); await sleep(2500); }
      data[deck].items.push({ img: local, name, group, desc });
      credits.push({ deck, name, file, license: m.license, artist: m.artist || '(作者の記載なし)', page: m.page });
    }
    console.log(deck, data[deck].items.length);
  }
  fs.writeFileSync(path.join(OUT, 'data.js'), '// 自動生成(tools/fetch-images.js)。手で編集しない。\nwindow.ZUKAN = ' + JSON.stringify(data) + ';\nwindow.CREDITS = ' + JSON.stringify(credits) + ';\n');
  console.log('credits', credits.length);
})().catch(e => { console.error(e.message); process.exit(1); });
