import type { ButtonProps as MuiButtonProps } from "@mui/material/Button";

import Button from "@/components/elements/Button";

type PrimaryActionLinkProps = Omit<
  MuiButtonProps,
  "href" | "onClick" | "component" | "variant" | "color"
> & {
  href: string;
  onClick?: never;
};

export default function PrimaryActionLink({
  href,
  ...props
}: PrimaryActionLinkProps) {
  return <Button href={href} {...props} />;
}
