# Cloud Save & Share — Implementation Source of Truth

**Status:** Phase 1 (Cloud Save & Library) — code complete, awaiting AWS deployment
**Last updated:** May 2026
**Companions:**
- [`AWS-DEPLOYMENT-GUIDE.md`](./AWS-DEPLOYMENT-GUIDE.md) — step-by-step console deployment
- [`AWS-RUNBOOK.md`](./AWS-RUNBOOK.md) — operational tasks (rotation, debugging, teardown)
- [`CLOUD-STORAGE-PLAN.md`](./CLOUD-STORAGE-PLAN.md) — original planning doc (Dave-approved architecture)

This document is the **authoritative reference** for what was built, where
each piece lives, why it was built that way, and what to consult when changing
things. Future Claude instances and human engineers should start here.

---

## What this feature does

TROY Sandbox is a browser-based landing-page builder. Before this feature, all
saved templates lived in browser `localStorage`, scoped to a single device,
and **images were stripped from saved templates** because localStorage can't
hold base64 image blobs at scale. The cloud feature adds:

1. **Cloud Save.** A user can save the current canvas to a shared cloud
   library, **with images intact**.
2. **Cloud Library.** A list of every template saved against this sandbox,
   accessible to anyone using the editor with the right API key. Open from
   any device.
3. **Single sandbox-wide API key.** No user accounts. Anyone with the editor
   URL and the key can save, list, modify, and delete templates. Trust model
   per Dave Olsen's review.

**Phase 2 (Share Links) and Phase 3 (folders, autosave, etc.) are not yet
built.** Endpoint placeholders for Phase 2 exist in `js/cloud-config.js` but
the Lambdas don't exist.

---

## Architecture at a glance

```
┌──────────────────────────────────┐
│  Browser (GitHub Pages editor)   │
│  ───────────────────────────     │
│  js/cloud-storage.js  ──┐        │
│  js/cloud-config.js   ──┘        │
│  (key is embedded in config)     │
│           │                      │
│           │ HTTPS + X-Sandbox-Key│
│           ▼                      │
└───────────┼──────────────────────┘
            │
            │
┌───────────▼──────────────────────────────────────────────────┐
│  AWS (us-east-1, account 831326375124, "breon" alias)        │
│                                                              │
│  Lambda Function URLs (1 per function — no API Gateway)      │
│   ├── troySandboxSaveTemplate    (POST)                      │
│   ├── troySandboxListTemplates   (GET)                       │
│   ├── troySandboxGetTemplate     (GET)                       │
│   ├── troySandboxDeleteTemplate  (DELETE)                    │
│   └── troySandboxPresignImages   (POST)                      │
│                                                              │
│  DynamoDB tables                                             │
│   └── TroySandbox_Templates   PK=sandboxId, SK=templateId    │
│       (TroySandbox_Shares — Phase 2, not built)              │
│                                                              │
│  S3 bucket                                                   │
│   └── troy-sandbox-images.vpmdevtech.com                     │
│       sandboxes/{sandboxId}/templates/{templateId}/images/   │
│                                                              │
│  IAM execution roles (one per Lambda, least-privilege)       │
│   ├── troy-sandbox-lambda-saveTemplate                       │
│   ├── troy-sandbox-lambda-listTemplates                      │
│   ├── troy-sandbox-lambda-getTemplate                        │
│   ├── troy-sandbox-lambda-deleteTemplate                     │
│   └── troy-sandbox-lambda-presignImages                      │
└──────────────────────────────────────────────────────────────┘
```

No API Gateway, no Cognito, no user accounts, no Lambda Layers, no CDK.

---

## File map — what lives where

### New files

