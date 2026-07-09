/**
 * Finn's AI Reef — seed loader
 * ----------------------------
 * Loads seed/reef-content.seed.json into the Fabric App backend
 * (Zone, Badge, Question tables) using the type-safe Rayfin data client.
 *
 * RUN (from the project root, after the backend schema is deployed):
 *
 *     npx tsx scripts/seed.ts
 *
 * REQUIREMENTS
 *  - The data-model backend deployed so the tables exist (`npx rayfin up`).
 *  - An account that may write content. Content entities are readable by any
 *    authenticated user and (in this MVP) writable by any authenticated user;
 *    a teacher/admin role split can be layered on later.
 *
 * Override any default below with env vars:
 *   RAYFIN_API_URL, RAYFIN_PUBLISHABLE_KEY, SEED_EMAIL, SEED_PASSWORD
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { RayfinClient } from "@microsoft/rayfin-client";

const BASE_URL = process.env.RAYFIN_API_URL ?? "http://localhost:5168";
const PUBLISHABLE_KEY = process.env.RAYFIN_PUBLISHABLE_KEY ?? "pk-your-project-key";
const SEED_EMAIL = process.env.SEED_EMAIL ?? "teacher@finns-reef.local";
const SEED_PASSWORD = process.env.SEED_PASSWORD ?? "ChangeMe!123";

// The generated typed client lives under rayfin/data/ after deploy; we use a
// loose client here so the loader runs without those generated types present.
const client = new RayfinClient({
    baseUrl: BASE_URL,
    publishableKey: PUBLISHABLE_KEY,
}) as unknown as {
    auth: { signIn: (c: { email: string; password: string }) => Promise<unknown> };
    data: {
        Zone: { create: (i: Record<string, unknown>) => Promise<unknown> };
        Badge: { create: (i: Record<string, unknown>) => Promise<unknown> };
        Question: { create: (i: Record<string, unknown>) => Promise<unknown> };
    };
};

type SeedFile = {
    zones: Array<Record<string, unknown>>;
    badges: Array<Record<string, unknown>>;
    questions: Array<Record<string, unknown>>;
};

const seed = JSON.parse(
    readFileSync(resolve(process.cwd(), "seed/reef-content.seed.json"), "utf8"),
) as SeedFile;

async function main(): Promise<void> {
    await client.auth.signIn({ email: SEED_EMAIL, password: SEED_PASSWORD });

    for (const z of seed.zones) {
        await client.data.Zone.create({
            id: z.id,
            key: z.key,
            name: z.name,
            emoji: z.emoji,
            description: z.description,
            sortOrder: z.sortOrder,
            isPlayable: z.isPlayable,
        });
        console.log(`Zone      ✔  ${z.name}`);
    }

    for (const b of seed.badges) {
        await client.data.Badge.create({
            id: b.id,
            name: b.name,
            icon: b.icon,
            description: b.description,
            zone: { id: b.zone_id },
        });
        console.log(`Badge     ✔  ${b.name}`);
    }

    for (const q of seed.questions) {
        await client.data.Question.create({
            id: q.id,
            zone: { id: q.zone_id },
            gameType: q.gameType,
            emoji: q.emoji,
            prompt: q.prompt,
            answer: q.answer,
            finnTip: q.finnTip,
            attribute: q.attribute,
            isApple: q.isApple,
            teachPhase: q.teachPhase,
            label: q.label,
            keyStage: q.keyStage,
            sortOrder: q.sortOrder,
        });
        console.log(`Question  ✔  ${q.gameType} · ${q.emoji}`);
    }

    console.log(
        `\n🐠  Seeded ${seed.zones.length} zones, ${seed.badges.length} badges, ${seed.questions.length} questions.`,
    );
}

main().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
});
