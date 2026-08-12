import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { env, isRevalidateSecretMisconfigured } from "@/env";
import { cacheTags } from "@core/data/cache-tags";
import { normalizeLogicalSlug } from "@core/data/strapi/strapi-query";

export async function POST(request: NextRequest) {
  if (isRevalidateSecretMisconfigured()) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 });
  }

  const secret = request.headers.get("x-revalidate-secret");
  if (secret !== env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { tenant, slug, collection } = await request.json();
    if (!tenant) {
      return NextResponse.json({ error: "Missing tenant" }, { status: 400 });
    }

    const revalidated: string[] = [];

    if (slug) {
      const tag = cacheTags.pageGroup({
        tenant,
        slug: normalizeLogicalSlug(slug),
      });
      revalidateTag(tag);
      revalidated.push(tag);
    }
    if (collection) {
      const tag = cacheTags.collection({ tenant, collection });
      revalidateTag(tag);
      revalidated.push(tag);
    }

    return NextResponse.json({ revalidated, now: Date.now() });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
