//-----------------------------------------------------------------------
// Finn's AI Reef — Reef Map (home)
//-----------------------------------------------------------------------

import { FinnRow } from "@/components/finn";
import type { Zone } from "@/data/reef-content.types";

const PLAY_LABEL: Record<string, string> = {
    "splash-zone": "Smart or not?",
    "training-cove": "Teach Finn",
    "bright-reef": "Superpowers",
    "murky-depths": "Real or AI?",
    "safe-harbour": "Be safe",
};

const HOME_SAY =
    "Hi! I'm Finn the manta ray. Let's explore what AI is, where it helps us, " +
    "and where it can get things wrong. Pick a reef zone to start!";

interface ReefMapProps {
    zones: Zone[];
    /** Map a playable zone key to the screen it opens. */
    onPlay: (zoneKey: string) => void;
    /** Open Finn's "What is AI?" story intro. */
    onStory: () => void;
}

export function ReefMap({ zones, onPlay, onStory }: ReefMapProps) {
    return (
        <section className="reef-screen" aria-labelledby="reef-home-title">
            <h1 className="reef-title" id="reef-home-title">Finn's AI Reef</h1>
            <p className="reef-subtitle">
                Dive in and learn about AI — the good bits <em>and</em> the tricky bits!
            </p>

            <FinnRow say={HOME_SAY}>
                Hi! I'm <b>Finn</b> the manta ray. 🌊 Let's explore what AI is, where it
                helps us, and where it can get things wrong. Pick a reef zone to start!
            </FinnRow>

            <button type="button" className="reef-storycta" onClick={onStory}>
                <span className="reef-storycta-emoji" aria-hidden="true">📖</span>
                <span className="reef-storycta-text">
                    <b>New here? Start with Finn's story</b>
                    <span>What is AI? — a 1-minute tale before you play</span>
                </span>
                <span className="reef-storycta-go" aria-hidden="true">▶</span>
            </button>

            <div className="reef-zones">
                {zones.map((zone) => (
                    <div
                        key={zone.id}
                        className={`reef-zone${zone.isPlayable ? " playable" : ""}`}
                    >
                        <span className={`reef-tag ${zone.isPlayable ? "go" : "wait"}`}>
                            {zone.isPlayable ? "Play now" : "Coming soon"}
                        </span>
                        <span className="emoji" aria-hidden="true">{zone.emoji}</span>
                        <h3>{zone.name}</h3>
                        <p>{zone.description}</p>
                        {zone.isPlayable ? (
                            <button
                                type="button"
                                className="play"
                                onClick={() => onPlay(zone.key)}
                                aria-label={`Play ${zone.name}`}
                            >
                                ▶ {PLAY_LABEL[zone.key] ?? "Play"}
                            </button>
                        ) : (
                            <button type="button" className="soon" disabled aria-label={`${zone.name} coming soon`}>
                                🔒 Coming soon
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <div className="reef-safefoot">
                🔒 <b>A safe app by design:</b> no names, no logins, no personal information collected.
            </div>
            <p className="reef-note">
                Fabric Apps (Rayfin) Hackathon • Finn's AI Reef
            </p>
        </section>
    );
}
