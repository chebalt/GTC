# GTC Project Plan Revised

Source: `GTC Project Plan Revised.xlsx` — **160 MD total** (BE=128, FE=32)

## Included User Stories (Include=1)

| # | Epic | Ticket | Size | DEV | QA | Total |
|---|------|--------|------|-----|-----|-------|
| 1 | Foundation | Cloud SQL (PostgreSQL) instance provisioning | S | 2.4 | 0.6 | 3 |
| 2 | Foundation | Middleware project scaffold and Cloud Run deployment pipeline | M | 4 | 1 | 5 |
| 3 | Content Model | Collection Page | M | 4 | 1 | 5 |
| 4 | Content Model | Story Page | M | 4 | 1 | 5 |
| 5 | Content Model | Quiz page | M | 4 | 1 | 5 |
| 6 | Navigation | Menu Navigation | M | 4 | 1 | 5 |
| 7 | Navigation | Hreflang & canonical tag implementation | XS | 0.8 | 0.2 | 1 |
| 8 | Phrase | Support for multi-site Sitecore solutions, setting fallback language | M | 4 | 1 | 5 |
| 9 | Analytics | GTM analytics integration | M | 4 | 1 | 5 |
| 10 | My Account | API user's courses (get data from DB) | M | 4 | 1 | 5 |
| 11 | My Account | My Completed Courses | M | 4 | 1 | 5 |
| 12 | Learning Progress | Database schema implementation | M | 4 | 1 | 5 |
| 13 | Learning Progress | GTC Tracking Middleware implementation 1:1 from CRAFT | M | 4 | 1 | 5 |
| 14 | Learning Progress | Scroll-based chapter completion component (FE) | S | 2.4 | 0.6 | 3 |
| 15 | Learning Progress | Training completion status UI (module read indicators, quiz status, certificate CTA states) | S | 2.4 | 0.6 | 3 |
| 16 | Quiz | Quiz component implementation | M | 4 | 1 | 5 |
| 17 | Quiz | Question types implementation | S | 2.4 | 0.6 | 3 |
| 18 | Quiz | Quiz progress tracking FE | M | 4 | 1 | 5 |
| 19 | Certification | Certificate Generation Middleware implementation with no GCP | M | 4 | 1 | 5 |
| 20 | Certification | Certificate PDF template implementation | M | 4 | 1 | 5 |
| 21 | Search | Search Implementation | M | 4 | 1 | 5 |
| 22 | Content Components | A/B Slider | M | 4 | 1 | 5 |
| 23 | Content Components | Hotspots | M | 4 | 1 | 5 |
| 24 | Looker Studio | Learning Data Integration | M | 4 | 1 | 5 |
| 25 | Personalisation | Personalization based on the Target Group implementation | M | 4 | 1 | 5 |
| 26 | Roles & Permissions | Set up the roles and permissions | S | 2.4 | 0.6 | 3 |
| 27 | User Tracking Migration | Learning Data Migration 1:1 with CRAFT | S | 2.4 | 0.6 | 3 |
| 28 | Content Migration | Content Migration Automation | L | 8 | 2 | 10 |
| 29 | Content Migration | Content Migration | S | 2.4 | 0.6 | 3 |
| 30 | Launch | Redirects URL mapping delivery to NEO team | S | 2.4 | 0.6 | 3 |
| 31 | UAT | Accessibility audit (WCAG 2.1 AA) | S | 2.4 | 0.6 | 3 |
| 32 | Training & Handover | Sitecore authoring training for GTC content editors | S | 2.4 | 0.6 | 3 |
| 33 | Training & Handover | Handover to SoE for ongoing platform ownership | M | 4 | 1 | 5 |
| 34 | Go-Live | Cutover runbook with rollback plan | S | 2.4 | 0.6 | 3 |
| 35 | Go-Live | DNS cutover for training.grohe.com | XS | 0.8 | 0.2 | 1 |
| 36 | Go-Live | Hypercare period (Actum on-call post-launch) | L | 8 | 2 | 10 |

## Excluded User Stories (Include=0) — with reasons

