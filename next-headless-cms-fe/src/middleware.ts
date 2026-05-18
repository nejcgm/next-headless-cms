import { NextRequest, NextResponse } from "next/server";
import tenantConfig from "@tenant/config";

export function middleware(request: NextRequest) {
  const visiblePathname = request.nextUrl.pathname;
  const { pathname } = request.nextUrl;
  const tenantPrefix = `/${tenantConfig.id}`;

  if (pathname === tenantPrefix || pathname.startsWith(`${tenantPrefix}/`)) {
    const visible =
      pathname === tenantPrefix ? "/" : pathname.slice(tenantPrefix.length) || "/";
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-pathname", visible);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const url = request.nextUrl.clone();
  url.pathname = `${tenantPrefix}${pathname}`;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", visiblePathname);

  return NextResponse.rewrite(url, {
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    // Explicit "/" — the broad pattern below often does not match "/" alone.
    "/",
    // Simpler than nested extension regex (avoids path-to-regexp edge cases on Vercel).
    "/((?!api|_next|favicon\\.ico|robots\\.txt|sitemap).*)",
  ],
};
