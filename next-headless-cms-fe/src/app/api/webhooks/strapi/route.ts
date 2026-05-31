import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/env";
import { cacheTags } from "@core/data/cache-tags";
import { normalizeLogicalSlug } from "@core/data/strapi/strapi-query";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidate-secret");
  if (secret !== env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { event?: string; model?: string; entry?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { event, model, entry } = body;
  if (!event || !model) {
    return NextResponse.json({ error: "Missing event or model" }, { status: 400 });
  }

  const tenant = typeof entry?.tenant === "string" ? entry.tenant : "default";
  const revalidated: string[] = [];
  const tag = (t: string) => {
    revalidateTag(t);
    revalidated.push(t);
  };

  switch (model) {
    case "page": {
      tag(cacheTags.allPages(tenant));
      if (typeof entry?.slug === "string") {
        tag(cacheTags.pageGroup(tenant, normalizeLogicalSlug(entry.slug)));
      }
      for (const key of ["previousSlug", "oldSlug"] as const) {
        const previous = entry?.[key];
        if (typeof previous === "string") {
          tag(cacheTags.pageGroup(tenant, normalizeLogicalSlug(previous)));
        }
      }
      break;
    }
    case "navigation": {
      tag(cacheTags.navigationGroup(tenant));
      break;
    }
    default: {
      tag(cacheTags.collection(tenant, model));
      tag(cacheTags.collection(tenant, `${model}s`));
    }
  }

  return NextResponse.json({ received: true, model, event, revalidated });
}
