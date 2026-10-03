import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const ip = getClientIp(request);

    // 1. Rate Limiting for Auth & Public endpoints (15 req/min)
    if (pathname.startsWith("/api/auth/") || pathname === "/api/auth/register") {
        const rateCheck = checkRateLimit(`auth:${ip}`, { limit: 15, windowMs: 60000 });
        if (!rateCheck.success) {
            return NextResponse.json(
                { status: false, message: "Too many authentication attempts. Please wait a minute.", error: "Rate limit exceeded" },
                {
                    status: 429,
                    headers: {
                        "Retry-After": Math.max(1, rateCheck.reset - Math.ceil(Date.now() / 1000)).toString(),
                        "X-RateLimit-Limit": rateCheck.limit.toString(),
                        "X-RateLimit-Remaining": "0"
                    }
                }
            );
        }
    }

    // 2. Rate Limiting for Outbound Messaging APIs (120 req/min per IP)
    if (pathname.startsWith("/api/messages/")) {
        const rateCheck = checkRateLimit(`msg:${ip}`, { limit: 120, windowMs: 60000 });
        if (!rateCheck.success) {
            return NextResponse.json(
                { status: false, message: "Outbound message rate limit exceeded. Please pace your requests.", error: "Rate limit exceeded" },
                {
                    status: 429,
                    headers: {
                        "Retry-After": Math.max(1, rateCheck.reset - Math.ceil(Date.now() / 1000)).toString(),
                        "X-RateLimit-Limit": rateCheck.limit.toString(),
                        "X-RateLimit-Remaining": "0"
                    }
                }
            );
        }
    }

    // Helper to attach security headers to responses
    const applySecurityHeaders = (res: NextResponse) => {
        res.headers.set("X-Frame-Options", "SAMEORIGIN");
        res.headers.set("X-Content-Type-Options", "nosniff");
        res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
        res.headers.set("X-XSS-Protection", "1; mode=block");
        res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");
        return res;
    };

    // Allow Next.js internals, media, and favicon
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/images") ||
        pathname.startsWith("/media") ||
        pathname.startsWith("/icon") ||
        pathname === "/favicon.ico" ||
        pathname === "/favicon.svg" ||
        pathname === "/logo.svg"
    ) {
        return applySecurityHeaders(NextResponse.next());
    }

    // Allow static asset extensions
    const staticExtensions = [".svg", ".ico", ".png", ".jpg", ".jpeg", ".webp", ".woff", ".woff2", ".ttf"];
    if (staticExtensions.some(ext => pathname.endsWith(ext))) {
        return applySecurityHeaders(NextResponse.next());
    }

    // Public routes that don't require authentication
    const publicRoutes = ["/auth/login", "/auth/register", "/api/auth", "/api/test", "/terms", "/privacy", "/docs", "/api/docs"];
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    // API routes: Check for API key or session
    if (pathname.startsWith("/api/")) {
        // Skip auth endpoints and docs
        if (pathname.startsWith("/api/auth") || pathname.startsWith("/api/test") || pathname.startsWith("/api/docs")) {
            return applySecurityHeaders(NextResponse.next());
        }

        // Check for API key in header
        const apiKey = request.headers.get("x-api-key");
        if (apiKey) {
            return applySecurityHeaders(NextResponse.next());
        }

        // Check for session auth
        const session = await auth();
        if (!session?.user) {
            return applySecurityHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
        }

        return applySecurityHeaders(NextResponse.next());
    }

    // SuperAdmin-only routes protection
    const superadminPaths = [
        "/dashboard/analytics",
        "/dashboard/system-monitor",
        "/dashboard/users",
        "/dashboard/settings",
        "/dashboard/notifications",
        "/swagger"
    ];
    const isSuperadminPath = superadminPaths.some(p => pathname.startsWith(p));

    if (isSuperadminPath) {
        const session = await auth();
        if (!session?.user) {
            const loginUrl = new URL("/auth/login", request.url);
            loginUrl.searchParams.set("callbackUrl", pathname);
            return applySecurityHeaders(NextResponse.redirect(loginUrl));
        }

        const role = (session.user as any)?.role;
        if (role !== "SUPERADMIN") {
            return applySecurityHeaders(NextResponse.redirect(new URL("/dashboard", request.url)));
        }

        return applySecurityHeaders(NextResponse.next());
    }

    // Dashboard routes: Require login
    if (pathname.startsWith("/dashboard")) {
        const session = await auth();

        if (!session?.user) {
            const loginUrl = new URL("/auth/login", request.url);
            loginUrl.searchParams.set("callbackUrl", pathname);
            return applySecurityHeaders(NextResponse.redirect(loginUrl));
        }

        return applySecurityHeaders(NextResponse.next());
    }

    // Root path — redirect to dashboard if logged in, otherwise show landing page
    if (pathname === "/") {
        const session = await auth();
        if (session?.user) {
            return applySecurityHeaders(NextResponse.redirect(new URL("/dashboard", request.url)));
        }
        return applySecurityHeaders(NextResponse.next());
    }

    // Public routes handling
    if (isPublicRoute) {
        const session = await auth();
        if (session?.user && (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register"))) {
            return applySecurityHeaders(NextResponse.redirect(new URL("/dashboard", request.url)));
        }
        return applySecurityHeaders(NextResponse.next());
    }

    // Default: require auth for everything else
    const session = await auth();
    if (!session?.user) {
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return applySecurityHeaders(NextResponse.redirect(loginUrl));
    }

    return applySecurityHeaders(NextResponse.next());
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
