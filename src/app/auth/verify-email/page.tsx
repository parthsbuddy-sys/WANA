'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ArrowRight,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Mail,
    RefreshCw,
    ShieldCheck,
    Lock,
    KeyRound
} from "lucide-react";
import { WinaLogo } from "@/components/ui/wina-logo";
import Link from 'next/link';
import Image from 'next/image';

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialEmail = searchParams.get('email') || '';
    const tokenParam = searchParams.get('token') || '';

    const [email, setEmail] = useState(initialEmail);
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [autoVerifying, setAutoVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendMessage, setResendMessage] = useState<string | null>(null);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Countdown timer for resending OTP
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    // Auto-verify if token is provided in URL
    useEffect(() => {
        if (tokenParam) {
            handleVerifyWithToken(tokenParam);
        }
    }, [tokenParam]);

    async function handleVerifyWithToken(token: string) {
        setAutoVerifying(true);
        setError(null);
        try {
            const response = await fetch('/api/auth/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Verification link is invalid or expired.');
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/auth/login?verified=true');
            }, 2500);
        } catch (err: any) {
            setError(err.message || 'Verification failed. Please enter the 6-digit code manually.');
        } finally {
            setAutoVerifying(false);
        }
    }

    // Handle 6-digit OTP input changes
    const handleOtpChange = (index: number, value: string) => {
        // Only accept numbers
        const cleanVal = value.replace(/\D/g, '');

        if (cleanVal.length > 1) {
            // Handle pasting full 6-digit code
            const pastedDigits = cleanVal.slice(0, 6).split('');
            const newOtp = [...otp];
            pastedDigits.forEach((digit, i) => {
                if (index + i < 6) {
                    newOtp[index + i] = digit;
                }
            });
            setOtp(newOtp);

            const nextFocusIndex = Math.min(index + pastedDigits.length, 5);
            inputRefs.current[nextFocusIndex]?.focus();
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = cleanVal;
        setOtp(newOtp);

        // Auto-advance to next input
        if (cleanVal && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pastedData) {
            const newOtp = [...otp];
            for (let i = 0; i < pastedData.length; i++) {
                newOtp[i] = pastedData[i];
            }
            setOtp(newOtp);
            inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
        }
    };

    async function handleVerifySubmit(e: React.FormEvent) {
        e.preventDefault();
        const code = otp.join('');

        if (code.length !== 6) {
            setError("Please enter the complete 6-digit verification code.");
            return;
        }

        if (!email) {
            setError("Please enter your registered email address.");
            return;
        }

        setLoading(true);
        setError(null);
        setResendMessage(null);

        try {
            const response = await fetch('/api/auth/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    code,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to verify code.');
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/auth/login?verified=true');
            }, 2500);
        } catch (err: any) {
            setError(err.message || 'Invalid or expired verification code.');
        } finally {
            setLoading(false);
        }
    }

    async function handleResendCode() {
        if (!email) {
            setError("Please provide your email address to receive a new code.");
            return;
        }

        if (resendCooldown > 0) return;

        setResendLoading(true);
        setError(null);
        setResendMessage(null);

        try {
            const response = await fetch('/api/auth/resend-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to resend verification code.');
            }

            setResendMessage("A new 6-digit code has been dispatched to your inbox.");
            setResendCooldown(60);
        } catch (err: any) {
            setError(err.message || 'Unable to resend code. Please try again.');
        } finally {
            setResendLoading(false);
        }
    }

    if (autoVerifying) {
        return (
            <div className="min-h-screen relative flex items-center justify-center p-4 bg-slate-950">
                <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-emerald-500/30 shadow-2xl flex flex-col items-center text-center max-w-sm">
                    <Loader2 className="h-12 w-12 text-emerald-400 animate-spin mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Verifying Token...</h2>
                    <p className="text-xs text-slate-400">
                        Please wait while we validate your instant verification link.
                    </p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen relative flex items-center justify-center p-4 bg-slate-950 overflow-hidden">
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <Image
                        src="/images/auth-bg.jpg"
                        alt="Background"
                        fill
                        className="object-cover opacity-30 mix-blend-screen"
                    />
                    <div className="absolute inset-0 bg-slate-950/80" />
                </div>
                <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-emerald-500/30 shadow-2xl flex flex-col items-center text-center max-w-md animate-in zoom-in duration-500">
                    <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
                        <CheckCircle2 size={36} />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2">Email Verified!</h2>
                    <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                        Your email address has been verified successfully. Your account is now fully active.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                        <Loader2 className="h-4 w-4 animate-spin" /> Redirecting to login...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden bg-slate-950">
            {/* Background Graphic */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <Image
                    src="/images/auth-bg.jpg"
                    alt="WINA Network Background"
                    fill
                    priority
                    className="object-cover object-center opacity-40 mix-blend-screen scale-105 filter blur-[1px]"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/90" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]" />
            </div>

            {/* Glowing orbs */}
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 translate-x-1/3 translate-y-1/3 w-[30rem] h-[30rem] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />

            {/* Container Card */}
            <div className="relative z-10 w-full max-w-md mx-auto">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="p-2.5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 shadow-lg mb-3">
                        <WinaLogo size={42} idPrefix="verify-logo" />
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">
                        <ShieldCheck className="h-3.5 w-3.5" /> Two-Factor Email Security
                    </div>
                    <h2 className="text-2xl font-black text-white">Verify Your Account</h2>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                        Enter the 6-digit verification code sent to your email address.
                    </p>
                </div>

                <div className="rounded-3xl p-6 sm:p-8 bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 shadow-2xl shadow-black/80">
                    {error && (
                        <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium animate-in shake duration-300 flex items-center gap-2.5">
                            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                            <span>{error}</span>
                        </div>
                    )}

                    {resendMessage && (
                        <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2.5">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                            <span>{resendMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleVerifySubmit} className="space-y-5">
                        <div>
                            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                                Registered Email
                            </label>
                            <div className="relative">
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="h-11 pl-9 pr-3.5 rounded-xl bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500/50 text-sm font-medium"
                                    required
                                />
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2 text-center">
                                6-Digit OTP Code
                            </label>
                            
                            {/* OTP Box Inputs */}
                            <div className="flex items-center justify-between gap-2 sm:gap-2.5" onPaste={handlePaste}>
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => {
                                            inputRefs.current[index] = el;
                                        }}
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black bg-slate-950/80 border-2 border-slate-800 rounded-xl text-emerald-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
                                    />
                                ))}
                            </div>
                            <p className="text-[11px] text-slate-500 text-center mt-2">
                                Tip: You can paste the full 6-digit code directly
                            </p>
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full h-11 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all"
                            disabled={loading || otp.join('').length !== 6}
                        >
                            {loading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying Code...</>
                            ) : (
                                <>Verify Account <ArrowRight className="ml-2 h-4 w-4" /></>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col items-center gap-3 text-xs">
                        <div className="flex items-center gap-2 text-slate-400">
                            <span>Didn&apos;t receive the code?</span>
                            <button
                                type="button"
                                onClick={handleResendCode}
                                disabled={resendLoading || resendCooldown > 0}
                                className="font-semibold text-emerald-400 hover:text-emerald-300 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1"
                            >
                                {resendLoading ? (
                                    <><Loader2 className="h-3 w-3 animate-spin" /> Sending...</>
                                ) : resendCooldown > 0 ? (
                                    `Resend in ${resendCooldown}s`
                                ) : (
                                    <><RefreshCw className="h-3 w-3" /> Resend Code</>
                                )}
                            </button>
                        </div>

                        <Link href="/auth/login" className="text-slate-400 hover:text-slate-200 transition-colors">
                            Return to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-slate-950">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
