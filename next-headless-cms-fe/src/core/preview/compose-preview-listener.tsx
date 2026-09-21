"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { readComposePreviewMessage } from "./protocol";
import type { ComposePreviewListenerProps } from "./types";

export function ComposePreviewListener({
  locale,
  slug,
  adminOrigin,
}: ComposePreviewListenerProps) {
  const router = useRouter();
  const ticket = useRef(0);

  useEffect(() => {
    let origin: string;
    try {
      origin = new URL(adminOrigin).origin;
    } catch {
      return undefined;
    }

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== origin) return;
      const message = readComposePreviewMessage(event.data);
      if (!message) return;

      const current = ++ticket.current;
      void fetch("/api/compose-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          slug,
          blocks: message.blocks,
          secret: message.secret,
        }),
      }).then((response) => {
        if (response.ok && current === ticket.current) router.refresh();
      });
    };

    window.addEventListener("message", onMessage);
    if (window.parent !== window) {
      window.parent.postMessage({ type: "cms-compose-preview-ready" }, origin);
    }
    return () => window.removeEventListener("message", onMessage);
  }, [adminOrigin, locale, slug, router]);

  return null;
}
