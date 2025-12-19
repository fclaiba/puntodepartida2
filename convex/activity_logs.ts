import { query } from "./_generated/server";

export const getLogs = query({
    handler: async (ctx) => {
        return await ctx.db.query("activity_logs").order("desc").take(100);
    },
});
