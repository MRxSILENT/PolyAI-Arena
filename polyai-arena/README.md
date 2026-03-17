# PolyAI Arena

> Benchmark and compare AI models side by side — inspired by arena.ai

## Features
- 💬 **Chat** — single model chat with Claude, GPT-4o, Gemini and more
- ⚔️ **Battle** — two models answer the same prompt simultaneously, vote for the best
- 🏆 **Leaderboard** — Elo-ranked table updated from battle votes

## Quick Start

```bash
# 1. Install
npm install

# 2. Add your API key
cp .env.example .env
# edit .env — paste your Anthropic key

# 3. Run
npm run dev
# open http://localhost:5173
```

## Deploy to Vercel

```bash
npm install -g vercel
vercel
# add VITE_ANTHROPIC_KEY in Vercel dashboard → Settings → Environment Variables
```

## Stack
- React 18 + Vite
- Anthropic Claude API
- Zero external UI libraries

## License
MIT
