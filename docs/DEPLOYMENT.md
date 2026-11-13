# Deployment guide

## Prerequisites

- Node.js 22.12+ and npm 10+
- Upstash Redis REST URL and token
- Unique admin and diagnostic bearer secrets
- Provider credentials only for integrations that will actually be enabled

## Local production build

```bash
npm ci
npm run check
npm run build
npm run start
```

## Docker

```bash
docker build -t open-gravity-ui .
docker run --rm -p 3000:3000 --env-file .env.local open-gravity-ui
```

The image uses Next.js standalone output. The Docker build context excludes local environment files. Supply secrets at container runtime; never bake them into image layers.

## Access gateway

Before publishing a URL, enable Vercel Deployment Protection, Cloudflare Access or an equivalent identity-aware gateway for the entire site, including API paths. The app has no first-party user login screen.

## Post-deploy checks

- Confirm `GET /api/health` reports `storageConfigured: true`.
- Verify `/api/diag` returns 404 without the diagnostic bearer token.
- Verify admin routes return 401 without the admin bearer token.
- Verify chat, TTS, research and predict requests are rate-limited through Upstash.
- Check that the dashboard demo values are clearly labelled as samples.
