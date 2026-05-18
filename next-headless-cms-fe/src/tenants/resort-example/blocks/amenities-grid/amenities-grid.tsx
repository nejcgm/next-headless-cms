interface AmenityItem {
  icon?: string;
  title: string;
  description?: string;
}

interface AmenitiesGridProps {
  title?: string;
  subtitle?: string;
  amenities: AmenityItem[];
  columns?: 2 | 3 | 4;
  showDescription?: boolean;
}

const defaultAmenities: AmenityItem[] = [
  { icon: "wifi", title: "Free WiFi" },
  { icon: "parking", title: "Free Parking" },
  { icon: "spa", title: "Spa & Wellness" },
  { icon: "pool", title: "Indoor Pool" },
  { icon: "restaurant", title: "Restaurant" },
  { icon: "bar", title: "Bar & Lounge" },
];

const iconMap: Record<string, string> = {
  wifi: "M8.288 15.038a5.724 5.724 0 017.424 0M12 10.88a9.732 9.732 0 016.364 2.36M3.636 13.24a9.732 9.732 0 016.364-2.36M12 6.118a13.253 13.253 0 019.364 3.636M2.636 9.754A13.253 13.253 0 0112 6.118",
  parking: "M5 10v10a2 2 0 002 2h9a2 2 0 002-2V10M5 10V7a2 2 0 012-2h10a2 2 0 012 2v3M5 10h14",
  spa: "M12 3v18m-6-6h12M6 9h12M6 3h12",
  pool: "M12 3c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9zm0 0c-2.5 0-4.5 4.03-4.5 9s2 9 4.5 9 4.5-4.03 4.5-9-2-9-4.5-9z",
  restaurant: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
  bar: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  ski: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  fireplace: "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z",
  pet: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  gym: "M4 6h16M4 12h16m-7 6h7",
};

export function AmenitiesGrid({
  title = "Amenities & Services",
  subtitle,
  amenities = defaultAmenities,
  columns = 3,
  showDescription = true,
}: AmenitiesGridProps) {
  const colClass = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
  }[columns];

  return (
    <section className="py-16 px-4 bg-[var(--color-background)]">
      <div className="max-w-6xl mx-auto">
        {title && (
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[var(--color-primary)] mb-3">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[var(--color-muted-foreground)] text-lg">{subtitle}</p>
            )}
          </div>
        )}

        <div className={`grid ${colClass} gap-6`}>
          {amenities.map((amenity, i) => (
            <div
              key={`${amenity.title}-${i}`}
              className="p-6 bg-white rounded-[var(--radius)] border border-[var(--color-border)] hover:shadow-lg transition-shadow"
            >
              {amenity.icon && (
                <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-[var(--color-primary)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={iconMap[amenity.icon] || iconMap.wifi} />
                  </svg>
                </div>
              )}
              <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">{amenity.title}</h3>
              {showDescription && amenity.description && (
                <p className="text-sm text-[var(--color-muted-foreground)]">{amenity.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
