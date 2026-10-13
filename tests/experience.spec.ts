import { choose } from "./select";
import { test, expect, type Page } from "@playwright/test";
async function fillInquiry(page: Page, name = "Demo Visitor") {
  await page.getByLabel("Full name").fill(name);
  await page
    .getByLabel("Phone number", { exact: false })
    .first()
    .fill("+84 912 345 678");
  await page
    .getByLabel("Email address", { exact: false })
    .first()
    .fill("visitor@example.com");
  await page
    .getByLabel("Your message")
    .fill("I would like to arrange a private viewing next week.");
  await page
    .getByRole("button", { name: "Send your inquiry", exact: true })
    .click();
  await expect(
    page.getByText("Your demo inquiry has been saved in this browser.", {
      exact: true,
    }),
  ).toBeVisible();
}
async function waitForImage(page: Page, selector: string) {
  await expect
    .poll(() =>
      page
        .locator(selector)
        .first()
        .evaluate(
          (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
        ),
    )
    .toBe(true);
}
test("all locales render translated homepages with no horizontal overflow", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  const titles = {
    en: "A place to live.",
    vi: "Một nơi để sống.",
    ru: "Место для жизни.",
    ko: "삶을 위한 공간.",
    zh: "安居之所。",
  };
  for (const [locale, title] of Object.entries(titles)) {
    await page.goto(`/${locale}`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(title);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await page
      .locator(".hero-image img")
      .evaluate((img: HTMLImageElement) => img.decode());
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => document.fonts.ready);
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document.querySelector(".hero-search")!.getBoundingClientRect()
              .top -
            document.querySelector(".hero-copy")!.getBoundingClientRect()
              .bottom,
        ),
      )
      .toBeGreaterThan(10);
    await page.screenshot({ path: `test-results/home-${locale}-mobile.png` });
    await page.setViewportSize({ width: 1440, height: 1000 });
  }
  expect(consoleErrors).toEqual([]);
});
test("filters, sort, empty state, reset, and preserved locale path", async ({
  page,
}) => {
  await page.goto("/en/properties");
  await expect(page.locator(".property-card")).toHaveCount(12);
  await choose(
    page,
    page
      .locator(".desktop-filters")
      .getByRole("combobox", { name: "Property type", exact: true }),
    "villa",
  );
  await expect(page.locator(".property-card")).toHaveCount(3);
  await choose(
    page,
    page
      .locator(".desktop-filters")
      .getByRole("combobox", { name: "Location", exact: true }),
    "Da Nang",
  );
  await expect(page.locator(".property-card")).toHaveCount(1);
  await page
    .locator(".desktop-filters")
    .getByLabel("Maximum rent (VND)")
    .fill("1000000");
  await expect(
    page.getByRole("heading", {
      name: "A different search, a new possibility.",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset filters" }).first().click();
  await expect(page.locator(".property-card")).toHaveCount(12);
  await choose(
    page,
    page.getByRole("combobox", { name: "Sort homes" }),
    "priceAsc",
  );
  await expect(page.locator(".property-card").first()).toContainText(
    "The Linen Loft",
  );
  await page.getByLabel("Search by name or neighborhood").fill("palm");
  await expect(page.locator(".property-card")).toHaveCount(1);
  await page
    .locator(".site-header")
    .getByRole("link", { name: "The collection", exact: true })
    .click();
  await expect(page.locator(".property-card")).toHaveCount(12);
  await page.getByLabel("Search by name or neighborhood").fill("palm");
  await expect(page.locator(".property-card")).toHaveCount(1);
  await page.locator(".property-card h3 a").click();
  await expect(page).toHaveURL(/the-palm-house/);
  await choose(
    page,
    page
      .locator(".site-header")
      .getByRole("combobox", { name: "Language", exact: true }),
    "vi",
  );
  await expect(page).toHaveURL(/vi\/properties\/the-palm-house/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Biệt thự Cọ",
  );
});
test("validated property inquiry persists and can be managed in admin", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/en/properties/the-palm-house");
  await page
    .getByRole("button", { name: "Send your inquiry", exact: true })
    .click();
  await expect(
    page.getByText("Please enter at least 2 characters."),
  ).toBeVisible();
  await fillInquiry(page);
  await page.goto("/admin");
  await page.getByRole("button", { name: /^Inquiries/ }).click();
  await expect(
    page.getByRole("cell", { name: /Demo Visitor visitor/ }),
  ).toBeVisible();
  await page
    .getByLabel("Status of inquiry from Demo Visitor")
    .selectOption("contacted");
  await page.reload();
  await page.getByRole("button", { name: /^Inquiries/ }).click();
  await expect(
    page.getByLabel("Status of inquiry from Demo Visitor"),
  ).toHaveValue("contacted");
  await page
    .getByRole("button", { name: "View inquiry from Demo Visitor" })
    .click();
  await expect(page.getByRole("dialog")).toContainText("MSN-001");
  await page.keyboard.press("Escape");
  await page.goto("/en/contact");
  await page.reload();
  await fillInquiry(page, "Second Visitor");
  await page.goto("/admin");
  await page.getByRole("button", { name: /^Inquiries/ }).click();
  await expect(
    page.getByLabel("Status of inquiry from Demo Visitor"),
  ).toHaveValue("contacted");
  await expect(
    page.getByLabel("Status of inquiry from Second Visitor"),
  ).toHaveValue("new");
  expect(errors).toEqual([]);
});
test("admin property edit, add, delete, and public persistence", async ({
  page,
}) => {
  await page.goto("/admin");
  await page.getByRole("button", { name: "Properties", exact: true }).click();
  await page
    .getByRole("button", { name: "Edit The Palm House", exact: true })
    .click();
  await page.getByLabel("Monthly rent · VND").fill("99000000");
  await page.getByRole("button", { name: "Save property" }).click();
  await page
    .getByLabel("Status of The Palm House", { exact: true })
    .selectOption("pending");
  await page.goto("/en/properties/the-palm-house");
  await expect(page.locator(".detail-rent")).toContainText("99,000,000");
  await expect(page.locator(".detail-rent")).toContainText("Pending");
  await page.goto("/admin");
  await page.getByRole("button", { name: "Properties", exact: true }).click();
  await page.getByRole("button", { name: "Add property" }).click();
  await page.getByLabel("Property name · EN").fill("Test Courtyard");
  await page
    .getByLabel("Description · EN")
    .fill(
      "An airy courtyard home with warm natural materials and a private garden.",
    );
  await page.getByLabel("URL slug").fill("test-courtyard");
  await page.getByRole("button", { name: "Save property" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.locator(".admin-property-cell").filter({ hasText: "Test Courtyard" }),
  ).toBeVisible();
  await page.goto("/en/properties/test-courtyard");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Test Courtyard",
  );
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Test Courtyard",
  );
  await page.goto("/admin");
  await page.getByRole("button", { name: "Properties", exact: true }).click();
  await page.getByRole("button", { name: "Delete Test Courtyard" }).click();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(
    page.locator(".admin-property-cell").filter({ hasText: "Test Courtyard" }),
  ).toHaveCount(0);
});
test("gallery navigation, fullscreen Escape, and mobile menu/filter interactions", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en/properties/the-palm-house");
  await page.locator(".gallery-thumbnails button").nth(1).click();
  await expect(
    page.locator(".gallery-thumbnails button").nth(1),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Open fullscreen gallery" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("dialog")
    .getByRole("link", { name: /The collection/ })
    .click();
  await expect(page).toHaveURL(/\/en\/properties$/);
  await page.getByRole("button", { name: "Filters", exact: true }).click();
  await choose(
    page,
    page
      .getByRole("dialog")
      .getByRole("combobox", { name: "Property type", exact: true }),
    "villa",
  );
  await page.getByRole("button", { name: /Show homes/ }).click();
  await expect(page.locator(".property-card")).toHaveCount(3);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.goto("/en/contact");
  await fillInquiry(page, "Mobile Visitor");
});
test("desktop and mobile visual artifacts, all listing and gallery assets load", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en");
  await waitForImage(page, ".hero-image img");
  await page.screenshot({ path: "test-results/home-desktop.png" });
  await page.locator(".site-footer").scrollIntoViewIfNeeded();
  for (const selector of [
    ".intro",
    ".categories",
    ".featured",
    ".care",
    ".team",
    ".testimonials",
  ]) {
    await page.locator(selector).scrollIntoViewIfNeeded();
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({ path: "test-results/home-full.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en");
  await waitForImage(page, ".hero-image img");
  await page.screenshot({ path: "test-results/home-mobile.png" });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.goto("/en/properties");
  await page.locator(".site-footer").scrollIntoViewIfNeeded();
  await page
    .locator(".property-card img")
    .evaluateAll(async (images: HTMLImageElement[]) =>
      Promise.all(images.map((img) => img.decode())),
    );
  expect(
    await page
      .locator(".property-card img")
      .evaluateAll((images: HTMLImageElement[]) =>
        images.some((img) => img.currentSrc.includes("fallback")),
      ),
  ).toBe(false);
  for (const slug of [
    "the-palm-house",
    "the-river-apartment",
    "garden-house",
    "serene-villa",
    "the-lumiere",
    "riverside-retreat",
    "skyline-penthouse",
    "the-olive-house",
    "the-city-atelier",
    "tropical-retreat",
    "the-linen-loft",
    "the-coastal-residence",
  ]) {
    await page.goto(`/en/properties/${slug}`);
    await page
      .locator(".gallery-thumbnails img")
      .evaluateAll(async (images: HTMLImageElement[]) =>
        Promise.all(images.map((img) => img.decode())),
      );
    expect(
      await page
        .locator(".gallery-thumbnails img")
        .evaluateAll((images: HTMLImageElement[]) =>
          images.some((img) => img.currentSrc.includes("fallback")),
        ),
    ).toBe(false);
  }
});
test("cinematic pin cleans up after navigation and unavailable storage reports a failure", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/en");
  await expect(page.locator(".pin-spacer")).toHaveCount(1);
  const pinStart = await page
    .locator(".pin-spacer")
    .evaluate(
      (element) => element.getBoundingClientRect().top + window.scrollY,
    );
  await page.evaluate(
    (top) => window.scrollTo({ top, behavior: "instant" }),
    pinStart + 400,
  );
  await expect
    .poll(() =>
      page
        .locator(".signature")
        .evaluate((element) => Math.abs(element.getBoundingClientRect().top)),
    )
    .toBeLessThan(2);
  await expect(page.locator(".signature")).toBeVisible();
  await page
    .locator(".site-header")
    .getByRole("link", { name: "Get in touch", exact: true })
    .click();
  await expect(page).toHaveURL(/\/en\/contact$/);
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  expect(
    await page.evaluate(() => getComputedStyle(document.body).overflowY),
  ).not.toBe("hidden");
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new Error("Simulated storage failure");
    };
  });
  await page.getByLabel("Full name").fill("Storage Test");
  await page
    .getByLabel("Phone number", { exact: false })
    .first()
    .fill("0912345678");
  await page
    .getByLabel("Email address", { exact: false })
    .first()
    .fill("test@example.com");
  await page
    .getByLabel("Your message")
    .fill("A demonstration inquiry with unavailable browser storage.");
  await page
    .getByRole("button", { name: "Send your inquiry", exact: true })
    .click();
  await expect(page.locator(".inquiry-form [role=alert]")).toContainText(
    "Browser storage is unavailable",
  );
  await expect(
    page.getByText("Your demo inquiry has been saved in this browser.", {
      exact: true,
    }),
  ).toHaveCount(0);
  expect(errors).toEqual([]);
});
