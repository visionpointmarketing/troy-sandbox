# Save & Share Implementation Plan

**Status:** AWS confirmed · revised per Dave's review (April 30, 2026)
**Companion to:** [`CLOUD-STORAGE-SUPABASE-ALTERNATIVE.md`](./CLOUD-STORAGE-SUPABASE-ALTERNATIVE.md) (alternative considered)
**Audience:** VisionPoint engineering, Dave Olsen, anyone touching the cloud-side of TROY Sandbox.

---

## Executive Summary

We're adding cloud save and shareable links to the TROY Sandbox so VisionPoint and Troy team members can save their landing-page prototypes, revisit them from any browser, and share them with internal collaborators via a link.

**Platform:** AWS, in the existing VisionPoint–Troy account.

**Architecture:** DynamoDB (data), S3 (images), Lambda with Function URLs (HTTPS endpoints). No API Gateway, no Cognito, no user accounts. A single shared sandbox API key gates write operations.

**Data scope:** Templates are scoped to the **sandbox** (organization), not to individual users. Anyone with the editor and the sandbox key can save, list, and load any template — it's a shared team library, not a per-person inbox.

**Hosting:** the editor stays on GitHub Pages; AWS handles only the data layer.

**Build estimate:** ~1 week of focused work (down from 1–2 weeks since auth is dropped).

**Cost estimate:** $1–10/month at Troy scale.

**Long-term ownership:** VisionPoint owns the AWS resources after build. Claude-assisted maintenance is a complement, not a substitute, for human ownership.

This revision incorporates Dave's review feedback (April 30, 2026): no Cognito/auth, Lambda Function URLs instead of API Gateway, sandbox-scoped templates instead of user-scoped, CDK is optional rather than required. Net result is a meaningfully simpler system.

---

## What we're building

Three user-facing features, in priority order:

1. **Cloud Save.** The editor saves to a shared cloud library instead of (or in addition to) browser localStorage. Templates persist across devices and sessions.
2. **Cloud Library.** A list of all templates saved against this sandbox, openable by anyone using the editor.
3. **Share Link.** Generate a URL like `breonwilliams.github.io/troy-sandbox/share/abc123` that opens a read-only view of a specific template. No sign-in required to view.

Plus the implicit requirement: **images come along.** A template without its hero image is useless.

---

## Where we are today

The editor has no server. Everything lives in the user's browser:

| What | Where it lives | File |
|---|---|---|
| Editing state (sections, content, visibility, colors) | In-memory `state` object | `js/state.js` |
| Saved templates (up to 20) | localStorage key `troy-sandbox-templates` | `js/template-storage.js` |
| Uploaded images | IndexedDB DB `troy-sandbox-images` | `js/image-store.js` |
| Full-page JSON export/import | Download/upload a `.json` file | `js/ui.js` |

Two architectural realities matter for this plan:

- **Templates already have a clean JSON shape:** `{ id, name, sectionCount, createdAt, sections[] }`. That uploads to the cloud almost as-is.
- **Templates don't currently contain image data.** When a user saves locally, `stripBase64Images()` replaces every embedded image with `null`. Images live separately in IndexedDB keyed by `{sectionId}-{fieldName}`. Cloud storage has to handle images as their own thing — they can't piggyback on the template record (DynamoDB has a 400KB per-item limit anyway).

There's no concept of a "user" in the editor today, and per Dave's direction we're not introducing one. Cloud storage scopes to the sandbox itself.

---

## Architecture

Three AWS services, accessed by a small client module in the editor.

| Service | Role | Why this one |
|---|---|---|
| **Lambda + Function URLs** | Backend functions for save / list / get / delete / share. Each function has its own HTTPS endpoint via Lambda Function URLs. | Pay-per-request, scales automatically, no API Gateway middleman, simpler config |
| **DynamoDB** | Templates and shares tables, scoped by `sandboxId` | Fast, cheap at small scale, simple key access patterns |
| **S3** | Image storage | Industry standard. Direct S3 URLs (no CloudFront) are fine for MVP |

### What we deliberately removed (per Dave's review)

- **Cognito** — no user accounts, no sign-in flow. A single shared sandbox API key gates write operations instead.
- **API Gateway** — Lambda Function URLs provide HTTPS endpoints natively. No API Gateway routing, throttling, or authorizer config to maintain.

### Auth model: single sandbox API key

Each "sandbox" (e.g., the Troy editor instance) has one API key. The key is sent in an `X-Sandbox-Key` header on every write request. Lambda compares against the configured key (stored in Lambda environment variable or AWS Secrets Manager) and rejects anything else. Reads of *individual* shared templates via share token are public (no key needed); reads of the *full library* require the sandbox key.

