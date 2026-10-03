import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: '/auth/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            // @ts-ignore
            const userRole = auth?.user?.role || (auth as any)?.token?.role;
            const path = nextUrl.pathname;

            const superadminPaths = [
                '/dashboard/analytics',
                '/dashboard/system-monitor',
                '/dashboard/users',
                '/dashboard/settings',
                '/dashboard/notifications',
                '/swagger'
            ];

            const isSuperadminPath = superadminPaths.some(p => path.startsWith(p));

            if (isSuperadminPath) {
                if (!isLoggedIn) return false;
                if (userRole !== 'SUPERADMIN') {
                    return Response.redirect(new URL('/dashboard', nextUrl));
                }
                return true;
            }

            const isOnDashboard = path.startsWith('/dashboard');
            
            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn && (path === '/auth/login' || path === '/auth/register')) {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                (session.user as any).role = token.role;
            }
            return session;
        }
    },
    providers: [], // Configured in auth.ts
    session: {
        strategy: 'jwt'
    },
    trustHost: true,
} satisfies NextAuthConfig;
