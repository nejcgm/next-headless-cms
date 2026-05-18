export default function NotFound() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="text-4xl font-bold text-[var(--color-foreground)] mb-4">
          404
        </h2>
        <p className="text-xl text-[var(--color-muted-foreground)] mb-6">
          Page not found
        </p>
        <a
          href="/"
          className="inline-block bg-[var(--color-primary)] text-white px-6 py-3 rounded-[var(--radius)] font-semibold hover:opacity-90 transition-opacity"
        >
          Go home
        </a>
      </div>
    </div>
  );
}
