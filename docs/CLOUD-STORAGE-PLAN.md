# TROY Sandbox — Cloud Storage & Sharing Plan

**Status:** Proposal / Design Doc
**Author:** Architecture exploration
**Last updated:** 2026-04-23

---

## TL;DR (Read This First)

Today, everything a user builds in TROY Sandbox lives in **their own browser** — templates in `localStorage`, images in `IndexedDB`. If they clear their browser, use another computer, or want to send a template to a coworker, there's no way to do it.

This document proposes adding an **AWS-powered cloud layer** that lets users:

1. **Save** templates to the cloud so they persist across devices.
2. **Revisit** them from any browser by signing in.
3. **Share** a read-only snapshot via a link anyone can open.

The plan is designed to **sit alongside** the existing localStorage system rather than replace it, so the editor keeps working offline and users can choose local vs. cloud per template. It's phased so we can ship value early (phase 1 = "save and revisit") and add sharing later without rework.

---

## 1. Where We Are Today

The editor has no server. Everything is local to the browser:

| What | Where it lives | File |
|---|---|---|
| The page you're editing (sections, content, visibility, colors) | In-memory `state` object | `js/state.js` |
| Saved templates (up to 20) | `localStorage` key `troy-sandbox-templates` | `js/template-storage.js` |
| Uploaded images | `IndexedDB` DB `troy-sandbox-images` | `js/image-store.js` |
| Full-page JSON export/import | Download / upload a `.json` file | `js/ui.js` |

Two things matter for cloud design:

**a. Templates already have a clean JSON shape.** A template is just `{ id, name, sectionCount, createdAt, sections[] }`. That shape can be uploaded to the cloud almost as-is.

**b. Templates don't currently contain image data.** When a user saves a template locally, `stripBase64Images()` in `template-storage.js` replaces every embedded image with `null`. Images live separately in IndexedDB keyed by `{sectionId}-{fieldName}`. This is good for localStorage (keeps it small) but means our cloud plan has to handle images as their own thing — not just piggyback on the template record.

**c. There is no concept of a "user" yet.** No accounts, no login, no tokens. Cloud storage requires us to introduce one.

---

## 2. What We Want to Add

Three user-facing features, in priority order:

1. **Cloud Save** — "Save to my account" instead of (or in addition to) saving locally. Templates live forever, across devices.
2. **Cloud Library** — A list of my cloud templates I can open from any browser after signing in.
3. **Share Link** — Generate a URL like `builder.troy.edu/share/abc123` that opens a read-only view of the template. No login required to view.

And one implicit requirement: **images have to come along for the ride.** A template without its hero image is useless.

---

## 3. The Big Picture (Plain English)

Imagine three filing cabinets in the cloud:

- **Cabinet 1: Users.** Holds accounts (who you are, how you sign in).
- **Cabinet 2: Templates.** Holds the JSON for every saved template, tagged with which user it belongs to.
- **Cabinet 3: Images.** Holds image files, each with a unique ID.

When a user clicks **Save to Cloud**, the browser:

1. Asks the user to sign in if they aren't already.
2. Uploads each image from IndexedDB to Cabinet 3 and gets back a public URL for each.
3. Rewrites the template JSON so image fields point to those URLs instead of local IDs.
4. Sends the rewritten template to Cabinet 2, tagged with the user's ID.
5. Gets back a template ID to remember.

When the user opens the app on a new computer and clicks **My Cloud Templates**, the browser:

1. Asks them to sign in.
2. Lists every template tagged with their user ID.
3. On click, downloads the template JSON. Images render directly from their cloud URLs (no re-upload needed).

When the user clicks **Share**, the browser:

1. Asks the cloud to mint a short random token (e.g. `abc123xyz`) and associate it with this template ID.
2. Returns a URL like `builder.troy.edu/share/abc123xyz`.
3. The recipient opens that URL and sees the template in read-only mode — no account needed.

That's the whole model. Everything below is detail about which AWS services fill which role and how the client code calls them.

---

## 4. AWS Services, Explained Simply

We don't need exotic services. Five pieces do the whole job:

