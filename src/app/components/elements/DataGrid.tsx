"use client";

import * as React from "react";
import {
  DataGridPro,
  type GridColDef,
  GridToolbar,
} from "@mui/x-data-grid-pro";
import {
  Box,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

type Row = {
  id: number;
  name: string;
  department: string;
  status: string;
};

const columns: GridColDef<Row>[] = [
  {
    field: "id",
    headerName: "ID",
    width: 90,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "name",
    headerName: "氏名",
    flex: 1,
    minWidth: 160,
  },
  {
    field: "department",
    headerName: "部署",
    flex: 1,
    minWidth: 140,
  },
  {
    field: "status",
    headerName: "ステータス",
    flex: 1,
    minWidth: 140,
    renderCell: (params) => {
      const value = params.value as string;

      const colorMap: Record<
        string,
        "success" | "warning" | "default" | "info"
      > = {
        在席: "success",
        外出中: "warning",
        研修中: "info",
      };

      return (
        <Chip
          label={value}
          size="small"
          color={colorMap[value] ?? "default"}
          variant="filled"
          sx={{
            fontWeight: 700,
            borderRadius: "999px",
            minWidth: 72,
          }}
        />
      );
    },
  },
];

const rows: Row[] = [
  { id: 1, name: "山田 太郎", department: "総務部", status: "在席" },
  { id: 2, name: "佐藤 花子", department: "営業部", status: "外出中" },
  { id: 3, name: "鈴木 一郎", department: "製造部", status: "研修中" },
  { id: 4, name: "高橋 美咲", department: "管理部", status: "在席" },
];

export default function ModernDataGrid() {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            社員一覧
          </Typography>
          <Typography variant="body2" color="text.secondary">
            社内メンバーの基本情報と現在のステータスを確認できます
          </Typography>
        </Box>

        <Chip
          label={`全 ${rows.length} 件`}
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 700, borderRadius: "999px" }}
        />
      </Stack>

      <Box
        sx={{
          height: 520,
          width: "100%",
          "& .MuiDataGrid-root": {
            border: "none",
            backgroundColor: "background.paper",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#f8fafc",
            borderBottom: "1px solid #e5e7eb",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: 700,
            color: "#334155",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "1px solid #f1f5f9",
          },
          "& .MuiDataGrid-row": {
            transition: "background-color 0.2s ease",
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: "#f8fafc",
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "1px solid #e5e7eb",
            backgroundColor: "#fcfcfd",
          },
          "& .MuiDataGrid-toolbarContainer": {
            p: 1,
            gap: 1,
          },
        }}
      >
        <DataGridPro
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          pageSizeOptions={[5, 10, 20]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 5, page: 0 },
            },
          }}
          slots={{
            toolbar: GridToolbar,
          }}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#dbeafe", // ヘッダーに淡い青色（例: Tailwindのblue-100相当）を設定
            },
          }}
        />
  
      </Box>
    </Paper>
  );
}