Trust model: anyone with the editor URL and the sandbox key can save, list, modify, and delete templates. This matches Dave's "save this template and associate it with this sandbox" framing — the team is the unit, not the individual. The key is rotated by VisionPoint as needed.

---

## Infrastructure as Code (CDK) — *optional*

Per Dave's review, CDK is the recommended way to manage these resources but is **not required**. The architecture is small enough that manual configuration via the AWS Console is acceptable for MVP. If we go CDK, the stack is small:

```typescript
// infra/cdk/lib/troy-sandbox-stack.ts (sketch)
import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Table, AttributeType, BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import { Bucket, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { Function, Runtime, Code, FunctionUrlAuthType, HttpMethod } from 'aws-cdk-lib/aws-lambda';

export class TroySandboxStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // --- Data ---
    const templates = new Table(this, 'Templates', {
      partitionKey: { name: 'sandboxId', type: AttributeType.STRING },
      sortKey:      { name: 'templateId', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    const shares = new Table(this, 'Shares', {
      partitionKey: { name: 'shareToken', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    // --- Storage ---
    const images = new Bucket(this, 'Images', {
      cors: [{
        allowedMethods: [HttpMethods.GET, HttpMethods.PUT, HttpMethods.HEAD],
        allowedOrigins: ['https://breonwilliams.github.io'],
        allowedHeaders: ['*'],
      }],
    });

    // --- Lambda functions with Function URLs ---
    const saveTemplate = new Function(this, 'SaveTemplate', {
      runtime: Runtime.NODEJS_22_X,
      code: Code.fromAsset('lambda/save-template'),
      handler: 'index.handler',
      environment: {
        TEMPLATES_TABLE: templates.tableName,
        SANDBOX_KEY: process.env.SANDBOX_KEY!,  // injected at deploy
      },
    });
    saveTemplate.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,  // we auth via header inside the function
      cors: { allowedOrigins: ['https://breonwilliams.github.io'] },
    });
    templates.grantWriteData(saveTemplate);

    // ... repeat for listTemplates, getTemplate, deleteTemplate, presignImageUploads,
    //     createShare, getSharedTemplate, revokeShare
  }
}
```

If we skip CDK and configure manually:
1. Create DynamoDB tables in the Console (~10 min)
2. Create S3 bucket with CORS (~5 min)
3. Create each Lambda function via Console, paste the handler code, add Function URL, set CORS, set env vars (~10 min × 7 functions ≈ 70 min)

CDK still wins on reproducibility and version-controlled diffs, but it's a "do it once if you'd like" rather than a hard requirement.

---

## Data Model

Two DynamoDB tables and one S3 bucket. Sandbox-scoped, not user-scoped.

### DynamoDB: `Templates`

One record per saved template.

```
Partition key:  sandboxId    (e.g., "troy")
Sort key:       templateId   (e.g., "tpl_01HXYZ...")

Fields:
  sandboxId         string   identifies the sandbox (e.g., "troy")
  templateId        string   unique within sandbox, generated server-side
  name              string   user-chosen
  sectionCount      number
  folder            string   optional — for organization within sandbox (Phase 3)
  createdAt         ISO timestamp
  updatedAt         ISO timestamp
  sections          JSON     the sections[] array, with images replaced by S3 URLs
  version           number   optimistic-concurrency counter
```

"List my sandbox's templates" is a single Query on `sandboxId`. No GSI needed for the MVP shape.

### DynamoDB: `Shares`

One record per share link. Separate table so public read access (no auth) doesn't leak through to Templates.

```
Partition key:  shareToken   (10 random base62 chars; ~62^10 combinations — not guessable)

Fields:
  shareToken        string   public, unguessable
  sandboxId         string   the sandbox this share belongs to
  templateId        string   points to a Templates row
  createdAt         ISO timestamp
  expiresAt         ISO timestamp (optional — default no expiry)
  viewCount         number
  revoked           boolean  can kill the link without deleting the template
```

### S3 bucket: `troy-sandbox-images`

Key structure: `sandboxes/{sandboxId}/images/{imageId}.{ext}`. Files served via direct S3 HTTPS URLs (CloudFront optional later). The template JSON stores the full URL so the editor renders without extra API calls.

---

## User Flows

### Save to cloud

```
User clicks "Save to Cloud" (no sign-in required)
  → Editor includes the sandbox API key in request headers
  → Client requests pre-signed S3 URLs for each image (one Lambda Function URL call returning N URLs)
  → Client PUTs each image directly to S3 in parallel
  → Client rewrites section JSON: image fields point at S3 URLs
  → Client POSTs rewritten template JSON to the saveTemplate Function URL
  → Lambda validates X-Sandbox-Key, writes to DynamoDB, returns { templateId, updatedAt }
  → Client caches templateId so subsequent saves update instead of duplicate
```

