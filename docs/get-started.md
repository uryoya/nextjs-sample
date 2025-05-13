# Next.jsの基本概念と重要なポイント

## 1. App Router構造

App Routerは、Next.js 13から導入された新しいルーティングシステムです。

```tsx
// src/app/page.tsx
import TodoWrapper from './components/TodoWrapper';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Next.js Todoアプリ
        </h1>
        <TodoWrapper />
      </div>
    </div>
  );
}
```

App Routerの主な特徴：

- **ファイルシステムベースのルーティング**
  - `src/app/` ディレクトリ内の構造がそのままURLに反映される
  - 例：`src/app/about/page.tsx` は `/about` というURLでアクセス可能
- **特殊なファイル名による機能の定義**
  - `page.tsx` - ルートのコンテンツを表示するページコンポーネント
  - `layout.tsx` - 複数のページで共有されるレイアウト
  - `loading.tsx` - ローディング状態の表示
  - `error.tsx` - エラー状態の表示
  - `not-found.tsx` - 404ページ
- **ネストされたルーティングとレイアウト**
  - ディレクトリ構造に沿ったネストが可能
  - レイアウトは子ルートに自動的に適用される

App Routerは従来のPages Routerよりも柔軟性が高く、サーバーコンポーネントと相性が良いです。

## 2. サーバーコンポーネントとクライアントコンポーネント

Next.jsのApp Routerでは、デフォルトですべてのコンポーネントがサーバーコンポーネントとして扱われます。必要に応じて`'use client'`ディレクティブを使用してクライアントコンポーネントに変更できます。

サーバーコンポーネント（デフォルト）：
```tsx
// src/app/page.tsx
import TodoWrapper from './components/TodoWrapper';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Next.js Todoアプリ
        </h1>
        <TodoWrapper />
      </div>
    </div>
  );
}
```

クライアントコンポーネント（'use client'指定あり）：
```tsx
// src/app/components/TodoWrapper.tsx
'use client';

import dynamic from "next/dynamic";

// クライアントコンポーネントを動的にインポート
const Todo = dynamic(() => import("./Todo"), { ssr: false });

export default function TodoWrapper() {
  return <Todo />;
}
```

サーバーコンポーネントとクライアントコンポーネントの違い：

- **サーバーコンポーネント**
  - サーバー上でレンダリングされ、HTMLとして送信される
  - クライアントサイドのJavaScriptバンドルサイズを削減できる
  - データベースやファイルシステムに直接アクセス可能
  - クライアントの状態（`useState`, `useEffect`など）を使用できない
  
- **クライアントコンポーネント**
  - ブラウザでレンダリングされる
  - インタラクティブな機能を実装可能
  - ブラウザのAPIやイベントリスナーを使用可能
  - `useState`, `useEffect`などのReact Hooksが使用可能

Todoアプリでは、ページ構造はサーバーコンポーネントで、インタラクティブな部分（Todo機能）はクライアントコンポーネントとして実装することで、最適なパフォーマンスと開発体験を実現しています。

## 3. データフェッチと状態管理

Next.jsでは、サーバーコンポーネントでのデータフェッチと、クライアントコンポーネントでの状態管理を組み合わせることが可能です。

クライアントサイドの状態管理の例：

```tsx
// src/app/components/Todo.tsx
export default function Todo() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  // APIからTodoを取得
  useEffect(() => {
    const loadTodos = async () => {
      try {
        setIsLoading(true);
        const data = await fetchTodos();
        setTodos(data);
        setError(null);
      } catch (err) {
        console.error("Todoの取得に失敗しました", err);
        setError("Todoの読み込みに失敗しました。もう一度お試しください。");
      } finally {
        setIsLoading(false);
      }
    };

    loadTodos();
  }, []);
  
  // ...残りのコード
}
```

Next.jsでのデータフェッチの方法：

- **サーバーコンポーネントでのデータフェッチ**
  - 直接データベースやAPIにアクセス可能
  - `fetch`にキャッシュ設定を追加可能
  - 複雑なデータ操作をサーバーで行い、結果だけをクライアントに送信可能

- **クライアントコンポーネントでの状態管理**
  - `useState`, `useReducer`でローカル状態を管理
  - `useEffect`で副作用を処理
  - フォーム入力やユーザーインタラクションを処理

アプリケーションの要件に応じて、サーバーサイドとクライアントサイドを適切に組み合わせることが重要です。

## 4. 動的インポート

