import { expect, test } from "@playwright/test";

const BASE = "/en/";

/** Selector that targets only the WeJSON error alert (excludes Monaco ARIA live
 *  regions and the Next.js route announcer which also carry role="alert"). */
const ERROR_ALERT = '[role="alert"]:not(.monaco-alert):not([id="__next-route-announcer__"])';

/** Set content in the first Monaco editor via the global monaco API. */
async function setEditorContent(
  page: import("@playwright/test").Page,
  content: string,
) {
  await page.evaluate((value) => {
    const monaco = (window as unknown as { monaco?: { editor: { getModels: () => { setValue: (v: string) => void }[] } } }).monaco;
    const models = monaco?.editor?.getModels();
    if (models && models.length > 0) {
      models[0].setValue(value);
    }
  }, content);
}

test.describe("toolbar", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE);
  });

  test("Format button is visible", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Format", exact: true })).toBeVisible();
  });

  test("Minify button is visible", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Minify" })).toBeVisible();
  });

  test("Sort A→Z button is visible", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Sort A/ })).toBeVisible();
  });

  test("Sort Z→A button is visible", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Sort Z/ })).toBeVisible();
  });

  test("Copy formatted button is visible", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /Copy formatted/ }),
    ).toBeVisible();
  });

  test("Copy minified button is visible", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /Copy minified/ }),
    ).toBeVisible();
  });

  test("Download button is visible", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "Download" }),
    ).toBeVisible();
  });
});

test.describe("input mode selector", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE);
  });

  test("JSON mode radio is selected by default", async ({ page }) => {
    const jsonRadio = page.locator('input[type="radio"][value="json"]');
    await expect(jsonRadio).toBeChecked();
  });

  test("JSON5 mode radio is available", async ({ page }) => {
    const json5Radio = page.locator('input[type="radio"][value="json5"]');
    await expect(json5Radio).toBeVisible();
  });

  test("can switch to JSON5 mode", async ({ page }) => {
    const json5Radio = page.locator('input[type="radio"][value="json5"]');
    await json5Radio.check();
    await expect(json5Radio).toBeChecked();
    const jsonRadio = page.locator('input[type="radio"][value="json"]');
    await expect(jsonRadio).not.toBeChecked();
  });
});

test.describe("editor panels", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE);
  });

  test("input panel label is visible", async ({ page }) => {
    await expect(page.getByText("Input JSON")).toBeVisible();
  });

  test("preview panel label is visible", async ({ page }) => {
    await expect(page.getByText("Preview", { exact: true })).toBeVisible();
  });

  test("Monaco input editor loads and is not stuck on loading placeholder", async ({ page }) => {
    // Loading placeholder must disappear once Monaco mounts
    await expect(page.getByText("Loading editor…")).not.toBeVisible();
    await page.waitForSelector(".monaco-editor", { state: "visible", timeout: 30_000 });
    await expect(page.locator(".monaco-editor").first()).toBeVisible();
  });

  test("Monaco preview editor loads and is not stuck on loading placeholder", async ({ page }) => {
    await expect(page.getByText("Loading preview…")).not.toBeVisible();
    await page.waitForSelector(".monaco-editor", { state: "visible", timeout: 30_000 });
    await expect(page.locator(".monaco-editor").nth(1)).toBeVisible();
  });

  test("Monaco input editor is interactive after load", async ({ page }) => {
    await page.waitForSelector(".monaco-editor", { state: "visible", timeout: 30_000 });
    // Use Monaco JS API to verify the input editor (first created) is not read-only
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isReadOnly = await page.evaluate(() => {
      const w = window as any;
      const editors = w.monaco?.editor?.getEditors?.();
      if (!editors?.length) return null;
      return editors[0].getRawOptions().readOnly ?? false;
    });
    expect(isReadOnly).toBe(false);
  });
});

