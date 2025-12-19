import { mutation } from "./_generated/server";

export const seedAdmin = mutation({
    args: {},
    handler: async (ctx) => {
        const email = "admin@test.com";
        const existing = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", email))
            .first();

        if (existing) return "User already exists";

        // Use plain text password to avoid bcrypt async/setTimeout issues in Convex runtime
        // users.ts login function supports migration from plain text, so this is valid.
        const password = "admin123";

        await ctx.db.insert("users", {
            email,
            name: "Admin Tester",
            role: "admin",
            password,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
        });

        return "Admin created";
    },
});
