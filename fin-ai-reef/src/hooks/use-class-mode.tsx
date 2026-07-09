//-----------------------------------------------------------------------
// Finn's AI Reef — Class Mode (Phase 2)
//
// Optional educator layer. Children NEVER sign in and NEVER type a name.
// Only educators authenticate via Fabric SSO; pupils are pseudonymous
// (emoji avatar + auto nickname). When class mode is off (the default,
// including all local play), no analytics are written.
//-----------------------------------------------------------------------

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import type { OpaqueSession } from "@microsoft/rayfin-auth";
import {
    ensureSignedInWithFabric,
    type FabricAuthOptions,
} from "@microsoft/rayfin-auth-provider-fabric";
import { getRayfinClient } from "@/lib/rayfin-client";
import {
    createPupilSession,
    recordAttempt,
    type PupilSessionRef,
} from "@/lib/reef-content";

interface ClassModeValue {
    /** True when an educator is signed in (class mode active). */
    isTeacher: boolean;
    teacherId: string | null;
    classroomId: string;
    pupil: PupilSessionRef | null;
    signingIn: boolean;
    signInError: string | null;
    /** Educator sign-in via Fabric SSO. Must be called from a click handler. */
    signIn: () => Promise<void>;
    /** Start a pseudonymous pupil session with the chosen emoji avatar. */
    startPupil: (avatar: string) => Promise<void>;
    /** Log an anonymous answer event (no-op when not in class mode). */
    logAttempt: (input: {
        questionId: string;
        zoneKey: string;
        answered: string;
        isCorrect: boolean;
    }) => void;
}

const ClassModeContext = createContext<ClassModeValue | undefined>(undefined);

function buildFabricOptions(): FabricAuthOptions | null {
    const workspaceId = import.meta.env.VITE_FABRIC_WORKSPACE_ID;
    const projectId = import.meta.env.VITE_FABRIC_ITEM_ID;
    const fabricPortalUrl = import.meta.env.VITE_FABRIC_PORTAL_URL;
    if (!workspaceId || !projectId || !fabricPortalUrl) return null;
    return { workspaceId, projectId, fabricPortalUrl, returnOrigin: window.location.origin };
}

/** Best-effort extraction of the educator's stable subject id from the session. */
function readTeacherId(session: OpaqueSession | null): string {
    const anySession = session as unknown as {
        claims?: { sub?: string };
        user?: { id?: string; sub?: string };
    } | null;
    return (
        anySession?.claims?.sub ??
        anySession?.user?.sub ??
        anySession?.user?.id ??
        "teacher"
    );
}

export function ClassModeProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<OpaqueSession | null>(null);
    const [pupil, setPupil] = useState<PupilSessionRef | null>(null);
    const [signingIn, setSigningIn] = useState(false);
    const [signInError, setSignInError] = useState<string | null>(null);

    const teacherId = session?.isAuthenticated ? readTeacherId(session) : null;
    // MVP: one implicit classroom per teacher. A picker can be added later.
    const classroomId = teacherId ? `class-${teacherId}` : "class-local";

    const signIn = useCallback(async () => {
        const options = buildFabricOptions();
        if (!options) {
            setSignInError("Fabric config missing — run 'npx rayfin up' first.");
            return;
        }
        setSigningIn(true);
        setSignInError(null);
        try {
            const s = await ensureSignedInWithFabric(getRayfinClient().auth, options);
            setSession(s);
        } catch (err) {
            setSignInError(err instanceof Error ? err.message : String(err));
        } finally {
            setSigningIn(false);
        }
    }, []);

    const startPupil = useCallback(
        async (avatar: string) => {
            if (!teacherId) return;
            const ref = await createPupilSession(classroomId, teacherId, avatar);
            setPupil(ref);
        },
        [teacherId, classroomId],
    );

    const logAttempt = useCallback(
        (input: { questionId: string; zoneKey: string; answered: string; isCorrect: boolean }) => {
            if (!teacherId || !pupil) return;
            void recordAttempt({
                pupilSessionId: pupil.id,
                teacherId,
                ...input,
            });
        },
        [teacherId, pupil],
    );

    const value = useMemo<ClassModeValue>(
        () => ({
            isTeacher: Boolean(teacherId),
            teacherId,
            classroomId,
            pupil,
            signingIn,
            signInError,
            signIn,
            startPupil,
            logAttempt,
        }),
        [teacherId, classroomId, pupil, signingIn, signInError, signIn, startPupil, logAttempt],
    );

    return <ClassModeContext.Provider value={value}>{children}</ClassModeContext.Provider>;
}

export function useClassMode(): ClassModeValue {
    const ctx = useContext(ClassModeContext);
    if (!ctx) throw new Error("useClassMode must be used within a ClassModeProvider");
    return ctx;
}
