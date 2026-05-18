import Image from "next/image";
import type { AboutStoryProps } from "./types";

export function AboutStory({
  kicker,
  headline,
  quote,
  body,
  image,
  imagePosition = "right",
}: AboutStoryProps) {
  const content = (
    <div className="space-y-6">
      {kicker && (
        <p className="text-sm font-semibold text-[var(--color-primary)] uppercase tracking-wide">
          {kicker}
        </p>
      )}
      <h2 className="font-heading text-3xl md:text-4xl font-bold text-[var(--color-foreground)] leading-tight">
        {headline}
      </h2>
      {quote && (
        <blockquote className="border-l-4 border-[var(--color-primary)] pl-6 py-2 text-xl text-[var(--color-foreground)] italic bg-[var(--color-muted)]/40 rounded-r-lg pr-4">
          {quote}
        </blockquote>
      )}
      <div className="space-y-4 text-[var(--color-muted-foreground)] leading-relaxed">
        {body.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </div>
  );

  const imageBlock = image ? (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius)] bg-[var(--color-muted)]">
      <Image src={image} alt="" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
    </div>
  ) : null;

  return (
    <section className="py-16 md:py-24 px-4 bg-[var(--color-background)]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className={imagePosition === "left" ? "lg:order-2" : ""}>
            {content}
          </div>
          {imageBlock && (
            <div className={imagePosition === "left" ? "lg:order-1" : ""}>
              {imageBlock}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
