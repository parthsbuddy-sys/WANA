'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    ArrowRight,
    Loader2,
    ShieldCheck,
    CheckCircle2,
    Lock,
    Sparkles,
    Eye,
    EyeOff,
    Check,
    Zap,
    Users,
    Key
} from "lucide-react";
import { WinaLogo } from "@/components/ui/wina-logo";
import Link from 'next/link';
import Image from 'next/image';

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: ""
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: values.name,
                    email: values.email,
                    password: values.password,
                }),
            });

            const resData = await response.json();
            if (!response.ok) {
                if (resData.requireVerification && resData.email) {
                    router.push(`/auth/verify-email?email=${encodeURIComponent(resData.email)}`);
                    return;
                }
                throw new Error(resData.error || "Failed to register");
            }

            setSuccess(true);
            setTimeout(() => {
                router.push(`/auth/verify-email?email=${encodeURIComponent(values.email)}`);
            }, 1800);

        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
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
                <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-emerald-500/30 shadow-2xl flex flex-col items-center text-center max-w-sm animate-in zoom-in duration-500">
                    <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
                        <CheckCircle2 size={36} />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2">Account Created!</h2>
                    <p className="text-xs text-slate-400 mb-6">
                        A 6-digit verification code has been sent to your email. Redirecting to verification...
                    </p>
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                        <Loader2 className="h-4 w-4 animate-spin" /> Moving to verification...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden bg-slate-950">
            {/* Background Graphic with Atmospheric Overlays */}
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
            <div className="absolute top-1/3 left-1/5 w-[35rem] h-[35rem] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />

            {/* Main Split Grid */}
            <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                
                {/* Left Informative Column */}
                <div className="hidden lg:flex lg:col-span-7 flex-col justify-between space-y-8 pr-4">
                    <div className="space-y-4">
                        <Link href="/" className="inline-flex items-center gap-3 group">
                            <div className="relative flex items-center justify-center p-2 rounded-2xl bg-slate-900/80 border border-emerald-500/30 shadow-lg shadow-emerald-500/10 group-hover:border-emerald-500/60 transition-colors">
                                <WinaLogo size={36} idPrefix="register-brand" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-black tracking-tight text-white">WINA</span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                        SELF-HOSTED
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400">WhatsApp Intelligent Next-gen Agent</p>
                            </div>
                        </Link>

                        <h1 className="text-3xl xl:text-4xl font-black tracking-tight text-white leading-tight">
                            Deploy Your Autonomous WhatsApp Gateway In Seconds.
                        </h1>
                        <p className="text-sm text-slate-300/80 leading-relaxed max-w-lg">
                            Create your operator profile to connect WhatsApp instances, configure keyword automations, manage group broadcasts, and dispatch via REST API.
                        </p>
                    </div>

                    {/* Feature Matrix / Benefits */}
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                                <Check className="h-4 w-4" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-white">Zero Cloud Dependencies</h4>
                                <p className="text-xs text-slate-400 mt-0.5">Your sessions, chats, and database stay 100% on your own server.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                                <Zap className="h-4 w-4" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-white">Unlimited Multi-Device Instances</h4>
                                <p className="text-xs text-slate-400 mt-0.5">Scale from 1 to dozens of concurrent WhatsApp numbers seamlessly.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                                <ShieldCheck className="h-4 w-4" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-white">Role-Based Console Isolation</h4>
                                <p className="text-xs text-slate-400 mt-0.5">Fine-grained permissions for SuperAdmins, Business Owners, and Staff Operators.</p>
                            </div>
                        </div>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-2">
                        <Key className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Bcrypt encrypted authentication • Granular API token authorization</span>
                    </div>
                </div>

                {/* Right Column: Register Form */}
                <div className="lg:col-span-5 w-full max-w-md mx-auto">
                    {/* Mobile Header */}
                    <div className="lg:hidden flex flex-col items-center text-center mb-6">
                        <div className="p-2.5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 shadow-lg mb-3">
                            <WinaLogo size={42} idPrefix="register-mobile" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Create Account</h2>
                        <p className="text-xs text-slate-400 mt-1">Join the WINA platform</p>
                    </div>

                    <div className="rounded-3xl p-6 sm:p-8 bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 shadow-2xl shadow-black/80">
                        <div className="mb-6">
                            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">Create an Account</h2>
                            <p className="text-xs sm:text-sm text-slate-400 mt-1">
                                Sign up to start managing your WhatsApp workspace
                            </p>
                        </div>

                        {error && (
                            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium animate-in shake duration-300 flex items-center gap-2">
                                <Lock className="h-4 w-4 shrink-0 text-red-400" />
                                <span>{error}</span>
                            </div>
                        )}

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Full Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Your Full Name"
                                                    className="h-10 px-3.5 rounded-xl bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500/50 transition-all text-sm font-medium"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-xs text-red-400" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Email Address</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="name@example.com"
                                                    className="h-10 px-3.5 rounded-xl bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500/50 transition-all text-sm font-medium"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-xs text-red-400" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="••••••••"
                                                        className="h-10 px-3.5 pr-10 rounded-xl bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500/50 transition-all text-sm font-medium"
                                                        {...field}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                                                    >
                                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-xs text-red-400" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Confirm Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    className="h-10 px-3.5 rounded-xl bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500/50 transition-all text-sm font-medium"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-xs text-red-400" />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full h-11 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all mt-4"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...</>
                                    ) : (
                                        <>Create Account <ArrowRight className="ml-2 h-4 w-4" /></>
                                    )}
                                </Button>
                            </form>
                        </Form>

                        <div className="mt-5 text-[11px] text-center text-slate-400 leading-relaxed">
                            By registering, you agree to the{" "}
                            <Link href="/terms" className="underline text-slate-300 hover:text-white">Terms</Link> and{" "}
                            <Link href="/privacy" className="underline text-slate-300 hover:text-white">Privacy Policy</Link>.
                        </div>
                    </div>

                    <div className="mt-6 text-center text-xs text-slate-400">
                        Already have an account?{" "}
                        <Link href="/auth/login" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                            Sign in
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
