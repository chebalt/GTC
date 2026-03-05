# GTC Implementation Phase — Epic List

**Project:** GTC Migration — Craft CMS → Sitecore AI (NEO)
**Document owner:** Artsiom Dylevich, Solution Architect, Actum Digital
**Version:** 2.0 — Updated from GTC Project Plan.xlsx
**Date:** 4 March 2026
**Status:** Draft for review

---

## Epic List

| # | Epic | Stories |
|---|---|---|
| 1 | Foundation Configuration | CI/CD pipelines for Middleware; Sitecore Multisite Configuration & GTC Site Setup; Vercel multisite project configuration for GTC; GTC site definition in Sitecore; Local dev environment setup for GTC developers; CI/CD pipelines in Vercel for GTC project; Cloud SQL (PostgreSQL) instance provisioning; Middleware project scaffold and Cloud Run deployment pipeline |
| 2 | Content Model & Data Templates | Collection Page; Story Page; Quiz page; Data Items - Chapter, Course, Question, Menu Category; GTC Home Page; GTC General Page |
| 3 | Main Layout and Navigation | Menu Navigation; Header; Footer |
| 4 | Publishing Workflow | Publishing Workflow implementation |
| 5 | Phrase Integration | Phrase Integration implementation |
| 6 | Cookies Consent Integration | Cookies Consent integration implementation |
| 7 | Analytics | GTM analytics integration |
| 8 | User Management | IDP Authentication; Login Page; Partial Registration; New Registration |
| 9 | My Account | My Account; My Completed Courses |
| 10 | Learning Progress Tracking | Database schema implementation; GTC Tracking Middleware implementation (course, chapter, quiz); Scroll-based chapter completion component (FE); Training completion status UI (module read indicators, quiz status, certificate CTA states) |
| 11 | Quiz Component | Quiz component implementation; Question types implementation; Quiz progress tracking FE |
| 12 | Certification Management | Certificate Generation Middleware implementation; Certificate PDF template implementation |
| 13 | Forms | Feedback form; Footer Form |
| 14 | Search | Search Implementation |
| 15 | Content Components | Slideshow / Text Slider; A/B Slider; Accordion; Image Tabs; Hotspots; Editorial Text |
| 16 | Looker Studio Integration | Forms data integration; Learning Data Integration |
| 17 | Personalisation | Personalization based on the Target Group implementation *(scope: component-level visibility + training list filtering by role)* |
| 18 | Content Editor Roles and Permissions | Set up the roles and permissions |
| 19 | User Tracking Migration | Learning Data Migration |
| 20 | Content Migration | Content Migration Automation; Content Migration per se |
| 21 | Launch | Domain finalization (training.grohe.com vs grohe.com/training); URL structure definition per content type across 19 languages; Hreflang & canonical tag implementation; Metadata templates (title, description, OG) per content type; Sitemap generation and submission; Redirects URL mapping delivery to NEO team |
| 22 | UAT & Quality Assurance | E2E test suite (page types, quiz flows, tracking, forms, certificates); Accessibility audit (WCAG 2.1 AA); Cross-browser & cross-device testing; Performance baseline (Core Web Vitals, Vercel, Cloud Run); Security review (JWT, Signed URLs, Middleware API, Cloud SQL); Content quality check (migrated content sign-off by GTC team) |
| 23 | Training & Handover | Sitecore authoring training for GTC content editors; Looker Studio dashboard walkthrough; Middleware operational runbook (deployment, scaling, incident response); Handover to SoE for ongoing platform ownership |
| 24 | Go-Live & Cutover | Cutover runbook with rollback plan; DNS cutover for training.grohe.com; Post-launch monitoring setup (Cloud Run, Cloud SQL, Vercel); Hypercare period (Actum on-call post-launch) |

---

## Epic Detail

### Epic 1 — Foundation Configuration

Provision all GCP services, configure base environments, and establish CI/CD pipelines.

- CI/CD pipelines for Middleware
- Sitecore Multisite Configuration & GTC Site Setup
- Vercel multisite project configuration for GTC
- GTC site definition in Sitecore
- Local dev environment setup for GTC developers
- CI/CD pipelines in Vercel for GTC project
- Cloud SQL (PostgreSQL) instance provisioning
- Middleware project scaffold and Cloud Run deployment pipeline

---

### Epic 2 — Content Model & Data Templates

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

- Collection Page
- Story Page
- Quiz Page
- Data Items — Chapter, Course, Question, Menu Category
- GTC Home Page
- GTC General Page *(open question: reuse NEO page?)*

---

### Epic 3 — Main Layout and Navigation

- Menu Navigation
- Header
- Footer

---

### Epic 4 — Publishing Workflow

- Publishing Workflow implementation *(most probably reusing the NEO workflow; to be confirmed with client)*

---

### Epic 5 — Phrase Integration

Configure the existing Sitecore API connector for GTC content types. No new connector development required.

- Phrase Integration implementation

---

### Epic 6 — Cookies Consent Integration

Reuse existing OneTrust integration from NEO, configured for GTC.

- Cookies Consent integration implementation

---

### Epic 7 — Analytics

- GTM analytics integration

---

