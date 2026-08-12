# KonTech AI特化LP

建設業向けのAI・DX支援ランディングページ（静的1ページ）。

## プレビュー

`index.html` をブラウザで開くか、ローカルサーバで確認してください。

```bash
npx --yes serve .
```

## 公式LINE URLの差し替え

[`index.html`](index.html) 内の `#config` だけ変更します。

```html
<div id="config" data-line-url="https://lin.ee/xxxxxxxx" hidden></div>
```

`main.js` がこの値を読み取り、すべての `.line-link` に反映します。

## デプロイ想定

既存ドメインの別パス（例: `https://kontech.kanemoto-group.jp/ai/`）へ、このフォルダ一式をアップロード。

## ファイル構成

- `index.html` … LP本体
- `styles.css` … スタイル
- `main.js` … LINE URL適用・スクロール演出
- `assets/hero-site.jpg` … ヒーロー画像（差し替え可）
