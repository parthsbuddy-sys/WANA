import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { DocsClient } from './docs-client';
import { WinaLogo } from '@/components/ui/wina-logo';
import { ExternalLink, Terminal, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
    title: 'API Documentation - WINA',
    description: 'Complete API reference for WINA (WhatsApp Intelligent Next-gen Agent). Includes endpoints for messaging, groups, contacts, media, and webhooks.',
    openGraph: {
        title: 'API Documentation - WINA',
        description: 'Complete API reference for WINA WhatsApp Gateway.',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'API Documentation - WINA',
        description: 'Complete API reference for WINA WhatsApp Gateway.',
    },
};

// Interface for Nested TOC
export interface TocItem {
    text: string;
    id: string;
}

export interface TocSection {
    title: string;
    id: string;
    items: TocItem[];
}

export default async function PublicDocsPage() {
    const filePath = path.join(process.cwd(), 'docs', 'API_DOCUMENTATION.md');
    const packagePath = path.join(process.cwd(), 'package.json');
    let content = '';
    let version = 'v1.6.4';

    try {
        content = fs.readFileSync(filePath, 'utf8');
        // Strip extraneous backslash escapes used for markdown brackets
        content = content.replace(/\\(\[)/g, '$1').replace(/\\(])/g, '$1');
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        version = `v${packageJson.version}`;
    } catch (err) {
        content = '# Error\n\nCould not load documentation file.';
        console.error("Error loading docs:", err);
    }

    // Nested TOC Generation
    const toc: TocSection[] = [];
    let currentSection: TocSection | null = null;

    content.split('\n').forEach(line => {
        if (line.startsWith('## ')) {
            // H2 - New Section
            const text = line.replace(/^## /, '').trim();
            const id = text.toLowerCase().replace(/[^\w]+/g, '-');

            // If we have a current section, push it to toc
            if (currentSection) {
                toc.push(currentSection);
            }

            currentSection = {
                title: text,
                id: id,
                items: []
            };
        } else if (line.startsWith('### ') && currentSection) {
            // H3 - Item in current section
            const text = line.replace(/^### /, '').trim();
            const id = text.toLowerCase().replace(/[^\w]+/g, '-');
            currentSection.items.push({ text, id });
        }
    });

    // Push the last section if exists
    if (currentSection) {
        toc.push(currentSection);
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col selection:bg-primary/30 selection:text-primary-foreground">
            {/* Header */}
            <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="flex items-center justify-center">
                            <WinaLogo size={32} idPrefix="docs-header" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-black text-slate-900 dark:text-white">
                                WINA
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold tracking-wide border border-emerald-500/20">
                                {version}
                            </span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/swagger"
                            target="_blank"
                            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <Terminal size={14} /> Swagger UI <ExternalLink size={12} />
                        </Link>
                        <Link href="/dashboard">
                            <Button size="sm" className="gap-2 font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-sm">
                                <LayoutDashboard size={14} /> Console
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <DocsClient content={content} toc={toc} />
        </div>
    );
}
