# AI Chat Agent — Cloudflare Workers

A chat application built on Cloudflare's stack, using the Agents SDK, Workers AI, and Durable Objects for persistent conversation state.

**Live demo:** https://cloudflare-app.keesen23.workers.dev

## What this satisfies

This project was built for Cloudflare's AI-powered application assignment, which requires four components:

| Requirement | Implementation |
|---|---|
| LLM | Glm-4.7-flash (`@cf/zai-org/glm-4.7-flash`) via Workers AI |
| Workflow / coordination | `ChatAgent` — a Durable Object built on Cloudflare's Agents SDK (`AIChatAgent`) |
| User input | React chat UI, served via Vite, communicating over WebSocket |
| Memory / state | Conversation history persisted in the Durable Object, survives page refreshes |

## Tech stack

- **Cloudflare Workers** — compute runtime
- **Workers AI** — hosted LLM inference
- **Durable Objects** (via `agents` SDK's `AIChatAgent`) — stateful, single-instance conversation agent
- **Vite + `@cloudflare/vite-plugin`** — combined local dev server for the Worker and frontend
- **React** — chat UI
- **`ai` / `workers-ai-provider` / `@cloudflare/ai-chat`** — model calling and chat state/streaming glue

## Project structure

```
├── index.html            # Vite entry point (#root div)
├── src/
│   ├── client.tsx        # React chat UI
│   └── server.ts         # Worker entry + ChatAgent (Durable Object)
├── vite.config.ts        # Vite + Cloudflare + React plugin config
├── wrangler.jsonc        # Cloudflare bindings (AI, Durable Object, assets)
└── package.json
```

## Running locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. This runs Vite and the Worker together in one process (via `@cloudflare/vite-plugin`), including live Workers AI calls (Workers AI runs remotely even in local dev).

## Deploying

```bash
npm run deploy
```

Builds the client and Worker, then deploys via Wrangler.

## Prompt history

See `PROMPT_HISTORY.md` for the AI-assisted development log, as required by the assignment.
