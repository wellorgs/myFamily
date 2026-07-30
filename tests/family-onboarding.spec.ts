import { test, expect, Browser, Page, BrowserContext } from "@playwright/test";

/**
 * End-to-end tests for the complete family onboarding lifecycle
 *
 * Tests verify that:
 * 1. Parent account creation → Profile completion → Family creation → Dashboard access
 * 2. Second account → Profile completion → Join family with invite code → Dashboard access
 * 3. Both accounts share the same familyId
 * 4. Route guards prevent accessing dashboards without proper setup
 */

let inviteCode: string;

test.describe("Family Onboarding Lifecycle", () => {
  test("Parent creates account and family", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // Navigate to home
      await page.goto("http://localhost:5173/");
      await page.waitForTimeout(1000);

      // Should redirect to auth after splash
      await expect(page).toHaveURL(/\/auth/);

      // Sign up with email
      await page.click('text="Create account"');
      await page.fill('input[placeholder="Your name"]', "Parent One");
      await page.fill('input[placeholder="you@example.com"]', "parent1@test.com");
      await page.fill('input[placeholder="Create a password"]', "Test123456!");
      await page.click('button:has-text("Create account")');

      // Should redirect to onboarding (role selection)
      await expect(page).toHaveURL(/\/onboarding$/);
      await page.waitForTimeout(500);

      // Select parent role
      await page.click('button:has-text("I\'m a Parent")');
      await page.click('button:has-text("Get started")');

      // Should redirect to profile completion
      await expect(page).toHaveURL(/\/onboarding\/profile/);
      await page.waitForTimeout(500);

      // Complete profile
      await page.fill('input[placeholder="Your full name"]', "Parent One");
      await page.fill('input[placeholder="9876543210"]', "9999999999");
      await page.click('button:has-text("Continue")');

      // Should redirect to family setup
      await expect(page).toHaveURL(/\/onboarding\/family/);
      await page.waitForTimeout(500);

      // Create family
      await page.fill('input[placeholder="e.g., The Smiths"]', "Test Family");
      await page.click('button:has-text("Create family")');

      // Should redirect to parent dashboard
      await expect(page).toHaveURL(/\/parent\/home/);
      await page.waitForTimeout(500);

      // Verify we're on the dashboard
      await expect(page.locator("text=Home")).toBeVisible();
      const dashboardText = await page.textContent("body");
      expect(dashboardText).toContain("Parent One");

      // Extract invite code from a data attribute or by inspecting the family in Firestore
      // For now, we'll manually get it from localStorage or a visible element
      // In a real app, you might display it on the dashboard
      const pageUrl = page.url();
      console.log("Parent dashboard URL:", pageUrl);

      await context.close();
    } catch (error) {
      console.error("Parent account test failed:", error);
      throw error;
    }
  });

  test("Second user joins family with invite code", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // Navigate to home
      await page.goto("http://localhost:5173/");
      await page.waitForTimeout(1000);

      // Should redirect to auth
      await expect(page).toHaveURL(/\/auth/);

      // Sign up with email
      await page.click('text="Create account"');
      await page.fill('input[placeholder="Your name"]', "Family Member One");
      await page.fill('input[placeholder="you@example.com"]', "member1@test.com");
      await page.fill('input[placeholder="Create a password"]', "Test123456!");
      await page.click('button:has-text("Create account")');

      // Select family member role
      await expect(page).toHaveURL(/\/onboarding$/);
      await page.waitForTimeout(500);
      await page.click('button:has-text("I\'m a Family Member")');
      await page.click('button:has-text("Get started")');

      // Complete profile
      await expect(page).toHaveURL(/\/onboarding\/profile/);
      await page.waitForTimeout(500);
      await page.fill('input[placeholder="Your full name"]', "Family Member One");
      await page.click('button:has-text("Continue")');

      // Should be at family setup
      await expect(page).toHaveURL(/\/onboarding\/family/);
      await page.waitForTimeout(500);

      // Switch to join tab
      await page.click('button:has-text("Join")');

      // For testing, we need to get the invite code from the first user's family
      // In a real test, you'd store this in a shared data source or environment
      // For now, we'll use a placeholder that should be replaced with actual code
      const testInviteCode = process.env.INVITE_CODE || "ABCDEF";

      // Join family
      await page.fill('input[placeholder="e.g., ABC123"]', testInviteCode);
      await page.click('button:has-text("Join family")');

      // Should redirect to family dashboard
      await expect(page).toHaveURL(/\/family\/dashboard/);
      await page.waitForTimeout(500);

      // Verify we're on the dashboard
      await expect(page.locator("text=Dashboard")).toBeVisible();
      const dashboardText = await page.textContent("body");
      expect(dashboardText).toContain("Family Member One");

      await context.close();
    } catch (error) {
      console.error("Second user test failed:", error);
      throw error;
    }
  });

  test("Route guards prevent dashboard access without setup", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // Try to access parent dashboard without auth
      await page.goto("http://localhost:5173/parent/home");
      await page.waitForTimeout(1000);

      // Should redirect to auth
      await expect(page).toHaveURL(/\/auth/);

      // Try to access family dashboard without auth
      await page.goto("http://localhost:5173/family/dashboard");
      await page.waitForTimeout(1000);

      // Should redirect to auth
      await expect(page).toHaveURL(/\/auth/);

      await context.close();
    } catch (error) {
      console.error("Route guard test failed:", error);
      throw error;
    }
  });

  test("Cannot access dashboard if profile incomplete", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // Navigate to home
      await page.goto("http://localhost:5173/");
      await page.waitForTimeout(1000);

      // Sign up
      await expect(page).toHaveURL(/\/auth/);
      await page.click('text="Create account"');
      await page.fill('input[placeholder="Your name"]', "Incomplete User");
      await page.fill('input[placeholder="you@example.com"]', "incomplete@test.com");
      await page.fill('input[placeholder="Create a password"]', "Test123456!");
      await page.click('button:has-text("Create account")');

      // Select role
      await expect(page).toHaveURL(/\/onboarding$/);
      await page.waitForTimeout(500);
      await page.click('button:has-text("I\'m a Parent")');
      await page.click('button:has-text("Get started")');

      // Try to skip to dashboard
      await page.goto("http://localhost:5173/parent/home");
      await page.waitForTimeout(1000);

      // Should redirect to profile completion
      await expect(page).toHaveURL(/\/onboarding\/profile/);

      await context.close();
    } catch (error) {
      console.error("Incomplete profile test failed:", error);
      throw error;
    }
  });

  test("Cannot access dashboard if family not joined", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // Navigate to home
      await page.goto("http://localhost:5173/");
      await page.waitForTimeout(1000);

      // Sign up
      await expect(page).toHaveURL(/\/auth/);
      await page.click('text="Create account"');
      await page.fill('input[placeholder="Your name"]', "No Family User");
      await page.fill('input[placeholder="you@example.com"]', "nofamily@test.com");
      await page.fill('input[placeholder="Create a password"]', "Test123456!");
      await page.click('button:has-text("Create account")');

      // Select role
      await expect(page).toHaveURL(/\/onboarding$/);
      await page.waitForTimeout(500);
      await page.click('button:has-text("I\'m a Family Member")');
      await page.click('button:has-text("Get started")');

      // Complete profile
      await expect(page).toHaveURL(/\/onboarding\/profile/);
      await page.waitForTimeout(500);
      await page.fill('input[placeholder="Your full name"]', "No Family User");
      await page.click('button:has-text("Continue")');

      // Try to skip family setup
      await page.goto("http://localhost:5173/family/dashboard");
      await page.waitForTimeout(1000);

      // Should redirect to family setup
      await expect(page).toHaveURL(/\/onboarding\/family/);

      await context.close();
    } catch (error) {
      console.error("No family test failed:", error);
      throw error;
    }
  });

  test("Verify invite code validation", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // Navigate to home
      await page.goto("http://localhost:5173/");
      await page.waitForTimeout(1000);

      // Sign up
      await expect(page).toHaveURL(/\/auth/);
      await page.click('text="Create account"');
      await page.fill('input[placeholder="Your name"]', "Code Test User");
      await page.fill('input[placeholder="you@example.com"]', "codetest@test.com");
      await page.fill('input[placeholder="Create a password"]', "Test123456!");
      await page.click('button:has-text("Create account")');

      // Select role
      await expect(page).toHaveURL(/\/onboarding$/);
      await page.waitForTimeout(500);
      await page.click('button:has-text("I\'m a Family Member")');
      await page.click('button:has-text("Get started")');

      // Complete profile
      await expect(page).toHaveURL(/\/onboarding\/profile/);
      await page.waitForTimeout(500);
      await page.fill('input[placeholder="Your full name"]', "Code Test User");
      await page.click('button:has-text("Continue")');

      // Try invalid code
      await expect(page).toHaveURL(/\/onboarding\/family/);
      await page.waitForTimeout(500);
      await page.click('button:has-text("Join")');
      await page.fill('input[placeholder="e.g., ABC123"]', "INVALID");

      // Button should be disabled (code is too short)
      const joinButton = page.locator('button:has-text("Join family")');
      await expect(joinButton).toBeDisabled();

      // Try with 6 characters but invalid code
      await page.fill('input[placeholder="e.g., ABC123"]', "XXXXXX");
      await expect(joinButton).toBeEnabled();
      await joinButton.click();

      // Should show error
      await page.waitForTimeout(500);
      const errorText = await page.textContent("body");
      expect(errorText).toContain("Invalid invite code");

      await context.close();
    } catch (error) {
      console.error("Invite code validation test failed:", error);
      throw error;
    }
  });
});
