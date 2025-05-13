// TodoItemの型定義
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

// 完了したTodoをすべて削除
export async function clearCompletedTodos(): Promise<TodoItem[]> {
  // 現在のTodoを取得
  const currentTodos = await fetchTodos();

  // 完了していないTodoだけをフィルタリング
  const activeTodos = currentTodos.filter((todo) => !todo.completed);

  // 更新されたリストをAPIに送信
  const response = await fetch("/api/todos", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(activeTodos),
  });

  if (!response.ok) {
    throw new Error("完了したTodoの削除に失敗しました");
  }

  return response.json();
}
