# Security policy

## Reporting

Report suspected vulnerabilities privately using GitHub's **Report a vulnerability** feature under the repository's Security tab. Do not publish API keys, Redis tokens, diagnostic bearer tokens, customer data or exploit details in public issues.

Include the affected route/file, impact, a minimal reproduction with synthetic data, and the commit or release.

## Deployment boundary

This repository is an operator dashboard and does not implement end-user authentication. Deploy it only behind Vercel Deployment Protection, Cloudflare Access or an equivalent identity-aware gateway until a first-party login flow exists.

## Secret handling

- Keep Upstash, DeepSeek, Tavily, OpenAI, Cloudflare and admin keys in server-side environment variables.
- Never prefix secret values with `NEXT_PUBLIC_`.
- Rotate any credential that has ever been committed to Git history; removing it from the current source does not revoke old copies.
- The admin APIs require `Authorization: Bearer $OPEN_GRAVITY_ADMIN_KEY`.
- The diagnostic route uses a separate `OPEN_GRAVITY_DIAG_TOKEN`.

## API protections

Chat, TTS, research and prediction endpoints use Upstash IP rate limits. Admin data-management routes require a server-to-server key. These controls do not replace identity-aware protection for the entire dashboard or provider-side quotas.

No response-time SLA is promised for this repository.
