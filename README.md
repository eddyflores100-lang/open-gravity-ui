# OpenGravity UI

[![CI](https://github.com/eddyflores100-lang/open-gravity-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/eddyflores100-lang/open-gravity-ui/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-000?logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-22.12%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)

**OpenGravity UI** is a private operator-dashboard prototype for the OpenGravity agent workspace. It combines a command-center interface with Next.js API routes for streaming chat, speech, research, startup simulation, knowledge storage, files, skills and scheduled jobs.

> **Product status: prototype / operator workspace.** Some dashboard counters, lead information and marketplace skill cards are initialized with demonstration data. They are not live operational telemetry. The UI has no built-in user login screen; protect any deployment with an identity-aware access layer. Do not expose it as a public multi-user service until the remaining controls in [the security model](docs/SECURITY_MODEL.md) are implemented.

## Relationship to the OpenGravity engine

This repository contains the Next.js dashboard and its API workspace. The separate [OpenGravity engine repository](https://github.com/eddyflores100-lang/OpenGravity) contains the core due-diligence scoring engine, its Python API and the primary project methodology. The two repositories should be versioned and deployed independently unless an integration release explicitly links them.

## Interface and API capabilities

| Area | Route / module | Current role |
|---|---|---|
| Operator dashboard | `/` | Command-center interface; several KPI cards and skill entries are demo values |
| Startup simulation UI | `/predict` | Starts a queued simulation and polls its job status |
| Streaming assistant | `POST /api/chat` | Streams provider output; 30 requests/minute per IP |
| Speech synthesis | `POST /api/tts` | Microsoft Edge TTS with optional OpenAI fallback; 10 requests/minute per IP |
| Startup simulation | `POST /api/predict` | Validates input, rate-limits and queues a job; 5 requests/minute per IP |
| Simulation status | `GET /api/predict/status` | Validates UUID and returns job state; 120 requests/minute per IP |
| Research | `POST /api/research` | Parallel research workflow; 3 requests/minute per IP |
| Health | `GET /api/health` | Reports service liveness and whether Redis configuration is present |
| Admin files / knowledge / cron / skills / ingest / stats | `/api/files`, `/api/knowledge`, `/api/cron`, `/api/skills`, `/api/ingest`, `/api/stats` | Server-to-server endpoints protected by `OPEN_GRAVITY_ADMIN_KEY` |
| Provider diagnostics | `GET /api/diag` | Disabled unless an `OPEN_GRAVITY_DIAG_TOKEN` and Cloudflare credentials are configured |

## Stack

- Next.js 16.1.6, React 19 and TypeScript
- Tailwind CSS 3, Framer Motion and Lucide
- Upstash Redis for persistence, queues and IP-based rate limits
- DeepSeek for research synthesis/persona generation
- Tavily for web research
- Microsoft Edge Neural TTS, with optional OpenAI TTS fallback
- Vitest for deterministic Monte Carlo simulation tests
- Docker multi-stage build using Next.js standalone output

The repository still contains legacy Firebase dependencies and a compatibility module; the current storage adapter is Upstash Redis. Do not assume Firebase is an active persistence backend.

## Requirements

- Node.js 22.12 or newer
- npm 10 or newer
- An Upstash Redis REST database for persistence, queues and rate limits

Optional providers:
- DeepSeek API key for AI synthesis
- Tavily API key for research
- OpenAI API key for fallback speech synthesis
- Cloudflare account ID and API token only if using the protected diagnostic endpoint

## Local setup

```bash
git clone https://github.com/eddyflores100-lang/open-gravity-ui.git
cd open-gravity-ui
npm ci
cp .env.example .env.local
```

Fill the required values in `.env.local`, then run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `UPSTASH_REDIS_REST_URL` | Yes | Redis REST endpoint for storage, queues and rate limits |
| `UPSTASH_REDIS_REST_TOKEN` | Yes | Server-side Redis credential |
| `OPEN_GRAVITY_ADMIN_KEY` | For admin APIs | Bearer key for files, knowledge, cron, skills, ingest and stats |
| `OPEN_GRAVITY_DIAG_TOKEN` | For diagnostics | Separate bearer key for `/api/diag` |
| `DEEPSEEK_API_KEY` | Optional | Research/persona synthesis |
| `TAVILY_API_KEY` | Optional | Web research |
| `OPENAI_API_KEY` | Optional | TTS fallback |
| `CLOUDFLARE_ACCOUNT_ID` | Diagnostics only | Cloudflare account used by protected diagnostics |
| `CLOUDFLARE_API_TOKEN` | Diagnostics only | Least-privilege Cloudflare token used by protected diagnostics |

Generate unique admin and diagnostic secrets; do not reuse provider tokens. Keep all secrets in server-side environment variables. Never use a `NEXT_PUBLIC_*` prefix for secret values.

## Quality checks

```bash
npm ci
npm run typecheck
npm run lint
npm run test
npm run build
```

The Vitest suite exercises deterministic Monte Carlo behavior, including reproducibility, economic ordering, edge cases and runtime bounds. CI runs the same checks on Node 22 and 24 and audits dependencies for high-severity vulnerabilities.

## Docker

```bash
docker build -t open-gravity-ui .
docker run --rm -p 3000:3000 --env-file .env.local open-gravity-ui
```

The Docker build uses `npm ci` and Next.js standalone output. Environment files are excluded from the build context; inject secrets at runtime.

## Security and deployment

- The dashboard itself does not implement user login. Put the entire deployment behind Vercel Deployment Protection, Cloudflare Access or an equivalent identity-aware gateway.
- Admin data APIs require `Authorization: Bearer $OPEN_GRAVITY_ADMIN_KEY`; diagnostic calls use the separate `OPEN_GRAVITY_DIAG_TOKEN`.
- Chat, TTS, research and simulation routes have Upstash IP rate limits. Redis must be configured for those controls to operate.
- The diagnostic endpoint no longer embeds Cloudflare credentials and does not return provider response bodies or token previews.
- Health responses expose only a boolean configuration state, not account IDs, key presence details or internal errors.
- The dashboard still contains demo counters/skills. Do not interpret these as verified metrics or active external integrations.

Read [SECURITY.md](SECURITY.md), [the security model](docs/SECURITY_MODEL.md), [deployment notes](docs/DEPLOYMENT.md) and [CONTRIBUTING.md](CONTRIBUTING.md) before deploying or contributing.

## Repository links

- [OpenGravity UI source](https://github.com/eddyflores100-lang/open-gravity-ui)
- [Issues](https://github.com/eddyflores100-lang/open-gravity-ui/issues)
- [Pull requests](https://github.com/eddyflores100-lang/open-gravity-ui/pulls)
- [Releases](https://github.com/eddyflores100-lang/open-gravity-ui/releases)
- [OpenGravity engine](https://github.com/eddyflores100-lang/OpenGravity)

## License

No `LICENSE` file is currently present in this repository. Do not assume the code is open-source or redistribute it until the maintainer publishes an explicit license.
