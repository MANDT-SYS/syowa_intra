"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  Button,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Grid,
  Stack,
  ButtonBase,
  useMediaQuery,
  useTheme,
} from "@mui/material";

//メニューアイコン
import HomeIcon from "@mui/icons-material/Home";//ホーム
import BarChartIcon from "@mui/icons-material/BarChart";//集計
import CreateIcon from "@mui/icons-material/Create";//入力
import SettingsIcon from "@mui/icons-material/Settings";//設定
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";//項目管理
import InsertChartIcon from "@mui/icons-material/InsertChart";//オーダー検索集計
import AccountCircle from "@mui/icons-material/AccountCircle";//マイページ
import CloseIcon from "@mui/icons-material/Close";//閉じる
import LogoutIcon from "@mui/icons-material/Logout";//ログアウト
import AccessTimeIcon from "@mui/icons-material/AccessTime";//時間外労働確認    
import MenuIcon from "@mui/icons-material/Menu";//メニュー
import AppsIcon from "@mui/icons-material/Apps";//アプリ

//アプリリンク・メニュー項目
import type { HeaderAppItem, HeaderMenuItem } from "@/types/interface";

const isDev = process.env.NODE_ENV === "development";

type Props = {
  //システムタイトル
  systemTitle: string;
  //デバッグローカル
  //debugLocal: boolean;
  //ユーザー名
  userName: string;
  //メニュー項目
  menuItems: HeaderMenuItem[];
  //アプリリンク
  appLinks: HeaderAppItem[];
};

//メニューアイコンを取得
function getMenuIcon(iconKey: string) {
  switch (iconKey) {
    case "home":
      return <HomeIcon />;
    case "chart":
      return <BarChartIcon />;
    case "create":
      return <CreateIcon />;
    case "settings":
      return <SettingsIcon />;
    case "list":
      return <FormatListBulletedIcon />;
    case "insertChart":
      return <InsertChartIcon />;
    case "account":
      return <AccountCircle />;
    case "time":
      return <AccessTimeIcon />;
    default:
      return <HomeIcon />;
  }
}

export default function HeaderClient({
  systemTitle,
  //debugLocal,
  userName,
  menuItems,
  appLinks,
}: Props) {
  //ハンバーガーメニューOPENフラグ
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  //ポップオーバーOPENフラグ
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  //テーマ
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  //ポップオーバーOPENフラグ
  const popoverOpen = Boolean(anchorEl);
  //ポップオーバーID
  const popoverId = popoverOpen ? "header-apps-popover" : undefined;

  //ポップオーバーOPEN処理
  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  //ポップオーバーCLOSE処理
  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  //ハンバーガーメニュー
  const drawer = (
    <Box sx={{ width: 280 }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography variant="subtitle1">メニュー</Typography>
        <IconButton onClick={() => setDrawerOpen(false)} size="small">
          <CloseIcon />
        </IconButton>
      </Toolbar>

      <Divider />

      {/* ハンバーガーメニュー項目 */}
      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={`${item.href}-${item.label}`}
            component={Link}
            href={item.href}
            onClick={() => setDrawerOpen(false)}
          >
            <ListItemIcon>{getMenuIcon(item.iconKey)}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>

      <Divider />

      {/* ハンバーガーメニュー内のログアウトボタン */}
      <Box sx={{ p: 2 }}>
        <Button
          component={Link}
          href="/auth/logout"
          variant="outlined"
          startIcon={<LogoutIcon />}
          fullWidth
        >
          ログアウト
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" color={isDev ? "secondary" : "warning"}>
          <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
            {/* ハンバーガーメニューアイコン */}
            <IconButton
              size={isMobile ? "small" : "large"}
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 1 }}
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>

            {/* ハンバーガーメニュー項目 */}
            <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
              {drawer}
            </Drawer>

            {/* ホームアイコン */}
            <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                component={Link}
                href="/"
                color="inherit"
                size={isMobile ? "small" : "medium"}
              >
                <HomeIcon />
              </IconButton>

            {/* システムタイトル */}
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontSize: isMobile ? "0.95rem" : isTablet ? "1rem" : "1.1rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {systemTitle}
              </Typography>

            {/* ローカルの場合、ローカルモードと表示 */}
              {isDev && (
                <Typography variant="body2" sx={{ ml: 1 }}>
                  ローカルモード
                </Typography>
              )}
            </Box>

            {/* ログインユーザー・マイページボタン */}
            <IconButton
              component={Link}
              href="/my_page"
              color="inherit"
              size={isMobile ? "small" : "large"}
            >
              <AccountCircle />
              {!isMobile && (
                <Typography sx={{ ml: 1, fontSize: isTablet ? "0.95rem" : "1rem" }}>
                  {userName}
                </Typography>
              )}
            </IconButton>

            {/* 外部アプリリンクアイコン */}
            <IconButton
              id={popoverId}
              onClick={handlePopoverOpen}
              color="inherit"
              size={isMobile ? "small" : "large"}
            >
              <AppsIcon />
            </IconButton>

            {/* ログアウトボタン */}
            {!isMobile && (
              <IconButton component={Link} href="/auth/logout" color="inherit" size="large">
                <LogoutIcon />
              </IconButton>
            )}
          </Toolbar>
        </AppBar>
      </Box>

      {/* 外部アプリリンクポップオーバー */}
      <Popover
        id={popoverId}
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Grid container spacing={1} sx={{ p: 1, width: 360, maxWidth: "90vw" }}>
          {appLinks.map((item) => (
            <Grid key={item.label} size={{ xs: 4 }}>
              <ButtonBase
                component="a"
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  borderRadius: 3,
                  bgcolor: "background.paper",
                  "&:hover": { bgcolor: "action.hover" },
                  transition: "all 0.2s",
                  width: "100%",
                  height: 88,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Stack spacing={1} alignItems="center">
                  <Image
                    src={item.iconSrc}
                    alt={item.label}
                    width={48}
                    height={48}
                    style={{ objectFit: "contain" }}
                  />
                  <Typography variant="body2" fontWeight="bold" textAlign="center">
                    {item.label}
                  </Typography>
                </Stack>
              </ButtonBase>
            </Grid>
          ))}
        </Grid>
      </Popover>
    </>
  );
}