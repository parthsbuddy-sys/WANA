import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, name } = registerSchema.parse(body);

        // Check if registration is enabled
        const systemConfig = await prisma.systemConfig.findUnique({ where: { id: "default" } });
        // @ts-ignore
        if (systemConfig && systemConfig.enableRegistration === false) {
            return NextResponse.json(
                { error: "Registration is currently disabled by the administrator" },
                { status: 403 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
        });

        if (existingUser) {
            // If existing user is unverified, offer to resend verification
            if (!existingUser.emailVerified) {
                return NextResponse.json(
                    { 
                        error: "An unverified account with this email already exists. Please verify your email.",
                        requireVerification: true,
                        email: existingUser.email
                    },
                    { status: 400 }
                );
            }
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 400 }
            );
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user with emailVerified as null
        const newUser = await prisma.user.create({
            data: {
                name,
                email: email.toLowerCase().trim(),
                password: hashedPassword,
                emailVerified: null,
            },
        });

        // Generate 6-digit OTP and secure URL token
        const otpCode = crypto.randomInt(100000, 999999).toString();
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Delete any existing codes for this email
        await prisma.verificationCode.deleteMany({
            where: {
                email: newUser.email,
                type: "EMAIL_VERIFICATION",
            },
        });

        // Save new verification code
        await prisma.verificationCode.create({
            data: {
                email: newUser.email,
                code: otpCode,
                token,
                type: "EMAIL_VERIFICATION",
                expiresAt,
            },
        });

        // Send verification email (or log fallback to console)
        const hostHeader = req.headers.get("x-forwarded-host") || req.headers.get("host");
        const protoHeader = req.headers.get("x-forwarded-proto") || "http";
        const baseUrl = hostHeader ? `${protoHeader}://${hostHeader}` : undefined;

        await sendVerificationEmail(newUser.email, otpCode, token, baseUrl);

        // Welcome notifications & Admin alerts
        const { createNotification, notifySuperAdmins } = await import("@/lib/notifications");
        createNotification({
            userId: newUser.id,
            title: "👋 Welcome to WINA Gateway",
            message: "Please complete email verification to activate your full console capabilities.",
            type: "INFO",
            href: "/auth/verify-email",
            sendEmailAlert: false
        }).catch(() => {});

        notifySuperAdmins({
            title: "👤 New User Registered",
            message: `User ${name || newUser.email} (${newUser.email}) has signed up and is verifying their email.`,
            type: "SYSTEM",
            href: "/dashboard/users"
        }).catch(() => {});

        return NextResponse.json({
            success: true,
            requireVerification: true,
            email: newUser.email,
            message: "Account created! A 6-digit verification code has been sent to your email.",
            user: { id: newUser.id, name: newUser.name, email: newUser.email },
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid registration data provided" },
                { status: 400 }
            );
        }

        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Internal server error during registration" },
            { status: 500 }
        );
    }
}
