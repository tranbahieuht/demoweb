import type { Locator, Page } from "@playwright/test";
export async function choose(page: Page, trigger: Locator, value: string) {
  const touch = await page.evaluate(
    () => matchMedia("(pointer: coarse)").matches,
  );
  if (touch) await trigger.tap();
  else await trigger.click();
  // Exercise the visible popup, using the option's stable value across locales.
  const target = page.locator(
    `.select-content [role="option"][data-value="${value}"]`,
  );
  if (touch) await target.tap();
  else await target.click();
}
