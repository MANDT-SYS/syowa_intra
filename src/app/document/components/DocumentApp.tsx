"use client";

/**
 * 書類管理トップ（一覧）クライアントコンポーネント
 *
 * 機能
 *  - 書類検索（タイトル/管理番号）
 *  - カテゴリフィルター
 *  - 「+ 新規追加」ボタン → 登録ダイアログ
 *  - 「カテゴリ追加」ボタン → /management へ遷移
 *  - DataGrid 表示
 *    - カラム: No / 書類名 / 管理番号 / カテゴリ / 立案部署 / 登録日 / 改版日 / 詳細 / ダウンロード
 *    - 詳細 → /document/[id]
 *    - ダウンロード → 最新版ファイルの公開URLを別タブで開く
 */

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  Chip,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Button as MuiButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import DescriptionIcon from "@mui/icons-material/Description";
import CategoryIcon from "@mui/icons-material/Category";
import DocumentAddDialog from "@/app/document/components/DocumentAddDialog";
import type { DivisionInfo, DocumentCategory, DocumentListRow } from "@/types/interface";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { jaJP } from "@mui/x-data-grid/locales";


type Props = {
  // サーバー側で取得して渡す初期データ
  initialDocuments: DocumentListRow[];
  categories: DocumentCategory[];
  divisions: DivisionInfo[];
};

// 日付を YYYY/MM/DD 形式で表示
const formatDate = (iso: string | null): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
};

