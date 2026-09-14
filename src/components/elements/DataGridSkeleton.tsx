import { Box, Paper, Skeleton, Stack } from "@mui/material";

type DataGridSkeletonProps = {
  rowCount?: number;
};

export default function DataGridSkeleton({ rowCount = 6 }: DataGridSkeletonProps) {
  return (
    <Paper
      elevation={0}
      aria-hidden="true"
      sx={{
        overflow: "hidden",
        bgcolor: "#fff",
        border: "1px solid #E5E2DC",
        borderRadius: 2,
      }}
    >
      <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #E5E2DC" }}>
        <Stack direction="row" spacing={3} alignItems="center">
          <Skeleton variant="text" width="8%" height={28} />
          <Skeleton variant="text" width="34%" height={28} />
          <Skeleton variant="text" width="20%" height={28} />
          <Skeleton variant="text" width="16%" height={28} />
        </Stack>
      </Box>

      {Array.from({ length: rowCount }, (_, index) => (
        <Box
          key={index}
          sx={{ px: 2, py: 1.6, borderBottom: "1px solid #EDEAE2" }}
        >
          <Stack direction="row" spacing={3} alignItems="center">
            <Skeleton variant="text" width="8%" height={24} />
            <Skeleton variant="text" width="34%" height={24} />
            <Skeleton variant="text" width="20%" height={24} />
            <Skeleton variant="rounded" width="12%" height={26} />
          </Stack>
        </Box>
      ))}

      <Stack
        direction="row"
        justifyContent="flex-end"
        spacing={2}
        sx={{ px: 2, py: 1.5 }}
      >
        <Skeleton variant="text" width={130} height={24} />
        <Skeleton variant="text" width={80} height={24} />
      </Stack>
    </Paper>
  );
}
