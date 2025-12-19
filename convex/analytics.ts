import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ensureSession, logArticleEvent, normalizeReader } from "./lib/tracking";
import {
    optionalReaderPayload,
    optionalSessionContextPayload,
} from "./lib/trackingSchemas";
import { Id } from "./_generated/dataModel";

const HISTORY_DAYS = 30;

const startOfUTCMonth = (date: Date) =>
    new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));

const startOfUTCDay = (date: Date) =>
    new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

export const recordArticleView = mutation({
    args: {
        articleId: v.id("articles"),
        sessionToken: v.optional(v.string()),
        reader: optionalReaderPayload,
        context: optionalSessionContextPayload,
    },
    handler: async (ctx, args) => {
        const timestamp = new Date().toISOString();

        const sessionResult = args.sessionToken
            ? await ensureSession(ctx, {
                  articleId: args.articleId,
                  sessionToken: args.sessionToken,
                  reader: args.reader ?? undefined,
                  context: args.context ?? undefined,
                  eventTimestamp: timestamp,
              })
            : null;

        const normalized = sessionResult
            ? {
                  readerType: sessionResult.readerType,
                  userId: sessionResult.userId,
                  visitorKey: sessionResult.visitorKey,
              }
            : normalizeReader(args.reader ?? undefined);

        await ctx.db.insert("article_views", {
            articleId: args.articleId,
            timestamp,
        });

        const article = await ctx.db.get(args.articleId);
        if (article) {
            await ctx.db.patch(args.articleId, {
                views: (article.views ?? 0) + 1,
            });
        }

        await logArticleEvent(ctx, {
            articleId: args.articleId,
            sessionId: sessionResult?.sessionId,
            eventType: "article_view",
            eventTimestamp: timestamp,
            readerType: normalized.readerType,
            userId: normalized.userId,
            visitorKey: normalized.visitorKey,
            metadata: args.context
                ? { source: "recordArticleView", context: args.context }
                : { source: "recordArticleView" },
        });

        if (sessionResult?.created) {
            await logArticleEvent(ctx, {
                articleId: args.articleId,
                sessionId: sessionResult.sessionId,
                eventType: "reading_session_started",
                eventTimestamp: timestamp,
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
                eventTimestamp: timestamp,
                readerType: normalized.readerType,
                userId: normalized.userId,
                visitorKey: normalized.visitorKey,
                metadata: { source: "recordArticleView" },
            });
        }

        return {
            recordedAt: timestamp,
            sessionId: sessionResult?.sessionId ?? null,
            sessionCreated: sessionResult?.created ?? false,
        };
    },
});

export const recordEngagementEvent = mutation({
    args: {
        eventType: v.string(),
        articleId: v.optional(v.id("articles")),
        userId: v.optional(v.string()),
        sessionId: v.optional(v.string()),
        durationMs: v.optional(v.number()),
        metadata: v.optional(v.string()),
        occurredAt: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const timestamp = args.occurredAt ?? new Date().toISOString();

        await ctx.db.insert("engagement_events", {
            eventType: args.eventType,
            articleId: args.articleId,
            userId: args.userId,
            sessionId: args.sessionId,
            durationMs: args.durationMs,
            metadata: args.metadata,
            occurredAt: timestamp,
        });

        return { recordedAt: timestamp };
    },
});