### List & open templates

```
Editor loads → calls listTemplates Function URL with sandbox key
  → Lambda returns list of {templateId, name, sectionCount, updatedAt} for this sandbox
  → UI renders list (mirrors existing "Saved Templates" popover, just shared across the team)
  → User clicks one → Client GETs getTemplate Function URL with sandbox key
  → state.loadTemplate() hydrates the canvas; images load from S3 URLs directly
```

### Share a template

```
User clicks "Share" on any saved template
  → Client POSTs to createShare Function URL with sandbox key + templateId
  → Lambda creates Shares row, returns { shareUrl }
  → UI shows "Copy link"

Recipient opens the link
  → Editor JS reads ?share=TOKEN from URL
  → Client GETs getSharedTemplate Function URL (no auth — public)
  → Lambda fetches Share + Template, increments viewCount, returns combined payload
  → Editor renders in read-only mode (sidebar hidden, controls disabled)
```

### Cloud or local

- **No sandbox key configured** → editor uses localStorage only (current behavior).
- **Sandbox key configured** → cloud is the default for new saves; "Save locally instead" is a checkbox.
- **Existing local templates** → one-time "Move to shared library?" banner with a copy-up button.

---

## Client Code Changes

Smaller than before since the auth layer is gone. **One new module + tweaks to four existing files.**

### New files

| File | Purpose |
|---|---|
| `js/cloud-storage.js` | Mirrors `template-storage.js` public API but talks to AWS Function URLs. `saveTemplate`, `listTemplates`, `getTemplate`, `deleteTemplate`, `createShareLink`, `revokeShare`, `uploadImagesToCloud`. Sends `X-Sandbox-Key` header on every request. |
| `js/share-view.js` | Detects `?share=TOKEN` on page load, fetches the shared template, renders read-only. |

