//カレンダーアプリ
"use client";

import { useState } from "react";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import Button from "@/app/components/elements/Button";
import CalendarDialog from "@/features/calendar/components/CalendarDialog";
import {
  fetchCalendarsAction,
  addCalendarAction,
  updateCalendarAction,
  deleteCalendarAction,
} from "@/features/calendar/actions";
import type { CalendarWithUrl } from "@/features/calendar/actions";

type Props = {
  initialCalendars: CalendarWithUrl[];
};

export default function CalendarApp({ initialCalendars }: Props) {
  const [calendars, setCalendars] = useState<CalendarWithUrl[]>(initialCalendars);
  const [selectedYear, setSelectedYear] = useState<number | "">(
    initialCalendars.length > 0 ? initialCalendars[0].year : ""
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"new" | "edit">("new");
  const [errorMessage, setErrorMessage] = useState("");

  const [prevInitial, setPrevInitial] = useState(initialCalendars);
  if (prevInitial !== initialCalendars) {
    setPrevInitial(initialCalendars);
    setCalendars(initialCalendars);
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
      if (formData.get("id")) {
        await updateCalendarAction(formData);
      } else {
        await addCalendarAction(formData);
      }
      const latest = await fetchCalendarsAction();
      setCalendars(latest);
      if (savedYear) {
        setSelectedYear(savedYear);
      }
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
      const result = await deleteCalendarAction(
        currentCalendar.id,
        currentCalendar.storage_path
      );
      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }
      await refreshData();
    } catch (e) {
      if (e instanceof Error) {
        setErrorMessage(e.message);
      }
      throw e;
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "16px" }}>
      {/* ヘッダー行 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        {/* 年セレクトボックス */}
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            displayEmpty
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

        <div style={{ display: "flex", gap: 8 }}>
          {/* 新規追加ボタン */}
          <Button onClick={() => { setModalMode("new"); setModalOpen(true); }}>
            新規追加
          </Button>
          {/* 編集ボタン */}
          {currentCalendar && (
            <Button onClick={() => { setModalMode("edit"); setModalOpen(true); }}>
              編集
            </Button>
          )}
        </div>
      </div>

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
        <iframe
          src={currentCalendar.pdfUrl}
          title={`${currentCalendar.year}年カレンダー`}
          style={{
            width: "100%",
            height: "calc(100vh - 250px)",
            border: "1px solid #ddd",
            borderRadius: "8px",
            backgroundColor: "#fff",
          }}
        />
      ) : (
        // カレンダーが登録されていない場合は、デフォルトのメッセージを表示 
        <div
          style={{
            width: "100%",
            height: "calc(100vh - 250px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #ddd",
            borderRadius: "8px",
            backgroundColor: "#fff",
            color: "#999",
          }}
        >
          カレンダーが登録されていません
        </div>
      )}

      {/* 登録、編集ダイアログ */}
      <CalendarDialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        current={modalMode === "edit" ? currentCalendar : null}
        existingYears={calendars.map((c) => c.year)}
      />
    </div>
  );
}
