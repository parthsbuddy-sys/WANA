import React from "react";

interface WinaLogoProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;
    className?: string;
    idPrefix?: string;
}

export function WinaLogo({ size = 36, className = "", idPrefix = "wina", ...props }: WinaLogoProps) {
    const waGreenId = `${idPrefix}-waGreen`;
    const softShadowId = `${idPrefix}-softShadow`;
    const techGradId = `${idPrefix}-techGrad`;
    const techGlowId = `${idPrefix}-techGlow`;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            width={size}
            height={size}
            className={className}
            {...props}
        >
            <defs>
                {/* Official WhatsApp Green Gradient */}
                <linearGradient id={waGreenId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#25D366" />
                    <stop offset="100%" stopColor="#128C7E" />
                </linearGradient>

                {/* Tech Integration Cyan-Emerald Gradient */}
                <linearGradient id={techGradId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0284C7" />
                    <stop offset="50%" stopColor="#0EA5E9" />
                    <stop offset="100%" stopColor="#10B981" />
                </linearGradient>

                {/* Soft Drop Shadow for Chat Bubble */}
                <filter id={softShadowId} x="-15%" y="-15%" width="130%" height="130%">
                    <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#075E54" floodOpacity="0.35" />
                </filter>

                {/* Tech Symbol Drop Shadow */}
                <filter id={techGlowId} x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#0369A1" floodOpacity="0.3" />
                </filter>
            </defs>

            {/* WhatsApp Green Squircle Badge */}
            <rect width="512" height="512" rx="115" fill={`url(#${waGreenId})`} />

            {/* Official WhatsApp Speech Bubble */}
            <g filter={`url(#${softShadowId})`}>
                <path
                    d="M 256 76 C 150 76 64 162 64 268 C 64 304 74 338 93 368 L 73 440 L 148 420 C 180 440 216 452 256 452 C 362 452 448 366 448 268 C 448 162 362 76 256 76 Z"
                    fill="#FFFFFF"
                />
            </g>

            {/* Digital Technology Gear & Integration Connection Hub */}
            <g id="integration-gear-hub" transform="translate(0, -6)" filter={`url(#${techGlowId})`}>
                {/* Outer Connection Circuit Ring */}
                <circle cx="256" cy="264" r="108" fill="none" stroke={`url(#${techGradId})`} strokeWidth="4.5" strokeDasharray="16 10" strokeOpacity="0.6" />

                {/* Precision Digital Tech Gear (6 Teeth with Rounded Recesses) */}
                <path
                    d="
                    M 241 184 L 271 184 L 274 200 C 282 203 289 207 296 211 L 311 202 L 332 223 L 323 238 C 327 245 331 252 334 260 L 350 263 L 350 293 L 334 296 C 331 304 327 311 323 318 L 332 333 L 311 354 L 296 345 C 289 349 282 353 274 356 L 271 372 L 241 372 L 238 356 C 230 353 223 349 216 345 L 201 354 L 180 333 L 189 318 C 185 311 181 304 178 296 L 162 293 L 162 263 L 178 260 C 181 252 185 245 189 238 L 180 223 L 201 202 L 216 211 C 223 207 230 203 238 200 Z
                    "
                    fill={`url(#${techGradId})`}
                />

                {/* Inner Gear Core Aperture */}
                <circle cx="256" cy="278" r="42" fill="#FFFFFF" />
                <circle cx="256" cy="278" r="26" fill={`url(#${techGradId})`} />
                <circle cx="256" cy="278" r="12" fill="#FFFFFF" />

                {/* Digital Circuit Integration Tracks & Connection Nodes */}
                {/* Top Node */}
                <line x1="256" y1="184" x2="256" y2="148" stroke={`url(#${techGradId})`} strokeWidth="5" strokeLinecap="round" />
                <circle cx="256" cy="144" r="11" fill={`url(#${techGradId})`} />
                <circle cx="256" cy="144" r="4.5" fill="#FFFFFF" />

                {/* Bottom Node */}
                <line x1="256" y1="372" x2="256" y2="402" stroke={`url(#${techGradId})`} strokeWidth="5" strokeLinecap="round" />
                <circle cx="256" cy="406" r="11" fill={`url(#${techGradId})`} />
                <circle cx="256" cy="406" r="4.5" fill="#FFFFFF" />

                {/* Top-Right Node */}
                <line x1="322" y1="212" x2="350" y2="184" stroke={`url(#${techGradId})`} strokeWidth="5" strokeLinecap="round" />
                <circle cx="354" cy="180" r="11" fill={`url(#${techGradId})`} />
                <circle cx="354" cy="180" r="4.5" fill="#FFFFFF" />

                {/* Bottom-Right Node */}
                <line x1="322" y1="344" x2="350" y2="372" stroke={`url(#${techGradId})`} strokeWidth="5" strokeLinecap="round" />
                <circle cx="354" cy="376" r="11" fill={`url(#${techGradId})`} />
                <circle cx="354" cy="376" r="4.5" fill="#FFFFFF" />

                {/* Top-Left Node */}
                <line x1="190" y1="212" x2="162" y2="184" stroke={`url(#${techGradId})`} strokeWidth="5" strokeLinecap="round" />
                <circle cx="158" cy="180" r="11" fill={`url(#${techGradId})`} />
                <circle cx="158" cy="180" r="4.5" fill="#FFFFFF" />

                {/* Bottom-Left Node */}
                <line x1="190" y1="344" x2="162" y2="372" stroke={`url(#${techGradId})`} strokeWidth="5" strokeLinecap="round" />
                <circle cx="158" cy="376" r="11" fill={`url(#${techGradId})`} />
                <circle cx="158" cy="376" r="4.5" fill="#FFFFFF" />
            </g>
        </svg>
    );
}
