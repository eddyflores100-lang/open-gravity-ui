# Project status

## What this repository is

OpenGravity UI is a Next.js operator dashboard and API workspace that complements the separate OpenGravity scoring engine. It contains a browser dashboard, chat streaming, speech synthesis, startup simulation routes, research routes, and server-side data-management APIs.

## What is implemented in the repository

| Area | Evidence in source | Notes |
|---|---|---|
| Dashboard shell | `src/app/page.tsx` | Some KPI and marketplace skill values are static demonstration data |
| Startup simulation | `src/app/predict/page.tsx`, `/api/predict`, `/api/predict/status` | Queued workflow with Upstash rate limiting |
| Streaming chat | `/api/chat` | Provider-backed; now input-limited and IP-rate-limited |
| Speech synthesis | `/api/tts` | Edge TTS with optional OpenAI fallback; input and rate limits added |
| Deep research | `/api/research` | Provider-backed; request size and rate limits added |
| Knowledge/files/cron/skills/ingest/stats | `src/app/api/*` | Server-to-server routes require the admin bearer key |
| Provider diagnostics | `/api/diag` | Requires a separate diagnostic bearer token and Cloudflare credentials |
| Redis persistence | `src/lib/storage.ts` | Upstash Redis REST is the active storage adapter |
| Firebase | `src/lib/firebaseAdmin.ts` | Legacy stub; not the active storage backend |
| Simulation tests | `src/lib/simulation_runner.test.ts` | Vitest suite |

## Known limitations

- The dashboard does not contain a user login or account-management flow. Restrict the entire deployment with Vercel Deployment Protection, Cloudflare Access or an equivalent identity-aware gateway.
- Demo counters, sample leads and marketplace skill entries must not be represented as verified production telemetry.
- The repository contains agent/tool adapters that require provider configuration and operational review. Presence of an endpoint or UI card does not prove an external integration is active.
- The main OpenGravity engine and this dashboard are separate repositories; compatibility should be verified against a tagged engine release before a combined deployment.
- No explicit license file is present in this repository.

## Before a public deployment

1. Configure Redis, provider keys and unique admin/diagnostic secrets.
2. Put the complete dashboard behind an identity-aware access layer.
3. Verify every admin route requires the bearer key and that keys never enter browser bundles.
4. Test rate limiting with Redis enabled and review upstream provider quotas.
5. Replace demonstration values with authenticated, auditable data sources.
6. Run the full CI matrix and a deployment smoke test.
7. Publish privacy, data-retention, support and incident-response documentation appropriate to the actual deployment.
