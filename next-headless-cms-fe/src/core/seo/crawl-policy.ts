/**
 * When true, the site should not be indexed (preview deploys, explicit opt-out, etc.).
 */
export function isIndexingDisabled(): boolean {
  if (process.env.ROBOTS_DISALLOW_ALL === "1") return true;
  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv === "preview" || vercelEnv === "development") return true;
  return false;
}
