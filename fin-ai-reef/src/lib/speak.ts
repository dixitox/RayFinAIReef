//-----------------------------------------------------------------------
// Finn's AI Reef — "Read to me" text-to-speech
//
// Thin wrapper over the browser SpeechSynthesis API with feature detection
// so callers can hide the button when speech isn't available. Accessibility:
// lets non-readers hear every one of Finn's messages.
//-----------------------------------------------------------------------

export const canSpeak: boolean =
    typeof window !== "undefined" && "speechSynthesis" in window;

/** Speak the given text in Finn's friendly voice. Cancels any current speech. */
export function speak(text: string): void {
    if (!canSpeak || !text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.pitch = 1.15;
    window.speechSynthesis.speak(u);
}

/** Stop any in-progress speech. */
export function stopSpeaking(): void {
    if (canSpeak) window.speechSynthesis.cancel();
}
