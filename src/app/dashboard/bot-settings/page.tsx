"use client";

import { useState, useEffect } from "react";
import { useSession as useSessionProvider } from "@/components/dashboard/session-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RefreshCw, Save, AlertCircle, Bot, X, Plus, ShieldCheck, Zap, UserCheck, MessageSquarePlus, Reply, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { SessionGuard } from "@/components/dashboard/session-guard";

export default function BotSettingsPage() {
    const { sessionId } = useSessionProvider();

    const [botConfig, setBotConfig] = useState({
        enabled: true,
        botName: "WINA Agent",
        prefix: "#",
        enableSticker: true,
        enableVideoSticker: true,
        maxStickerDuration: 10,
        enablePing: true,
        enableUptime: true,
        removeBgApiKey: "",
        botMode: "OWNER",
        autoReplyMode: "ALL",
        antiSpamEnabled: true,
        spamLimit: 1,
        spamInterval: 60,
        spamDelayMin: 4000,
        spamDelayMax: 10000,

        // Custom AI fields
        aiEnabled: false,
        aiApiKey: "",
        aiModel: "qwen/qwen3.8-27b",
        aiPrompt: "",
        customFilterPrompt: "",

        botAllowedJids: [] as string[],
        botBlockedJids: [] as string[],
        autoReplyAllowedJids: [] as string[],
        autoReplyBlockedJids: [] as string[],
        alwaysOnline: false,
        autoRead: false,
        welcomeMessage: "",
    });
    const [botLoading, setBotLoading] = useState(false);

    const [newBotJid, setNewBotJid] = useState("");
    const [newAutoReplyJid, setNewAutoReplyJid] = useState("");

    const [privacyConfig, setPrivacyConfig] = useState({
        ghostMode: false,
        antiDelete: false,
        readReceipts: true,
        proxyUrl: "",
    });
    const [privacyLoading, setPrivacyLoading] = useState(false);

    useEffect(() => {
        if (!sessionId) return;

        fetch(`/api/sessions/${sessionId}/bot-config`)
            .then(res => { if (!res.ok) throw new Error(); return res.json(); })
            .then(responseData => {
                const data = responseData?.data;
                if (data && !responseData.error) {
                    setBotConfig(prev => ({
                        ...prev,
                        enabled: data.enabled ?? true,
                        botName: data.botName || "WINA Agent",
                        prefix: data.prefix || "#",
                        enableSticker: data.enableSticker ?? true,
                        enableVideoSticker: data.enableVideoSticker ?? true,
                        maxStickerDuration: data.maxStickerDuration || 10,
                        enablePing: data.enablePing ?? true,
                        enableUptime: data.enableUptime ?? true,
                        removeBgApiKey: data.removeBgApiKey || "",
                        botMode: data.botMode || "OWNER",
                        autoReplyMode: data.autoReplyMode || "ALL",
                        antiSpamEnabled: data.antiSpamEnabled ?? true,
                        spamLimit: data.spamLimit || 1,
                        spamInterval: data.spamInterval || 60,
                        spamDelayMin: data.spamDelayMin || 4000,
                        spamDelayMax: data.spamDelayMax || 10000,
                        welcomeMessage: data.welcomeMessage || "",
                        autoRead: data.autoRead ?? false,
                        alwaysOnline: data.alwaysOnline ?? false,
                        aiEnabled: data.aiEnabled ?? false,
                        aiApiKey: data.aiApiKey || "",
                        aiModel: data.aiModel || "qwen/qwen3.8-27b",
                        aiPrompt: data.aiPrompt || "",
                        customFilterPrompt: data.customFilterPrompt || "",
                        botAllowedJids: Array.isArray(data.botAllowedJids) ? data.botAllowedJids : [],
                        botBlockedJids: Array.isArray(data.botBlockedJids) ? data.botBlockedJids : [],
                        autoReplyAllowedJids: Array.isArray(data.autoReplyAllowedJids) ? data.autoReplyAllowedJids : [],
                        autoReplyBlockedJids: Array.isArray(data.autoReplyBlockedJids) ? data.autoReplyBlockedJids : [],
                    }));
                }
            })
            .catch(() => { });

        fetch(`/api/sessions/${sessionId}/settings`)
            .then(res => { if (!res.ok) throw new Error(); return res.json(); })
            .then(responseData => {
                const data = responseData?.data;
                if (data && !responseData.error) {
                    setPrivacyConfig({
                        ghostMode: data.config?.ghostMode || false,
                        antiDelete: data.config?.antiDelete || false,
                        readReceipts: data.config?.readReceipts ?? true,
                        proxyUrl: data.config?.proxyUrl || "",
                    });
                }
            })
            .catch(() => { });
    }, [sessionId]);

    const handleSaveBot = async () => {
        if (!sessionId) return;
        setBotLoading(true);
        try {
            const res = await fetch(`/api/sessions/${sessionId}/bot-config`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(botConfig)
            });

            if (res.ok) {
                toast.success("Agent configuration saved successfully");
            } else {
                toast.error("Failed to save agent configuration");
            }
        } catch (e) {
            console.error(e);
            toast.error("Error saving agent configuration");
        } finally {
            setBotLoading(false);
        }
    };

    const handleSavePrivacy = async () => {
        if (!sessionId) return;
        setPrivacyLoading(true);
        try {
            const res = await fetch(`/api/sessions/${sessionId}/settings`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    config: {
                        ghostMode: privacyConfig.ghostMode,
                        antiDelete: privacyConfig.antiDelete,
                        readReceipts: privacyConfig.readReceipts,
                        proxyUrl: privacyConfig.proxyUrl
                    }
                })
            });

            if (res.ok) {
                toast.success("Network & Privacy settings saved successfully");
            } else {
                toast.error("Failed to save settings");
            }
        } catch (e) {
            console.error(e);
            toast.error("Error saving privacy settings");
        } finally {
            setPrivacyLoading(false);
        }
    };

    const addJid = (listName: 'botAllowedJids' | 'botBlockedJids' | 'autoReplyAllowedJids' | 'autoReplyBlockedJids', value: string, clearFn: (v: string) => void) => {
        if (!value || !value.trim()) return;
        let formatted = value.trim();
        if (!formatted.includes('@')) formatted += '@s.whatsapp.net';

        if (!botConfig[listName].includes(formatted)) {
            setBotConfig(prev => ({
                ...prev,
                [listName]: [...prev[listName], formatted]
            }));
        }
        clearFn("");
    };

    const removeJid = (listName: 'botAllowedJids' | 'botBlockedJids' | 'autoReplyAllowedJids' | 'autoReplyBlockedJids', jid: string) => {
        setBotConfig(prev => ({
            ...prev,
            [listName]: prev[listName].filter(item => item !== jid)
        }));
    };

    return (
        <SessionGuard>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl sm:text-3xl font-bold tracking-tight">Agent Settings</h2>
                        <p className="text-muted-foreground text-sm mt-1">Configure agent commands, auto-reply rules, AI intelligence, and privacy for your session.</p>
                    </div>
                    <Button onClick={handleSaveBot} disabled={botLoading || !sessionId} className="shadow">
                        {botLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save All Agent Settings
                    </Button>
                </div>

                {/* Master Agent Switch Banner */}
                <Card className={botConfig.enabled ? "border-primary/40 bg-primary/5" : "border-destructive/40 bg-destructive/5"}>
                    <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Bot className={`h-6 w-6 ${botConfig.enabled ? "text-primary" : "text-muted-foreground"}`} />
                                <h3 className="text-lg font-bold">
                                    {botConfig.enabled ? "Agent is Active & Listening" : "Agent is Currently Disabled"}
                                </h3>
                                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${botConfig.enabled ? "bg-green-500/20 text-green-700 dark:text-green-400" : "bg-red-500/20 text-red-700 dark:text-red-400"}`}>
                                    {botConfig.enabled ? "Active" : "Paused"}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {botConfig.enabled
                                    ? "Commands (e.g. #ping, #sticker, #uptime), auto-replies, and AI responses will trigger based on your rules below."
                                    : "All automated agent actions, command parsing, and auto-replies are paused for this session."}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Label htmlFor="master-bot-switch" className="font-semibold text-sm cursor-pointer">
                                {botConfig.enabled ? "Enabled" : "Disabled"}
                            </Label>
                            <Switch
                                id="master-bot-switch"
                                checked={botConfig.enabled}
                                onCheckedChange={(val) => setBotConfig(prev => ({ ...prev, enabled: val }))}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Agent Commands & Access Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                            Agent Commands & Access Control
                        </CardTitle>
                        <CardDescription>Configure agent identity and who can trigger interactive commands (e.g. #ping, #uptime, #sticker).</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-2">
                            <Label>Agent Name</Label>
                            <Input
                                placeholder="WINA Agent"
                                value={botConfig.botName}
                                onChange={(e) => setBotConfig(prev => ({ ...prev, botName: e.target.value }))}
                            />
                            <p className="text-xs text-muted-foreground">The display name used by the agent in headers and sticker packs.</p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Command Prefix</Label>
                                <Input
                                    className="max-w-[120px]"
                                    placeholder="#"
                                    maxLength={3}
                                    value={botConfig.prefix}
                                    onChange={(e) => setBotConfig(prev => ({ ...prev, prefix: e.target.value }))}
                                />
                                <p className="text-xs text-muted-foreground">Prefix character before commands (e.g. #ping, !ping, /ping).</p>
                            </div>
                            <div className="grid gap-2">
                                <Label>Command Interaction Mode</Label>
                                <Select
                                    value={botConfig.botMode}
                                    onValueChange={(v: any) => setBotConfig(prev => ({ ...prev, botMode: v }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Mode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PUBLIC">Public (Everyone can use commands)</SelectItem>
                                        <SelectItem value="ALL">Public (Everyone)</SelectItem>
                                        <SelectItem value="OWNER">Private (Only session owner can use commands)</SelectItem>
                                        <SelectItem value="SPECIFIC">Whitelist (Only allowed numbers)</SelectItem>
                                        <SelectItem value="BLACKLIST">Blacklist (Everyone except blocked numbers)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    {botConfig.botMode === 'OWNER'
                                        ? "⚠️ Private mode: Commands only trigger when sent by the connected WhatsApp number itself. Switch to Public if you want others to trigger commands."
                                        : "Controls who is allowed to run commands."}
                                </p>
                            </div>
                        </div>

                        {(botConfig.botMode === 'SPECIFIC' || botConfig.botMode === 'BLACKLIST') && (
                            <div className="space-y-4 pt-4 border-t border-border/50 animate-in fade-in slide-in-from-top-1 duration-200">
                                <Label className="flex items-center gap-2">
                                    <UserCheck className="h-4 w-4" />
                                    {botConfig.botMode === 'SPECIFIC' ? "Command Whitelisted Numbers" : "Command Blacklisted Numbers"}
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="628123456789 or 628123456789@s.whatsapp.net"
                                        value={newBotJid}
                                        onChange={(e) => setNewBotJid(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addJid(botConfig.botMode === 'SPECIFIC' ? 'botAllowedJids' : 'botBlockedJids', newBotJid, setNewBotJid)}
                                    />
                                    <Button variant="outline" size="icon" onClick={() => addJid(botConfig.botMode === 'SPECIFIC' ? 'botAllowedJids' : 'botBlockedJids', newBotJid, setNewBotJid)}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {(botConfig.botMode === 'SPECIFIC' ? botConfig.botAllowedJids : botConfig.botBlockedJids).map(jid => (
                                        <div key={jid} className="flex items-center gap-1.5 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs font-medium">
                                            {jid}
                                            <button onClick={() => removeJid(botConfig.botMode === 'SPECIFIC' ? 'botAllowedJids' : 'botBlockedJids', jid)} className="text-muted-foreground hover:text-destructive transition-colors">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {(botConfig.botMode === 'SPECIFIC' ? botConfig.botAllowedJids : botConfig.botBlockedJids).length === 0 && (
                                        <p className="text-xs text-muted-foreground italic">No numbers added yet.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border/50">
                            <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                <Label htmlFor="enable-ping" className="flex flex-col space-y-1 cursor-pointer">
                                    <span className="font-medium">Ping Command</span>
                                    <span className="font-normal text-[10px] text-muted-foreground">Respond to {botConfig.prefix}ping</span>
                                </Label>
                                <Switch id="enable-ping" checked={botConfig.enablePing}
                                    onCheckedChange={c => setBotConfig(prev => ({ ...prev, enablePing: c }))} />
                            </div>
                            <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                <Label htmlFor="enable-uptime" className="flex flex-col space-y-1 cursor-pointer">
                                    <span className="font-medium">Uptime Command</span>
                                    <span className="font-normal text-[10px] text-muted-foreground">Respond to {botConfig.prefix}uptime</span>
                                </Label>
                                <Switch id="enable-uptime" checked={botConfig.enableUptime}
                                    onCheckedChange={c => setBotConfig(prev => ({ ...prev, enableUptime: c }))} />
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button className="w-full sm:w-auto" onClick={handleSaveBot} disabled={botLoading || !sessionId}>
                                {botLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Command Settings
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Auto-Reply & Keyword Access Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Reply className="h-5 w-5 text-blue-500" />
                            Auto-Reply Access Mode
                        </CardTitle>
                        <CardDescription>Determine who can receive automated keyword replies and AI responses in private chats.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-2">
                            <Label>Auto-Reply Target Audience</Label>
                            <Select
                                value={botConfig.autoReplyMode}
                                onValueChange={(v: any) => setBotConfig(prev => ({ ...prev, autoReplyMode: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Auto-Reply Mode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Public (Reply to all incoming private messages)</SelectItem>
                                    <SelectItem value="OWNER">Self Mode (Snippet mode — only triggers when owner types keywords)</SelectItem>
                                    <SelectItem value="SPECIFIC">Whitelist (Only reply to specified customer numbers)</SelectItem>
                                    <SelectItem value="BLACKLIST">Blacklist (Reply to everyone except blocked numbers)</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Default is <strong>Public (ALL)</strong>, which automatically answers incoming customer inquiries in private chats.
                            </p>
                        </div>

                        {(botConfig.autoReplyMode === 'SPECIFIC' || botConfig.autoReplyMode === 'BLACKLIST') && (
                            <div className="space-y-4 pt-4 border-t border-border/50 animate-in fade-in slide-in-from-top-1 duration-200">
                                <Label className="flex items-center gap-2">
                                    <UserCheck className="h-4 w-4" />
                                    {botConfig.autoReplyMode === 'SPECIFIC' ? "Auto-Reply Whitelisted Numbers" : "Auto-Reply Blacklisted Numbers"}
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="628123456789 or 628123456789@s.whatsapp.net"
                                        value={newAutoReplyJid}
                                        onChange={(e) => setNewAutoReplyJid(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addJid(botConfig.autoReplyMode === 'SPECIFIC' ? 'autoReplyAllowedJids' : 'autoReplyBlockedJids', newAutoReplyJid, setNewAutoReplyJid)}
                                    />
                                    <Button variant="outline" size="icon" onClick={() => addJid(botConfig.autoReplyMode === 'SPECIFIC' ? 'autoReplyAllowedJids' : 'autoReplyBlockedJids', newAutoReplyJid, setNewAutoReplyJid)}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {(botConfig.autoReplyMode === 'SPECIFIC' ? botConfig.autoReplyAllowedJids : botConfig.autoReplyBlockedJids).map(jid => (
                                        <div key={jid} className="flex items-center gap-1.5 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs font-medium">
                                            {jid}
                                            <button onClick={() => removeJid(botConfig.autoReplyMode === 'SPECIFIC' ? 'autoReplyAllowedJids' : 'autoReplyBlockedJids', jid)} className="text-muted-foreground hover:text-destructive transition-colors">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {(botConfig.autoReplyMode === 'SPECIFIC' ? botConfig.autoReplyAllowedJids : botConfig.autoReplyBlockedJids).length === 0 && (
                                        <p className="text-xs text-muted-foreground italic">No numbers added yet.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="pt-2">
                            <Button className="w-full sm:w-auto" onClick={handleSaveBot} disabled={botLoading || !sessionId}>
                                {botLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Auto-Reply Access
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Custom AI / LLM Auto-Reply Agent Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bot className="h-5 w-5 text-purple-500" />
                            Custom AI Agent (Smart Reply & Inbox Filter)
                        </CardTitle>
                        <CardDescription>
                            Configure your backend AI agent brain (Groq / OpenAI compatible) to handle smart private replies and natural language chat filtering.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg bg-purple-500/5 border-purple-500/20">
                            <Label htmlFor="ai-enabled" className="flex flex-col space-y-1">
                                <span className="font-semibold text-purple-700 dark:text-purple-400">Enable Custom AI Agent</span>
                                <span className="font-normal text-xs text-muted-foreground">When enabled, private inquiries are intelligently answered by your AI agent brain when no static rule matches.</span>
                            </Label>
                            <Switch id="ai-enabled" checked={botConfig.aiEnabled}
                                onCheckedChange={c => setBotConfig(prev => ({ ...prev, aiEnabled: c }))} />
                        </div>

                        {botConfig.aiEnabled && (
                            <div className="grid gap-6 animate-in fade-in slide-in-from-top-1 duration-200">
                                <div className="grid gap-2">
                                    <Label className="font-semibold">API Key (Groq / OpenAI compatible)</Label>
                                    <Input
                                        type="password"
                                        placeholder="gsk_..."
                                        value={botConfig.aiApiKey}
                                        onChange={e => setBotConfig(prev => ({ ...prev, aiApiKey: e.target.value }))}
                                    />
                                    <p className="text-xs text-muted-foreground">Your Groq or compatible API key.</p>
                                </div>
                                <div className="grid gap-2">
                                    <Label className="font-semibold">Model Name</Label>
                                    <Input
                                        placeholder="qwen/qwen3.8-27b"
                                        value={botConfig.aiModel}
                                        onChange={e => setBotConfig(prev => ({ ...prev, aiModel: e.target.value }))}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="font-semibold">AI Agent System Instructions / Brain</Label>
                                    <Textarea
                                        rows={4}
                                        placeholder="You are an intelligent AI assistant for our firm. Reply smartly, naturally, and contextually to private inquiries."
                                        value={botConfig.aiPrompt}
                                        onChange={e => setBotConfig(prev => ({ ...prev, aiPrompt: e.target.value }))}
                                    />
                                    <p className="text-xs text-muted-foreground">The core persona, instructions, and company knowledge base for your AI agent.</p>
                                </div>
                                <div className="grid gap-2">
                                    <Label className="font-semibold">Natural Language Inbox Allocation Filter</Label>
                                    <Textarea
                                        rows={3}
                                        placeholder="Example: Only allow private messages about automation or firm-related inquiries. Strictly restrict or ignore spam and casual greetings."
                                        value={botConfig.customFilterPrompt}
                                        onChange={e => setBotConfig(prev => ({ ...prev, customFilterPrompt: e.target.value }))}
                                    />
                                    <p className="text-xs text-muted-foreground">Plain language rules to determine which private inquiries should be answered or ignored.</p>
                                </div>
                            </div>
                        )}

                        <div className="pt-2">
                            <Button onClick={handleSaveBot} disabled={botLoading || !sessionId}>
                                {botLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save AI Agent Settings
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Automation & Presence Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-yellow-500" />
                            Automation & Presence
                        </CardTitle>
                        <CardDescription>Advanced agent automation and presence customization.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                <Label htmlFor="always-online" className="flex flex-col space-y-1 cursor-pointer">
                                    <span className="font-medium">Always Online</span>
                                    <span className="font-normal text-[10px] text-muted-foreground">Show as "Online" on WhatsApp even when inactive.</span>
                                </Label>
                                <Switch id="always-online" checked={botConfig.alwaysOnline}
                                    onCheckedChange={c => setBotConfig(prev => ({ ...prev, alwaysOnline: c }))} />
                            </div>
                            <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                <Label htmlFor="auto-read" className="flex flex-col space-y-1 cursor-pointer">
                                    <span className="font-medium">Auto Read (Blue Ticks)</span>
                                    <span className="font-normal text-[10px] text-muted-foreground">Automatically mark incoming messages as read.</span>
                                </Label>
                                <Switch id="auto-read" checked={botConfig.autoRead}
                                    onCheckedChange={c => setBotConfig(prev => ({ ...prev, autoRead: c }))} />
                            </div>
                        </div>

                        <div className="space-y-2 border-t border-border/50 pt-4">
                            <Label className="flex items-center gap-2">
                                <MessageSquarePlus className="h-4 w-4 text-primary" />
                                Welcome Message
                            </Label>
                            <Textarea
                                placeholder="Hello! Welcome to our WhatsApp service. How can I help you today?"
                                className="min-h-[100px]"
                                value={botConfig.welcomeMessage}
                                onChange={(e) => setBotConfig(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                            />
                            <p className="text-[10px] text-muted-foreground">Sent automatically to new contacts on their very first incoming message.</p>
                        </div>

                        <div className="pt-2">
                            <Button className="w-full sm:w-auto" onClick={handleSaveBot} disabled={botLoading || !sessionId}>
                                {botLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Automation Settings
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Media & Stickers Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Media & Stickers</CardTitle>
                        <CardDescription>Configure how the agent handles media and sticker conversion.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                <Label htmlFor="enable-sticker" className="flex flex-col space-y-1 cursor-pointer">
                                    <span className="font-medium">Image to Sticker</span>
                                    <span className="font-normal text-xs text-muted-foreground">Auto-convert images with {botConfig.prefix}sticker</span>
                                </Label>
                                <Switch id="enable-sticker" checked={botConfig.enableSticker}
                                    onCheckedChange={c => setBotConfig(prev => ({ ...prev, enableSticker: c }))} />
                            </div>
                            <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                <Label htmlFor="enable-video-sticker" className="flex flex-col space-y-1 cursor-pointer">
                                    <span className="font-medium">Video to Sticker</span>
                                    <span className="font-normal text-xs text-muted-foreground">Auto-convert short videos/GIFs</span>
                                </Label>
                                <Switch id="enable-video-sticker" checked={botConfig.enableVideoSticker}
                                    onCheckedChange={c => setBotConfig(prev => ({ ...prev, enableVideoSticker: c }))} />
                            </div>
                        </div>

                        <div className="grid gap-2 border-t border-border/50 pt-4">
                            <Label>Max Sticker Video Duration: <strong>{botConfig.maxStickerDuration}s</strong></Label>
                            <Slider
                                value={[botConfig.maxStickerDuration]}
                                onValueChange={([v]) => setBotConfig(prev => ({ ...prev, maxStickerDuration: v }))}
                                min={3}
                                max={30}
                                step={1}
                            />
                            <p className="text-xs text-muted-foreground">Maximum video duration (in seconds) allowed for sticker conversion.</p>
                        </div>

                        <div className="grid gap-2 border-t border-border/50 pt-4">
                            <Label>Remove.bg API Key (Optional)</Label>
                            <Input
                                type="password"
                                placeholder="Enter your Remove.bg API Key"
                                value={botConfig.removeBgApiKey}
                                onChange={(e) => setBotConfig(prev => ({ ...prev, removeBgApiKey: e.target.value }))}
                            />
                            <p className="text-xs text-muted-foreground">Enables background removal for stickers (use <code className="bg-muted px-1 rounded">{botConfig.prefix}sticker nobg</code>).</p>
                        </div>

                        <div className="pt-2">
                            <Button className="w-full sm:w-auto" onClick={handleSaveBot} disabled={botLoading || !sessionId}>
                                {botLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Media Settings
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Anti-Ban Protection (Tier 1 & Account Safety) */}
                <Card className="border-orange-500/30">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-orange-500" />
                                Anti-Ban Protection & Outbound Pacing (Tier 1)
                            </CardTitle>
                            {botConfig.antiSpamEnabled && botConfig.spamLimit === 1 && botConfig.spamInterval >= 60 && botConfig.spamDelayMin >= 4000 && (
                                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-green-500/20 text-green-700 dark:text-green-400 self-start">
                                    🛡️ Max Survival Mode Active
                                </span>
                            )}
                        </div>
                        <CardDescription>
                            Prevent WhatsApp rate-limiting or automated bans by enforcing strict human-paced intervals on outgoing messages.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg bg-orange-500/5 border-orange-500/20">
                            <Label htmlFor="anti-spam" className="flex flex-col space-y-1">
                                <span className="font-semibold text-orange-700 dark:text-orange-400">Enable Outbound Anti-Ban Delay</span>
                                <span className="font-normal text-xs text-muted-foreground">Queues and paces all outgoing agent replies, auto-replies, and broadcasts to mimic human speed.</span>
                            </Label>
                            <Switch id="anti-spam" checked={botConfig.antiSpamEnabled}
                                onCheckedChange={c => setBotConfig(prev => ({ ...prev, antiSpamEnabled: c }))} />
                        </div>

                        {botConfig.antiSpamEnabled && (
                            <div className="grid gap-6 animate-in fade-in slide-in-from-top-1 duration-200">
                                {/* One-click Tier 1 Extreme Preset */}
                                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold flex items-center gap-1.5 text-primary">
                                            <ShieldCheck className="h-4 w-4" />
                                            High-Survival Safe Preset (Recommended)
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Threshold: <strong>1</strong> (no bursts) • Window: <strong>60s</strong> • Delays: <strong>4s–10s dynamic jitter</strong>.
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="shrink-0 border-primary/40 hover:bg-primary/10"
                                        onClick={() => {
                                            setBotConfig(prev => ({
                                                ...prev,
                                                antiSpamEnabled: true,
                                                spamLimit: 1,
                                                spamInterval: 60,
                                                spamDelayMin: 4000,
                                                spamDelayMax: 10000,
                                            }));
                                            toast.success("Applied High Survival Preset! Click 'Save Protection Settings' to store.");
                                        }}
                                    >
                                        Apply 1-Click Safe Preset
                                    </Button>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label className="font-semibold">Messages Threshold</Label>
                                        <Input
                                            type="number"
                                            value={botConfig.spamLimit}
                                            onChange={e => setBotConfig(prev => ({ ...prev, spamLimit: parseInt(e.target.value) || 1 }))}
                                            min={1}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Allowed burst messages. Set to <strong>1</strong> for strict pacing on every single outgoing message.
                                        </p>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="font-semibold">Time Window (Seconds)</Label>
                                        <Input
                                            type="number"
                                            value={botConfig.spamInterval}
                                            onChange={e => setBotConfig(prev => ({ ...prev, spamInterval: parseInt(e.target.value) || 1 }))}
                                            min={1}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Rolling tracking window. Recommended: <strong>60s</strong>.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label className="font-semibold">Min Delay (ms)</Label>
                                        <Input
                                            type="number"
                                            value={botConfig.spamDelayMin}
                                            onChange={e => setBotConfig(prev => ({ ...prev, spamDelayMin: parseInt(e.target.value) || 0 }))}
                                            min={0}
                                            step={100}
                                        />
                                        <p className="text-xs text-muted-foreground">Recommended: <strong>4000ms (4 seconds)</strong>.</p>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="font-semibold">Max Delay (ms)</Label>
                                        <Input
                                            type="number"
                                            value={botConfig.spamDelayMax}
                                            onChange={e => setBotConfig(prev => ({ ...prev, spamDelayMax: parseInt(e.target.value) || 0 }))}
                                            min={0}
                                            step={100}
                                        />
                                        <p className="text-xs text-muted-foreground">Recommended: <strong>10000ms (10 seconds)</strong> for random human jitter.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="pt-2">
                            <Button onClick={handleSaveBot} disabled={botLoading || !sessionId}>
                                {botLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Protection Settings
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Network & Static Residential Proxy (Tier 2) */}
                <Card className="border-blue-500/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-blue-500" />
                            Network & Static Residential Proxy (Tier 2)
                        </CardTitle>
                        <CardDescription>
                            Route Baileys WebSockets through a static residential ISP proxy matching your SIM card region to bypass Datacenter ASN IP detection.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-2">
                            <Label className="font-semibold">Static Residential Proxy URL (Optional)</Label>
                            <Input
                                placeholder="socks5://user:pass@residential.proxy.com:1080 or http://user:pass@host:port"
                                value={privacyConfig.proxyUrl}
                                onChange={e => setPrivacyConfig(prev => ({ ...prev, proxyUrl: e.target.value }))}
                            />
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Supports <strong>socks5://</strong> and <strong>http://</strong> formats. Leave blank to connect directly over host network.
                                <br />
                                💡 <em>Best practice:</em> Use a static residential proxy originating in the same country as your physical SIM card.
                            </p>
                        </div>

                        <div className="pt-2">
                            <Button onClick={handleSavePrivacy} disabled={privacyLoading || !sessionId}>
                                {privacyLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Proxy & Network Settings
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Privacy & Utility */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <EyeOff className="h-5 w-5 text-indigo-500" />
                            Privacy & Utility
                        </CardTitle>
                        <CardDescription>Configure ghost mode, anti-delete, and read receipts for your session.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="ghost-mode" className="flex flex-col space-y-1">
                                <span className="font-medium">Ghost Mode</span>
                                <span className="font-normal text-xs text-muted-foreground">View status and read messages without sending blue ticks.</span>
                            </Label>
                            <Switch id="ghost-mode" checked={privacyConfig.ghostMode}
                                onCheckedChange={c => setPrivacyConfig(prev => ({ ...prev, ghostMode: c }))} />
                        </div>

                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="anti-delete" className="flex flex-col space-y-1">
                                <span className="font-medium">Anti-Delete</span>
                                <span className="font-normal text-xs text-muted-foreground">Keep messages even if the sender deletes them for everyone.</span>
                            </Label>
                            <Switch id="anti-delete" checked={privacyConfig.antiDelete}
                                onCheckedChange={c => setPrivacyConfig(prev => ({ ...prev, antiDelete: c }))} />
                        </div>

                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="read-receipts" className="flex flex-col space-y-1">
                                <span className="font-medium">Read Receipts</span>
                                <span className="font-normal text-xs text-muted-foreground">Send delivery and read receipts when you view messages in the dashboard.</span>
                            </Label>
                            <Switch id="read-receipts" checked={privacyConfig.readReceipts}
                                onCheckedChange={c => setPrivacyConfig(prev => ({ ...prev, readReceipts: c }))} />
                        </div>

                        <div className="pt-2">
                            <Button onClick={handleSavePrivacy} disabled={privacyLoading || !sessionId}>
                                {privacyLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Privacy Settings
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Account Safety 4-Tier Blueprint Status */}
                <Card className="border-border/60 bg-muted/20">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-emerald-500" />
                            Multi-Tier Account Safety Architecture Status
                        </CardTitle>
                        <CardDescription>
                            Summary of your multi-tiered defense against automated WhatsApp detection systems:
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3 text-xs">
                        <div className="flex items-start gap-2 p-2.5 rounded-lg border bg-background/50">
                            <span className="font-bold text-primary shrink-0">Tier 1:</span>
                            <div>
                                <strong>Pacing & Velocity Bounds:</strong> Anti-spam queue intercepts every outgoing message and enforces human delays ({botConfig.spamDelayMin}ms–{botConfig.spamDelayMax}ms) with dynamic jitter.
                            </div>
                        </div>
                        <div className="flex items-start gap-2 p-2.5 rounded-lg border bg-background/50">
                            <span className="font-bold text-primary shrink-0">Tier 2:</span>
                            <div>
                                <strong>Network & Reconnection Hardening:</strong> Exponential backoff with jitter (5s, 9s, 16s, 29s, 52s) prevents auth loops and reconnect storms. SOCKS5/HTTP residential proxy support masks datacenter IPs. PM2 backoff configured.
                            </div>
                        </div>
                        <div className="flex items-start gap-2 p-2.5 rounded-lg border bg-background/50">
                            <span className="font-bold text-primary shrink-0">Tier 3:</span>
                            <div>
                                <strong>AI Agent Humanization:</strong> Inbound queries wait 1.5s–3.5s reading latency, trigger live "composing / typing..." presence, and simulate real human keystroke pacing (35ms/char) before dispatch.
                            </div>
                        </div>
                        <div className="flex items-start gap-2 p-2.5 rounded-lg border bg-background/50">
                            <span className="font-bold text-primary shrink-0">Tier 4:</span>
                            <div>
                                <strong>Operational Protocols:</strong> Strictly inbound-first. Keep the physical phone powered on and connected to Wi-Fi to maintain Meta background multi-device telemetry synchronization.
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </SessionGuard>
    );
}
