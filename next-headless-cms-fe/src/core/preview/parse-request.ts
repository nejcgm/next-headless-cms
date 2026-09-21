import type { ComposePreviewRequest } from "./types";

export function parseComposePreviewRequest(
  body: unknown,
  expectedSecret: string | undefined
): ComposePreviewRequest {
  if (body == null || typeof body !== "object") {
    return { ok: false, status: 400, error: "Invalid body" };
  }

  const { slug, locale, blocks, secret } = body as {
    slug?: unknown;
    locale?: unknown;
    blocks?: unknown;
    secret?: unknown;
  };

  if (typeof slug !== "string" || !slug.startsWith("/")) {
    return { ok: false, status: 400, error: "Invalid slug" };
  }
  if (typeof locale !== "string" || !locale) {
    return { ok: false, status: 400, error: "Invalid locale" };
  }
  if (!Array.isArray(blocks)) {
    return { ok: false, status: 400, error: "Invalid blocks" };
  }
  if (!expectedSecret || secret !== expectedSecret) {
    return { ok: false, status: 401, error: "Invalid token" };
  }

  return { ok: true, locale, slug, blocks };
}
