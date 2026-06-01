import { NextResponse, type NextRequest } from "next/server";

// Two jobs:
//   1. /manage/* — inject `x-pathname` request header so the manage layout
//      can detect whether the current route is /manage/sign-in (and avoid
//      the infinite-redirect-to-sign-in loop).
//   2. /product/* /tf-header/* /home-XX/ /wp-* etc. — return 410 GONE
//      for legacy WordPress URLs that have NO modern equivalent. Tells
//      Google to deindex + stop re-crawling (cleaner than 404).
//      URLs WITH a modern equivalent get a 301 via next.config redirects().
//
// Next 16 removed the implicit `x-invoke-path` header that earlier
// versions set, so we set our own explicitly.

// Legacy WordPress / WooCommerce / theme-demo path prefixes that should
// 410 Gone. Match by path prefix or regex. Each pattern is a path the
// old WordPress site (or its Avista theme demo content) exposed before
// the Next.js rebuild.
// Stored WITHOUT trailing slash; check `pathname === p` OR
// `pathname.startsWith(p + "/")` so both `/wp-admin` and `/wp-admin/foo`
// hit. Next normalizes `/wp-admin/` → `/wp-admin` before middleware runs,
// so requiring the trailing slash would miss the normalized form.
const GONE_PREFIXES = [
  "/product",
  "/product-category",
  "/tf-header",
  "/tf-footer",
  "/wp-content",
  "/wp-includes",
  "/wp-admin",
  "/wp-json",
  "/Service",
  "/Team",
  "/category",
  "/tag",
] as const;

const GONE_EXACT = new Set<string>([
  "/checkout-2/",
  "/checkout-2",
  "/cart-2/",
  "/cart-2",
  "/shop-2/",
  "/shop-2",
  "/sample-page/",
  "/sample-page",
  "/sample-page-2/",
  "/sample-page-2",
  "/lost-password/",
  "/lost-password",
  // Both spellings — the original WP slug had "og" (typo) but we cover the
  // correct "of" spelling too in case Google decided to canonicalize.
  "/get-the-most-out-of-the-creativity/",
  "/get-the-most-out-of-the-creativity",
  "/get-the-most-out-og-the-creativity/",
  "/get-the-most-out-og-the-creativity",
  "/how-businesses-can-leverage-data-for-smarter-decisions/",
  "/how-businesses-can-leverage-data-for-smarter-decisions",
  "/influencer-marketing-trends-2023-what-you-need-know/",
  "/influencer-marketing-trends-2023-what-you-need-know",
]);

const GONE_REGEX = [
  /^\/home(-\d{2})?(-dark|-onepage|-onepage-dark)?\/?$/i, // /home, /home-01/, /home-02-dark/, etc.
  /^\/wp-[a-z-]+\.php\/?$/i,                              // /wp-login.php, /wp-admin.php, etc.
  /^\/[^/]+\.php\/?$/i,                                   // /xmlrpc.php, /readme.html, etc.
] as const;

function isLegacyGone(pathname: string): boolean {
  if (GONE_EXACT.has(pathname)) return true;
  for (const p of GONE_PREFIXES) {
    if (pathname === p || pathname.startsWith(p + "/")) return true;
  }
  for (const r of GONE_REGEX) {
    if (r.test(pathname)) return true;
  }
  return false;
}

function isMalformedContactUs(pathname: string): boolean {
  // /contact-us/<anything> — the suffix is usually a stray email or extra
  // path segment from a broken old link. 301 the bare /contact-us to
  // /contact via next.config; here we catch the subpaths.
  return /^\/contact-us\/.+/.test(pathname);
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Legacy WordPress paths → 410 Gone. Google sees this and deindexes
  // within ~2 crawls (vs. 404 which it keeps re-checking for months).
  if (isLegacyGone(pathname) || isMalformedContactUs(pathname)) {
    return new NextResponse(
      "Gone — this page no longer exists. The site was rebuilt in 2026 and the old URL structure is no longer in use. Please visit https://publicpulse.com.bd/ for the current site.",
      {
        status: 410,
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "public, max-age=86400, s-maxage=31536000",
          "x-robots-tag": "noindex",
        },
      }
    );
  }

  // /manage/* injection (existing behavior)
  if (pathname.startsWith("/manage")) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-pathname", pathname);
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next();
}

// Run on every public path EXCEPT Next internals + /api + our real
// static assets. We DO NOT exclude .js/.css/.png paths under legacy
// WordPress directories (/wp-*, /tf-*) — those need 410 too.
export const config = {
  matcher: [
    // Main matcher: everything that isn't a real static asset / Next internal
    "/((?!_next/static|_next/image|_next/data|api|favicon\\.ico|favicon-|apple-touch-icon|robots\\.txt$|sitemap\\.xml$|og-image\\.jpg$|manifest\\.json$|\\.well-known/|.*\\.(?:woff2?|ttf|otf|map)$).*)",
    // Explicit catch-all for WordPress legacy paths — overrides the
    // exclusion above so .js / .css under /wp-* still 410.
    "/wp-:path*",
    "/tf-:path*",
  ],
};
