"use client";

import { Analytics } from "@vercel/analytics/next";
import type { TenantAnalyticsProps } from "./types";

export function TenantAnalytics({ tenant }: TenantAnalyticsProps) {
  return (
    <Analytics
      beforeSend={(event) => {
        if (!event.url) return event;
        const separator = event.url.includes("?") ? "&" : "?";
        event.url = `${event.url}${separator}tenant=${encodeURIComponent(tenant)}`;
        return event;
      }}
    />
  );
}