| AWS Service | Role in Plain English | Why This One |
|---|---|---|
| **Cognito** | The sign-in system. Handles "Sign in with email/password" or "Sign in with Google." Issues a token that proves who the user is. | It's AWS's standard auth. Free up to 50,000 users. Supports social login when Troy is ready. |
| **API Gateway** | The "front desk" of the cloud. All requests from the browser hit API Gateway first. It checks the token, then forwards the request to the right backend function. | Standard pattern. Handles HTTPS, rate limits, CORS. |
| **Lambda** | The backend functions. Small JavaScript functions that run on demand — "save this template," "list my templates," "mint a share link." No server to manage. | Cheap (pay per request), scales automatically, fits this app's traffic pattern. |
| **DynamoDB** | The templates database. Stores the JSON records for every template and share link. | Fast, cheap at small scale, fits our key-value access pattern perfectly (look up by user, look up by share token). |
| **S3 + CloudFront** | Image storage. S3 holds the files, CloudFront serves them fast worldwide. | Industry-standard for this. Cheap storage, fast delivery. |

A browser flow touches all five: you sign in (Cognito), ask to save a template (API Gateway → Lambda), which writes to DynamoDB and S3. On view, images load directly from CloudFront.

> **Note:** Cognito is the AWS-native answer but not the only one. If Troy has an existing SSO (Shibboleth, Azure AD, Okta) we should use that instead — see "Open Questions" at the end.

---

## 5. Data Model

Three tables/buckets. Keep them boring and predictable.

### 5a. DynamoDB Table: `Templates`

Stores one record per saved template.

```
Primary Key:        templateId       (e.g., "tpl_01HXYZ...")
Sort/Index by:      userId           (so we can list "all my templates")

Fields:
  templateId        string   unique, generated server-side
  userId            string   from the Cognito token
  name              string   user-chosen name
  sectionCount      number
  createdAt         ISO timestamp
  updatedAt         ISO timestamp
  sections          JSON     the sections[] array, images swapped to URLs
  version           number   incremented on each update (for conflict detection)
```

This mirrors the existing local template shape almost exactly, which means the client can treat local and cloud templates interchangeably in most of the UI.

### 5b. DynamoDB Table: `Shares`

Stores one record per share link. Separate from Templates so we can give share links different permissions (public read, no auth) without loosening the Templates table.

```
Primary Key:  shareToken   (short random string, e.g., "k3m9x2q7")

Fields:
  shareToken        string   public, unguessable
  templateId        string   points to a row in Templates
  createdBy         string   userId of the person who shared it
  createdAt         ISO timestamp
  expiresAt         ISO timestamp (optional — "no expiry" is allowed)
  viewCount         number
  revoked           boolean  so owner can kill the link
```

### 5c. S3 Bucket: `troy-sandbox-images`

One file per uploaded image. Key structure:

```
users/{userId}/{imageId}.{ext}
```

Files are served through CloudFront. The template JSON stores the full CloudFront URL (e.g. `https://cdn.troy.edu/users/abc/img_01HXYZ.jpg`) so the browser can render them without any extra API calls.

---

## 6. User Flows

### 6a. Save to Cloud

```
User clicks "Save to Cloud"
  → If not signed in, Cognito login modal appears
  → Client asks each image in IndexedDB for a pre-signed S3 URL (one API call)
  → Client uploads images directly to S3 in parallel
  → Client rewrites section content: backgroundImage: "indexeddb-id" → "https://cdn.troy.edu/..."
  → Client POSTs the rewritten template JSON to /api/templates
  → Lambda writes the row to DynamoDB, returns { templateId, updatedAt }
  → Client stores templateId in a local "cloud sync" cache so future edits update instead of create
```

### 6b. Open a Cloud Template

```
User clicks "My Cloud Templates"
  → Client GETs /api/templates (returns list of { templateId, name, sectionCount, updatedAt } for this user)
  → UI renders a list mirroring the existing "Saved Templates" popover
  → User clicks a template
  → Client GETs /api/templates/{templateId} (returns full JSON)
  → state.loadTemplate() hydrates the canvas, images load from CloudFront URLs
```

### 6c. Share a Template

```
User opens a saved cloud template → clicks "Share"
  → Client POSTs /api/templates/{templateId}/share  (optionally with expiresAt)
  → Lambda creates a Shares row, returns { shareUrl: "https://builder.troy.edu/share/k3m9x2q7" }
  → UI shows a "Copy link" button

Recipient opens the link
  → Browser loads /share/{shareToken}
  → App detects share mode, calls GET /api/share/{shareToken} (no auth required)
  → Lambda looks up the Share, fetches the Template, increments viewCount, returns combined payload
  → Editor loads in read-only mode (sidebar hidden, controls disabled)
  → "Copy this template to my account" CTA lets a signed-in viewer fork it
```

