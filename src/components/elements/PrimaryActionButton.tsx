import type { ButtonProps as MuiButtonProps } from "@mui/material/Button";

import Button from "@/components/elements/Button";

type PrimaryActionButtonProps = Omit<
  MuiButtonProps,
  "href" | "component" | "variant" | "color"
>;

export default function PrimaryActionButton(props: PrimaryActionButtonProps) {
  return <Button {...props} />;
}