| File | Role |
|---|---|
| `lambda/README.md` | Lambda directory conventions; entry point for future Lambda edits |
| `lambda/save-template/index.js` | Handler — saves or updates a template in DynamoDB |
| `lambda/save-template/policy.json` | IAM inline policy for this function's role |
| `lambda/save-template/config.json` | Console-configurable settings (env vars, CORS, memory, timeout) |
| `lambda/list-templates/*` | Handler + policy + config for list endpoint |
| `lambda/get-template/*` | Handler + policy + config for get endpoint |
| `lambda/delete-template/*` | Handler + policy + config for delete endpoint (also cleans S3) |
| `lambda/presign-images/*` | Handler + policy + config for presigned-URL endpoint |
| `js/cloud-config.js` | Endpoint URLs (filled after deploy), sandboxId, **embedded SANDBOX_API_KEY**, getCloudKey/setCloudKey/etc. |
| `js/cloud-storage.js` | API client — mirrors `template-storage.js` shape; orchestrates image uploads |
| `docs/CLOUD-IMPLEMENTATION.md` | **This file** — source of truth |
| `docs/AWS-DEPLOYMENT-GUIDE.md` | Step-by-step console deployment instructions |
| `docs/AWS-RUNBOOK.md` | Operational tasks: rotation, debugging, teardown |

### Modified files (additive changes; behavior unchanged when cloud is not configured)

| File | What changed |
|---|---|
| `index.html` | Added Cloud/Local toggle inside the Save Template modal |
| `js/state.js` | Added `cloudTemplateId` field + `getCloudTemplateId`/`setCloudTemplateId`; cleared on `init`, `clear`, `fromJSON`, and `loadTemplate` (unless `loadTemplate` is given a `cloudTemplateId` option) |
| `js/save-template-modal.js` | Modal callback now receives `(name, destination)`; added `setSaving()` helper for async cloud-save spinner; toggle is hidden when cloud isn't connected |
| `js/ui.js` | Added Cloud Library section in the templates popover; rewrote Save Current Page handler to route between cloud and local based on destination |
| `js/app.js` | **No changes.** Cloud features bootstrap lazily through the templates popover and the cloud-key modal builds itself on first open |

### Files we explicitly did NOT touch

`js/canvas.js`, `js/sections/*`, `js/design-rules.js`, `js/color-config.js`,
`js/color-tokens.js`, `js/markup-exporter.js`, `js/image-store.js`,
`js/preview-iframe.js`, `js/screenshot-exporter.js`, `js/image-upload-modal.js`,
`js/page-templates.js`, `js/template-storage.js`, `js/utils.js`, `assets/*`,
`styles/*`, `static/*`, all section template files.

Section logic, rendering, design rules, image-handling primitives, and local
storage are independent of where data lives.

---

## Naming conventions — every name in one place

If you change a name, you must update it in **all** locations. The deployment
guide checks for these names; the runbook references them; the IAM policies
embed them as ARNs.

| Concept | Name | Defined in |
|---|---|---|
| Sandbox identifier (logical) | `troy` | `js/cloud-config.js` → `SANDBOX_ID` |
| DynamoDB templates table | `TroySandbox_Templates` | `lambda/*/policy.json` (resource ARN), `lambda/*/config.json` (env var), `docs/AWS-DEPLOYMENT-GUIDE.md` |
| DynamoDB shares table (Phase 2) | `TroySandbox_Shares` | — (not yet built) |
| S3 images bucket | `troy-sandbox-images.vpmdevtech.com` | `lambda/delete-template/*`, `lambda/presign-images/*`, `js/cloud-config.js` |
| S3 image key prefix | `sandboxes/{sandboxId}/templates/{templateId}/images/` | `lambda/presign-images/index.js`, `lambda/delete-template/index.js` |
| Lambda — save | `troySandboxSaveTemplate` | `lambda/save-template/config.json`, IAM logging policy ARN |
| Lambda — list | `troySandboxListTemplates` | `lambda/list-templates/config.json` |
| Lambda — get | `troySandboxGetTemplate` | `lambda/get-template/config.json` |
| Lambda — delete | `troySandboxDeleteTemplate` | `lambda/delete-template/config.json` |
| Lambda — presign | `troySandboxPresignImages` | `lambda/presign-images/config.json` |
| IAM execution role prefix | `troy-sandbox-lambda-<functionShortName>` | each `lambda/*/config.json` |
| Resource tag | `Project: troy-sandbox` | every `lambda/*/config.json` |
| CORS allowed origin | `https://visionpointmarketing.github.io` | `lambda/*/config.json` Function URL CORS, also `ALLOWED_ORIGIN` env var |
| Budget alert name | `Troy Sandbox Budget` | AWS Budgets console (created during deployment) |
| Embedded sandbox API key | `SANDBOX_API_KEY` constant in `js/cloud-config.js` | `js/cloud-config.js`; must match Lambda `SANDBOX_KEY` env var |
| Browser localStorage — manual key override (rare) | `troy-sandbox-cloud-key` | `js/cloud-config.js` → `KEY_STORAGE` (escape hatch only — embedded key is the normal path) |

