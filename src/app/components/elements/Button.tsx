import React from 'react'
import MuiButton from '@mui/material/Button'

type ButtonProps = React.ComponentProps<typeof MuiButton>

const Button: React.FC<ButtonProps> = (props) => {
  return (
    <MuiButton variant="contained" {...props}>
      {props.children}
    </MuiButton>
  )
}

export default Button