Next.jsは、`next/dynamic`を使用して、コンポーネントを動的にインポートする機能を提供しています。これにより、初期ロード時のバンドルサイズを削減し、パフォーマンスを向上させることができます。

```tsx
// src/app/components/TodoWrapper.tsx
import dynamic from "next/dynamic";

// クライアントコンポーネントを動的にインポート
const Todo = dynamic(() => import("./Todo"), { ssr: false });

export default function TodoWrapper() {
  return <Todo />;
}
```

動的インポートのオプション：

- `ssr: false` - サーバーサイドレンダリングを無効にし、クライアントサイドのみでレンダリング
- `loading` - コンポーネントがロードされる間に表示するローディングコンポーネント
- `suspense: true` - React Suspenseと併用して使用可能

動的インポートの利点：

- コードの分割（Code Splitting）によるパフォーマンス向上
- 必要なときだけコンポーネントをロード
- 大きなコンポーネントやライブラリを必要に応じてロード

Todoアプリでは、ローカルストレージを使用しているため、`ssr: false`を指定して、クライアントサイドのみでコンポーネントをレンダリングしています。これにより、サーバーサイドレンダリング時に`localStorage is not defined`などのエラーを回避しています。

## 5. CSR、SSR、SSGの違い

Next.jsでは、ページをレンダリングする方法として3つの主要な手法があります：

### クライアントサイドレンダリング (CSR)

クライアントサイドレンダリングでは、ブラウザがJavaScriptを実行してページをレンダリングします。

```tsx
// src/app/components/TodoWrapper.tsx
'use client';

import dynamic from "next/dynamic";

// クライアントコンポーネントを動的にインポート
const Todo = dynamic(() => import("./Todo"), { ssr: false });

export default function TodoWrapper() {
  return <Todo />;
}
```

特徴：
- 初期ロードが遅くなる可能性がある（JavaScriptがダウンロード・実行されるまで待つ必要がある）
- インタラクティブな機能を実装しやすい
- データフェッチはクライアント側で行われる
- SEOに不利な場合がある

### サーバーサイドレンダリング (SSR)

サーバーサイドレンダリングでは、リクエストごとにサーバー上でページをレンダリングします。

```tsx
// src/app/page.tsx
import TodoWrapper from './components/TodoWrapper';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Next.js Todoアプリ
        </h1>
        <TodoWrapper />
      </div>
    </div>
  );
}
```

特徴：
- 初期ロードが速い（完全なHTMLがサーバーから送信される）
- SEOに有利（検索エンジンがコンテンツを認識しやすい）
- データフェッチをサーバー側で行える
- サーバー負荷が高くなる可能性がある

### 静的サイト生成 (SSG)

静的サイト生成では、ビルド時にページを生成します。App Routerでは、デフォルトでページは静的に生成されます。

特徴：
- 最高のパフォーマンス（事前にレンダリングされたHTMLを配信）
- SEOに最適
- CDNでのキャッシュが容易
- 頻繁に変更されるデータには不向き

Next.jsでは、これらのレンダリング方法を混在させることができます。例えば：
- 静的なページはSSGで
- ユーザー固有のページはSSRで
- インタラクティブな部分はCSRで

実際のプロジェクトでは、これらの手法を組み合わせて最適なユーザー体験を提供することが重要です。

## 6. Next.jsの最適化機能

Next.jsには、アプリケーションのパフォーマンスを向上させるための様々な最適化機能が組み込まれています。

### 自動コード分割

Next.jsは各ページやコンポーネントごとに自動的にコードを分割します。これにより、必要なコードのみがロードされ、初期ロード時間が短縮されます。

```tsx
// src/app/components/TodoWrapper.tsx
import dynamic from "next/dynamic";

// クライアントコンポーネントを動的にインポート
const Todo = dynamic(() => import("./Todo"), { ssr: false });

export default function TodoWrapper() {
  return <Todo />;
}
```

### 画像最適化

`next/image`コンポーネントを使用すると、画像の自動最適化が行われます。WebPやAVIFなどの最新フォーマットへの変換、適切なサイズでの提供、遅延ロードなどの機能があります。

### フォント最適化

`next/font`を使用すると、フォントのロード時にレイアウトシフトを防ぎ、パフォーマンスを向上させることができます。

### キャッシュと再検証

App Routerでは、データフェッチのための新しいキャッシュメカニズムが導入されています。`fetch`関数に`cache`や`revalidate`オプションを追加することで、キャッシュ戦略をカスタマイズできます。

### Turbopack