### Epic 8 — User Management

- IDP Authentication
- Login Page
- Partial Registration
- New Registration *(link to NEO Registration page)*

---

### Epic 9 — My Account

Standalone GTC feature at `training.grohe.com/my-account` — not integrated into NEO My Account.

- My Account (personal data: title, first/last name, email, country — read-only from IDP JWT)
- My Completed Courses (learning history list with thumbnail, title, completion date, Download Certificate CTA)

---

### Epic 10 — Learning Progress Tracking

End-to-end implementation of course tracking, completion logic, and related UI. Delivered as a single testable unit: a fully functional API that tracks user learning progress across courses and quizzes, with all associated UI states.

- Database schema implementation
- GTC Tracking Middleware implementation (course, chapter, quiz)
- Scroll-based chapter completion component (FE)
- Training completion status UI (module read indicators, quiz status, certificate CTA states)

---

### Epic 11 — Quiz Component

Custom development of all question types and the quiz container flow. **Largest implementation risk and primary cost driver.**

- Quiz component implementation (container, scoring logic, progress bar, pass/fail screen)
- Question types implementation:
  - Choice Question — single + multi-select (P1)
  - True / False (P1)
  - Per-question feedback (P1)
  - Value Estimation Slider (P2)
  - Drag & Drop Text (P3)
  - Drag & Drop Image (P3)
  - Sortable (P3)
  - Fill the Blank (P3)
- Quiz progress tracking FE

*Note: MVP question type scope to be confirmed at kickoff (open question #4).*

---

### Epic 12 — Certification Management

- Certificate Generation Middleware implementation (GCS cache check → PDF generation → Signed URL)
- Certificate PDF template implementation (GROHE/LIXIL logos, user name, course title, completion date, date format handling)

---

### Epic 13 — Forms

Two AJAX feedback entry points, no page reload.

- Feedback form (end-of-course: Training ID, User ID, Timestamp, Language, Market captured silently)
- Footer Form (general feedback, no course context)

---

### Epic 14 — Search

Authenticated-only. Sitecore Search scoped to GTC content (Collections, Stories, Quizzes). Real-time results after 3+ characters. WCAG 2.1 AA compliant.

- Search Implementation

---

### Epic 15 — Content Components

| Component | Notes |
|---|---|
| Slideshow / Text Slider | Adapt from NEO Media Cards Carousel |
| A/B Slider | Drag handle before/after interaction; adapt from Media Gallery |
| Accordion | Extend to accept teasers |
| Image Tabs | Add image-as-tab-label support |
| Hotspots | Extend NEO-398 (product-only) for GTC content use case |
| Editorial Text | Add scrolling animation for brand-story pages |

---

### Epic 16 — Looker Studio Integration

Replace manual Excel reporting with live automated pipeline: Cloud SQL → Datastream (CDC) → BigQuery → Looker Studio.

- Forms data integration
- Learning Data Integration

---

### Epic 17 — Personalisation

Component-level visibility controlled by the user's IDP access group. Scope covers both hide/show of individual content blocks on a page AND filtering of the training list by role availability.

- Personalization based on the Target Group implementation

---

### Epic 18 — Content Editor Roles and Permissions

- Set up the roles and permissions (~10 active editors)

---

### Epic 19 — User Tracking Migration

Migrate existing user tracking records from Craft CMS to Cloud SQL (PostgreSQL).

- Learning Data Migration

---

### Epic 20 — Content Migration

- Content Migration Automation (tooling: extractor, transformer, importer, media migrator, validation reporting)
- Content Migration per se (execution run, QA pass, remediation, content sign-off)

---

### Epic 21 — Launch (SEO & Domain)

*Blocked by domain decision (Egidijus Bartusis + Al-Wasir).*

- Domain finalization (training.grohe.com vs grohe.com/training)
- URL structure definition per content type across 19 languages
- Hreflang & canonical tag implementation
- Metadata templates (title, description, OG) per content type
- Sitemap generation and submission
- Redirects URL mapping delivery to NEO team

---

### Epic 22 — UAT & Quality Assurance

- E2E test suite (page types, quiz flows, tracking, forms, certificates)
- Accessibility audit (WCAG 2.1 AA)
- Cross-browser & cross-device testing
- Performance baseline (Core Web Vitals, Vercel, Cloud Run)
- Security review (JWT, Signed URLs, Middleware API, Cloud SQL)
- Content quality check (migrated content sign-off by GTC team)

---

### Epic 23 — Training & Handover

- Sitecore authoring training for GTC content editors
- Looker Studio dashboard walkthrough
- Middleware operational runbook (deployment, scaling, incident response)
- Handover to SoE for ongoing platform ownership

---

### Epic 24 — Go-Live & Cutover

- Cutover runbook with rollback plan
- DNS cutover for training.grohe.com
- Post-launch monitoring setup (Cloud Run, Cloud SQL, Vercel)
- Hypercare period (Actum on-call post-launch)

---

*Document prepared by Artsiom Dylevich, Actum Digital, as part of the GTC Discovery Phase deliverables.*
*For questions or feedback, contact: Artsiom Dylevich / Marianna Husar (Actum Digital)*
