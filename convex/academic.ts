import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

const withSignedVolumeAssets = async (
    ctx: { storage: { getUrl: (id: Id<"_storage">) => Promise<string | null> } },
    volume: Doc<"academic_volumes"> | null
) => {
    if (!volume) {
        return volume;
    }

    let coverImage = volume.coverImage ?? null;
    if (volume.storageId) {
        const signedCover = await ctx.storage.getUrl(volume.storageId);
        if (signedCover) {
            coverImage = signedCover;
        }
    }

    let pdfUrl = volume.pdfUrl ?? null;
    if (volume.pdfStorageId) {
        const signedPdf = await ctx.storage.getUrl(volume.pdfStorageId);
        if (signedPdf) {
            pdfUrl = signedPdf;
        }
    }

    return {
        ...volume,
        coverImage: coverImage ?? undefined,
        pdfUrl: pdfUrl ?? undefined,
    };
};

const withSignedAcademicArticle = async (
    ctx: { storage: { getUrl: (id: Id<"_storage">) => Promise<string | null> } },
    article: Doc<"academic_articles">
) => {
    if (!article.storageId) {
        return article;
    }

    const signedPdf = await ctx.storage.getUrl(article.storageId);
    if (!signedPdf) {
        return article;
    }

    return {
        ...article,
        pdfUrl: signedPdf,
    };
};

const orderVolumes = (volumes: Doc<"academic_volumes">[]) =>
    [...volumes].sort((a, b) => {
        if (a.year !== b.year) {
            return b.year - a.year;
        }
        if (a.volumeNumber !== b.volumeNumber) {
            return b.volumeNumber - a.volumeNumber;
        }
        return (b._creationTime ?? 0) - (a._creationTime ?? 0);
    });

const extractPageStart = (pageRange?: string | null) => {
    if (!pageRange) {
        return null;
    }
    const match = pageRange.match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
};

const orderAcademicArticles = (articles: Doc<"academic_articles">[]) =>
    [...articles].sort((a, b) => {
        const pageA = extractPageStart(a.pageRange);
        const pageB = extractPageStart(b.pageRange);

        if (pageA !== null && pageB !== null && pageA !== pageB) {
            return pageA - pageB;
        }
        if (pageA !== null) {
            return -1;
        }
        if (pageB !== null) {
            return 1;
        }
        return (a._creationTime ?? 0) - (b._creationTime ?? 0);
    });

// --- Volumes ---

export const getVolumes = query({
    handler: async (ctx) => {
        const volumes = await ctx.db
            .query("academic_volumes")
            .withIndex("by_year", (q) => q)
            .order("desc")
            .collect();

        const ordered = orderVolumes(volumes);
        return Promise.all(ordered.map((volume) => withSignedVolumeAssets(ctx, volume)));
    },
});

export const getPublicVolumesWithArticles = query({
    handler: async (ctx) => {
        const volumes = await ctx.db
            .query("academic_volumes")
            .withIndex("by_year", (q) => q)
            .order("desc")
            .collect();

        const published = orderVolumes(volumes.filter((volume) => volume.isPublished));

        return Promise.all(
            published.map(async (volume) => {
                const articles = await ctx.db
                    .query("academic_articles")
                    .withIndex("by_volume", (q) => q.eq("volumeId", volume._id))
                    .collect();

                const orderedArticles = orderAcademicArticles(articles);
                const articlesWithAssets = await Promise.all(
                    orderedArticles.map((article) => withSignedAcademicArticle(ctx, article))
                );

                const volumeWithAssets = await withSignedVolumeAssets(ctx, volume);

                return {
                    ...volumeWithAssets,
                    articles: articlesWithAssets,
                };
            })
        );
    },
});

export const getVolumeById = query({
    args: { id: v.id("academic_volumes") },
    handler: async (ctx, args) => {
        const volume = await ctx.db.get(args.id);
        return await withSignedVolumeAssets(ctx, volume);
    },
});

export const createVolume = mutation({
    args: {
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
    },
    handler: async (ctx, args) => {
        const { storageId, pdfStorageId, ...rest } = args;

        let coverImage = rest.coverImage;
        if (storageId) {
            coverImage = (await ctx.storage.getUrl(storageId)) || "";
        }

        let pdfUrl = rest.pdfUrl;
        if (pdfStorageId) {
            pdfUrl = (await ctx.storage.getUrl(pdfStorageId)) || "";
        }

        const volumeId = await ctx.db.insert("academic_volumes", {
            ...rest,
            coverImage,
            storageId,
            pdfUrl,
            pdfStorageId,
        });

        await ctx.db.insert("activity_logs", {
            action: "academic_volume_create",
            details: `Created volume: ${args.title}`,
            timestamp: new Date().toISOString(),
            userId: "admin",
        });

        return volumeId;
    },
});

