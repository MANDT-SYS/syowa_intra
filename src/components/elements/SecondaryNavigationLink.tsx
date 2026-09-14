import type { ButtonProps as MuiButtonProps } from "@mui/material/Button";
import MuiButton from "@mui/material/Button";
import type { SxProps, Theme } from "@mui/material/styles";

type SecondaryNavigationLinkProps = Omit<
  MuiButtonProps,
  "href" | "onClick" | "component" | "variant" | "color"
> & {
  href: string;
  onClick?: never;
};

const baseSx: SxProps<Theme> = {
  borderColor: "#C7C2B8",
  color: "#5F5E5A",
  bgcolor: "#fff",
  "&:hover": {
    borderColor: "#86171F",
    color: "#86171F",
    bgcolor: "#F1ECE3",
  },
};

export default function SecondaryNavigationLink({
  href,
  sx,
  ...props
}: SecondaryNavigationLinkProps) {
  return (
    <MuiButton
      href={href}
      variant="outlined"
      sx={[
        ...(Array.isArray(baseSx) ? baseSx : [baseSx]),
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      {...props}
    />
  );
}
