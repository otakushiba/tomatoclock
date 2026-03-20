import { test, expect } from "@playwright/test";

/**
 * Tests for the Login page UI.
 * These tests only cover the login page which is publicly accessible
 * (no auth required) and mock Supabase API calls.
 */

test.describe("Login page", () => {
  test.beforeEach(async ({ page }) => {
    // Mock all Supabase auth API calls so tests don't hit real network
    await page.route("**/auth/v1/**", async (route) => {
      const url = route.request().url();

      // Mock getSession call on init (returns empty session)
      if (url.includes("/token") || url.includes("/session")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: { session: null }, error: null }),
        });
      } else {
        await route.continue();
      }
    });

    // Mock Supabase realtime/presence so no errors occur
    await page.route("**/realtime/**", async (route) => {
      await route.abort();
    });

    await page.goto("/login");
  });

  test("shows login form with email and password fields", async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("shows app title on login page", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("FocusFlow");
  });

  test("can switch between login and signup modes", async ({ page }) => {
    const signupBtn = page.locator("button", { hasText: "註冊" }).first();
    await signupBtn.click();
    await expect(page.locator('button[type="submit"]')).toContainText("建立帳號");

    const loginBtn = page.locator("button", { hasText: "登入" }).first();
    await loginBtn.click();
    await expect(page.locator('button[type="submit"]')).toContainText("登入");
  });

  test("shows error message on failed login", async ({ page }) => {
    // Override the route to simulate a failed login
    await page.route("**/auth/v1/token**", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          error: "invalid_grant",
          error_description: "Invalid login credentials",
        }),
      });
    });

    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');

    // Should show an error message
    await expect(page.locator(".text-red-400")).toBeVisible({ timeout: 5000 });
  });

  test("submit button is disabled while loading", async ({ page }) => {
    // Slow down the auth call
    await page.route("**/auth/v1/token**", async (route) => {
      await new Promise((r) => setTimeout(r, 2000));
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ error: "invalid_grant" }),
      });
    });

    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "password123");

    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Button should show loading state
    await expect(submitBtn).toContainText("處理中");
    await expect(submitBtn).toBeDisabled();
  });

  test("password field requires minimum 6 characters", async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toHaveAttribute("minlength", "6");
  });
});