### 6d. The "Cloud or Local?" Question

Users shouldn't have to think about cloud vs. local most of the time. Proposed UX:

- **Signed-out users** — local only, same as today. No behavior change.
- **Signed-in users** — **Cloud is the default** for new saves. A small "Save locally instead" option is available for users who want a temporary scratch copy.
- **Existing local templates** — show a one-time "Migrate to cloud?" banner.

This keeps the architecture simple without forcing users to learn two concepts.

---

## 7. What the Client Code Has to Change

The client changes are smaller than they sound, because the architecture already separates concerns well. We'd add **one new module** and **tweak four existing ones**.

### New file: `js/cloud-storage.js`

Mirrors the function shape of `template-storage.js` so UI code can treat them interchangeably.

```javascript
// Mirrors template-storage.js public API, just async and networked
export async function saveTemplateToCloud(name, sections)       // → {templateId, ...}
export async function listCloudTemplates()                      // → [ {templateId, name, ...} ]
export async function getCloudTemplate(templateId)              // → full template
export async function updateCloudTemplate(templateId, sections) // → {updatedAt, version}
export async function deleteCloudTemplate(templateId)           // → boolean
export async function createShareLink(templateId, options)      // → {shareUrl, shareToken}
export async function revokeShareLink(shareToken)               // → boolean

// Image helpers
export async function uploadImagesToCloud(indexedDbImages)      // → { "indexeddb-id": "https://cdn..." }
```

### New file: `js/cloud-auth.js`

Handles Cognito sign-in/out, stores the token in memory (not localStorage — safer from XSS), refreshes it on expiry, exposes `getCurrentUser()`.

### New file: `js/share-view.js`

Detects `?share=TOKEN` or `/share/TOKEN` on page load, fetches the shared template, renders it in read-only mode, disables editor controls.

### Existing files to touch

| File | Change |
|---|---|
| `js/app.js` | On bootstrap, check for auth token; detect share mode and route accordingly. |
| `js/ui.js` | Add "Sign in" button, "Cloud Templates" section in template popover, "Share" button on saved-template cards. |
| `js/save-template-modal.js` | Add "Save to cloud" / "Save locally" toggle when signed in. |
| `js/state.js` | Add optional `state.cloudTemplateId` so "Save" updates the existing cloud record instead of creating a new one. |

### Existing files we **don't** touch

- `js/sections/*.js` — section templates are unchanged. The cloud doesn't care what a "hero" is.
- `js/canvas.js` — rendering is unchanged.
- `js/image-store.js` — IndexedDB still holds local images. The cloud module reads from it but doesn't replace it.
- `js/markup-exporter.js` — HTML export is orthogonal.

This separation matters: it means the cloud feature can be **removed or disabled** without breaking the core editor. That's the "maintainable, scalable" outcome we want — not a rewrite.

---

## 8. Security & Privacy

### Authentication

All `/api/templates*` endpoints require a valid Cognito JWT in the `Authorization` header. Lambda extracts `userId` from the verified token, so a user **cannot** request another user's templates by guessing IDs.

### Share links

Share tokens are ~10 characters of randomness (62^10 ≈ 10^17 combinations — not guessable). Share endpoints are public (no auth) but only return **read-only** data. Owners can revoke a link at any time. Optional expiration built in.

### Images

S3 bucket is private. Public access happens through CloudFront with signed URLs OR with a public-read policy scoped only to the `users/{userId}/` prefix. For a first pass, public-read is simpler; signed URLs are the "enterprise" upgrade if Troy needs stricter privacy.

### Data ownership

Users own their templates. Delete means hard-delete (DynamoDB row removed, S3 images for that template removed). No soft-delete in v1 — keep it simple.

### PII

The only PII is email (via Cognito). Don't log template content in CloudWatch unless needed for debugging. Tag the DynamoDB tables appropriately if Troy has a data classification policy.

---

## 9. Images — The Part That Trips Everyone Up

Cloud save only looks complicated because of images. Three options, with trade-offs:

