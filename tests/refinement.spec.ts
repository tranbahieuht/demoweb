import { test, expect } from "@playwright/test";
test("transparent navigation, masked headings and image reveals work during normal scrolling", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/en");
  await expect(page.locator(".site-header")).toHaveCSS(
    "background-color",
    "rgba(0, 0, 0, 0)",
  );
  await expect(page.locator(".site-header .brand")).toHaveCSS(
    "color",
    "rgb(255, 252, 246)",
  );
  await page.locator("#philosophy").scrollIntoViewIfNeeded();
  await expect(page.locator(".site-header")).toHaveClass(/is-scrolled/);
  await expect
    .poll(() =>
      page
        .locator(".intro .text-line")
        .first()
        .evaluate((element) =>
          Math.abs(
            new DOMMatrixReadOnly(getComputedStyle(element).transform).m42,
          ),
        ),
    )
    .toBeLessThan(0.5);
  await page.locator(".intro-main-photo").scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page
        .locator(".intro-main-photo .image-reveal-media")
        .evaluate((element) =>
          Math.max(
            ...(
              getComputedStyle(element).clipPath.match(/\d+(\.\d+)?/g) ?? ["0"]
            ).map(Number),
          ),
        ),
    )
    .toBe(0);
  await page
    .locator(".site-header")
    .getByRole("link", { name: "The collection", exact: true })
    .click();
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await expect(page.locator(".site-header")).toHaveCSS(
    "background-color",
    "rgb(245, 240, 230)",
  );
  expect(errors).toEqual([]);
});
test("custom dropdowns support keyboard selection and filter chips; multilingual search folds accents", async ({
  page,
}) => {
  await page.goto("/en/properties");
  await page
    .locator(".desktop-filters")
    .getByRole("combobox", { name: "Property type", exact: true })
    .focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("End");
  await expect(
    page.getByRole("option", { name: "Residences", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(
    page.getByRole("option", { name: "Villas", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator(".property-card")).toHaveCount(3);
  await page
    .getByRole("button", { name: "Remove filter: Villas", exact: true })
    .click();
  await expect(page.locator(".property-card")).toHaveCount(12);
  await page.getByLabel("Search by name or neighborhood").fill("thao dien");
  await expect(page.locator(".property-card")).toHaveCount(1);
  await expect(page.locator(".property-card")).toContainText("The Palm House");
  await page.locator(".property-card").hover();
  await expect
    .poll(() =>
      page
        .locator(".property-card img")
        .evaluate(
          (element) =>
            new DOMMatrixReadOnly(getComputedStyle(element).transform).a,
        ),
    )
    .toBeGreaterThan(1.01);
});
