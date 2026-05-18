import Image from "next/image";

interface AboutStoryProps {
  title?: string;
  subtitle?: string;
  story?: string;
  mission?: string;
  image?: string;
  yearEstablished?: string;
  highlights?: Array<{
    value: string;
    label: string;
  }>;
  imagePosition?: "left" | "right";
}

export function AboutStory({
  title = "Our Story",
  subtitle,
  story,
  mission,
  image,
  yearEstablished,
  highlights,
  imagePosition = "right",
}: AboutStoryProps) {
  return (
    <section className="py-16 px-4 bg-[var(--color-background)]">
      <div className="max-w-6xl mx-auto">
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
            imagePosition === "left" ? "lg:grid-flow-dense" : ""
          }`}
        >
          {/* Content */}
          <div className={imagePosition === "left" ? "lg:col-start-2" : ""}>
            {yearEstablished && (
              <p className="text-sm text-[var(--color-text-primary)] font-semibold mb-2">
                Est. {yearEstablished}
              </p>
            )}

            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[var(--color-primary)] mb-4">
              {title}
            </h2>

            {subtitle && (
              <p className="text-xl text-[var(--color-muted-foreground)] mb-6">
                {subtitle}
              </p>
            )}

            {story && (
              <p className="text-[var(--color-muted-foreground)] leading-relaxed mb-6">
                {story}
              </p>
            )}

            {mission && (
              <div className="p-4 bg-[var(--color-primary)]/5 border-l-4 border-[var(--color-primary)] rounded-r-lg mb-6">
                <p className="text-[var(--color-text-primary)] italic">{mission}</p>
              </div>
            )}

            {highlights && highlights.length > 0 && (
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[var(--color-border)]">
                {highlights.map((h, i) => (
                  <div key={`${h.label}-${i}`} className="text-center">
                    <p className="text-2xl font-bold text-[var(--color-primary)]">{h.value}</p>
                    <p className="text-sm text-[var(--color-muted-foreground)]">{h.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Image */}
          {image && (
            <div className={imagePosition === "left" ? "lg:col-start-1" : ""}>
              <div className="group relative aspect-[4/3] overflow-hidden rounded-[var(--radius)]">
                <Image
                  src={image}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
