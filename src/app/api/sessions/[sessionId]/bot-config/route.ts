import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import { waManager } from "@/modules/whatsapp/manager";
import { antispam } from "@/modules/whatsapp/antispam";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    const { sessionId } = await params;

    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden - Cannot access this session", error: "Forbidden - Cannot access this session" }, { status: 403 });
        }

        // @ts-ignore
        const session = await (prisma as any).session.findUnique({
            where: { sessionId },
            select: { id: true, botConfig: true }
        });

        if (!session) {
            return NextResponse.json({ status: false, message: "Session not found", error: "Session not found" }, { status: 404 });
        }

        // Return config or default if null
        session.botConfig = session.botConfig || {
            enabled: true,
            botMode: 'OWNER',
            botAllowedJids: [],
            botBlockedJids: [],
            autoReplyMode: 'ALL',
            autoReplyAllowedJids: [],
            autoReplyBlockedJids: [],
            enableSticker: true,
            enablePing: true,
            enableUptime: true,
            botName: "WINA Agent",
            removeBgApiKey: null,
            enableVideoSticker: true,
            maxStickerDuration: 10,
            prefix: "#",
            antiSpamEnabled: true,
            spamLimit: 1,
            spamInterval: 60,
            spamDelayMin: 4000,
            spamDelayMax: 10000,
            welcomeMessage: null,
            autoRead: false,
            alwaysOnline: false,
            aiEnabled: false,
            aiApiKey: null,
            aiModel: "qwen/qwen3.8-27b",
            aiPrompt: null,
            customFilterPrompt: null,
        };

        return NextResponse.json({ status: true, message: "Agent config fetched successfully", data: session.botConfig });
    } catch (error) {
        console.error("Get Agent Config Error:", error);
        return NextResponse.json({ status: false, message: "Internal Server Error", error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    const { sessionId } = await params;

    try {
        const user = await getAuthenticatedUser(request);
        if (!user) return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });

        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) return NextResponse.json({ status: false, message: "Forbidden - Cannot access this session", error: "Forbidden - Cannot access this session" }, { status: 403 });

        const body = await request.json();

        // Find session DB ID
        const session = await prisma.session.findUnique({
            where: { sessionId },
            select: { id: true }
        });

        if (!session) return NextResponse.json({ status: false, message: "Session not found", error: "Session not found" }, { status: 404 });

        // Upsert Config
        // @ts-ignore
        const config = await (prisma as any).botConfig.upsert({
            where: { sessionId: session.id },
            create: {
                sessionId: session.id,
                botName: body.botName || "WINA Agent",
                enabled: body.enabled ?? true,
                botMode: body.botMode || 'OWNER',
                botAllowedJids: body.botAllowedJids || [],
                botBlockedJids: body.botBlockedJids || [],
                autoReplyMode: body.autoReplyMode || 'ALL',
                autoReplyAllowedJids: body.autoReplyAllowedJids || [],
                autoReplyBlockedJids: body.autoReplyBlockedJids || [],

                enableSticker: body.enableSticker ?? true,
                enableVideoSticker: body.enableVideoSticker ?? true,
                maxStickerDuration: body.maxStickerDuration || 10,
                enablePing: body.enablePing ?? true,
                enableUptime: body.enableUptime ?? true,
                removeBgApiKey: body.removeBgApiKey || null,
                prefix: body.prefix || "#",
                antiSpamEnabled: body.antiSpamEnabled ?? true,
                spamLimit: body.spamLimit || 1,
                spamInterval: body.spamInterval || 60,
                spamDelayMin: body.spamDelayMin || 4000,
                spamDelayMax: body.spamDelayMax || 10000,
                welcomeMessage: body.welcomeMessage || null,
                autoRead: body.autoRead ?? false,
                alwaysOnline: body.alwaysOnline ?? false,
                aiEnabled: body.aiEnabled ?? false,
                aiApiKey: body.aiApiKey || null,
                aiModel: body.aiModel || "qwen/qwen3.8-27b",
                aiPrompt: body.aiPrompt || null,
                customFilterPrompt: body.customFilterPrompt || null,
            },
            update: {
                enabled: body.enabled !== undefined ? body.enabled : undefined,
                botMode: body.botMode,
                botAllowedJids: body.botAllowedJids,
                botBlockedJids: body.botBlockedJids,
                autoReplyMode: body.autoReplyMode,
                autoReplyAllowedJids: body.autoReplyAllowedJids,
                autoReplyBlockedJids: body.autoReplyBlockedJids,
                botName: body.botName,
                enableSticker: body.enableSticker,
                enableVideoSticker: body.enableVideoSticker,
                maxStickerDuration: body.maxStickerDuration,
                enablePing: body.enablePing,
                enableUptime: body.enableUptime,
                removeBgApiKey: body.removeBgApiKey || null,
                prefix: body.prefix,
                antiSpamEnabled: body.antiSpamEnabled,
                spamLimit: body.spamLimit,
                spamInterval: body.spamInterval,
                spamDelayMin: body.spamDelayMin,
                spamDelayMax: body.spamDelayMax,
                welcomeMessage: body.welcomeMessage,
                autoRead: body.autoRead,
                alwaysOnline: body.alwaysOnline,
                aiEnabled: body.aiEnabled,
                aiApiKey: body.aiApiKey,
                aiModel: body.aiModel,
                aiPrompt: body.aiPrompt,
                customFilterPrompt: body.customFilterPrompt,
            }
        });

        // 1. Immediately invalidate antispam config cache
        antispam.clearCache(sessionId);

        // 2. Real-time presence update if instance is active
        const instance = waManager.getInstance(sessionId);
        if (instance && instance.socket) {
            if (body.alwaysOnline !== undefined) {
                instance.socket.sendPresenceUpdate(body.alwaysOnline ? 'available' : 'unavailable').catch(() => {});
            }
        }

        return NextResponse.json({ status: true, message: "Agent config updated successfully", data: config });
    } catch (error) {
        console.error("Update Bot Config Error:", error);
        return NextResponse.json({ status: false, message: "Failed to update config", error: "Failed to update config" }, { status: 500 });
    }
}
