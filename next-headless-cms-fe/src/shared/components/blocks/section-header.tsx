import { cn } from "@shared/utils/cn";

interface SectionHeaderProps {
  heading: string;
  subheading?: string;
  centered?: boolean;
}

export function SectionHeader({ heading, subheading, centered = true }: SectionHeaderProps) {
  return (
    <section className="py-16 px-4 bg-[var(--color-background)]">
      <div className={cn("max-w-4xl mx-auto", centered && "text-center")}>
        <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 text-[var(--color-foreground)]">
          {heading}
        </h2>
        {subheading && (
          <p className="text-lg text-[var(--color-muted-foreground)] max-w-2xl mx-auto">
            {subheading}
          </p>
        )}
      </div>
    </section>
  );
}
