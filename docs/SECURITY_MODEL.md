# Security model and deployment boundaries

## Dashboard access

There is no first-party user login in this repository. The dashboard must be placed behind an identity-aware access gateway before public exposure. `noindex` metadata and browser security headers are defense-in-depth, not authentication.

## API classes

### Public, rate-limited user flows

- `POST /api/chat`: 30 requests per minute per IP; accepts at most 20 messages, with user/assistant roles and bounded content.
- `POST /api/tts`: 10 requests per minute per IP; input limited to 2,000 characters.
- `POST /api/research`: 3 requests per minute per IP; topic and context sizes are bounded.
- `POST /api/predict`: 5 requests per minute per IP; validation occurs before queueing.
- `GET /api/predict/status`: 120 requests per minute per IP and UUID validation.

Rate limits require Upstash Redis. If Redis is unavailable, these routes should be treated as unavailable rather than as unmetered fallback services.

### Server-to-server admin APIs

Files, knowledge, cron jobs, skills, ingest and stats require:
`Authorization: Bearer $OPEN_GRAVITY_ADMIN_KEY`.

Do not put this key in the browser or a `NEXT_PUBLIC_*` variable. The dashboard currently has no login flow that can safely provide it to browser code.

### Provider diagnostics

`GET /api/diag` requires `Authorization: Bearer $OPEN_GRAVITY_DIAG_TOKEN` and server-side Cloudflare credentials. The route no longer contains a hardcoded provider token and does not return raw provider response bodies.

## Storage and providers

- Upstash Redis stores files, knowledge, messages and jobs. Use a dedicated database and rotate its REST token if exposed.
- DeepSeek and Tavily keys are server-side only.
- OpenAI is an optional speech fallback.
- Cloudflare credentials are used only by the protected diagnostic route.

## Remaining requirements

- Add first-party authentication and server-side ownership checks if this becomes a multi-user service.
- Add tests for admin-route authorization and rate-limit behavior.
- Add deletion, retention, audit and privacy controls for stored files and knowledge.
- Verify tool adapters and external connectors before enabling them in production.
- Keep the entire operator UI behind an access gateway until those controls are complete.
