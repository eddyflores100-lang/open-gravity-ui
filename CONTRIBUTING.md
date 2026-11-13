# Contributing to OpenGravity UI

## Requirements

- Node.js 22.12 or newer
- npm 10 or newer
- Upstash Redis for runtime API smoke tests

## Local setup

```bash
npm ci
cp .env.example .env.local
npm run dev
```

## Validation

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## Pull request checklist

- [ ] TypeScript validation passes.
- [ ] ESLint passes.
- [ ] Vitest suite passes.
- [ ] Production build passes.
- [ ] No secrets or real customer data are committed.
- [ ] Admin endpoints keep their bearer-key guard.
- [ ] Provider-backed routes preserve input limits and rate limits.
- [ ] Documentation distinguishes demo values from verified live data.

Do not add secrets to browser code or weaken admin API checks to make a local demo easier.
