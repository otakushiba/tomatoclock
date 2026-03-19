## 專案名稱
Tomatoclock — 個人番茄鐘 + 個人檔案記錄

## 技術棧
- React + Vite
- Supabase（資料庫 + auth）
- Tailwind CSS
- Vercel（部署）

## Supabase Tables
- profiles（個人資料）
- pomodoro_sessions（每顆番茄的紀錄）
- pomodoro_daily_summary（每日摘要）

## 規範
- 所有資料操作透過 supabase-js client
- RLS 已開啟，每個 user 只能存取自己的資料
- env 變數放在 .env.local，不要 hardcode
- 不要動 Lovable 產生的 UI 結構，只在上面加功能

## 環境變數
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY