import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const resetPasswordSchema = z.object({
    email: z.string().email().optional(),
    code: z.string().optional(),
    token: z.string().optional(),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine(data => data.token || (data.email && data.code), {
    message: "Either token or (email + code) must be provided",
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, code, token, newPassword } = resetPasswordSchema.parse(body);

        let verificationRecord = null;

        if (token) {
            verificationRecord = await prisma.verificationCode.findFirst({
                where: {
                    token,
                    type: "PASSWORD_RESET",
                },
            });
        } else if (email && code) {
            verificationRecord = await prisma.verificationCode.findFirst({
                where: {
                    email: email.toLowerCase().trim(),
                    code: code.trim(),
                    type: "PASSWORD_RESET",
                },
            });
        }

        if (!verificationRecord) {
            return NextResponse.json(
                { error: "Invalid password reset code or link. Please request a new one." },
                { status: 400 }
            );
        }

        if (new Date() > verificationRecord.expiresAt) {
            await prisma.verificationCode.delete({ where: { id: verificationRecord.id } }).catch(() => {});
            return NextResponse.json(
                { error: "This password reset code has expired. Please request a new one." },
                { status: 400 }
            );
        }

        const targetEmail = verificationRecord.email;

        const user = await prisma.user.findUnique({
            where: { email: targetEmail },
        });

        if (!user) {
            return NextResponse.json(
                { error: "No account found matching this reset request." },
                { status: 404 }
            );
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password & ensure emailVerified is set
        await prisma.user.update({
            where: { email: targetEmail },
            data: {
                password: hashedPassword,
                emailVerified: user.emailVerified || new Date(),
            },
        });

        // Clean all password reset records for this user
        await prisma.verificationCode.deleteMany({
            where: {
                email: targetEmail,
                type: "PASSWORD_RESET",
            },
        });

        // Add security notification
        const { createNotification } = await import("@/lib/notifications");
        createNotification({
            userId: user.id,
            title: "🔒 Password Updated",
            message: "Your WINA account password was changed successfully.",
            type: "WARNING",
            href: "/dashboard",
        }).catch(() => {});

        return NextResponse.json({
            success: true,
            message: "Password reset successfully! You can now sign in with your new password.",
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues?.[0]?.message || "Invalid input provided." },
                { status: 400 }
            );
        }

        console.error("Reset password error:", error);
        return NextResponse.json(
            { error: "Failed to reset password." },
            { status: 500 }
        );
    }
}
