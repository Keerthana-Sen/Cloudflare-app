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

## Notes / known quirks encountered while building

- `vite.config.ts` **must** be named `.ts`, not `.tsx` — Vite silently mishandles the latter, which caused WebSocket connections to fail with no server-side error at all.
- The `agents` + `@cloudflare/ai-chat` packages have a known bug ([cloudflare/agents#1356](https://github.com/cloudflare/agents/issues/1356)) where `useAgent()`'s `getHttpUrl()` returns an empty string before the WebSocket connects, which crashes `useAgentChat()`. Worked around by patching `getHttpUrl` with a fallback URL before it's used.
- Durable Object binding `name` must exactly match the exported class name for `routeAgentRequest` to route correctly.
- `wrangler.jsonc`'s `assets` config needs `"run_worker_first": ["/agents/*"]` so WebSocket/agent routes aren't intercepted by static asset serving.

## Prompt history

See `PROMPT_HISTORY.md` for the AI-assisted development log, as required by the assignment.