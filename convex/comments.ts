import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
    args: {
        articleId: v.id("articles"),
        author: v.string(),
        email: v.string(),
        content: v.string()
    },
    handler: async (ctx, args) => {
        // By default comments are pending if moderation is enabled, but let's check settings
        const settings = await ctx.db.query("settings").first();
        const requireModeration = settings?.moderateComments ?? true;

        const status = requireModeration ? "pending" : "approved";

        await ctx.db.insert("comments", {
            articleId: args.articleId,
            author: args.author,
            email: args.email,
            content: args.content,
            date: new Date().toISOString(),
            status,
        });

        return status;
    },
});

export const getPublicByArticle = query({
    args: { articleId: v.id("articles") },
    handler: async (ctx, args) => {
        const comments = await ctx.db
            .query("comments")
            .withIndex("by_article", (q) => q.eq("articleId", args.articleId))
            .filter((q) => q.eq(q.field("status"), "approved"))
            .order("desc")
            .collect();

        return comments;
    },
});

export const getPendingComments = query({
    handler: async (ctx) => {
        return await ctx.db
            .query("comments")
            .filter((q) => q.eq(q.field("status"), "pending"))
            .order("desc")
            .collect();
    },
});

export const getAll = query({
    handler: async (ctx) => {
        const comments = await ctx.db.query("comments").order("desc").collect();
        return Promise.all(comments.map(async (comment) => {
            const article = await ctx.db.get(comment.articleId);
            return { ...comment, articleTitle: article?.title || "Artículo Eliminado" };
        }));
    },
});

// Admin mutations
export const moderate = mutation({
    args: { id: v.id("comments"), status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")) },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { status: args.status });
    },
});

export const remove = mutation({
    args: { id: v.id("comments") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
