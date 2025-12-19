import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { GenericQueryCtx } from "convex/server";
import type { DataModel, Doc, Id } from "./_generated/dataModel";

type QueryContext = GenericQueryCtx<DataModel>;
type ArticleStatus = "draft" | "scheduled" | "published";
type ArticleSource = "internal" | "external";

const withSignedImageUrl = async (ctx: QueryContext, article: Doc<"articles"> | null) => {
    if (!article?.storageId) {
        return article;
    }

    const signedUrl = await ctx.storage.getUrl(article.storageId);

    if (!signedUrl) {
        return article;
    }

    return {
        ...article,
        imageUrl: signedUrl,
    };
};

const withSignedImageUrls = async (ctx: QueryContext, articles: Doc<"articles">[]) => {
    return await Promise.all(articles.map((article) => withSignedImageUrl(ctx, article)));
};

const getEffectivePublishDate = (article: Doc<"articles">) =>
    article.publishDate ?? article.date;

const getArticleStatus = (article: Doc<"articles">, nowIso: string): ArticleStatus => {
    const status = (article as { status?: ArticleStatus }).status;
    if (status) {
        return status;
    }

    const publishDate = getEffectivePublishDate(article);
    return publishDate && publishDate <= nowIso ? "published" : "draft";
};

const getArticleSource = (article: Doc<"articles">): ArticleSource => {
    const source = (article as { source?: ArticleSource }).source;
    return source ?? "internal";
};

const filterPublishedArticles = (
    articles: Doc<"articles">[],
    nowIso: string,
    options?: { status?: ArticleStatus; source?: ArticleSource }
) =>
    articles.filter((article) => {
        const publishDate = getEffectivePublishDate(article);
        const publishDateValid = !publishDate || publishDate <= nowIso;
        const statusMatches = options?.status
            ? getArticleStatus(article, nowIso) === options.status
            : true;
        const sourceMatches = options?.source
            ? getArticleSource(article) === options.source
            : true;

        return publishDateValid && statusMatches && sourceMatches;
    });

const sortByPublishDateDesc = (articles: Doc<"articles">[]) =>
    [...articles].sort((a, b) => {
        const dateA = getEffectivePublishDate(a) ?? "";
        const dateB = getEffectivePublishDate(b) ?? "";
        if (dateA === dateB) {
            return (b._creationTime ?? 0) - (a._creationTime ?? 0);
        }
        return dateA > dateB ? -1 : 1;
    });

// Get all articles (Admin view)
export const getAll = query({
    handler: async (ctx) => {
        const articles = await ctx.db.query("articles").order("desc").collect();
        return await withSignedImageUrls(ctx, articles);
    },
});

// Get public articles (Published only)
export const getPublic = query({
    args: {
        section: v.optional(v.string()),
        limit: v.optional(v.number()),
        status: v.optional(
            v.union(v.literal("draft"), v.literal("scheduled"), v.literal("published"))
        ),
        source: v.optional(v.union(v.literal("internal"), v.literal("external"))),
    },
    handler: async (ctx, args) => {
        const nowIso = new Date().toISOString();
        let queryBuilder: any = ctx.db.query("articles");

        if (args.section) {
            queryBuilder = queryBuilder
                .withIndex("by_section", (q: any) => q.eq("section", args.section!))
                .order("desc");
        } else {
            queryBuilder = queryBuilder.withIndex("by_date", (q: any) => q).order("desc");
        }

        const collected = await queryBuilder.collect();
        const targetStatus: ArticleStatus | undefined = args.status ?? "published";
        const targetSource: ArticleSource | undefined = args.source ?? "internal";

        const published = filterPublishedArticles(collected, nowIso, {
            status: targetStatus,
            source: targetSource,
        });
        const ordered = sortByPublishDateDesc(published);
        const limit = Math.max(1, args.limit ?? 5);
        const limited = ordered.slice(0, limit);

        return await withSignedImageUrls(ctx, limited);
    },
});

// Get single article by ID
export const getById = query({
    args: { id: v.id("articles") },
    handler: async (ctx, args) => {
        const article = await ctx.db.get(args.id);
        if (!article) {
            return null;
        }

        return await withSignedImageUrl(ctx, article);
    },
});

// Generate upload URL
export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

