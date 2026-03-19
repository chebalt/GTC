# GTC Open Questions & Risks

## High Priority

| # | Question | Owner | Status |
|---|---|---|---|
| 1 | **Domain**: Keep `training.grohe.com` or integrate as `www.grohe.com/de-de/training`? | Egi (Bartusis) + Al-Wasir | Open — Daniela to consult |
| 2 | **Historical training data migration**: Strategy, tooling, feasibility? GraphQL API confirmed to expose NO user progress data — course completions, quiz attempts/scores, and quiz answers all live in custom MariaDB tables only. Direct DB access (read) is the only extraction path. | Actum (Stepan + Art) + GROHE | Open — major task; DB access request needed |
| 3 | **Target group / IDP integration**: In Craft, users can select their Target Group (role) via a dropdown — both during partial registration and later in My Account. This selection drives content visibility (access groups). The open question is: how does this selection flow into the IDP, and does the access group model in NEO (GROHE, Installer, Showroom, etc.) map 1:1 to the Craft target groups? | Actum (Art + Stepan) + GROHE IDP team | Under investigation |
| 4 | **Should any training content be publicly accessible** (without login)? | UX + GTC | Open |

## Content & Migration

| # | Question | Owner | Status |
|---|---|---|---|
| 5 | **SEO metadata migration**: alt texts, canonical, hreflang | TBD | Open |
| 6 | **Broken links / obsolete content**: What should be excluded from migration? | GTC + ECM | Open |

## Technical

| # | Question | Owner | Status |
|---|---|---|---|
| 7 | **"Company" tracking dimension**: User Tracking spec lists "company" as a required analytics dimension alongside access group and country. Not currently mapped to any field in the IDP JWT or DB schema — needs clarification on what "company" means (GROHE dealer/partner company?) and whether it's available in the IDP claims. | Neele / Marina Vorontcova + Actum | Open |
| 8 | **Reporting pipeline / Looker Studio**: Architecture proposal — Looker Studio will connect directly to the GTC database. Before implementation, need a briefing from Marina/Neele on: (1) how the current Looker reports are structured, (2) what data they contain, (3) how the current Craft CSV/Excel exports are imported into Looker. | Marina Vorontcova + Neele → Actum | Open — briefing needed before implementation |
| 9 | **Course completion rule**: What exactly marks a course as complete in the new system — all Stories scrolled? All chapters? And does it require quiz passing? | Actum (Art) → Jessica / Daniela | Open — must confirm before DB schema finalised |
| 10 | **Feedback Form**: Is the footer feedback form currently stored in the same place as end-of-course feedback, or does it go to a different tool (email, etc.)? Any historical data to migrate? | Jessica Folwarczny | Open |
| 11 | **Celum — asset migration approach**: Originally assumed migrated assets would be uploaded directly to Celum. Aaron (GROHE) has raised objections to putting images directly into Celum. The use of Celum for migrated content is now **questionable** — needs a dedicated discussion with Aaron to clarify constraints, alternatives, and the final approach before migration tooling can be designed. | Actum (Michal + Art) + Aaron (GROHE) | Open — discussion with Aaron needed |
| 12 | **Inline quiz question tracking**: When a quiz interaction is embedded directly inside a lesson (`Question` in contentBuilder) rather than in a standalone quiz, is the user's answer tracked? Is answering it mandatory for lesson/course completion, or is it purely optional/informational? | Jessica Folwarczny / Daniela Hesse | Open — impacts tracking DB schema and completion logic |
| 13 | **Nugget → Sitecore page mapping**: In Craft, a Nugget is a standalone page (own URL, own entry) that lives inside a Training. Sitecore AI has no direct equivalent content type. Proposed approach: migrate each Nugget as a regular Sitecore page under the Training, with its `contentBuilder` components placed directly on that page. Is this acceptable from a content modelling and editorial perspective? | Actum (Art + Michal) → Jessica / Daniela | Open — decision needed before content model is finalised |


## Resolved / Confirmed

| Topic | Decision |
|---|---|
| LMS integration | Explicitly DESCOPED for this phase |
| User/role migration | NO — same IDP as NEO |
| Authentication | Same IDP as NEO (OAuth2 / GROHE IDP); Middleware uses JWKS local JWT validation |
| Content migration approach | "As is" — no re-localization during migration |
| Personalization MVP | Access-based visibility only; no behavioral personalization |
| Approval workflow | No complex workflow (mirrors current simplicity) |
| Salesforce | Future only — NOT in MVP scope |
| Certificate security | No digital signatures required |
| Completion tracking | Scroll depth triggers per-Story completion; Collection done when all required Stories + quiz passed |
| Content stored | 100% in Craft CMS (confirmed by Jessica) |
| Admin CraftCMS access | Granted to Actum team on 25 Feb 2026 |
| Quiz pass threshold | 8/10 (configurable via passThreshold) |
| Quiz retries | Unlimited |
| Search scope | Course level only (not Nugget level) |
| Reporting pipeline | Cloud SQL (PostgreSQL) → Datastream CDC → BigQuery → Looker Studio direct connection; no manual export; covers course progress, quiz progress, and feedback data |
| Certificate storage | Google Cloud Storage (GCS); Middleware generates PDF on request, checks GCS (cache hit = Signed URL; miss = generate → store → serve); key: `certificates/{user_id}/{course_slug}/{language}/{issued_date}.pdf`; access via time-limited Signed URLs |
| Feedback form export | Feedbacks stored in Cloud SQL (PostgreSQL) Feedbacks table; flow to BigQuery via Datastream; visible in Looker Studio — no CSV/Excel export needed |
| Multisite architecture | **Amended 19 Mar 2026: NO multisite** — GTC content incorporated into NEO content tree; same repo and infrastructure; reuse NEO header, footer, publishing workflow |
| CELUM integration | Sitecore asset picker extension for authoring; CELUM CDN link for FE App rendering |
| Redirect service | Existing NEO GCR redirect service + Load Balancer extended to handle GTC URL redirects |
| Certificate generation | GTC Middleware (Cloud Run) generates on-demand with temporary caching; **NO GCS** (amended 19 Mar 2026) |
| Phrase TMS | Direct API integration already live in NEO/Sitecore. GTC scope = configure existing connector for new GTC content types only. |
| Redirect table maintenance | NOT in GTC scope — NEO team owns the Firestore-based redirect service. GTC's only responsibility = provide old Craft slug → new Sitecore slug mapping data as input. |
| My Account placement | **Standalone GTC feature** — not integrated into NEO My Account. Owned entirely by GTC. |
| Search architecture | Extension of NEO search: new section in search dropdown + new tab on search results page. No standalone GTC search. (amended 19 Mar 2026) |
| Quiz question types (MVP) | Multiple choice and true/false only. Other types (drag-and-drop, sliders, fill-in-the-blank, sorting) deferred. (19 Mar 2026) |
| Tracking schema (MVP) | Reuse Craft CMS DB schema 1:1. No platform-agnostic redesign in MVP. (19 Mar 2026) |
| Apigee | Out of scope (19 Mar 2026) |
| Platform-agnostic API | Not developed — middleware serves GTC application only (19 Mar 2026) |
| GTM analytics | Standard integration only — no custom actions (19 Mar 2026) |
| Looker Studio | Direct Cloud SQL connection; no CSV import (19 Mar 2026) |
| Interactive components (MVP) | Only A/B Slider and Hotspots developed as new; others mapped to NEO equivalents (19 Mar 2026) |
| Personalisation (MVP) | Rules developed in Sitecore but configured manually by GTC team (19 Mar 2026) |
