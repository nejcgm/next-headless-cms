import Image from "next/image";
import { cn } from "@shared/utils/cn";
import { isExternalHref } from "@shared/utils/url";

interface ImageTextProps {
  layout?: "image-left" | "image-right";
  image: {
    src: string;
    alt: string;
  };
  heading: string;
  body: string;
  cta?: { label: string; href: string };
}

export function ImageText({ layout = "image-left", image, heading, body, cta }: ImageTextProps) {
  const isImageLeft = layout === "image-left";
  const ctaIsExternal = cta ? isExternalHref(cta.href) : false;

  return (
    <section className="py-16 px-4 bg-[var(--color-background)]">
      <div className="max-w-6xl mx-auto">
        <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-12 items-center", isImageLeft ? "" : "lg:grid-flow-dense")}>
          <div
            className={cn(
              "relative aspect-[4/3] overflow-hidden rounded-[var(--radius)]",
              !isImageLeft && "lg:col-start-2"
            )}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className={cn(isImageLeft ? "" : "lg:col-start-1 lg:row-start-1")}>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 text-[var(--color-foreground)]">
              {heading}
            </h2>
            <p className="text-lg text-[var(--color-muted-foreground)] mb-6 leading-relaxed">
              {body}
            </p>
            {cta && (
              <a
                href={cta.href}
                target={ctaIsExternal ? "_blank" : undefined}
                rel={ctaIsExternal ? "noopener noreferrer" : undefined}
                className="inline-block border-2 border-[var(--color-primary)] text-[var(--color-primary)] px-6 py-3 rounded-[var(--radius)] font-semibold hover:bg-[var(--color-primary)] hover:text-white transition-colors"
              >
                {cta.label}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