| Epic | Ticket | Size | Total | Reason |
|------|--------|------|-------|--------|
| Foundation | CI/CD pipelines for Middleware | S | 3 | Multi-Site Solution (separate repo) |
| Foundation | Sitecore Multisite Configuration & GTC Site Setup | M | 5 | Multi-Site Solution (separate repo) |
| Foundation | Vercel multisite project configuration for GTC | S | 3 | Multi-Site Solution (separate repo) |
| Foundation | GTC site definition in Sitecore | XS | 1 | Multi-Site Solution (separate repo) |
| Foundation | Local dev environment setup for GTC developers | S | 3 | Multi-Site Solution (separate repo) |
| Foundation | CI/CD pipelines in Vercel for GTC project | S | 3 | Multi-Site Solution (separate repo) |
| Foundation | Setting up the GCS instance | XS | 1 | No GCS — using Cloud Run caching |
| Middleware | Define middleware API contract (OpenAPI/Swagger) - analysis | M | 5 | Platform Agnostic way (descoped) |
| Middleware | Apigee setup | S | 3 | Apigee out of scope |
| Middleware | Akami setup - CDN for assets, APIs caching | S | 3 | Multi-Site Solution |
| Middleware | Loadbalancer setup | XS | 1 | Multi-Site Solution |
| Content Model | Data Items - Chapter, Course, Question, Menu Category | L | 10 | Data Items used separately |
| Content Model | GTC Home Page | M | 5 | NEO re-use |
| Content Model | GTC General Page | S | 3 | NEO re-use |
| Navigation | Header | M | 5 | Header is different (NEO reuse) |
| Navigation | Footer | S | 3 | Footer is different (NEO reuse) |
| Publishing Workflow | Publishing Workflow implementation | S | 3 | GTC has own Workflow (NEO reuse) |
| Phrase | Support for multi-site (L — full) | L | 10 | Multi-Site Solution |
| Cookies | Cookies Consent integration | XS | 1 | Reusing NEO |
| User Mgmt | IDP Authentication | M | 5 | Multi-Site Solution, NEO Tenant used |
| User Mgmt | Login Page | XS | 1 | NEO Tenant used |
| User Mgmt | Partial Registration | S | 3 | Reusing NEO, NEO Tenant used |
| User Mgmt | Login, logout functionality | S | 3 | Reusing NEO, NEO Tenant used |
| User Mgmt | APIs extension for GTC - multi tenant support | L | 10 | Multi-Site Solution, NEO Tenant used |
| User Mgmt | Header icon + dropdown menu | S | 3 | Multi-Site Solution, NEO Tenant used |
| User Mgmt | New Registration | XS | 1 | Reusing NEO, NEO Tenant used |
| My Account | Page template | S | 3 | Multi-Site Solution |
| My Account | User info | S | 3 | Multi-Site Solution |
| Learning Progress | GTC Tracking Middleware platform-independent and granular | XL | 15 | Platform Agnostic way (descoped) |
| Quiz | API for tracking and storing the answers | M | 5 | Platform Agnostic way (descoped) |
| Certification | Certificate Generation Middleware with GCP | L | 10 | No GCS — using Cloud Run caching |
| Forms | Feedback form | S | 3 | Email send only (descoped) |
| Forms | Footer Form | S | 3 | Email send only (descoped) |
| Forms | Middleware | M | 5 | Email send only (descoped) |
| Search | Middleware | M | 5 | NEO extension only |
| Content Components | Slideshow / Text Slider | M | 5 | Can use NEO slider |
| Content Components | Accordion | S | 3 | Can use RTE for teaser |
| Content Components | Image Tabs | M | 5 | Map to different NEO component |
| Content Components | Editorial Text | S | 3 | Parallax effect not needed |
| Looker Studio | CSV import | M | 5 | Direct connection, no CSV import |
| User Tracking Migration | Learning Data Migration (full/granular) | XL | 15 | Platform Agnostic way (descoped) |
| Launch | URL structure definition per content type across 19 languages | M | 5 | NEO logic |
| Launch | Sitemap generation and submission | S | 3 | Multi-Site Solution |
| UAT | E2E test suite (page types, quiz flows, tracking, forms, certificates) | L | 10 | Full coverage (descoped to accessibility) |
| UAT | Cross-browser & cross-device testing | M | 5 | Reduced scope |
| UAT | Performance baseline (Core Web Vitals, Vercel, Cloud Run) | S | 3 | Reduced scope |
| UAT | Security review (JWT, Signed URLs, Middleware API, Cloud SQL) | M | 5 | Multi-Site Solution |
| UAT | Content quality check (migrated content sign-off by GTC team) | M | 5 | GTC team responsibility |
| UAT | Monitoring - Vercel, middleware, website | S | 3 | Multi-Site Solution |
| Training | Looker Studio dashboard walkthrough | S | 3 | Dashboard already exists |
| Go-Live | Post-launch monitoring setup (Cloud Run, Cloud SQL, Vercel) | S | 3 | Multi-Site Solution |

## Timeline (14 weeks: W1 = 30 Mar, W14 = 3 Jul 2026)

| Epic | MD | Week |
|------|-----|------|
| Foundation (Cloud SQL + Middleware) | 8 | W2 |
| Content Model (Collection/Story/Quiz) | 15 | W5–W6 |
| Learning Progress Tracking | 16 | W3 |
| User Tracking Migration | 3 | W4 |
| Quiz Component & Question Types | 13 | W7 |
| My Account & User Courses | 10 | W10 |
| Content Migration (Automation + Run) | 13 | W6 |
| Certification (Generation + PDF) | 10 | W4 |
| Search Implementation | 5 | W11 |
| Content Components (A/B Slider, Hotspots) | 10 | W8 |
| Looker Studio Integration | 5 | W10 |
| Personalisation | 5 | W8 |
| Roles & Permissions | 3 | W9 |
| Navigation & Hreflang | 6 | W11 |
| Phrase Integration | 5 | W11 |
| Analytics (GTM) | 5 | W12 |
| Launch (Redirects + SEO) | 3 | W12 |
| UAT & Accessibility Audit | 3 | W12 |
| Training & Handover | 8 | W13 |
| Go-Live & Cutover (incl. Hypercare) | 14 | W14 |

## Assumptions (14 items)

1. No Multisite solution. GTC content incorporated into NEO content tree. Same repo and infrastructure.
2. No Google Cloud Storage for certificates. Cloud Run used for temporary cache.
3. Reusing CRAFT database schema for user learning progress. Following existing storing logic.
4. Apigee setup is out of scope.
5. Reusing NEO Header and Footer.
6. Reusing NEO Content workflow.
7. GTM analytics integration is standard only — no custom actions.
8. CSV import excluded. Direct Looker Studio connection used instead.
9. Components to implement: A/B Slider and Hotspots. Other components mapped to existing NEO ones.
10. Personalization rules developed in Sitecore but configured manually.
11. Search is only extension of NEO search: new dropdown section + new tab on results page.
12. Quiz question types: multiple choice and true/false only.
13. IDP Authentication: NEO tenant is used.
14. Not developing a platform-agnostic API available for other applications.