(No `js/cloud-auth.js` needed — there's no sign-in.)

### Existing files touched

| File | Change |
|---|---|
| `js/app.js` | On bootstrap, check for sandbox key in config; route to share view if a token is present in URL. |
| `js/ui.js` | Add "Cloud Templates" tab in template popover (visible when sandbox key configured), "Share" button on saved-template cards. |
| `js/save-template-modal.js` | Add "Save to cloud" / "Save locally" toggle when sandbox key is configured. |
| `js/state.js` | Add optional `state.cloudTemplateId` so subsequent saves update existing record. |

### Files we **don't** touch

`js/sections/*.js`, `js/canvas.js`, `js/design-rules.js`, `js/color-config.js`, `js/markup-exporter.js`. Section logic, rendering, and rules engine are independent of where data lives.

### Sandbox key configuration

The key is loaded from a config file or an environment variable injected at build time. For the GitHub Pages-hosted Troy editor, simplest is a small `js/cloud-config.js` (gitignored) that exports the key. The editor checks for its presence to enable the cloud features.

---

## Security Model

**Write operations** require the `X-Sandbox-Key` header. Lambda compares against the value in its environment (or AWS Secrets Manager) and rejects mismatches with 401. The key is the trust boundary — anyone with the key can save, list, modify, and delete templates within that sandbox. This matches Dave's "singular key per sandbox" framing.

**Read of an individual shared template** via share token is public — no key needed. The token's randomness (~10^17 combinations) is the access control.

**Listing the full library** requires the sandbox key. Share tokens only grant access to the specific template they point at, not to the sandbox's library.

**Images.** S3 bucket exposes the `sandboxes/{sandboxId}/images/` prefix as public-read. Images are designed to be public anyway (landing pages). If Troy later needs stricter privacy, switch to signed URLs (separate project, ~3 days of work).

**Data ownership.** Each template belongs to the sandbox. Delete is hard-delete (DynamoDB row + S3 images for that template removed). No soft-delete in v1.

**No PII.** Without auth, we don't store user identities. Templates are anonymous within the sandbox.

**Key rotation.** When the sandbox key needs rotating, update the Lambda environment variable (or Secrets Manager value) and update the editor's config. Brief outage window during the swap unless the Lambda reads at request time and supports two valid keys during a rotation period.

---

## Image Handling

Approach: **client uploads directly to S3 via presigned URLs.** Specifically:

1. Client calls the `presignImageUploads` Function URL with `[{ imageId, contentType, size }, ...]` and the sandbox key.
2. Lambda returns `[{ uploadUrl, cdnUrl }, ...]` — one presigned PUT URL per image.
3. Client `PUT`s each image directly to S3 in parallel. Bytes never go through Lambda.
4. Client embeds the `cdnUrl`s in the template JSON before saving.

This avoids Lambda's 6MB request size limit and avoids egress costs going through Lambda. It's the standard pattern.

---

## Phased Build Plan

Each phase ships value on its own. With auth dropped, the previous "Phase 1 — Accounts" is gone.

### Phase 1 — Cloud save & library (3–5 days)

Templates table, S3 bucket, Lambda functions with Function URLs, client integration.

- DynamoDB: `Templates` table (partition: sandboxId, sort: templateId)
- S3: `Images` bucket with CORS for the editor origin
- Lambda functions: `saveTemplate`, `listTemplates`, `getTemplate`, `updateTemplate`, `deleteTemplate`, `presignImageUploads` — each with its own Function URL, each validating `X-Sandbox-Key`
- `js/cloud-storage.js` matching the public API of `template-storage.js`
- Update template popover with "Cloud Library" tab when sandbox key configured
- Update save modal with cloud/local toggle
- **Test:** save on Mac with hero image; reload on PC, image renders; delete on PC, gone on Mac

### Phase 2 — Share links (1–2 days)

Shares table, public Lambda Function URL for share viewing, read-only viewer UI.

- DynamoDB: `Shares` table
- Lambda functions: `createShare`, `getSharedTemplate` (public, no key), `revokeShare`
- `js/share-view.js` read-only viewer
- "Share" button on cloud template cards with copy-link UX
- **Test:** share, open in incognito, see template render read-only

### Phase 3 — Polish (ongoing)

- Folders for organizing the cloud library (Dave's "Maybe add folders for organization" suggestion)
- Migration tool for existing localStorage templates (one-click upload-all)
- Autosave for cloud templates (debounced save-on-change)
- Analytics on share-link views
- Signed URLs for images if Troy ever needs stricter privacy

**Total Phase 1–2:** roughly **1 week of focused work** with Claude as code-suggester partner.

---

## Operational Ownership

AWS infrastructure needs a human owner at VisionPoint for the long term. With Cognito and API Gateway removed, the surface area is smaller — but it's still real.

What VisionPoint needs to commit to:

- **Lambda runtime updates.** AWS deprecates Node.js versions every 2–3 years. Someone reads the deprecation email, updates the function runtime, confirms nothing broke. ~30 minutes per occurrence per function.
- **Cost surveillance.** Set a Budget Alert at $25/month before deploying. Review the alarm if it fires.
- **Sandbox key rotation.** When the key needs changing (suspected leak, departed contributor with sensitive access), rotate the Lambda environment variable and update the editor config.
- **Incident response.** If something breaks (bad deploy, AWS outage, runaway loop), someone reads CloudWatch logs and characterizes the problem before Claude can help fix it.
- **Annual security review.** Quick check: Lambda IAM scopes still least-privilege, S3 bucket CORS still locked to editor origin, no rogue Function URLs added.

**Realistic ongoing time investment:** 1–2 hours per month in steady state. Smaller than the previous (auth-included) estimate.

---

## AI-Assisted Build Strategy

Claude is a code-suggester during build. Specifically and intentionally **not** an autonomous actor in AWS.

### Hard boundary: Claude does not access AWS

Claude has **no AWS credentials, no Console access, and no MCP-based AWS connection** in this project. Claude writes the CDK stack, Lambda code, and client modules as text files. The developer reviews every piece, commits it to git, and runs `cdk deploy` (or configures manually in the Console) from their own machine using their own AWS credentials. The same applies to any console operation — provisioning, debugging, log inspection, manual interventions — those are exclusively human actions.

This boundary is intentional. AI making autonomous changes to live cloud infrastructure introduces operational risk we're not willing to accept (a misunderstood instruction or hallucinated parameter can destroy data or rack up costs in seconds). The boundary keeps Claude useful as a coding partner while keeping a human in the loop for every change that touches AWS state.

### During build

- Claude writes the Lambda function handlers (Node.js)
- Claude writes the optional CDK stack file
- Claude writes the client modules (`cloud-storage.js`, `share-view.js`)
- Claude generates IAM policies with least-privilege defaults
- Developer is the only actor with AWS access — reviews each piece, commits, and deploys themselves
- Developer pastes any AWS errors, log excerpts, or output back to Claude as text for debugging

### During day-2 operations

- Developer describes incidents to Claude using CloudWatch log excerpts and observed symptoms
- Claude suggests fixes; developer reviews and applies them
- Claude **cannot** read AWS state, run AWS commands, or apply changes — every action that affects AWS is a human action

The honest framing: AI-assisted build cuts time-to-MVP roughly in half by accelerating code-writing and IAM-policy-authoring. It does not eliminate the long-term ownership requirement, and it does not give Claude any agency over the live AWS environment. The "Claude + CDK route" is exactly what this section describes — applied to a smaller AWS surface now that auth and API Gateway are out.

---

## Cost Estimate

For Troy's expected scale (a Troy team using one shared sandbox, hundreds of templates, modest image volume):

| Service | Monthly cost |
|---|---|
| DynamoDB | $0–2 (pay-per-request, free tier covers most months) |
| Lambda | $0–1 (under 1M requests/mo free tier) |
| S3 storage + transfer | $1–5 (depends on image volume and view traffic) |
| **Total** | **~$1–10/month** |

Removing Cognito ($0 anyway), API Gateway ($1–5), and the user-account complexity drops both the build cost and the steady-state bill.

---

## Open Questions for VisionPoint / Troy

A few things still need answers before build:

1. **Sandbox key storage.** Lambda env var (simpler) or AWS Secrets Manager (rotates more cleanly)? For an MVP with one sandbox, env var is fine.
2. **Sandbox key distribution.** How do Troy team members get the key into their editor instance? Options: (a) hardcoded into the editor's config file (commit to a private repo), (b) prompt user once and stored in localStorage, (c) embedded at build time via GitHub Actions secret. Recommend (c) if the GitHub Pages deployment is automated; else (a).
3. **Cloud region.** us-east-1 (cheapest, most services) is the default. Confirm there's no policy requirement for a specific region.
4. **Data retention on delete.** Hard-delete (recommended) or 30-day soft-delete? Hard-delete is simpler.
5. **Share link expiration.** No default expiry (recommended) or e.g. 30-day default? Internal Troy sharing flow benefits from no-expiry.

Settled per Dave's review:
- No auth / no Cognito
- Lambda Function URLs, no API Gateway
- Sandbox-scoped templates with single shared key
- CDK is optional, not required
- Hosting stays on GitHub Pages
- AWS confirmed as platform

---

## API Contract

Concrete shape — each endpoint is a Lambda Function URL, no API Gateway routing:

```
POST   /save-template            Save / update a template
                                 Headers: X-Sandbox-Key
                                 Body: { sandboxId, name, sections[], templateId? }
                                 Returns: { templateId, updatedAt }

GET    /list-templates           List templates for this sandbox
                                 Headers: X-Sandbox-Key
                                 Query: ?sandboxId=troy
                                 Returns: [{ templateId, name, sectionCount, updatedAt }, ...]

GET    /get-template             Get one full template
                                 Headers: X-Sandbox-Key
                                 Query: ?sandboxId=troy&templateId=tpl_abc
                                 Returns: full template

DELETE /delete-template          Delete a template
                                 Headers: X-Sandbox-Key
                                 Query: ?sandboxId=troy&templateId=tpl_abc
                                 Returns: { ok: true }

POST   /presign-images           Get presigned S3 upload URLs
                                 Headers: X-Sandbox-Key
                                 Body: [{ imageId, contentType, size }, ...]
                                 Returns: [{ uploadUrl, cdnUrl }, ...]

POST   /create-share             Create share link
                                 Headers: X-Sandbox-Key
                                 Body: { sandboxId, templateId, expiresAt? }
                                 Returns: { shareToken, shareUrl }

DELETE /revoke-share             Revoke share
                                 Headers: X-Sandbox-Key
                                 Query: ?shareToken=k3m9x2q7

GET    /share/{shareToken}       Public: get a shared template (no key)
                                 Returns: { template, meta: { viewCount } }
```

Each route is a separate Lambda Function URL. CORS allowlists the GitHub Pages editor origin on each one. The Function URL itself is unauthed at the AWS layer (`AuthType.NONE`) — the `X-Sandbox-Key` header is the application-level gate, validated inside each Lambda.

---

## See Also

- [`CLOUD-STORAGE-SUPABASE-ALTERNATIVE.md`](./CLOUD-STORAGE-SUPABASE-ALTERNATIVE.md) — the alternative considered. With auth dropped from the AWS plan, the AWS-vs-Supabase gap narrows but doesn't disappear; Supabase still wins on built-in concerns like real-time subscriptions, dashboard tooling, and managed Postgres if those become useful later.

---

*This is an implementation plan, not a build artifact. The Lambda functions, optional CDK stack, and client modules are written during Phases 1–2. This document captures the architecture and decisions; the code is the deliverable.*
