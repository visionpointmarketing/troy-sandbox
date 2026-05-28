# AWS Runbook — TROY Sandbox Cloud Save

**Audience:** the person operating the cloud save feature day-to-day or
during an incident.
**Authoritative reference:** [`CLOUD-IMPLEMENTATION.md`](./CLOUD-IMPLEMENTATION.md)
**Deployment instructions:** [`AWS-DEPLOYMENT-GUIDE.md`](./AWS-DEPLOYMENT-GUIDE.md)

---

## Quick reference

| Thing | Value |
|---|---|
| AWS Account | `831326375124` (alias `breon`) |
| Region | `us-east-1` |
| DynamoDB table | `TroySandbox_Templates` |
| S3 bucket | `troy-sandbox-images.vpmdevtech.com` |
| Lambdas | `troySandboxSaveTemplate`, `troySandboxListTemplates`, `troySandboxGetTemplate`, `troySandboxDeleteTemplate`, `troySandboxPresignImages` |
| Budget alert | `Troy Sandbox Budget` ($25/mo, scoped to `Project=troy-sandbox` tag) |
| Editor origin | `https://visionpointmarketing.github.io` |
| Resource tag | `Project=troy-sandbox` |
| API key location (server side) | `SANDBOX_KEY` env var on each Lambda |
| API key location (client side) | Browser `localStorage` under key `troy-sandbox-cloud-key` |

---

## Rotating the sandbox API key

Reasons to rotate:
- Suspected key leak
- Team member with the key has left
- Periodic rotation policy

The rotation has a brief window during which **all clients are disconnected**.
Plan for a minute or two of "Save was rejected" errors followed by team
members re-entering the new key.

### Procedure

1. **Generate a new key.** Same approach as the initial deployment:
   ```
   openssl rand -hex 32
   ```
   Save it to the same secure store you used originally (e.g., 1Password).

2. **Update each of the 5 Lambdas' `SANDBOX_KEY` env var.**
   For each function in:
   - `troySandboxSaveTemplate`
   - `troySandboxListTemplates`
   - `troySandboxGetTemplate`
   - `troySandboxDeleteTemplate`
   - `troySandboxPresignImages`

   Go to Lambda Console → function → **Configuration** → **Environment
   variables** → **Edit** → replace the value of `SANDBOX_KEY` with the new
   key → **Save**. Each function picks up the change on its next cold start
   (or immediately on warm invocations after the change propagates,
   typically a few seconds).

3. **Distribute the new key** to the team out-of-band (1Password, encrypted
   DM, etc).

4. **Each team member re-enters the new key** in the editor:
   - Open the editor
   - Templates popover → click **Manage** in the Cloud Library section (or
     trigger the "Cloud key was rejected" prompt by attempting any cloud
     action with the old key)
   - Paste the new key → **Connect**

5. **Update this runbook's "API key last rotated" line if you keep one.**
   *(Last rotated: not yet rotated — initial deploy)*

### Supporting a graceful rotation (advanced — optional)

If a future rotation needs to be zero-downtime, modify each Lambda's key
validation to accept either of two keys (env var `SANDBOX_KEY` plus an
optional `SANDBOX_KEY_PREV`), then:
1. Deploy with both keys set
2. Rotate clients onto the new key
3. After a week, remove `SANDBOX_KEY_PREV` from each Lambda

The current implementation only checks `SANDBOX_KEY` to keep things simple.

### Migrating to Secrets Manager (if rotation cadence increases)

If keys ever need to rotate more often than monthly, move from Lambda env
vars to AWS Secrets Manager:

1. **Create the secret.** Secrets Manager → Store a new secret → Other type
   of secret → key/value: `apiKey` = `<your key>` → Secret name:
   `troy-sandbox/api-key`
2. **Grant each Lambda role permission to read it.** Add this statement to
   each `troy-sandbox-lambda-*` role's inline policy:
   ```json
   {
       "Effect": "Allow",
       "Action": "secretsmanager:GetSecretValue",
       "Resource": "arn:aws:secretsmanager:us-east-1:831326375124:secret:troy-sandbox/api-key-*"
   }
   ```
3. **Modify each Lambda handler** to read the secret on cold start instead
   of from env var. The change is a few lines: SecretsManagerClient → GetSecretValueCommand → JSON.parse → cache in module scope.
4. **Remove the `SANDBOX_KEY` env var** from each Lambda after the deploy.

Estimated time for the full migration: 30–60 minutes.

---

## Debugging a failed save

User reports a save failed. Walk this list top to bottom.

### Step 1 — Is it client-side or server-side?

Ask the user to open browser DevTools → **Console** tab → reproduce the save.

