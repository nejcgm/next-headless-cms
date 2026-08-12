interface RichTextProps {
  content: string;
  className?: string;
}

export function RichText({ content, className }: RichTextProps) {
  return (
    <section className="py-16 px-4 bg-[var(--color-background)]">
      <div className={"max-w-3xl mx-auto prose prose-lg" + (className ? ` ${className}` : "")}>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </section>
  );
}
