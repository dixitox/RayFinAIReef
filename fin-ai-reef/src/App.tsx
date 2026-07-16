//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { useEffect, useMemo, useState } from "react";
import { loadReefContent, questionsFor, type LoadedContent } from "@/lib/reef-content";
import { useClassMode } from "@/hooks/use-class-mode";
import { ReefMap } from "@/screens/reef-map";
import { Story } from "@/screens/story";
import { TeachFinn } from "@/screens/teach-finn";
import { RealOrAi } from "@/screens/real-or-ai";
import { SmartOrNot } from "@/screens/smart-or-not";
import { Superpowers } from "@/screens/superpowers";
import { SafeHarbour } from "@/screens/safe-harbour";
import { ComingSoon } from "@/screens/coming-soon";

type ScreenId = "home" | "story" | "teach" | "real" | "smart" | "superpowers" | "safe" | "coming";

const PUPIL_AVATARS = ["🐠", "🐢", "🐬", "🦀", "🐙", "🦈", "🐡", "⭐", "🐚", "🦑"];

// Show the "What is AI?" story automatically the first time a child visits
// (replayable any time from the Reef Map). No PII — just a local "seen" flag.
const STORY_SEEN_KEY = "finn-seen-story";

function hasSeenStory(): boolean {
    try {
        return localStorage.getItem(STORY_SEEN_KEY) === "1";
    } catch {
        return false;
    }
}

function markStorySeen(): void {
    try {
        localStorage.setItem(STORY_SEEN_KEY, "1");
    } catch {
        /* ignore (private mode / storage disabled) */
    }
}

function App() {
    const [content, setContent] = useState<LoadedContent | null>(null);
    const [screen, setScreen] = useState<ScreenId>(() => (hasSeenStory() ? "home" : "story"));
    const [earned, setEarned] = useState<Set<string>>(new Set());

    const cls = useClassMode();

    useEffect(() => {
        let cancelled = false;
        loadReefContent().then((c) => {
            if (!cancelled) setContent(c);
        });
        return () => { cancelled = true; };
    }, []);

    const zones = useMemo(
        () => (content ? [...content.zones].sort((a, b) => a.sortOrder - b.sortOrder) : []),
        [content],
    );

    function award(badgeKey: string) {
        setEarned((prev) => (prev.has(badgeKey) ? prev : new Set(prev).add(badgeKey)));
    }

    function goHome() {
        setScreen("home");
    }

    function openStory() {
        setScreen("story");
    }

    function finishStory() {
        markStorySeen();
        setScreen("home");
    }

    function openZone(zoneKey: string) {
        if (zoneKey === "training-cove") setScreen("teach");
        else if (zoneKey === "murky-depths") setScreen("real");
        else if (zoneKey === "splash-zone") setScreen("smart");
        else if (zoneKey === "bright-reef") setScreen("superpowers");
        else if (zoneKey === "safe-harbour") setScreen("safe");
        else setScreen("coming");
    }

    const badgeIcons = useMemo(() => {
        if (!content) return "";
        return content.badges
            .filter((b) => earned.has(b.key))
            .map((b) => b.icon)
            .join(" ");
    }, [content, earned]);

    // Phase 2: when an educator is signed in but no pupil session started yet,
    // prompt for a pseudonymous emoji avatar (never a name).
    const needsAvatar = cls.isTeacher && !cls.pupil;

    return (
        <div className="reef-app">
            <div className="reef-bubbles" aria-hidden="true">
                <span /><span /><span /><span /><span /><span />
            </div>

            <div className="reef-wrap">
                <header className="reef-topbar">
                    <button type="button" className="brand" onClick={goHome} aria-label="Finn's AI Reef home">
                        🐠 Finn's AI Reef
                    </button>
                    <button type="button" className="reef-homebtn" onClick={goHome}>🏠 Reef Map</button>
                    <span className="spacer" />
                    {!cls.isTeacher ? (
                        <button
                            type="button"
                            className="reef-signinbtn"
                            onClick={() => void cls.signIn()}
                            disabled={cls.signingIn}
                            title="For teachers only — children never sign in"
                        >
                            {cls.signingIn ? "Signing in…" : "👩‍🏫 Sign in with Fabric"}
                        </button>
                    ) : (
                        <span className="reef-badgetray">
                            <span className="hint">Class mode {cls.pupil ? `· ${cls.pupil.avatar} ${cls.pupil.nickname}` : "· pick avatar"}</span>
                        </span>
                    )}
                    <span className="reef-badgetray">
                        <span className="hint">Badges:</span> {badgeIcons || "—"}
                    </span>
                </header>

                {cls.signInError && (
                    <p className="reef-status" role="alert">Sign-in problem: {cls.signInError}</p>
                )}

                {needsAvatar && (
                    <div className="reef-panel reef-avatar-panel">
                        <p className="reef-progress reef-avatar-hint">
                            Class mode is on. Pupil, tap an animal to be your secret badge — no names needed!
                        </p>
                        <div className="reef-cards">
                            {PUPIL_AVATARS.map((emoji) => (
                                <button
                                    key={emoji}
                                    type="button"
                                    className="reef-item tap reef-avatar-btn"
                                    onClick={() => void cls.startPupil(emoji)}
                                    aria-label={`Choose avatar ${emoji}`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {!content ? (
                    <div className="reef-loading">🌊 Diving into the reef…</div>
                ) : (
                    <>
                        {!content.fromBackend && (
                            <p className="reef-status">Playing with built-in reef content (offline mode).</p>
                        )}
                        {screen === "home" && <ReefMap zones={zones} onPlay={openZone} onStory={openStory} />}
                        {screen === "story" && (
                            <Story onStart={finishStory} onHome={finishStory} />
                        )}
                        {screen === "teach" && (
                            <TeachFinn
                                questions={questionsFor(content, "training-cove", "teach-finn")}
                                onAward={award}
                                onLog={cls.logAttempt}
                                onHome={goHome}
                            />
                        )}
                        {screen === "real" && (
                            <RealOrAi
                                questions={questionsFor(content, "murky-depths", "real-or-ai")}
                                onAward={award}
                                onLog={cls.logAttempt}
                                onHome={goHome}
                            />
                        )}
                        {screen === "smart" && (
                            <SmartOrNot
                                questions={questionsFor(content, "splash-zone", "sort-ai")}
                                onAward={award}
                                onLog={cls.logAttempt}
                                onHome={goHome}
                            />
                        )}
                        {screen === "superpowers" && (
                            <Superpowers
                                questions={questionsFor(content, "bright-reef", "ai-good")}
                                onAward={award}
                                onHome={goHome}
                            />
                        )}
                        {screen === "safe" && (
                            <SafeHarbour
                                scenarios={questionsFor(content, "safe-harbour", "safe-scenario")}
                                promises={questionsFor(content, "safe-harbour", "promise")}
                                onAward={award}
                                onLog={cls.logAttempt}
                                onHome={goHome}
                            />
                        )}
                        {screen === "coming" && <ComingSoon onHome={goHome} />}
                    </>
                )}
            </div>
        </div>
    );
}

export default App;
