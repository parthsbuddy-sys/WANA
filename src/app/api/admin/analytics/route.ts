import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { waManager } from "@/modules/whatsapp/manager";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user || user.role !== "SUPERADMIN") {
            return NextResponse.json({ status: false, message: "Forbidden - Superadmin only" }, { status: 403 });
        }

        // Today's bounds
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // 7-day bounds
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        // 1. Parallel Aggregations
        const [
            totalUsers,
            usersByRole,
            totalSessions,
            connectedSessions,
            totalMessages,
            messagesSentToday,
            messagesReceivedToday,
            totalContacts,
            totalGroups,
            totalAutoReplies,
            scheduledCount,
            recentMessages,
            usersList,
            sessionsList
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.groupBy({
                by: ['role'],
                _count: { id: true }
            }),
            prisma.session.count(),
            prisma.session.count({ where: { status: "CONNECTED" } }),
            prisma.message.count(),
            prisma.message.count({ where: { fromMe: true, timestamp: { gte: todayStart } } }),
            prisma.message.count({ where: { fromMe: false, timestamp: { gte: todayStart } } }),
            prisma.contact.count(),
            prisma.group.count(),
            prisma.autoReply.count(),
            prisma.scheduledMessage.count({ where: { status: "PENDING" } }),
            prisma.message.findMany({
                take: 10,
                orderBy: { timestamp: 'desc' },
                select: {
                    id: true,
                    remoteJid: true,
                    fromMe: true,
                    type: true,
                    timestamp: true,
                    pushName: true,
                    session: { select: { name: true, sessionId: true } }
                }
            }),
            prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    _count: {
                        select: {
                            sessions: true,
                            webhooks: true,
                            notifications: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.session.findMany({
                select: {
                    id: true,
                    sessionId: true,
                    name: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                    user: { select: { name: true, email: true } },
                    _count: {
                        select: {
                            messages: true,
                            contacts: true,
                            groups: true
                        }
                    }
                },
                orderBy: { updatedAt: 'desc' }
            })
        ]);

        // 2. 7-Day Message Trend (Daily breakdown)
        const past7DaysMessages = await prisma.message.findMany({
            where: {
                timestamp: { gte: sevenDaysAgo }
            },
            select: {
                timestamp: true,
                fromMe: true
            }
        });

        // Bucket by date (YYYY-MM-DD)
        const dailyMap: Record<string, { date: string; sent: number; received: number; total: number }> = {};
        for (let i = 0; i < 7; i++) {
            const d = new Date(sevenDaysAgo);
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            const shortLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            dailyMap[dateStr] = { date: shortLabel, sent: 0, received: 0, total: 0 };
        }

        past7DaysMessages.forEach(m => {
            const dateStr = new Date(m.timestamp).toISOString().split('T')[0];
            if (dailyMap[dateStr]) {
                if (m.fromMe) {
                    dailyMap[dateStr].sent += 1;
                } else {
                    dailyMap[dateStr].received += 1;
                }
                dailyMap[dateStr].total += 1;
            }
        });

        const messageTrafficTrend = Object.values(dailyMap);

        // 3. Live Socket Memory & Active Telemetry
        const activeMemorySessions = waManager.getAllActiveSessions();

        return NextResponse.json({
            status: true,
            data: {
                overview: {
                    totalUsers,
                    totalSessions,
                    connectedSessions,
                    disconnectedSessions: totalSessions - connectedSessions,
                    totalMessages,
                    messagesToday: messagesSentToday + messagesReceivedToday,
                    messagesSentToday,
                    messagesReceivedToday,
                    totalContacts,
                    totalGroups,
                    totalAutoReplies,
                    scheduledCount,
                    activeSocketInstances: activeMemorySessions.length
                },
                rolesBreakdown: usersByRole.reduce((acc: any, curr) => {
                    acc[curr.role] = curr._count.id;
                    return acc;
                }, { SUPERADMIN: 0, OWNER: 0, STAFF: 0 }),
                messageTrafficTrend,
                usersList,
                sessionsList,
                recentMessages,
                activeMemorySessions
            }
        });

    } catch (error: any) {
        console.error("Admin Analytics API Error:", error);
        return NextResponse.json({ status: false, message: error.message }, { status: 500 });
    }
}
