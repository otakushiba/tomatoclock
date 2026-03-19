import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

// ── Supabase 驗證用 client ─────────────────────────────────
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

// ── 測試帳號（設定在 .env.local） ──────────────────────────
// TEST_USER_EMAIL=your_test@example.com
// TEST_USER_PASSWORD=yourpassword
const TEST_EMAIL = process.env.TEST_USER_EMAIL!;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD!;

test.describe("番茄鐘 Session 寫入", () => {
  test("登入 → 開始計時 → 提早結束 → Supabase 寫入 completed 紀錄", async ({ page }) => {
    // 捕捉 browser console（方便排查 insert 錯誤）
    page.on("console", (msg) => {
      if (msg.type() === "error" || msg.text().includes("SessionRecorder")) {
        console.log(`[Browser ${msg.type()}] ${msg.text()}`);
      }
    });

    // ── 1. 登入 ─────────────────────────────────────────────
    await page.goto("/login");
    await expect(page.getByText("FocusFlow")).toBeVisible();

    await page.getByPlaceholder("you@example.com").fill(TEST_EMAIL);
    await page.getByPlaceholder("至少 6 個字元").fill(TEST_PASSWORD);
    await page.locator("form").getByRole("button", { name: "登入" }).click();

    // 登入成功後導向首頁
    await expect(page).toHaveURL("/", { timeout: 10000 });

    // ── 2. 開始番茄鐘 ────────────────────────────────────────
    const startButton = page.getByRole("button", { name: /Start/ });
    await expect(startButton).toBeVisible();

    const startedAt = new Date();
    await startButton.click();

    // 等待計時開始（至少 1 秒，確保 sessionStartedAt 已記錄）
    await page.waitForTimeout(1500);

    // ── 3. 按提早結束 ────────────────────────────────────────
    const interruptButton = page.getByRole("button", { name: /提早結束/ });
    await expect(interruptButton).toBeVisible();
    await interruptButton.click();

    // 按下後按鈕應消失（timer 已 reset）
    await expect(interruptButton).not.toBeVisible({ timeout: 3000 });

    // 等待 Supabase 寫入完成
    await page.waitForTimeout(3000);

    // ── 4. 驗證 Supabase 紀錄 ───────────────────────────────
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.auth.signInWithPassword({ email: TEST_EMAIL, password: TEST_PASSWORD });

    const { data, error } = await supabase
      .from("pomodoro_sessions")
      .select("*")
      .eq("status", "completed")
      .gte("started_at", startedAt.toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    // debug：印出查詢結果方便排查
    console.log("Supabase query error:", error);
    console.log("Supabase query data:", data);
    console.log("startedAt filter:", startedAt.toISOString());

    expect(error, `Supabase 查詢錯誤: ${JSON.stringify(error)}`).toBeNull();
    expect(data, "找不到 session 紀錄，請確認 pomodoro_sessions table 已建立且 RLS INSERT policy 已設定").toHaveLength(1);

    const session = data![0];
    expect(session.status).toBe("completed");
    expect(session.duration_min).toBeGreaterThanOrEqual(1);
    expect(session.started_at).toBeTruthy();
    expect(session.ended_at).toBeTruthy();

    expect(new Date(session.ended_at).getTime()).toBeGreaterThan(
      new Date(session.started_at).getTime()
    );

    await supabase.auth.signOut();
  });
});
