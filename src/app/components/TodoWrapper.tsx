"use client";

import dynamic from "next/dynamic";

// クライアントコンポーネントを動的にインポート
const Todo = dynamic(() => import("./Todo"), { ssr: false });

export default function TodoWrapper() {
  return <Todo />;
}
