//-----------------------------------------------------------------------
// Finn's AI Reef — Azure AI Speech (neural TTS)
//
// Gives Finn a genuinely human, soothing voice via Azure AI Speech neural
// voices (e.g. en-GB-SoniaNeural) — far more natural than the browser's
// built-in SpeechSynthesis voices.
//
// Configuration (all optional): if the key + region aren't set, the app
// silently falls back to browser voices (see speak.ts), so it still works
// fully offline and with no Azure account.
//
//   VITE_AZURE_SPEECH_KEY      Azure Speech resource key   (SECRET)
//   VITE_AZURE_SPEECH_REGION   Azure region, e.g. "uksouth"
//   VITE_AZURE_SPEECH_ENDPOINT (optional) custom/private-endpoint URL; only
//                              needed for custom-subdomain / Foundry resources
//   VITE_AZURE_SPEECH_VOICE    Voice name (default en-GB-SoniaNeural)
//
// Put these in .env.development.local (dev) / .env.production.local (build).
// Those files are git-ignored and are NOT overwritten by `rayfin env`.
//
// SECURITY NOTE: a resource key in the browser bundle is fine for a demo but
// not for production — swap SpeechConfig.fromSubscription for
// fromAuthorizationToken backed by a short-lived-token endpoint before ship.
//-----------------------------------------------------------------------

import type * as SpeechSDKType from "microsoft-cognitiveservices-speech-sdk";

const KEY = import.meta.env.VITE_AZURE_SPEECH_KEY as string | undefined;
const REGION = import.meta.env.VITE_AZURE_SPEECH_REGION as string | undefined;
// Optional: only needed for custom-subdomain / private-endpoint / Foundry
// multi-service resources. For a standard resource, REGION alone is enough.
const ENDPOINT = import.meta.env.VITE_AZURE_SPEECH_ENDPOINT as string | undefined;
const VOICE =
    (import.meta.env.VITE_AZURE_SPEECH_VOICE as string | undefined) || "en-GB-SoniaNeural";

/** True when an Azure Speech key plus a region (or explicit endpoint) are set. */
export const azureSpeechConfigured = Boolean(KEY && (REGION || ENDPOINT));

// The SDK is ~2MB — load it lazily and only when Azure is actually configured.
let sdkPromise: Promise<typeof SpeechSDKType> | null = null;
function loadSdk(): Promise<typeof SpeechSDKType> {
    sdkPromise ??= import("microsoft-cognitiveservices-speech-sdk");
    return sdkPromise;
}

let currentPlayer: SpeechSDKType.SpeakerAudioDestination | null = null;
let currentSynth: SpeechSDKType.SpeechSynthesizer | null = null;

/** Stop any in-progress Azure narration. */
export function stopAzure(): void {
    try { currentPlayer?.pause(); } catch { /* ignore */ }
    try { currentSynth?.close(); } catch { /* ignore */ }
    currentPlayer = null;
    currentSynth = null;
}

/**
 * Speak `text` with an Azure neural voice. Resolves `true` if it played,
 * `false` on any failure (so the caller can fall back to a browser voice).
 */
export async function speakAzure(text: string): Promise<boolean> {
    if (!azureSpeechConfigured || !text) return false;

    let SpeechSDK: typeof SpeechSDKType;
    try {
        SpeechSDK = await loadSdk();
    } catch {
        return false;
    }

    stopAzure(); // cancel anything already playing

    try {
        // Endpoint takes precedence (custom/private resources); otherwise region.
        const speechConfig = ENDPOINT
            ? SpeechSDK.SpeechConfig.fromEndpoint(new URL(ENDPOINT), KEY!)
            : SpeechSDK.SpeechConfig.fromSubscription(KEY!, REGION!);
        speechConfig.speechSynthesisVoiceName = VOICE;

        const player = new SpeechSDK.SpeakerAudioDestination();
        const audioConfig = SpeechSDK.AudioConfig.fromSpeakerOutput(player);
        const synth = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);

        currentPlayer = player;
        currentSynth = synth;

        // Close the synthesizer only once the audio has finished playing, so we
        // never cut narration off early.
        player.onAudioEnd = () => {
            try { synth.close(); } catch { /* ignore */ }
            if (currentSynth === synth) currentSynth = null;
            if (currentPlayer === player) currentPlayer = null;
        };

        return await new Promise<boolean>((resolve) => {
            synth.speakTextAsync(
                text,
                (result) => {
                    resolve(
                        result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted,
                    );
                },
                () => {
                    try { synth.close(); } catch { /* ignore */ }
                    if (currentSynth === synth) currentSynth = null;
                    if (currentPlayer === player) currentPlayer = null;
                    resolve(false);
                },
            );
        });
    } catch {
        return false;
    }
}
