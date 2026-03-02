# GTC Implementation Phase — Epic List

**Project:** GTC Migration — Craft CMS → Sitecore AI (NEO)
**Document owner:** Artsiom Dylevich, Solution Architect, Actum Digital
**Version:** 1.0 — Discovery Phase deliverable
**Date:** 2 March 2026
**Status:** Draft for review

---

## Summary

21 epics across 6 groups covering the full implementation phase (March–August 2026).

| Group | Epics | Key Risk |
|---|---|---|
| A — Foundation | 1–3 | Site config decisions (domain, multisite FE) |
| B — Frontend & Components | 4–6 | Quiz engine (8 custom types, largest cost driver) |
| C — Backend & Logic | 7–10 | Middleware API surface; completion rule definition |
| D — Integrations & Data | 11–14 | IDP access group mapping; Celum folder structure |
| E — Migration | 15–17 | Epic 15 is the PoC for MS4; data quality of historical records |
| F — Launch | 18–21 | Domain decision blocking Epic 18; UAT scope |

---

## Group A: Foundation

### Epic 1 — Infrastructure & Environment Setup

Provision all new GCP services and configure base environments.

- Cloud Run project scaffold (GTC Middleware)
- Cloud SQL (PostgreSQL) instance provisioning
- Google Datastream configuration (CDC pipeline)
- BigQuery dataset provisioning
- Google Cloud Storage bucket (certificates, immutable)
- CI/CD pipelines for Middleware
- Vercel multisite project configuration for GTC
- Environment separation (dev / staging / prod)

---

### Epic 2 — Sitecore Multisite Configuration & GTC Site Setup

Configure GTC as a second site within the existing Sitecore AI instance alongside Grohe NEO.

- GTC site definition in Sitecore
- Content tree root structure
- Language versions (19 languages)
- Publishing targets and Experience Edge configuration
- Content editor roles and permissions (~10 active editors)
- Workflow configuration (simple — mirrors current Craft simplicity)
- Local dev environment setup for GTC developers

---

### Epic 3 — GTC Content Model & Data Templates

Define all Sitecore data templates and page types mapping directly to Craft CMS entities.

| Craft Entity | Sitecore Type |
|---|---|
| Collection | Content Page (`/collection/<slug>`) |
| Story | Content Page (child URL under Collection) |
| Quiz | Content Page (`/quiz/<slug>`) |
| Chapter | Data Item (ordered, non-navigable) |
| Course | Data Item (type: Course / Compact Training) |
| Question | Data Item (child of Quiz) |
| Menu Category | Data Item |
| Components (Nuggets) | Shared Component base templates |

---

## Group B: Frontend & Components

### Epic 4 — Frontend — GTC Site (Next.js / Vercel)

Extend the NEO Next.js multisite application for GTC. GTC is added as a second site within the same Next.js deployment on Vercel.

- GTC site routing and URL structure
- Page templates: Collection, Story, Quiz, User Account, Search
- Header and footer (GTC-specific navigation, language switch, My Account dropdown, search)
- Language switching (19 languages, ISO locale codes)
- WCAG 2.1 AA baseline compliance
- Vercel deployment configuration for GTC
- Integration with GTC Middleware API endpoints

---

### Epic 5 — Component Library — Basics & Interactions

Verify, register, and adapt NEO components for GTC. Covers all 20 non-quiz components.

**Verify & register (13 reusable):**
- Stage / Hero Banner, Text Block, Content Display Block (×2), Info Block, Quote (×2), Info Block – Icons, Table, Downloads, Marquee Slider, Teaser List, Tabs Content

**Adapt (6 components):**

| Component | Adaptation Required |
|---|---|
| Editorial Text / Promo Banner | Add scrolling animation (brand-story pages); NEO is static only |
| A/B Slider | Add drag handle before/after interaction; adapt from Media Gallery |
| Slideshow | No exact NEO equivalent; adapt from Media Cards Carousel |
| Text Slider | Same as Slideshow assessment |
| Accordion | Extend to accept teasers (NEO accepts rich text, image, video only) |
| Image Tabs | Add image-as-tab-label support; NEO has text-based tabs only |

**Custom (1 component):**

