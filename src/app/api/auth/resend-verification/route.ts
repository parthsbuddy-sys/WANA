import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";

const resendSchema = z.object({
    email: z.string().email(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email } = resendSchema.parse(body);
        const normalizedEmail = email.toLowerCase().trim();

        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        if (!user) {
            // Return success anyway to avoid user enumeration
            return NextResponse.json({
                success: true,
                message: "If an account exists, a new verification code has been dispatched.",
            });
        }

        if (user.emailVerified) {
            return NextResponse.json(
                { error: "This account is already verified. You can sign in directly." },
                { status: 400 }
            );
        }

        // Rate limiting check: check if code was generated within last 45 seconds
        const recentCode = await prisma.verificationCode.findFirst({
            where: {
                email: normalizedEmail,
                type: "EMAIL_VERIFICATION",
                createdAt: {
                    gte: new Date(Date.now() - 45 * 1000),
                },
            },
        });

        if (recentCode) {
            return NextResponse.json(
                { error: "Please wait at least 45 seconds before requesting a new code." },
                { status: 429 }
            );
        }

        // Clean previous codes
        await prisma.verificationCode.deleteMany({
            where: {
                email: normalizedEmail,
                type: "EMAIL_VERIFICATION",
            },
        });

        // Generate new OTP & token
        const otpCode = crypto.randomInt(100000, 999999).toString();
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await prisma.verificationCode.create({
            data: {
                email: normalizedEmail,
                code: otpCode,
                token,
                type: "EMAIL_VERIFICATION",
                expiresAt,
            },
        });

        const hostHeader = req.headers.get("x-forwarded-host") || req.headers.get("host");
        const protoHeader = req.headers.get("x-forwarded-proto") || "http";
        const baseUrl = hostHeader ? `${protoHeader}://${hostHeader}` : undefined;

        await sendVerificationEmail(normalizedEmail, otpCode, token, baseUrl);

        return NextResponse.json({
            success: true,
            message: "A new verification code has been sent to your email.",
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Please provide a valid email address." },
                { status: 400 }
            );
        }

        console.error("Resend verification error:", error);
        return NextResponse.json(
            { error: "Failed to resend verification email." },
            { status: 500 }
        );
    }
}
