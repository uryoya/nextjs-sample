"use client";

import { useState, useEffect } from "react";

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

type FilterType = "all" | "active" | "completed";

export default function Todo() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  // ローカルストレージからデータを読み込む
  useEffect(() => {
    try {
      const storedTodos = localStorage.getItem("todos");
      if (storedTodos) {
        setTodos(JSON.parse(storedTodos));
      }
    } catch (error) {
      console.error("ローカルストレージからの読み込みに失敗しました", error);
    }
  }, []);

  // データが変更されたらローカルストレージに保存
  useEffect(() => {
    try {
      localStorage.setItem("todos", JSON.stringify(todos));
    } catch (error) {
      console.error("ローカルストレージへの保存に失敗しました", error);
    }
  }, [todos]);

  const addTodo = () => {
    if (inputValue.trim() === "") return;

    const newTodo: TodoItem = {
      id: Date.now(),
      text: inputValue,
      completed: false,
    };

    setTodos([...todos, newTodo]);
    setInputValue("");
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  // フィルタリングされたTodoリストを取得
  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true; // 'all'の場合は全て表示
  });

  // すべてのタスクを削除
  const clearCompleted = () => {
    setTodos(todos.filter((todo) => !todo.completed));
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Todoリスト</h1>

      <div className="flex mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
          className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="新しいタスクを入力..."
        />
        <button
          onClick={addTodo}
          className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 transition-colors"
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
        >
          完了済み
        </button>
      </div>

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
              onClick={() => deleteTodo(todo.id)}
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
    </div>
  );
}
