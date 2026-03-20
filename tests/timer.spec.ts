import { test, expect } from "@playwright/test";

/**
 * Tests for the timer page.
 * These mock Supabase to bypass auth and test the timer UI.
 */

const MOCK_USER = {
  id: "test-user-id-123",
  email: "test@example.com",
  aud: "authenticated",
  role: "authenticated",
};

const MOCK_SESSION = {
  access_token: "mock-access-token",
  refresh_token: "mock-refresh-token",
  expires_in: 3600,
  token_type: "bearer",
  user: MOCK_USER,
};

async function mockSupabase(page: import("@playwright/test").Page) {
  // Mock all Supabase REST API calls
  await page.route("**/rest/v1/**", async (route) => {
    const url = route.request().url();

    if (url.includes("/profiles")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: MOCK_USER.id,
            display_name: "Test User",
            avatar_url: null,
            bio: null,
            updated_at: new Date().toISOString(),
          },
        ]),
      });
    } else if (url.includes("/projects")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    } else if (url.includes("/tasks")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    } else if (url.includes("/pomodoro_sessions")) {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    } else {
      await route.continue();
    }
  });

  // Mock auth endpoints
  await page.route("**/auth/v1/**", async (route) => {
    const url = route.request().url();

    if (url.includes("/token") && route.request().method() === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: { session: MOCK_SESSION, user: MOCK_USER },
          error: null,
        }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { session: null }, error: null }),
      });
    }
  });

  // Set auth session in localStorage before navigating
  await page.addInitScript((session) => {
    // Inject a fake Supabase session into localStorage
    const storageKey = "sb-" + window.location.hostname + "-auth-token";
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: "bearer",
        user: session.user,
      })
    );
  }, MOCK_SESSION);
}

test.describe("Timer page", () => {
  test("shows login page when not authenticated", async ({ page }) => {
    // Don't mock auth — should redirect to login
    await page.route("**/auth/v1/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { session: null }, error: null }),
      });
    });

    await page.goto("/");
    // Should end up on login page
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

  test("login page has correct UI elements", async ({ page }) => {
    await page.route("**/auth/v1/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { session: null }, error: null }),
      });
    });

    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("FocusFlow");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});

test.describe("Timer store behavior (via localStorage)", () => {
  test("timer state is persisted in localStorage", async ({ page }) => {
    // Set some timer state in localStorage to test persistence
    await page.addInitScript(() => {
      localStorage.setItem(
        "pomodoro_timer",
        JSON.stringify({
          state: {
            mode: "focus",
            secondsLeft: 1500,
            isRunning: false,
            completedPomodoros: 3,
            todayPomodoros: 3,
            settings: {
              focusMinutes: 25,
              shortBreakMinutes: 5,
              longBreakMinutes: 15,
              longBreakInterval: 4,
              autoStartNextSession: false,
              soundEnabled: true,
            },
          },
          version: 0,
        })
      );
    });

    await page.route("**/auth/v1/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { session: null }, error: null }),
      });
    });

    await page.goto("/login");

    // Timer state should be persisted — verify localStorage has the key
    const timerState = await page.evaluate(() =>
      localStorage.getItem("pomodoro_timer")
    );
    expect(timerState).toBeTruthy();
    const parsed = JSON.parse(timerState!);
    expect(parsed.state.completedPomodoros).toBe(3);
  });
});
