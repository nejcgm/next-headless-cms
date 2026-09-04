export type AccordionStyle = {
  padding?: string;
  margin?: string;
  backgroundColor?: string;
  border?: string;
  borderRadius?: string;
};

export type AccordionProps = AccordionStyle & {
  title: string;
  content: string;
  defaultOpen?: boolean;
  className?: string;
  blockId?: string;
};
