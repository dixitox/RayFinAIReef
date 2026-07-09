//-----------------------------------------------------------------------
// Finn's AI Reef — content types
//
// These mirror the fixed backend data model (Zone, Question, Badge). The
// frontend reads content through this shape whether it comes from the
// Rayfin data client (client.data.*) or the bundled local seed.
//-----------------------------------------------------------------------

/** A reef zone (topic) shown on the Reef Map. */
export interface Zone {
    id: string;
    key: string;
    name: string;
    emoji: string;
    description: string;
    sortOrder: number;
    isPlayable: boolean;
}

/** Which mini-game a Question belongs to. */
export type GameType =
    | "teach-finn"
    | "real-or-ai"
    | "sort-ai"
    | "ai-good"
    | "safe-scenario"
    | "promise";

/** Phase of the Teach Finn game a teach-finn Question belongs to. */
export type TeachPhase = "train" | "test" | "fix";

/** Real-or-AI answer key. */
export type RealOrAiAnswer = "real" | "ai";

/**
 * A single unit of game content. Fields are optional because they apply to
 * different game types (mirrors the backend Question entity — do not change
 * field names).
 */
export interface Question {
    id: string;
    zoneKey: string;
    gameType: GameType;
    emoji: string;
    prompt: string;
    sortOrder: number;
    /**
     * The correct answer. real-or-ai: "real"|"ai"; sort-ai: "ai"|"ordinary";
     * safe-scenario: "A"|"B" (the safe option).
     */
    answer?: string;
    /** real-or-ai + teach-finn + sort-ai + safe-scenario: Finn's explanation. */
    finnTip?: string;
    /** teach-finn: the attribute Finn "learns" (e.g. colour "red"/"green"). */
    attribute?: string;
    /** teach-finn: ground-truth — is this really an apple? */
    isApple?: boolean;
    /** teach-finn: which phase this item is used in. */
    teachPhase?: TeachPhase;
    /** Human label for a teach-finn item (e.g. "red apple"). */
    label?: string;
    /** safe-scenario: the two choices offered to the child. */
    optionA?: string;
    optionB?: string;
    keyStage?: string;
}

/** An earnable badge, tied to a zone. */
export interface Badge {
    id: string;
    key: string;
    name: string;
    icon: string;
    description: string;
    zoneKey: string;
}

export interface ReefContent {
    zones: Zone[];
    questions: Question[];
    badges: Badge[];
}
