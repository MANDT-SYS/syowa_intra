import { Skeleton, Stack } from "@mui/material";
import PageSkeleton from "@/components/elements/PageSkeleton";

export default function CalendarLoading() {
  return (
    <PageSkeleton maxWidth={1200} label="社内カレンダーを読み込んでいます">
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Skeleton variant="rounded" width={140} height={40} />
        <Stack direction="row" spacing={1}>
          <Skeleton variant="rounded" width={112} height={40} />
          <Skeleton variant="rounded" width={80} height={40} />
        </Stack>
      </Stack>
      <Skeleton variant="text" width="40%" height={36} sx={{ mb: 2 }} />
      <Skeleton variant="rounded" width="100%" height="calc(100vh - 250px)" />
    </PageSkeleton>
  );
}
