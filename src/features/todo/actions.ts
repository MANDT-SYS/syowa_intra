//Server Actionを定義するためのディレクティブ(サーバーで実行される)
"use server";
import "server-only";//書いておいた方が安全
import { revalidatePath } from "next/cache";
import { withAuth, withRole } from "@/lib/withAuth";
import { insertTodo,removeTodo } from "@/features/todo/server/write";
import type { Todo } from "@/types/interface";
import { ConstList } from "@/utils/ConstList";

//追加・削除の Server Action

//★★★★★★★★★★★★★★★★★★★★
//★★★★★★★データ追加★★★★★★★★
//★★★★★★★★★★★★★★★★★★★★
export const addTodoAction = async (title: string): Promise<Todo> => {
  //認証チェック
  return withAuth(async (ctx) => {
  //データ追加
  const insertedTodo = await insertTodo(title,ctx);
  // 一覧ページのキャッシュを更新(サーバー側の再取得結果も最新化しておく)（ほぼ不要だけど保険の為に更新）
    revalidatePath("/");
  //追加したデータを返す
  return insertedTodo;
  })
}

//★★★★★★★★★★★★★★★★★★★★
//★★★★★★★データ削除★★★★★★★★
//★★★★★★★★★★★★★★★★★★★★
export const deleteTodoAction = async (id: number): Promise<{ deletedId: number }> => {
  //認証＋権限チェック
  //一般ユーザーの場合、削除不可
  return withRole([ConstList.NORMAL_AUTHORITY], async (ctx) => {
    //データ削除
    await removeTodo(id, ctx);
    revalidatePath("/");
    return { deletedId: id };
  });
};