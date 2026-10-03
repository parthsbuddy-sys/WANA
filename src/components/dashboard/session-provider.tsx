"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getCookie, setCookie } from "@/lib/client-cookie";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export interface Session {
    id: string;
    sessionId: string;
    name: string;
    status: string;
    user?: {
        name: string | null;
        email: string;
    } | null;
}

interface SessionContextType {
    sessions: Session[];
    sessionId: string;
    setSessionId: (id: string) => void;
    refreshSessions: () => Promise<void>;
    loading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [sessionId, setSessionIdState] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchSessions = async () => {
        try {
            const res = await fetch('/api/sessions');
            if (res.ok) {
                const responseData = await res.json();
                const data: Session[] = responseData?.data || [];
                setSessions(data);

                // Sync with cookie or localStorage
                const localId = typeof window !== "undefined" ? window.localStorage.getItem("selected_sessionId") : null;
                const cookieId = getCookie("sessionId") || localId;
                
                if (cookieId && data.some((s) => s.sessionId === cookieId)) {
                    setSessionIdState(cookieId);
                    setCookie("sessionId", cookieId);
                } else if (data.length > 0) {
                    // Default to first available session
                    const first = data[0].sessionId;
                    setSessionIdState(first);
                    setCookie("sessionId", first);
                    if (typeof window !== "undefined") {
                        window.localStorage.setItem("selected_sessionId", first);
                    }
                } else {
                    setSessionIdState("");
                }
            }
        } catch (error) {
            console.error("Failed to fetch sessions:", error);
            toast.error("Failed to fetch sessions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const setSessionId = (id: string) => {
        if (!id) return;
        setSessionIdState(id);
        setCookie("sessionId", id); // Sync Cookie for SSR
        if (typeof window !== "undefined") {
            window.localStorage.setItem("selected_sessionId", id);
            window.dispatchEvent(new CustomEvent("session:changed", { detail: id }));
        }
        router.refresh(); // Sync Server Components
    };

    return (
        <SessionContext.Provider value={{ sessions, sessionId, setSessionId, refreshSessions: fetchSessions, loading }}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error("useSession must be used within a SessionProvider");
    }
    return context;
}
