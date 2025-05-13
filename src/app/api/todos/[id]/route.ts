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
