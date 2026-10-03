import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Plus,
    Wifi,
    WifiOff,
    MessageSquare,
    Bot,
    Send,
    Settings,
    QrCode,
    ArrowRight,
    Activity,
    Zap,
    TrendingUp,
    Users,
} from "lucide-react";

import { auth } from "@/lib/auth";
import { getAccessibleSessions } from "@/lib/api-auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    const sessions = await getAccessibleSessions(session.user.id!, session.user.role || "OWNER");

    const totalSessions = sessions.length;
    const connectedSessions = sessions.filter(s => s.status === 'CONNECTED').length;
    const disconnectedSessions = totalSessions - connectedSessions; // Anything not connected is disconnected
    const otherSessions = 0;

    // Fetch auto-reply count for accessible sessions
    let autoReplyCount = 0;
    try {
        const sessionIds = sessions.map(s => s.sessionId);
        if (sessionIds.length > 0) {
            autoReplyCount = await prisma.autoReply.count({
                where: { sessionId: { in: sessionIds } }
            });
        }
    } catch {
        // If auto-reply table doesn't exist yet, just show 0
    }

    const stats = [
        {
            title: "Total Sessions",
            value: totalSessions,
            icon: QrCode,
            description: "Registered sessions",
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            title: "Connected",
            value: connectedSessions,
            icon: Wifi,
            description: "Online & ready",
            color: "text-emerald-600",
            bg: "bg-emerald-50",
        },
        {
            title: "Disconnected",
            value: disconnectedSessions,
            icon: WifiOff,
            description: "Needs reconnection",
            color: "text-red-500",
            bg: "bg-red-50",
        },
        {
            title: "Auto-Reply Rules",
            value: autoReplyCount,
            icon: Zap,
            description: "Active automations",
            color: "text-amber-600",
            bg: "bg-amber-50",
        },
    ];

    const isSuperAdmin = session.user.role === "SUPERADMIN";

    const quickActions = isSuperAdmin
        ? [
            { href: "/dashboard/analytics", label: "Admin Analytics", icon: TrendingUp, description: "Traffic & user telemetry" },
            { href: "/dashboard/sessions", label: "New Session", icon: Plus, description: "Connect a new device" },
            { href: "/dashboard/users", label: "User Management", icon: Users, description: "Manage system accounts" },
            { href: "/dashboard/system-monitor", label: "System Monitor", icon: Activity, description: "Real-time OS telemetry" },
        ]
        : [
            { href: "/dashboard/sessions", label: "New Session", icon: Plus, description: "Connect a new device" },
            { href: "/dashboard/chat", label: "Send Message", icon: Send, description: "Open chat interface" },
            { href: "/dashboard/autoreply", label: "Auto Reply", icon: Zap, description: "Manage reply rules" },
            { href: "/dashboard/scheduler", label: "Scheduler", icon: Bot, description: "Schedule future broadcasts" },
        ];

    return (
        <div className="space-y-8">
            {/* Header with WINA Welcome Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500/10 via-primary/5 to-teal-500/10 border border-primary/20 p-6 sm:p-8 backdrop-blur-xl">
                <div className="relative z-10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-wider text-primary">WINA Core • WhatsApp Intelligent Next-gen Agent</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                            Welcome, {session.user.name || "Operator"}
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
                            Real-time session management, intelligent auto-reply rules, and multi-tier anti-ban protection.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/sessions">
                            <Button size="default" className="gap-2 font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30">
                                <Plus className="h-4 w-4" /> Add Session
                            </Button>
                        </Link>
                    </div>
                </div>
                {/* Background ambient accent */}
                <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title} className="glass-panel border-border/50 shadow-sm hover:shadow-md hover:shadow-primary/5 transition-all duration-300">
                            <CardContent className="p-4 sm:p-5">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{stat.title}</p>
                                        <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">{stat.value}</p>
                                        <p className="text-xs text-muted-foreground/70">{stat.description}</p>
                                    </div>
                                    <div className={`${stat.bg} p-2.5 rounded-xl border border-white/20 dark:border-white/10 dark:bg-muted shadow-sm flex-shrink-0`}>
                                        <Icon className={`h-5 w-5 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Quick Navigation</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <Link key={action.href} href={action.href}>
                                <Card className="glass-panel border-border/50 shadow-sm hover:shadow-md hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer h-full">
                                    <CardContent className="p-4 flex items-center gap-3">
                                        <div className="bg-muted/60 p-2.5 rounded-xl group-hover:bg-primary transition-colors border border-border/50 shadow-sm flex-shrink-0">
                                            <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-foreground truncate">{action.label}</p>
                                            <p className="text-xs text-muted-foreground/80 truncate">{action.description}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Sessions List */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Instances</h3>
                    <Link href="/dashboard/sessions" className="text-xs text-primary hover:text-primary/80 font-semibold flex items-center gap-1 transition-colors">
                        Manage All <ArrowRight size={14} />
                    </Link>
                </div>

                {sessions.length === 0 ? (
                    <Card className="border-dashed border-2 border-border/60 shadow-none bg-background/50">
                        <CardContent className="py-12 text-center">
                            <div className="bg-muted h-12 w-12 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <QrCode className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-semibold text-foreground mb-1">No sessions connected yet</p>
                            <p className="text-xs text-muted-foreground mb-4">Connect your first WhatsApp device to activate automated services</p>
                            <Link href="/dashboard/sessions">
                                <Button size="sm" variant="outline" className="gap-2">
                                    <Plus className="h-4 w-4" /> Create Session
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {sessions.map(s => {
                            const isConnected = s.status === 'CONNECTED';
                            const isDisconnected = !isConnected;

                            return (
                                <Link key={s.id} href={`/dashboard/sessions/${s.sessionId}`}>
                                    <Card className="glass-panel border-border/50 shadow-sm hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer h-full">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-bold text-foreground truncate">{s.name}</p>
                                                    <p className="text-xs text-muted-foreground font-mono truncate mt-1">{s.sessionId}</p>
                                                </div>
                                                <div className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0
                                                    ${isConnected ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : isDisconnected ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'}
                                                `}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : isDisconnected ? 'bg-red-400' : 'bg-amber-400'}`} />
                                                    {s.status}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
