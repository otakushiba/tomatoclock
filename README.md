# Tomatoclock

A personal Pomodoro timer with project & task management, built to explore an AI-assisted development workflow.

## Tech Stack

- **React + Vite** — frontend framework and build tool
- **Supabase** — auth, database, and Row Level Security
- **Tailwind CSS** — utility-first styling
- **Vercel** — deployment with automatic preview on every push

## Features

- **Pomodoro Timer** — Focus / Short Break / Long Break modes with customizable durations
- **Project & Task Management** — organize tasks under projects, track estimated vs actual pomodoros
- **Personal Profile** — user auth with per-account data sync via Supabase
- **Statistics Report** — daily and weekly session summaries
- PWA support — installable on mobile home screen

## Design Process

1. **Lovable** — used for rapid UI prototyping; scaffolded the React/PWA structure and initial component layout from a single prompt
2. **Claude Code (in VS Code)** — handled all logic, Supabase integration, and iterative refinement after the initial generation
3. **Supabase** — connected for auth, profile storage, and pomodoro session data with RLS enabled per user
4. **Vercel** — deployed with automatic preview deployments on every push
5. **GitHub branching** — `dev` branch for active development, `main` for production releases

The workflow went from concept to working PWA in a single session. AI tools handled the scaffolding; decisions stayed with me.

## Run Locally

```bash
# Clone the repo
git clone https://github.com/otakushiba/tomatoclock.git
cd tomatoclock

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# Start dev server
npm run dev
```
