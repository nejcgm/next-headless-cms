import "server-only";

import { draftMode } from "next/headers";

export async function resolvePublicationContext(): Promise<{
  status: "published" | "draft";
  bypassCache: boolean;
}> {
  const { isEnabled } = await draftMode();
  return {
    status: isEnabled ? "draft" : "published",
    bypassCache: isEnabled,
  };
}
