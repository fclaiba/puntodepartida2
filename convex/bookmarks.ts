import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const toggleBookmark = mutation({
    args: { articleId: v.id("articles"), userId: v.id("users") },
    handler: async (ctx, args) => {
        const { articleId, userId } = args;
        const existing = await ctx.db
            .query("bookmarks")
            .withIndex("by_user_article", (q) => q.eq("userId", userId).eq("articleId", articleId))
            .first();

        if (existing) {
            await ctx.db.delete(existing._id);
            return false;
        } else {
            await ctx.db.insert("bookmarks", {
                userId,
                articleId,
                createdAt: new Date().toISOString(),
            });
            return true;
        }
    },
});

export const getUserBookmarks = query({
    args: { userId: v.optional(v.id("users")) },
    handler: async (ctx, args) => {
        if (!args.userId) return [];

        const bookmarks = await ctx.db
            .query("bookmarks")
            .withIndex("by_user", (q) => q.eq("userId", args.userId!))
            .order("desc")
            .collect();

        const articles = [];
        for (const bookmark of bookmarks) {
            const article = await ctx.db.get(bookmark.articleId);
            if (article) {
                let imageUrl = article.imageUrl;
                if (article.storageId) {
                    imageUrl = await ctx.storage.getUrl(article.storageId) || imageUrl;
                }
                articles.push({ ...article, imageUrl, bookmarkId: bookmark._id, bookmarkedAt: bookmark.createdAt });
            }
        }
        return articles;
    },
});

export const isBookmarked = query({
    args: { userId: v.optional(v.id("users")), articleId: v.optional(v.id("articles")) },
    handler: async (ctx, args) => {
        if (!args.userId || !args.articleId) return false;
        const existing = await ctx.db
            .query("bookmarks")
            .withIndex("by_user_article", (q) => q.eq("userId", args.userId as any).eq("articleId", args.articleId as any))
            .first();
        return !!existing;
    }
});
