# Next.jsでの認証実装

Next.jsアプリケーションに認証機能を実装するための様々なアプローチと実践的なパターンを紹介します。

## 認証の基本的なアプローチ

Next.jsでは、主に以下の方法で認証を実装できます：

1. **NextAuth.js (Auth.js)** - 多くの認証プロバイダに対応した包括的な認証ライブラリ
2. **ミドルウェアベースの認証** - Next.jsのミドルウェア機能を使用して保護されたルートを制御
3. **カスタム認証ロジック** - APIルートとサーバーアクションを使用した独自の認証の実装

## 1. NextAuth.js (Auth.js) を使用した認証

### 基本的なセットアップ

```bash
npm install next-auth
```

### API ルートの作成

```tsx
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    // OAuthプロバイダー（GitHub、Google、Twitterなど）
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // ユーザー名とパスワードによる認証
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "ユーザー名", type: "text" },
        password: { label: "パスワード", type: "password" }
      },
      async authorize(credentials) {
        // データベースなどで認証ロジックを実装
        const user = await validateUserCredentials(
          credentials.username,
          credentials.password
        );
        return user || null;
      }
    }),
  ],
  // セッション設定
  session: {
    strategy: "jwt", // または "database"
    maxAge: 30 * 24 * 60 * 60, // 30日間
  },
  // カスタムページ
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error',
  },
  // コールバック
  callbacks: {
    async jwt({ token, user, account }) {
      // ユーザー情報をトークンに追加
      if (user) {
        token.userId = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // セッションにユーザー情報を追加
      session.user.id = token.userId;
      session.user.role = token.role;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### セッションプロバイダーの設定

```tsx
// app/providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}

// app/layout.tsx
import { AuthProvider } from "./providers";

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

### サーバーコンポーネントでの認証状態の利用

```tsx
// app/dashboard/page.tsx
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    // 未認証ユーザーをリダイレクト
    redirect("/login");
  }
  
  return (
    <div>
      <h1>ダッシュボード</h1>
      <p>ようこそ、{session.user.name}さん</p>
      {/* 認証済みユーザー向けのコンテンツ */}
    </div>
  );
}
```

### クライアントコンポーネントでの認証状態の利用

```tsx
// app/components/ProfileButton.tsx
"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function ProfileButton() {
  const { data: session, status } = useSession();
  
  if (status === "loading") {
    return <div>読み込み中...</div>;
  }
  
  if (status === "authenticated") {
    return (
      <div>
        <p>{session.user.name}</p>
        <button onClick={() => signOut()}>ログアウト</button>
      </div>
    );
  }
  
  return <button onClick={() => signIn()}>ログイン</button>;
}
```

### ログインページの作成

```tsx
// app/login/page.tsx
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    
    if (result.error) {
      setError("ログインに失敗しました");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div>
      <h1>ログイン</h1>
      {error && <p className="text-red-500">{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">ユーザー名</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">パスワード</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">ログイン</button>
      </form>
      
      <div>
        <button onClick={() => signIn("github")}>GitHubでログイン</button>
        <button onClick={() => signIn("google")}>Googleでログイン</button>
      </div>
    </div>
  );
}
```

## 2. ミドルウェアを使用した認証

Next.jsのミドルウェアを使用することで、特定のルートを保護できます：

```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // NextAuth.jsのトークンを取得
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  // 保護されたルートへのアクセスをチェック
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // ロールベースの認可
  if (token && request.nextUrl.pathname.startsWith('/admin') && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
  
  return NextResponse.next();
}

// ミドルウェアを適用するパスを指定
export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/profile/:path*'],
};
```

## 3. カスタム認証の実装

自前の認証ロジックを実装する場合：

### ユーザーモデルの定義

```tsx
// types/user.ts
export interface User {
  id: string;
  username: string;
  password: string; // ハッシュ化されたパスワード
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: Date;
}
```

### 認証APIの実装

```tsx
// app/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();
  
  try {
    // ユーザーをデータベースから検索
    const user = await db.user.findUnique({
      where: { username },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 401 }
      );
    }
    
    // パスワードを検証
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'パスワードが正しくありません' },
        { status: 401 }
      );
    }
    
    // JWTトークンを生成
    const token = jwt.sign(
      { 
        userId: user.id,
        username: user.username,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // Secure HTTPOnly Cookieにトークンを設定
    cookies().set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1日
      path: '/',
    });
    
    // 機密情報を削除したユーザー情報を返す
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'ログイン処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
```

### サーバーアクションを使用した認証

