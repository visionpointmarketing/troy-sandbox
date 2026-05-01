# Save & Share — Supabase as an Alternative Platform

**Status:** Alternative considered — not the chosen path
**Companion to:** [`CLOUD-STORAGE-PLAN.md`](./CLOUD-STORAGE-PLAN.md) (the AWS plan we're moving forward with)
**Purpose:** Capture the Supabase option, the trade-offs vs. AWS, and the path back if our needs change.

> **Note (April 30, 2026):** After Dave's review, the AWS plan was simplified — no Cognito, no API Gateway, sandbox-scoped instead of user-scoped. The comparison below reflects the original five-service AWS shape since that's what the simplicity gap was largest against. With the simplified AWS plan (DynamoDB + S3 + Lambda Function URLs + a shared sandbox key), the AWS surface is closer to Supabase's, though Supabase still wins on managed Postgres, auto-generated APIs, and a single dashboard. The conclusion — go with AWS for organizational fit — remains.

---

## TL;DR

We're moving forward with AWS for the save-and-share feature. This document exists so the alternative is on the record rather than implicit.

If reducing build time and ongoing maintenance burden were the dominant factors, **Supabase would win** — same data model, same user-facing features, roughly **2–3 days to MVP instead of 1–2 weeks**, free tier covers Troy permanently, and the ongoing maintenance footprint is roughly a tenth of AWS. The decision to go with AWS was driven by **organizational fit** (existing VisionPoint–Troy AWS account, no new vendor relationship), not by AWS being technically superior for this use case.

The choice is reversible: the data model in `CLOUD-STORAGE-PLAN.md` is platform-agnostic, so if AWS turns out heavier than expected during build, we can pivot to Supabase without rebuilding the editor. Postgres data dumps to AWS RDS cleanly. The off-ramp is real.

---

## What Supabase is

Supabase is a hosted backend-as-a-service. One platform, one console, one SDK, providing:

- **Authentication** — email/password, magic links, social providers (Google, etc.), with `@troy.edu` domain restriction in one config setting
- **Postgres database** — full SQL, row-level security policies, real-time subscriptions if needed later
- **File storage** — S3-compatible, public or signed URLs
- **Auto-generated REST and GraphQL APIs** from the database schema (no glue code to write)
- **Type-safe client SDK** for JavaScript, generated from the schema

It's the "open-source Firebase" — built on Postgres rather than NoSQL — and is widely adopted (Mozilla, GitHub, Vercel, and many agencies use it for client work). The relevant feature set for our save/share use case is exactly what Supabase is built for: a small backend with auth, a few tables, and file storage.

---

## Side-by-side: AWS (CDK + hand-wired) vs. Supabase

| Dimension | AWS (CDK + Cognito + DynamoDB + S3 + Lambda + API Gateway) | Supabase |
|---|---|---|
| **Time to MVP** | 1–2 weeks | 2–3 days |
| **Services to integrate** | 5 (Cognito, API Gateway, Lambda, DynamoDB, S3) | 1 |
| **Code we write & maintain** | CDK stack + Lambda functions + IAM policies + API contract | Schema in dashboard + tiny client module |
| **Day-2 maintenance** | Lambda runtime updates, IAM rotation, CloudWatch monitoring, cost surveillance | Periodic Supabase changelog check |
| **Auth setup time** | 4–6 hours (Cognito + tokens + custom domains) | 30 minutes (magic links via dashboard toggle) |
| **API to call** | Custom REST endpoints we define | Auto-generated, typed client |
| **Cost at Troy scale** | $10–30/month | $0/month (free tier covers it permanently) |
| **Existing VP relationship** | Yes (already have account) | No (new vendor) |
| **Skills built** | General AWS (transferable to other client work) | Supabase + Postgres |
| **Operational complexity** | High — many moving parts | Low — managed platform |
| **Debugging surface** | CloudWatch logs across multiple services | Single dashboard, single SQL console |
| **Lock-in** | Low (raw services are portable) | Low (Postgres is portable) |
| **Free tier ceiling** | N/A (always pay-per-use beyond free credits) | 500MB DB, 1GB storage, 50k monthly users |

The biggest line is the second-from-top: **5 services vs. 1**. Every service we integrate is a place where something can go wrong, a set of credentials to manage, an IAM relationship to configure. For an MVP with two tables and a storage bucket, the AWS surface area is heavy relative to the feature.

---

## What Supabase setup actually looks like

To make the simplicity concrete, here's the entire backend setup:

### One-time configuration (~2 hours total)

**1. Create Supabase project** (5 min, free tier)

**2. Define schema** in the SQL editor:

```sql
create table projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users not null,
  name text not null,
  section_count int,
  sections jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table shares (
  token text primary key default substr(md5(random()::text), 1, 10),
  project_id uuid references projects on delete cascade,
  created_by uuid references auth.users,
  created_at timestamptz default now(),
  expires_at timestamptz,
  view_count int default 0,
  revoked boolean default false
);
```

**3. Add row-level security policies:**

```sql
alter table projects enable row level security;
create policy "users see own projects"
  on projects for all
  using (auth.uid() = owner_id);

alter table shares enable row level security;
create policy "shares are publicly readable"
  on shares for select using (revoked = false);
create policy "users manage own shares"
  on shares for all
  using (auth.uid() = created_by);
```

That's the entire backend authorization model — five SQL statements. Equivalent in AWS would be IAM policies, Lambda authorizers, and API Gateway resource policies spread across multiple service definitions.

**4. Create storage bucket** `template-images` (one click in dashboard)

**5. Configure auth:** enable magic links in dashboard, restrict signup to `@troy.edu` if desired (one toggle)

That's the entire backend. Done.

### Client integration (~1 day of editor work)

```javascript
// js/cloud-storage.js — full file, roughly 60 lines
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xxxxxx.supabase.co',
  'public-anon-key'  // safe to commit, RLS enforces access
);

export async function saveTemplate(name, sections) {
  const { data, error } = await supabase
    .from('projects')
    .insert({ name, section_count: sections.length, sections })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listMyTemplates() {
  const { data } = await supabase
    .from('projects')
    .select('id, name, section_count, updated_at')
    .order('updated_at', { ascending: false });
  return data;
}

export async function getTemplate(id) {
  const { data } = await supabase.from('projects').select('*').eq('id', id).single();
  return data;
}

export async function createShareLink(projectId) {
  const { data } = await supabase
    .from('shares')
    .insert({ project_id: projectId })
    .select()
    .single();
  return `${window.location.origin}/share/${data.token}`;
}

export async function getSharedTemplate(token) {
  const { data } = await supabase
    .from('shares')
    .select('*, projects(*)')
    .eq('token', token)
    .single();
  return data?.projects;
}
```

That's the complete data layer. Image upload is one more function (`supabase.storage.from('template-images').upload(...)`).

### Magic-link sign-in

```javascript
await supabase.auth.signInWithOtp({ email });
```

User enters email → gets a clickable link → signed in. No password to manage. One line of client code.

---

## Why we chose AWS anyway

The technical-simplicity argument runs strongly in Supabase's favor. Two organizational factors shifted the decision toward AWS:

**1. Existing VisionPoint–Troy AWS account.** The relationship, billing, and security review are already done. Adding Supabase means a new vendor, however lightweight, with its own procurement and access management. For a Troy-internal tool, that overhead is small but non-zero.

**2. Senior recommendation.** Dave's preference for AWS reflects organizational context — what VisionPoint can support long-term, what fits existing patterns. That kind of judgment is hard to override remotely without strong reason, and the AWS solution is genuinely workable, just heavier.

Neither factor is purely technical, but both are real and apply regardless of which platform is "objectively better" for the feature in isolation.

---

## What might change the answer

The single question that would tip this back toward Supabase:

**Does VisionPoint have ongoing AWS engineering capacity to maintain this?**

If there's a senior engineer who already touches Troy's AWS infrastructure regularly and can absorb this without much overhead, AWS is the right call. The existing-account argument compounds with existing-team-knowledge.

If this would be a new ongoing responsibility for someone — meaning whoever inherits it has to learn AWS-dynamic-services on top of their day job — the Supabase simplicity may be worth more than the consolidation. Maintaining 5 AWS services for a low-traffic internal tool is a meaningful tax.

This is fundamentally a "who owns this in 18 months" question. Worth asking before committing to the build.

---

## Reversibility — this isn't a one-way door

Worth being explicit about: choosing one platform now does not lock us in.

**If we go AWS and decide to migrate to Supabase later:**
- Lambda functions become `supabase.from(...)` calls in the client (less code overall)
- DynamoDB → Postgres requires schema design, but the data shape (`{ id, owner, name, sections }`) maps directly
- S3 images can be transferred with `aws s3 sync` to Supabase Storage
- Cognito users → Supabase Auth requires a one-time migration script
- Realistic effort: ~1 week of focused work

**If we go Supabase and decide to migrate to AWS later:**
- `pg_dump` / `pg_restore` to AWS RDS (or convert to DynamoDB if needed)
- Storage bucket transfers to S3
- Auth users export to Cognito
- Client SDK swap (Supabase JS → AWS Amplify or hand-rolled fetch)
- Realistic effort: ~1 week of focused work

Neither is trivial, but neither is a rebuild. The architecture is platform-agnostic on the editor side — only the `js/cloud-storage.js` and `js/cloud-auth.js` modules change between platforms. Section templates, canvas, design rules, etc. don't know or care where the data lives.

---

## When to reconsider

Specific signals during the AWS build that would justify revisiting:

1. **Build slips significantly past the 1–2 week estimate** with no end in sight. CDK setup or IAM debugging is the most common cause.
2. **First production incident reveals an ownership gap** — something breaks and nobody at VisionPoint can fix it without significant ramp-up. Supabase's "managed" model would have prevented this class of issue.
3. **Cost surprises occur** beyond the initial estimate. AWS bills can spike from misconfigurations; Supabase's flat free/Pro tiers are predictable.
4. **Troy expresses concern about complexity** of the underlying infrastructure — they're a non-technical team relying on VisionPoint to keep this running.

If two or more of these hit during the first month, that's a meaningful signal that the platform is fighting the team. The Supabase migration path is preserved deliberately so this isn't a sunk-cost trap.

---

## Recommendation summary

Going with AWS is reasonable given the org context and is the chosen path. This document exists so the trade-off is explicit rather than implicit, and so the team has a clear pivot path documented if AWS becomes operationally heavier than expected.

The single change that would unambiguously favor Supabase: confirmation that VisionPoint does **not** have ongoing AWS engineering capacity for Troy projects, in which case the maintenance burden of hand-wired AWS services would land on whoever picks this up — and that's the case where the platform-simplicity gap matters most.

If at any point during build or operation the AWS path feels disproportionately heavy for an internal tool with two tables and a share link, the architecture in `CLOUD-STORAGE-PLAN.md` was designed to make a Supabase pivot a one-week project, not a rebuild.
