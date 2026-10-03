'use client';

import { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Zap,
  Bot,
  Activity,
  Lock,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles
} from "lucide-react";
import { WinaLogo } from "@/components/ui/wina-logo";
import Link from 'next/link';
import Image from 'next/image';

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const isVerifiedParam = searchParams.get('verified') === 'true';
  const isResetParam = searchParams.get('reset') === 'true';

  const [error, setError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError(null);
    setUnverifiedEmail(null);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (result?.error) {
        if (result.error.includes("EMAIL_NOT_VERIFIED") || result.code === "EMAIL_NOT_VERIFIED") {
          setUnverifiedEmail(values.email);
          setError("Your email address is not verified yet. Please verify your account before logging in.");
        } else {
          setError("Invalid email or password");
        }
      } else {
        window.location.href = callbackUrl;
        router.refresh();
      }
    } catch (err: any) {
      if (err?.message?.includes("EMAIL_NOT_VERIFIED")) {
        setUnverifiedEmail(values.email);
        setError("Your email address is not verified yet. Please verify your account before logging in.");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
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
        {/* Deep futuristic gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]" />
      </div>

      {/* Ambient glowing orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/3 translate-y-1/3 w-[30rem] h-[30rem] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Informative Showcase (Hidden on very small screens, prominent on lg) */}
        <div className="hidden lg:flex lg:col-span-7 flex-col justify-between space-y-8 pr-4">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="relative flex items-center justify-center p-2 rounded-2xl bg-slate-900/80 border border-emerald-500/30 shadow-lg shadow-emerald-500/10 group-hover:border-emerald-500/60 transition-colors">
                <WinaLogo size={36} idPrefix="login-brand" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black tracking-tight text-white">WINA</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ENTERPRISE
                  </span>
                </div>
                <p className="text-xs text-slate-400">WhatsApp Intelligent Next-gen Agent</p>
              </div>
            </Link>

            <h1 className="text-3xl xl:text-4xl font-black tracking-tight text-white leading-tight">
              High-Throughput WhatsApp Gateway & Autonomous Agent Platform.
            </h1>
            <p className="text-sm text-slate-300/80 leading-relaxed max-w-lg">
              Self-hosted multi-session orchestration with 4-tier anti-ban defense, conversational AI triggers, and enterprise REST/WebSocket APIs.
            </p>
          </div>

          {/* Feature Highlights Showcase */}
          <div className="grid sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center gap-2.5 mb-1.5 text-emerald-400 font-semibold text-xs">
                <ShieldCheck className="h-4 w-4" />
                <span>Multi-Tier Anti-Ban</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Dynamic human jitter, velocity bounds, and static residential proxy routing.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 hover:border-blue-500/40 transition-colors">
              <div className="flex items-center gap-2.5 mb-1.5 text-blue-400 font-semibold text-xs">
                <Bot className="h-4 w-4" />
                <span>AI Agent Brain</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Contextual Groq & OpenAI compatibility with natural language triage.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 hover:border-purple-500/40 transition-colors">
              <div className="flex items-center gap-2.5 mb-1.5 text-purple-400 font-semibold text-xs">
                <Zap className="h-4 w-4" />
                <span>Sub-50ms Processing</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Direct Baileys WebSocket sockets with zero centralized telemetry tracking.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 hover:border-amber-500/40 transition-colors">
              <div className="flex items-center gap-2.5 mb-1.5 text-amber-400 font-semibold text-xs">
                <Activity className="h-4 w-4" />
                <span>Live Telemetry Hub</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Real-time node CPU, memory, socket state, and outgoing throughput metrics.
              </p>
            </div>
          </div>

          {/* System Status Pill */}
          <div className="flex items-center gap-3 pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Core Engine Operational • 100% Data Sovereignty
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Card */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto">
          {/* Mobile brand header (shown only when left column is hidden) */}
          <div className="lg:hidden flex flex-col items-center text-center mb-6">
            <div className="p-2.5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 shadow-lg mb-3">
              <WinaLogo size={42} idPrefix="login-mobile" />
            </div>
            <h2 className="text-2xl font-bold text-white">Sign In to WINA</h2>
            <p className="text-xs text-slate-400 mt-1">WhatsApp Intelligent Next-gen Agent</p>
          </div>

          {/* Glass Form Panel */}
          <div className="rounded-3xl p-6 sm:p-8 bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 shadow-2xl shadow-black/80">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">Welcome Back</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Sign in to your account to access your workspace
              </p>
            </div>

            {isVerifiedParam && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2.5 animate-in fade-in duration-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>Your email has been verified successfully! Please sign in.</span>
              </div>
            )}

            {isResetParam && (
              <div className="mb-5 p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-medium flex items-center gap-2.5 animate-in fade-in duration-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-400" />
                <span>Your password was reset successfully. Log in with your new password.</span>
              </div>
            )}

            {error && (
              <div className={`mb-5 p-3.5 rounded-xl ${unverifiedEmail ? 'bg-amber-500/15 border-amber-500/30 text-amber-300' : 'bg-red-500/10 border-red-500/30 text-red-400'} border text-xs font-medium animate-in shake duration-300 flex flex-col gap-2`}>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
                {unverifiedEmail && (
                  <Link
                    href={`/auth/verify-email?email=${encodeURIComponent(unverifiedEmail)}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 underline pt-1"
                  >
                    Click here to verify your email now →
                  </Link>
                )}
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Email Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="name@example.com"
                          className="h-11 px-3.5 rounded-xl bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500/50 transition-all text-sm font-medium"
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
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</FormLabel>
                        <Link
                          href="/auth/forgot-password"
                          className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="h-11 px-3.5 pr-10 rounded-xl bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500/50 transition-all text-sm font-medium"
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

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-11 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all mt-2"
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing In...</>
                  ) : (
                    <>Sign In to Dashboard <ArrowRight className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center text-xs text-slate-400">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                Create an account
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
