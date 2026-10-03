"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw, Search, X, Check, ChevronDown, Plus, Smartphone } from "lucide-react";
import { useSession } from "./session-provider";
import Link from "next/link";

export function SessionSelector() {
    const { sessions, sessionId, setSessionId, loading, refreshSessions } = useSession();
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const searchInputRef = useRef<HTMLInputElement>(null);

    const selectedSession = sessions.find(s => s.sessionId === sessionId);

    // Filter sessions based on search query (name, sessionId, owner email/name, or status)
    const filteredSessions = useMemo(() => {
        if (!searchQuery.trim()) return sessions;
        const q = searchQuery.toLowerCase().trim();
        return sessions.filter(s => {
            const nameMatch = s.name?.toLowerCase().includes(q);
            const idMatch = s.sessionId?.toLowerCase().includes(q);
            const ownerEmailMatch = s.user?.email?.toLowerCase().includes(q);
            const ownerNameMatch = s.user?.name?.toLowerCase().includes(q);
            const statusMatch = s.status?.toLowerCase().includes(q);
            return nameMatch || idMatch || ownerEmailMatch || ownerNameMatch || statusMatch;
        });
    }, [sessions, searchQuery]);

    // Focus search input when popover opens
    useEffect(() => {
        if (open) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 50);
        } else {
            setSearchQuery("");
        }
    }, [open]);

    const handleSelect = (targetSessionId: string) => {
        setSessionId(targetSessionId);
        setOpen(false);
    };

    return (
        <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden xl:inline">Session:</span>
            
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        disabled={loading || sessions.length === 0}
                        className="h-9 w-[150px] sm:w-[210px] md:w-[250px] border border-border/60 bg-background/80 hover:bg-muted/50 transition-all rounded-xl shadow-xs focus:ring-2 focus:ring-primary/20 px-3 flex items-center justify-between text-left cursor-pointer outline-none disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        <div className="flex items-center gap-2 truncate text-left min-w-0 flex-1 mr-1">
                            {selectedSession ? (
                                <>
                                    <span className="relative flex h-2 w-2 shrink-0">
                                        {selectedSession.status === "CONNECTED" && (
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                        )}
                                        <span className={`relative inline-flex rounded-full h-2 w-2 ${selectedSession.status === "CONNECTED" ? "bg-emerald-500" : "bg-destructive"}`} />
                                    </span>
                                    <span className="truncate font-medium text-xs sm:text-sm text-foreground">{selectedSession.name}</span>
                                </>
                            ) : (
                                <span className="text-xs text-muted-foreground truncate">{loading ? "Loading..." : "Select Session"}</span>
                            )}
                        </div>
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground opacity-60 group-hover:opacity-100 shrink-0 transition-transform duration-200" />
                    </button>
                </PopoverTrigger>

                <PopoverContent className="w-[280px] sm:w-[340px] p-0 rounded-2xl border border-border/60 shadow-2xl bg-popover/95 backdrop-blur-xl z-50 overflow-hidden" align="end" sideOffset={6}>
                    {/* Search Header Bar */}
                    <div className="p-2.5 border-b border-border/50 bg-muted/20">
                        <div className="relative flex items-center">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                ref={searchInputRef}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && filteredSessions.length > 0) {
                                        handleSelect(filteredSessions[0].sessionId);
                                    } else if (e.key === 'Escape') {
                                        setOpen(false);
                                    }
                                }}
                                placeholder="Search by name, ID, or owner..."
                                className="h-9 pl-8 pr-8 text-xs bg-background/80 border-border/50 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/30"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground p-0.5 rounded-full hover:bg-muted transition-colors"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Sessions List */}
                    <div className="max-h-[280px] overflow-y-auto p-1.5 space-y-1">
                        {filteredSessions.length === 0 ? (
                            <div className="py-8 px-4 text-center">
                                <Smartphone className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                                <p className="text-xs font-semibold text-muted-foreground">No sessions found</p>
                                <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                                    {searchQuery ? `No matches for "${searchQuery}"` : "No WhatsApp sessions available."}
                                </p>
                            </div>
                        ) : (
                            filteredSessions.map((s) => {
                                const isSelected = s.sessionId === sessionId;
                                const isConnected = s.status === "CONNECTED";

                                return (
                                    <button
                                        key={s.sessionId}
                                        type="button"
                                        onClick={() => handleSelect(s.sessionId)}
                                        className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-colors cursor-pointer group ${
                                            isSelected
                                                ? "bg-primary/10 text-primary hover:bg-primary/15"
                                                : "hover:bg-muted/60 text-foreground"
                                        }`}
                                    >
                                        <span className="relative flex h-2 w-2 shrink-0">
                                            {isConnected && (
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                            )}
                                            <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? "bg-emerald-500" : "bg-destructive"}`} />
                                        </span>

                                        <div className="flex flex-col min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5 justify-between">
                                                <span className={`text-xs font-semibold truncate ${isSelected ? "text-primary" : "text-foreground"}`}>
                                                    {s.name}
                                                </span>
                                                {s.user && (
                                                    <span className="text-[9px] px-1.5 py-0.2 bg-muted text-muted-foreground group-hover:bg-background rounded font-mono truncate max-w-[120px] shrink-0 border border-border/40">
                                                        {s.user.email}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground font-mono truncate mt-0.5">
                                                {s.sessionId}
                                            </span>
                                        </div>

                                        {isSelected && (
                                            <Check className="h-4 w-4 text-primary shrink-0 ml-1" />
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Popover Footer */}
                    <div className="p-2 border-t border-border/50 bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground px-3">
                        <span>
                            {filteredSessions.length} of {sessions.length} session{sessions.length !== 1 ? "s" : ""}
                        </span>
                        <Link
                            href="/dashboard/sessions"
                            onClick={() => setOpen(false)}
                            className="text-primary hover:underline font-semibold flex items-center gap-1"
                        >
                            <Plus className="h-3 w-3" /> Add / Manage
                        </Link>
                    </div>
                </PopoverContent>
            </Popover>

            <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 hover:bg-muted/50 rounded-xl shrink-0 cursor-pointer"
                onClick={refreshSessions}
                title="Refresh Sessions"
                disabled={loading}
            >
                <RefreshCw className={`h-4 w-4 text-muted-foreground hover:text-foreground ${loading ? 'animate-spin' : ''}`} />
            </Button>
        </div>
    );
}