test.describe("format and minify", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE);
    // Wait for Monaco editor to load
    await page.waitForSelector(".monaco-editor", { state: "visible", timeout: 30_000 });
  });

  test("format valid JSON shows no error", async ({ page }) => {
    await setEditorContent(page, '{"name":"Alice","age":30}');
    await page.getByRole("button", { name: "Format", exact: true }).click();
    await expect(page.locator(ERROR_ALERT)).not.toBeVisible();
  });

  test("minify valid JSON shows no error", async ({ page }) => {
    await setEditorContent(page, '{ "x": 1, "y": 2 }');
    await page.getByRole("button", { name: "Minify" }).click();
    await expect(page.locator(ERROR_ALERT)).not.toBeVisible();
  });

  test("format invalid JSON shows error alert", async ({ page }) => {
    await setEditorContent(page, '{invalid json}');
    await page.getByRole("button", { name: "Format", exact: true }).click();
    await expect(page.locator(ERROR_ALERT)).toBeVisible();
  });

  test("sort A→Z with valid JSON shows no error", async ({ page }) => {
    await setEditorContent(page, '{"z":3,"a":1,"m":2}');
    await page.getByRole("button", { name: /Sort A/ }).click();
    await expect(page.locator(ERROR_ALERT)).not.toBeVisible();
  });

  test("sort Z→A with valid JSON shows no error", async ({ page }) => {
    await setEditorContent(page, '{"z":3,"a":1,"m":2}');
    await page.getByRole("button", { name: /Sort Z/ }).click();
    await expect(page.locator(ERROR_ALERT)).not.toBeVisible();
  });
});

test.describe("JSON5 input", () => {
  test("format JSON5 content shows no error", async ({ page }) => {
    await page.goto(BASE);
    await page.waitForSelector(".monaco-editor", { state: "visible", timeout: 30_000 });

    // Switch to JSON5 mode
    await page.locator('input[type="radio"][value="json5"]').check();

    // Set JSON5 content (with comment which is not valid JSON)
    await setEditorContent(page, "{ name: 'Alice', /* comment */ age: 30 }");
    await page.getByRole("button", { name: "Format", exact: true }).click();
    await expect(page.locator(ERROR_ALERT)).not.toBeVisible();
  });
});

test.describe("preview export", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE);
    await page.waitForSelector(".monaco-editor", { state: "visible", timeout: 30_000 });
    // Format some content so the export buttons become enabled
    await setEditorContent(page, '{"hello":"world"}');
    await page.getByRole("button", { name: "Format", exact: true }).click();
  });

  test("theme selector is visible with default GitHub Light", async ({ page }) => {
    const select = page.locator("select");
    await expect(select).toBeVisible();
    await expect(select).toHaveValue("github-light");
  });

  test("export buttons SVG PNG JPG are visible and enabled after format", async ({ page }) => {
    await expect(page.getByRole("button", { name: /SVG/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /PNG/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /JPG/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /SVG/ })).toBeEnabled();
    await expect(page.getByRole("button", { name: /PNG/ })).toBeEnabled();
    await expect(page.getByRole("button", { name: /JPG/ })).toBeEnabled();
  });

  test("export buttons are disabled before format", async ({ page }) => {
    // Fresh page — no formatted content yet
    await page.goto(BASE);
    await page.waitForSelector(".monaco-editor", { state: "visible", timeout: 30_000 });
    await expect(page.getByRole("button", { name: /SVG/ })).toBeDisabled();
    await expect(page.getByRole("button", { name: /PNG/ })).toBeDisabled();
    await expect(page.getByRole("button", { name: /JPG/ })).toBeDisabled();
  });

  test("switching theme produces no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    const select = page.locator("select");
    // Cycle through all themes
    for (const value of ["github-dark", "dracula", "nord", "one-dark-pro", "github-light"]) {
      await select.selectOption(value);
      // Brief pause for async theme application
      await page.waitForTimeout(600);
    }

    // Filter out unrelated errors (e.g. HMR / network)
    const shikiErrors = errors.filter((e) => e.includes("ShikiError") || e.includes("Theme"));
    expect(shikiErrors).toHaveLength(0);
  });

  test("SVG export triggers download without error", async ({ page }) => {
    const downloadPromise = page.waitForEvent("download", { timeout: 15_000 });
    await page.getByRole("button", { name: /SVG/ }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("preview.svg");
    await expect(page.locator(ERROR_ALERT)).not.toBeVisible();
  });

  test("PNG export triggers download without error", async ({ page }) => {
    const downloadPromise = page.waitForEvent("download", { timeout: 15_000 });
    await page.getByRole("button", { name: /PNG/ }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("preview.png");
    await expect(page.locator(ERROR_ALERT)).not.toBeVisible();
  });

  test("JPG export triggers download without error", async ({ page }) => {
    const downloadPromise = page.waitForEvent("download", { timeout: 15_000 });
    await page.getByRole("button", { name: /JPG/ }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("preview.jpg");
    await expect(page.locator(ERROR_ALERT)).not.toBeVisible();
  });
});
