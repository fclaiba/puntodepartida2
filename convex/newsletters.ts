import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const subscribe = mutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        // Check if already subscribed
        const existing = await ctx.db
            .query("newsletter_subscribers")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (existing) {
            if (existing.status === "unsubscribed") {
                // Resubscribe
                await ctx.db.patch(existing._id, { status: "active", subscribedAt: new Date().toISOString() });
                return "resubscribed";
            }
            return "already_subscribed";
        }

        await ctx.db.insert("newsletter_subscribers", {
            email: args.email,
            status: "active",
            subscribedAt: new Date().toISOString(),
        });

        return "subscribed";
    },
});

export const unsubscribe = mutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("newsletter_subscribers")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (existing && existing.status === "active") {
            await ctx.db.patch(existing._id, { status: "unsubscribed" });
            return "unsubscribed";
        }

        return "not_found";
    },
});

export const getAll = query({
    handler: async (ctx) => {
        return await ctx.db.query("newsletter_subscribers").order("desc").collect();
    },
});

// Helper to get top articles of the week
export const getTopWeeklyArticles = query({
    handler: async (ctx) => {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

        // Get views from the last week
        const recentViews = await ctx.db
            .query("article_views")
            .filter((q) => q.gte(q.field("timestamp"), oneWeekAgo))
            .collect();

        // Count views per article
        const viewCounts: Record<string, number> = {};
        for (const view of recentViews) {
            viewCounts[view.articleId] = (viewCounts[view.articleId] || 0) + 1;
        }

        // Sort article IDs by view count
        const topArticleIds = Object.keys(viewCounts)
            .sort((a, b) => viewCounts[b] - viewCounts[a])
            .slice(0, 5);

        // Fetch article details
        const topArticles = await Promise.all(
            topArticleIds.map((id) => ctx.db.get(id as any))
        );

        return topArticles.filter(Boolean);
    },
});
