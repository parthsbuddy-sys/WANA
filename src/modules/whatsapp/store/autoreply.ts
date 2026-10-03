import { prisma } from "@/lib/prisma";
import type { WASocket } from "@whiskeysockets/baileys";
import { normalizeMessageContent } from "@whiskeysockets/baileys";
import { logger } from "@/lib/logger";

// Helper for permission check (Deduplicate from command-handler if possible, but keep simple here)
function canAutoReply(config: any, fromMe: boolean, senderJid: string): boolean {
    if (!config || !config.enabled) return false;

    // Auto Reply Specific Mode
    const mode = config.autoReplyMode || 'ALL';

    if (fromMe) {
        // If mode is OWNER, it triggers for ME? 
        // Auto Reply usually replies TO someone. 
        // If I send a message, and mode is OWNER, should it reply to me? 
        // User requested "Self Mode" -> Use case: Snippets.
        // So yes, if fromMe checks out.

        // However, standard auto-reply logic (replying to incoming) should be blocked if fromMe is true AND mode is ALL?
        // No, typically Auto Reply doesn't trigger on own messages to prevent unexpected loops.
        // But for "Self Mode" (Macros), it MUST trigger on own messages.

        if (mode === 'OWNER') return true;
        if (mode === 'ALL') return false; // Standard auto-reply ignores self

        // Specific? 
        return false;
    } else {
        // Incoming message from others
        if (mode === 'OWNER') return false; // Owner only acts on Owner messages
        if (mode === 'ALL') return true;

        if (mode === 'SPECIFIC') {
            const allowedJids = config.autoReplyAllowedJids || [];
            if (Array.isArray(allowedJids)) {
                return allowedJids.some((jid: string) => senderJid.includes(jid));
            }
        }

        if (mode === 'BLACKLIST') {
            const blockedJids = config.autoReplyBlockedJids || [];
            if (Array.isArray(blockedJids)) {
                const isBlocked = blockedJids.some((jid: string) => senderJid.includes(jid));
                return !isBlocked; // Return true if NOT blocked
            }
            return true; // If blacklist empty, allow all
        }
    }

    return false;
}

