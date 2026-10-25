import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);
	const { pathname } = request.nextUrl;

	const isAuthRoute =
		pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
	const isProtected = pathname.startsWith("/dashboard");

	if (isProtected && !sessionCookie) {
		return NextResponse.redirect(new URL("/sign-in", request.url));
	}
	if (isAuthRoute && sessionCookie) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}
	return NextResponse.next();
}

export const config = {
	matcher: ["/dashboard/:path*", "/sign-in", "/sign-up"],
};
