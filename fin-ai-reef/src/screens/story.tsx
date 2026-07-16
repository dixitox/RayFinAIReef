//-----------------------------------------------------------------------
// Finn's AI Reef — "What is AI?" story intro
//
// A short, narrated story that explains AI in child-friendly language before
// the games. Each beat is auto-read in Finn's soothing voice (plus a manual
// "Read to me"). Tap-only paging, big targets, no reading barrier.
//-----------------------------------------------------------------------

import { useEffect, useState } from "react";
import { FinnRow } from "@/components/finn";
import { speak, stopSpeaking } from "@/lib/speak";

interface StoryBeat {
    emoji: string;
    /** Rich content shown in Finn's bubble. */
    text: React.ReactNode;
    /** Plain text narrated aloud. */
    say: string;
}

const STORY_BEATS: StoryBeat[] = [
    {
        emoji: "🌊",
        text: (
            <>
                Hi, I'm <b>Finn</b>! Before we play, let me tell you a little story
                about <b>AI</b> — that's short for <b>Artificial Intelligence</b>.
            </>
        ),
        say: "Hi, I'm Finn! Before we play, let me tell you a little story about A.I. — that's short for Artificial Intelligence.",
    },
    {
        emoji: "🧠",
        text: (
            <>
                AI is a kind of <b>clever computer brain</b>. It can look, listen, and
                answer questions — a bit like a helpful robot friend.
            </>
        ),
        say: "AI is a kind of clever computer brain. It can look, listen, and answer questions — a bit like a helpful robot friend.",
    },
    {
        emoji: "🍎",
        text: (
            <>
                But AI isn't born clever. It <b>learns from lots of examples</b> — just
                like how you learned what an apple is by seeing many apples!
            </>
        ),
        say: "But AI isn't born clever. It learns from lots of examples — just like how you learned what an apple is by seeing many apples!",
    },
    {
        emoji: "✨",
        text: (
            <>
                AI can do <b>amazing, helpful things</b> — reading stories aloud,
                translating languages, and even helping doctors keep people well.
            </>
        ),
        say: "AI can do amazing, helpful things — reading stories aloud, translating languages, and even helping doctors keep people well.",
    },
    {
        emoji: "🌑",
        text: (
            <>
                But AI can also <b>get things wrong</b>, or be used to <b>trick us</b> with
                fake pictures and messages. So we learn to look closely and think!
            </>
        ),
        say: "But AI can also get things wrong, or be used to trick us with fake pictures and messages. So we learn to look closely and think!",
    },
    {
        emoji: "🐠",
        text: (
            <>
                Now you know the secret: AI is clever, helpful, and sometimes tricky.
                Let's explore the reef and become <b>AI explorers</b> together!
            </>
        ),
        say: "Now you know the secret: AI is clever, helpful, and sometimes tricky. Let's explore the reef and become AI explorers together!",
    },
];

interface StoryProps {
    /** Finish the story and go play the games. */
    onStart: () => void;
    /** Jump straight back to the Reef Map. */
    onHome: () => void;
}

export function Story({ onStart, onHome }: StoryProps) {
    const [index, setIndex] = useState(0);
    const beat = STORY_BEATS[index];
    const isLast = index === STORY_BEATS.length - 1;

    // Auto-narrate each beat in Finn's soothing voice; stop when leaving.
    useEffect(() => {
        speak(beat.say);
        return () => stopSpeaking();
    }, [beat.say]);

    function next() {
        if (isLast) {
            stopSpeaking();
            onStart();
        } else {
            setIndex((i) => i + 1);
        }
    }

    function back() {
        setIndex((i) => Math.max(0, i - 1));
    }

    return (
        <section className="reef-screen reef-story" aria-labelledby="reef-story-title">
            <div className="reef-zonehdr" id="reef-story-title">📖 Finn's Story — What is AI?</div>

            <div className="reef-panel">
                <div className="reef-story-emoji" aria-hidden="true">{beat.emoji}</div>

                <FinnRow small say={beat.say}>{beat.text}</FinnRow>

                <p className="reef-story-count">Part {index + 1} of {STORY_BEATS.length}</p>
                <div className="reef-story-dots" aria-hidden="true">
                    {STORY_BEATS.map((_, i) => (
                        <span key={i} className={`reef-story-dot${i === index ? " on" : ""}`} />
                    ))}
                </div>

                <div className="reef-center">
                    {index > 0 && (
                        <button type="button" className="reef-btn blue" onClick={back}>
                            ◀ Back
                        </button>
                    )}
                    <button type="button" className="reef-btn go" onClick={next}>
                        {isLast ? "▶ Play the games" : "Next ▶"}
                    </button>
                </div>

                <div className="reef-center">
                    <button type="button" className="reef-skip" onClick={() => { stopSpeaking(); onHome(); }}>
                        Skip to the Reef Map
                    </button>
                </div>
            </div>
        </section>
    );
}
