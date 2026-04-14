import React from 'react'
import MuiButton from '@mui/material/Button'
import type { SxProps, Theme } from '@mui/material/styles'

type ButtonProps = React.ComponentProps<typeof MuiButton>

const baseSx: SxProps<Theme> = {
  background: "#86171F",
  color: "white",
  padding: "12px 32px",
  borderRadius: "8px",
  fontWeight: "bold",
  transition: "0.2s",
  boxShadow: "none",
  '&:hover': {
    background: "#6e1218",
    transform: "translateY(-2px)",
    boxShadow: "none",
  },
}

const Button: React.FC<ButtonProps> = ({ sx, ...rest }) => {
  return (
    <MuiButton
      variant="contained"
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