export async function bindAutoReply(sock: WASocket, sessionId: string) {
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        // Fetch session ID and Bot Config once per batch (optimization)
        const session = await prisma.session.findUnique({
            where: { sessionId },
            // @ts-ignore
            include: { botConfig: true }
        });

        if (!session) return;

        // @ts-ignore
        let config = (session as any).botConfig;

        if (!config) {
            logger.warn("AutoReply", "No config found, creating default...");
            config = await prisma.botConfig.create({
                data: {
                    sessionId: session.id,
                    enabled: true,
                    botMode: 'OWNER',
                    autoReplyMode: 'ALL',
                    antiSpamEnabled: true,
                    spamLimit: 1,
                    spamInterval: 60,
                    spamDelayMin: 4000,
                    spamDelayMax: 10000
                }
            });
        }

        logger.debug("AutoReply", `Processing for ${sessionId}. Config: ${config ? "Found" : "Missing"}, ${config?.enabled ? "Enabled" : "Disabled"}`);

        if (!config || !config.enabled) return;

        for (const msg of messages) {
            const fromMe = msg.key.fromMe || false;
            const remoteJid = msg.key.remoteJid;

            // Standardized Sender Logic
            const isGroup = remoteJid?.endsWith("@g.us") || false;
            const remoteJidAlt = msg.key.remoteJidAlt;
            let senderJid = (isGroup ? (msg.key.participant || msg.participant) : remoteJid);

            if (!isGroup && remoteJidAlt) {
                senderJid = remoteJidAlt;
            }

            if (!remoteJid || !senderJid) continue;

            // 🛑 ABSOLUTE HARD BLOCK FOR ANY GROUP CHAT (@g.us)
            if (remoteJid.endsWith('@g.us')) {
                continue;
            }

            // Check permissions & access mode (OWNER, ALL, SPECIFIC, BLACKLIST)
            if (!canAutoReply(config, fromMe, senderJid)) {
                continue;
            }

            const content = normalizeMessageContent(msg.message);
            const text = content?.conversation || content?.extendedTextMessage?.text || ""; // Caption?

            if (!text) continue;

            try {
                // Fetch rules for this session
                const rules = await prisma.autoReply.findMany({
                    where: {
                        session: {
                            sessionId: sessionId
                        }
                    }
                });

                for (const rule of rules) {
                    let match = false;
                    const keyword = rule.keyword.toLowerCase();
                    const incoming = text.toLowerCase();

                    switch (rule.matchType) {
                        case 'EXACT':
                            match = incoming === keyword;
                            break;
                        case 'CONTAINS':
                            match = incoming.includes(keyword);
                            break;
                        case 'REGEX':
                            try {
                                const regex = new RegExp(rule.keyword, 'i');
                                match = regex.test(text); // Use original case for regex
                            } catch (e) {
                                logger.error("AutoReply", "Invalid regex in auto-reply", rule.keyword);
                            }
                            break;
                    }

                    if (match) {
                        // Check trigger context (GROUP, PRIVATE, or ALL)
                        const isGroup = remoteJid.endsWith('@g.us');
                        const triggerType = (rule as any).triggerType || 'ALL'; // Default to ALL if undefined

                        if (triggerType === 'GROUP' && !isGroup) continue;
                        if (triggerType === 'PRIVATE' && isGroup) continue;

                        logger.info("AutoReply", `Match: ${rule.keyword} -> ${remoteJid}`);

                        // Tier 3: Humanized Presence & Read Delay for static auto-reply
                        try {
                            // 1. Quick natural human reading delay (1.0s to 1.5s)
                            const readDelay = Math.floor(1000 + Math.random() * 600);
                            await new Promise(r => setTimeout(r, readDelay));
                            try {
                                await sock.readMessages([msg.key]);
                            } catch (readErr) { /* ignore */ }

                            // 2. Realistic "typing..." presence simulation (1.2s to 2.0s)
                            await sock.sendPresenceUpdate('composing', remoteJid);
                            const typingDelay = Math.floor(1200 + Math.random() * 800);
                            await new Promise(r => setTimeout(r, typingDelay));
                            await sock.sendPresenceUpdate('paused', remoteJid);
                        } catch (presenceErr) {
                            /* ignore */
                        }

                        if (rule.isMedia && rule.mediaUrl) {
                            const url = rule.mediaUrl;
                            const type = (rule as any).mediaType || "document";
                            
                            let payload: any = {};
                            if (rule.response) {
                                payload.caption = rule.response;
                            }

                            if (type === "image") {
                                payload.image = { url };
                            } else if (type === "video") {
                                payload.video = { url };
                            } else if (type === "audio") {
                                payload = { audio: { url } };
                            } else {
                                payload.document = { url };
                                payload.mimetype = 'application/octet-stream';
                                payload.fileName = url.split('/').pop() || 'document';
                            }
                            
                            try {
                                await sock.sendMessage(remoteJid, payload, { quoted: msg });
                            } catch (err: any) {
                                logger.error("AutoReply", `Failed to send media auto-reply from URL: ${err.message}. Falling back to text if response exists.`);
                                if (rule.response) {
                                    await sock.sendMessage(remoteJid, { text: rule.response }, { quoted: msg });
                                }
                            }
                        } else if (rule.response) {
                            await sock.sendMessage(remoteJid, { text: rule.response }, { quoted: msg });
                        }

                        break;
                    }
                }

                // 🤖 TIER 3: HUMANIZED SMART AI AGENT (Private Chats Only)
                // If no static rule matched, but AI Agent is configured in bot settings, generate a smart, contextual reply.
                // STRICT CHECK: Never trigger on own outgoing messages (!fromMe) to prevent infinite loops!
                if (config.aiEnabled && config.aiApiKey && !fromMe && !remoteJid.endsWith('@g.us')) {
                    try {
                        // 1. Natural Reading Latency (1.0s to 1.5s)
                        const readDelay = Math.floor(1000 + Math.random() * 600);
                        await new Promise(r => setTimeout(r, readDelay));

                        // Mark message as read on WhatsApp so the sender sees natural blue ticks
                        try {
                            await sock.readMessages([msg.key]);
                        } catch (e) {
                            /* ignore read error */
                        }

                        // 2. Trigger "Typing..." (Composing presence on Baileys)
                        try {
                            await sock.sendPresenceUpdate('composing', remoteJid);
                        } catch (e) {
                            /* ignore presence error */
                        }

                        const apiKey = config.aiApiKey;
                        const model = config.aiModel || "qwen/qwen3.8-27b";
                        let systemPrompt = config.aiPrompt || "You are a helpful and smart AI assistant for our firm. Reply naturally and concisely to private inquiries.";

                        // Enforce short natural replies to avoid high socket payload flags
                        systemPrompt += "\n\nImportant constraint for WhatsApp safety: Keep all replies concise (1 to 3 sentences maximum), natural, and clear. Avoid robotic walls of text.";

                        if (config.customFilterPrompt) {
                            systemPrompt += `\n\nRouting & Filtering Rules: ${config.customFilterPrompt}\nIf this message should be ignored or not replied to according to these rules, reply strictly with [IGNORE].`;
                        }

                        // Fetch recent conversation history (last 4 turns) for light multi-turn context
                        const recentMessages = await prisma.message.findMany({
                            where: { sessionId: session.id, remoteJid },
                            orderBy: { timestamp: 'desc' },
                            take: 4
                        });

                        const chatHistory = recentMessages.reverse().map(m => ({
                            role: m.fromMe ? "assistant" : "user",
                            content: m.content || ""
                        }));

                        const messagesPayload = [
                            { role: "system", content: systemPrompt },
                            ...chatHistory,
                            { role: "user", content: text }
                        ];

                        const aiRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                            method: "POST",
                            headers: {
                                "Authorization": `Bearer ${apiKey}`,
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                model: model,
                                messages: messagesPayload,
                                temperature: 0.7,
                                max_tokens: 200
                            })
                        });

                        if (aiRes.ok) {
                            const aiData = await aiRes.json();
                            const aiReply = aiData.choices?.[0]?.message?.content;
                            if (aiReply && !aiReply.includes("[IGNORE]")) {
                                // 3. Crisp typing simulation
                                const typingDelay = Math.min(Math.max(aiReply.length * 20, 1000), 2500);
                                await new Promise(r => setTimeout(r, typingDelay));

                                try {
                                    await sock.sendPresenceUpdate('paused', remoteJid);
                                } catch (e) {
                                    /* ignore */
                                }

                                await sock.sendMessage(remoteJid, { text: aiReply.trim() }, { quoted: msg });
                                logger.info("AI-Agent", `Humanized smart agent reply sent to ${remoteJid}: ${aiReply.substring(0, 50)}...`);
                            } else {
                                try {
                                    await sock.sendPresenceUpdate('paused', remoteJid);
                                } catch (e) {
                                    /* ignore */
                                }
                            }
                        } else {
                            try {
                                await sock.sendPresenceUpdate('paused', remoteJid);
                            } catch (e) {
                                /* ignore */
                            }
                        }
                    } catch (aiErr) {
                        logger.error("AI-Agent", "Error generating lightweight smart reply", aiErr);
                        try {
                            await sock.sendPresenceUpdate('paused', remoteJid);
                        } catch (e) {
                            /* ignore */
                        }
                    }
                }

            } catch (e) {
                logger.error("AutoReply", "Error executing auto-reply", e);
            }
        }
    });
}