| Component | Notes |
|---|---|
| Hotspots | NEO-398 deployed but product-content only; GTC-specific content use case requires customization |

---

### Epic 6 — Quiz Engine

Custom development of all 8 question types and the quiz container flow. This is the **largest implementation risk and primary cost driver** of the project.

**Question types (all custom — no NEO equivalents):**

| # | Question Type | Priority |
|---|---|---|
| 1 | Choice Question (single + multi-select) | P1 |
| 2 | True / False Question | P1 |
| 3 | Value Estimation Slider | P2 |
| 4 | Drag & Drop Text Question | P2 |
| 5 | Drag & Drop Image Question | P2 |
| 6 | Sortable Question | P3 |
| 7 | Fill the Blank Question | P3 |
| 8 | Per-Question Feedback (applies to all types) | P1 |

**Quiz flow and container:**
- Multi-step flow with progress bar
- Per-question feedback text shown after each answer (correct answer explanation)
- Score summary screen (pass / fail display)
- Configurable `passThreshold` per quiz (default: 8/10)
- Configurable `disableShuffle` per quiz
- Unlimited retries
- Sitecore data template: Question data item with type, answer options, correct answer, feedback text

*Note: MVP question type scope for implementation phase to be confirmed at kickoff.*

---

## Group C: Backend & Business Logic

### Epic 7 — GTC Middleware (Google Cloud Run)

Build and deploy the GTC Middleware service on Google Cloud Run. Acts as the API layer between the Next.js frontend and all backend services.

- Project scaffold and Cloud Run deployment pipeline
- JWT validation via JWKS local caching (no persistent IDP connection per request)
- API endpoints:
  - `POST /progress/story` — story scroll-depth completion event
  - `POST /progress/quiz` — quiz submission and scoring
  - `GET /certificate/:courseSlug` — certificate retrieval / generation trigger
  - `POST /feedback` — feedback form submission
  - Search proxy / GTC-scoped indexing logic
- Connection pooling to Cloud SQL
- Error handling, logging, health checks

---

### Epic 8 — Training Progress, Completion & Certificates

End-to-end implementation of course tracking, completion logic, and certificate lifecycle.

**Story completion:**
- Frontend scroll-depth event → Middleware `POST /progress/story` → write to `UserCourseProgress` in Cloud SQL
- Green checkmark UI state on Story page

**Collection completion:**
- All required Stories completed + linked quiz score ≥ `passThreshold`
- Required Stories and quiz configured by editors in Sitecore backend
- Completion flag and timestamp written to `UserCourseProgress`

**Certificate generation:**
- Trigger: user clicks Download in Learning History
- Middleware checks GCS at key `certificates/{user_id}/{course_slug}/{language}/{issued_date}.pdf`
- Cache hit: serve time-limited Signed URL
- Cache miss: generate PDF (template: user full name, course title, completion date, GROHE logo) → store immutably in GCS → serve Signed URL
- Signed URLs are user-specific and time-limited (not shareable as permanent links)
- Certificates are immutable once issued

---

### Epic 9 — User Account & Learning History

User Account page with two sections.

**Personal Data (read-only):**
- Title, First Name, Last Name, Email, Country (ISO-2)
- Sourced from GROHE IDP JWT — no local profile copy maintained

**Learning History:**
- List of completed Collections
- Per entry: course thumbnail, title, completion date (localized: DD.MM.YYYY / MM/DD/YYYY by market), Download Certificate button
- Certificate download triggers Epic 8 generation flow

---

### Epic 10 — Feedback Forms

Two feedback entry points, both AJAX with no page reload.

| Form | Context Captured | `feedback_type` | `course_slug` |
|---|---|---|---|
| End-of-course feedback | Training ID, User ID, Timestamp, Language, Market | `course` | populated |
| Footer feedback | None | `general` | `NULL` |

- Single multi-line text field, 1,000 character limit
- Flow: Frontend → GTC Middleware → Cloud SQL `Feedbacks` table → BigQuery (via Epic 13) → Looker Studio
- No CSV/Excel export needed

---

## Group D: Integrations & Data

### Epic 11 — System Integrations

Configure and extend all system integrations for GTC.

