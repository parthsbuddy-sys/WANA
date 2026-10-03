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
    Lock,
    Eye,
    EyeOff,
    KeyRound,
    ShieldCheck
} from "lucide-react";
import { WinaLogo } from "@/components/ui/wina-logo";
import Link from 'next/link';
import Image from 'next/image';

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialEmail = searchParams.get('email') || '';
    const tokenParam = searchParams.get('token') || '';

    const [email, setEmail] = useState(initialEmail);
    const [token, setToken] = useState(tokenParam);
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (tokenParam) {
            setToken(tokenParam);
        }
    }, [tokenParam]);

    // Handle 6-digit OTP input changes
    const handleOtpChange = (index: number, value: string) => {
        const cleanVal = value.replace(/\D/g, '');

        if (cleanVal.length > 1) {
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

    async function handleResetSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (password.length < 6) {
            setError("New password must be at least 6 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        const code = otp.join('');
        if (!token && code.length !== 6) {
            setError("Please enter the 6-digit recovery code from your email.");
            return;
        }

        if (!token && !email) {
            setError("Please enter your account email.");
            return;
        }

        setLoading(true);

        try {
            const payload: any = {
                newPassword: password,
            };

            if (token) {
                payload.token = token;
            } else {
                payload.email = email;
                payload.code = code;
            }

            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to reset password.');
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/auth/login?reset=true');
            }, 2500);
        } catch (err: any) {
            setError(err.message || 'Unable to reset password. Check your code and try again.');
        } finally {
            setLoading(false);
        }
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
                <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-amber-500/30 shadow-2xl flex flex-col items-center text-center max-w-md animate-in zoom-in duration-500">
                    <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 text-amber-400">
                        <CheckCircle2 size={36} />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2">Password Updated!</h2>
                    <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                        Your account password has been updated securely. You can now log in with your new credentials.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
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
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.15),rgba(255,255,255,0))]" />
            </div>

            {/* Glowing orbs */}
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 translate-x-1/3 translate-y-1/3 w-[30rem] h-[30rem] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

            {/* Container Card */}
            <div className="relative z-10 w-full max-w-md mx-auto">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="p-2.5 rounded-2xl bg-slate-900/80 border border-amber-500/30 shadow-lg mb-3">
                        <WinaLogo size={42} idPrefix="reset-logo" />
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-2">
                        <ShieldCheck className="h-3.5 w-3.5" /> Secure Password Reset
                    </div>
                    <h2 className="text-2xl font-black text-white">Create New Password</h2>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                        {token ? "Enter your new password below." : "Enter your 6-digit code and choose a new password."}
                    </p>
                </div>

                <div className="rounded-3xl p-6 sm:p-8 bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 shadow-2xl shadow-black/80">
                    {error && (
                        <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium animate-in shake duration-300 flex items-center gap-2.5">
                            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleResetSubmit} className="space-y-4">
                        {!token && (
                            <>
                                <div>
                                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                                        Account Email
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="name@example.com"
                                            className="h-10 pl-9 pr-3.5 rounded-xl bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-amber-500/50 text-sm font-medium"
                                            required
                                        />
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2 text-center">
                                        6-Digit Reset Code
                                    </label>
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
                                                className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black bg-slate-950/80 border-2 border-slate-800 rounded-xl text-amber-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all shadow-inner"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                                New Password
                            </label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="h-10 px-3.5 pr-10 rounded-xl bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-amber-500/50 text-sm font-medium"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                                Confirm New Password
                            </label>
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="h-10 px-3.5 rounded-xl bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-amber-500/50 text-sm font-medium"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full h-11 rounded-xl text-sm font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/25 hover:shadow-amber-600/35 transition-all mt-4"
                            disabled={loading || (!token && otp.join('').length !== 6)}
                        >
                            {loading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating Password...</>
                            ) : (
                                <>Save New Password <ArrowRight className="ml-2 h-4 w-4" /></>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 pt-5 border-t border-slate-800/80 text-center text-xs">
                        <Link href="/auth/login" className="text-slate-400 hover:text-slate-200 transition-colors">
                            Return to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-slate-950">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}