// カテゴリチップの色（カテゴリ名ごとに見た目を変えると見やすいので軽くハッシュ）
const categoryChipColor = (name: string | null): string => {
  if (!name) return "#EFEAE0";
  const palette = ["#E8C8B0", "#CFE0E8", "#D8E8C8", "#EAD8E8", "#E8E1B6"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
};

export default function DocumentApp({
  initialDocuments,//書類一覧
  categories,//カテゴリー一覧
  divisions,//部署一覧
}: Props) {
  const router = useRouter();

  // 検索キーワード／フィルターのカテゴリ
  const [keyword, setKeyword] = React.useState("");
  const [filterCategoryId, setFilterCategoryId] = React.useState<number | "">("");

  // 登録ダイアログ開閉
  const [addOpen, setAddOpen] = React.useState(false);

  // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  // ★★★検索 & フィルター適用後の行（キーワード未指定時は全件該当）★★★
  // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  const filteredRows = React.useMemo(() => {
    // キーワードを小文字に変換して格納
    const kw = keyword.trim().toLowerCase();
    // 初期書類リストから検索ワードとカテゴリフィルターを適用して絞り込み
    return initialDocuments.filter((d) => {
      // フィルターカテゴリが選択されていて、かつ書類のカテゴリIDが一致しない場合は除外
      if (filterCategoryId && d.category_id !== filterCategoryId) return false;
      // キーワード未指定時は全件該当
      if (!kw) return true;
      // 検索対象となる文字列を結合（書類名・管理番号・カテゴリ名・部署名。nullは空文字）
      const hay = `${d.title} ${d.management_number} ${d.category_name ?? ""} ${d.division_name ?? ""}`.toLowerCase();
      // 検索文字列にキーワードが含まれていればtrue（該当）
      return hay.includes(kw);
    });
  }, [initialDocuments, keyword, filterCategoryId]);

  // DataGrid 行データ（No 列は documents.id をそのまま表示）
  const gridRows = React.useMemo(() => filteredRows, [filteredRows]);


  // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  // ★★★ファイルダウンロード（同一オリジン API 経由で保存）★★★
  // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  const handleDownload = (documentId: number) => {
    // ダウンロード用のaタグを作成
    const a = document.createElement("a");
    // ダウンロードAPIのエンドポイントをhrefにセット（ファイルID指定）
    a.href = `/document/download?id=${documentId}`;
    // 表示されないようにスタイルをnoneに設定
    a.style.display = "none";
    // bodyにaタグを追加（Safariなど一部ブラウザはbodyに無いと発火しないので念のため）
    document.body.appendChild(a);
    // プログラムからclickをトリガーしてダウンロードを開始
    a.click();
    // 後片付けとしてaタグをDOMから削除
    document.body.removeChild(a);
  };

  // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  // ★★★カラム定義（DataGrid 列データ）★★★★★★★★★★★★★★★★★
  // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  const columns: GridColDef<(typeof gridRows)[number]>[] = [
    {
      field: "id",
      headerName: "No",
      width: 70,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (p) => (
        <Typography variant="body2" sx={{ color: "#888780" }}>
          {p.value as number}
        </Typography>
      ),
    },
    {
      field: "management_number",
      headerName: "管理番号",
      flex: 0.8,
      minWidth: 120,
    },
    {
      field: "title",
      headerName: "書類名",
      flex: 1.4,
      minWidth: 200,
      renderCell: (p) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: "#2C2C2A" }}>
          {p.value as string}
        </Typography>
      ),
    },
    {
      field: "division_name",
      headerName: "立案部署",
      flex: 0.9,
      minWidth: 120,
      renderCell: (p) => (p.value as string | null) ?? <span style={{ color: "#aaa" }}>—</span>,
    },
    {
      field: "category_name",
      headerName: "カテゴリ",
      flex: 0.7,
      minWidth: 110,
      renderCell: (p) => {
        const name = (p.value as string | null) ?? null;
        if (!name) return <span style={{ color: "#aaa" }}>—</span>;
        return (
          <Chip
            label={name}
            size="small"
            sx={{
              bgcolor: categoryChipColor(name),
              color: "#5F4A2A",
              fontWeight: 600,
              borderRadius: "999px",
            }}
          />
        );
      },
    },
    {
      field: "created_at",
      headerName: "登録日",
      width: 120,
      renderCell: (p) => formatDate(p.value as string),
    },
    {
      field: "revised_at",
      headerName: "改版日",
      width: 120,
      renderCell: (p) => formatDate(p.value as string | null),
    },
    {
      field: "actions",
      headerName: "",
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: (p) => {
        const row = p.row;
        return (
          <Stack direction="row" spacing={0.5} alignItems="center">
            {/* ダウンロード（最新版ファイル） */}
            <Tooltip title={row.file_url ? "ダウンロード" : "ファイル未登録"}>
              <span>
                <IconButton
                  size="small"
                  disabled={!row.file_url}
                  onClick={() => {
                    if (!row.file_url) return;
                    handleDownload(row.id);
                  }}
                  sx={{ color: "#86171F" }}
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            {/* 詳細 → /document/[id] */}
            <Tooltip title="詳細">
              <IconButton
                size="small"
                component={Link}
                href={`/document/${row.id}`}
                sx={{ color: "#5F5E5A" }}
              >
                <DescriptionIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        );
      },
    },
  ];

  return (
    // <Paper
    //   elevation={0}
    //   sx={{
    //     p: { xs: 2, sm: 3 },
    //     borderRadius: 4,
    //     bgcolor: "#FAF6EF",
    //     border: "1px solid #E5E2DC",
    //     boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
    //   }}
    // >
    <Box>
      {/* タイトル行 */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Stack direction="row" alignItems="baseline" spacing={1.5}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#2C2C2A" }}>
            書類管理
          </Typography>
          <Typography variant="body2" sx={{ color: "#888780" }}>
            {initialDocuments.length} 件
          </Typography>
        </Stack>

        {/* 検索 / フィルター / 新規追加 / カテゴリ追加 */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ xs: "stretch", sm: "center" }}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          {/* 検索 */}
          <TextField
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="書類を検索..."
            size="small"
            sx={{ bgcolor: "#fff", borderRadius: 2, minWidth: { xs: "100%", sm: 220 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: "#888780" }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          {/* フィルター（カテゴリ） */}
          {/* <Select
            value={filterCategoryId}
            onChange={(e) => {
              const v = e.target.value;
              setFilterCategoryId(Number(v));
            }}
            displayEmpty
            size="small"
            sx={{ bgcolor: "#fff", minWidth: 140 }}
            renderValue={(v) => {
              if (!v) {
                return (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <FilterAltIcon fontSize="small" sx={{ color: "#888780" }} />
                    <span>フィルター</span>
                  </Stack>
                );
              }
              const c = categories.find((c) => c.id === v);
              return c?.name ?? "—";
            }}
          >
            <MenuItem value="">
              <em>すべて</em>
            </MenuItem>
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </Select> */}

          {/* カテゴリ追加（管理画面の書類管理アコーディオンへ） */}
          <MuiButton
            component={Link}
            href="/management"
            startIcon={<CategoryIcon />}
            variant="outlined"
            sx={{
              borderColor: "#C7C2B8",
              color: "#5F5E5A",
              bgcolor: "#fff",
              "&:hover": { bgcolor: "#F1ECE3", borderColor: "#86171F" },
            }}
          >
            カテゴリ追加
          </MuiButton>

          {/* 新規追加 */}
          <MuiButton
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setAddOpen(true)}
            sx={{
              borderColor: "#86171F",
              color: "#86171F",
              bgcolor: "#fff",
              "&:hover": { bgcolor: "#86171F", color: "#fff" },
            }}
          >
            新規追加
          </MuiButton>
        </Stack>
      </Stack>

      {/* DataGrid 本体 */}
      <Box
        sx={{
          width: "100%",
          // ヘッダー＆セルのデザインを画像に合わせて柔らかい印象に
          "& .MuiDataGrid-root": {
            border: "none",
            bgcolor: "transparent",
          },
          "& .MuiDataGrid-columnHeaders": {
            bgcolor: "#F1ECE3",
            borderBottom: "1px solid #E5E2DC",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: 700,
            color: "#5F5E5A",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "1px solid #EDEAE2",
          },
          "& .MuiDataGrid-row:hover": {
            bgcolor: "rgba(134,23,31,0.04)",
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "1px solid #E5E2DC",
          },
        }}
      >
        <DataGrid
          autoHeight
          rows={gridRows}
          columns={columns}
          localeText={{
            ...jaJP.components.MuiDataGrid.defaultProps.localeText,
            noRowsLabel: "データがありません",
            toolbarDensity: "表示行数",
            footerRowSelected: (count) => `${count.toLocaleString()} 行選択中`,
            footerTotalRows: "全体の行数:",
            paginationRowsPerPage: "ページあたりの行数",
            // MuiTablePagination: {
            //   labelRowsPerPage: "ページあたりの行数",
            //   labelDisplayedRows: ({ from, to, count }: { from: number; to: number; count: number }) =>
            //     `${from.toLocaleString()}〜${to.toLocaleString()}件目 / 全${count !== -1 ? count.toLocaleString() : `より多くの`}件`,
            // },
            // MuiTablePagination: {
            //   labelRowsPerPage: "ページあたりの行数",
            //   labelDisplayedRows: ({ from, to, count }: { from: number; to: number; count: number }) =>
            //     `${from.toLocaleString()}〜${to.toLocaleString()}件目 / 全${count !== -1 ? count.toLocaleString() : `より多くの`}件`,
            // },
          }}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
          }}
          getRowHeight={() => "auto"}
          sx={{
            "& .MuiDataGrid-cell": { py: 1.5 },
          }}
        />
      </Box>

      {/* 登録ダイアログ */}
      <DocumentAddDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={() => {
          // サーバー側で revalidatePath 済みだが、念のため最新を再取得
          router.refresh();
        }}
        categories={categories}
        divisions={divisions}
      />
      </Box>
    // </Paper>
  );
}
