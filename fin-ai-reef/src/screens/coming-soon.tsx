//-----------------------------------------------------------------------
// Finn's AI Reef — Coming soon placeholder for zones still being built
//-----------------------------------------------------------------------

import { FinnRow } from "@/components/finn";

export function ComingSoon({ onHome }: { onHome: () => void }) {
    return (
        <section className="reef-screen" aria-labelledby="reef-soon-title">
            <div className="reef-zonehdr" id="reef-soon-title">🐠 Still being built</div>
            <div className="reef-panel">
                <FinnRow small say="This reef zone is still being built! In the full app it will have its own game. For now, try Training Cove or Murky Depths.">
                    This reef zone is still being built! 🛠️ In the full app it will have its own game.
                    For now, try <b>Training Cove</b> or <b>Murky Depths</b>.
                </FinnRow>
                <div className="reef-center">
                    <button type="button" className="reef-btn blue" onClick={onHome}>🏠 Back to the Reef Map</button>
                </div>
            </div>
        </section>
    );
}
