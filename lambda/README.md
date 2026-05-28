# TROY Sandbox — Lambda Functions

All cloud-save backend code for the TROY Sandbox lives here. Each subdirectory
is one AWS Lambda function. Each function is **self-contained in a single
`index.js` file** so it can be deployed by copy-paste into the AWS Console —
no `npm install`, no build step, no Lambda Layers.

## Why self-contained?

The TROY Sandbox AWS deployment is intentionally manual via the AWS Console
(see `docs/AWS-DEPLOYMENT-GUIDE.md` for the reasoning). Lambda functions
deployed by copy-paste must include all their code in one file because the
inline editor doesn't support multi-file packages.

AWS SDK v3 is pre-installed in the Node.js 22.x runtime, so `@aws-sdk/*`
imports work without `npm install`.

## Directory structure

```
lambda/
├── README.md                       # This file
├── save-template/
│   ├── index.js                   # Handler code (copy into Lambda console)
│   ├── policy.json                # IAM policy to attach to function's execution role
│   └── config.json                # Function URL CORS + env vars + memory/timeout settings
├── list-templates/
├── get-template/
├── delete-template/
└── presign-images/
```

## Common conventions across all functions

Every Lambda follows the same patterns. **If you change one, change all of
them to stay consistent.**

### Environment variables (set per function in the console)

| Var | Used by | Value |
|---|---|---|
| `TEMPLATES_TABLE` | save, list, get, delete | `TroySandbox_Templates` |
| `IMAGES_BUCKET` | delete, presign | `troy-sandbox-images.vpmdevtech.com` |
| `SANDBOX_KEY` | all | The shared API key (long random string) |
| `ALLOWED_ORIGIN` | all | `https://visionpointmarketing.github.io` (or fork for dev) |

### Headers expected from the client

| Header | Value |
|---|---|
| `X-Sandbox-Key` | Must match env var `SANDBOX_KEY`. Validated inside the handler. |
| `Content-Type` | `application/json` for POST bodies |

### Response shape

Success: `{ statusCode: 200, body: JSON.stringify({...payload}) }`
Failure: `{ statusCode: 4xx/5xx, body: JSON.stringify({ error: { code, message } }) }`

Common error codes:
- `unauthorized` — missing or invalid X-Sandbox-Key (401)
- `bad_request` — missing/invalid input (400)
- `not_found` — template or share doesn't exist (404)
- `internal` — server error (500)

### Helpers duplicated in every handler

Each `index.js` contains identical small helper functions at the top:

- `requireKey(event)` — throws if `X-Sandbox-Key` doesn't match
- `cors()` — returns standard CORS response headers
- `ok(body)` / `bad(message)` / `unauth()` / `notFound()` / `serverError()` — response builders

These are intentionally duplicated rather than centralized in a Layer to keep
each function deployable as a single copy-paste.

## Deploying a single function

See `docs/AWS-DEPLOYMENT-GUIDE.md` for the full first-time deployment walk.

For updates to an already-deployed function:

1. Open the function in the Lambda Console
2. Replace the contents of `index.mjs` with the contents of this directory's `index.js`
3. Click **Deploy**
4. Test via the Test tab using the sample event in `lambda/<function>/test-event.json` (if present)

## Updating IAM policies

The `policy.json` in each directory is the **inline policy** attached to that
function's execution role. To update:

1. IAM Console → Roles → `troy-sandbox-lambda-<function-name>`
2. Add inline policy → JSON tab → paste contents of `policy.json` → Save

Each function has its own role with least-privilege scope. Roles do NOT share
across functions.

## Future Claude: read this before changing anything

If you are a future Claude instance asked to modify these functions, the
authoritative reference for the cloud architecture is `docs/CLOUD-IMPLEMENTATION.md`.
It explains:

- Why every design choice was made (helpers inline, self-contained, no CDK, etc.)
- How the client side calls these functions
- Where every name lives (table names, bucket name, function names, IAM role names)
- What changes when you add a new endpoint (data model, client module, this README, deployment guide, runbook all need updates)

Do not introduce build steps, Layers, or multi-file packages without first
reading `docs/CLOUD-IMPLEMENTATION.md` and confirming with the user. The
single-file constraint is deliberate.
