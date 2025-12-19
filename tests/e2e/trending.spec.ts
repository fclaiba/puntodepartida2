import { expect, test } from "@playwright/test";

test.describe("Trending bar", () => {
  test("renders trending links on desktop", async ({ page }) => {
    await page.goto("/");

    const trendingRegion = page.getByRole("region", {
      name: /tendencia/i,
    });
    await expect(trendingRegion).toBeVisible();

    const trendingLinks = trendingRegion.getByRole("link");
    await expect(trendingLinks.first()).toBeVisible();
    await expect(trendingLinks.nth(0)).toHaveAttribute("href", /\/noticia\//);
  });

  test("remains accessible on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const trendingRegion = page.getByRole("region", {
      name: /tendencia/i,
    });
    await expect(trendingRegion).toBeVisible();

    const linkCount = await trendingRegion.getByRole("link").count();
    if (linkCount > 0) {
      await expect(trendingRegion.getByRole("link").first()).toBeVisible();
    } else {
      await expect(trendingRegion.getByRole("status")).toBeVisible();
    }
  });
});

