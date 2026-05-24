import { NextResponse, type NextRequest } from "next/server";

// Tiny middleware: inject `x-pathname` into the request headers so the
// /manage layout can tell whether the current route is /manage/sign-in
// (where we must NOT redirect-to-sign-in on missing session, or the
// browser ends up in an infinite loop).
//
// Next 16 removed the implicit `x-invoke-path` header that earlier
// versions set, so we set our own explicitly. Scoped to /manage/* only —
// public pages stay purely cache-static.

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/manage/:path*"],
};
