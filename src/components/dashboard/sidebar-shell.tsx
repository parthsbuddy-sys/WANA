"use client";

import { SidebarNav } from "./sidebar-nav";
import { useSidebar } from "./sidebar-context";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { WinaLogo } from "@/components/ui/wina-logo";

interface SidebarShellProps {
    appName: string;
    userName?: string | null;
    userEmail?: string | null;
    version: string;
}

export function SidebarShell({ appName, userName, userEmail, version }: SidebarShellProps) {
    const { isCollapsed } = useSidebar();

    return (
        <aside
            className={`
                bg-background/80 backdrop-blur-xl border-r border-border/40
                hidden md:flex flex-col h-full sticky left-0 top-0 z-20
                shadow-[1px_0_12px_-4px_rgba(0,0,0,0.08)]
                transition-all duration-300 ease-in-out
                ${isCollapsed ? "w-[72px]" : "w-[260px]"}
            `}
        >
            {/* Logo / Brand */}
            <div className={`border-b border-border/30 transition-all duration-300 ${isCollapsed ? "px-3 py-4" : "px-5 py-4"}`}>
                {isCollapsed ? (
                    <div className="flex justify-center">
                        <div className="h-10 w-10 flex items-center justify-center drop-shadow-md">
                            <WinaLogo size={36} idPrefix="sidebar-collapsed" />
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex items-center justify-center drop-shadow-md flex-shrink-0">
                            <WinaLogo size={38} idPrefix="sidebar-full" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                                <h1 className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-primary to-teal-300">
                                    {appName || "WINA"}
                                </h1>
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
                                    PRO
                                </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-medium truncate">WhatsApp Intelligent Next-gen Agent</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <SidebarNav />

            {/* User Footer */}
            <div 
                suppressHydrationWarning={true}
                className={`border-t border-border/30 bg-background/40 transition-all duration-300 ${isCollapsed ? "p-2" : "p-4"}`}
            >
                {isCollapsed ? (
                    <div suppressHydrationWarning={true} className="flex flex-col items-center gap-2">
                        <div suppressHydrationWarning={true} className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center text-xs font-bold text-primary">
                            {userName?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: "/auth/login" })}
                            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                ) : (
                    <>
                        <div suppressHydrationWarning={true} className="flex items-center gap-2.5 mb-3">
                            <div 
                                suppressHydrationWarning={true}
                                className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center text-xs font-bold text-primary border border-primary/10"
                            >
                                {userName?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <div suppressHydrationWarning={true} className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">{userName || "User"}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{userEmail}</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full flex items-center justify-center gap-2 text-xs h-8 rounded-lg border-border/40 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
                            onClick={() => signOut({ callbackUrl: "/auth/login" })}
                        >
                            <LogOut size={14} /> Sign Out
                        </Button>
                        <p className="text-[9px] text-muted-foreground/50 text-center mt-2 font-mono">v{version}</p>
                    </>
                )}
            </div>
        </aside>
    );
}