**Option A: Base64-embed everything in the template JSON.**
Simplest to code, terrible at scale. A hero with a 2MB image becomes a 2.7MB JSON blob. DynamoDB has a 400KB per-item limit, so this breaks on basically any real template. **Reject.**

**Option B: S3 with public-read URLs.** *(Recommended)*
Client uploads images to S3, gets back URLs, puts URLs in the template JSON. Simple, fast, scalable. Only risk: anyone with the URL can view the image. For a landing-page tool, this is the right risk level — the images are designed to be public anyway.

**Option C: S3 with signed, time-limited URLs.**
Same as B but every image URL expires in e.g. 1 hour and has to be re-signed on load. More secure but adds complexity: every template load has to proxy through Lambda to re-sign URLs. Save this for "v2" if Troy has a concrete privacy requirement.

**Recommendation: Start with Option B.** Document the URL-exposure model clearly. Add Option C later if needed — the database schema doesn't have to change.

---

## 10. Phased Implementation Plan

Each phase ships something useful on its own. If we stop after Phase 2, users still get meaningful value.

### Phase 1: Accounts (1–2 weeks)

**Goal:** Users can sign in. Nothing else changes yet.

- Set up Cognito user pool (email + password to start).
- Add `js/cloud-auth.js` with login/logout/getCurrentUser.
- Add sign-in button + user-menu to the toolbar.
- Store auth state in memory; handle token refresh.

**Test criteria:** User can sign up, sign in, sign out. Refreshing the page stays signed in for session duration. No other behavior changes.

### Phase 2: Cloud Save & Library (2–3 weeks)

**Goal:** Signed-in users can save and reopen templates from the cloud.

- Set up S3 bucket + CloudFront distribution.
- Set up DynamoDB `Templates` table.
- Create Lambda functions: `saveTemplate`, `listTemplates`, `getTemplate`, `updateTemplate`, `deleteTemplate`.
- Set up API Gateway routes with Cognito authorizer.
- Add `js/cloud-storage.js` with the public API above.
- Update the template popover to show a "Cloud" tab when signed in.
- Update save modal to offer cloud vs. local.

**Test criteria:** A user signs in on Mac, saves a template with a hero image. Signs in on PC, opens the same template, image renders. Deletes on PC, confirms it's gone on Mac.

### Phase 3: Share Links (1–2 weeks)

**Goal:** Any saved cloud template can be shared via a link.

- Add DynamoDB `Shares` table.
- Add Lambda: `createShare`, `getSharedTemplate`, `revokeShare`.
- Public route `/share/{shareToken}` (no auth).
- Add `js/share-view.js` read-only viewer.
- Add "Share" button to cloud template cards with copy-link UX.
- Add "Fork this to my account" CTA for signed-in viewers.

**Test criteria:** Owner clicks Share, gets a URL, sends to a colleague. Colleague opens in an incognito window, sees the page, cannot edit. Signs in, clicks "Fork," gets their own editable copy.

### Phase 4: Polish (ongoing)

Things we'd want eventually but can absolutely ship without:

- **Autosave / sync** — debounced save-on-change for cloud templates.
- **Version history** — keep the last N versions, restore a previous one.
- **Team accounts** — shared libraries, not just individual users.
- **Signed image URLs** — the Option C upgrade from §9.
- **Analytics** — how many times has this share link been viewed, from where.
- **Migration tool** — one-click "upload all my local templates to cloud."

Flag these as "future" but design the schemas now so they don't require migrations later. Examples: we've already added `version` to Templates and `expiresAt`/`revoked` to Shares for exactly this reason.

---

## 11. Cost Estimate

For the realistic TROY scale (say: a few hundred signed-in users, a few thousand templates, ~50GB of images), AWS costs should sit in the **$10–40 per month** range.

| Service | Likely monthly cost |
|---|---|
| Cognito | $0 (under 50k free tier) |
| DynamoDB | $1–5 (pay-per-request) |
| Lambda | $0–2 (under 1M requests/mo free tier) |
| API Gateway | $1–5 |
| S3 storage + CloudFront | $5–25 depending on image volume & traffic |

Costs scale well: 10× the users ≈ 2–3× the cost because most services are pay-per-use and the free tiers absorb a lot.

The "gotcha" to watch is CloudFront egress if a template goes viral through shares. Set a budget alert.

