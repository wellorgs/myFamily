import { expect, test } from "@playwright/test";

test("welcome page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("myFamily")).toBeVisible();
});

test("forgot password page opens", async ({ page }) => {
  await page.goto("/auth");
  await page.getByText("Forgot password?").click();
  await expect(page.getByText("Reset password")).toBeVisible();
});

test("mock child otp login works", async ({ page }) => {
  await page.goto("/auth");
  await page.getByLabel("Phone").fill("8303033000");
  await page.getByLabel("OTP").fill("12345");
  await page.getByRole("button", { name: "Sign in with OTP" }).click();
  await expect(page).toHaveURL(/family\/dashboard/);
});

test("mock parent otp login works", async ({ page }) => {
  await page.goto("/auth");
  await page.getByLabel("Phone").fill("6280402017");
  await page.getByLabel("OTP").fill("98765");
  await page.getByRole("button", { name: "Sign in with OTP" }).click();
  await expect(page).toHaveURL(/parent\/home/);
});