Next.js 13以降では、新しい高速バンドラーであるTurbopackをサポートしています。これにより、開発時の再ビルド速度が大幅に向上します。

## 7. デプロイメント戦略

Next.jsアプリケーションは様々な方法でデプロイできます。

### Vercelへのデプロイ

Next.jsの開発元であるVercelを使用すると、最も簡単にデプロイできます。GitHubリポジトリと連携するだけで、自動的にビルドとデプロイが行われます。

Vercelでは以下の機能が自動的に最適化されます：
- エッジキャッシング
- グローバルCDN
- 自動HTTPS
- プレビューデプロイメント
- 分析

### 自己ホスティング

Next.jsアプリケーションは、任意のNode.jsサーバーでもホスティングできます：

```bash
# ビルド
npm run build

# 起動
npm run start
```

### 静的エクスポート

データフェッチが必要ない静的なページのみで構成されているアプリケーションの場合、完全な静的サイトとしてエクスポートすることも可能です：

```bash
next build
next export
```

これにより、静的ファイルが生成され、任意のウェブサーバーでホスティングできます。

### コンテナ化

Dockerを使用して、Next.jsアプリケーションをコンテナ化することも可能です。これにより、異なる環境での一貫した動作を保証できます。

基本的なDockerfileの例：
```dockerfile
FROM node:18-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000
ENV NODE_ENV production

CMD ["node", "server.js"]
```

Todoアプリは比較的シンプルですが、実際のプロジェクトでは、これらのデプロイメント戦略から最適なものを選択し、適用することが重要です。

## 8. コンポーネント構造と配置場所のベストプラクティス

Next.jsプロジェクトでは、コンポーネントの配置場所と構造について考慮することが重要です。適切な配置により、コードの再利用性と保守性が向上します。

### コンポーネントの配置場所

Next.jsプロジェクトでは、主に以下の3つの場所にコンポーネントを配置します：

1. **`/src/components`** - アプリケーション全体で共有される汎用コンポーネント
   ```
   /src/components/
     Button.tsx
     Card.tsx
     Input.tsx
   ```

2. **`/src/app/components`** - App Router固有のコンポーネント
   ```
   /src/app/components/
     Todo.tsx
     TodoWrapper.tsx
   ```

3. **`/src/app/[feature]/components`** - 特定の機能に関連するコンポーネント
   ```
   /src/app/dashboard/components/
     DashboardCard.tsx
     DashboardStats.tsx
   ```

### 配置場所の選択基準

コンポーネントの配置場所は、以下の基準で決定するとよいでしょう：

1. **再利用性の範囲**
   - 複数のページや機能で使われるコンポーネント → `/src/components`
   - App Router内でのみ使用するコンポーネント → `/src/app/components`
   - 特定のページ/機能でのみ使用するコンポーネント → `/src/app/[feature]/components`

2. **コンポーネントの依存性**
   - ルーティングやApp Router機能に依存するコンポーネント → `/src/app/...`配下
   - 独立した汎用的なUI要素 → `/src/components`

3. **インポートの簡潔さ**
   - 頻繁に使用されるコンポーネントほど、短いインポートパスが望ましい

### コンポーネントの構造化

大規模プロジェクトでは、さらに細かく構造化することも有効です：

```
/src/components/
  /ui/              # 基本的なUI要素
    Button.tsx
    Card.tsx
    Input.tsx
  /layout/          # レイアウト関連
    Sidebar.tsx
    Header.tsx
    Footer.tsx
  /form/            # フォーム関連
    FormField.tsx
    FormSelect.tsx
  /data-display/    # データ表示関連
    Table.tsx
    Chart.tsx
```

### コンポーネントのインポート

エイリアスを使用すると、インポートがより簡潔になります：

```tsx
// tsconfig.json で設定したエイリアスを使用
import Button from '@/components/ui/Button';
import TodoList from '@/app/components/TodoList';
```

### ディレクトリ構造の意図

このような構造化には以下の意図があります：

1. **関心の分離** - 汎用コンポーネントと特定機能のコンポーネントを明確に区別
2. **再利用性の明示** - 配置場所によってコンポーネントの再利用可能な範囲を示す
3. **開発効率の向上** - 関連するコンポーネントをグループ化し、探しやすくする

適切なコンポーネント構造は、プロジェクトの規模や要件によって異なりますが、一貫性のある命名規則と配置ルールを決めることが重要です。これにより、新しいメンバーがプロジェクトに参加した際にも、コードベースを理解しやすくなります。 