import Image from "next/image";
import type { RoomListProps } from "./types";

export function RoomList({ heading, subheading, layout = "grid", cta, rooms }: RoomListProps) {
  if (!rooms || rooms.length === 0) {
    return (
      <section className="py-16 px-4 bg-[var(--color-background)]">
        <div className="max-w-6xl mx-auto text-center">
          {heading && (
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-3 text-[var(--color-primary)]">
              {heading}
            </h2>
          )}
          <p className="text-[var(--color-muted-foreground)]">No rooms available at this time</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-[var(--color-background)]">
      <div className="max-w-6xl mx-auto">
        {heading && (
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-3 text-[var(--color-primary)]">
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
              ? "grid grid-cols-1 md:grid-cols-2 gap-8"
              : "space-y-6"
          }
        >
          {rooms.map((room) => (
            <a
              key={room.id}
              href={`/rooms/${room.id}`}
              className="group block rounded-[var(--radius)] overflow-hidden border border-[var(--color-border)] hover:shadow-lg transition-shadow bg-white cursor-pointer"
            >
              {room.mainPhoto && (
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={room.mainPhoto}
                    alt={room.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2 gap-2">
                  <h3 className="font-heading text-xl font-semibold text-[var(--color-text-primary)]">
                    {room.name}
                  </h3>
                  <div className="text-right shrink-0">
                    <span className="text-sm text-[var(--color-muted-foreground)] block">
                      Up to {room.maxOccupancy} guests
                    </span>
                    {room.sizeM2 > 0 && (
                      <span className="text-sm text-[var(--color-muted-foreground)]">
                        {room.sizeM2} m²
                      </span>
                    )}
                  </div>
                </div>

                {room.bedTypes.length > 0 && (
                  <p className="text-sm text-[var(--color-muted-foreground)] mb-3">
                    {room.bedTypes.join(" · ")}
                  </p>
                )}

                {room.description && (
                  <p className="text-[var(--color-muted-foreground)] text-sm mb-4 line-clamp-3">
                    {room.description}
                  </p>
                )}

                {room.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {room.amenities.slice(0, 4).map((amenity, i) => (
                      <span
                        key={`${amenity}-${i}`}
                        className="text-xs px-2 py-1 bg-[var(--color-muted)] text-[var(--color-text-primary)] rounded"
                      >
                        {amenity}
                      </span>
                    ))}
                    {room.amenities.length > 4 && (
                      <span className="text-xs px-2 py-1 text-[var(--color-muted-foreground)]">
                        +{room.amenities.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                {room.views.length > 0 && (
                  <p className="text-xs text-[var(--color-primary)] font-medium">
                    {room.views.join(" · ")}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>

        {cta && (
          <div className="text-center mt-10">
            <a
              href={cta.href}
              className="inline-block border-2 border-[var(--color-primary)] text-[var(--color-primary)] px-8 py-3 rounded-[var(--radius)] font-semibold hover:bg-[var(--color-primary)] hover:text-white transition-colors"
            >
              {cta.label}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
