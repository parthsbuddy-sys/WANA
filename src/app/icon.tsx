import { ImageResponse } from "next/og";

// Image metadata for crisp browser favicon tab
export const size = {
    width: 64,
    height: 64,
};
export const contentType = "image/png";

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                    borderRadius: "16px",
                    padding: "6px",
                }}
            >
                <svg
                    viewBox="0 0 512 512"
                    width="100%"
                    height="100%"
                    style={{ overflow: "visible" }}
                >
                    {/* WhatsApp Speech Bubble */}
                    <path
                        d="M 256 76 C 150 76 64 162 64 268 C 64 304 74 338 93 368 L 73 440 L 148 420 C 180 440 216 452 256 452 C 362 452 448 366 448 268 C 448 162 362 76 256 76 Z"
                        fill="#FFFFFF"
                    />

                    {/* Digital Technology Gear & Integration Hub */}
                    <g transform="translate(0, -6)">
                        {/* Outer Circuit Orbit */}
                        <circle cx="256" cy="264" r="108" fill="none" stroke="#0EA5E9" strokeWidth="7" strokeDasharray="16 10" />

                        {/* Tech Gear */}
                        <path
                            d="M 241 184 L 271 184 L 274 200 C 282 203 289 207 296 211 L 311 202 L 332 223 L 323 238 C 327 245 331 252 334 260 L 350 263 L 350 293 L 334 296 C 331 304 327 311 323 318 L 332 333 L 311 354 L 296 345 C 289 349 282 353 274 356 L 271 372 L 241 372 L 238 356 C 230 353 223 349 216 345 L 201 354 L 180 333 L 189 318 C 185 311 181 304 178 296 L 162 293 L 162 263 L 178 260 C 181 252 185 245 189 238 L 180 223 L 201 202 L 216 211 C 223 207 230 203 238 200 Z"
                            fill="#0284C7"
                        />

                        {/* Gear Core Center */}
                        <circle cx="256" cy="278" r="42" fill="#FFFFFF" />
                        <circle cx="256" cy="278" r="26" fill="#0284C7" />
                        <circle cx="256" cy="278" r="12" fill="#FFFFFF" />

                        {/* Connection Nodes */}
                        <line x1="256" y1="184" x2="256" y2="148" stroke="#0284C7" strokeWidth="8" />
                        <circle cx="256" cy="144" r="14" fill="#0284C7" />
                        <circle cx="256" cy="144" r="6" fill="#FFFFFF" />

                        <line x1="256" y1="372" x2="256" y2="402" stroke="#0284C7" strokeWidth="8" />
                        <circle cx="256" cy="406" r="14" fill="#0284C7" />
                        <circle cx="256" cy="406" r="6" fill="#FFFFFF" />

                        <line x1="322" y1="212" x2="350" y2="184" stroke="#0284C7" strokeWidth="8" />
                        <circle cx="354" cy="180" r="14" fill="#0284C7" />
                        <circle cx="354" cy="180" r="6" fill="#FFFFFF" />

                        <line x1="322" y1="344" x2="350" y2="372" stroke="#0284C7" strokeWidth="8" />
                        <circle cx="354" cy="376" r="14" fill="#0284C7" />
                        <circle cx="354" cy="376" r="6" fill="#FFFFFF" />

                        <line x1="190" y1="212" x2="162" y2="184" stroke="#0284C7" strokeWidth="8" />
                        <circle cx="158" cy="180" r="14" fill="#0284C7" />
                        <circle cx="158" cy="180" r="6" fill="#FFFFFF" />

                        <line x1="190" y1="344" x2="162" y2="372" stroke="#0284C7" strokeWidth="8" />
                        <circle cx="158" cy="376" r="14" fill="#0284C7" />
                        <circle cx="158" cy="376" r="6" fill="#FFFFFF" />
                    </g>
                </svg>
            </div>
        ),
        {
            ...size,
        }
    );
}
