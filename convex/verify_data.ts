import { query } from "./_generated/server";

export const check = query({
    handler: async (ctx) => {
        const articles = await ctx.db.query("articles").collect();
        const comments = await ctx.db.query("comments").collect();
        const volumes = await ctx.db.query("academic_volumes").collect();
        const academicArticles = await ctx.db.query("academic_articles").collect();

        return {
            articlesCount: articles.length,
            commentsCount: comments.length,
            volumesCount: volumes.length,
            academicArticlesCount: academicArticles.length,
            sampleVolume: volumes[0] || null,
            sampleComment: comments[0] || null,
        };
    },
});
