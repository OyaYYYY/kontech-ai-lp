# カネモト 土木AI支援LP｜Cloudflare / Cursor 移行パッケージ

このフォルダは、Manus環境に依存しない **Vite + React の静的LP** として Cloudflare へ移すためのパッケージです。Cursorでは、このフォルダをそのまま開いてください。

## 最短の公開手順：Cloudflare Pages

| 項目 | 設定値 |
|---|---|
| Framework preset | Vite |
| Build command | `pnpm run build` |
| Build output directory | `dist` |
| Node.js | 20 以上 |
| Package manager | pnpm |

まずローカルで `pnpm install`、次に `pnpm run dev` を実行します。表示とリンクを確認した後、GitHubへpushし、Cloudflare Pagesでリポジトリを接続してください。pnpmが `esbuild` のビルド許可を求めた場合は `pnpm approve-builds` を実行し、`esbuild` を許可してください。

> Cloudflare Pagesは静的LPとして使う前提です。フォームや予約機能を追加する場合は、Cloudflare Workers、Pages Functions、または外部の予約サービスを別途接続します。

## Cursorで最初に確認すること

1. `src/pages/Home.tsx` の `OFFICIAL_LINE_URL` を、公式LINEの本番URLへ置き換えます。
2. `index.html` の `YOUR_DOMAIN` を、Cloudflareで設定する独自ドメインへ置き換えます。
3. `public/assets/` のロゴ、社長写真、OG画像が正しく表示されることを確認します。
4. 料金目安、税表記、交通費、訪問回数の条件を事業側の確定内容へ合わせます。
5. LPに掲載したLINE返信例と、実際の自動返信または有人返信の文面を一致させます。

## Manusから移し替えた箇所

| Manus上の実装 | Cloudflare用の置き換え |
|---|---|
| `/manus-storage/...` | `/assets/...` のローカル静的ファイル |
| `vite-plugin-manus-runtime` | 削除済み |
| Manusのデバッグ収集 | 削除済み |
| Manus Storage Proxy | 削除済み |
| `window.umami.track` | 呼べる場合だけ実行する安全な実装は維持 |
| Umamiの埋め込み | `VITE_UMAMI_SCRIPT_URL` と `VITE_UMAMI_WEBSITE_ID` を設定した場合のみ有効 |

## 環境変数

`.env.example` を `.env.local` にコピーし、必要な値を設定してください。

```bash
cp .env.example .env.local
```

Umamiを使わない場合は、2つのUmami変数を空のままにして構いません。クリック計測は実行されず、LP本体には影響しません。Cloudflare Web Analyticsへ切り替える場合は、Cloudflareのダッシュボードから有効化してください。

## 公式LINE運用の最終確認

LPは以下の相談体験を前提にしています。実際の運用と揃えてください。

> 利用者：出面集計に困っている  
> カネモト：まずは「日報から出面表をつくる」から試しましょう。貴社のやり方に合わせた最初の依頼文をお送りします。

初回の返信は、業務別に分岐させるとLPと実態が一致します。

| 業務の悩み | 最初の確認 |
|---|---|
| 出面集計 | 日報の項目、人数、作業区分 |
| 見積 | 過去見積、数量拾い、項目整理のどこが重いか |
| 写真整理 | 黒板情報、撮影後の分類、写真帳作成のどこが重いか |
| 施工計画書 | 下書き、目次、注意点整理のどこから始めたいか |

## Cloudflare Workers Assetsを使う場合

Cloudflare Pagesではなく Workers Assets を使う場合は、`wrangler.toml` を利用できます。

```bash
pnpm run build
npx wrangler deploy
```

`wrangler.toml` の `name` は任意のWorkers名へ変更してください。

## パッケージの主な構成

```text
src/                LP本体のReactコンポーネントとCSS
public/assets/      ロゴ、社長写真、OG画像、シンボル
index.html          OGP、Google Fonts、任意のUmami設定
docs/               LP最終原稿、訴求・LINE導線・ワイヤーフレーム提案
README.md           この移行手順
```

## デプロイ前チェック

- [ ] 公式LINE URLを本番URLに差し替えた。
- [ ] OGPの `YOUR_DOMAIN` を独自ドメインに差し替えた。
- [ ] ロゴ、社長写真、OG画像が `/assets/` から読み込める。
- [ ] 金額、税、交通費、訪問条件を確定した。
- [ ] LPの返信例と公式LINEの実際の返信を揃えた。
- [ ] スマホ幅でヒーロー、料金、LINE CTAを確認した。
