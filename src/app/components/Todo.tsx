"use client";

import { useState, useEffect } from "react";
import {
  TodoItem,
  fetchTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  clearCompletedTodos,
} from "../utils/api";

type FilterType = "all" | "active" | "completed";

export default function Todo() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // 新しいTodoを追加
  const addTodo = async () => {
    if (inputValue.trim() === "") return;

    try {
      const newTodo = await createTodo(inputValue);
      setTodos([...todos, newTodo]);
      setInputValue("");
      setError(null);
    } catch (err) {
      console.error("Todoの追加に失敗しました", err);
      setError("Todoの追加に失敗しました。もう一度お試しください。");
    }
  };

  // Todoの完了状態を切り替える
  const toggleTodo = async (id: number) => {
    try {
      const todoToUpdate = todos.find((todo) => todo.id === id);
      if (!todoToUpdate) return;

      const updatedTodo = await updateTodo(id, {
        completed: !todoToUpdate.completed,
      });

      setTodos(todos.map((todo) => (todo.id === id ? updatedTodo : todo)));
      setError(null);
    } catch (err) {
      console.error("Todoの更新に失敗しました", err);
      setError("Todoの更新に失敗しました。もう一度お試しください。");
    }
  };

  // Todoを削除
  const deleteTodoItem = async (id: number) => {
    try {
      await deleteTodo(id);
      setTodos(todos.filter((todo) => todo.id !== id));
      setError(null);
    } catch (err) {
      console.error("Todoの削除に失敗しました", err);
      setError("Todoの削除に失敗しました。もう一度お試しください。");
    }
  };

  // 完了したTodoをすべて削除
  const clearCompleted = async () => {
    try {
      const updatedTodos = await clearCompletedTodos();
      setTodos(updatedTodos);
      setError(null);
    } catch (err) {
      console.error("完了したTodoの削除に失敗しました", err);
      setError("完了したTodoの削除に失敗しました。もう一度お試しください。");
    }
  };

  // フィルタリングされたTodoリストを取得
  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true; // 'all'の場合は全て表示
  });

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Todoリスト</h1>

      {/* エラーメッセージ */}
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <div className="flex mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
          className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="新しいタスクを入力..."
          disabled={isLoading}
        />
        <button
          onClick={addTodo}
          className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300"
          disabled={isLoading || inputValue.trim() === ""}
        >
          追加
        </button>
      </div>

      {/* フィルターボタン */}
      <div className="flex justify-center mb-4 space-x-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded ${
            filter === "all"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          disabled={isLoading}
        >
          すべて
        </button>
        <button
          onClick={() => setFilter("active")}
          className={`px-3 py-1 rounded ${
            filter === "active"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          disabled={isLoading}
        >
          未完了
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`px-3 py-1 rounded ${
            filter === "completed"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          disabled={isLoading}
        >
          完了済み
        </button>
      </div>

      {/* ローディング状態 */}
      {isLoading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <ul className="space-y-2">
            {filteredTodos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center p-2 border border-gray-200 rounded-lg"
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  className="mr-2"
                />
                <span
                  className={`flex-grow ${
                    todo.completed ? "line-through text-gray-400" : ""
                  }`}
                >
                  {todo.text}
                </span>
                <button
                  onClick={() => deleteTodoItem(todo.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  削除
                </button>
              </li>
            ))}
          </ul>

          {filteredTodos.length === 0 && (
            <p className="text-gray-500 text-center mt-4">
              {filter === "all"
                ? "タスクがありません"
                : filter === "active"
                ? "未完了のタスクがありません"
                : "完了済みのタスクがありません"}
            </p>
          )}

          {/* 完了したタスクを一括削除するボタン */}
          {todos.some((todo) => todo.completed) && (
            <div className="mt-4 text-center">
              <button
                onClick={clearCompleted}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                完了したタスクをすべて削除
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
