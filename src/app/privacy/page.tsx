import Link from "next/link";
import { ArrowLeft, Lock, Shield, ShieldCheck, Database, Key, Server, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export const metadata = {
    title: "Privacy Policy | WINA",
    description: "Privacy Policy for WINA (WhatsApp Intelligent Next-gen Agent) self-hosted WhatsApp Gateway. Zero-tracking architecture, data ownership, and security practices.",
    openGraph: {
        title: "Privacy Policy | WINA",
        description: "Privacy Policy for WINA self-hosted WhatsApp Gateway.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Privacy Policy | WINA",
        description: "Privacy Policy for WINA self-hosted WhatsApp Gateway.",
    },
};

export default function PrivacyPage() {
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

            {/* Glowing orbs */}
            <div className="fixed top-0 right-1/4 translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
            <div className="fixed bottom-0 left-1/4 -translate-x-1/2 translate-y-1/2 w-[30rem] h-[30rem] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

            <div className="container max-w-4xl px-4 sm:px-6 mx-auto relative z-10">

                <Link href="/" className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-emerald-400 mb-8 transition-colors group">
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Back to Home
                </Link>

                <div className="rounded-3xl p-6 sm:p-12 bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-2xl shadow-black/80">
                    
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-slate-800">
                        <div className="flex items-center gap-4">
                            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
                                <Shield className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">Privacy Policy</h1>
                                <p className="text-xs text-slate-400 mt-1">Effective Date: {new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-400 self-start sm:self-auto">
                            <CheckCircle2 className="h-3.5 w-3.5" /> 100% Zero-Tracking Guarantee
                        </div>
                    </div>

                    {/* Highlights Cards */}
                    <div className="grid sm:grid-cols-3 gap-3.5 my-8">
                        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                            <Database className="h-5 w-5 text-emerald-400 mb-2" />
                            <h4 className="text-xs font-bold text-white">Local Database Only</h4>
                            <p className="text-[11px] text-slate-400 mt-1">No cloud sync. All records stay in your local SQLite/PostgreSQL instance.</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                            <Key className="h-5 w-5 text-blue-400 mb-2" />
                            <h4 className="text-xs font-bold text-white">Encrypted Keys</h4>
                            <p className="text-[11px] text-slate-400 mt-1">WhatsApp multi-device session credentials are stored encrypted on host disk.</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                            <Server className="h-5 w-5 text-purple-400 mb-2" />
                            <h4 className="text-xs font-bold text-white">Zero Telemetry</h4>
                            <p className="text-[11px] text-slate-400 mt-1">No phone-home metrics or external data harvesting of any kind.</p>
                        </div>
                    </div>

                    {/* Policy Body */}
                    <div className="space-y-6 text-sm text-slate-300 leading-relaxed pt-2">

                        <p className="text-base text-slate-200">
                            At WINA (WhatsApp Intelligent Next-gen Agent), we believe that your communication data is your property. This Privacy Policy details the strict boundaries regarding how information is handled when using our open-source, self-hosted WhatsApp Gateway.
                        </p>

                        <div className="space-y-3 pt-4 border-t border-slate-800/80">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Lock className="h-5 w-5 text-emerald-400" />
                                1. Zero-Tracking Architecture
                            </h2>
                            <p>
                                Because WINA is designed to be <strong>self-hosted</strong>, all core data processing occurs exclusively on the server where you deploy the application:
                            </p>
                            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400 text-xs sm:text-sm">
                                <li><strong>No Centralized Telemetry:</strong> The creators and maintainers of WINA do not receive telemetry, analytics, or usage reports about your WhatsApp interactions.</li>
                                <li><strong>Absolute Data Ownership:</strong> Your contacts, messages, schedules, and auto-replies remain in your own database. We cannot and will not access it.</li>
                            </ul>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-slate-800/80">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Server className="h-5 w-5 text-blue-400" />
                                2. Data Processed Locally
                            </h2>
                            <p>
                                When you deploy the gateway, the application running on your server interacts strictly with:
                            </p>
                            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400 text-xs sm:text-sm">
                                <li><strong>Authentication Credentials:</strong> Passwords created for the operator console are securely hashed using bcrypt.</li>
                                <li><strong>WhatsApp Multi-Device Keys:</strong> Cryptographic keys needed to maintain the WebSocket tunnel to WhatsApp servers are stored on the host filesystem in the <code>sessions/</code> directory.</li>
                                <li><strong>Communication Payloads:</strong> Incoming and outgoing messages are stored in your database to power webhook notifications and conversation histories.</li>
                            </ul>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-slate-800/80">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-purple-400" />
                                3. Server Security Recommendations
                            </h2>
                            <p>
                                Because WINA runs on your infrastructure, your server's security configuration protects your deployment:
                            </p>
                            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400 text-xs sm:text-sm">
                                <li>Deploy behind a reverse proxy (e.g. Nginx, Caddy, Cloudflare) with <strong>SSL/TLS encryption</strong> (HTTPS).</li>
                                <li>Restrict access to database ports and use strong administrator passwords.</li>
                                <li>Keep Node.js and OS security patches up to date.</li>
                            </ul>
                        </div>

                        <div className="mt-8 p-5 bg-slate-950/60 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h4 className="text-xs font-bold text-white">Have specific security inquiries?</h4>
                                <p className="text-xs text-slate-400 mt-0.5">Explore our comprehensive architecture guides in the documentation.</p>
                            </div>
                            <Link href="/docs">
                                <span className="inline-flex items-center text-xs font-bold text-emerald-400 hover:text-emerald-300">
                                    View System Docs →
                                </span>
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
