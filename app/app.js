// みわけ図鑑 — 道路標識・地図記号・鉱物と岩石を、図鑑とクイズで見分けて覚える。データは data.js(tools/fetch-images.js が生成)
'use strict';

// 「もどる」「やめる」を押したら、本当にもどるか確かめる(スマホの「戻る」操作も)。
// 画面のボタンは id="back" / id="quit"。もともと確認があるボタンは data-noconfirm をつけて除く
(() => {
  let bypass = false, ignorePop = false;
  const pass = fn => { bypass = true; fn(); setTimeout(() => { bypass = false; }, 500); };
  const ask = onYes => {
    if (document.getElementById('leave-confirm')) return;
    const d = document.createElement('div');
    d.id = 'leave-confirm'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
    d.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.45);display:grid;place-items:center;padding:16px';
    d.innerHTML = '<div style="background:#fff;color:#222;border-radius:16px;padding:20px 18px;max-width:320px;width:100%;display:grid;gap:14px;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,.25)">'
      + '<b style="font-size:18px">本当にもどりますか？</b><span style="font-size:14px;color:#555">いまの続きは消えることがあります。</span>'
      + '<div style="display:flex;gap:10px"><button type="button" data-a="no" style="flex:1;padding:12px;border-radius:12px;border:1px solid #ccc;background:#fff;color:#222;font:inherit;font-weight:700">つづける</button>'
      + '<button type="button" data-a="yes" style="flex:1;padding:12px;border-radius:12px;border:0;background:#2f6fd0;color:#fff;font:inherit;font-weight:700">もどる</button></div></div>';
    d.addEventListener('click', e => {
      const a = e.target.closest('[data-a]');
      if (!a && e.target !== d) return;
      d.remove();
      if (a && a.dataset.a === 'yes') onYes();
    });
    document.body.appendChild(d);
    d.querySelector('[data-a="no"]').focus();
  };
  document.addEventListener('click', e => {
    const b = e.target.closest('#back, #quit');
    if (!b || bypass || b.hasAttribute('data-noconfirm')) return;
    e.preventDefault(); e.stopImmediatePropagation();
    ask(() => pass(() => b.click()));
  }, true);
  // ROUTED: このアプリが画面ごとに履歴を積むか。積まないアプリは、戻る操作を受け止める「しおり」を1つ積んでおく
  const ROUTED = false; // 画面ごとに history.pushState するアプリは true
  const guard = () => history.pushState({ leaveGuard: 1 }, '');
  if (!ROUTED) guard();
  window.addEventListener('popstate', e => {
    if (ignorePop) { ignorePop = false; e.stopImmediatePropagation(); return; }
    if (bypass) return;
    e.stopImmediatePropagation();
    if (!ROUTED) {
      const b = document.querySelector('#back, #quit');
      if (!b) { history.back(); return; }                 // メニュー画面ではそのままアプリを閉じる
      guard();
      if (b.hasAttribute('data-noconfirm')) { b.click(); return; }
      ask(() => pass(() => b.click()));
      return;
    }
    ignorePop = true; history.go(1); // いったん元の画面にとどまる
    ask(() => pass(() => history.back()));
  }, true);
})();

