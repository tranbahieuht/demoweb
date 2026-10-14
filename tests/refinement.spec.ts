import { test, expect } from "@playwright/test";
test("public navigation stays within scope and retired routes return 404", async ({
  page,
}) => {
  await page.goto("/en/contact");
  const navigation = page.locator(".desktop-nav");
  await expect(navigation.getByRole("link")).toHaveText([
    "Home",
    "Properties",
    "Contact",
  ]);
  await expect(
    navigation.getByRole("link", { name: "Contact", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    page.locator(
      ".site-footer a[href*='admin'], .site-footer a[href*='#people'], .site-footer a[href*='#philosophy']",
    ),
  ).toHaveCount(0);
  for (const path of [
    "/admin",
    "/en/admin",
    "/en/philosophy",
    "/en/people",
    "/en/journal",
    "/en/blog",
    "/en/news",
    "/en/team",
  ]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(404);
  }
});

test("all four page types fit desktop and mobile in every language", async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const locale of ["en", "vi", "ru", "ko", "zh"]) {
      for (const path of [
        "",
        "/properties",
        "/properties/the-palm-house",
        "/contact",
      ]) {
        await page.goto(`/${locale}${path}`);
        await page.evaluate(() => document.fonts.ready);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await expect(page.locator("html")).toHaveAttribute("lang", locale);
        if (path === "/contact" || path.includes("the-palm-house")) {
          await expect(page.locator(".inquiry-form [required]")).toHaveCount(4);
          const notices: Record<string, string> = {
            en: "Demo mode.",
            vi: "Chế độ demo.",
            ru: "Деморежим.",
            ko: "데모 모드입니다.",
            zh: "演示模式。",
          };
          await expect(page.locator(".form-demo-note")).toContainText(
            notices[locale],
          );
        }
        if (path === "") {
          for (const section of [
            ".intro",
            ".categories",
            ".featured",
            ".team",
            ".testimonials",
          ]) {
            await expect(page.locator(section)).toHaveAttribute(
              "aria-label",
              /\S/,
            );
          }
          await expect(page.locator(".team .team-person")).toHaveCount(3);
          await expect(
            page.locator(".testimonials blockquote"),
          ).not.toBeEmpty();
        }
        if (path.includes("the-palm-house")) {
          await expect(page.locator("article.detail-page")).toHaveAttribute(
            "aria-label",
            /\S/,
          );
          await expect(page.locator(".detail-specs > div")).toHaveCount(3);
          await expect(
            page.locator(".amenity-list li").first(),
          ).not.toBeEmpty();
        }
        const dimensions = await page.evaluate(() => {
          const heading = document.querySelector("h1")!;
          return {
            overflow: document.documentElement.scrollWidth > innerWidth,
            headingSize: parseFloat(getComputedStyle(heading).fontSize),
            bodyColor: getComputedStyle(document.body).color,
            background: getComputedStyle(document.body).backgroundColor,
          };
        });
        expect(dimensions.overflow, `${locale}${path} at ${width}px`).toBe(
          false,
        );
        expect(dimensions.headingSize).toBeLessThanOrEqual(
          width === 390 ? 48 : 68,
        );
        expect(dimensions.bodyColor).toBe("rgb(95, 102, 80)");
        expect(dimensions.background).toBe("rgb(245, 240, 230)");
      }
    }
  }
  expect(errors).toEqual([]);
});

test("minimum and maximum rent combine and descending sort respects them", async ({
  page,
}) => {
  await page.goto("/en/properties");
  const filters = page.locator(".desktop-filters");
  await filters.getByLabel("Minimum rent (VND)").fill("60000000");
  await filters.getByLabel("Maximum rent (VND)").fill("80000000");
  await expect(page.locator(".property-card")).toHaveCount(2);
  await page.getByRole("combobox", { name: "Sort homes" }).click();
  await page.getByRole("option", { name: /high to low/i }).click();
  await expect(page.locator(".property-card").first()).toContainText(
    "Serene Villa",
  );
  await page.reload();
  await expect(page.locator(".property-card")).toHaveCount(2);
  await expect(page.locator(".property-card").first()).toContainText(
    "Serene Villa",
  );
});

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
  await page.locator("#company").scrollIntoViewIfNeeded();
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
    .getByRole("link", { name: "Properties", exact: true })
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
