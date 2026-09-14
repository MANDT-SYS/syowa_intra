import { Skeleton, Stack } from "@mui/material";
import DataGridSkeleton from "@/components/elements/DataGridSkeleton";
import PageSkeleton from "@/components/elements/PageSkeleton";

export default function DocumentLoading() {
  return (
    <PageSkeleton maxWidth={1536} label="書類一覧を読み込んでいます">
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Skeleton variant="text" width={120} height={34} />
          <Skeleton variant="text" width={52} height={24} />
        </Stack>
        <Stack direction="row" spacing={1}>
          <Skeleton variant="rounded" width={220} height={40} />
          <Skeleton variant="rounded" width={120} height={40} />
        </Stack>
      </Stack>
      <DataGridSkeleton rowCount={7} />
    </PageSkeleton>
  );
}