export const getDashboardStats = query({
    handler: async (ctx) => {
        const [articles, users] = await Promise.all([
            ctx.db.query("articles").collect(),
            ctx.db.query("users").collect(),
        ]);

        const totalArticles = articles.length;
        const totalUsers = users.length;
        const totalViews = articles.reduce((sum, article) => sum + (article.views ?? 0), 0);

        const now = new Date();
        const todayStart = startOfUTCDay(now);
        const weekStart = new Date(todayStart);
        weekStart.setUTCDate(weekStart.getUTCDate() - 6);

        const monthStart = startOfUTCMonth(now);
        const previousMonthStart = new Date(monthStart);
        previousMonthStart.setUTCMonth(previousMonthStart.getUTCMonth() - 1);

        const historyStart = new Date(todayStart);
        historyStart.setUTCDate(historyStart.getUTCDate() - (HISTORY_DAYS - 1));

        const viewEventsSincePrevMonth = await ctx.db
            .query("article_views")
            .withIndex("by_timestamp", (q) => q.gte("timestamp", previousMonthStart.toISOString()))
            .collect();

        const recentEvents = viewEventsSincePrevMonth.filter(
            (event) => event.timestamp >= historyStart.toISOString()
        );

        const viewsToday = recentEvents.filter(
            (event) => event.timestamp >= todayStart.toISOString()
        ).length;

        const viewsThisWeek = recentEvents.filter(
            (event) => event.timestamp >= weekStart.toISOString()
        ).length;

        const viewsThisMonth = viewEventsSincePrevMonth.filter(
            (event) => event.timestamp >= monthStart.toISOString()
        ).length;

        const viewsLastMonth = viewEventsSincePrevMonth.filter(
            (event) =>
                event.timestamp >= previousMonthStart.toISOString() &&
                event.timestamp < monthStart.toISOString()
        ).length;

        const monthlyViewGrowth =
            viewsLastMonth === 0
                ? null
                : ((viewsThisMonth - viewsLastMonth) / viewsLastMonth) * 100;

        const dayBuckets: Record<string, number> = {};
        const daySequence: string[] = [];

        for (let i = HISTORY_DAYS - 1; i >= 0; i--) {
            const day = new Date(todayStart);
            day.setUTCDate(day.getUTCDate() - i);
            const key = day.toISOString().split("T")[0];
            dayBuckets[key] = 0;
            daySequence.push(key);
        }

        for (const event of recentEvents) {
            const dayKey = event.timestamp.split("T")[0];
            if (dayBuckets[dayKey] !== undefined) {
                dayBuckets[dayKey] += 1;
            }
        }

        const viewsByDay = daySequence.map((date) => ({
            date,
            views: dayBuckets[date] ?? 0,
        }));

        const publishedToday = articles.filter((article) =>
            article.date.startsWith(todayStart.toISOString().split("T")[0])
        ).length;

        const sessionWindowIso = historyStart.toISOString();

        const [sessionsWindow, shareEventsWindow] = await Promise.all([
            ctx.db
                .query("reading_sessions")
                .withIndex("by_startedAt", (q) => q.gte("startedAt", sessionWindowIso))
                .collect(),
            ctx.db
                .query("share_events")
                .withIndex("by_timestamp", (q) => q.gte("eventTimestamp", sessionWindowIso))
                .collect(),
        ]);

        const viewsBySection: Record<string, number> = {};
        for (const article of articles) {
            const section = article.section || "sin seccion";
            viewsBySection[section] = (viewsBySection[section] || 0) + (article.views ?? 0);
        }

        const topArticles = [...articles]
            .map((article) => ({
                id: article._id,
                title: article.title,
                views: article.views ?? 0,
            }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 5);

        const readerSplit = { guest: 0, registered: 0 };
        const readDurations: number[] = [];
        const completionThreshold = 80;
        let completedSessions = 0;

        for (const session of sessionsWindow) {
            if (session.readerType === "registered") {
                readerSplit.registered += 1;
            } else {
                readerSplit.guest += 1;
            }

            if (typeof session.durationSeconds === "number" && session.durationSeconds > 0) {
                readDurations.push(session.durationSeconds);
            }

            const progress = session.progressPercent ?? 0;
            if (
                progress >= completionThreshold ||
                (typeof session.durationSeconds === "number" && session.durationSeconds >= 240) ||
                Boolean(session.completedAt)
            ) {
                completedSessions += 1;
            }
        }

        const totalSessions = sessionsWindow.length;
        const readerDistribution = {
            guest: readerSplit.guest,
            registered: readerSplit.registered,
            total: totalSessions,
            sampleSize: totalSessions,
            windowDays: HISTORY_DAYS,
        };

        const hasReadingSample = readDurations.length > 0;
        const sumDurations = hasReadingSample
            ? readDurations.reduce((sum, value) => sum + value, 0)
            : 0;
        const averageReadSeconds = hasReadingSample ? sumDurations / readDurations.length : null;

        const sortedDurations = hasReadingSample
            ? [...readDurations].sort((a, b) => a - b)
            : [];
        const medianReadSeconds = hasReadingSample
            ? sortedDurations[Math.floor(sortedDurations.length / 2)]
            : null;
        const p90ReadSeconds =
            hasReadingSample && sortedDurations.length > 0
                ? sortedDurations[Math.min(sortedDurations.length - 1, Math.floor(sortedDurations.length * 0.9))]
                : null;

        const completionRate =
            totalSessions > 0 ? (completedSessions / totalSessions) * 100 : null;

        const readingTime = {
            averageSeconds: averageReadSeconds,
            medianSeconds: medianReadSeconds,
            p90Seconds: p90ReadSeconds,
            completionRate,
            sampleSize: readDurations.length,
            windowDays: HISTORY_DAYS,
        };

        const shareChannelCounts: Record<string, number> = {};
        for (const share of shareEventsWindow) {
            const channel = share.channel || "desconocido";
            shareChannelCounts[channel] = (shareChannelCounts[channel] || 0) + 1;
        }

        const totalShares = shareEventsWindow.length;
        const shareRate =
            totalSessions > 0 ? (totalShares / totalSessions) * 100 : null;

        const shareMetrics = {
            totalShares,
            shareRate,
            sampleSize: totalSessions,
            windowDays: HISTORY_DAYS,
            channels: Object.entries(shareChannelCounts)
                .map(([channel, count]) => ({ channel, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5),
        };

        return {
            totalViews,
            totalArticles,
            totalUsers,
            publishedToday,
            viewsToday,
            viewsThisWeek,
            viewsThisMonth,
            viewsLastMonth,
            monthlyViewGrowth,
            topArticles,
            viewsBySection,
            viewsByDay,
            readerDistribution,
            readingTime,
            shareMetrics,
            viewsAreEstimated: viewEventsSincePrevMonth.length === 0,
        };
    },
});

const percentile = (values: number[], percentile: number): number | null => {
    if (values.length === 0) {
        return null;
    }
    const sorted = [...values].sort((a, b) => a - b);
    const index = (sorted.length - 1) * percentile;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    if (lower === upper) {
        return sorted[lower];
    }
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
};

export const getAudienceMetrics = query({
    handler: async (ctx) => {
        const viewEvents = await ctx.db
            .query("article_events")
            .withIndex("by_type", (q) => q.eq("eventType", "article_view"))
            .collect();

        let guestViews = 0;
        let registeredViews = 0;
        const roleCounts: Record<string, number> = {
            admin: 0,
            editor: 0,
            lector: 0,
            unknown: 0,
        };

        const userIds = new Set<Id<"users">>();
        for (const event of viewEvents) {
            if (event.readerType === "guest") {
                guestViews += 1;
            } else {
                registeredViews += 1;
            }
            if (event.userId) {
                userIds.add(event.userId);
            }
        }

        const userRecords = await Promise.all(
            Array.from(userIds).map((userId) => ctx.db.get(userId))
        );

        const userRoleMap = new Map<Id<"users">, string>();
        for (const user of userRecords) {
            if (user) {
                userRoleMap.set(user._id, user.role);
            }
        }

        for (const event of viewEvents) {
            if (event.userId) {
                const role = userRoleMap.get(event.userId) ?? "unknown";
                roleCounts[role] = (roleCounts[role] ?? 0) + 1;
            }
        }

        return {
            totalViews: viewEvents.length,
            byReaderType: {
                guest: guestViews,
                registered: registeredViews,
            },
            byUserRole: roleCounts,
        };
    },
});

export const getReadingMetrics = query({
    handler: async (ctx) => {
        const sessions = await ctx.db.query("reading_sessions").collect();

        const durations: number[] = [];
        const progressValues: number[] = [];

        for (const session of sessions) {
            if (typeof session.durationSeconds === "number" && Number.isFinite(session.durationSeconds)) {
                durations.push(session.durationSeconds);
            }
            if (typeof session.progressPercent === "number" && Number.isFinite(session.progressPercent)) {
                progressValues.push(session.progressPercent);
            }
        }

        const totalSessions = sessions.length;
        const sessionsWithDuration = durations.length;

        const sumDurations = durations.reduce((sum, value) => sum + value, 0);
        const averageDurationSeconds =
            sessionsWithDuration > 0 ? sumDurations / sessionsWithDuration : null;

        const medianDurationSeconds = percentile(durations, 0.5);
        const p90DurationSeconds = percentile(durations, 0.9);

        const averageProgressPercent =
            progressValues.length > 0
                ? progressValues.reduce((sum, value) => sum + value, 0) / progressValues.length
                : null;

        return {
            totalSessions,
            sessionsWithDuration,
            averageDurationSeconds,
            medianDurationSeconds,
            p90DurationSeconds,
            averageProgressPercent,
        };
    },
});

export const getShareMetrics = query({
    handler: async (ctx) => {
        const [shareEvents, viewEvents] = await Promise.all([
            ctx.db.query("share_events").collect(),
            ctx.db
                .query("article_events")
                .withIndex("by_type", (q) => q.eq("eventType", "article_view"))
                .collect(),
        ]);

        const totalShares = shareEvents.length;
        const totalViews = viewEvents.length;

        const byChannel: Record<
            string,
            {
                shares: number;
                registeredShares: number;
                guestShares: number;
            }
        > = {};

        for (const share of shareEvents) {
            const channelKey = (share.channel || "unknown").toLowerCase();
            if (!byChannel[channelKey]) {
                byChannel[channelKey] = {
                    shares: 0,
                    registeredShares: 0,
                    guestShares: 0,
                };
            }
            byChannel[channelKey].shares += 1;
            if (share.readerType === "registered") {
                byChannel[channelKey].registeredShares += 1;
            } else {
                byChannel[channelKey].guestShares += 1;
            }
        }

        const channelBreakdown = Object.entries(byChannel)
            .map(([channel, data]) => ({
                channel,
                totalShares: data.shares,
                registeredShares: data.registeredShares,
                guestShares: data.guestShares,
                shareRate: totalViews > 0 ? data.shares / totalViews : null,
            }))
            .sort((a, b) => b.totalShares - a.totalShares);

        return {
            totalShares,
            totalViews,
            overallShareRate: totalViews > 0 ? totalShares / totalViews : null,
            channelBreakdown,
        };
    },
});
