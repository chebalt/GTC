# Discovery Phase Deliverables Status

## Overview (as of 26 Feb 2026)

| # | Deliverable | Owner(s) | Status |
|---|---|---|---|
| 1 | Solution Overview | Artsiom + Stepan + Ana | Stub — assigned, not written |
| 2 | Content Migration Plan | Michal Broz | Stub — assigned, not written |
| 3 | Content Editor User and Role Mapping | TBD | Empty — not started |
| 4 | Documentation and Training Plan | TBD | Not started (no document) |
| 5 | Project Plan with Timeline and Budget | Marianna Husar | Not started (due end of Discovery) |
| 6 | Redirects Map | TBD | Not started (no document) |

---

## Deliverable 1: Solution Overview

**Purpose:** Comprehensive technical documentation of the proposed Sitecore XM Cloud architecture, component mapping, gap analysis, and integration points.

**Must include:**
- Proposed Sitecore XM Cloud architecture diagram — **@Artsiom Dylevich** due ~3 Mar 2026
- Component mapping: Craft CMS → Sitecore equivalents (done for components; needs Sitecore architecture layer)
- Gap analysis identifying:
  - Features mapping directly
  - Features requiring customization
  - Features with no equivalent (custom build needed)
  - General epics — **@Ana Iordosopol** due Friday (after 25 Feb workshop)
- Technical recommendations for each gap
- Integration points with existing GROHE systems — **@Štěpán Novák + @Artsiom Dylevich** (TBD)

**Key questions to answer:**
- How will the Training Module be architected in Sitecore?
- What custom components are needed?
- How does GTC integrate with NEO?

---

## Deliverable 2: Content Migration Plan

**Purpose:** Detailed roadmap for migrating all content and media from Craft CMS to Sitecore XM Cloud.

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
- User roles definition for Sitecore XM Cloud
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
