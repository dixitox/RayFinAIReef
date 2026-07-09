//-----------------------------------------------------------------------
// Finn's AI Reef — Rayfin data model
//
// Entities: Zone, Question, Badge, Classroom, PupilSession, AttemptEvent.
// Deployed by the Rayfin CLI (`npx rayfin up`). The frontend reads content
// from these tables when an educator is signed in, and falls back to the
// bundled seed for local play (see src/lib/reef-content.ts).
//
// SAFEGUARDING (encoded here, do not weaken):
//  - Only educators authenticate (Fabric SSO). Children never sign in.
//  - Content (Zone/Question/Badge) is readable by any authenticated user.
//    In this MVP every authenticated user is treated as an educator; a
//    dedicated teacher/admin role split can be layered on later.
//  - Owner-scoped entities (Classroom/PupilSession/AttemptEvent) use a
//    row-level `check` so an educator can only touch their OWN records.
//  - No child PII: pupils are pseudonymous (emoji avatar + auto nickname).
//    AttemptEvent stores only what happened, never who.
//-----------------------------------------------------------------------

import {
    entity,
    role,
    authenticated,
    uuid,
    text,
    int,
    boolean,
    set,
    date,
    one,
} from "@microsoft/rayfin-core";

/** A reef zone (topic) shown on the Reef Map. Read-only content. */
@entity()
@authenticated("*")
export class Zone {
    @uuid()
    id!: string;

    @text({ unique: true, max: 255 })
    key!: string;

    @text()
    name!: string;

    @text()
    emoji!: string;

    @text()
    description!: string;

    @int()
    sortOrder!: number;

    @boolean()
    isPlayable!: boolean;
}

/** Game content — Real-or-AI rounds + Teach-Finn items + Finn's tips. */
@entity()
@authenticated("*")
export class Question {
    @uuid()
    id!: string;

    @one(() => Zone)
    zone!: Zone;

    @set("teach-finn", "real-or-ai", "sort-ai", "ai-good", "safe-scenario", "promise")
    gameType!: "teach-finn" | "real-or-ai" | "sort-ai" | "ai-good" | "safe-scenario" | "promise";

    @text()
    emoji!: string;

    @text()
    prompt!: string;

    @int()
    sortOrder!: number;

    /** real-or-ai: "real"|"ai"; sort-ai: "ai"|"ordinary"; safe-scenario: "A"|"B". */
    @text({ optional: true })
    answer?: string;

    /** Finn's explanation shown after answering. */
    @text({ optional: true })
    finnTip?: string;

    /** teach-finn: the attribute Finn "learns" (e.g. colour). */
    @text({ optional: true })
    attribute?: string;

    /** teach-finn: ground truth — is this really an apple? */
    @boolean({ optional: true })
    isApple?: boolean;

    /** teach-finn: which phase this item is used in. */
    @set({ enum: ["train", "test", "fix"], optional: true })
    teachPhase?: "train" | "test" | "fix";

    /** Human label for a teach-finn item (e.g. "red apple"). */
    @text({ optional: true })
    label?: string;

    /** safe-scenario: the two choices offered to the child. */
    @text({ optional: true, max: 200 })
    optionA?: string;

    @text({ optional: true, max: 200 })
    optionB?: string;

    @text({ optional: true })
    keyStage?: string;
}

/** An earnable badge, tied to a zone. Read-only content. */
@entity()
@authenticated("*")
export class Badge {
    @uuid()
    id!: string;

    @text()
    name!: string;

    @text()
    icon!: string;

    @text()
    description!: string;

    @one(() => Zone)
    zone!: Zone;
}

/** A class + join code. No child data. Owner-only. */
@entity()
@role("authenticated", "*", {
    policy: (claims, item) => claims.sub.eq(item.teacherId),
})
export class Classroom {
    @uuid()
    id!: string;

    @text()
    name!: string;

    @text({ unique: true, max: 255 })
    joinCode!: string;

    /** The signed-in educator who owns this class (Entra subject id). */
    @text()
    teacherId!: string;

    @date({ optional: true })
    createdAt?: Date;
}

/** A pseudonymous pupil (emoji avatar + auto nickname). Owner-only. No PII. */
@entity()
@role("authenticated", "*", {
    policy: (claims, item) => claims.sub.eq(item.teacherId),
})
export class PupilSession {
    @uuid()
    id!: string;

    @one(() => Classroom)
    classroom!: Classroom;

    @text()
    teacherId!: string;

    /** Emoji avatar — never a real name. */
    @text()
    avatar!: string;

    /** Auto-generated nickname, e.g. "Blue-Turtle-7". */
    @text()
    nickname!: string;

    @date({ optional: true })
    createdAt?: Date;
}

/** Anonymous answer event → analytics. Owner-only, create + read. No PII. */
@entity()
@role("authenticated", ["create", "read"], {
    policy: (claims, item) => claims.sub.eq(item.teacherId),
})
export class AttemptEvent {
    @uuid()
    id!: string;

    @one(() => PupilSession)
    pupilSession!: PupilSession;

    @one(() => Question)
    question!: Question;

    @text()
    teacherId!: string;

    @text()
    zoneKey!: string;

    /** The choice the pupil made (e.g. "real" / "ai" / "apple"). */
    @text()
    answered!: string;

    @boolean()
    isCorrect!: boolean;

    @date()
    answeredAt!: Date;
}
