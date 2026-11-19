/**
 * Route guard (Next.js 16 `proxy` convention).
 *
 * Only checks for the presence of the HttpOnly access cookie; token
 * validity is always decided by the backend. The refresh cookie is scoped
 * to `/api/auth/`, so it cannot be refreshed from here.
 */

import { type NextRequest, NextResponse } from "next/server";

const ACCESS_TOKEN_COOKIE = "access_token";

const PROTECTED_ROUTE_PREFIXES = ["/modules", "/users", "/intranet_acces"] as const;

function isProtectedPath(pathname: string): boolean {
	return PROTECTED_ROUTE_PREFIXES.some(
		(prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
	);
}

export function proxy(request: NextRequest): NextResponse {
	const { pathname, search } = request.nextUrl;

	if (!isProtectedPath(pathname) || request.cookies.has(ACCESS_TOKEN_COOKIE)) {
		return NextResponse.next();
	}

	const recoverUrl = request.nextUrl.clone();
	recoverUrl.pathname = "/auth/recover";
	recoverUrl.search = "";
	recoverUrl.searchParams.set("next", `${pathname}${search}`);

	return NextResponse.redirect(recoverUrl);
}

export const config = {
	matcher: ["/modules/:path*", "/users/:path*", "/intranet_acces/:path*"],
};