- **Red console error mentioning CORS** → server-side: CORS misconfiguration on a Function URL or env var. Skip to Step 3.
- **Red console error like `Failed to fetch`** → network connectivity or the Function URL is wrong/missing. Skip to Step 4.
- **Modal shows "Cloud save failed: <message>"** → look at the message:
  - `Cloud key was rejected` / `unauthorized` → key mismatch; re-rotate or have them re-enter
  - `Request timed out` → Lambda took >20s; check CloudWatch logs (Step 5)
  - `S3 upload failed (XXX)` → S3 presigned URL flow broke; check `troySandboxPresignImages` logs
  - Anything else with a specific code → look it up in `js/cloud-storage.js` for the path that throws it

### Step 2 — Confirm cloud is configured correctly

In the user's browser console:

```javascript
import('./js/cloud-config.js').then(c => {
    console.log('configured?', c.isCloudConfigured());
    console.log('connected?', c.isCloudConnected());
    console.log('endpoints', c.CLOUD_ENDPOINTS);
});
```

- `isCloudConfigured` false → `cloud-config.js` still has `PASTE_FUNCTION_URL_HERE` placeholders. Push the real URLs.
- `isCloudConnected` false → user hasn't entered the key. Have them open the Cloud Library section and connect.

### Step 3 — Check Function URL CORS

Lambda Console → function → **Configuration** → **Function URL**. Confirm:
- Auth type is **NONE**
- Allow origin matches the editor's URL exactly (no trailing slash, exact case)
- Allow headers includes `Content-Type, X-Sandbox-Key`
- Allow methods includes the method the function expects (GET / POST / DELETE)
- `OPTIONS` is also allowed

### Step 4 — Check the URL in `cloud-config.js`

The URL stored in `js/cloud-config.js` for the failing endpoint must:
- Begin with `https://`
- End with `.lambda-url.us-east-1.on.aws/` (note the trailing slash)
- Match the URL shown in the Lambda Console's Function URL panel

### Step 5 — Read CloudWatch logs for the function

Lambda Console → function → **Monitor** → **View CloudWatch logs**. Each
function logs to `/aws/lambda/<functionName>`. Look at the most recent log
stream.

Common log signatures:
- `unauthorized` → `requireKey()` returned false. Key mismatch or env var missing.
- `bad_request` with `templateId is required and must match...` → client sent malformed templateId
- `SANDBOX_KEY env var not configured on this function` → you forgot to set the env var; go to Configuration → Environment variables
- `AccessDenied` errors on DynamoDB or S3 → IAM policy on the role is missing a permission

### Step 6 — Reproduce manually

For `troySandboxListTemplates`:
```bash
curl -i "https://<function-url>/?sandboxId=troy" \
     -H "X-Sandbox-Key: <key>"
```

For `troySandboxSaveTemplate`:
```bash
curl -i -X POST "https://<function-url>/" \
     -H "Content-Type: application/json" \
     -H "X-Sandbox-Key: <key>" \
     -d '{"sandboxId":"troy","templateId":"tpl_TEST1234","name":"curl test","sections":[{"id":"s1","type":"hero","content":{"headline":"x"},"visibility":{}}]}'
```

A 200 with a JSON body means the Lambda is healthy. A 401 means the key
header is wrong. A 4xx with `bad_request` means the body is malformed.

---

## Deleting a template manually (outside the editor)

If the editor's delete UI is broken or you need to remove a template without
a user clicking it, you can hit the DELETE endpoint directly:

```bash
curl -i -X DELETE "https://<deleteTemplate-function-url>/?sandboxId=troy&templateId=tpl_xxxxxxxx" \
     -H "X-Sandbox-Key: <key>"
```

Response: `{ "ok": true, "imagesDeleted": N }`.

The DynamoDB row is removed and the S3 prefix
`sandboxes/troy/templates/tpl_xxxxxxxx/` is best-effort cleaned. Idempotent
— second call returns the same shape with `imagesDeleted: 0`.

---

## Cost monitoring

Check the **Troy Sandbox Budget** alert in Budgets monthly. If it ever
fires:

1. **Cost Explorer** → Group by **Service** → filter Tag `Project=troy-sandbox` → which service is the outlier?
2. Common culprits and fixes:
   - **Lambda invocations spike** → check reserved-concurrency caps are still set on every function. If one is missing, set it back to 10.
   - **S3 storage grows** → may be accumulating orphan images (see "Known limitations" below). Run the orphan cleanup procedure.
   - **DynamoDB** is unlikely to spike on its own at this scale; if it does, check for an integration accidentally polling `listTemplates` in a loop.

---

## Known limitations

### Orphan S3 images

When a user updates a template, replacing image A with image B, image A
remains in S3 until the whole template is deleted. Over many updates this
accumulates orphan objects. Acceptable at MVP scale.

