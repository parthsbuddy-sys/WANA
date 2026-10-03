import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const verifySchema = z.object({
    email: z.string().email().optional(),
    code: z.string().optional(),
    token: z.string().optional(),
}).refine(data => data.token || (data.email && data.code), {
    message: "Either token or (email + code) must be provided",
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, code, token } = verifySchema.parse(body);

        let verificationRecord = null;

        if (token) {
            verificationRecord = await prisma.verificationCode.findFirst({
                where: {
                    token,
                    type: "EMAIL_VERIFICATION",
                },
            });
        } else if (email && code) {
            verificationRecord = await prisma.verificationCode.findFirst({
                where: {
                    email: email.toLowerCase().trim(),
                    code: code.trim(),
                    type: "EMAIL_VERIFICATION",
                },
            });
        }

        if (!verificationRecord) {
            return NextResponse.json(
                { error: "Invalid verification code or link. Please check and try again." },
                { status: 400 }
            );
        }

        if (new Date() > verificationRecord.expiresAt) {
            // Delete expired record
            await prisma.verificationCode.delete({ where: { id: verificationRecord.id } }).catch(() => {});
            return NextResponse.json(
                { error: "Verification code has expired. Please request a new code." },
                { status: 400 }
            );
        }

        const targetEmail = verificationRecord.email;

        // Find and update the user
        const user = await prisma.user.findUnique({
            where: { email: targetEmail },
        });

        if (!user) {
            return NextResponse.json(
                { error: "No user account found matching this verification code." },
                { status: 404 }
            );
        }

        // Mark user as email verified
        await prisma.user.update({
            where: { email: targetEmail },
            data: {
                emailVerified: new Date(),
            },
        });

        // Remove all email verification records for this user
        await prisma.verificationCode.deleteMany({
            where: {
                email: targetEmail,
                type: "EMAIL_VERIFICATION",
            },
        });

        // Send confirmation notification
        const { createNotification } = await import("@/lib/notifications");
        createNotification({
            userId: user.id,
            title: "✅ Email Verified Successfully",
            message: "Your email address has been verified. Welcome aboard WINA Gateway!",
            type: "SUCCESS",
            href: "/dashboard",
        }).catch(() => {});

        return NextResponse.json({
            success: true,
            message: "Email verified successfully! You may now log in to your account.",
            email: targetEmail,
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues?.[0]?.message || "Invalid input provided." },
                { status: 400 }
            );
        }

        console.error("Verification error:", error);
        return NextResponse.json(
            { error: "Internal server error during verification." },
            { status: 500 }
        );
    }
}
