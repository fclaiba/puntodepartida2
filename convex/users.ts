import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { compareSync, hashSync } from "bcryptjs";

// Login function (Simple password check for now)
export const login = mutation({
    args: { email: v.string(), password: v.string() },
    handler: async (ctx, args) => {
        const normalizedEmail = args.email.trim().toLowerCase();

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
            .first();

        if (!user) {
            return null;
        }

        const storedPassword = user.password ?? "";
        const isHashed = storedPassword.startsWith("$2");

        let isValid = false;

        if (isHashed) {
            isValid = compareSync(args.password, storedPassword);
        } else {
            isValid = storedPassword === args.password;
        }

        if (!isValid) {
            return null;
        }

        if (!isHashed) {
            // Migrate to hash using sync
            const migratedHash = hashSync(args.password, 10);
            await ctx.db.patch(user._id, { password: migratedHash });
        }

        await ctx.db.patch(user._id, { lastLogin: new Date().toISOString() });

        return await ctx.db.get(user._id);
    },
});

// Create user (Admin only ideally, but public for now for seeding/setup)
export const createUser = mutation({
    args: {
        email: v.string(),
        name: v.string(),
        password: v.string(),
        role: v.union(v.literal("admin"), v.literal("editor"), v.literal("lector")),
    },
    handler: async (ctx, args) => {
        const normalizedEmail = args.email.trim().toLowerCase();
        const trimmedName = args.name.trim();

        const existing = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
            .first();

        if (existing) throw new Error("User already exists");

        // Use sync hash
        const hashedPassword = hashSync(args.password, 10);

        const userId = await ctx.db.insert("users", {
            email: normalizedEmail,
            name: trimmedName,
            role: args.role,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
        });

        return userId;
    },
});

// Get all users (Admin)
export const getAll = query({
    handler: async (ctx) => {
        return await ctx.db.query("users").collect();
    },
});

// Update user
export const update = mutation({
    args: {
        id: v.id("users"),
        name: v.optional(v.string()),
        role: v.optional(v.union(v.literal("admin"), v.literal("editor"), v.literal("lector"))),
        email: v.optional(v.string()),
        password: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const finalUpdates: Record<string, any> = {};

        if (updates.name !== undefined) {
            finalUpdates.name = updates.name.trim();
        }

        if (updates.role !== undefined) {
            finalUpdates.role = updates.role;
        }

        if (updates.email !== undefined) {
            const normalizedEmail = updates.email.trim().toLowerCase();

            const existing = await ctx.db
                .query("users")
                .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
                .first();

            if (existing && existing._id !== id) {
                throw new Error("Ya existe un usuario con ese email");
            }

            finalUpdates.email = normalizedEmail;
        }

        if (updates.password) {
            // Use sync hash
            finalUpdates.password = hashSync(updates.password, 10);
        }

        if (Object.keys(finalUpdates).length === 0) {
            return;
        }

        await ctx.db.patch(id, finalUpdates);
    },
});

// Delete user
export const remove = mutation({
    args: { id: v.id("users") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
