'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ArrowRight,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Mail,
    KeyRound,
    Lock,
    Shield
} from "lucide-react";
import { WinaLogo } from "@/components/ui/wina-logo";
import Link from 'next/link';
import Image from 'next/image';

function ForgotPasswordContent() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!email) {
            setError("Please provide your account email address.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to process request.');
            }

            setSubmitted(true);
        } catch (err: any) {
            setError(err.message || 'Unable to dispatch reset email. Please try again.');
        } finally {
            setLoading(false);
        }
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
                        <WinaLogo size={42} idPrefix="forgot-logo" />
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-2">
                        <Shield className="h-3.5 w-3.5" /> Account Recovery
                    </div>
                    <h2 className="text-2xl font-black text-white">Reset Your Password</h2>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                        Enter your email address and we will send you a 6-digit recovery code.
                    </p>
                </div>

                <div className="rounded-3xl p-6 sm:p-8 bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 shadow-2xl shadow-black/80">
                    {submitted ? (
                        <div className="flex flex-col items-center text-center space-y-4 py-2 animate-in zoom-in duration-300">
                            <div className="h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                                <Mail size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-white">Check Your Inbox</h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                If an account exists for <span className="text-white font-medium">{email}</span>, you will receive a 6-digit reset code and direct link.
                            </p>
                            <Button
                                onClick={() => router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`)}
                                className="w-full h-11 rounded-xl text-sm font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/25 transition-all mt-2"
                            >
                                Enter Reset Code <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium animate-in shake duration-300 flex items-center gap-2.5">
                                    <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
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
                                            className="h-11 pl-9 pr-3.5 rounded-xl bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-amber-500/50 text-sm font-medium"
                                            required
                                        />
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full h-11 rounded-xl text-sm font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/25 hover:shadow-amber-600/35 transition-all mt-2"
                                    disabled={loading || !email}
                                >
                                    {loading ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending Recovery Code...</>
                                    ) : (
                                        <>Send Reset Code <ArrowRight className="ml-2 h-4 w-4" /></>
                                    )}
                                </Button>
                            </form>
                        </>
                    )}

                    <div className="mt-6 pt-5 border-t border-slate-800/80 text-center text-xs">
                        <Link href="/auth/login" className="text-slate-400 hover:text-slate-200 transition-colors">
                            Remember your password? <span className="text-amber-400 font-semibold">Sign In</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ForgotPasswordPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-slate-950">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
        }>
            <ForgotPasswordContent />
        </Suspense>
    );
}
