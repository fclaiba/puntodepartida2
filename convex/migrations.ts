import { mutation } from "./_generated/server";
import { initialNewsArticles } from "./seed_data";

export const restoreSeedImages = mutation({
    args: {},
    handler: async (ctx) => {
        let restoredCount = 0;
        let createdCount = 0;
        const articles = await ctx.db.query("articles").collect();

        for (const seedArticle of initialNewsArticles) {
            // Find matching article in DB by title
            const existingArticle = articles.find(
                (a) => a.title === seedArticle.title
            );

            if (existingArticle) {
                // Update existing article to restore image
                await ctx.db.patch(existingArticle._id, {
                    imageUrl: seedArticle.imageUrl,
                    storageId: undefined, // Clear storageId as we are using external URL
                });
                restoredCount++;
            } else {
                // Create missing article
                await ctx.db.insert("articles", {
                    // Map seed fields to schema fields
                    title: seedArticle.title,
                    section: seedArticle.section,
                    imageUrl: seedArticle.imageUrl,
                    description: seedArticle.description,
                    content: seedArticle.content,
                    author: seedArticle.author,
                    date: new Date().toISOString(), // Use current date for safety or parse seedArticle.date
                    readTime: seedArticle.readTime,
                    featured: seedArticle.featured ?? false,
                    status: "published", // Ensure it's visible
                    source: "internal",
                });
                createdCount++;
            }
        }

        return `Process complete: Restored images for ${restoredCount} articles. Created ${createdCount} missing articles.`;
    },
});
