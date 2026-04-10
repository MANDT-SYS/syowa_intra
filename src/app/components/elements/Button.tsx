import React from 'react'
import MuiButton from '@mui/material/Button'

type ButtonProps = React.ComponentProps<typeof MuiButton>

const Button: React.FC<ButtonProps> = (props) => {
  return (
    <MuiButton
      variant="contained"
      sx={{
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
      }}
      {...props}
    >
      {props.children}
    </MuiButton>
  )
}

export default Button