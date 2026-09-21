import { NextResponse } from "next/server";
import "@core/init";
import tenantConfig from "@tenant/config";
import { parseComposePreviewRequest } from "@core/preview/parse-request";
import { writeComposePreview } from "@core/preview/compose-session";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = parseComposePreviewRequest(body, process.env.PREVIEW_SECRET);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }

  writeComposePreview({
    locale: parsed.locale,
    slug: parsed.slug,
    rawBlocks: parsed.blocks,
    tenantId: tenantConfig.id,
  });

  return NextResponse.json({ ok: true });
}
