import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get site settings
export const get = query({
    handler: async (ctx) => {
        const settings = await ctx.db.query("settings").first();
        return settings;
    },
});

// Update site settings (or create if not exists)
export const update = mutation({
    args: {
        siteName: v.string(),
        siteDescription: v.string(),
        contactEmail: v.string(),
        primaryColor: v.string(),
        secondaryColor: v.string(),
        facebookUrl: v.optional(v.string()),
        twitterUrl: v.optional(v.string()),
        instagramUrl: v.optional(v.string()),
        youtubeUrl: v.optional(v.string()),
        enableComments: v.boolean(),
        moderateComments: v.boolean(),
        enableNewsletter: v.boolean(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db.query("settings").first();
        if (existing) {
            await ctx.db.patch(existing._id, args);
        } else {
            await ctx.db.insert("settings", args);
        }

        await ctx.db.insert("activity_logs", {
            action: "settings_update",
            details: "Updated site settings",
            timestamp: new Date().toISOString(),
            userId: "admin",
        });
    },
});
