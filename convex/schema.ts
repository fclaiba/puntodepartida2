import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        email: v.string(),
        name: v.string(),
        password: v.string(), // Stored as bcrypt hash.
        role: v.union(v.literal("admin"), v.literal("editor"), v.literal("lector")),
        createdAt: v.string(),
        lastLogin: v.string(),
    }).index("by_email", ["email"]),

    articles: defineTable({
        title: v.string(),
        section: v.string(), // politica, economia, etc.
        imageUrl: v.string(),
        description: v.string(),
        content: v.string(),
        author: v.string(),
        date: v.string(), // ISO string
        readTime: v.number(),
        featured: v.boolean(),
        publishDate: v.optional(v.string()),
        status: v.optional(
            v.union(v.literal("draft"), v.literal("scheduled"), v.literal("published"))
        ),
        source: v.optional(v.union(v.literal("internal"), v.literal("external"))),
        storageId: v.optional(v.id("_storage")),
        views: v.optional(v.number()),
    })
        .index("by_section", ["section"])
        .index("by_date", ["date"]),

    article_views: defineTable({
        articleId: v.id("articles"),
        timestamp: v.string(),
    })
        .index("by_article", ["articleId"])
        .index("by_timestamp", ["timestamp"]),

    reading_sessions: defineTable({
        articleId: v.id("articles"),
        sessionToken: v.string(),
        readerType: v.union(v.literal("guest"), v.literal("registered")),
        userId: v.optional(v.id("users")),
        visitorKey: v.optional(v.string()),
        startedAt: v.string(),
        lastEventAt: v.string(),
        completedAt: v.optional(v.string()),
        durationSeconds: v.optional(v.number()),
        progressPercent: v.optional(v.number()),
        referrer: v.optional(v.string()),
        utmSource: v.optional(v.string()),
        utmMedium: v.optional(v.string()),
        utmCampaign: v.optional(v.string()),
        deviceType: v.optional(v.string()),
    })
        .index("by_article", ["articleId"])
        .index("by_sessionToken", ["sessionToken"])
        .index("by_user", ["userId"])
        .index("by_startedAt", ["startedAt"]),

    article_events: defineTable({
        articleId: v.id("articles"),
        sessionId: v.optional(v.id("reading_sessions")),
        eventType: v.union(
            v.literal("article_view"),
            v.literal("reading_session_started"),
            v.literal("reading_session_heartbeat"),
            v.literal("reading_session_completed"),
            v.literal("share"),
            v.literal("custom")
        ),
        eventTimestamp: v.string(),
        readerType: v.union(v.literal("guest"), v.literal("registered")),
        userId: v.optional(v.id("users")),
        visitorKey: v.optional(v.string()),
        metadata: v.optional(v.string()),
    })
        .index("by_article", ["articleId"])
        .index("by_session", ["sessionId"])
        .index("by_type", ["eventType"])
        .index("by_timestamp", ["eventTimestamp"]),

    share_events: defineTable({
        articleId: v.id("articles"),
        sessionId: v.optional(v.id("reading_sessions")),
        eventTimestamp: v.string(),
        channel: v.string(),
        readerType: v.union(v.literal("guest"), v.literal("registered")),
        userId: v.optional(v.id("users")),
        visitorKey: v.optional(v.string()),
        context: v.optional(v.string()),
        metadata: v.optional(v.string()),
    })
        .index("by_article", ["articleId"])
        .index("by_channel", ["channel"])
        .index("by_timestamp", ["eventTimestamp"]),

    comments: defineTable({
        articleId: v.id("articles"),
        author: v.string(),
        email: v.string(),
        content: v.string(),
        date: v.string(),
        status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    }).index("by_article", ["articleId"]),

    settings: defineTable({
        siteName: v.string(),
        siteDescription: v.string(),
        contactEmail: v.string(),
        primaryColor: v.string(),
        secondaryColor: v.string(),
        // Social URLs
        facebookUrl: v.optional(v.string()),
        twitterUrl: v.optional(v.string()),
        instagramUrl: v.optional(v.string()),
        youtubeUrl: v.optional(v.string()),
        // Features
        enableComments: v.boolean(),
        moderateComments: v.boolean(),
        enableNewsletter: v.boolean(),
        articlesPerPage: v.optional(v.number()),
        googleAnalyticsId: v.optional(v.string()),
    }),

    academic_volumes: defineTable({
        title: v.string(),
        volumeNumber: v.number(),
        year: v.number(),
        description: v.string(),
        editorial: v.optional(v.string()),
        pdfUrl: v.optional(v.string()),
        coverImage: v.optional(v.string()),
        storageId: v.optional(v.id("_storage")),
        pdfStorageId: v.optional(v.id("_storage")),
        isPublished: v.boolean(),
    }).index("by_year", ["year"]),

    academic_articles: defineTable({
        volumeId: v.id("academic_volumes"),
        title: v.string(),
        author: v.string(),
        abstract: v.string(),
        pdfUrl: v.optional(v.string()),
        storageId: v.optional(v.id("_storage")),
        pageRange: v.optional(v.string()),
    }).index("by_volume", ["volumeId"]),

    activity_logs: defineTable({
        action: v.string(),
        details: v.string(),
        userId: v.optional(v.string()), // Can be system or user
        timestamp: v.string(),
    }).index("by_timestamp", ["timestamp"]),

    engagement_events: defineTable({
        eventType: v.string(),
        articleId: v.optional(v.id("articles")),
        userId: v.optional(v.string()),
        sessionId: v.optional(v.string()),
        metadata: v.optional(v.string()),
        durationMs: v.optional(v.number()),
        occurredAt: v.string(),
    }).index("by_timestamp", ["occurredAt"]),
});
