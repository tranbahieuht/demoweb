import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const stage = process.argv[2] ?? "before";
const base = process.env.TEST_BASE_URL ?? "http://localhost:3001";
const browser = await chromium.launch();
const dir = `docs/visual-review/${stage}`;
await mkdir(dir, { recursive: true });
const report = [];
for (const width of [1440, 768, 430, 390]) {
  const context = await browser.newContext({
    viewport: { width, height: width === 1440 ? 1000 : 900 },
    reducedMotion: "reduce",
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  for (const [name, path] of [
    ["home", "/en"],
    ["collection", "/en/properties"],
    ["residence", "/en/properties/the-palm-house"],
    ["contact", "/en/contact"],
  ]) {
    await page.goto(`${base}${path}`);
    await page.evaluate(() => document.fonts.ready);
    for (const image of await page.locator("main img,.admin-main img").all()) {
      if (!(await image.isVisible())) continue;
      await image.scrollIntoViewIfNeeded();
      await image.evaluate((img) => img.decode()).catch(() => {});
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    if (name === "home") {
      await page.waitForFunction(
        () =>
          !document
            .querySelector(".site-header")
            ?.classList.contains("is-scrolled"),
      );
      await expect(page.locator(".site-header")).toHaveCSS(
        "color",
        "rgb(255, 252, 246)",
      );
      await expect(
        page
          .locator(
            ".site-header .menu-button:visible,.site-header .language-select",
          )
          .first(),
      ).toHaveCSS("color", "rgb(255, 252, 246)");
      // Inherited color transitions settle after the header's own transition.
      await expect(
        page.locator(".site-header .language-select > svg"),
      ).toHaveCSS("stroke", "rgb(255, 252, 246)");
      if (await page.locator(".menu-button").isVisible())
        await expect(page.locator(".menu-button svg")).toHaveCSS(
          "stroke",
          "rgb(255, 252, 246)",
        );
      await page.locator(".featured-track").evaluate((element) => {
        element.scrollLeft = 0;
      });
    }
    if (name === "home")
      await page.screenshot({ path: `${dir}/hero-${width}.png` });
    await page.screenshot({
      path: `${dir}/${name}-${width}.png`,
      fullPage: true,
    });
    report.push({
      name,
      width,
      overflow: await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    });
  }
  await page.goto(`${base}/en`);
  if (width === 1440) {
    await page.locator(".property-card").first().hover();
    await page
      .locator(".featured")
      .screenshot({ path: `${dir}/card-hover.png` });
  } else {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page.screenshot({ path: `${dir}/menu-${width}.png` });
    await page.keyboard.press("Escape");
  }
  await context.close();
}
await writeFile(`${dir}/report.json`, JSON.stringify(report, null, 2));
await browser.close();
console.log(
  `Saved ${report.length} page reviews and interactive states to ${dir}`,
);
