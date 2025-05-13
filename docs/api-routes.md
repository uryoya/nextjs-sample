# Next.js API Routes の解説

Next.jsでは、APIエンドポイントを簡単に作成できる「API Routes」機能が提供されています。これにより、フロントエンドとバックエンドを同じNext.jsプロジェクト内で開発することが可能になります。

## API Routesの基本概念

### ファイルベースのルーティング

API Routesもファイルシステムベースのルーティングを使用します：

- `src/app/api/...` 内のファイルは自動的にAPIエンドポイントになります
- 例えば、`src/app/api/todos/route.ts` は `/api/todos` というエンドポイントになります
- 動的ルート: `src/app/api/todos/[id]/route.ts` は `/api/todos/1`, `/api/todos/2` などにマッチします

### HTTPメソッドの実装

各HTTPメソッドを関数としてエクスポートするだけで、それぞれのHTTPメソッドをサポートできます：

```typescript
// src/app/api/todos/route.ts
import { NextRequest, NextResponse } from "next/server";

// GET /api/todos - すべてのTodoを取得
export async function GET() {
  // ...
  return NextResponse.json(data);
}

// POST /api/todos - 新しいTodoを作成
export async function POST(request: NextRequest) {
  // ...
  return NextResponse.json(newItem, { status: 201 });
}

// PUT /api/todos - 複数のTodoを更新
export async function PUT(request: NextRequest) {
  // ...
  return NextResponse.json(updatedData);
}
```

### リクエストとレスポンスの処理

Next.jsでは、`NextRequest`と`NextResponse`を使用してHTTPリクエストとレスポンスを処理します：

```typescript
// リクエストボディの取得
const data = await request.json();

// JSONレスポンスの返却
return NextResponse.json(data, { 
  status: 200, 
  headers: { 'Cache-Control': 'max-age=0' } 
});
```

### 動的ルートパラメータの取得

動的ルートパラメータは、第2引数の`params`オブジェクトで受け取ることができます：

```typescript
// src/app/api/todos/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  // ...
}
```

## 実装例：Todoアプリケーション

### メインのTodos APIエンドポイント

```typescript
// src/app/api/todos/route.ts
import { NextRequest, NextResponse } from "next/server";

export interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

// メモリ内でのシンプルなデータストア（実際のアプリではデータベースを使用する）
let todos: TodoItem[] = [];

// GET /api/todos - すべてのTodoを取得
export async function GET() {
  return NextResponse.json(todos);
}

// POST /api/todos - 新しいTodoを作成
export async function POST(request: NextRequest) {
  const data = await request.json();
  
  if (!data.text || typeof data.text !== "string") {
    return NextResponse.json(
      { error: "テキストは必須で、文字列である必要があります" },
      { status: 400 }
    );
  }
  
  const newTodo: TodoItem = {
    id: Date.now(),
    text: data.text,
    completed: false,
  };
  
  todos.push(newTodo);
  
  return NextResponse.json(newTodo, { status: 201 });
}

// PUT /api/todos - Todoを更新（一括更新）
export async function PUT(request: NextRequest) {
  const data = await request.json();
  
  if (!Array.isArray(data)) {
    return NextResponse.json(
      { error: "リクエストボディは配列である必要があります" },
      { status: 400 }
    );
  }
  
  todos = data;
  
  return NextResponse.json(todos);
}

// 他のAPIルートからtodosにアクセスするためのヘルパー関数
export function getTodos(): TodoItem[] {
  return todos;
}

export function findTodoById(id: number): TodoItem | undefined {
  return todos.find((todo) => todo.id === id);
}

export function updateTodoById(
  id: number,
  updates: Partial<TodoItem>
): TodoItem | null {
  const index = todos.findIndex((todo) => todo.id === id);
  if (index === -1) return null;
  
  todos[index] = { ...todos[index], ...updates };
  return todos[index];
}

export function deleteTodoById(id: number): TodoItem | null {
  const index = todos.findIndex((todo) => todo.id === id);
  if (index === -1) return null;
  
  const deleted = todos[index];
  todos.splice(index, 1);
  return deleted;
}
```

### 個別のTodo APIエンドポイント

