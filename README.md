# 🍅 Pomodoro Timer

A personal pomodoro timer I built to experiment with a new AI-assisted design workflow — using Claude to define requirements, generate Lovable prompts, and iterate on UI direction before writing any code.

Built for my own daily use. No accounts, no sync, just a fast and focused timer that lives on my phone's home screen.

## About this project

This started as an experiment: how far can you get in product design by talking through decisions with an AI before opening a code editor?

The workflow went roughly —

1. **Claude** — talked through feature scope, generated the MVP spec, defined component structure and TypeScript types, and produced a full Lovable prompt with design specs and animation details
2. **Lovable** — scaffolded the entire project from the prompt, handled the React/PWA setup and initial UI
3. **Claude Code** — used for iterating on logic, fixing edge cases, and refining behaviour after the initial generation

The whole thing from first conversation to working PWA took a single session. The AI tools handled the scaffolding; I just made the decisions.

## Features

- Focus / Short Break / Long Break modes with customizable durations
- Task list with estimated vs actual pomodoro tracking
- Daily and weekly stats
- Sound alert on timer end
- Browser tab countdown
- PWA — installable on mobile, works offline

## Usage

This is a personal tool and not actively maintained as an open source project. Feel free to fork it and adapt it for your own use.