**Manual cleanup procedure:**
1. List every template's `sections` field via `listTemplates` + `getTemplate`
2. Collect every S3 URL referenced by any template
3. List every S3 object under `sandboxes/troy/templates/*/images/`
4. Delete the objects in S3 that don't appear in any template

A future improvement could add this as a Lambda triggered on a CloudWatch
Events schedule, or implement it as a `saveTemplate` post-hook (compare old
vs. new template sections, delete dropped URLs).

### No soft-delete

`deleteTemplate` is hard-delete. There is no "recently deleted" recovery.
DynamoDB Point-in-Time Recovery is currently **off**. To enable a
restoration window, turn PITR on for `TroySandbox_Templates`:

1. DynamoDB Console → `TroySandbox_Templates` → **Backups** tab
2. **Point-in-time recovery** → **Edit** → **Enable** → **Save**

Cost: ~$0.20/GB/month extra. For low data volumes this is negligible.

### No per-user audit trail

Without auth, CloudWatch shows IP addresses but no identity. Acceptable for
internal-team use; reconsider if this is ever exposed to non-VP / non-Troy
users.

### Single sandbox

`sandboxId` is hardcoded to `troy` in `js/cloud-config.js`. Adding a second
sandbox would require:
- A second sandbox API key (and second Lambda env var, OR rework to look up
  per-sandbox keys)
- Updates to `cloud-config.js` so the client knows which sandbox it belongs to
- This is a Phase 3 concern; the data model already partitions on `sandboxId`

---

## Common errors and what they mean

| User sees | Likely cause | Fix |
|---|---|---|
| Cloud Library section not visible at all | `cloud-config.js` still has placeholders | Paste the real Function URLs, commit, push |
| "Connect this browser to the cloud library →" | Cloud is configured, key not entered on this device | Click the link, paste the key |
| "Cloud key was rejected" / 401 | Wrong key; or key was rotated and this browser still has the old one | Click Manage → enter the new key |
| "Couldn't load cloud templates: Failed to fetch" | Function URL is wrong, missing, or CORS blocked | DevTools → Network tab → find the failing request → check URL and CORS |
| "Cloud save failed: bad_request" | Client sent invalid input (e.g., empty name, too many sections) | The message will say which field; verify the client code matches the API contract |
| "Cloud save failed: timeout" | Lambda took >20s | CloudWatch logs for that function; check memory, concurrency, throttling |
| Toast shows "Saved" but template doesn't appear in list | List endpoint failed silently after save succeeded | Force-refresh the Templates popover (close and reopen) |
| Image fails to render after loading from cloud | S3 bucket public-read policy is misconfigured or the bucket name in `cloud-config.js`'s `IMAGES_BUCKET` doesn't match the actual bucket | Check Step 3 of the deployment guide; verify the bucket policy is still in place |

---

## Complete teardown

If you need to remove TROY Sandbox cloud infrastructure entirely.

### Order matters

Delete in reverse dependency order:

1. **Delete the 5 Lambda functions.** Lambda Console → each function →
   Actions → Delete.
2. **Delete the 5 IAM roles.** IAM Console → Roles → each `troy-sandbox-lambda-*` → Delete role.
3. **Delete the S3 bucket.** S3 Console → bucket → empty the bucket first (Bucket actions → Empty → confirm), then Delete bucket.
4. **Disable deletion protection on the DynamoDB table**, then delete it.
   DynamoDB Console → `TroySandbox_Templates` → Additional settings → Deletion protection → Off → Save. Then Actions → Delete table.
5. **Delete the Budget alert.** Budgets Console → `Troy Sandbox Budget` → Delete budget.

### What survives teardown

Nothing TROY-specific. The IAM users, GuardDuty, Macie, and all other AWS
project resources in the account are untouched because none of them depend
on TROY resources.

### Verification

- Lambda Console search "troy" → only `s3ParseCrmExportTroy_2` remains (pre-existing, unrelated)
- DynamoDB Console search "troy" → empty
- S3 Console search "troy-sandbox" → empty (other `troy-*` buckets are unrelated)
- IAM Console search "troy-sandbox" → empty
- Budgets Console → no `Troy Sandbox Budget`

If all 5 check out, teardown is complete.

---

## Periodic maintenance checklist (quarterly)

- [ ] Review the budget — did it fire? Why?
- [ ] AWS deprecation emails — has Node.js 22.x been deprecated? If yes, plan an upgrade to whatever the current LTS is. Test in one function first, then roll the rest.
- [ ] CloudWatch logs retention — by default each function's log group keeps logs indefinitely. Consider setting a retention policy (e.g., 30 days) per function to control log storage cost.
- [ ] IAM Access Analyzer findings — any new ones related to the troy-sandbox-* roles?
- [ ] Sandbox key rotation review — is it still trusted? Any team changes since last rotation?
- [ ] Orphan-image cleanup — if S3 storage cost is rising, run the manual cleanup procedure above.