// ---------- データ・記録 ----------
const Z = window.ZUKAN, DECKS = ['road', 'map', 'stone'];
const app = document.getElementById('app');
const STORE = 'mz:';
const load = (k, d) => { try { const v = localStorage.getItem(STORE + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const save = (k, v) => { try { localStorage.setItem(STORE + k, JSON.stringify(v)); } catch (e) {} };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const known = load('known', {});            // 'deck:index' → 連続正解数(3で「覚えた」)
const key = (deck, i) => deck + ':' + i;
const isPhoto = deck => deck === 'stone';
const learned = deck => Z[deck].items.filter((_, i) => (known[key(deck, i)] || 0) >= 3).length;
const nameOnly = s => s.replace(/[(（].*?[)）]/g, '');  // クイズの選択肢では読みがなを外す

// ---------- ホーム ----------
function home() {
  app.innerHTML = `
    <div class="mast"><h1>みわけ<span>図鑑</span></h1><p class="muted">見て、くらべて、見分ける。図鑑で調べて、クイズで覚えよう。</p></div>
    <div class="decks">${DECKS.map(d => { const n = Z[d].items.length, l = learned(d); return `<button class="deck" data-d="${d}"><span class="ic">${Z[d].icon}</span><span><b>${esc(Z[d].title)}</b><span class="small muted">${n}種類 ・ 覚えた ${l}</span><span class="bar"><i style="width:${l / n * 100}%"></i></span></span></button>`; }).join('')}</div>
    <button class="link" id="credits">画像の出典・ライセンス</button>`;
  app.querySelectorAll('[data-d]').forEach(b => b.onclick = () => deckMenu(b.dataset.d));
  app.querySelector('#credits').onclick = credits;
}

function deckMenu(deck, group = 'all') {
  const D = Z[deck], groups = [...new Set(D.items.map(i => i.group))];
  app.innerHTML = `
    <div class="topbar"><button class="link" id="back">← もどる</button><h2>${D.icon} ${esc(D.title)}</h2></div>
    <p class="explain small">${esc(D.intro)}</p>
    <div class="card"><b>出題する範囲</b><div class="chips">${['all', ...groups].map(g => `<button class="chip" data-g="${g}" aria-pressed="${g === group}">${g === 'all' ? 'ぜんぶ' : esc(g)}</button>`).join('')}</div></div>
    <div class="modes">
      <button class="mode" data-m="pic2name"><b>${isPhoto(deck) ? '写真' : '絵'}を見て名前</b><span class="small muted">4つから選ぶ</span></button>
      <button class="mode" data-m="name2pic"><b>名前から${isPhoto(deck) ? '写真' : '絵'}</b><span class="small muted">4つから選ぶ</span></button>
      <button class="mode" data-m="group"><b>どのなかま？</b><span class="small muted">${groups.map(esc).join('・')}</span></button>
      <button class="mode" data-m="zukan"><b>図鑑を見る</b><span class="small muted">覚えたものに★</span></button>
    </div>`;
  app.querySelector('#back').onclick = home;
  app.querySelectorAll('[data-g]').forEach(b => b.onclick = () => deckMenu(deck, b.dataset.g));
  app.querySelectorAll('[data-m]').forEach(b => b.onclick = () => b.dataset.m === 'zukan' ? zukan(deck, group) : quiz(deck, group, b.dataset.m));
}

// ---------- 図鑑 ----------
function zukan(deck, group) {
  const D = Z[deck], idx = D.items.map((_, i) => i).filter(i => group === 'all' || D.items[i].group === group);
  app.innerHTML = `
    <div class="topbar"><button class="link" id="back">← もどる</button><h2>${esc(D.title)}の図鑑</h2></div>
    <div class="grid">${idx.map(i => { const it = D.items[i], k = known[key(deck, i)] || 0; return `<button class="tile ${isPhoto(deck) ? 'photo' : ''}" data-i="${i}"><img src="${it.img}" alt="" loading="lazy"><span>${esc(it.name)}</span><span class="st">${k >= 3 ? '★ 覚えた' : ''}</span></button>`; }).join('')}</div>`;
  app.querySelector('#back').onclick = () => deckMenu(deck, group);
  app.querySelectorAll('[data-i]').forEach(b => b.onclick = () => detail(deck, group, +b.dataset.i));
}
function detail(deck, group, i) {
  const it = Z[deck].items[i];
  app.innerHTML = `
    <div class="topbar"><button class="link" id="back">← 図鑑にもどる</button></div>
    <div class="card"><span class="tag">${esc(it.group)}</span><img class="pic ${isPhoto(deck) ? 'photo' : ''}" src="${it.img}" alt="${esc(it.name)}"><h2>${esc(it.name)}</h2><p>${esc(it.desc)}</p></div>`;
  app.querySelector('#back').onclick = () => zukan(deck, group);
}

// ---------- クイズ ----------
function quiz(deck, group, mode) {
  const D = Z[deck];
  const pool = D.items.map((_, i) => i).filter(i => group === 'all' || D.items[i].group === group);
  // まだ覚えていないものを先に出す
  const order = shuffle(pool).sort((a, b) => (known[key(deck, a)] || 0) - (known[key(deck, b)] || 0)).slice(0, 10);
  const groups = [...new Set(D.items.map(x => x.group))];
  let qi = 0, score = 0;
  const ask = () => {
    if (qi >= order.length) return result();
    const i = order[qi], it = D.items[i];
    // まちがいの選択肢は、同じなかまから優先して選ぶ(見分ける練習になる)
    const same = shuffle(D.items.map((_, j) => j).filter(j => j !== i && D.items[j].group === it.group));
    const other = shuffle(D.items.map((_, j) => j).filter(j => j !== i && D.items[j].group !== it.group));
    const wrong = same.concat(other).slice(0, 3);
    const opts = shuffle([i, ...wrong]);
    const photo = isPhoto(deck) ? 'photo' : '';
    let head, choices;
    if (mode === 'pic2name') {
      head = `<p class="q">これはなに？</p><img class="pic ${photo}" src="${it.img}" alt="問題の${isPhoto(deck) ? '写真' : '絵'}">`;
      choices = `<div class="choices">${opts.map(j => `<button class="ch" data-j="${j}">${esc(nameOnly(D.items[j].name))}</button>`).join('')}</div>`;
    } else if (mode === 'name2pic') {
      head = `<p class="q">「${esc(nameOnly(it.name))}」はどれ？</p>`;
      choices = `<div class="choices pics">${opts.map(j => `<button class="ch ${photo}" data-j="${j}"><img src="${D.items[j].img}" alt="選択肢"></button>`).join('')}</div>`;
    } else {
      head = `<p class="q">どのなかま？</p><img class="pic ${photo}" src="${it.img}" alt="問題の${isPhoto(deck) ? '写真' : '絵'}">`;
      choices = `<div class="choices">${groups.map(g => `<button class="ch" data-g="${esc(g)}">${esc(g)}</button>`).join('')}</div>`;
    }
    app.innerHTML = `
      <div class="topbar"><button class="link" id="quit">✕ やめる</button><span class="small muted">${qi + 1} / ${order.length} ・ 正解 ${score}</span></div>
      <div class="card">${head}${choices}<div id="after"></div></div>`;
    app.querySelector('#quit').onclick = () => deckMenu(deck, group);
    const answer = (ok, btn) => {
      app.querySelectorAll('.ch').forEach(b => b.disabled = true);
      btn.classList.add(ok ? 'ok' : 'ng');
      if (!ok) { const right = mode === 'group' ? app.querySelector(`.ch[data-g="${CSS.escape(it.group)}"]`) : app.querySelector(`.ch[data-j="${i}"]`); right && right.classList.add('ok'); }
      known[key(deck, i)] = ok ? (known[key(deck, i)] || 0) + 1 : 0; save('known', known);
      if (ok) score++;
      app.querySelector('#after').innerHTML = `<div class="explain"><b>${ok ? '正解！' : 'ざんねん'}</b> ${esc(it.name)}(${esc(it.group)}) — ${esc(it.desc)}</div><button class="primary" id="next">${qi + 1 >= order.length ? '結果を見る' : '次へ'}</button>`;
      app.querySelector('#next').onclick = () => { qi++; ask(); };
    };
    app.querySelectorAll('[data-j]').forEach(b => b.onclick = () => answer(+b.dataset.j === i, b));
    app.querySelectorAll('[data-g]').forEach(b => b.onclick = () => answer(b.dataset.g === it.group, b));
  };
  const result = () => {
    app.innerHTML = `
      <div class="card"><p class="muted" style="text-align:center">${esc(D.title)}</p><div class="big">${score} / ${order.length}</div>
      <p style="text-align:center">${score === order.length ? 'パーフェクト！' : score >= order.length * 0.7 ? 'よくできました。' : '図鑑で見なおしてから、もう一度。'}</p>
      <p class="small muted" style="text-align:center">3回続けて正解すると「覚えた」になります(いま ${learned(deck)} / ${D.items.length})</p>
      <div class="row" style="justify-content:center"><button class="primary" id="again">もう一度</button><button class="ghost" id="zk">図鑑を見る</button><button class="ghost" id="menu">メニュー</button></div></div>`;
    app.querySelector('#again').onclick = () => quiz(deck, group, mode);
    app.querySelector('#zk').onclick = () => zukan(deck, group);
    app.querySelector('#menu').onclick = () => deckMenu(deck, group);
  };
  ask();
}

// ---------- 出典 ----------
function credits() {
  const by = {};
  window.CREDITS.forEach(c => (by[c.deck] = by[c.deck] || []).push(c));
  app.innerHTML = `
    <div class="topbar"><button class="link" id="back">← もどる</button><h2>画像の出典</h2></div>
    <div class="card credits"><p>画像はすべて Wikimedia Commons から、パブリックドメインまたはクリエイティブ・コモンズ ライセンス(CC BY / CC BY-SA)のものを使っています。CCライセンスの写真は縮小して掲載しています。</p>
    ${DECKS.map(d => `<h3>${esc(Z[d].title)}</h3><ul>${(by[d] || []).map(c => `<li>${esc(c.name)}: <a href="${esc(c.page)}" target="_blank" rel="noopener">${esc(c.file)}</a> — ${esc(c.artist)} / ${esc(c.license)}</li>`).join('')}</ul>`).join('')}</div>`;
  app.querySelector('#back').onclick = home;
}

home();
