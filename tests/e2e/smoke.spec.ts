import { expect, test } from "@playwright/test";

test.describe("Smoke · lectura y share", () => {
  test("abre una nota y dispara un flujo de share inline", async ({ page }) => {
    await page.goto("/");

    const firstArticleLink = page.locator('a[href^="/noticia/"]').first();
    await firstArticleLink.waitFor({ state: "visible" });
    await firstArticleLink.click();

    await expect(page).toHaveURL(/\/noticia\//);
    await expect(page.getByText("Compartir esta noticia")).toBeVisible();

    const facebookButton = page.locator('button[aria-label="Compartir en Facebook"]');
    const [sharePopup] = await Promise.all([
      page.waitForEvent("popup"),
      facebookButton.click(),
    ]);

    await expect(sharePopup).not.toBeNull();
    await expect(sharePopup.url()).toContain("facebook.com");
    await sharePopup.close();
  });
});



