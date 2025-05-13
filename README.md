# Next.js Todoアプリケーション

これはNext.js学習のためのシンプルなTodoアプリケーションです。フロントエンドだけでなく、Next.jsの基本的なコンセプトを理解するために作成されました。

## 機能

- タスクの追加、削除、完了状態の切り替え
- ローカルストレージを使用したタスクの永続化
- フィルタリング機能（すべて、未完了、完了済み）
- 完了したタスクの一括削除

## 技術スタック

- [Next.js](https://nextjs.org/) - Reactフレームワーク
- [TypeScript](https://www.typescriptlang.org/) - 型安全なJavaScript
- [Tailwind CSS](https://tailwindcss.com/) - スタイリング

## クイックスタート

```bash
# リポジトリのクローン
git clone <repository-url>

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

開発サーバーが起動したら、ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスして、アプリケーションを使用できます。

## 学習ポイント

このプロジェクトでは以下のNext.jsの概念を学ぶことができます：

- App Router
- クライアントコンポーネントとサーバーコンポーネント
- 状態管理
- 動的インポート

## 次のステップ

このプロジェクトを拡張する方法：

1. バックエンドAPIの追加（Next.js API Routesを使用）
2. データベースとの連携（例：PrismaとPostgreSQLなど）
3. 認証機能の追加（NextAuth.jsを使用）
4. UIの改善（アニメーションやダークモードなど）

---

This project is bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