---

## Data model

### DynamoDB: `TroySandbox_Templates`

Sandbox-scoped, single record per saved template.

```
Partition key:  sandboxId    string   e.g., "troy"
Sort key:       templateId   string   e.g., "tpl_aB3xQ7p2Kf9z"

Other fields:
  name              string         user-chosen, up to 100 chars
  sectionCount      number         count at save time
  sections          list           the sections[] array with image fields as S3 URLs
  createdAt         ISO timestamp  set on first save, preserved on updates
  updatedAt         ISO timestamp  updated on every save
  version           number         optimistic-concurrency counter, incremented on every save
```

Listing templates is a single `Query` on `sandboxId`. No GSI needed for MVP.

### DynamoDB: `TroySandbox_Shares` (Phase 2 — NOT yet built)

```
Partition key:  shareToken     string   10 random base62 chars
Fields:         sandboxId, templateId, createdAt, expiresAt, viewCount, revoked
```

### S3 bucket: `troy-sandbox-images.vpmdevtech.com`

Key structure: `sandboxes/{sandboxId}/templates/{templateId}/images/{imageId}.{ext}`

The `templateId` in the path lets `deleteTemplate` prefix-list-delete every
image for a template in one operation. (Note: this is a small departure from
the original plan doc which proposed `sandboxes/{sandboxId}/images/` without
the templateId segment. The templateId-scoped path makes deletes clean.)

`imageId` format: `img_<sanitizedSectionId>_<sanitizedField>_<6 base62 chars>`.
Generated by the client in `js/cloud-storage.js` so the same section field on
re-upload doesn't collide.

`{ext}` is derived server-side from the `Content-Type`:
`png/jpg/webp/gif/svg`. Anything else is rejected at presign time.

Files are served via direct S3 HTTPS URLs:
`https://troy-sandbox-images.vpmdevtech.com.s3.us-east-1.amazonaws.com/{key}`.
CloudFront is not used (MVP).

---

## API contract

Each endpoint is a separate Lambda Function URL. Each validates the
`X-Sandbox-Key` header. Each is CORS-locked to
`https://visionpointmarketing.github.io`. Errors return JSON
`{ error: { code, message } }`.

### POST /save-template

Headers: `X-Sandbox-Key`
Body:
```json
{
    "sandboxId":    "troy",
    "templateId":   "tpl_aB3xQ7p2Kf9z",
    "name":         "Spring Open House Landing",
    "sectionCount": 5,
    "sections":     [ {...}, {...}, ... ]
}
```
Returns:
```json
{ "templateId": "tpl_aB3xQ7p2Kf9z", "updatedAt": "2026-05-28T13:00:00Z", "version": 1, "created": true }
```

`templateId` is client-generated (so images can upload before the row exists).
If `templateId` already exists for the sandbox, the function updates and
increments `version`; otherwise it inserts. `createdAt` is preserved across
updates.

### GET /list-templates?sandboxId=troy

Headers: `X-Sandbox-Key`
Returns (sorted by `updatedAt` desc, **metadata only**):
```json
[
    { "templateId": "tpl_xxx", "name": "Spring Open House", "sectionCount": 5,
      "createdAt": "2026-05-20T...", "updatedAt": "2026-05-28T...", "version": 3 },
    ...
]
```

### GET /get-template?sandboxId=troy&templateId=tpl_xxx

Headers: `X-Sandbox-Key`
Returns: full template record including `sections[]`.

### DELETE /delete-template?sandboxId=troy&templateId=tpl_xxx

Headers: `X-Sandbox-Key`
Returns: `{ "ok": true, "imagesDeleted": N }`

