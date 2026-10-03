"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function ApiDocsPage() {
    const { data: session, status } = useSession();
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        // Suppress Swagger UI legacy lifecycle warnings (ModelCollapse)
        const originalWarn = console.warn;
        console.warn = (...args) => {
            if (typeof args[0] === 'string' &&
                args[0].includes('UNSAFE_componentWillReceiveProps') &&
                args[0].includes('ModelCollapse')) {
                return;
            }
            originalWarn(...args);
        };

        if (status === "loading") return;

        // Auto-authorize if user is logged in as SUPERADMIN
        if (session?.user && (session.user as any).role === "SUPERADMIN") {
            setAuthorized(true);
            setLoading(false);
            return;
        }

        // Check if already authorized via session storage
        const isAuth = sessionStorage.getItem("swagger_auth") === "true";
        if (isAuth) {
            setAuthorized(true);
        }
        setLoading(false);

        return () => {
            console.warn = originalWarn;
        };
    }, [session, status]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        const inputUser = username.trim().toLowerCase();
        const inputPass = password.trim();

        const validUsername = (process.env.NEXT_PUBLIC_SWAGGER_USERNAME || "").trim().toLowerCase();
        const validPassword = (process.env.NEXT_PUBLIC_SWAGGER_PASSWORD || "").trim();

        // Validate against configured env credentials or active SuperAdmin credentials
        const isEnvValid = validUsername && validPassword && inputUser === validUsername && inputPass === validPassword;
        const isSuperAdminValid = inputUser === "katkarparth6494@gmail.com" && inputPass === "WINA6494_parth@00713";

        if (isEnvValid || isSuperAdminValid) {
            sessionStorage.setItem("swagger_auth", "true");
            setAuthorized(true);
            setError("");
        } else {
            setError("Invalid SuperAdmin credentials.");
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem("swagger_auth");
        setAuthorized(false);
        setUsername("");
        setPassword("");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    if (!authorized) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            WINA API Documentation
                        </h1>
                        <p className="text-gray-600 text-sm">
                            Please authenticate to access Swagger UI
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                placeholder="Enter username"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                placeholder="Enter password"
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            Access Documentation
                        </button>
                    </form>

                    <div className="mt-6 text-center text-xs text-slate-500">
                        <p className="flex items-center justify-center gap-1.5 font-medium">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Protected SuperAdmin API Documentation Endpoint
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 shadow-lg">
                <div className="container mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">WINA API Documentation</h1>
                        <p className="text-blue-100 text-sm mt-1">
                            Interactive API documentation with 58+ endpoints
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="container mx-auto">
                <SwaggerUI url="/api/docs" />
            </div>
        </div>
    );
}
