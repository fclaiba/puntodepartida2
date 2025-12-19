import type { Doc } from "./_generated/dataModel";
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import {
    clampProgress,
    ensureSession,
    logArticleEvent,
    logShareEvent,
    normalizeReader,
} from "./lib/tracking";
import { optionalReaderPayload, optionalSessionContextPayload } from "./lib/trackingSchemas";

export const beginReadingSession = mutation({
    args: {
        articleId: v.id("articles"),
        sessionToken: v.string(),
        reader: optionalReaderPayload,
        context: optionalSessionContextPayload,
    },
    handler: async (ctx, args) => {
        const now = new Date().toISOString();

        const sessionResult = await ensureSession(ctx, {
            articleId: args.articleId,
            sessionToken: args.sessionToken,
            reader: args.reader ?? undefined,
            context: args.context ?? undefined,
            eventTimestamp: now,
        });

        const normalized = sessionResult
            ? {
                  readerType: sessionResult.readerType,
                  userId: sessionResult.userId,
                  visitorKey: sessionResult.visitorKey,
              }
            : normalizeReader(args.reader ?? undefined);

        if (sessionResult?.created) {
            await logArticleEvent(ctx, {
                articleId: args.articleId,
                sessionId: sessionResult.sessionId,
                eventType: "reading_session_started",
                eventTimestamp: now,
                readerType: normalized.readerType,
                userId: normalized.userId,
                visitorKey: normalized.visitorKey,
                metadata: args.context ? { context: args.context } : undefined,
            });
        } else if (sessionResult) {
            await logArticleEvent(ctx, {
                articleId: args.articleId,
                sessionId: sessionResult.sessionId,
                eventType: "reading_session_heartbeat",
                eventTimestamp: now,
                readerType: normalized.readerType,
                userId: normalized.userId,
                visitorKey: normalized.visitorKey,
                metadata: { source: "beginReadingSession" },
            });
        }

        await logArticleEvent(ctx, {
            articleId: args.articleId,
            sessionId: sessionResult?.sessionId,
            eventType: "article_view",
            eventTimestamp: now,
            readerType: normalized.readerType,
            userId: normalized.userId,
            visitorKey: normalized.visitorKey,
            metadata: args.context
                ? { source: "beginReadingSession", context: args.context }
                : { source: "beginReadingSession" },
        });

        return {
            sessionId: sessionResult?.sessionId ?? null,
            created: sessionResult?.created ?? false,
            recordedAt: now,
        };
    },
});

export const recordReadingProgress = mutation({
    args: {
        articleId: v.id("articles"),
        sessionToken: v.string(),
        progressPercent: v.number(),
        elapsedSeconds: v.optional(v.number()),
        reader: optionalReaderPayload,
    },
    handler: async (ctx, args) => {
        const now = new Date().toISOString();
        const progress = clampProgress(args.progressPercent);
        const duration = args.elapsedSeconds !== undefined ? Math.max(args.elapsedSeconds, 0) : undefined;

        const sessionResult = await ensureSession(ctx, {
            articleId: args.articleId,
            sessionToken: args.sessionToken,
            reader: args.reader ?? undefined,
            eventTimestamp: now,
            progressPercent: progress,
            durationSeconds: duration,
        });

        if (!sessionResult) {
            throw new Error("Reading session not found and could not be created.");
        }

        await logArticleEvent(ctx, {
            articleId: args.articleId,
            sessionId: sessionResult.sessionId,
            eventType: "reading_session_heartbeat",
            eventTimestamp: now,
            readerType: sessionResult.readerType,
            userId: sessionResult.userId,
            visitorKey: sessionResult.visitorKey,
            metadata: {
                progressPercent: progress,
                elapsedSeconds: duration,
            },
        });

        return {
            sessionId: sessionResult.sessionId,
            recordedAt: now,
            progressPercent: progress,
        };
    },
});