```tsx
// app/actions.ts
"use server";

import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  
  try {
    const user = await db.user.findUnique({
      where: { username },
    });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return { error: 'ユーザー名またはパスワードが正しくありません' };
    }
    
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    cookies().set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
      path: '/',
    });
    
    return { success: true };
  } catch (error) {
    return { error: '認証処理中にエラーが発生しました' };
  }
}

export async function logout() {
  cookies().delete('auth-token');
  redirect('/login');
}

export async function register(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const email = formData.get('email') as string;
  const name = formData.get('name') as string;
  
  // パスワードのハッシュ化
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const user = await db.user.create({
      data: {
        username,
        password: hashedPassword,
        email,
        name,
        role: 'user',
      },
    });
    
    return { success: true };
  } catch (error) {
    return { error: 'ユーザー登録中にエラーが発生しました' };
  }
}
```

## 認証の種類とその特徴

### JWTベース認証

JSONウェブトークンを使用した認証方式：

- **利点**：ステートレスでスケーラブル、サーバー側のセッションストアが不要
- **欠点**：トークンを無効化するのが難しい、トークンサイズが大きくなる可能性

```tsx
// JWT設定例（NextAuth.js）
export const authOptions = {
  providers: [...],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30日
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    // 署名アルゴリズム
    encryption: true,
  },
};
```

### セッションベース認証

ユーザー情報をサーバー側に保存し、セッションIDをクライアントに渡す方式：

- **利点**：セッションの無効化が容易、クライアントに最小限の情報だけを送信
- **欠点**：データベースへの依存度が高く、スケーリングが複雑になる可能性

```tsx
// セッションベース認証設定例（NextAuth.js）
export const authOptions = {
  providers: [...],
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30日
  },
  adapter: PrismaAdapter(prisma), // Prisma, MongoDB, TypeORMなど
};
```

## 認証に関する実践的なヒント

### 1. 環境変数の管理

```
# .env.local
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secure_random_string_here
JWT_SECRET=another_secure_random_string
GITHUB_ID=your_github_oauth_client_id
GITHUB_SECRET=your_github_oauth_client_secret
DATABASE_URL=your_database_connection_string
```

### 2. セキュリティのベストプラクティス

- パスワードは常にハッシュ化して保存（bcryptなどを使用）
- HTTPOnly Cookieを使用してXSSを防止
- CSRFトークンを実装
- レート制限で過剰なログイン試行を防止
- HTTPS接続を強制（本番環境）
- 適切な認可チェックを実装

### 3. 認可（Authorization）の実装

```tsx
// 保護されたコンポーネント
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

function AdminPanel() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login?callbackUrl=/admin");
    },
  });
  
  // 認可チェック
  if (session?.user?.role !== "admin") {
    redirect("/unauthorized");
  }
  
  return <div>管理者パネル</div>;
}
```

### 4. 多要素認証（MFA）の追加

NextAuth.jsでは、カスタムプロバイダーやコールバックを使用して実装できます：

```tsx
// MFAのための追加ステップ
CredentialsProvider({
  // ...
  async authorize(credentials) {
    const user = await validateUserCredentials(
      credentials.username,
      credentials.password
    );
    
    if (!user) return null;
    
    // ユーザーにMFAが必要かチェック
    if (user.mfaEnabled) {
      // MFAチェックのために一時的にユーザー情報を保存
      return {
        ...user,
        requiresMFA: true,
        mfaVerified: false,
      };
    }
    
    return user;
  }
}),

// コールバックでMFAフローを処理
callbacks: {
  async jwt({ token, user }) {
    if (user?.requiresMFA) {
      token.requiresMFA = true;
      token.mfaVerified = false;
    }
    
    return token;
  },
  async session({ session, token }) {
    if (token.requiresMFA && !token.mfaVerified) {
      // MFA検証が必要なセッションを特別に処理
      session.requiresMFA = true;
    }
    
    return session;
  },
}
```

## まとめ

Next.jsでの認証実装には、以下のような選択肢があります：

1. **NextAuth.js (Auth.js)** - 最も包括的で簡単に実装できるソリューション
2. **ミドルウェアを使用した認証** - ルートレベルでの保護が必要な場合に最適
3. **カスタム認証ロジック** - 特殊な要件がある場合に柔軟に対応できる

適切な認証方法は、プロジェクトの要件、スケール、セキュリティニーズによって異なります。Next.jsのエコシステムは、あらゆる認証シナリオに対応できる柔軟な選択肢を提供しています。 