"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Activity,
    Users,
    QrCode,
    MessageSquare,
    Send,
    Inbox,
    Shield,
    ShieldAlert,
    Wifi,
    WifiOff,
    Zap,
    CalendarClock,
    RefreshCw,
    TrendingUp,
    Server,
    ExternalLink
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from "recharts";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function AdminAnalyticsPage() {
    const { data: session } = useSession();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAnalytics = async () => {
        try {
            const res = await fetch("/api/admin/analytics");
            if (res.ok) {
                const json = await res.json();
                if (json.status) {
                    setData(json.data);
                }
            }
        } catch (e) {
            console.error("Failed to load admin analytics", e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Auto-refresh every 6 seconds when active
    useEffect(() => {
        let isVisible = true;
        const handleVisibility = () => {
            isVisible = document.visibilityState === "visible";
            if (isVisible) fetchAnalytics();
        };

        document.addEventListener("visibilitychange", handleVisibility);
        fetchAnalytics();

        const timer = setInterval(() => {
            if (isVisible) fetchAnalytics();
        }, 6000);

        return () => {
            clearInterval(timer);
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, []);

    if (session?.user?.role !== "SUPERADMIN") {
        return (
            <div className="flex h-[75vh] items-center justify-center">
                <div className="text-center space-y-4 max-w-sm">
                    <ShieldAlert className="mx-auto h-12 w-12 text-red-500/60" />
                    <h2 className="text-2xl font-bold">Admin Hub Restricted</h2>
                    <p className="text-sm text-muted-foreground">
                        Comprehensive system-wide analytics and real-time user monitoring are restricted to Super Administrators.
                    </p>
                </div>
            </div>
        );
    }

    if (loading && !data) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">System & User Analytics</h1>
                        <p className="text-sm text-muted-foreground">Loading real-time platform telemetry...</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-2xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-80 lg:col-span-2 rounded-2xl" />
                    <Skeleton className="h-80 rounded-2xl" />
                </div>
            </div>
        );
    }

    const { overview, rolesBreakdown, messageTrafficTrend, usersList, sessionsList, recentMessages } = data || {};

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
                        Platform Analytics & User Telemetry
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                        </span>
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Global real-time overview of message throughput, WhatsApp socket health, and registered user activity.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 rounded-xl"
                        onClick={() => {
                            setRefreshing(true);
                            fetchAnalytics();
                        }}
                        disabled={refreshing}
                    >
                        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh Live Data
                    </Button>
                    <Link href="/dashboard/system-monitor">
                        <Button size="sm" variant="default" className="gap-2 rounded-xl font-medium">
                            <Server className="h-4 w-4" /> Hardware Monitor
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Top 4 Hero Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="glass-panel border-border/50 shadow-sm hover:shadow-md transition-all">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Messages</p>
                                <h3 className="text-2xl sm:text-3xl font-black text-foreground mt-1">{overview?.totalMessages?.toLocaleString()}</h3>
                                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" /> +{overview?.messagesToday || 0} today
                                </p>
                            </div>
                            <div className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/20">
                                <MessageSquare className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-panel border-border/50 shadow-sm hover:shadow-md transition-all">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">WhatsApp Sockets</p>
                                <h3 className="text-2xl sm:text-3xl font-black text-foreground mt-1">{overview?.totalSessions}</h3>
                                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                                    {overview?.connectedSessions} Online ({overview?.disconnectedSessions} Offline)
                                </p>
                            </div>
                            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <QrCode className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-panel border-border/50 shadow-sm hover:shadow-md transition-all">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Registered Accounts</p>
                                <h3 className="text-2xl sm:text-3xl font-black text-foreground mt-1">{overview?.totalUsers}</h3>
                                <p className="text-[11px] text-muted-foreground mt-1">
                                    {rolesBreakdown?.SUPERADMIN} Admins • {rolesBreakdown?.OWNER} Owners • {rolesBreakdown?.STAFF} Staff
                                </p>
                            </div>
                            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                <Users className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-panel border-border/50 shadow-sm hover:shadow-md transition-all">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Automation Rules</p>
                                <h3 className="text-2xl sm:text-3xl font-black text-foreground mt-1">{overview?.totalAutoReplies}</h3>
                                <p className="text-[11px] text-muted-foreground mt-1">
                                    {overview?.scheduledCount || 0} scheduled broadcasts queued
                                </p>
                            </div>
                            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                <Zap className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts & System Breakdown Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 7-Day Message Traffic Flow */}
                <Card className="lg:col-span-2 glass-panel border-border/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-bold flex items-center justify-between">
                            <span>7-Day Message Volume Trends</span>
                            <Badge variant="outline" className="text-xs font-normal">Sent vs Received</Badge>
                        </CardTitle>
                        <CardDescription>Daily breakdown of outgoing vs incoming WhatsApp payloads across all sessions.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={messageTrafficTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                                    <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "8px", color: "#fff" }}
                                    />
                                    <Legend iconType="circle" />
                                    <Area type="monotone" dataKey="sent" name="Outgoing (Sent)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSent)" />
                                    <Area type="monotone" dataKey="received" name="Incoming (Received)" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorReceived)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* System Distribution Summary */}
                <Card className="glass-panel border-border/50 flex flex-col justify-between">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">System Status Summary</CardTitle>
                        <CardDescription>Live state distribution across modules.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold">
                                <span className="text-muted-foreground">Session Health</span>
                                <span className="text-foreground">{overview?.connectedSessions} / {overview?.totalSessions} Connected</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
                                <div
                                    className="bg-emerald-500 h-full transition-all"
                                    style={{ width: `${overview?.totalSessions ? (overview.connectedSessions / overview.totalSessions) * 100 : 0}%` }}
                                />
                                <div
                                    className="bg-red-400 h-full transition-all"
                                    style={{ width: `${overview?.totalSessions ? (overview.disconnectedSessions / overview.totalSessions) * 100 : 0}%` }}
                                />
                            </div>
                        </div>

                        <div className="pt-2 border-t border-border/40 space-y-2.5 text-xs">
                            <div className="flex justify-between items-center py-1">
                                <span className="text-muted-foreground flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Total Contacts Tracked</span>
                                <span className="font-bold text-foreground">{overview?.totalContacts?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-muted-foreground flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Groups Managed</span>
                                <span className="font-bold text-foreground">{overview?.totalGroups?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-muted-foreground flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" /> Auto-Reply Keywords</span>
                                <span className="font-bold text-foreground">{overview?.totalAutoReplies}</span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-muted-foreground flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5" /> Pending Scheduled Broadcasts</span>
                                <span className="font-bold text-foreground">{overview?.scheduledCount}</span>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-border/40">
                            <Link href="/dashboard/users">
                                <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 rounded-xl">
                                    <Users className="h-3.5 w-3.5" /> Manage All User Roles
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* User Activity & Telemetry Directory */}
            <Card className="glass-panel border-border/50">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold">User Accounts & Session Allocation</CardTitle>
                        <CardDescription>Live breakdown of all registered platform operators and their instances.</CardDescription>
                    </div>
                    <Link href="/dashboard/users">
                        <Button variant="ghost" size="sm" className="text-xs gap-1">
                            Full User List <ExternalLink className="h-3 w-3" />
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-border/50 text-muted-foreground font-semibold">
                                <tr>
                                    <th className="pb-3 px-3">User</th>
                                    <th className="pb-3 px-3">Role</th>
                                    <th className="pb-3 px-3">Sessions</th>
                                    <th className="pb-3 px-3">Webhooks</th>
                                    <th className="pb-3 px-3">Registered</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {usersList?.map((u: any) => (
                                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="py-3 px-3">
                                            <p className="font-semibold text-foreground">{u.name || "Operator"}</p>
                                            <p className="text-[11px] text-muted-foreground">{u.email}</p>
                                        </td>
                                        <td className="py-3 px-3">
                                            <Badge
                                                variant={u.role === "SUPERADMIN" ? "destructive" : u.role === "OWNER" ? "default" : "secondary"}
                                                className="text-[10px] px-2 py-0.5 font-bold"
                                            >
                                                {u.role}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-3 font-semibold">
                                            {u._count?.sessions || 0} session{(u._count?.sessions || 0) !== 1 ? 's' : ''}
                                        </td>
                                        <td className="py-3 px-3 text-muted-foreground font-mono">
                                            {u._count?.webhooks || 0}
                                        </td>
                                        <td className="py-3 px-3 text-muted-foreground">
                                            {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Active WhatsApp Sockets & Instances */}
            <Card className="glass-panel border-border/50">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold">Global WhatsApp Session Sockets</CardTitle>
                        <CardDescription>Live status, message count, and owner allocation per instance.</CardDescription>
                    </div>
                    <Link href="/dashboard/sessions">
                        <Button variant="ghost" size="sm" className="text-xs gap-1">
                            Manage Sessions <ExternalLink className="h-3 w-3" />
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-border/50 text-muted-foreground font-semibold">
                                <tr>
                                    <th className="pb-3 px-3">Session Name & ID</th>
                                    <th className="pb-3 px-3">Owner</th>
                                    <th className="pb-3 px-3">Status</th>
                                    <th className="pb-3 px-3">Total Messages</th>
                                    <th className="pb-3 px-3">Contacts</th>
                                    <th className="pb-3 px-3">Last Sync</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {sessionsList?.map((s: any) => {
                                    const isConn = s.status === "CONNECTED";
                                    return (
                                        <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="py-3 px-3">
                                                <p className="font-semibold text-foreground">{s.name}</p>
                                                <p className="text-[11px] font-mono text-muted-foreground">{s.sessionId}</p>
                                            </td>
                                            <td className="py-3 px-3">
                                                <p className="font-medium text-foreground">{s.user?.name || "Admin"}</p>
                                                <p className="text-[10px] text-muted-foreground">{s.user?.email}</p>
                                            </td>
                                            <td className="py-3 px-3">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                    isConn
                                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                                        : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                                                }`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${isConn ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`} />
                                                    {s.status}
                                                </div>
                                            </td>
                                            <td className="py-3 px-3 font-semibold">
                                                {s._count?.messages?.toLocaleString() || 0}
                                            </td>
                                            <td className="py-3 px-3 text-muted-foreground">
                                                {s._count?.contacts || 0} contacts
                                            </td>
                                            <td className="py-3 px-3 text-muted-foreground">
                                                {formatDistanceToNow(new Date(s.updatedAt), { addSuffix: true })}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