Deletes the DynamoDB row first (source of truth), then best-effort deletes
every S3 object under `sandboxes/{sandboxId}/templates/{templateId}/`.
S3 cleanup errors are logged but do not fail the request.

### POST /presign-images

Headers: `X-Sandbox-Key`
Body:
```json
{
    "sandboxId":  "troy",
    "templateId": "tpl_aB3xQ7p2Kf9z",
    "images": [
        { "imageId": "img_section1_hero_qK7zXa", "contentType": "image/png", "size": 234567 },
        ...
    ]
}
```
Returns:
```json
[
    {
        "imageId":   "img_section1_hero_qK7zXa",
        "key":       "sandboxes/troy/templates/tpl_aB3.../images/img_section1_hero_qK7zXa.png",
        "uploadUrl": "https://...?signed",
        "cdnUrl":    "https://troy-sandbox-images.vpmdevtech.com.s3.us-east-1.amazonaws.com/..."
    },
    ...
]
```

Presigned PUT URLs expire in 5 minutes. Limits: up to 50 images per request,
each ≤ 10 MB. Allowed content types: png, jpeg, webp, gif, svg+xml.

---

## Authentication & trust model

**One API key per sandbox**, embedded in `js/cloud-config.js` and stored as
the `SANDBOX_KEY` env var on each Lambda. Sent by the client as the
`X-Sandbox-Key` request header on every request.

### Trust boundary

Anyone who **(a)** has the editor URL AND **(b)** views the served JS bundle
or extracts the key from a network request can save, list, modify, and
delete every template in the sandbox. There is no per-user identity, no
audit trail of who-did-what beyond CloudWatch request logs (which capture IP
only, not identity).

The realistic threat model for this internal Troy tool is:
- **Drive-by abuse** (random URL visitors): Low probability — the URL isn't
  advertised. If it happens, recovery is fast.
- **Determined attacker who knows the URL exists**: Same as any internal
  tool — they could ask anyone on the team for the key, or extract it from
  the deployed bundle.
- **Bots scanning github.io**: Possible but they'd need to also figure out
  the API endpoint structure and key.

Protection layers in place:
1. **CORS lock to `https://visionpointmarketing.github.io`** on every
   Function URL. Browser-based calls from other origins are blocked.
2. **DynamoDB Point-in-Time Recovery enabled** on `TroySandbox_Templates`,
   giving a 35-day rollback window. If abuse happens, recovery is a Console
   action, not a panic.
3. **Reserved concurrency on every Lambda** (5–10) — a hostile loop
   self-throttles instead of running up costs.
4. **The API key is rotatable in ~5 minutes** (see runbook).

### Why the key is committed instead of prompted

The original plan doc listed three options for key distribution:
(a) hardcode in repo (committed), (b) prompt user once and store in
localStorage, (c) inject at build time via GitHub Actions. Of these, (a)
was chosen for the deployed system because:

- The editor's UX intent is "anyone on the team visits the URL, saves a
  template, shares the library". Option (b)'s key-paste step on every
  device — and the need to coordinate the key when sharing with new
  collaborators — undermined that intent.
- Option (c) results in the same deployed bundle as (a) (key embedded in
  served JS) but adds a GitHub Actions workflow to maintain. For this
  team's manual deploy cadence, the workflow wasn't worth the complexity.
- The repo is public. Option (a) means the key is visible to anyone
  browsing GitHub. **Accepted** as a known trade-off — the URL is the
  meaningful access control for this internal tool, not the key.

**The `localStorage` override remains as an escape hatch.** Setting
`troy-sandbox-cloud-key` manually in DevTools overrides the embedded key,
useful for testing alternate keys or emergency overrides during a rotation
window. Production users never touch this.

**Why not Secrets Manager?** Server-side key is in Lambda env vars. For
single-key, infrequent-rotation, env var is operationally simpler. The
runbook documents migrating to Secrets Manager as a clean upgrade path if
rotation cadence ever increases.

**The Function URL is unauthenticated at the AWS layer** (`AuthType=NONE`).
The application-level `X-Sandbox-Key` check inside the handler is the only
gate. This is intentional per the plan doc — IAM Auth would require IAM
credentials in the browser, which we explicitly don't want.

