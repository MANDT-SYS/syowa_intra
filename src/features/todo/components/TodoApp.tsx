"use client";

import { useState, useEffect, useTransition } from "react";
import { addTodoAction, deleteTodoAction } from "@/features/todo/actions";
import TodoList from "@/features/todo/components/TodoList";
import Button from "@/app/components/elements/Button";
import { Todo } from "@/types/interface";
import { useRouter } from "next/navigation";
import TextInput from "@/app/components/elements/TextInput";

//page.tsxからpropsでinitialTodosを受け取る
type Props = {
  initialTodos: Todo[];
};

export default function TodoApp({ initialTodos }: Props) {
  
  // Next.jsのルーターオブジェクトを取得。画面遷移やデータの再取得時に使う
  const router = useRouter();
  // 画面が遷移中や再取得中かどうか判定できるフラグと、その処理を包むための関数
  const [isPending, startTransition] = useTransition();

  // Todoリストの状態を初期値（propsで受け取るinitialTodos）で定義
  //ここは初回レンダリング時のみ初期化される。それ以降はuseStateで更新される。
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  // 入力中のタイトル状態（フォーム入力値）を定義
  const [title, setTitle] = useState("");
  // 削除中のTodoのID（削除ボタン押下時に対象IDをセットする）を定義
  const [deletingId, setDeletingId] = useState<number | null>(null);
  // エラーメッセージの状態（バリデーションや失敗時の表示用）を定義
  const [errorMessage, setErrorMessage] = useState("");

    // router.refresh() 後に Server Component 側の最新データが props に入るので同期する
    useEffect(() => {
      setTodos(initialTodos);
    }, [initialTodos]);

  //★★★★★★★★★★★★★★★★★★★★★★★★★★
  //★★★★★★追加ボタンクリック時の処理★★★★★★★
  //★★★★★★★★★★★★★★★★★★★★★★★★★★
  const handleAdd = async () => {

    const trimmedTitle = title.trim();//タイトルの前後の空白を削除
    if (trimmedTitle.length > 1000) return; // 長すぎる入力を拒否
    if (/<script/i.test(trimmedTitle)) return; // scriptタグを拒否
    //タイトルが空の場合はエラーメッセージを表示
    if (!trimmedTitle) {
      setErrorMessage("タイトルを入力してください。");
      return;
    }
    //データ追加処理
    try {
      //エラーメッセージをクリア
      setErrorMessage("");
      //データ追加処理＋最新データ取得
      const insertedTodo = await addTodoAction(trimmedTitle);

      //最新データをstateに追加
      //再レンダリングの際はここでstateが更新される。
      setTodos((prev) => [...prev, insertedTodo]);
      
      //タイトルをクリア
      setTitle("");

       // その後、サーバー最新状態で同期
       startTransition(() => {
        router.refresh();
      });
    } 
    catch (error) {
      console.error(error);
      setErrorMessage("Todoの追加に失敗しました。");
    } 
  };

  //★★★★★★★★★★★★★★★★★★★★★★★★★★
  //★★★★★★削除ボタンクリック時の処理★★★★★★★
  //★★★★★★★★★★★★★★★★★★★★★★★★★★
  const handleDelete = async (id: number) => {
    try {
      // エラーメッセージをリセット
      setErrorMessage("");
      // 削除中のIDをセット
      setDeletingId(id);
      // Todoの削除処理（非同期）
      const result = await deleteTodoAction(id);
      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }
      // 削除対象のTodoをステートから除外
      //再レンダリングの際はここでstateが更新される。
      setTodos((prev) => prev.filter((todo) => todo.id !== id));

      // その後、サーバー最新状態で同期
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      // エラー発生時はコンソールに出力しエラーメッセージを表示
      console.error(error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Todoの削除に失敗しました。");
      }
    } finally {
      // 削除中のIDをリセット
      setDeletingId(null);
    }
  };

  return (
    <section className="text-center mb-2 text-2xl font-medium">
      <h1 style={{ marginTop: 0 }}>Supabase Todo App</h1>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        
        {/* タイトル入力フォーム */}
        <TextInput
          value={title}
          onChange={setTitle}
          placeholder="Todoを入力"
          disabled={isPending}
        />

        {/* 追加ボタン */}
        <Button
          type="button"
          onClick={handleAdd}
          disabled={isPending}
          style={{
            padding: "10px 16px",
            border: "none",
            borderRadius: "8px",
          }}
        >
           {isPending ? "処理中..." : "追加"}
        </Button>
      </div>

      {/* エラーメッセージを表示 */}
      {errorMessage && (
        <p style={{ color: "red", marginBottom: "16px" }}>{errorMessage}</p>
      )}

      {/* Todoリストを表示 */}
      <TodoList
        todos={todos}
        onDelete={handleDelete}
        deletingId={deletingId}
      />
    </section>
  );
};