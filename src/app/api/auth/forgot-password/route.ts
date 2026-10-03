import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

const forgotPasswordSchema = z.object({
    email: z.string().email(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email } = forgotPasswordSchema.parse(body);
        const normalizedEmail = email.toLowerCase().trim();

        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        // If user doesn't exist, return success anyway to prevent email harvesting
        if (!user) {
            return NextResponse.json({
                success: true,
                message: "If your account exists, a password reset code has been sent to your email.",
            });
        }

        // Rate limiting check: check if code was generated within last 45 seconds
        const recentCode = await prisma.verificationCode.findFirst({
            where: {
                email: normalizedEmail,
                type: "PASSWORD_RESET",
                createdAt: {
                    gte: new Date(Date.now() - 45 * 1000),
                },
            },
        });

        if (recentCode) {
            return NextResponse.json(
                { error: "Please wait 45 seconds before requesting another reset code." },
                { status: 429 }
            );
        }

        // Clean previous reset codes
        await prisma.verificationCode.deleteMany({
            where: {
                email: normalizedEmail,
                type: "PASSWORD_RESET",
            },
        });

        // Generate OTP & token
        const otpCode = crypto.randomInt(100000, 999999).toString();
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        await prisma.verificationCode.create({
            data: {
                email: normalizedEmail,
                code: otpCode,
                token,
                type: "PASSWORD_RESET",
                expiresAt,
            },
        });

        const hostHeader = req.headers.get("x-forwarded-host") || req.headers.get("host");
        const protoHeader = req.headers.get("x-forwarded-proto") || "http";
        const baseUrl = hostHeader ? `${protoHeader}://${hostHeader}` : undefined;

        await sendPasswordResetEmail(normalizedEmail, otpCode, token, baseUrl);

        return NextResponse.json({
            success: true,
            message: "If your account exists, a password reset code has been sent to your email.",
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Please enter a valid email address." },
                { status: 400 }
            );
        }

        console.error("Forgot password error:", error);
        return NextResponse.json(
            { error: "Failed to process password reset request." },
            { status: 500 }
        );
    }
}