---

## Client integration

```
┌────────────────────────────────────────────────────────────────┐
│  TROY Sandbox Editor (Vanilla JS ES modules)                   │
│                                                                │
│  Existing local flow (unchanged)                               │
│   js/template-storage.js  →  localStorage (no images)          │
│                                                                │
│  New cloud flow (additive, gated on cloud-config)              │
│   js/cloud-config.js (URLs + SANDBOX_API_KEY embedded)         │
│            │                                                   │
│            ▼                                                   │
│   js/cloud-storage.js  ──── fetch + X-Sandbox-Key header       │
│            │                                                   │
│            ▼                                                   │
│       AWS Lambdas                                              │
│                                                                │
│  Both flows feed the same UI                                   │
│   js/save-template-modal.js (now destination-aware)            │
│   js/ui.js (renders both Cloud Library and Your Templates)     │
│                                                                │
│  Section logic / canvas / rendering UNCHANGED                  │
│   js/state.js (added cloudTemplateId field only)               │
│   js/canvas.js (untouched)                                     │
│   js/sections/* (untouched)                                    │
└────────────────────────────────────────────────────────────────┘
```

### Decision tree at runtime

1. App boots → `state.init()` → empty canvas, `cloudTemplateId = null`.
2. User clicks **Templates** in toolbar → `ui.js#renderCloudSection()` runs:
   - `isCloudConfigured()` false (placeholders in `cloud-config.js`) → entire Cloud Library section is hidden. App behaves identically to pre-cloud. ✅
   - `isCloudConfigured()` true → list cloud templates via Lambda directly. **No "Connect" step** — the key is embedded in `cloud-config.js`.
3. User clicks **Save Current Page** → modal opens:
   - Cloud not configured → no toggle; local-only behavior (current).
   - Cloud configured → Cloud/Local toggle, defaults to Cloud.
4. On save:
   - Local → existing `template-storage.js` flow (synchronous).
   - Cloud → `cloud-storage.js#saveTemplate(name, sections, state.getCloudTemplateId())`:
     - Walk sections for `data:image/*` fields → presign → PUT to S3 → rewrite section JSON with S3 URLs → POST template to `saveTemplate` Lambda.
     - On success, `state.setCloudTemplateId(result.templateId)` so subsequent saves UPDATE this record.

### What "cloudTemplateId" does

This single field on `state` is the canvas's association with a cloud record.
It's set when:
- A cloud template is loaded (via `state.loadTemplate(sections, templates, { cloudTemplateId })`)
- A cloud save succeeds (via `state.setCloudTemplateId(result.templateId)`)

It's cleared (`= null`) when:
- The state is freshly initialized (`state.init()`)
- The canvas is cleared (`state.clear()`)
- A local or preset template is loaded (`state.loadTemplate(..., {})`)
- A JSON file is imported (`state.fromJSON(...)`)
- The associated cloud template is deleted

This is what makes Save-to-Cloud "feel like" an update vs always creating
duplicates. No cross-device sync — `cloudTemplateId` lives only in memory
during the editing session.

---

## Key design decisions

### 1. Self-contained Lambda functions (no Layer, no build step)

Each Lambda is a single `index.js` file. Helpers (CORS, key validation,
response builders) are duplicated across all 5 handlers. Trade-off chosen:

- ✅ Console deploy is copy-paste a single file
- ✅ No `npm install`, no Layer to manage, no version skew
- ❌ Helper duplication; changes have to be applied 5 times

Centralizing into a Layer would add deployment complexity that's not worth
it at this scale. The duplication is small (≈30 lines per file) and stable.

If the helper logic ever materially changes, the convention is: **change it
in `lambda/save-template/index.js` first, then mirror to the other four.**
The Lambda README repeats this.

### 2. Manual console deployment (no CDK)

The existing AWS account has zero CloudFormation stacks — every other VP
project was provisioned manually. Introducing CDK for this project would put
the maintenance burden on whoever inherits it, in a tool that's not used
anywhere else in the account.

