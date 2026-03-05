import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
    handler: async (ctx) => {
        return await ctx.db.query("advertisements").order("desc").collect();
    },
});

export const getActiveByPosition = query({
    args: { position: v.union(v.literal("hero"), v.literal("sidebar"), v.literal("in-article")) },
    handler: async (ctx, args) => {
        return await ctx.db.query("advertisements")
            .withIndex("by_position", (q) => q.eq("position", args.position))
            .filter((q) => q.eq(q.field("active"), true))
            .collect();
    },
});

export const create = mutation({
    args: {
        title: v.string(),
        imageUrl: v.string(),
        targetUrl: v.string(),
        position: v.union(v.literal("hero"), v.literal("sidebar"), v.literal("in-article")),
        active: v.boolean(),
    },
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("advertisements", {
            ...args,
            impressions: 0,
            clicks: 0,
            createdAt: new Date().toISOString(),
        });
        return id;
    },
});

export const update = mutation({
    args: {
        id: v.id("advertisements"),
        title: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        targetUrl: v.optional(v.string()),
        position: v.optional(v.union(v.literal("hero"), v.literal("sidebar"), v.literal("in-article"))),
        active: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});

export const remove = mutation({
    args: { id: v.id("advertisements") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

export const toggleActive = mutation({
    args: { id: v.id("advertisements"), active: v.boolean() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { active: args.active });
    },
});

export const recordImpression = mutation({
    args: { id: v.id("advertisements") },
    handler: async (ctx, args) => {
        const ad = await ctx.db.get(args.id);
        if (ad) {
            await ctx.db.patch(args.id, { impressions: ad.impressions + 1 });
        }
    },
});

export const recordClick = mutation({
    args: { id: v.id("advertisements") },
    handler: async (ctx, args) => {
        const ad = await ctx.db.get(args.id);
        if (ad) {
            await ctx.db.patch(args.id, { clicks: ad.clicks + 1 });
        }
    },
});
