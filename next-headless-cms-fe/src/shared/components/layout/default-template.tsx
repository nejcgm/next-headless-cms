interface DefaultTemplateProps {
  children: React.ReactNode;
}

export default function DefaultTemplate({ children }: DefaultTemplateProps) {
  return <div className="flex flex-col min-h-screen">{children}</div>;
}