---

## 12. Trade-offs & Alternatives

**"Could we just use Firebase / Supabase and skip AWS?"**
Yes. Both give you auth + database + file storage + hosting in one package with less setup. If Troy doesn't have an existing AWS relationship, this is a legitimate shortcut. The data model in §5 translates directly to either.

**Recommendation:** Use AWS if Troy already has an AWS account, DevOps, or procurement preference. Use Supabase/Firebase if this is a first cloud footprint for the team and speed matters more than long-term control. Either choice is reversible — the client-side module stays the same, only the network layer changes.

**"Could we just use a single JSON file per template in S3 and skip DynamoDB?"**
Technically yes, and it'd be cheaper and simpler to start. The reason to use DynamoDB anyway is that "list my templates" becomes painful with S3 alone (you have to list-objects and read each JSON to get the name), and share tokens really want a proper index. DynamoDB solves both cleanly.

**"Could we skip accounts and use random browser IDs?"**
You could let users save to the cloud anonymously keyed by a browser-generated ID. It lets you ship Phase 2 without Phase 1. But "I cleared my browser and lost all my cloud templates" is a very bad support ticket. Accounts are worth the extra week.

**"Why not just beef up the existing JSON import/export?"**
Import/export already works for one-off sharing — you can email someone a `.json` file today. The missing value is **persistence and URLs**: someone clicking a link in Slack and immediately seeing the template. Files-over-email doesn't get you there.

---

## 13. Recommended Path

If Troy greenlights this, build it in this order:

1. **Decide on auth provider.** Cognito (default) vs. Troy SSO (if it exists) vs. Supabase/Firebase (if we want to skip AWS). This decision blocks everything else.
2. **Ship Phase 1 (accounts).** Release it even though it does "nothing" — it de-risks the hardest part and lets users start signing up.
3. **Ship Phase 2 (cloud save & library).** This is the feature people actually want. Share links can wait a sprint.
4. **Ship Phase 3 (share links).** The "viral" moment. Now people have a reason to bring collaborators into the tool.
5. Treat Phase 4 items as backlog, prioritized by user feedback.

Resist the temptation to skip Phase 1 and build "accountless" cloud save — it's a short-term win that becomes a support nightmare and a data-migration project 6 months in.

---

## 14. Open Questions for Troy Stakeholders

Before we start building, we need answers to these. They materially change the design:

1. **Auth:** Does Troy have an existing SSO we should integrate with (Shibboleth, Azure AD, Okta)? If yes, Cognito federates to it. If no, we start with Cognito email/password.
2. **Who can sign up?** Public (anyone with an email), Troy-only (must have a `@troy.edu` email), or invite-only?
3. **Cloud region:** Any policy on where data can be stored (e.g. US-only)?
4. **Retention:** How long do we keep deleted templates? 30-day soft-delete, or immediate hard-delete?
5. **Share defaults:** Do share links expire by default (e.g. 30 days) or never?
6. **Hosting:** Where does the editor itself get hosted once it goes cloud-connected? Static hosting on S3+CloudFront is the natural answer and pairs well with this plan.
7. **Branding of share URLs:** `builder.troy.edu/share/...`? A separate short domain? Needs DNS coordination.

---

## 15. Appendix — API Contract Sketch

A concrete REST shape the Lambda + API Gateway layer would expose. Included so a backend dev could start immediately.

```
POST   /api/templates                   Create new cloud template
GET    /api/templates                   List my cloud templates
GET    /api/templates/{id}              Get one full template
PUT    /api/templates/{id}              Replace template (autosave)
DELETE /api/templates/{id}              Delete template

POST   /api/images/presign              Get pre-signed S3 upload URL
                                        body: { imageId, contentType, size }
                                        returns: { uploadUrl, cdnUrl }

POST   /api/templates/{id}/share        Create share link
                                        body: { expiresAt? }
                                        returns: { shareToken, shareUrl }
DELETE /api/shares/{shareToken}         Revoke share

GET    /api/share/{shareToken}          Public: get a shared template
                                        returns: { template, meta: { createdBy, viewCount } }
```

All authenticated routes expect `Authorization: Bearer <cognito-jwt>`. The public share route takes no auth. CORS allowlists the editor origin.

---

*End of plan. This is a design document, not a build document — every section is open to revision before implementation begins.*
