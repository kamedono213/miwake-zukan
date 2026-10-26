# みわけ図鑑

道路標識(54)・地図記号(39)・鉱物と岩石(38)を、図鑑とクイズで見分けて覚えるPWA。

- クイズ: 絵/写真→名前、名前→絵/写真、どのなかま?(警戒・規制・指示 / 建物・土地 / 鉱物・岩石)。まちがいの選択肢は同じなかまから優先して出す
- 3回続けて正解で「覚えた」。図鑑で★表示
- 画像は Wikimedia Commons(PD / CC BY / CC BY-SA のみ)。出典一覧はアプリ内「画像の出典・ライセンス」
- 「もどる」「やめる」・スマホの戻る操作は確認ダイアログ

## 開発
- `node tools/fetch-images.js` 画像取得とライセンス確認 → app/img, app/data.js(元データは tools/items.js)
- `node serve.js` → http://localhost:5402 / `node tools/make-icons.js` / `node tools/build-pages.js`
