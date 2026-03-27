"use client";
//表示と削除担当
//削除処理はTodoApp.tsxで行う。親の TodoApp に置く方が基本は整理しやすい為。
import type { Todo } from "@/types/interface";

type Props = {
  todos: Todo[];
  onDelete: (id: number) => Promise<void>;
  deletingId: number | null;
};

export default function TodoList({
  todos,
  onDelete,//削除ボタンクリック時の処理
  deletingId,//削除TodoのID
}: Props) {
  //Todoリストが空の場合はメッセージを表示
  if (todos.length === 0) {
    return <p>登録されているTodoはありません。</p>;
  }

  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {todos.map((todo) => (
        //Todoリストの1件分を表示
        <li
          key={todo.id}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            padding: "10px 12px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            marginBottom: "8px",
          }}
        >
          <span>{todo.title}</span>

          {/* 削除ボタン */}
          <button
            type="button"
            onClick={() => onDelete(todo.id)}
            disabled={deletingId === todo.id}
            style={{
              cursor: deletingId === todo.id ? "not-allowed" : "pointer",
              border: "none",
              background: "transparent",
              fontSize: "18px",
            }}
            aria-label={`todo-${todo.id}-delete`}
          >
            {deletingId === todo.id ? "..." : "✖"}
          </button>
        </li>
      ))}
    </ul>
  );
}