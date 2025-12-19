import type { GenericMutationCtx } from "convex/server";
import type { DataModel, Doc, Id } from "../_generated/dataModel";

type MutationCtx = GenericMutationCtx<DataModel>;

export type ReaderType = "guest" | "registered";

export type ReaderInput = {
    type?: ReaderType;
    userId?: Id<"users">;
    visitorKey?: string;
};

export type SessionContextInput = {
    referrer?: string | null;
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
    deviceType?: string | null;
};

export type EnsureSessionOptions = {
    articleId: Id<"articles">;
    sessionToken: string;
    reader?: ReaderInput;
    context?: SessionContextInput;
    eventTimestamp: string;
    progressPercent?: number;
    durationSeconds?: number;
    createIfMissing?: boolean;
};

export type EnsureSessionResult = {
    sessionId: Id<"reading_sessions">;
    created: boolean;
    readerType: ReaderType;
    userId?: Id<"users">;
    visitorKey?: string;
    previous: Doc<"reading_sessions"> | null;
};

export type MetadataInput = Record<string, unknown> | string | undefined;

type SessionInsert = Omit<Doc<"reading_sessions">, "_id" | "_creationTime">;

const defaultClamp = (value: number) => Math.min(100, Math.max(0, value));

export const clampProgress = (value: number) => defaultClamp(value);

export const normalizeReader = (reader?: ReaderInput) => {
    if (reader?.type === "registered" && reader.userId) {
        return {
            readerType: "registered" as const,
            userId: reader.userId,
            visitorKey: reader.visitorKey ?? undefined,
        };
    }

    return {
        readerType: "guest" as const,
        userId: undefined,
        visitorKey: reader?.visitorKey ?? undefined,
    };
};

export const serializeMetadata = (metadata?: MetadataInput) => {
    if (!metadata) {
        return undefined;
    }

    if (typeof metadata === "string") {
        return metadata;
    }

    try {
        if (Object.keys(metadata).length === 0) {
            return undefined;
        }

        return JSON.stringify(metadata);
    } catch {
        return undefined;
    }
};

export const getSessionByToken = async (ctx: MutationCtx, sessionToken: string) => {
    return await ctx.db
        .query("reading_sessions")
        .withIndex("by_sessionToken", (q) => q.eq("sessionToken", sessionToken))
        .first();
};

export const ensureSession = async (
    ctx: MutationCtx,
    options: EnsureSessionOptions
): Promise<EnsureSessionResult | null> => {
    const {
        articleId,
        sessionToken,
        reader,
        context,
        eventTimestamp,
        progressPercent,
        durationSeconds,
        createIfMissing,
    } = options;

    const normalized = normalizeReader(reader);
    const existing = await getSessionByToken(ctx, sessionToken);

    if (existing) {
        const updates: Partial<Doc<"reading_sessions">> = {
            lastEventAt: eventTimestamp,
        };

        if (existing.readerType !== normalized.readerType) {
            updates.readerType = normalized.readerType;
        }

        if (normalized.userId && existing.userId !== normalized.userId) {
            updates.userId = normalized.userId;
        }

        if (normalized.visitorKey && existing.visitorKey !== normalized.visitorKey) {
            updates.visitorKey = normalized.visitorKey;
        }

        if (typeof progressPercent === "number") {
            const progress = clampProgress(progressPercent);
            if ((existing.progressPercent ?? 0) < progress) {
                updates.progressPercent = progress;
            }
        }

        if (typeof durationSeconds === "number") {
            const duration = Math.max(durationSeconds, 0);
            if ((existing.durationSeconds ?? 0) < duration) {
                updates.durationSeconds = duration;
            }
        }

        if (context) {
            if (context.referrer && !existing.referrer) {
                updates.referrer = context.referrer;
            }
            if (context.utmSource && !existing.utmSource) {
                updates.utmSource = context.utmSource;
            }
            if (context.utmMedium && !existing.utmMedium) {
                updates.utmMedium = context.utmMedium;
            }
            if (context.utmCampaign && !existing.utmCampaign) {
                updates.utmCampaign = context.utmCampaign;
            }
            if (context.deviceType && !existing.deviceType) {
                updates.deviceType = context.deviceType;
            }
        }

        if (Object.keys(updates).length > 0) {
            await ctx.db.patch(existing._id, updates);
        }

        return {
            sessionId: existing._id,
            created: false,
            readerType: normalized.readerType,
            userId: normalized.userId,
            visitorKey: normalized.visitorKey,
            previous: existing,
        };
    }

    if (createIfMissing === false) {
        return null;
    }

    const progress =
        typeof progressPercent === "number" ? clampProgress(progressPercent) : undefined;
    const duration =
        typeof durationSeconds === "number" ? Math.max(durationSeconds, 0) : undefined;

    const sessionDoc: SessionInsert = {
        articleId,
        sessionToken,
        readerType: normalized.readerType,
        startedAt: eventTimestamp,
        lastEventAt: eventTimestamp,
    };

    if (normalized.userId) {
        sessionDoc.userId = normalized.userId;
    }

    if (normalized.visitorKey) {
        sessionDoc.visitorKey = normalized.visitorKey;
    }

    if (progress !== undefined) {
        sessionDoc.progressPercent = progress;
    }

    if (duration !== undefined) {
        sessionDoc.durationSeconds = duration;
    }

    if (context?.referrer) {
        sessionDoc.referrer = context.referrer;
    }

    if (context?.utmSource) {
        sessionDoc.utmSource = context.utmSource;
    }

    if (context?.utmMedium) {
        sessionDoc.utmMedium = context.utmMedium;
    }

    if (context?.utmCampaign) {
        sessionDoc.utmCampaign = context.utmCampaign;
    }

    if (context?.deviceType) {
        sessionDoc.deviceType = context.deviceType;
    }

    const sessionId = await ctx.db.insert("reading_sessions", sessionDoc);

    return {
        sessionId,
        created: true,
        readerType: normalized.readerType,
        userId: normalized.userId,
        visitorKey: normalized.visitorKey,
        previous: null,
    };
};

export const logArticleEvent = async (
    ctx: MutationCtx,
    params: {
        articleId: Id<"articles">;
        sessionId?: Id<"reading_sessions">;
        eventType:
            | "article_view"
            | "reading_session_started"
            | "reading_session_heartbeat"
            | "reading_session_completed"
            | "share"
            | "custom";
        eventTimestamp: string;
        readerType: ReaderType;
        userId?: Id<"users">;
        visitorKey?: string;
        metadata?: MetadataInput;
    }
) => {
    await ctx.db.insert("article_events", {
        articleId: params.articleId,
        sessionId: params.sessionId,
        eventType: params.eventType,
        eventTimestamp: params.eventTimestamp,
        readerType: params.readerType,
        userId: params.userId,
        visitorKey: params.visitorKey,
        metadata: serializeMetadata(params.metadata),
    });
};

export const logShareEvent = async (
    ctx: MutationCtx,
    params: {
        articleId: Id<"articles">;
        sessionId?: Id<"reading_sessions">;
        eventTimestamp: string;
        channel: string;
        readerType: ReaderType;
        userId?: Id<"users">;
        visitorKey?: string;
        context?: string;
        metadata?: MetadataInput;
    }
) => {
    await ctx.db.insert("share_events", {
        articleId: params.articleId,
        sessionId: params.sessionId,
        eventTimestamp: params.eventTimestamp,
        channel: params.channel,
        readerType: params.readerType,
        userId: params.userId,
        visitorKey: params.visitorKey,
        context: params.context,
        metadata: serializeMetadata(params.metadata),
    });
};



