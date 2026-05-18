/**
 * Shown by `app/.../loading.tsx` during client navigations (App Router Suspense).
 */
export function PageLoadingIndicator() {
  return (
    <div
      className="flex min-h-0 flex-1 flex-col bg-[var(--color-background)]"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading page"
    >
      <div className="mb-10 h-1 w-full overflow-hidden rounded-full bg-muted/60">
        <div className="navigation-load-bar h-full w-2/5 rounded-full bg-primary" />
      </div>
      <div className="flex min-h-[38vh] flex-1 flex-col items-center justify-center gap-5">
        <div className="h-11 w-11 animate-spin rounded-full border-2 border-muted border-t-primary motion-reduce:animate-none motion-reduce:border-primary/50 motion-reduce:opacity-80" />
        <p className="text-sm text-foreground">Loading…</p>
      </div>
    </div>
  );
}
