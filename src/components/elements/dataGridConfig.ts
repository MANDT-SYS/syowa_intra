import type { Theme } from "@mui/material/styles";
import type { SxProps } from "@mui/system";
import type { DataGridProps } from "@mui/x-data-grid";
import { jaJP } from "@mui/x-data-grid/locales";
import { ConstList } from "@/utils/ConstList";

type CommonDataGridStyleOptions = {
  cellPaddingY?: number;
};

export const COMMON_DATA_GRID_PAGE_SIZE_OPTIONS = [10, 25, 50];

export const commonDataGridLocaleText = {
  ...jaJP.components.MuiDataGrid.defaultProps.localeText,
  noRowsLabel: "データがありません",
  toolbarDensity: "表示行数",
  footerRowSelected: (count: number) => `${count.toLocaleString()} 行選択中`,
  footerTotalRows: "全体の行数:",
  paginationRowsPerPage: "ページあたりの行数",
};

export const commonDataGridProps = {
  autoHeight: true,
  localeText: commonDataGridLocaleText,
  disableRowSelectionOnClick: true,
  pageSizeOptions: COMMON_DATA_GRID_PAGE_SIZE_OPTIONS,
  initialState: {
    pagination: {
      paginationModel: { pageSize: 10, page: 0 },
    },
  },
  getRowHeight: () => "auto",
} satisfies Pick<
  DataGridProps,
  | "autoHeight"
  | "localeText"
  | "disableRowSelectionOnClick"
  | "pageSizeOptions"
  | "initialState"
  | "getRowHeight"
>;

export const createCommonDataGridSx = ({
  cellPaddingY = 1.2,
}: CommonDataGridStyleOptions = {}): SxProps<Theme> => ({
  border: "none",
  bgcolor: "transparent",
  "--DataGrid-t-header-background-base": `${ConstList.RED_COLOR} !important`,
  "& .MuiDataGrid-columnHeaders": {
    bgcolor: `${ConstList.RED_COLOR} !important`,
    color: "#fff",
    borderBottom: "none",
  },
  "& .MuiDataGrid-columnHeader, & .MuiDataGrid-filler, & .MuiDataGrid-scrollbarFiller": {
    bgcolor: `${ConstList.RED_COLOR} !important`,
  },
  "& .MuiDataGrid-columnHeaderTitle": {
    fontWeight: 700,
    color: "#fff",
  },
  "& .MuiDataGrid-cell": {
    borderBottom: "1px solid #EDEAE2",
    py: cellPaddingY,
  },
  "& .MuiDataGrid-virtualScroller, & .MuiDataGrid-row": {
    bgcolor: "#fff",
  },
  "& .MuiDataGrid-row:hover": {
    bgcolor: "rgba(134,23,31,0.04)",
  },
  "& .MuiDataGrid-footerContainer": {
    borderTop: "1px solid #E5E2DC",
  },
});
