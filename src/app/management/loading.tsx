import { Paper, Skeleton, Stack } from "@mui/material";
import DataGridSkeleton from "@/components/elements/DataGridSkeleton";
import PageSkeleton from "@/components/elements/PageSkeleton";

export default function ManagementLoading() {
  return (
    <PageSkeleton label="管理画面を読み込んでいます">
      <Skeleton variant="text" width={100} height={34} sx={{ mb: 2 }} />
      <Skeleton variant="rounded" width={120} height={40} sx={{ mb: 2 }} />
      <Paper
        elevation={0}
        sx={{ p: 2, bgcolor: "#fff", border: "1px solid #E5E2DC", borderRadius: 2 }}
      >
        <Skeleton variant="text" width={180} height={34} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" width={120} height={40} sx={{ mb: 2 }} />
        <Stack spacing={2}>
          <DataGridSkeleton rowCount={6} />
        </Stack>
      </Paper>
    </PageSkeleton>
  );
}
