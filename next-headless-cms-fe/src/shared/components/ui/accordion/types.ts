export type AccordionStyle = {
  padding?: string;
  margin?: string;
  backgroundColor?:
    | "primary"
    | "secondary"
    | "accent"
    | "background"
    | "foreground"
    | "muted"
    | "border"
    | "text-primary";
  border?: "none" | "hairline" | "invertedOutline";
  borderRadius?: string;
};

export type AccordionProps = AccordionStyle & {
  title: string;
  content: string;
  defaultOpen?: boolean;
  className?: string;
  blockId?: string;
};
