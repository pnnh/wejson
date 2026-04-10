import { expect, test } from "@playwright/test";

const BASE = "/en/";

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

/** Format JSON first so panels have content to work with. */
async function formatJson(
  page: import("@playwright/test").Page,
  json = '{"name":"Alice","age":30,"city":"Paris"}',
) {
  await page.waitForSelector(".monaco-editor", { state: "visible", timeout: 30_000 });
  await setEditorContent(page, json);
  await page.getByRole("button", { name: "Format", exact: true }).click();
}

test.describe("History panel", () => {
  test("History panel is initially collapsed", async ({ page }) => {
    await page.goto(BASE);
    const historyContent = page.getByText("No history yet. Auto-saved after each format.");
    await expect(historyContent).not.toBeVisible();
  });

  test("History panel expands on trigger click", async ({ page }) => {
    await page.goto(BASE);
    await page.getByRole("button", { name: /History/ }).click();
    const historyHint = page.getByText("No history yet. Auto-saved after each format.");
    await expect(historyHint).toBeVisible();
  });

  test("History panel collapses again on second click", async ({ page }) => {
    await page.goto(BASE);
    const trigger = page.getByRole("button", { name: /History/ });
    await trigger.click(); // open
    await trigger.click(); // close
    const historyHint = page.getByText("No history yet. Auto-saved after each format.");
    await expect(historyHint).not.toBeVisible();
  });

  test("History saves entry after formatting", async ({ page }) => {
    await page.goto(BASE);
    await formatJson(page);
    await page.getByRole("button", { name: /History/ }).click();
    // After formatting, the empty message should not appear
    const historyHint = page.getByText("No history yet. Auto-saved after each format.");
    await expect(historyHint).not.toBeVisible();
  });
});

test.describe("JSONPath Query panel", () => {
  test("JSONPath panel is initially collapsed", async ({ page }) => {
    await page.goto(BASE);
    const hint = page.getByText("Supports JSONPath syntax. Press Enter or click Run.");
    await expect(hint).not.toBeVisible();
  });

  test("JSONPath panel expands on trigger click", async ({ page }) => {
    await page.goto(BASE);
    await page.getByRole("button", { name: /JSONPath Query/ }).click();
    const hint = page.getByText("Supports JSONPath syntax. Press Enter or click Run.");
    await expect(hint).toBeVisible();
  });

  test("JSONPath input field is visible when expanded", async ({ page }) => {
    await page.goto(BASE);
    await page.getByRole("button", { name: /JSONPath Query/ }).click();
    await expect(page.getByPlaceholder(/e.g. \$\.store/)).toBeVisible();
  });

  test("Run button is disabled when no JSON is formatted", async ({ page }) => {
    await page.goto(BASE);
    await page.getByRole("button", { name: /JSONPath Query/ }).click();
    // Run is disabled while parsedContent is empty
    await expect(page.getByRole("button", { name: "Run" })).toBeDisabled();
  });

  test("JSONPath query on formatted JSON returns results", async ({ page }) => {
    await page.goto(BASE);
    await formatJson(page, '{"name":"Alice","age":30}');
    await page.getByRole("button", { name: /JSONPath Query/ }).click();
    const input = page.getByPlaceholder(/e.g. \$\.store/);
    await input.fill("$.name");
    await page.getByRole("button", { name: "Run" }).click();
    // Should show result (pre element with JSON result)
    await expect(page.locator("pre")).toBeVisible();
  });
});

test.describe("Export YAML panel", () => {
  test("Export YAML panel is initially collapsed", async ({ page }) => {
    await page.goto(BASE);
    // Re-convert button is inside the CollapsibleContent; not visible when closed
    await expect(page.getByRole("button", { name: "Re-convert" })).not.toBeVisible();
  });

  test("Export YAML panel expands on trigger click", async ({ page }) => {
    await page.goto(BASE);
    await page.getByRole("button", { name: /Export YAML/ }).click();
    // The Re-convert button is always in the action row once panel is open
    await expect(page.getByRole("button", { name: "Re-convert" })).toBeVisible();
  });

  test("YAML download button visible when expanded with content", async ({ page }) => {
    await page.goto(BASE);
    await formatJson(page);
    await page.getByRole("button", { name: /Export YAML/ }).click();
    await expect(page.getByRole("button", { name: /Download .yaml/ })).toBeVisible();
  });
});

test.describe("Export XML panel", () => {
  test("Export XML panel is initially collapsed", async ({ page }) => {
    await page.goto(BASE);
    await expect(page.getByPlaceholder("root")).not.toBeVisible();
  });

  test("Export XML panel expands on trigger click", async ({ page }) => {
    await page.goto(BASE);
    await page.getByRole("button", { name: /Export XML/ }).click();
    // Convert button and root tag input are always shown once panel is open
    await expect(page.getByRole("button", { name: "Convert" })).toBeVisible();
  });

  test("XML root tag input is visible when expanded", async ({ page }) => {
    await page.goto(BASE);
    await page.getByRole("button", { name: /Export XML/ }).click();
    await expect(page.getByPlaceholder("root")).toBeVisible();
  });

  test("XML download button visible when expanded with content", async ({ page }) => {
    await page.goto(BASE);
    await formatJson(page);
    await page.getByRole("button", { name: /Export XML/ }).click();
    await expect(page.getByRole("button", { name: /Download .xml/ })).toBeVisible();
  });
});

test.describe("JSON Schema Validation panel", () => {
  test("Schema panel is initially collapsed", async ({ page }) => {
    await page.goto(BASE);
    await expect(page.getByRole("button", { name: "Validate" })).not.toBeVisible();
  });

  test("Schema panel expands on trigger click", async ({ page }) => {
    await page.goto(BASE);
    await page.getByRole("button", { name: /JSON Schema Validation/ }).click();
    const hint = page.getByText(/Enter a JSON Schema.*Draft-07/);
    await expect(hint).toBeVisible();
  });

  test("Validate button is visible when panel is expanded", async ({ page }) => {
    await page.goto(BASE);
    await page.getByRole("button", { name: /JSON Schema Validation/ }).click();
    await expect(page.getByRole("button", { name: "Validate" })).toBeVisible();
  });

  test("Generate from JSON button is visible", async ({ page }) => {
    await page.goto(BASE);
    await page.getByRole("button", { name: /JSON Schema Validation/ }).click();
    await expect(
      page.getByRole("button", { name: /Generate from JSON/ }),
    ).toBeVisible();
  });

  test("Generate from JSON populates schema when JSON is formatted", async ({ page }) => {
    await page.goto(BASE);
    await formatJson(page, '{"name":"Alice","age":30}');
    await page.getByRole("button", { name: /JSON Schema Validation/ }).click();
    await page.getByRole("button", { name: /Generate from JSON/ }).click();
    // Schema textarea (rows=8) should contain something
    const schemaTextarea = page.locator("textarea[rows='8']");
    const value = await schemaTextarea.inputValue();
    expect(value.length).toBeGreaterThan(0);
  });

  test("Validate with valid JSON and matching schema shows pass", async ({ page }) => {
    await page.goto(BASE);
    await formatJson(page, '{"name":"Alice","age":30}');
    await page.getByRole("button", { name: /JSON Schema Validation/ }).click();
    // Generate schema from the current JSON
    await page.getByRole("button", { name: /Generate from JSON/ }).click();
    await page.getByRole("button", { name: "Validate" }).click();
    await expect(page.getByText(/Validation passed/)).toBeVisible();
  });
});
