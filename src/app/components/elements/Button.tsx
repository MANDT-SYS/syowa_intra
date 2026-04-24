import React from 'react'
import MuiButton from '@mui/material/Button'
import type { SxProps, Theme } from '@mui/material/styles'
import { ConstList } from '@/utils/ConstList'

// MUI Buttonに独自色を正しく適用させるにはSxで直接値渡し（"ConstList.RED_COLOR"は実値で渡す必要あり）
type ButtonProps = React.ComponentProps<typeof MuiButton>

// baseSxでbackgroundに実際の色を指定
const baseSx: SxProps<Theme> = {
  backgroundColor: ConstList.RED_COLOR,
  color: "white",
  padding: "12px 32px",
  borderRadius: "8px",
  fontWeight: "bold",
  transition: "0.2s",
  boxShadow: "none",
  '&:hover': {
    backgroundColor: ConstList.RED_COLOR,
    transform: "translateY(-2px)",
    boxShadow: "none",
  },
}

const Button: React.FC<ButtonProps> = ({ sx, ...rest }) => {
  return (
    <MuiButton
      variant="contained"
      // sxを配列でmergeし、baseSxで指定した色とpropsのsx両方適用可能に
      sx={[
        ...(Array.isArray(baseSx) ? baseSx : [baseSx]),
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      {...rest}
    >
      {rest.children}
    </MuiButton>
  )
}

export default Button