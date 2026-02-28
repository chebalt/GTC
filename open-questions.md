# GTC Open Questions & Risks

## Critical / Blocking

| # | Question | Owner | Status |
|---|---|---|---|
| 1 | **Domain**: Keep `training.grohe.com` or integrate as `www.grohe.com/de-de/training`? | Egi (Bartusis) + Al-Wasir | Open — Daniela to consult |
| 2 | **My Account**: Separate "Training" section or integrated into NEO My Account? | Technical workshop (TBD) | Open |
| 3 | **Historical training data migration**: Strategy, tooling, feasibility? | Actum (Stepan + Art) | Open — major task |
| 4 | **Quiz MVP scope**: What is the minimum feature set for the quiz component in implementation phase? | GTC + Actum | Open |
| 5 | **Target group / IDP integration**: How to link target group selection with IDP + NEO? | Actum (Art + Stepan) | Under investigation |

## Design & UX

| # | Question | Owner | Status |
|---|---|---|---|
| 6 | **Search placement**: Mixed into NEO "Content" tab or separate "Training" tab? | UX + GTC | Open |
| 7 | **Header/Footer content**: GROHE logo vs GTC logo? Logout in footer? Privacy policy shared? | TBD | Open |
| 8 | **Should any training content be publicly accessible** (without login)? | UX + GTC | Open |
| 9 | **Navigation structure**: Portfolio/Products/Installation/Sales Training — levels and points to discuss | TBD | Open |

## Content & Migration

| # | Question | Owner | Status |
|---|---|---|---|
| 10 | **Celum DAM migration**: How to handle asset duplication and different image sizes? | ECM + GROHE | Open |
| 11 | **Content freeze**: Can 2 new April trainings be handled without freezing content in Craft? | GTC + Actum | Open |
| 12 | **Content prioritization list**: Which trainings and market languages have priority? | GTC team | Pending from GROHE |
| 13 | **SEO metadata migration**: Titles, descriptions, alt texts, canonical URLs — scope? | TBD | Open |
| 14 | **Broken links / obsolete content**: What should be excluded from migration? | GTC + ECM | Open |
| 15 | **Translations**: Which languages at go-live vs. post-launch? | GTC team | Open |

## Technical

| # | Question | Owner | Status |
|---|---|---|---|
| 16 | **SCORM API break**: `lc.training.grohe.this.work` called at runtime by SCORM packages — how to handle? | Actum | Open |
| 17 | **Elasticsearch credentials**: Hardcoded in SCORM JS bundles — need to be rotated | GROHE IT | Action required |
| 18 | **Infrastructure migration**: Hetzner → GCP (not LIXIL standard) | Estanislao | Open |
| 19 | **Code access**: THIS holds code in private repo — purchase or extraction? | GROHE IT | Open |
| 20 | **Reporting pipeline**: Looker Studio currently fed by Excel export — replicate in NEO? | Neele + Actum | **Resolved** — see Resolved section |
| 21 | **Phrase TMS**: Continue manual Excel or implement direct API? | GTC + Actum | Backlog item |
| 22 | **Certificate storage in NEO**: Where do generated certificates live in Sitecore? | Actum | **Resolved** — see Resolved section |
| 23 | **Feedback form export**: CSV/Excel export mechanism in NEO? | Actum | **Resolved** — see Resolved section |
| 24 | **Logging, monitoring, operational ownership** post-migration | GROHE IT + Actum | TBD |
| 25 | **Security requirements** for APIs and certificates | GROHE IT | TBD |
| 31 | **Course completion rule**: What exactly marks a course as complete in the new system — all Stories scrolled? All chapters? And does it require quiz passing? | Actum (Art) → Jessica / Daniela | Open — must confirm before DB schema finalised |
| 32 | **Frontend multisite deployment**: One Vercel project for NEO + GTC or separate deployments with independent release cycles? | Actum FE team lead | Open — pending FE team lead input |
| 33 | **Footer feedback in Craft**: Is the footer feedback form currently stored in the same place as end-of-course feedback, or does it go to a different tool (email, etc.)? Any historical data to migrate? | Jessica Folwarczny | Open |

## Governance & Process

| # | Question | Owner | Status |
|---|---|---|---|
| 26 | **SonarCloud code review** | Estanislao | To-Do |
| 27 | **AOP2027 budget planning** for GTC operations | GROHE management | Open |
| 28 | **GROHE+ loyalty program integration** — in scope for implementation? | GTC + management | Backlog |
| 29 | **Showroom+ access group** — in scope for MVP? | GTC + management | Backlog |
| 30 | **Global scalability**: other brands/markets beyond initial rollout? | GROHE management | Strategic |

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
| Reporting pipeline (Q20) | Cloud SQL (PostgreSQL) → Datastream CDC → BigQuery → Looker Studio direct connection; no manual export; covers course progress, quiz progress, and feedback data |
| Certificate storage (Q22) | Google Cloud Storage (GCS); Middleware generates PDF on request, checks GCS (cache hit = Signed URL; miss = generate → store → serve); key: `certificates/{user_id}/{course_slug}/{language}/{issued_date}.pdf`; access via time-limited Signed URLs |
| Feedback form export (Q23) | Feedbacks stored in Cloud SQL (PostgreSQL) Feedbacks table; flow to BigQuery via Datastream; visible in Looker Studio — no CSV/Excel export needed |
| Multisite architecture | Grohe NEO + Grohe GTC in one Sitecore AI instance; components shared between sites |
| CELUM integration | Sitecore asset picker extension for authoring; CELUM CDN link for FE App rendering |
| Redirect service | Existing NEO GCR redirect service + Load Balancer extended to handle GTC URL redirects |
| Certificate generation | GTC Middleware (Google Cloud Run) generates on-request; immutable once issued |