Trade-off chosen:
- ✅ Consistent with how every other resource in the account was created
- ✅ No new tooling for the human owner to learn (Node, cdk-cli, TypeScript)
- ✅ Each console step is auditable in real time
- ❌ Replicating the setup (e.g., staging) is a click-fest, not a command

The `config.json` files per Lambda document every console-configurable
setting in machine-readable form. If a future Claude is ever asked to write
CDK for this, those files are the source of truth — translate them.

### 3. Sandbox API key in env var, not Secrets Manager

Considered Secrets Manager and recommended it during planning. Reversed for
implementation because:
- Single-key, low-rotation cadence → env var rotation is fine
- Each Lambda would need additional IAM (`secretsmanager:GetSecretValue`)
- Cold-start fetch from Secrets Manager adds latency

Migrating to Secrets Manager is documented in `AWS-RUNBOOK.md` and is a
~30-minute change if rotation needs ever increase.

### 4. Key embedded in `cloud-config.js` — frictionless team UX

The editor's UX goal is "any Troy or VP team member visits the URL, saves a
template, the library shows up for everyone else." A prompt-for-key flow
worked technically but added meaningful friction every time a new team
member joined or someone needed to use a second device.

Per the original plan doc's recommendation (option (a)), the key is now a
committed constant in `js/cloud-config.js`. The public-repo / public-URL
trade-off is accepted because:

- The threat from an unknown attacker stumbling on this is low (URL isn't
  advertised externally; bot risk is mitigated by CORS lock to the editor
  origin and reserved Lambda concurrency).
- The threat from a known attacker is no different than option (b) would
  prevent — they'd ask a team member or extract from the deployed bundle.
- Recovery from any abuse incident is fast: DynamoDB Point-in-Time
  Recovery is enabled (35-day rollback) and key rotation is a 5-minute
  procedure (see `AWS-RUNBOOK.md`).
- Team onboarding becomes trivial: send the editor URL.
- Sharing a saved template becomes trivial: send the editor URL.

The legacy `localStorage` key is still honored as an **override** — set
`troy-sandbox-cloud-key` manually in DevTools to test alternate keys or
unblock yourself during a rotation window. Production users never touch
this; the embedded key is the normal path.

### 5. Client-side templateId generation

`tpl_<12 base62 chars>` is generated in `js/cloud-storage.js#generateTemplateId()`
**before** the save flow. This lets images upload to S3 keyed by
`templates/{templateId}/...` in parallel with template metadata. The
server accepts client-generated IDs because the partition key
`(sandboxId, templateId)` is enforced unique by DynamoDB.

The doc proposed server-generated IDs. The change is to enable the single
client transaction (presign → upload → save), avoiding a two-phase flow.

### 6. S3 key includes templateId

Path: `sandboxes/{sandboxId}/templates/{templateId}/images/{imageId}.{ext}`.

The doc proposed `sandboxes/{sandboxId}/images/`. Adding the `templates/{templateId}`
segment lets `deleteTemplate` clean up via S3 prefix-listing in one batch,
without parsing the template's section JSON to find image URLs.

---

## What's NOT implemented (and where to look when adding it)

### Phase 2 — Share links

Endpoint placeholders are in `js/cloud-config.js`. To build:

1. Create `lambda/create-share/`, `lambda/get-shared-template/`, `lambda/revoke-share/` following the same pattern as the existing 5 Lambdas
2. Create DynamoDB table `TroySandbox_Shares`
3. Update IAM policies and add new role per Lambda
4. Add `js/share-view.js` for read-only viewer mode
5. Modify `js/app.js` to detect `?share=TOKEN` in URL on bootstrap
6. Modify `js/ui.js` to add a "Share" button on cloud template cards
7. Update `cloud-config.js`, this doc, deployment guide, and runbook

### Phase 3 — polish items

- Folders for organizing cloud library (add `folder` field to Templates row + UI)
- Autosave (debounced timer in `state.js#updateSection*`)
- Migration tool for existing localStorage templates to cloud (one-click "upload all" button reading from `template-storage.js`)
- Orphan-S3-image cleanup (currently, updating a template with a replaced image leaves the old S3 object until the whole template is deleted)
- Analytics on share-link views (Phase 2 dependency)
- Signed S3 URLs if Troy ever needs private images

