import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { sendEmail, generateAlertEmailHtml } from "@/lib/email";

export interface CreateNotificationParams {
    userId: string;
    title: string;
    message: string;
    type?: "INFO" | "WARNING" | "SUCCESS" | "SYSTEM";
    href?: string;
    sendEmailAlert?: boolean;
}

/**
 * Dispatch an in-app inbox notification, real-time WebSocket event, and optional email alert.
 */
export async function createNotification({
    userId,
    title,
    message,
    type = "INFO",
    href,
    sendEmailAlert = false
}: CreateNotificationParams) {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                href,
                read: false
            }
        });

        // 1. Emit real-time WebSocket event
        const io = (global as any).io;
        if (io) {
            io.to(`user:${userId}`).emit("notification:new", {
                id: notification.id,
                userId,
                title,
                message,
                type,
                href,
                read: false,
                createdAt: notification.createdAt.toISOString()
            });
        }

        // 2. Send email notification for critical events (WARNING/SYSTEM or if requested)
        const shouldEmail = sendEmailAlert || type === "WARNING" || type === "SYSTEM";
        if (shouldEmail) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { email: true, name: true }
            });

            if (user?.email) {
                const html = generateAlertEmailHtml(title, message, href);
                sendEmail({
                    to: user.email,
                    subject: `[${process.env.APP_NAME || "WINA"}] ${title}`,
                    html
                }).catch(e => logger.error("Notification", `Failed to dispatch notification email: ${e.message}`));
            }
        }

        return notification;
    } catch (error: any) {
        logger.error("Notification", `Error creating notification for user ${userId}:`, error);
        return null;
    }
}

/**
 * Notify the specific owner of a WhatsApp session.
 */
export async function notifySessionOwner(
    sessionId: string,
    params: Omit<CreateNotificationParams, "userId">
) {
    try {
        const session = await prisma.session.findUnique({
            where: { sessionId },
            select: { userId: true, name: true }
        });

        if (!session?.userId) return null;

        return await createNotification({
            userId: session.userId,
            ...params
        });
    } catch (e: any) {
        logger.error("Notification", `Error notifying session owner for ${sessionId}:`, e);
        return null;
    }
}

/**
 * Notify all SUPERADMIN users across the platform.
 */
export async function notifySuperAdmins(
    params: Omit<CreateNotificationParams, "userId">
) {
    try {
        const superAdmins = await prisma.user.findMany({
            where: { role: "SUPERADMIN" },
            select: { id: true }
        });

        const promises = superAdmins.map(admin =>
            createNotification({
                userId: admin.id,
                ...params
            })
        );

        return await Promise.all(promises);
    } catch (e: any) {
        logger.error("Notification", `Error notifying superadmins:`, e);
        return [];
    }
}