**Celum DAM [EXTEND]:**
- Create dedicated GTC media folder in Celum (coordinated with Aaron / SoE)
- Configure asset picker extension in Sitecore for GTC content types
- Verify CDN URL resolution in Next.js frontend for GTC assets

**Phrase TMS [EXTEND]:**
- Configure existing Sitecore API connector for GTC content types (Collection, Story, Question, etc.)
- Verify translation flow: Sitecore → Phrase (export) → Phrase → Sitecore (import)
- No manual file handling; no new connector development required

**Sitecore Search [EXTEND]:**
- Extend NEO publish webhook to include GTC page types (Collections, Chapters, Quizzes)
- GTC site filter in Middleware (GTC results not mixed with NEO product content)
- Authenticated-only search surface
- Real-time results after 3+ characters; WCAG 2.1 AA compliant

**GROHE IDP [VERIFY]:**
- Confirm access group claims in IDP JWT match GTC groups
- Verify no code change required to IDP configuration
- Document JWT claim mapping for Middleware implementation

**Redirects [DATA PROVISION ONLY]:**
- Produce complete old Craft CMS slug → new Sitecore slug URL mapping
- Covers: `/collections/<slug>`, `/playlists/<slug>`, `/quizzes/<slug>`
- Deliver mapping file to NEO team for Firestore load
- No development on the redirect service itself (owned by NEO team)

---

### Epic 12 — Personalization & Access Control

Component-level (Nugget-level) visibility controlled by the user's IDP access group.

- Access group sourced from GROHE IDP JWT; verified in Middleware
- Sitecore field per component: allowed access groups (multi-value)
- Frontend rendering logic: show/hide component based on user's group
- Access groups: `grohe` | `installer` | `architect & designer` | `kitchen studio` | `lixil` | `dev_only` | `showroom`
- Default behavior for users with no assigned group: TBD (pending open question resolution before implementation)
- No behavioral personalization (browsing history, engagement) in MVP

---

### Epic 13 — Analytics & Reporting Pipeline

Replace manual Excel reporting with a fully automated, live data pipeline.

- Google Datastream CDC: Cloud SQL (PostgreSQL) → BigQuery (near real-time replication)
- BigQuery datasets and table configuration
- Looker Studio dashboards:
  - Course completion rates (by training, language, market) — live
  - Quiz attempt counts, pass rates, score distributions — live
  - Feedback submissions (searchable, filterable) — live
  - Certificate issuance volume — live
- Deprecate manual Excel export and upload workflow (currently used by Marina Vorontcova)

---

### Epic 14 — Analytics Tracking (GTM / GA4 / OneTrust)

Implement GTC-specific analytics tracking, aligned with Digital Campaigns (Neele).

- Tracking concept definition and sign-off (Neele + Actum)
- GTM container configuration for GTC
- GA4 event implementation: page views, training start / story complete / collection complete, quiz attempt / pass / fail, certificate download, search query, feedback submission
- OneTrust cookie management integration
- Privacy policy update coordination (SoE)
- Heatmap integration need clarification (Samir / SoE — MS16)

---

## Group E: Migration

### Epic 15 — Content Migration Automation

Build automated tooling to migrate content and media from Craft CMS to Sitecore AI and Celum DAM. Delivers the PoC for MS4 and the production-grade tooling used in Epic 16.

**Craft content extractor:**
- Reads Collections, Stories, Chapters, Quizzes, Questions, and all field values via Craft REST API
- Falls back to direct MariaDB read where the API is insufficient or unavailable
- Extracts all 19 language variants per content item

**Content transformer:**
- Maps Craft CMS schema fields → Sitecore data template fields
- Handles rich text normalisation (Craft HTML → Sitecore-compatible format)
- Resolves internal asset references (Craft asset IDs → Celum CDN URLs post-media-migration)
- Produces a transformation manifest (field mapping log per item)

**Sitecore content importer:**
- Creates and updates Sitecore items via Sitecore Management API or Content Hub ONE GraphQL
- Idempotent: uses content slug as deduplication key; safe to re-run without creating duplicates
- Supports partial re-runs (specific Collections, specific languages)

**Media migrator:**
- Downloads assets (images, videos, files) from Craft CMS storage
- Uploads to Celum via Celum API into the GTC folder
- Returns Celum CDN URL for reference resolution in content transformer
- Handles deduplication (avoids re-uploading assets already in Celum)

