//-----------------------------------------------------------------------
// Finn's AI Reef — Murky Depths: Real or AI?
//-----------------------------------------------------------------------

import { useState } from "react";
import { FinnRow } from "@/components/finn";
import type { Question, RealOrAiAnswer } from "@/data/reef-content.types";

interface RealOrAiProps {
    /** real-or-ai questions for the Murky Depths zone. */
    questions: Question[];
    onAward: (badgeKey: string) => void;
    onLog: (input: { questionId: string; zoneKey: string; answered: string; isCorrect: boolean }) => void;
    onHome: () => void;
}

const INTRO_SAY =
    "Some pictures and messages are real. Others are made by A I, sometimes to trick us. " +
    "Look carefully. Is this real, or A I?";

export function RealOrAi({ questions, onAward, onLog, onHome }: RealOrAiProps) {
    const [idx, setIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [answered, setAnswered] = useState<RealOrAiAnswer | null>(null);
    const [done, setDone] = useState(false);

    const round = questions[idx];

    function answer(choice: RealOrAiAnswer) {
        if (answered || !round) return;
        const correct = choice === round.answer;
        setAnswered(choice);
        if (correct) setScore((s) => s + 1);
        onLog({ questionId: round.id, zoneKey: round.zoneKey, answered: choice, isCorrect: correct });
    }

    function next() {
        if (idx + 1 >= questions.length) {
            onAward("reef-detective");
            setDone(true);
        } else {
            setIdx((i) => i + 1);
            setAnswered(null);
        }
    }

    function replay() {
        setIdx(0);
        setScore(0);
        setAnswered(null);
        setDone(false);
    }

    if (done) {
        return (
            <section className="reef-screen" aria-labelledby="reef-real-title">
                <div className="reef-zonehdr" id="reef-real-title">🌑 Murky Depths — Real or AI?</div>
                <div className="reef-panel">
                    <div className="reef-win">
                        <div className="medal" aria-hidden="true">🌑🏅</div>
                        <h2>Reef Detective!</h2>
                        <p className="reef-progress">
                            You scored <b>{score} out of {questions.length}</b>! 🌟
                        </p>
                        <div className="reef-lesson">
                            Great detective work! 🕵️ Remember Finn's tip: if a message asks for your{" "}
                            <b>name, address or password</b>, or a picture looks a bit <b>strange</b> — check
                            with a grown-up.
                        </div>
                        <div className="reef-center">
                            <button type="button" className="reef-btn blue" onClick={replay}>🔁 Play again</button>
                            <button type="button" className="reef-btn" onClick={onHome}>🏠 Reef Map</button>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (!round) return null;

    const correct = answered === round.answer;

    return (
        <section className="reef-screen" aria-labelledby="reef-real-title">
            <div className="reef-zonehdr" id="reef-real-title">🌑 Murky Depths — Real or AI?</div>
            <div className="reef-panel">
                <FinnRow small say={INTRO_SAY}>
                    Some pictures and messages are <b>real</b>. Others are made by <b>AI</b> — sometimes
                    to trick us. Look carefully: is this real, or AI?
                </FinnRow>

                <div className="reef-progress" aria-live="polite">
                    Question {idx + 1} of {questions.length} &nbsp;•&nbsp; Score: {score}
                </div>

                <div className="reef-rcard">
                    <div className="rbig" aria-hidden="true">{round.emoji}</div>
                    <div className="rcap">{round.prompt}</div>
                </div>

                <div className="reef-choices">
                    <button
                        type="button"
                        className="reef-choice real"
                        disabled={answered !== null}
                        onClick={() => answer("real")}
                    >
                        📷 Real photo
                    </button>
                    <button
                        type="button"
                        className="reef-choice ai"
                        disabled={answered !== null}
                        onClick={() => answer("ai")}
                    >
                        🤖 Made by AI
                    </button>
                </div>

                {answered && (
                    <div className={`reef-feedback ${correct ? "right" : "wrong"}`} role="status" aria-live="polite">
                        <b>{correct ? "✅ Well spotted!" : "❌ Good try!"}</b>{" "}
                        {round.answer === "ai" ? "This was " : "This was a "}
                        <b>{round.answer === "ai" ? "made by AI" : "real photo"}</b>. 🐠 Finn's tip: {round.finnTip}
                    </div>
                )}

                {answered && (
                    <div className="reef-center">
                        <button type="button" className="reef-btn go" onClick={next}>
                            {idx + 1 >= questions.length ? "See my badge ▶" : "Next ▶"}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
