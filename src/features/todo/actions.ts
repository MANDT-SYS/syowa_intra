//Server Actionを定義するためのディレクティブ(サーバーで実行される)
"use server";
import { revalidatePath } from "next/cache";
import { insertTodo,removeTodo } from "@/features/todo/server/write";
import type { Todo } from "@/types/interface";

//追加・削除の Server Action

//★★★★★★★★★★★★★★★★★★★★
//★★★★★★★データ追加★★★★★★★★
//★★★★★★★★★★★★★★★★★★★★
export const addTodoAction = async (title: string): Promise<Todo> => {
//データ追加
const insertedTodo = await insertTodo(title);
// 一覧ページのキャッシュを更新(サーバー側の再取得結果も最新化しておく)（ほぼ不要だけど保険の為に更新）
  revalidatePath("/");
//追加したデータを返す
return insertedTodo;
}

//★★★★★★★★★★★★★★★★★★★★
//★★★★★★★データ削除★★★★★★★★
//★★★★★★★★★★★★★★★★★★★★
export const deleteTodoAction = async (id: number): Promise<{ deletedId: number }> => {
  //データ削除
  await removeTodo(id);
// 一覧ページのキャッシュを更新(サーバー側の再取得結果も最新化しておく)（ほぼ不要だけど保険の為に更新）
  revalidatePath("/");
//
return { deletedId: id };
};