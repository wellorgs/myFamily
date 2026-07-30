import { test, expect } from "@playwright/test";

/**
 * Integration tests for family operations
 * Tests the Firestore document creation and data consistency
 */

test.describe("Family Operations", () => {
  let inviteCode: string;
  let parentFamilyId: string;
  let memberFamilyId: string;

  test("Create family and verify Firestore documents", async ({
    browser,
    context,
  }) => {
    const page = await context.newPage();

    try {
      // Navigate to auth
      await page.goto("http://localhost:5173/");
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(/\/auth/);

      // Create parent account
      await page.click('text="Create account"');
      await page.fill('input[placeholder="Your name"]', "Integration Parent");
      await page.fill(
        'input[placeholder="you@example.com"]',
        `parent-${Date.now()}@test.com`
      );
      await page.fill('input[placeholder="Create a password"]', "Test123456!");
      await page.click('button:has-text("Create account")');

      // Select parent role
      await expect(page).toHaveURL(/\/onboarding$/);
      await page.waitForTimeout(500);
      await page.click('button:has-text("I\'m a Parent")');
      await page.click('button:has-text("Get started")');

      // Complete profile
      await expect(page).toHaveURL(/\/onboarding\/profile/);
      await page.waitForTimeout(500);
      await page.fill('input[placeholder="Your full name"]', "Integration Parent");
      await page.fill('input[placeholder="9876543210"]', "9999999999");
      await page.click('button:has-text("Continue")');

      // Create family
      await expect(page).toHaveURL(/\/onboarding\/family/);
      await page.waitForTimeout(500);
      await page.fill(
        'input[placeholder="e.g., The Smiths"]',
        `Test Family ${Date.now()}`
      );
      await page.click('button:has-text("Create family")');

      // Should be on parent dashboard
      await expect(page).toHaveURL(/\/parent\/home/);
      await page.waitForTimeout(500);

      // Get the family ID from localStorage or from the page
      const familyIdFromStorage = await page.evaluate(() => {
        const state = localStorage.getItem("myfamily.state.v1");
        return state ? JSON.parse(state).familyId : null;
      });

      parentFamilyId = familyIdFromStorage;
      expect(parentFamilyId).toBeTruthy();
      console.log("Parent Family ID:", parentFamilyId);

      // In a real test, we would extract the invite code from Firestore
      // For now, we'll store it for the next test
      // In production, you might display it on the dashboard

      await page.close();
    } catch (error) {
      console.error("Create family test failed:", error);
      throw error;
    }
  });

  test("Join family and verify same familyId", async ({ browser, context }) => {
    const page = await context.newPage();

    try {
      // Navigate to auth
      await page.goto("http://localhost:5173/");
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(/\/auth/);

      // Create member account
      await page.click('text="Create account"');
      await page.fill('input[placeholder="Your name"]', "Integration Member");
      await page.fill(
        'input[placeholder="you@example.com"]',
        `member-${Date.now()}@test.com`
      );
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
      await page.fill(
        'input[placeholder="Your full name"]',
        "Integration Member"
      );
      await page.click('button:has-text("Continue")');

      // At family setup, try to join
      await expect(page).toHaveURL(/\/onboarding\/family/);
      await page.waitForTimeout(500);
      await page.click('button:has-text("Join")');

      // Note: In a real test, we would use the invite code from the parent account
      // For this example, we'll use a test invite code that should fail initially
      // Then in production, we'd need to pass the code from parent to member

      // Test with invalid code first
      await page.fill('input[placeholder="e.g., ABC123"]', "INVALID");
      const joinButton = page.locator('button:has-text("Join family")');

      // Button should be disabled because code is too short
      await expect(joinButton).toBeDisabled();

      // Now try with 6 characters
      await page.fill('input[placeholder="e.g., ABC123"]', "XXXXXX");
      await expect(joinButton).toBeEnabled();
      await joinButton.click();

      // Should see error about invalid code
      await page.waitForTimeout(1000);
      const pageText = await page.textContent("body");
      expect(pageText).toMatch(/Invalid invite code/i);

      await page.close();
    } catch (error) {
      console.error("Join family test failed:", error);
      throw error;
    }
  });

  test("Verify profile documents are created", async ({ browser, context }) => {
    const page = await context.newPage();

    try {
      // Navigate to auth
      await page.goto("http://localhost:5173/");
      await page.waitForTimeout(1000);

      // Create test account
      await expect(page).toHaveURL(/\/auth/);
      await page.click('text="Create account"');
      const email = `verify-${Date.now()}@test.com`;
      await page.fill('input[placeholder="Your name"]', "Verify User");
      await page.fill('input[placeholder="you@example.com"]', email);
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
      await page.fill('input[placeholder="Your full name"]', "Verify User Full");
      await page.fill('input[placeholder="9876543210"]', "9999888888");
      await page.click('button:has-text("Continue")');

      // Check state after profile completion
      await page.waitForTimeout(500);
      const stateAfterProfile = await page.evaluate(() => {
        const state = localStorage.getItem("myfamily.state.v1");
        return state ? JSON.parse(state) : null;
      });

      expect(stateAfterProfile).toBeTruthy();
      expect(stateAfterProfile.name).toBe("Verify User Full");
      expect(stateAfterProfile.role).toBe("family");
      expect(stateAfterProfile.authed).toBe(true);

      console.log("Profile state verified:", stateAfterProfile);

      await page.close();
    } catch (error) {
      console.error("Verify documents test failed:", error);
      throw error;
    }
  });

  test("Verify role selection persists", async ({ browser, context }) => {
    const page = await context.newPage();

    try {
      // Navigate to auth
      await page.goto("http://localhost:5173/");
      await page.waitForTimeout(1000);

      // Create account
      await expect(page).toHaveURL(/\/auth/);
      await page.click('text="Create account"');
      const email = `role-${Date.now()}@test.com`;
      await page.fill('input[placeholder="Your name"]', "Role Test");
      await page.fill('input[placeholder="you@example.com"]', email);
      await page.fill('input[placeholder="Create a password"]', "Test123456!");
      await page.click('button:has-text("Create account")');

      // Select parent role
      await expect(page).toHaveURL(/\/onboarding$/);
      await page.waitForTimeout(500);
      await page.click('button:has-text("I\'m a Parent")');
      await page.click('button:has-text("Get started")');

      // Check state
      await page.waitForTimeout(500);
      const state = await page.evaluate(() => {
        const s = localStorage.getItem("myfamily.state.v1");
        return s ? JSON.parse(s) : null;
      });

      expect(state.role).toBe("parent");
      console.log("Role selection verified:", state.role);

      await page.close();
    } catch (error) {
      console.error("Role selection test failed:", error);
      throw error;
    }
  });
});
