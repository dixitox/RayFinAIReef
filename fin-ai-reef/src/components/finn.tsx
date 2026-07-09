//-----------------------------------------------------------------------
// Finn's AI Reef — Finn the manta ray mascot + speech bubble
//-----------------------------------------------------------------------

import { type ReactNode } from "react";
import { canSpeak, speak } from "@/lib/speak";

interface FinnMascotProps {
    /** Smaller size for in-game headers. */
    small?: boolean;
}

/** Finn the friendly robot manta ray (decorative + labelled SVG). */
export function FinnMascot({ small }: FinnMascotProps) {
    return (
        <svg
            className={`reef-finn${small ? " small" : ""}`}
            viewBox="0 0 120 105"
            role="img"
            aria-label="Finn the friendly robot manta ray"
        >
            <path
                d="M60 20 C 20 25, 4 55, 16 72 C 36 60, 50 55, 60 55 C 70 55, 84 60, 104 72 C 116 55, 100 25, 60 20 Z"
                fill="#2EC4B6"
            />
            <ellipse cx="60" cy="46" rx="18" ry="27" fill="#3DD5C6" />
            <path d="M60 70 Q 60 92 60 100" stroke="#2EC4B6" strokeWidth="4" fill="none" strokeLinecap="round" />
            <circle cx="52" cy="41" r="4.4" fill="#06283D" />
            <circle cx="68" cy="41" r="4.4" fill="#06283D" />
            <circle cx="53.4" cy="39.6" r="1.5" fill="#fff" />
            <circle cx="69.4" cy="39.6" r="1.5" fill="#fff" />
            <path d="M50 51 Q 60 60 70 51" stroke="#06283D" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
    );
}

interface SpeechBubbleProps {
    /** Rich content shown in the bubble. */
    children: ReactNode;
    /**
     * Plain text spoken by the "Read to me" button. Omit to hide the button
     * (e.g. bubbles with no narratable text).
     */
    say?: string;
}

/**
 * Finn's speech bubble with an optional "Read to me" button that narrates
 * `say` via the browser SpeechSynthesis API (hidden when unsupported).
 */
export function SpeechBubble({ children, say }: SpeechBubbleProps) {
    return (
        <div className="reef-bubble">
            {children}
            {say && canSpeak && (
                <div>
                    <button
                        type="button"
                        className="reef-speak-btn"
                        onClick={() => speak(say)}
                    >
                        🔊 Read to me
                    </button>
                </div>
            )}
        </div>
    );
}

interface FinnRowProps {
    children: ReactNode;
    say?: string;
    small?: boolean;
}

/** Finn mascot next to a speech bubble — the app's signature layout. */
export function FinnRow({ children, say, small }: FinnRowProps) {
    return (
        <div className="reef-finnrow">
            <FinnMascot small={small} />
            <SpeechBubble say={say}>{children}</SpeechBubble>
        </div>
    );
}
