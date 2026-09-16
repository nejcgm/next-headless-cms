import type { ReactNode } from "react";

export type AccordionStyle = {
  padding?: string;
  margin?: string;
  backgroundColor?: string;
  borderWidth?: number;
  borderStyle?: "solid" | "dashed" | "dotted";
  borderColor?: string;
  borderRadius?: string;
};

export type AccordionProps = AccordionStyle & {
  title: string;
  defaultOpen?: boolean;
  className?: string;
  blockId?: string;
  children?: ReactNode;
};
