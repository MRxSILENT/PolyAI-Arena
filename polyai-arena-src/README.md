# PolyAI Arena

> Multi-model AI chat and battle arena — inspired by Arena.ai

Compare AI models side by side, vote for the best response, and track rankings on the leaderboard.

## Features

- **Chat** — single model conversation
- **Battle** — two models answer the same question in parallel, you vote
- **Leaderboard** — Elo-ranked model comparison table

## Quick Start

```bash
# Install
npm install

# Add your Anthropic key
cp .env.example .env
# Edit .env → VITE_ANTHROPIC_KEY=sk-ant-...

# Run
npm run dev
# Open http://localhost:5173
```

## Deploy

```bash
npm install -g vercel
vercel
# Add VITE_ANTHROPIC_KEY in Vercel dashboard → Settings → Environment Variables
```

## Stack

- React 18 + Vite
- Anthropic Claude API (via `/api/anthropic` proxy)
- Zero external UI dependencies

## License

MIT