export const completeReadingSession = mutation({
    args: {
        articleId: v.id("articles"),
        sessionToken: v.string(),
        reader: optionalReaderPayload,
        elapsedSeconds: v.optional(v.number()),
        progressPercent: v.optional(v.number()),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const now = new Date().toISOString();
        const progress = args.progressPercent !== undefined ? clampProgress(args.progressPercent) : 100;
        const duration = args.elapsedSeconds !== undefined ? Math.max(args.elapsedSeconds, 0) : undefined;

        const sessionResult = await ensureSession(ctx, {
            articleId: args.articleId,
            sessionToken: args.sessionToken,
            reader: args.reader ?? undefined,
            eventTimestamp: now,
            progressPercent: progress,
            durationSeconds: duration,
        });

        if (!sessionResult) {
            throw new Error("Reading session not found and could not be created.");
        }

        const previous = sessionResult.previous;
        const previousProgress = previous?.progressPercent ?? 0;
        const previousDuration = previous?.durationSeconds ?? 0;

        const updatedProgress = Math.max(previousProgress, progress);
        const updatedDuration = Math.max(previousDuration, duration ?? 0);

        const updates: Partial<Doc<"reading_sessions">> = {
            completedAt: now,
            lastEventAt: now,
        };

        if (updatedProgress > previousProgress) {
            updates.progressPercent = updatedProgress;
        }

        if (duration !== undefined && updatedDuration >= previousDuration) {
            updates.durationSeconds = updatedDuration;
        }

        await ctx.db.patch(sessionResult.sessionId, updates);

        await logArticleEvent(ctx, {
            articleId: args.articleId,
            sessionId: sessionResult.sessionId,
            eventType: "reading_session_completed",
            eventTimestamp: now,
            readerType: sessionResult.readerType,
            userId: sessionResult.userId,
            visitorKey: sessionResult.visitorKey,
            metadata: {
                progressPercent: updatedProgress,
                durationSeconds: duration ?? updatedDuration,
                reason: args.reason,
            },
        });

        return {
            sessionId: sessionResult.sessionId,
            recordedAt: now,
            completed: true,
        };
    },
});

export const recordShareEvent = mutation({
    args: {
        articleId: v.id("articles"),
        channel: v.string(),
        sessionToken: v.optional(v.string()),
        reader: optionalReaderPayload,
        context: v.optional(v.string()),
        metadataJson: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const now = new Date().toISOString();

        const sessionResult = args.sessionToken
            ? await ensureSession(ctx, {
                  articleId: args.articleId,
                  sessionToken: args.sessionToken,
                  reader: args.reader ?? undefined,
                  eventTimestamp: now,
                  createIfMissing: false,
              })
            : null;

        const normalized = sessionResult
            ? {
                  readerType: sessionResult.readerType,
                  userId: sessionResult.userId,
                  visitorKey: sessionResult.visitorKey,
              }
            : normalizeReader(args.reader ?? undefined);

        const metadata: Record<string, unknown> = {
            channel: args.channel,
        };

        if (args.context) {
            metadata.context = args.context;
        }

        if (args.metadataJson) {
            try {
                metadata.extra = JSON.parse(args.metadataJson);
            } catch {
                metadata.extra = args.metadataJson;
            }
        }

        await logShareEvent(ctx, {
            articleId: args.articleId,
            sessionId: sessionResult?.sessionId,
            eventTimestamp: now,
            channel: args.channel,
            readerType: normalized.readerType,
            userId: normalized.userId,
            visitorKey: normalized.visitorKey,
            context: args.context ?? undefined,
            metadata,
        });

        await logArticleEvent(ctx, {
            articleId: args.articleId,
            sessionId: sessionResult?.sessionId,
            eventType: "share",
            eventTimestamp: now,
            readerType: normalized.readerType,
            userId: normalized.userId,
            visitorKey: normalized.visitorKey,
            metadata,
        });

        return {
            recordedAt: now,
            sessionId: sessionResult?.sessionId ?? null,
        };
    },
});

