import Image from "next/image";
import { prefixPathname } from "@core/i18n/locale-path";
import tenantConfig from "@tenant/config";
import type { ProductListProps } from "./types";
import { formatCurrency } from "@shared/utils/format";

export function ProductList({
  heading,
  subheading,
  layout = "grid",
  products,
  outOfStockLabel,
  anchorId,
  locale,
}: ProductListProps) {
  const activeLocale = locale ?? tenantConfig.defaultLocale;
  const bikeHref = (slug: string) =>
    prefixPathname(`/bikes/${slug}`, activeLocale, tenantConfig.defaultLocale);

  return (
    <section
      {...(anchorId ? { id: anchorId } : {})}
      className="py-16 px-4 bg-[var(--color-background)] scroll-mt-24"
    >
      <div className="max-w-6xl mx-auto">
        {heading && (
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-3 text-[var(--color-foreground)]">
              {heading}
            </h2>
            {subheading && (
              <p className="text-[var(--color-muted-foreground)] text-lg">{subheading}</p>
            )}
          </div>
        )}
        <div
          className={
            layout === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              : "space-y-6"
          }
        >
          {products.map((product) => (
            <a
              key={product.id}
              href={bikeHref(product.slug)}
              className="group block rounded-[var(--radius)] overflow-hidden border border-[var(--color-border)] hover:shadow-lg transition-shadow bg-[var(--color-muted)]"
            >
              <div className="relative aspect-square overflow-hidden bg-[var(--color-muted)]">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
              <div className="p-4">
                <span className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wide">
                  {product.category}
                </span>
                <h3 className="font-heading text-lg font-semibold mt-1 mb-1 text-[var(--color-foreground)]">
                  {product.name}
                </h3>
                <p className="text-[var(--color-muted-foreground)] text-sm line-clamp-2">
                  {product.shortDescription}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="font-bold text-[var(--color-foreground)]">
                    {formatCurrency(product.price, "EUR")}
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-sm text-[var(--color-muted-foreground)] line-through">
                      {formatCurrency(product.compareAtPrice, "EUR")}
                    </span>
                  )}
                </div>
                {!product.inStock && (
                  <span className="text-xs text-red-500 font-medium">{outOfStockLabel}</span>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
