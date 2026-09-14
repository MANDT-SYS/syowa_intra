"use client";

import * as React from "react";
import AccountCircle from "@mui/icons-material/AccountCircle";
import {
  Box,
  Divider,
  IconButton,
  Popover,
  Stack,
  Typography,
} from "@mui/material";
import type { LoginUserProfile } from "@/types/interface";
import AuthorityChip from "@/components/elements/AuthorityChip";

type Props = {
  profile: LoginUserProfile;
  isMobile: boolean;
  isTablet: boolean;
};

const displayValue = (value: string | null): string => value ?? "―";

export default function UserInfoPopover({
  profile,
  isMobile,
  isTablet,
}: Props) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const id = open ? "header-user-info-popover" : undefined;

  return (
    <>
      <IconButton
        aria-describedby={id}
        aria-label="プロフィールを開く"
        color="inherit"
        size={isMobile ? "small" : "large"}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        <AccountCircle />
        {!isMobile && (
          <Typography sx={{ ml: 1, fontSize: isTablet ? "1.05rem" : "1.2rem" }}>
            {profile.userName}
          </Typography>
        )}
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Stack spacing={1.25} sx={{ p: 2, minWidth: 300, maxWidth: "90vw" }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <AccountCircle color="primary" fontSize="large" />
            <Typography variant="subtitle1" fontWeight="bold">
              {profile.userName}
            </Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Typography variant="body2" color="text.secondary">
              ユーザーID
            </Typography>
            <Typography variant="body2">{profile.userId}</Typography>
          </Stack>

          <Divider />

          <ProfileRow label="メールアドレス" value={displayValue(profile.email)} />
          <Box>
            <Typography variant="body2" color="text.secondary">
              所属部署
            </Typography>
            {profile.divisionNames.length > 0 ? (
              profile.divisionNames.map((divisionName) => (
                <Typography key={divisionName} variant="body2">
                  {divisionName}
                </Typography>
              ))
            ) : (
              <Typography variant="body2">―</Typography>
            )}
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              権限
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              <AuthorityChip label={displayValue(profile.authorityLabel)} />
            </Box>
          </Box>
          <ProfileRow
            label="雇用形態"
            value={displayValue(profile.employmentStatusName)}
          />
        </Stack>
      </Popover>
    </>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  );
}
