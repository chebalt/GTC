# Solution Overview — GROHE Training Companion (GTC)

**Project:** GTC Migration — Craft CMS → Sitecore AI (NEO)
**Document owner:** Artsiom Dylevich, Solution Architect, Actum Digital
**Version:** 1.0 — Discovery Phase deliverable
**Date:** 28 February 2026
**Status:** Draft for review

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Proposed Architecture](#2-proposed-architecture)
3. [Integrations Detail](#3-integrations-detail)
4. [Infrastructure & Hosting](#4-infrastructure--hosting)

---

## 1. Executive Summary

**GROHE Training Companion (GTC)** is GROHE's digital training platform at [training.grohe.com](https://training.grohe.com), serving installers, designers, kitchen studios, showroom staff, and GROHE/Lixil internal employees across 19 languages. The platform delivers structured training modules (Collections), compact training content, and quizzes — including PDF certificate generation upon course completion.

GTC was built and maintained by agency **THIS GmbH**, which closed in December 2025. Craft CMS V4 Long-Term Support and THIS's remaining contractual support both expire in **June 2026**, creating an immovable hard deadline for migration. GROHE does not hold the source code (retained in THIS's private repository), and post-closure maintenance capacity is minimal.

### Selected Approach

Rather than rebuilding GTC as a standalone system, the selected approach is to **extend the existing NEO (Sitecore AI) ecosystem** to host GTC as a second site within the same Sitecore AI instance. This aligns with Lixil's one-platform strategy and delivers concrete advantages:

- **Shared infrastructure** — GCP hosting, IDP, CDN, search, and media management (Celum) already in production for NEO
- **Shared IDP** — no user or role migration required; the same GROHE IDP that NEO uses will authenticate GTC users
- **Component reuse** — 13 of 28 assessed components are directly reusable from NEO; 6 require adaptation; 9 require custom development (primarily the quiz/question types)
- **Reporting continuity** — Craft currently connects to Looker Studio via an API connector; GTC sets up an equivalent Cloud SQL (PostgreSQL) → Looker Studio connector to keep existing reports fully functional

### What Is in Scope

| Area | Scope |
|---|---|
| Content model + components | All 28 mapped; custom development for 9 quiz types |
| Integrations | IDP (REUSE), Celum (EXTEND), Phrase TMS (EXTEND), Sitecore Search (EXTEND), Redirects (data provision only), Cloud SQL / GCS (NEW) |
| Progress tracking & reporting | Cloud SQL → Looker Studio connector (replacing existing Craft DB → Looker connector) |
| Certificate generation | On-request PDF generation with GCS storage |
| Feedback forms | End-of-course and footer feedback (email delivery, no DB storage) |
| Content migration | ~60 trainings, 19 languages, all media to Celum |
| Historical progress data | Migration of existing course + quiz tracking records |

### What Is Out of Scope

Full LMS integration, Salesforce / Marketing Cloud, behavioral personalization, redirect service maintenance, and Hetzner infrastructure migration are explicitly excluded from this phase.

---

## 2. Proposed Architecture

### Architecture Diagram

![Architecture Diagram](./ArchitecureDiagram.png)

*Note: The Load Balancer + Firestore redirect layer sits in front of the Frontend Application (not shown in diagram for clarity — see [Section 3, Redirects](#load-balancer--redirect-tables-extend--data-provision-only)).*

### Multisite Model

GTC will run as a **second site within the existing Sitecore AI instance** that already hosts Grohe NEO (www.grohe.com). This is a standard Sitecore AI multisite configuration:

- Both sites share the same Sitecore instance, content tree structure, and component library
- Components (Nuggets in Craft = Sitecore components) are reused or restyled across both sites
- GTC-specific components and data templates are scoped to the GTC site
- Grohe NEO is already in production; GTC is added as the second site

### System Components

| Component | Technology | Role | Type |
|---|---|---|---|
| CMS | Sitecore AI | Content authoring + layout management | REUSE |
| Frontend | Next.js on Vercel | Page rendering + user interaction (multisite) | EXTEND |
| Middleware | Google Cloud Run (GCR) | Business logic, APIs, certificate generation | EXTEND |
| Database | Cloud SQL — PostgreSQL | User progress, quiz results | NEW |
| Reporting | Looker Studio | Cloud SQL connector (replaces existing Craft DB connector) | NEW |
| Certificate storage | Google Cloud Storage (GCS) | Immutable PDF storage, Signed URL access | NEW |
| Search | Sitecore Search | Full-text course/chapter/quiz search | EXTEND |
| Media | Celum DAM | Asset picker (authoring) + CDN (rendering) | EXTEND |
| Authentication | GROHE IDP | OAuth2 SSO for all users | REUSE |
| Translation | Phrase TMS | Direct Sitecore connector for content translation | EXTEND |
| Redirects | GCP Load Balancer + Firestore | URL redirect lookup (old Craft slugs → new Sitecore slugs) | EXTEND |

**Integration type key:**
- **NEW** — built specifically for GTC; does not exist in NEO
- **EXTEND** — existing NEO integration being configured or extended for GTC content types
- **REUSE** — used by GTC unchanged from NEO

---

## 3. Integrations Detail

### GROHE IDP [REUSE]

The same GROHE IDP instance used by NEO authenticates GTC users via **OAuth2 SSO**. No configuration change is required — GTC inherits the existing IDP connection. 

### Celum DAM [EXTEND]

The Sitecore **asset picker extension** is already deployed in the NEO Sitecore instance, enabling content editors to browse and insert Celum assets directly within the Sitecore authoring UI. GTC scope: **TBD** with Aaron/Andreas (the assets fully downoaded are shared for the review).

### Phrase TMS [EXTEND]

A **direct Sitecore API connector** for Phrase TMS is already live in NEO, replacing the manual Excel import/export workflow that currently exists in Craft. GTC scope is limited to configuring the existing connector for the new GTC content types (Collection, Story, Question, etc.). Translation flow: **Sitecore → Phrase** (content export for translation) → **Phrase → Sitecore** (import of translated content). No manual file handling is required.

### Sitecore Search [EXTEND]

The existing NEO publish webhook is extended to include GTC page types (Collections, Chapters, Quizzes). **TDB**: The search experience to be provided by Sascha and refined with the team. Most likely we are extending the Neo SERP page with the new tab.

### Load Balancer + Redirect Tables [EXTEND — data provision only]

The existing NEO GCP infrastructure includes a **Load Balancer + Firestore-backed redirect lookup service** that sits in front of the Frontend Application. It evaluates incoming URLs against a Firestore database and issues redirects before traffic reaches the application. This service is **already fully operational for NEO**.

**Maintaining or modifying this service is NOT in GTC scope.** The NEO team owns the redirect service. GTC's only responsibility is to provide the URL mapping data — i.e., the old Craft CMS slug → new Sitecore slug mappings — as input to the NEO team, who will load it into Firestore. The redirect mechanism itself requires no GTC development effort.

### Cloud SQL / PostgreSQL [NEW]

A new **Cloud SQL (PostgreSQL)** instance is provisioned for GTC to store:

| Table | Contents |
|---|---|
| UserCourseProgress | User ID, course slug, language, completion status, timestamps |
| UserQuizProgress | User ID, quiz slug, language, attempts, best score, completion flag |

All writes are handled by the GTC Middleware. Looker Studio connects directly to Cloud SQL via its native PostgreSQL connector, replacing the existing Craft DB → Looker connector. The task is to ensure the existing Looker Studio reports remain fully functional against the new Cloud SQL schema.

### GCS Certificate Storage [NEW]

**Google Cloud Storage** stores generated PDF certificates as immutable objects. Access is controlled via **time-limited Signed URLs** generated per request by the Middleware — Signed URLs are user-specific and cannot be shared as permanent links. The GCS bucket is persistent (unlike Cloud Run's ephemeral disk), ensuring certificates survive Middleware restarts and scaling events.

---

## 4. Infrastructure & Hosting

| Component | Hosted by | Notes |
|---|---|---|
| Sitecore AI (XM Cloud) | Sitecore SaaS | Managed; GTC added as second site |
| Frontend | Vercel | Next.js, multisite deployment |
| Middleware | Google Cloud Run (GCP) | Existing NEO GCR extended with GTC endpoints |
| Database | Google Cloud SQL (GCP) | PostgreSQL; provisioned new for GTC; Looker Studio connects directly |
| Certificate storage | Google Cloud Storage (GCP) | Immutable bucket; Signed URL access |
| Search | Sitecore Search (SaaS) | Extended from NEO; managed by Sitecore |
| Media / CDN | Celum CDN | Existing DAM |
| Redirects | GCP Load Balancer + Firestore | Existing NEO infrastructure; NEO team owns |
| Authentication | GROHE IDP | Existing; no changes required |

All new GCP infrastructure (Cloud Run, Cloud SQL, GCS) follows the same patterns already established for the NEO platform on GCP. Hetzner Cloud (current Craft CMS host) is retired as part of this migration and is not carried forward; that infrastructure action is coordinated by Estanislao Montesinos-Gomez.

---

*Document prepared by Artsiom Dylevich, Actum Digital, as part of the GTC Discovery Phase deliverables.*
*For questions or feedback, contact: Artsiom Dylevich / Marianna Husar (Actum Digital)*
