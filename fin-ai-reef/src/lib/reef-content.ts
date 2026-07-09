//-----------------------------------------------------------------------
// Finn's AI Reef — content + analytics access layer
//
// Reuses the single RayfinClient (getRayfinClient) — never creates a second
// client. Reads all game content from the backend Question/Zone/Badge tables
// when the data service is deployed, and falls back to the bundled seed so
// the app is fully playable on local dev with no backend and no login.
//
// Safeguarding: children never authenticate and never send free text. The
// only writes are pseudonymous PupilSession records and anonymous
// AttemptEvents ({ question, choice, correct?, timestamp }) — and only when
// an educator is signed in (class mode).
//-----------------------------------------------------------------------

import { getRayfinClient } from "@/lib/rayfin-client";
import { REEF_CONTENT } from "@/data/reef-content";
import type { Badge, Question, ReefContent, Zone } from "@/data/reef-content.types";

/**
 * The Rayfin data client is only present once a data-model backend has been
 * deployed (`npx rayfin up`). We access it defensively so the app keeps
 * working locally without it. The precise generated types live under
 * `rayfin/data/` after deploy; here we use a minimal structural type.
 */
interface DataCollection<T> {
    select: (fields: (keyof T)[]) => {
        orderBy?: (o: Record<string, "asc" | "desc">) => { execute: () => Promise<T[]> };
        where?: (w: unknown) => { execute: () => Promise<T[]> };
        execute: () => Promise<T[]>;
    };
    create: (input: Record<string, unknown>) => Promise<{ id?: string }>;
}

interface RayfinData {
    Zone?: DataCollection<Zone>;
    Question?: DataCollection<Question>;
    Badge?: DataCollection<Badge>;
    PupilSession?: DataCollection<Record<string, unknown>>;
    AttemptEvent?: DataCollection<Record<string, unknown>>;
}

function getData(): RayfinData | undefined {
    try {
        const client = getRayfinClient() as unknown as { data?: RayfinData };
        return client.data;
    } catch {
        return undefined;
    }
}

/** True only when the single client already holds an authenticated session. */
function isAuthenticated(): boolean {
    try {
        const client = getRayfinClient() as unknown as {
            auth?: { session?: { isAuthenticated?: boolean }; isAuthenticated?: boolean };
        };
        return Boolean(client.auth?.session?.isAuthenticated ?? client.auth?.isAuthenticated);
    } catch {
        return false;
    }
}

/** Resolve `p`, or `fallback` if it hasn't settled within `ms`. */
function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
    return new Promise((resolve) => {
        let settled = false;
        const timer = setTimeout(() => {
            if (!settled) { settled = true; resolve(fallback); }
        }, ms);
        p.then(
            (v) => { if (!settled) { settled = true; clearTimeout(timer); resolve(v); } },
            () => { if (!settled) { settled = true; clearTimeout(timer); resolve(fallback); } },
        );
    });
}

export interface LoadedContent extends ReefContent {
    /** true when content came from the deployed backend, false = bundled seed. */
    fromBackend: boolean;
}

/**
 * Load all reef content. Uses the bundled seed by default so the app is fully
 * playable on local dev with no backend and no login (Phase 1). Only queries
 * the deployed backend when an educator is already authenticated (class mode);
 * any failure or slow response falls back to the bundled seed.
 */
export async function loadReefContent(): Promise<LoadedContent> {
    const data = getData();
    if (isAuthenticated() && data?.Zone && data.Question && data.Badge) {
        const bundled: LoadedContent = { ...REEF_CONTENT, fromBackend: false };
        const fetchAll = (async (): Promise<LoadedContent> => {
            const [zones, questions, badges] = await Promise.all([
                data.Zone!.select(["id", "key", "name", "emoji", "description", "sortOrder", "isPlayable"])
                    .orderBy!({ sortOrder: "asc" })
                    .execute(),
                data.Question!.select([
                    "id", "zoneKey", "gameType", "emoji", "prompt", "sortOrder",
                    "answer", "finnTip", "attribute", "isApple", "teachPhase", "label",
                    "optionA", "optionB",
                ]).execute(),
                data.Badge!.select(["id", "key", "name", "icon", "description", "zoneKey"]).execute(),
            ]);
            return zones.length ? { zones, questions, badges, fromBackend: true } : bundled;
        })();
        return withTimeout(fetchAll, 4000, bundled);
    }
    return { ...REEF_CONTENT, fromBackend: false };
}

/** Questions for a game type in a zone, sorted. */
export function questionsFor(
    content: ReefContent,
    zoneKey: string,
    gameType: Question["gameType"],
): Question[] {
    return content.questions
        .filter((q) => q.zoneKey === zoneKey && q.gameType === gameType)
        .sort((a, b) => a.sortOrder - b.sortOrder);
}

/* ------------------------------------------------------------------ */
/* Phase 2 — pseudonymous pupils + anonymous analytics                 */
/* ------------------------------------------------------------------ */

/** Auto-generate a pseudonymous nickname — never a real name. */
const NICK_COLOURS = ["Blue", "Green", "Coral", "Teal", "Sunny", "Pearl", "Aqua", "Reef"];
const NICK_ANIMALS = ["Turtle", "Dolphin", "Ray", "Otter", "Seal", "Crab", "Fish", "Star"];
export function makeNickname(): string {
    const c = NICK_COLOURS[Math.floor(Math.random() * NICK_COLOURS.length)];
    const a = NICK_ANIMALS[Math.floor(Math.random() * NICK_ANIMALS.length)];
    const n = Math.floor(Math.random() * 90) + 10;
    return `${c}-${a}-${n}`;
}

export interface PupilSessionRef {
    id: string;
    avatar: string;
    nickname: string;
}

/**
 * Create a pseudonymous pupil session (emoji avatar + auto nickname). No real
 * name is ever collected. Best-effort: returns a local-only ref if no backend.
 */
export async function createPupilSession(
    classroomId: string,
    teacherId: string,
    avatar: string,
): Promise<PupilSessionRef> {
    const nickname = makeNickname();
    const data = getData();
    if (data?.PupilSession) {
        try {
            const created = await data.PupilSession.create({
                classroom: { id: classroomId },
                teacherId,
                avatar,
                nickname,
                createdAt: new Date(),
            });
            if (created?.id) return { id: created.id, avatar, nickname };
        } catch {
            // fall through to local-only ref
        }
    }
    return { id: `local-${nickname}`, avatar, nickname };
}

/**
 * Record an anonymous answer event. Stores only what happened — never who.
 * Best-effort and silent: gameplay must never break because logging failed.
 */
export async function recordAttempt(input: {
    pupilSessionId: string;
    questionId: string;
    teacherId: string;
    zoneKey: string;
    answered: string;
    isCorrect: boolean;
}): Promise<void> {
    const data = getData();
    if (!data?.AttemptEvent) return;
    try {
        await data.AttemptEvent.create({
            pupilSession: { id: input.pupilSessionId },
            question: { id: input.questionId },
            teacherId: input.teacherId,
            zoneKey: input.zoneKey,
            answered: input.answered,
            isCorrect: input.isCorrect,
            answeredAt: new Date(),
        });
    } catch {
        // swallow — analytics is best-effort
    }
}
