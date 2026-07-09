//-----------------------------------------------------------------------
// Finn's AI Reef — Bright Reef: Finn's AI Superpowers (ai-good)
//-----------------------------------------------------------------------

import { useMemo, useState } from "react";
import { FinnRow } from "@/components/finn";
import { canSpeak, speak } from "@/lib/speak";
import type { Question } from "@/data/reef-content.types";

interface SuperpowersProps {
    /** ai-good questions for the Bright Reef zone. */
    questions: Question[];
    onAward: (badgeKey: string) => void;
    onHome: () => void;
}

const INTRO_SAY =
    "AI has superpowers that help people. Tap a shell to discover one — I'll read it to you!";

export function Superpowers({ questions, onAward, onHome }: SuperpowersProps) {
    const [revealed, setRevealed] = useState<Set<string>>(new Set());
    const total = questions.length;
    const allRevealed = total > 0 && revealed.size === total;

    const cards = useMemo(() => questions, [questions]);

    function reveal(card: Question) {
        if (revealed.has(card.id)) {
            // Re-read on tap of an already-open card.
            if (card.finnTip) speak(card.finnTip);
            return;
        }
        const nextSet = new Set(revealed).add(card.id);
        setRevealed(nextSet);
        if (card.finnTip) speak(`${card.prompt}. ${card.finnTip}`);
        if (nextSet.size === total) onAward("bright-reef-helper");
    }

    function replay() {
        setRevealed(new Set());
    }

    return (
        <section className="reef-screen" aria-labelledby="reef-bright-title">
            <div className="reef-zonehdr" id="reef-bright-title">✨ Bright Reef — Finn's AI Superpowers</div>
            <div className="reef-panel">
                <FinnRow small say={INTRO_SAY}>
                    AI has <b>superpowers</b> that help people. Tap a shell to discover one
                    {canSpeak ? " — I'll read it to you!" : "!"}
                </FinnRow>

                <div className="reef-progress" aria-live="polite">
                    {revealed.size} of {total} discovered
                </div>

                <div className="reef-cards">
                    {cards.map((card) => {
                        const open = revealed.has(card.id);
                        return (
                            <button
                                key={card.id}
                                type="button"
                                className={`reef-item reef-power${open ? " taught" : ""}`}
                                onClick={() => reveal(card)}
                                aria-label={open ? `${card.prompt}. ${card.finnTip ?? ""}` : "Reveal a superpower"}
                            >
                                <div className="big" aria-hidden="true">{open ? card.emoji : "🐚"}</div>
                                {open ? (
                                    <>
                                        <div className="cap">{card.prompt}</div>
                                        {card.finnTip && <div className="reef-power-tip">🐠 {card.finnTip}</div>}
                                    </>
                                ) : (
                                    <div className="cap">Tap to reveal</div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {allRevealed && (
                    <div className="reef-win">
                        <div className="medal" aria-hidden="true">✨🏅</div>
                        <h2>Bright Reef Helper!</h2>
                        <p className="reef-progress">
                            You found all of Finn's AI superpowers — helping with health, seeing, languages,
                            the planet, safety and learning. 🌟
                        </p>
                        <div className="reef-center">
                            <button type="button" className="reef-btn blue" onClick={replay}>🔁 Play again</button>
                            <button type="button" className="reef-btn" onClick={onHome}>🏠 Reef Map</button>
                        </div>
                    </div>
                )}

                {!allRevealed && (
                    <div className="reef-center">
                        <button type="button" className="reef-btn" onClick={onHome}>🏠 Reef Map</button>
                    </div>
                )}
            </div>
        </section>
    );
}
