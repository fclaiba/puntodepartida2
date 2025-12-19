import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get comments for an article (Admin view - all comments)
export const getByArticle = query({
    args: { articleId: v.id("articles") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("comments")
            .withIndex("by_article", (q) => q.eq("articleId", args.articleId))
            .collect();
    },
});

// Get public comments (Approved only)
export const getPublicByArticle = query({
    args: { articleId: v.id("articles") },
    handler: async (ctx, args) => {
        const comments = await ctx.db
            .query("comments")
            .withIndex("by_article", (q) => q.eq("articleId", args.articleId))
            .collect();

        return comments.filter(c => c.status === "approved").sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
});

// Get all comments (Admin)
export const getAll = query({
    handler: async (ctx) => {
        return await ctx.db.query("comments").order("desc").collect();
    },
});

// Create comment
export const create = mutation({
    args: {
        articleId: v.id("articles"),
        author: v.string(),
        email: v.string(),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("comments", {
            ...args,
            date: new Date().toISOString(),
            status: "pending",
        });
    },
});

// Moderate comment (Approve/Reject)
export const moderate = mutation({
    args: {
        id: v.id("comments"),
        status: v.union(v.literal("approved"), v.literal("rejected")),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { status: args.status });

        await ctx.db.insert("activity_logs", {
            action: "comment_moderate",
            details: `Moderated comment ${args.id} to ${args.status}`,
            timestamp: new Date().toISOString(),
            userId: "admin",
        });
    },
});

// Delete comment
export const remove = mutation({
    args: { id: v.id("comments") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);

        await ctx.db.insert("activity_logs", {
            action: "comment_delete",
            details: `Deleted comment ${args.id}`,
            timestamp: new Date().toISOString(),
            userId: "admin",
        });
    },
});
