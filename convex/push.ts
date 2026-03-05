import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Subscribe a user device to Push Notifications
export const subscribe = mutation({
    args: {
        endpoint: v.string(),
        keys: v.object({
            p256dh: v.string(),
            auth: v.string()
        }),
        userId: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        const { endpoint, keys, userId } = args;

        // Check if subscription already exists
        const existing = await ctx.db
            .query("push_subscriptions")
            .withIndex("by_endpoint", (q) => q.eq("endpoint", endpoint))
            .first();

        if (existing) {
            // Update userId if it's different (e.g., they logged in)
            if (userId && existing.userId !== userId) {
                await ctx.db.patch(existing._id, { userId });
            }
            return existing._id;
        }

        // Create new subscription
        const subId = await ctx.db.insert("push_subscriptions", {
            endpoint,
            keys,
            userId,
            createdAt: new Date().toISOString(),
        });

        return subId;
    },
});

// Remove a subscription (when user revokes permission or logs out)
export const unsubscribe = mutation({
    args: { endpoint: v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("push_subscriptions")
            .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
            .first();

        if (existing) {
            await ctx.db.delete(existing._id);
        }
    },
});

// Get all subscriptions (Used by Admin to broadcast notifications)
export const getAll = query({
    handler: async (ctx) => {
        return await ctx.db.query("push_subscriptions").collect();
    },
});