**Validation & reporting:**
- Completeness report: X of Y items migrated, broken down by content type and language
- Field-level diff log: flags missing or untransformed fields
- Missing / failed asset report with remediation guidance
- Dry-run mode: validates transformation and target API connectivity without writing to production

---

### Epic 16 — Content Migration Execution

Execute the migration tooling from Epic 15 in production. Covers the full content and media migration lifecycle.

- Celum GTC folder structure setup (coordinated with Aaron / SoE)
- Initial media migration run (7,625 images, 825 videos, 173 files → Celum)
- Initial content migration run (~60 Collections, 19 languages → Sitecore)
- QA pass: Actum ECM team (Krystof Vinicky / Filip Hunek) + GTC team (Jessica, Daniela)
- Remediation of failed or missing items
- Sitecore authoring training for GTC content editors (coordinated with Daniela / Andreas Cibis — MS17)
- Final content sign-off from Jessica Folwarczny / Daniela Hesse

---

### Epic 17 — Historical Progress Data Migration

Migrate existing user tracking records from Craft CMS to Cloud SQL (PostgreSQL).

- Export from Craft CMS tracking data (~2,147 UserCourseProgress records, ~1,750 UserQuizProgress records)
- Data quality assessment: identify gaps, nulls, and inconsistencies (note: Craft exports "last updated" timestamp only — no completion flag; strategy required)
- Data cleansing and normalisation script
- Import to Cloud SQL `UserCourseProgress` and `UserQuizProgress` tables
- Reconciliation report: record counts before and after, anomalies flagged
- Sign-off from GTC team (Jessica / Daniela) and Actum (Stepan + Artsiom)

---

## Group F: Launch

### Epic 18 — SEO & Domain Strategy

*Blocked by domain decision (Egidijus Bartusis + Al-Wasir).*

- Domain finalisation: `training.grohe.com` vs `www.grohe.com/de-de/training`
- URL structure definition for all content types (Collections, Stories, Quizzes) across 19 languages
- Hreflang implementation
- Canonical tag strategy
- Metadata templates per content type (title, description, OG tags)
- Sitemap generation and submission
- URL redirect mapping delivery to NEO team (feeds into Epic 11 Redirects)

---

### Epic 19 — UAT & Quality Assurance

Structured UAT and pre-launch validation across all functional areas.

- Frontend E2E test suite (all page types, quiz flows, completion tracking, forms, certificate download)
- Accessibility audit: WCAG 2.1 AA (aria-live regions, keyboard navigation, focus management, colour contrast)
- Cross-browser and cross-device testing
- Performance baseline (Core Web Vitals, Vercel + GCR response times)
- Security review: JWT handling, Signed URL scope, Middleware API surface, Cloud SQL access
- Content quality check: GTC team reviews migrated content per Collection (MS19)
- UAT participants: Jessica Folwarczny, Daniela Hesse, Tarun Sharma (GTC) + Actum + SoE

---

### Epic 20 — Training & Handover

Operational readiness and knowledge transfer to the GTC and SoE teams.

- Sitecore authoring training for GTC content editors (coordinated with Daniela Hesse / Andreas Cibis)
- Looker Studio dashboard walkthrough for Marina Vorontcova
- Middleware operational runbook (deployment, scaling, incident response)
- Migration tooling re-run guide (for future content delta migrations)
- BigQuery / Looker Studio admin guide
- Handover to SoE for ongoing platform ownership

---

### Epic 21 — Go-Live & Cutover

Production cutover from Craft CMS to Sitecore AI.

- Cutover runbook (step-by-step with rollback plan)
- DNS cutover for `training.grohe.com`
- Coordination with Estanislao Montesinos-Gomez for Hetzner Cloud decommission
- Post-launch monitoring setup (Cloud Run logs, Cloud SQL, Vercel analytics)
- Hypercare period (Actum on-call post-launch)
- Incremental language and market rollout (MS21)

---

*Document prepared by Artsiom Dylevich, Actum Digital, as part of the GTC Discovery Phase deliverables.*
*For questions or feedback, contact: Artsiom Dylevich / Marianna Husar (Actum Digital)*