---

## When you change something, also update…

A change-impact matrix. If you modify the left column, update everything
listed in the right column to keep the source of truth coherent.

| If you change… | Also update |
|---|---|
| A Lambda handler | The `index.js` for that handler. If helpers changed, mirror to the other 4 |
| A Lambda's IAM scope | The `policy.json` for that function + reattach in IAM console |
| A Lambda's env var | The `config.json` for that function + the live function in Lambda console |
| A DynamoDB table name | All `lambda/*/policy.json` Resource ARNs, all `lambda/*/config.json` env vars, this doc's "Naming conventions" table, deployment guide |
| The S3 bucket name | `lambda/delete-template/policy.json`, `lambda/presign-images/policy.json`, both their `config.json`, `js/cloud-config.js` (`IMAGES_BUCKET`), this doc, deployment guide |
| The S3 key prefix shape | `lambda/presign-images/index.js`, `lambda/delete-template/index.js`, all related policies, this doc |
| The sandbox ID ("troy") | `js/cloud-config.js`, this doc, deployment guide |
| The CORS origin | All `lambda/*/config.json` Function URL CORS + `ALLOWED_ORIGIN` env var, this doc |
| The API key | (a) Lambda env var on all 5 functions; (b) `SANDBOX_API_KEY` constant in `js/cloud-config.js`; commit + push so deployed bundle matches. See `AWS-RUNBOOK.md` for zero-downtime rotation pattern. |
| Phase 2 endpoints come online | `js/cloud-config.js` Phase 2 URL placeholders, build the corresponding Lambdas, update this doc, update deployment guide and runbook |

---

## What's protected and how

This was a primary user requirement: **deploying TROY Sandbox must not
affect anything else in the VisionPoint AWS account**. The safeguards:

1. **Naming prefix.** Every resource starts with `TroySandbox`, `troy-sandbox`,
   or `troySandbox`. Search any console for "troy-sandbox" or "TroySandbox"
   to see exclusively this project's resources.
2. **Resource-level IAM.** Every `policy.json` Resource field is the exact
   ARN of the TROY resource. No `Resource: "*"`. No wildcards above the
   bucket prefix.
3. **No modifications to existing resources.** The deployment is greenfield —
   the guide instructs creating new tables, new bucket, new Lambdas, new
   roles. Nothing existing is edited.
4. **Reserved concurrency per Lambda** (5–10 per function). A runaway loop
   self-throttles instead of fanning out and costing money.
5. **CORS origin allowlist.** The Function URLs reject any browser origin
   except `https://visionpointmarketing.github.io` (or the configured fork
   for dev).
6. **DynamoDB on-demand billing.** No provisioned capacity to misconfigure.
7. **Dedicated $25/month budget alert.** Catches anomalies specific to this
   workload (separate from the existing org-wide budget that's already
   breached).
8. **Resource tags.** Every Lambda is tagged `Project=troy-sandbox` so cost
   attribution and resource hunting are trivial.

If the resources need to be torn down in the future, the runbook's
"complete teardown" section enumerates every artifact in deletion-safe
order.

---

## For future Claude: where to start

If a future Claude is asked to modify, debug, extend, or operate this
feature, **read this file first**. Then:

- **Backend change** (Lambda code, IAM, AWS resources) → `lambda/README.md`,
  then the specific `lambda/<function>/` directory, then `AWS-RUNBOOK.md`
  for operational context
- **Frontend change** (UI, save flow, key handling) → `js/cloud-config.js`,
  `js/cloud-storage.js`, plus the modified files listed in "File map" above
- **Deploying or re-deploying** → `AWS-DEPLOYMENT-GUIDE.md`
- **Debugging a production issue** → `AWS-RUNBOOK.md`
- **Adding a new Lambda endpoint** → see the "Phase 2" notes above; the
  pattern is established

**Do not introduce CDK, Lambda Layers, or multi-file Lambda packages
without first reading this doc and confirming the rationale change with the
user.** The single-file, self-contained-handler constraint is deliberate
and documented above.
