import { chromium, expect } from "@playwright/test";

const base = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${base}/en/contact`);
  await page.getByLabel("Full name").fill("Admin Verification");
  await page.getByLabel("Phone number", { exact: true }).fill("0912345678");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("demo@example.com");
  await page
    .getByLabel("Your message")
    .fill("Please arrange a viewing of this property.");
  await page.getByRole("button", { name: "Send your inquiry" }).click();
  await expect(page.locator(".form-success")).toBeVisible();
  await page.goto(`${base}/admin`);
  await page.getByRole("button", { name: /^Inquiries/ }).click();
  await page
    .getByLabel("Status of inquiry from Admin Verification")
    .selectOption("contacted");
  await page.reload();
  await page.getByRole("button", { name: /^Inquiries/ }).click();
  await expect(
    page.getByLabel("Status of inquiry from Admin Verification"),
  ).toHaveValue("contacted");
  await page.getByRole("button", { name: "Properties", exact: true }).click();
  await page
    .getByRole("button", { name: "Edit The Palm House", exact: true })
    .click();
  await page.getByLabel(/Monthly rent/).fill("99000000");
  await page.getByRole("button", { name: "Save property" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.goto(`${base}/en/properties/the-palm-house`);
  await expect(page.locator(".detail-rent")).toContainText("99,000,000");
  await page.goto(`${base}/admin`);
  await page.getByRole("button", { name: "Properties", exact: true }).click();
  await page.getByRole("button", { name: "Add property" }).click();
  await page.getByLabel(/Property name/).fill("Verification Courtyard");
  await page
    .getByLabel(/Description/)
    .fill(
      "A quiet courtyard home with considered interiors and a private terrace.",
    );
  await page.getByLabel("URL slug").fill("verification-courtyard");
  await page.getByRole("button", { name: "Save property" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.goto(`${base}/en/properties/verification-courtyard`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Verification Courtyard",
  );
  await page.goto(`${base}/admin`);
  await page.getByRole("button", { name: "Properties", exact: true }).click();
  await page
    .getByRole("button", { name: "Delete Verification Courtyard" })
    .click();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Delete Verification Courtyard" }),
  ).toHaveCount(0);
  expect(errors).toEqual([]);
  console.log(
    "Development admin: inquiry management, property edit/add/delete, and public persistence passed.",
  );
} finally {
  await browser.close();
}
