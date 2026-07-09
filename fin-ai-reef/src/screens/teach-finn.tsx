//-----------------------------------------------------------------------
// Finn's AI Reef — Training Cove: Teach Finn (learning + bias)
//-----------------------------------------------------------------------

import { useMemo, useState } from "react";
import { FinnRow } from "@/components/finn";
import type { Question } from "@/data/reef-content.types";

type Step = "teach" | "test" | "fix" | "done";

interface TeachFinnProps {
    /** teach-finn questions for the Training Cove zone. */
    questions: Question[];
    onAward: (badgeKey: string) => void;
    onLog: (input: { questionId: string; zoneKey: string; answered: string; isCorrect: boolean }) => void;
    onHome: () => void;
}

interface Prediction {
    item: Question;
    guessApple: boolean;
    correct: boolean;
}

const TEACH_SAY =
    "A I learns from examples. These are all apples. Tap each one to show me what an apple looks like.";

export function TeachFinn({ questions, onAward, onLog, onHome }: TeachFinnProps) {
    const trainItems = useMemo(() => questions.filter((q) => q.teachPhase === "train"), [questions]);
    const testItems = useMemo(() => questions.filter((q) => q.teachPhase === "test"), [questions]);
    const fixItem = useMemo(() => questions.find((q) => q.teachPhase === "fix"), [questions]);

    const [step, setStep] = useState<Step>("teach");
    const [learned, setLearned] = useState<Set<string>>(new Set());
    const [shown, setShown] = useState<Set<string>>(new Set());
    const [tested, setTested] = useState(false);
    const [fixTaught, setFixTaught] = useState(false);
    const [retested, setRetested] = useState(false);

    function predict(items: Question[]): Prediction[] {
        return items.map((item) => {
            const guessApple = item.attribute ? learned.has(item.attribute) : false;
            const correct = guessApple === Boolean(item.isApple);
            return { item, guessApple, correct };
        });
    }

    function showFinn(item: Question) {
        if (shown.has(item.id)) return;
        setShown((s) => new Set(s).add(item.id));
        if (item.attribute) setLearned((l) => new Set(l).add(item.attribute!));
    }

    function runTest() {
        setTested(true);
        predict(testItems).forEach((p) =>
            onLog({ questionId: p.item.id, zoneKey: p.item.zoneKey, answered: p.guessApple ? "apple" : "not-apple", isCorrect: p.correct }),
        );
    }

    function teachFix() {
        if (!fixItem || fixTaught) return;
        setFixTaught(true);
        if (fixItem.attribute) setLearned((l) => new Set(l).add(fixItem.attribute!));
    }

    function runRetest() {
        setRetested(true);
        predict(testItems).forEach((p) =>
            onLog({ questionId: p.item.id, zoneKey: p.item.zoneKey, answered: p.guessApple ? "apple" : "not-apple", isCorrect: p.correct }),
        );
    }

    function finish() {
        onAward("training-cove-champion");
        setStep("done");
    }

    function replay() {
        setLearned(new Set());
        setShown(new Set());
        setTested(false);
        setFixTaught(false);
        setRetested(false);
        setStep("teach");
    }

    const allShown = trainItems.length > 0 && trainItems.every((t) => shown.has(t.id));

    return (
        <section className="reef-screen" aria-labelledby="reef-teach-title">
            <div className="reef-zonehdr" id="reef-teach-title">🐚 Training Cove — Teach Finn</div>
            <div className="reef-panel">
                {step === "teach" && (
                    <>
                        <FinnRow small say={TEACH_SAY}>
                            AI learns from <b>examples</b>. These are all apples — tap each one to{" "}
                            <b>show me</b> what an apple looks like!
                        </FinnRow>
                        <div className="reef-cards">
                            {trainItems.map((item) => {
                                const taught = shown.has(item.id);
                                return (
                                    <div key={item.id} className={`reef-item${taught ? " taught" : ""}`}>
                                        <div className="big" aria-hidden="true">{item.emoji}</div>
                                        <div className="cap">{item.label ?? item.prompt}</div>
                                        <button
                                            type="button"
                                            className="tap"
                                            disabled={taught}
                                            onClick={() => showFinn(item)}
                                            aria-label={taught ? "Learned" : `Show Finn this ${item.label ?? "apple"}`}
                                        >
                                            {taught ? "✓ Learned!" : "👀 Show Finn"}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="reef-progress" aria-live="polite">
                            Shown Finn: {shown.size} of {trainItems.length}
                        </div>
                        <div className="reef-center">
                            <button type="button" className="reef-btn go" disabled={!allShown} onClick={() => setStep("test")}>
                                Test Finn ▶
                            </button>
                        </div>
                    </>
                )}

                {step === "test" && (
                    <>
                        <FinnRow small say="Now let's see what Finn learned. Tap the button!">
                            Now let's see what Finn learned. Tap <b>🔮 Ask Finn!</b>
                        </FinnRow>
                        {!tested ? (
                            <div className="reef-center">
                                <button type="button" className="reef-btn blue" onClick={runTest}>🔮 Ask Finn!</button>
                            </div>
                        ) : (
                            <>
                                <div className="reef-cards">
                                    {predict(testItems).map((p) => (
                                        <div key={p.item.id} className="reef-item">
                                            <div className="big" aria-hidden="true">{p.item.emoji}</div>
                                            <div className="cap">{p.item.label ?? p.item.prompt}</div>
                                            <div className={`verdict ${p.correct ? "reef-v-ok" : "reef-v-no"}`}>
                                                Finn: {p.guessApple ? "Apple! 🍎" : "Not an apple 🚫"} {p.correct ? "✅" : "❌"}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="reef-lesson">
                                    🐠 <b>Uh oh!</b> Finn only ever saw <b>red</b> apples, so he thinks{" "}
                                    <b>"apple = red"</b>. He called the <b>green apple</b> "not an apple", and was
                                    fooled by the <b>red tomato</b>! When AI learns from only one kind of example,
                                    it makes unfair mistakes. This is called <b>bias</b>.
                                </div>
                                <div className="reef-center">
                                    <button type="button" className="reef-btn go" onClick={() => setStep("fix")}>
                                        Help Finn learn better ▶
                                    </button>
                                </div>
                            </>
                        )}
                    </>
                )}

                {step === "fix" && (
                    <>
                        <FinnRow small say="Let's give Finn a green apple example too, so his examples are fairer. Tap the green apple!">
                            Let's give Finn a <b>green</b> apple example too, so his examples are fairer.
                            Tap the green apple!
                        </FinnRow>
                        <div className="reef-cards">
                            {fixItem && (
                                <div className={`reef-item${fixTaught ? " taught" : ""}`}>
                                    <div className="big" aria-hidden="true">{fixItem.emoji}</div>
                                    <div className="cap">{fixItem.label ?? fixItem.prompt}</div>
                                    <button
                                        type="button"
                                        className="tap"
                                        disabled={fixTaught}
                                        onClick={teachFix}
                                        aria-label={fixTaught ? "Learned" : "Show Finn the green apple"}
                                    >
                                        {fixTaught ? "✓ Learned!" : "👀 Show Finn"}
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="reef-center">
                            <button type="button" className="reef-btn blue" disabled={!fixTaught || retested} onClick={runRetest}>
                                🔮 Test Finn again
                            </button>
                        </div>
                        {retested && (
                            <>
                                <div className="reef-cards">
                                    {predict(testItems).map((p) => (
                                        <div key={p.item.id} className="reef-item">
                                            <div className="big" aria-hidden="true">{p.item.emoji}</div>
                                            <div className="cap">{p.item.label ?? p.item.prompt}</div>
                                            <div className={`verdict ${p.correct ? "reef-v-ok" : "reef-v-no"}`}>
                                                Finn: {p.guessApple ? "Apple! 🍎" : "Not an apple 🚫"} {p.correct ? "✅" : "❌"}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="reef-lesson">
                                    🎉 <b>Much better!</b> Now Finn knows apples can be red <b>or</b> green.
                                    The tomato still tricks him a little — real AI keeps learning too. The{" "}
                                    <b>fairer and more varied</b> our examples, the smarter and fairer AI becomes.
                                </div>
                                <div className="reef-center">
                                    <button type="button" className="reef-btn go" onClick={finish}>Finish ▶</button>
                                </div>
                            </>
                        )}
                    </>
                )}

                {step === "done" && (
                    <div className="reef-win">
                        <div className="medal" aria-hidden="true">🐚🏅</div>
                        <h2>Training Cove Champion!</h2>
                        <p className="reef-progress">
                            You taught Finn how AI learns — and why <b>fair, varied examples</b> matter.
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
