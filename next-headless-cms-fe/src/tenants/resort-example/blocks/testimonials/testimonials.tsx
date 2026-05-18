import type { TestimonialsProps } from "./types";

export function Testimonials({ heading, subheading, reviews }: TestimonialsProps) {
  return (
    <section className="py-16 px-4 bg-[var(--color-muted)]">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white p-6 rounded-[var(--radius)] border border-[var(--color-border)]"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${
                      i < review.rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-[var(--color-text-primary)] mb-4 italic">&ldquo;{review.content}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-semibold">
                  {review.author.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-[var(--color-text-primary)]">{review.author}</p>
                  <p className="text-sm text-[var(--color-muted-foreground)]">{review.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
