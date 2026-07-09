//-----------------------------------------------------------------------
// Finn's AI Reef — Safe Harbour: Be safe + make your promise
//   Part 1: safe-scenario (two choices, safe one wins)
//   Part 2: promise (tap-to-add from a fixed list — no free text)
//-----------------------------------------------------------------------

import { useMemo, useState } from "react";
import { FinnRow } from "@/components/finn";
import type { Question } from "@/data/reef-content.types";

type Part = "scenario" | "promise" | "done";
type OptKey = "A" | "B";

interface SafeHarbourProps {
    scenarios: Question[];
    promises: Question[];
    onAward: (badgeKey: string) => void;
    onLog: (input: { questionId: string; zoneKey: string; answered: string; isCorrect: boolean }) => void;
    onHome: () => void;
}

const SCENARIO_SAY =
    "Let's practise staying safe. Read what happens, then tap the safe choice.";
const PROMISE_SAY =
    "Now build your very own A I Promise. Tap each promise you want to keep!";

/** Stable per-question shuffle of the two option keys. */
function shuffledKeys(seed: number): OptKey[] {
    return seed % 2 === 0 ? ["A", "B"] : ["B", "A"];
}

export function SafeHarbour({ scenarios, promises, onAward, onLog, onHome }: SafeHarbourProps) {
    const [part, setPart] = useState<Part>("scenario");

    // Part 1 state
    const [idx, setIdx] = useState(0);
    const [answered, setAnswered] = useState<OptKey | null>(null);

    // Part 2 state
    const [chosen, setChosen] = useState<Set<string>>(new Set());

    const round = scenarios[idx];
    const order = useMemo(() => shuffledKeys(idx), [idx]);

    function answer(choice: OptKey) {
        if (answered || !round) return;
        const correct = choice === round.answer;
        setAnswered(choice);
        onLog({ questionId: round.id, zoneKey: round.zoneKey, answered: choice, isCorrect: correct });
    }

    function nextScenario() {
        if (idx + 1 >= scenarios.length) {
            setPart("promise");
        } else {
            setIdx((i) => i + 1);
            setAnswered(null);
        }
    }

    function togglePromise(id: string) {
        setChosen((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function finishPromise() {
        onAward("safe-harbour-captain");
        setPart("done");
    }

    function replay() {
        setIdx(0);
        setAnswered(null);
        setChosen(new Set());
        setPart("scenario");
    }

    const chosenPromises = promises.filter((p) => chosen.has(p.id));

    return (
        <section className="reef-screen" aria-labelledby="reef-safe-title">
            <div className="reef-zonehdr" id="reef-safe-title">⚓ Safe Harbour</div>
            <div className="reef-panel">
                {part === "scenario" && round && (
                    <>
                        <FinnRow small say={SCENARIO_SAY}>
                            Let's practise staying safe. Read what happens, then tap the <b>safe</b> choice.
                        </FinnRow>

                        <div className="reef-progress" aria-live="polite">
                            Situation {idx + 1} of {scenarios.length}
                        </div>

                        <div className="reef-rcard">
                            <div className="rbig" aria-hidden="true">{round.emoji}</div>
                            <div className="rcap">{round.prompt}</div>
                        </div>

                        <div className="reef-choices">
                            {order.map((key) => {
                                const text = key === "A" ? round.optionA : round.optionB;
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        className="reef-choice real"
                                        disabled={answered !== null}
                                        onClick={() => answer(key)}
                                    >
                                        {text}
                                    </button>
                                );
                            })}
                        </div>

                        {answered && (
                            <div
                                className={`reef-feedback ${answered === round.answer ? "right" : "wrong"}`}
                                role="status"
                                aria-live="polite"
                            >
                                <b>{answered === round.answer ? "✅ Safe choice!" : "❌ Careful!"}</b>{" "}
                                The safe thing to do is{" "}
                                <b>{round.answer === "A" ? round.optionA : round.optionB}</b>. 🐠 {round.finnTip}
                            </div>
                        )}

                        {answered && (
                            <div className="reef-center">
                                <button type="button" className="reef-btn go" onClick={nextScenario}>
                                    {idx + 1 >= scenarios.length ? "Make my promise ▶" : "Next ▶"}
                                </button>
                            </div>
                        )}
                    </>
                )}

                {part === "promise" && (
                    <>
                        <FinnRow small say={PROMISE_SAY}>
                            Now build your very own <b>AI Promise</b>. Tap each promise you want to keep!
                        </FinnRow>

                        <div className="reef-cards">
                            {promises.map((p) => {
                                const picked = chosen.has(p.id);
                                return (
                                    <button
                                        key={p.id}
                                        type="button"
                                        className={`reef-item reef-promise${picked ? " taught" : ""}`}
                                        onClick={() => togglePromise(p.id)}
                                        aria-label={`${picked ? "Chosen" : "Add"}: ${p.prompt}`}
                                    >
                                        <div className="big" aria-hidden="true">{p.emoji}</div>
                                        <div className="cap">{p.prompt}</div>
                                        <div className="reef-promise-pick">{picked ? "✓ Added" : "➕ Add"}</div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="reef-center">
                            <button
                                type="button"
                                className="reef-btn go"
                                disabled={chosen.size === 0}
                                onClick={finishPromise}
                            >
                                See my AI Promise ▶
                            </button>
                        </div>
                    </>
                )}

                {part === "done" && (
                    <div className="reef-win">
                        <div className="medal" aria-hidden="true">⚓🏅</div>
                        <h2>Safe Harbour Captain!</h2>
                        <div className="reef-lesson reef-promise-scroll">
                            <b>📜 My AI Promise</b>
                            <ul>
                                {chosenPromises.map((p) => (
                                    <li key={p.id}>{p.emoji} {p.prompt}</li>
                                ))}
                            </ul>
                        </div>
                        <p className="reef-progress">
                            Well done, Captain! Keep your promise to stay safe and kind with AI. 🌟
                        </p>
                        <div className="reef-center">
                            <button type="button" className="reef-btn blue" onClick={replay}>🔁 Play again</button>
                            <button type="button" className="reef-btn" onClick={onHome}>🏠 Reef Map</button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
