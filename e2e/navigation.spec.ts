import { expect, test } from "@playwright/test";

test.describe("navigation", () => {
  test("root page loads", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).not.toBe(500);
    await expect(page).toHaveTitle(/WeJSON/);
  });

  test("english page loads at /en/", async ({ page }) => {
    await page.goto("/en/");
    await expect(page).toHaveTitle(/WeJSON/);
    await expect(page.getByRole("button", { name: "Format", exact: true })).toBeVisible();
  });

  test("chinese page loads at /zh/", async ({ page }) => {
    await page.goto("/zh/");
    await expect(page).toHaveTitle(/WeJSON/);
    await expect(page.getByRole("button", { name: "格式化", exact: true })).toBeVisible();
  });

  test("japanese page loads at /ja/", async ({ page }) => {
    await page.goto("/ja/");
    await expect(page).toHaveTitle(/WeJSON/);
    await expect(
      page.getByRole("button", { name: "フォーマット" }),
    ).toBeVisible();
  });

  test("unknown language returns 404", async ({ page }) => {
    const response = await page.goto("/xx/");
    expect(response?.status()).toBe(404);
  });
});
