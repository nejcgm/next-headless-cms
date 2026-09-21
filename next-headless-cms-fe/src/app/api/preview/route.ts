import { draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug");

  if (secret !== process.env.PREVIEW_SECRET) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const draft = await draftMode();
  draft.enable();

  const destination = new URL(slug, request.url);
  if (searchParams.get("compose") === "1") {
    destination.searchParams.set("compose", "1");
  }

  return NextResponse.redirect(destination);
}
