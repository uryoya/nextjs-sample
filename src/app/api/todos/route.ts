import { NextRequest, NextResponse } from "next/server";

export interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

// メモリ内でのシンプルなデータストア（実際のアプリではデータベースを使用する）
// 単純な変数として定義（開発用）
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

export function updateTodos(newTodos: TodoItem[]): void {
  todos = newTodos;
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
