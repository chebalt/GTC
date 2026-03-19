# Discovery Phase Deliverables Status

## Overview (as of 19 Mar 2026)

| # | Deliverable | Owner(s) | Status |
|---|---|---|---|
| 1 | Solution Overview | Artsiom + Stepan + Ana | **Draft v1.1** — `Discovery Phase/Outputs/Solution Overview.md` |
| 2 | Content Migration Plan | Michal Broz | Stub — assigned, not written |
| 3 | Content Editor User and Role Mapping | TBD | Empty — not started |
| 4 | Documentation and Training Plan | TBD | Not started (no document) |
| 5 | Project Plan with Timeline and Budget | Marianna Husar | **GTC Project Plan.xlsx** — DEV/QA MD filled (19 Mar) |
| 6 | Redirects Map | TBD | Not started (no document) |
| 7 | **MVP Proposal** | Artsiom | **Done** — `Discovery Phase/Outputs/GTC MVP Proposal.md` (19 Mar 2026) |
| 8 | **Assumptions and Limitations** | Artsiom | **Done** — `Discovery Phase/Outputs/Assumptions and Limitations.md` (19 Mar 2026) |
| 9 | **MVP Project Plan** | Artsiom | **Done** — `Discovery Phase/Outputs/GTC Project MVP.xlsx` (19 Mar 2026) |

---

## Deliverable 1: Solution Overview

**Purpose:** Comprehensive technical documentation of the proposed Sitecore AI architecture, component mapping, gap analysis, and integration points.

**Must include:**
- Proposed Sitecore AI architecture diagram — **@Artsiom Dylevich** due ~3 Mar 2026 ← **IN PROGRESS** (file: `Discovery Phase/Outputs/ArchitecureDiagram.png`)
- Component mapping: Craft CMS → Sitecore equivalents (done for components; needs Sitecore architecture layer)
- Gap analysis identifying:
  - Features mapping directly
  - Features requiring customization
  - Features with no equivalent (custom build needed)
  - General epics — **@Ana Iordosopol** due Friday (after 25 Feb workshop)
- Technical recommendations for each gap
- Integration points with existing GROHE systems — **@Štěpán Novák + @Artsiom Dylevich** (TBD)

**Architecture decisions captured (28 Feb 2026, amended 19 Mar 2026):**
- ~~Multisite~~ → **No multisite** (amended): GTC in NEO content tree, same repo/infra
- GTC Middleware on Google Cloud Run (existing NEO GCR extended)
- Database: Cloud SQL (PostgreSQL) → Looker Studio direct connection (no BigQuery, no Datastream, no CSV import)
- ~~Certificates: GCS + Signed URLs~~ → **No GCS** (amended): Cloud Run on-demand generation with temporary caching
- Redirects: existing NEO GCR redirect service + Load Balancer (NOT in GTC scope)
- CELUM: asset picker in Sitecore (authoring) + CDN link (rendering)
- Reuse NEO: header, footer, publishing workflow, IDP tenant
- Apigee: out of scope | No platform-agnostic API
- Search: NEO extension (new dropdown section + results tab)
- Quiz MVP: multiple choice + true/false only
- Tracking MVP: Craft DB schema 1:1 reuse

**Key questions to answer:**
- How will the Training Module be architected in Sitecore? ← partially answered; content model mapped
- What custom components are needed? ← quiz/question types all custom; see components.md
- How does GTC integrate with NEO? ← answered in architecture diagram

---

## Deliverable 2: Content Migration Plan

**Purpose:** Detailed roadmap for migrating all content and media from Craft CMS to Sitecore AI.

**Must include (all assigned to @Michal Broz):**
- Content inventory and scope definition
- Content type mapping (Craft → Sitecore)
- Automated migration assessment (what can be auto-migrated vs. manual)
- Proof-of-concept for automated migration
- Sitecore Pathway recommendations
- Media migration plan (current inventory, DAM structure in target state, migration approach)
- Quality assurance approach for migrated content

---

## Deliverable 3: Content Editor User and Role Mapping

**Purpose:** Define who can do what in the new Sitecore system.

**Must include:**
- User roles definition for Sitecore AI
- Permission matrix (role × action)
- Workflow definitions: content creation / review-approval / publishing
- Alignment with GROHE's content governance
- Comparison with current Craft CMS permissions

**Current state:** Document is completely empty — no owner assigned yet.

**Known roles (from Craft CMS):**
- Super Admin
- Admin (GROHE admin)
- Editor (with possible market restrictions, 15–50 users registered, ~10 active)
- Market users (check translations only)
- ~47 backend Lixil employees

---

## Deliverable 4: Documentation and Training Plan

**Purpose:** Plan for knowledge transfer and ongoing support.

**Must include:**
- System documentation outline (architecture, component, integration docs)
- Training materials plan (content editor, technical team, admin training)
- Training delivery approach (format, timeline, ongoing support model)

**Note:** MS17 (Sitecore training for GTC team) owned by SoE (Daniela) + Andreas Cibis.

---

## Deliverable 5: Project Plan with Timeline and Budget

**Purpose:** Implementation roadmap with cost estimates.

**Must include:**
- 6-month implementation plan: Discovery completion → Execution (build) → Rollout (go-live)
- Task breakdown by phase
- Resource allocation (roles, FTE/effort per role per phase)
- Dependencies and critical path
- Risk register with mitigation strategies
- Budget estimate (by phase, by role, with contingency)

**Note:** Tarun requested a highly detailed project plan breaking down timelines and feature deliveries sprint-by-sprint.

---

## Deliverable 6: Redirects Map

**Purpose:** Preserve SEO value and prevent broken links during migration.

**Must include:**
- Complete URL inventory of current site
- URL structure for new site
- 1:1 redirect mapping (old → new URL)
- Handling for removed/consolidated pages
- Redirect implementation approach
- SEO impact assessment

**Dependency:** Domain decision (training.grohe.com vs grohe.com/training) must be resolved first.
**Note:** Sitemap link in intake documents is broken (GlooMaps URL dead). Must recreate from Figma "GROHE Training Portal Intake" file.