// Create article
export const create = mutation({
    args: {
        title: v.string(),
        section: v.string(),
        imageUrl: v.string(),
        description: v.string(),
        content: v.string(),
        author: v.string(),
        readTime: v.number(),
        featured: v.boolean(),
        publishDate: v.optional(v.string()),
        storageId: v.optional(v.id("_storage")),
        status: v.optional(
            v.union(v.literal("draft"), v.literal("scheduled"), v.literal("published"))
        ),
        source: v.optional(v.union(v.literal("internal"), v.literal("external"))),
    },
    handler: async (ctx, args) => {
        const {
            status = "draft",
            source = "internal",
            storageId,
            imageUrl: providedImageUrl,
            ...rest
        } = args;

        let imageUrl = providedImageUrl;
        if (storageId) {
            imageUrl = (await ctx.storage.getUrl(storageId)) || "";
        }

        const insertDoc: Record<string, unknown> = {
            ...rest,
            imageUrl,
            date: new Date().toISOString(),
            views: 0,
            status,
            source,
        };

        if (storageId) {
            insertDoc.storageId = storageId;
        }

        const articleId = await ctx.db.insert("articles", insertDoc as any);

        await ctx.db.insert("activity_logs", {
            action: "article_create",
            details: `Created article: ${args.title}`,
            timestamp: new Date().toISOString(),
            userId: "admin", // TODO: Get real user ID
        });

        return articleId;
    },
});

// Update article
export const update = mutation({
    args: {
        id: v.id("articles"),
        title: v.optional(v.string()),
        section: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        description: v.optional(v.string()),
        content: v.optional(v.string()),
        author: v.optional(v.string()),
        readTime: v.optional(v.number()),
        featured: v.optional(v.boolean()),
        publishDate: v.optional(v.string()),
        storageId: v.optional(v.id("_storage")),
        status: v.optional(
            v.union(v.literal("draft"), v.literal("scheduled"), v.literal("published"))
        ),
        source: v.optional(v.union(v.literal("internal"), v.literal("external"))),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const finalUpdates = { ...updates };

        if (updates.storageId) {
            finalUpdates.imageUrl = (await ctx.storage.getUrl(updates.storageId)) || "";
        }

        await ctx.db.patch(id, finalUpdates);

        await ctx.db.insert("activity_logs", {
            action: "article_update",
            details: `Updated article: ${id}`,
            timestamp: new Date().toISOString(),
            userId: "admin",
        });
    },
});

// Delete article
export const remove = mutation({
    args: { id: v.id("articles") },
    handler: async (ctx, args) => {
        const article = await ctx.db.get(args.id);
        if (article && article.storageId) {
            await ctx.storage.delete(article.storageId);
        }
        await ctx.db.delete(args.id);

        await ctx.db.insert("activity_logs", {
            action: "article_delete",
            details: `Deleted article: ${args.id}`,
            timestamp: new Date().toISOString(),
            userId: "admin",
        });
    },
});

type TrendingTopic = {
    id: Id<"articles">;
    title: string;
    section: string;
    views: number;
    publishDate: string | null;
};

const sortTrendingArticles = (articles: Doc<"articles">[]) =>
    [...articles].sort((a, b) => {
        const viewsA = a.views ?? 0;
        const viewsB = b.views ?? 0;
        if (viewsA !== viewsB) {
            return viewsB - viewsA;
        }

        const dateA = getEffectivePublishDate(a) ?? "";
        const dateB = getEffectivePublishDate(b) ?? "";
        if (dateA === dateB) {
            return (b._creationTime ?? 0) - (a._creationTime ?? 0);
        }

        return dateA > dateB ? -1 : 1;
    });

export const getTrendingTopics = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args): Promise<TrendingTopic[]> => {
        const limit = Math.max(1, Math.min(args.limit ?? 10, 25));
        const nowIso = new Date().toISOString();

        const articles = await ctx.db
            .query("articles")
            .withIndex("by_date", (q) => q)
            .order("desc")
            .collect();

        const published = filterPublishedArticles(articles, nowIso, {
            status: "published",
            source: "internal",
        });
        const eligible = published.filter((article) => (article.views ?? 0) > 0);
        const sorted = sortTrendingArticles(eligible.length > 0 ? eligible : published);
        const limited = sorted.slice(0, limit);

        return limited.map((article) => ({
            id: article._id,
            title: article.title,
            section: article.section,
            views: article.views ?? 0,
            publishDate: getEffectivePublishDate(article) ?? null,
        }));
    },
});