export const updateVolume = mutation({
    args: {
        id: v.id("academic_volumes"),
        title: v.optional(v.string()),
        volumeNumber: v.optional(v.number()),
        year: v.optional(v.number()),
        description: v.optional(v.string()),
        editorial: v.optional(v.string()),
        pdfUrl: v.optional(v.string()),
        coverImage: v.optional(v.string()),
        storageId: v.optional(v.id("_storage")),
        pdfStorageId: v.optional(v.id("_storage")),
        isPublished: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const { storageId, pdfStorageId, ...rest } = updates;

        const finalUpdates = { ...rest };

        if (storageId) {
            finalUpdates.coverImage = (await ctx.storage.getUrl(storageId)) || "";
        }

        if (pdfStorageId) {
            finalUpdates.pdfUrl = (await ctx.storage.getUrl(pdfStorageId)) || "";
        }

        const patchData: Record<string, any> = { ...finalUpdates };

        if (storageId) {
            patchData.storageId = storageId;
        }

        if (pdfStorageId) {
            patchData.pdfStorageId = pdfStorageId;
        }

        await ctx.db.patch(id, patchData);

        await ctx.db.insert("activity_logs", {
            action: "academic_volume_update",
            details: `Updated volume: ${id}`,
            timestamp: new Date().toISOString(),
            userId: "admin",
        });
    },
});

export const deleteVolume = mutation({
    args: { id: v.id("academic_volumes") },
    handler: async (ctx, args) => {
        const existingVolume = await ctx.db.get(args.id);
        const articles = await ctx.db
            .query("academic_articles")
            .withIndex("by_volume", q => q.eq("volumeId", args.id))
            .collect();

        for (const article of articles) {
            if (article.storageId) {
                await ctx.storage.delete(article.storageId);
            }
            await ctx.db.delete(article._id);
        }

        if (existingVolume?.storageId) {
            await ctx.storage.delete(existingVolume.storageId);
        }

        if (existingVolume?.pdfStorageId) {
            await ctx.storage.delete(existingVolume.pdfStorageId);
        }

        await ctx.db.delete(args.id);

        await ctx.db.insert("activity_logs", {
            action: "academic_volume_delete",
            details: `Deleted volume: ${args.id}`,
            timestamp: new Date().toISOString(),
            userId: "admin",
        });
    },
});

// --- Articles ---

export const getArticlesByVolume = query({
    args: { volumeId: v.id("academic_volumes") },
    handler: async (ctx, args) => {
        const articles = await ctx.db
            .query("academic_articles")
            .withIndex("by_volume", q => q.eq("volumeId", args.volumeId))
            .collect();

        const ordered = orderAcademicArticles(articles);
        return Promise.all(ordered.map((article) => withSignedAcademicArticle(ctx, article)));
    },
});

export const getArticleById = query({
    args: { id: v.id("academic_articles") },
    handler: async (ctx, args) => {
        const article = await ctx.db.get(args.id);
        return article ? await withSignedAcademicArticle(ctx, article) : null;
    },
});

export const createArticle = mutation({
    args: {
        volumeId: v.id("academic_volumes"),
        title: v.string(),
        author: v.string(),
        abstract: v.string(),
        pdfUrl: v.optional(v.string()),
        storageId: v.optional(v.id("_storage")),
        pageRange: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let pdfUrl = args.pdfUrl;
        if (args.storageId) {
            pdfUrl = (await ctx.storage.getUrl(args.storageId)) || "";
        }
        const articleId = await ctx.db.insert("academic_articles", { ...args, pdfUrl });

        await ctx.db.insert("activity_logs", {
            action: "academic_article_create",
            details: `Created academic article: ${args.title}`,
            timestamp: new Date().toISOString(),
            userId: "admin",
        });

        return articleId;
    },
});

export const updateArticle = mutation({
    args: {
        id: v.id("academic_articles"),
        title: v.optional(v.string()),
        author: v.optional(v.string()),
        abstract: v.optional(v.string()),
        pdfUrl: v.optional(v.string()),
        storageId: v.optional(v.id("_storage")),
        pageRange: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const { storageId, ...rest } = updates;

        const finalUpdates = { ...rest };

        if (storageId) {
            finalUpdates.pdfUrl = (await ctx.storage.getUrl(storageId)) || "";
        }

        await ctx.db.patch(id, {
            ...finalUpdates,
            ...(storageId ? { storageId } : {}),
        });

        await ctx.db.insert("activity_logs", {
            action: "academic_article_update",
            details: `Updated academic article: ${id}`,
            timestamp: new Date().toISOString(),
            userId: "admin",
        });
    },
});

export const deleteArticle = mutation({
    args: { id: v.id("academic_articles") },
    handler: async (ctx, args) => {
        const article = await ctx.db.get(args.id);
        if (article?.storageId) {
            await ctx.storage.delete(article.storageId);
        }
        await ctx.db.delete(args.id);

        await ctx.db.insert("activity_logs", {
            action: "academic_article_delete",
            details: `Deleted academic article: ${args.id}`,
            timestamp: new Date().toISOString(),
            userId: "admin",
        });
    },
});
