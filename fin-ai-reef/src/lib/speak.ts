//-----------------------------------------------------------------------
// Finn's AI Reef — "Read to me" text-to-speech
//
// Thin wrapper over text-to-speech with feature detection so callers can hide
// the button when speech isn't available. Accessibility: lets non-readers hear
// every one of Finn's messages.
//
// Voice priority:
//   1. Azure AI Speech neural voice (human, soothing) — when configured.
//   2. The most natural browser SpeechSynthesis voice we can find.
// See azure-speech.ts for Azure configuration.
//-----------------------------------------------------------------------

import { azureSpeechConfigured, speakAzure, stopAzure } from "@/lib/azure-speech";

const browserSpeech: boolean =
    typeof window !== "undefined" && "speechSynthesis" in window;

/** True when we can narrate at all (Azure neural voice or a browser voice). */
export const canSpeak: boolean = browserSpeech || azureSpeechConfigured;

// Names that identify a natural, human-sounding female voice. The neural
// "Online (Natural)" voices (Edge) and macOS "premium"/"enhanced" voices sound
// genuinely human; legacy local SAPI voices (David/Mark/Zira) sound robotic.
const FEMALE_HINTS = [
    "aria", "jenny", "sonia", "libby", "emma", "michelle", "ava", "samantha",
    "zoe", "kate", "hazel", "susan", "female", "woman",
];
// Male / clearly-robotic voices we never want for Finn's soothing narration.
const AVOID_HINTS = ["david", "mark", "george", "daniel", "guy", "ryan", "brian", "male", "man"];

let cachedVoice: SpeechSynthesisVoice | null = null;
let voicesPrimed = false;

/** Score a voice: higher = more human + more suitable. English only. */
function scoreVoice(v: SpeechSynthesisVoice): number {
    const name = v.name.toLowerCase();
    const lang = (v.lang || "").toLowerCase();
    if (!lang.startsWith("en")) return -1; // English only

    let score = 0;
    // Neural / natural voices sound human — prioritise heavily.
    if (name.includes("natural")) score += 120;
    if (name.includes("online")) score += 70;
    if (name.includes("premium") || name.includes("enhanced")) score += 60;
    if (v.localService === false) score += 40; // network voices are usually neural
    // A calm female voice for Finn.
    if (FEMALE_HINTS.some((h) => name.includes(h))) score += 30;
    // Chrome's decent network voice.
    if (name.includes("google") && name.includes("female")) score += 25;
    // Accent preference: en-GB feels warmer for this UK app, then any en.
    if (lang.startsWith("en-gb")) score += 12;
    else score += 4;
    // Push robotic/male voices to the bottom.
    if (AVOID_HINTS.some((h) => name.includes(h))) score -= 100;
    return score;
}

/** Choose the most human-sounding English female voice (cached after first hit). */
function pickVoice(): SpeechSynthesisVoice | null {
    if (!canSpeak) return null;
    if (cachedVoice) return cachedVoice;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return null; // not loaded yet — try again later

    let best: SpeechSynthesisVoice | null = null;
    let bestScore = -Infinity;
    for (const v of voices) {
        const s = scoreVoice(v);
        if (s > bestScore) {
            bestScore = s;
            best = v;
        }
    }

    // If nothing English scored positively, fall back to any English voice.
    cachedVoice =
        best ??
        voices.find((v) => (v.lang || "").toLowerCase().startsWith("en")) ??
        voices[0] ??
        null;
    return cachedVoice;
}

/** Warm up the async voice list so the first "Read to me" already has a voice. */
export function primeVoices(): void {
    if (!browserSpeech || voicesPrimed) return;
    voicesPrimed = true;
    pickVoice();
    // Voices load asynchronously in most browsers; refresh the cache when ready.
    window.speechSynthesis.addEventListener?.("voiceschanged", () => {
        cachedVoice = null;
        pickVoice();
    });
}

if (browserSpeech) primeVoices();

/** Narrate `text` with the best available voice. Cancels any current speech. */
export function speak(text: string): void {
    if (!text) return;

    // Prefer Azure's human neural voice; fall back to a browser voice on failure.
    if (azureSpeechConfigured) {
        stopSpeaking();
        void speakAzure(text).then((ok) => {
            if (!ok) speakBrowser(text);
        });
        return;
    }

    speakBrowser(text);
}

/** Speak the given text with the most natural available browser voice. */
function speakBrowser(text: string): void {
    if (!browserSpeech || !text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voice = pickVoice();
    if (voice) {
        u.voice = voice;
        u.lang = voice.lang;
    }
    // Gentle, calming prosody — natural cadence, un-chirpy.
    u.rate = 0.95;
    u.pitch = 1.0;
    u.volume = 1;
    window.speechSynthesis.speak(u);
}

/** Stop any in-progress speech (Azure + browser). */
export function stopSpeaking(): void {
    if (browserSpeech) window.speechSynthesis.cancel();
    if (azureSpeechConfigured) stopAzure();
}
