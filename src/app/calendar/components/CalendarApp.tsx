// src/app/calendar/components/CalendarApp.tsx
//カレンダーアプリ
"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import Stack from "@mui/material/Stack";
import Button from "@/components/elements/Button";
import EmptyState from "@/components/elements/EmptyState";
import PrimaryActionButton from "@/components/elements/PrimaryActionButton";
import ResultDialog from "@/components/elements/ResultDialog";
import CalendarDialog from "@/app/calendar/components/CalendarDialog";
import {
  fetchCalendarsAction,//カレンダー一覧取得
  addCalendarAction,//カレンダー新規追加
  updateCalendarAction,//カレンダー更新
  deleteCalendarAction,//カレンダー削除
} from "@/app/calendar/actions";//server actions カレンダー一覧取得、新規追加、更新、削除
import type { CalendarWithUrl } from "@/app/calendar/actions";

//Props型: コンポーネントが受け取るプロパティの型定義
type Props = {
  initialCalendars: CalendarWithUrl[];//初期カレンダー一覧
  canManageCalendars: boolean;
};

export default function CalendarApp({ initialCalendars, canManageCalendars }: Props) {
  // カレンダー一覧の状態を管理するstate。初期値はpropsで受け取ったinitialCalendars（最新カレンダー）
  const [calendars, setCalendars] = useState<CalendarWithUrl[]>(initialCalendars);

  // 選択中の年を保持するstate。初期値は初期カレンダー一覧があれば最初の年、なければ空文字("")
  const [selectedYear, setSelectedYear] = useState<number | "">(
    initialCalendars.length > 0 ? initialCalendars[0].year : ""
  );

  // カレンダー追加/編集ダイアログの開閉状態を管理。falseで非表示、trueで表示
  const [modalOpen, setModalOpen] = useState(false);

  // ダイアログのモード（新規追加 or 編集）を管理。"new"なら新規、"edit"なら編集
  const [modalMode, setModalMode] = useState<"new" | "edit">("new");

  // エラーメッセージ表示用state。エラー発生時に内容をセット
  const [errorMessage, setErrorMessage] = useState("");
  const [resultMessage, setResultMessage] = useState("");

  // 直前に受け取ったinitialCalendarsを保持し、propsの変更を検知してstateを更新するためのstate
  const [prevInitial, setPrevInitial] = useState(initialCalendars);

  // propsのinitialCalendarsが更新された場合に、各stateも同期させる
  if (prevInitial !== initialCalendars) {
    // prevInitialを新しいinitialCalendarsで上書き
    setPrevInitial(initialCalendars);
    // calendarsも新しいinitialCalendarsと同期
    setCalendars(initialCalendars);
    // 選択中の年も、新しいリストの先頭（あれば）に合わせる
    if (initialCalendars.length > 0) {
      setSelectedYear(initialCalendars[0].year);
    }
  }

  const currentCalendar = calendars.find((c) => c.year === selectedYear) ?? null;

  const refreshData = async () => {
    try {
      const latest = await fetchCalendarsAction();
      setCalendars(latest);
      if (latest.length > 0) {
        const stillExists = latest.find((c) => c.year === selectedYear);
        if (!stillExists) {
          setSelectedYear(latest[0].year);
        }
      } else {
        setSelectedYear("");
      }
    } catch (e) {
      console.error("データ再取得失敗:", e);
    }
  };

  const handleSave = async (formData: FormData) => {
    setErrorMessage("");
    try {
      const savedYear = Number(formData.get("year"));
      const isUpdate = Boolean(formData.get("id"));
      if (isUpdate) {
        await updateCalendarAction(formData);
      } else {
        await addCalendarAction(formData);
      }
      const latest = await fetchCalendarsAction();
      setCalendars(latest);
      if (savedYear) {
        setSelectedYear(savedYear);
      }
      setResultMessage(isUpdate ? "更新が完了しました。" : "登録が完了しました。");
    } catch (e) {
      if (e instanceof Error) {
        setErrorMessage(e.message);
      }
      throw e;
    }
  };

  const handleDelete = async () => {
    if (!currentCalendar) return;
    setErrorMessage("");
    try {
      const result = await deleteCalendarAction(currentCalendar.id);
      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }
      await refreshData();
      setResultMessage("削除が完了しました。");
    } catch (e) {
      if (e instanceof Error) {
        setErrorMessage(e.message);
      }
      throw e;
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "1200px", mx: "auto", p: { xs: 1.5, sm: 2 } }}>
      {/* ヘッダー行 */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={1.5}
        sx={{ mb: 1.5 }}
      >
        {/* 年セレクトボックス */}
        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 140 } }}>
          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            displayEmpty
            sx={{ backgroundColor: "#fff" }} // 背景色を白に設定
          >
            {/* データなしの場合は、デフォルトの ’データなし’ を表示 */}
            {calendars.length === 0 && (
              <MenuItem value="" disabled>
                データなし
              </MenuItem>
            )}
            {/* データがある場合は、年を表示 */}
            {calendars.map((c) => (
              <MenuItem key={c.id} value={c.year}>
                {c.year}年
              </MenuItem>
            ))}
          </Select>
     
        </FormControl>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ width: { xs: "100%", sm: "auto" }, "& > button": { width: { xs: "100%", sm: "auto" } } }}
        >
          {/* 新規追加ボタン */}
          <PrimaryActionButton onClick={() => { setModalMode("new"); setModalOpen(true); }}>
            新規追加
          </PrimaryActionButton>
          {/* 編集ボタン */}
          {currentCalendar && (/* カレンダーデータが既に登録されている場合は、編集ボタンを表示 */
            <Button onClick={() => { setModalMode("edit"); setModalOpen(true); }}>
              編集
            </Button>
          )}
        </Stack>
      </Stack>

      {/* エラーメッセージ */}
      {errorMessage && (
        <p style={{ color: "red", marginBottom: "12px" }}>{errorMessage}</p>
      )}

      {/* タイトル表示 */}
      {currentCalendar && (
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: "bold",
            marginBottom: "16px",
            color: "#333",
          }}
        >
          {currentCalendar.title}
        </h2>
      )}

      {/* PDFビューアー */}
      {/* PDFはcurrentCalendar.pdfUrlをもとに、ブラウザが直接Supabase StorageのURLにアクセスして表示 */}
      {/* サーバーからダウンロードして渡しているのではない */}
      {currentCalendar ? (
        // カレンダーが登録されている場合は、PDFビューアーを表示
        <Box
          component="iframe"
          src={currentCalendar.pdfUrl}
          title={`${currentCalendar.year}年カレンダー`}
          sx={{
            width: "100%",
            height: { xs: "calc(100vh - 280px)", sm: "calc(100vh - 250px)" },
            minHeight: { xs: 360, sm: 480 },
            border: "1px solid #ddd",
            borderRadius: "8px",
            backgroundColor: "#fff",
          }}
        />
      ) : (
        // カレンダーが登録されていない場合は、Empty Stateを表示
        <Box
          sx={{
            width: "100%",
            height: { xs: "calc(100vh - 280px)", sm: "calc(100vh - 250px)" },
            minHeight: { xs: 360, sm: 480 },
            border: "1px solid #ddd",
            borderRadius: "8px",
            backgroundColor: "#fff",
          }}
        >
          <EmptyState message="カレンダーが登録されていません" />
        </Box>
      )}

      {/* 登録、編集ダイアログ */}
      <CalendarDialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        current={modalMode === "edit" ? currentCalendar : null}
        existingYears={calendars.map((c) => c.year)}
        existingTitles={calendars.map((c) => c.title)}
        canManageCalendars={canManageCalendars}
      />
      <ResultDialog
        open={Boolean(resultMessage)}
        message={resultMessage}
        onClose={() => setResultMessage("")}
      />
    </Box>
  );
}
