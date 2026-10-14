import { choose } from "./select";
import { test, expect } from "@playwright/test";

test("390px and 430px modal entrances stay inside the viewport with motion enabled", async ({
  page,
}) => {
  for (const width of [390, 430]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/en/properties/the-palm-house");
    await page.getByRole("button", { name: "Open fullscreen gallery" }).tap();
    const gallery = page.getByRole("dialog");
    await expect
      .poll(() =>
        gallery.evaluate((element) =>
          Math.abs(element.getBoundingClientRect().x),
        ),
      )
      .toBeLessThan(1);
    await expect
      .poll(() =>
        gallery.evaluate((element) =>
          Math.abs(element.getBoundingClientRect().y),
        ),
      )
      .toBeLessThan(1);
    expect((await gallery.boundingBox())!.width).toBe(width);
    await gallery.getByRole("button", { name: "Close", exact: true }).tap();
    await expect(gallery).not.toBeVisible();
    await page.getByRole("button", { name: "Open navigation" }).tap();
    await expect(page.getByRole("dialog")).toHaveCSS(
      "background-color",
      "rgb(68, 75, 60)",
    );
    await page
      .getByRole("dialog")
      .getByRole("link", { name: /Properties/ })
      .tap();
    await expect(page).toHaveURL(/\/en\/properties$/);
    await expect(page.getByRole("dialog")).not.toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});
test("touch layouts in all five languages and inquiry validation", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  for (const locale of ["en", "vi", "ru", "ko", "zh"]) {
    await page.goto(`/${locale}`);
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
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(page.locator(".pin-spacer")).toHaveCount(0);
    await page.screenshot({
      path: `test-results/${testInfo.project.name}-${locale}.png`,
    });
    await page.goto(`/${locale}/contact`);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.locator(".inquiry-form button[type=submit]").click();
    await expect(page.locator(".field-error")).toHaveCount(4);
  }
  expect(consoleErrors).toEqual([]);
});
test("touch filtering, language switching, gallery swipe, and contact persistence", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en/properties");
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "Filters", exact: true }).tap();
    await choose(
      page,
      page
        .getByRole("dialog")
        .getByRole("combobox", { name: "Property type", exact: true }),
      "villa",
    );
    await page.getByRole("button", { name: /Show homes/ }).tap();
  } else
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
      .locator(".site-header")
      .getByRole("combobox", { name: "Language", exact: true }),
    "zh",
  );
  await expect(page).toHaveURL(/\/zh\/properties\?type=villa/);
  await expect(page.locator(".property-card")).toHaveCount(3);
  await page.locator(".property-card h3 a").first().tap();
  const swipe = page.locator(".gallery-main");
  await swipe.evaluate((element) => {
    const start = new Touch({
      identifier: 1,
      target: element,
      clientX: 300,
      clientY: 100,
    });
    element.dispatchEvent(
      new TouchEvent("touchstart", {
        touches: [start],
        changedTouches: [start],
        bubbles: true,
      }),
    );
    const end = new Touch({
      identifier: 1,
      target: element,
      clientX: 90,
      clientY: 100,
    });
    element.dispatchEvent(
      new TouchEvent("touchend", {
        touches: [],
        changedTouches: [end],
        bubbles: true,
      }),
    );
  });
  await expect(
    page.locator(".gallery-thumbnails button").nth(1),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "打开全屏相册" }).tap();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "关闭", exact: true }).tap();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.goto("/en/contact");
  await page.getByLabel("Full name").fill("Touch Visitor");
  await page.getByLabel("Phone number", { exact: true }).fill("0912345678");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("touch@example.com");
  await page
    .getByLabel("Your message")
    .fill("Please arrange a private viewing for our family.");
  await page.getByRole("button", { name: "Send your inquiry" }).tap();
  await expect(
    page.getByText("Your demo inquiry has been saved in this browser.", {
      exact: true,
    }),
  ).toBeVisible();
  const inquiries = await page.evaluate(
    () => JSON.parse(localStorage.getItem("maison-demo-v1")!).inquiries,
  );
  expect(inquiries).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ name: "Touch Visitor", status: "new" }),
    ]),
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-contact.png`,
  });
});
