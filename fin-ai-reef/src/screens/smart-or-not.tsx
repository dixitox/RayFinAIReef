//-----------------------------------------------------------------------
// Finn's AI Reef — Splash Zone: Smart or not? (sort-ai)
//-----------------------------------------------------------------------

import { useState } from "react";
import { FinnRow } from "@/components/finn";
import type { Question } from "@/data/reef-content.types";

type Choice = "ai" | "ordinary";

interface SmartOrNotProps {
    /** sort-ai questions for the Splash Zone. */
    questions: Question[];
    onAward: (badgeKey: string) => void;
    onLog: (input: { questionId: string; zoneKey: string; answered: string; isCorrect: boolean }) => void;
    onHome: () => void;
}

const INTRO_SAY =
    "Some machines are smart A I — they learn and decide. Others are ordinary things that just do " +
    "one fixed job. Which is this?";

export function SmartOrNot({ questions, onAward, onLog, onHome }: SmartOrNotProps) {
    const [idx, setIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [answered, setAnswered] = useState<Choice | null>(null);
    const [done, setDone] = useState(false);

    const round = questions[idx];

    function answer(choice: Choice) {
        if (answered || !round) return;
        const correct = choice === round.answer;
        setAnswered(choice);
        if (correct) setScore((s) => s + 1);
        onLog({ questionId: round.id, zoneKey: round.zoneKey, answered: choice, isCorrect: correct });
    }

    function next() {
        if (idx + 1 >= questions.length) {
            onAward("splash-zone-explorer");
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
            <section className="reef-screen" aria-labelledby="reef-splash-title">
                <div className="reef-zonehdr" id="reef-splash-title">🌊 Splash Zone — Smart or not?</div>
                <div className="reef-panel">
                    <div className="reef-win">
                        <div className="medal" aria-hidden="true">🌊🏅</div>
                        <h2>Splash Zone Explorer!</h2>
                        <p className="reef-progress">
                            You scored <b>{score} out of {questions.length}</b>! 🌟
                        </p>
                        <div className="reef-lesson">
                            🐠 Finn's tip: <b>AI learns and decides</b> (like a speaker that answers you).
                            An <b>ordinary machine</b> just does one fixed job (like a torch that turns on).
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
        <section className="reef-screen" aria-labelledby="reef-splash-title">
            <div className="reef-zonehdr" id="reef-splash-title">🌊 Splash Zone — Smart or not?</div>
            <div className="reef-panel">
                <FinnRow small say={INTRO_SAY}>
                    Some machines are <b>smart AI</b> — they learn and decide. Others are
                    <b> ordinary</b> things that just do one fixed job. Which is this?
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
                        className="reef-choice ai"
                        disabled={answered !== null}
                        onClick={() => answer("ai")}
                    >
                        🤖 Smart AI
                    </button>
                    <button
                        type="button"
                        className="reef-choice real"
                        disabled={answered !== null}
                        onClick={() => answer("ordinary")}
                    >
                        🔧 Just an ordinary thing
                    </button>
                </div>

                {answered && (
                    <div className={`reef-feedback ${correct ? "right" : "wrong"}`} role="status" aria-live="polite">
                        <b>{correct ? "✅ Well spotted!" : "❌ Good try!"}</b>{" "}
                        This one is <b>{round.answer === "ai" ? "smart AI" : "just an ordinary thing"}</b>.
                        🐠 Finn's tip: {round.finnTip}
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
