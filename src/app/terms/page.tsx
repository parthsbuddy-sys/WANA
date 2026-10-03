import Link from "next/link";
import { ArrowLeft, ShieldCheck, Scale, AlertTriangle, KeyRound, Terminal, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export const metadata = {
    title: "Terms of Service | WINA",
    description: "Terms of Service for WINA (WhatsApp Intelligent Next-gen Agent) self-hosted WhatsApp Gateway. Usage guidelines, security requirements, and acceptable use policy.",
    openGraph: {
        title: "Terms of Service | WINA",
        description: "Terms of Service for WINA self-hosted WhatsApp Gateway.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Terms of Service | WINA",
        description: "Terms of Service for WINA self-hosted WhatsApp Gateway.",
    },
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden py-20 selection:bg-primary/30 selection:text-primary-foreground">
            {/* Ambient Background Graphic */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <Image
                    src="/images/auth-bg.jpg"
                    alt="Background"
                    fill
                    className="object-cover opacity-20 mix-blend-screen scale-105 filter blur-[2px]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/95 to-slate-950" />
            </div>

            {/* Ambient Glowing Orbs */}
            <div className="fixed top-0 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
            <div className="fixed bottom-0 right-1/4 translate-x-1/2 translate-y-1/2 w-[30rem] h-[30rem] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

            <div className="container max-w-4xl px-4 sm:px-6 mx-auto relative z-10">

                <Link href="/" className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-emerald-400 mb-8 transition-colors group">
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Back to Home
                </Link>

                <div className="rounded-3xl p-6 sm:p-12 bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-2xl shadow-black/80">
                    
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-slate-800">
                        <div className="flex items-center gap-4">
                            <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl">
                                <Scale className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">Terms of Service</h1>
                                <p className="text-xs text-slate-400 mt-1">Last Updated: {new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-bold text-blue-400 self-start sm:self-auto">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Self-Hosted License Agreement
                        </div>
                    </div>

                    {/* Highlights Cards */}
                    <div className="grid sm:grid-cols-3 gap-3.5 my-8">
                        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                            <ShieldCheck className="h-5 w-5 text-emerald-400 mb-2" />
                            <h4 className="text-xs font-bold text-white">Full Autonomy</h4>
                            <p className="text-[11px] text-slate-400 mt-1">You control the entire execution environment and database storage.</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                            <AlertTriangle className="h-5 w-5 text-amber-400 mb-2" />
                            <h4 className="text-xs font-bold text-white">Anti-Spam Compliance</h4>
                            <p className="text-[11px] text-slate-400 mt-1">Strict adherence to human-paced messaging and consent requirements.</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                            <Terminal className="h-5 w-5 text-blue-400 mb-2" />
                            <h4 className="text-xs font-bold text-white">Open Architecture</h4>
                            <p className="text-[11px] text-slate-400 mt-1">Full access to REST APIs, webhooks, and automation pipelines.</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-6 text-sm text-slate-300 leading-relaxed pt-2">

                        <p className="text-base text-slate-200">
                            Welcome to WINA (WhatsApp Intelligent Next-gen Agent). By accessing or deploying our software, you agree to comply with the terms and operational guidelines set forth below.
                        </p>

                        <div className="space-y-3 pt-4 border-t border-slate-800/80">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                                1. Data Ownership & Self-Hosting
                            </h2>
                            <p>
                                Security and independence are fundamental tenets of WINA:
                            </p>
                            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400 text-xs sm:text-sm">
                                <li><strong>Your Data is Exclusively Yours:</strong> WINA does not track, intercept, or monetize your WhatsApp communications, contact rosters, or session tokens.</li>
                                <li><strong>Server Security:</strong> You are solely responsible for securing your physical or virtual hosting environments, firewalls, and reverse proxy certificates.</li>
                                <li><strong>Credential Protection:</strong> You must safeguard all administrator credentials and API keys. Do not expose your dashboard on unsecured public networks.</li>
                            </ul>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-slate-800/80">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-amber-400" />
                                2. Acceptable Use & Anti-Spam Guidelines
                            </h2>
                            <p>
                                When orchestrating automated messaging, AI agents, or broadcast campaigns via WINA, you agree not to:
                            </p>
                            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400 text-xs sm:text-sm">
                                <li>Dispatch bulk unsolicited messages or aggressive spam to users who have not explicitly opted in.</li>
                                <li>Distribute malware, phishing materials, harassment, or unlawful content.</li>
                                <li>Bypass rate-limiting safeguards to abuse external telecom or messaging networks.</li>
                            </ul>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-slate-800/80">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <KeyRound className="h-5 w-5 text-blue-400" />
                                3. Protocol Limitations & Disclaimer
                            </h2>
                            <p>
                                WINA establishes connections to WhatsApp using reverse-engineered multi-device WebSocket protocols (via Baileys). By deploying WINA, you understand:
                            </p>
                            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400 text-xs sm:text-sm">
                                <li>Upstream protocol revisions by Meta may occasionally require gateway updates.</li>
                                <li>WINA is provided "as is" without warranty. Operators are responsible for complying with WhatsApp Terms of Service.</li>
                            </ul>
                        </div>

                        <div className="mt-8 p-5 bg-slate-950/60 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h4 className="text-xs font-bold text-white">Need developer documentation?</h4>
                                <p className="text-xs text-slate-400 mt-0.5">Learn how to configure auto-replies and anti-ban settings.</p>
                            </div>
                            <Link href="/docs">
                                <span className="inline-flex items-center text-xs font-bold text-emerald-400 hover:text-emerald-300">
                                    System Documentation →
                                </span>
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
