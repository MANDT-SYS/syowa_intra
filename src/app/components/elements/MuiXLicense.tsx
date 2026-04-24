"use client";

import { LicenseInfo } from '@mui/x-license';//MUI Data Grid Proのライセンスキー

LicenseInfo.setLicenseKey(process.env.NEXT_PUBLIC_MUI_DGP_LICENSE_KEY || "");

export default function MuiXLicense() {
  return null;
}