```typescript
// src/app/api/todos/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { findTodoById, updateTodoById, deleteTodoById } from "../route";

// GET /api/todos/[id] - 特定のTodoを取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  
  if (isNaN(id)) {
    return NextResponse.json(
      { error: "IDは数値である必要があります" },
      { status: 400 }
    );
  }
  
  const todo = findTodoById(id);
  
  if (!todo) {
    return NextResponse.json(
      { error: "指定されたIDのTodoが見つかりません" },
      { status: 404 }
    );
  }
  
  return NextResponse.json(todo);
}

// PATCH /api/todos/[id] - 特定のTodoを更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  
  if (isNaN(id)) {
    return NextResponse.json(
      { error: "IDは数値である必要があります" },
      { status: 400 }
    );
  }
  
  const data = await request.json();
  const updates: { text?: string; completed?: boolean } = {};
  
  // 更新可能なフィールド
  if (data.completed !== undefined) {
    updates.completed = Boolean(data.completed);
  }
  
  if (data.text !== undefined && typeof data.text === "string") {
    updates.text = data.text;
  }
  
  const updatedTodo = updateTodoById(id, updates);
  
  if (!updatedTodo) {
    return NextResponse.json(
      { error: "指定されたIDのTodoが見つかりません" },
      { status: 404 }
    );
  }
  
  return NextResponse.json(updatedTodo);
}

// DELETE /api/todos/[id] - 特定のTodoを削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  
  if (isNaN(id)) {
    return NextResponse.json(
      { error: "IDは数値である必要があります" },
      { status: 400 }
    );
  }
  
  const deletedTodo = deleteTodoById(id);
  
  if (!deletedTodo) {
    return NextResponse.json(
      { error: "指定されたIDのTodoが見つかりません" },
      { status: 404 }
    );
  }
  
  return NextResponse.json(deletedTodo);
}
```

### フロントエンドからのAPI呼び出し

フロントエンドからAPIを呼び出すユーティリティ関数を作成することも一般的です：

```typescript
// src/app/utils/api.ts
export interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

// すべてのTodoを取得
export async function fetchTodos(): Promise<TodoItem[]> {
  const response = await fetch("/api/todos");
  
  if (!response.ok) {
    throw new Error("Todoの取得に失敗しました");
  }
  
  return response.json();
}

// 新しいTodoを作成
export async function createTodo(text: string): Promise<TodoItem> {
  const response = await fetch("/api/todos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  
  if (!response.ok) {
    throw new Error("Todoの作成に失敗しました");
  }
  
  return response.json();
}

// Todoを更新
export async function updateTodo(
  id: number,
  updates: { text?: string; completed?: boolean }
): Promise<TodoItem> {
  const response = await fetch(`/api/todos/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    throw new Error("Todoの更新に失敗しました");
  }
  
  return response.json();
}

// Todoを削除
export async function deleteTodo(id: number): Promise<TodoItem> {
  const response = await fetch(`/api/todos/${id}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    throw new Error("Todoの削除に失敗しました");
  }
  
  return response.json();
}
```

## API Routesの配置場所について

Next.jsのApp Routerでは、APIルートは`/src/app/api`ディレクトリに配置されます。これには以下のような理由があります：

1. **統一されたルーティングシステム**
   - App Routerでは、すべてのルート（ページもAPIも）が`app`ディレクトリの配下に配置されます
   - これにより、ルーティングのロジックが統一され、一貫性が保たれます

2. **ファイルシステムベースのルーティング**
   - `app/api/todos/route.ts`は`/api/todos`のエンドポイントになります
   - `app/dashboard/page.tsx`は`/dashboard`のページになります
   - 同じルールで両方のタイプのルートが処理されるため、理解しやすくなります

3. **コロケーション（関連するコードの近接配置）**
   - 特定の機能に関連するAPIとUIを同じディレクトリ構造内に配置できます
   - 例：`app/dashboard/api/stats/route.ts`と`app/dashboard/page.tsx`のように、ダッシュボード関連のコードを一箇所にまとめられます

4. **関数のインポートとコード共有の容易さ**
   - APIとUIのコード間で型や関数を簡単に共有できます
   - 例：`src/app/utils`にある共通のユーティリティ関数を両方から参照できます

例えば、TodoアプリのAPIは次のような構造になっています：
```
src/app/
├── api/
│   └── todos/           -> /api/todos エンドポイント
│       ├── route.ts     -> GET, POST, PUT メソッド
│       └── [id]/
│           └── route.ts -> /api/todos/:id エンドポイント（GET, PATCH, DELETE メソッド）
└── utils/
    └── api.ts           -> フロントエンドからAPIを呼び出すコード
```

## 実際のアプリケーションでの API Routes

実際のアプリケーションでは、メモリ内のデータストアではなく、データベースを使用することが一般的です。例えば：

- **MongoDB**と**Mongoose**
- **PostgreSQL**と**Prisma**
- **MySQL**と**TypeORM**
- **Firebase Firestore**

また、認証や認可も組み込むことが多いでしょう：

- **NextAuth.js** - 認証プロバイダとの統合
- JWT（JSON Web Token）による認証
- API Routesでの認証チェック

## まとめ

Next.jsのAPI Routesを使用すると、バックエンドAPIとフロントエンドを同じプロジェクト内で開発できるため、開発効率が向上します。特に小規模から中規模のプロジェクトでは、別々のバックエンドサーバーを構築する必要がなくなるため、非常に便利です。

API Routesは以下のような場合に特に有用です：

1. プロトタイピングや概念実証（PoC）
2. BFFパターン（Backend for Frontend）の実装
3. サードパーティAPIへのプロキシ（APIキーを隠すため）
4. 単一チームによる小規模から中規模のアプリケーション開発

大規模なアプリケーションでは、独立したバックエンドサービスを構築することも検討する価値がありますが、Next.jsのAPI Routesは多くの場合十分な機能を提供します。 