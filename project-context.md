# GTC Project Context (Full Detail)

## Background
**GROHE Training Companion (GTC)** launched in 2022 as a training platform at training.grohe.com serving:
- Installers, Designers & Architects, Kitchen Studios, Showroom, DIY
- GROHE internal / Lixil employees, GROHE salespeople, local distributor salespeople

Operated on **Craft CMS 4.x** built by agency **THIS GmbH** (closed December 2025).
- Craft V4 LTS ends **April 2026**; support & licenses valid until **June 2026**
- THIS provides only minimal maintenance support post-December 2025
- Code held in THIS's private GitHub repo (NOT shared with GROHE)

## Strategic Driver
**Lixil "one platform strategy"** → integrate GTC into the NEO (Sitecore XM Cloud) ecosystem.
Selected path: Actum Digital migrates GTC to NEO (preferred over BAM agency takeover at €136k or buying THIS code).

## Financials
| Phase | Type | Amount | Period |
|---|---|---|---|
| Discovery | Fixed Price | €50,000 (discounted from €62,640) | Feb 2026 |
| Implementation | T&M | €150,000 (estimated) | Mar–Aug 2026 |
| **Total** | | **€200,000** | |

Sitecore Division: 70% (€35k Discovery) | ECM Division: 30% (€15k Discovery)
PO: 8100503322 | Offer: GR25120801 | Payment: 45 days net

## Source System Architecture (Craft CMS)

### Technical Stack
- **CMS/Backend:** Craft CMS 4.x + custom caching layer + JSON REST API
- **Frontend:** Nuxt.js SPA + SCSS (NodeJS app consuming JSON API)
  - Editor preview: Craft CMS auth + Craft cache
  - End user view: GROHE IDP auth + file cache
- **Search:** Elasticsearch 7.17 (Docker containerized)
- **Database:** MariaDB 10.11 (3 GB compressed, ~15 GB raw)
- **Hosting:** Hetzner Cloud, Nuremberg (16 vCPU, 64 GB RAM, 360 GB) — not LIXIL standard; GCP preferred
- **Web server:** Caddy | **OS:** Ubuntu 24.04
- **Monitoring:** Prometheus + Grafana
- **Backup:** Hetzner daily + Cloudflare R2 (MariaDB)
- **Network:** Cloudflare proxy (frontend) + Tailscale (SSH/admin)
- **Version control:** GitHub (GitHub Flow) — code not shared with GROHE
- **IDP:** GROHE IDP (SSO) for end users; Craft CMS user management for editors

### Caching
- 7 cache types × 20 languages = **140 cache combinations**
- Cache warmer is pre-engineered (not on-the-fly)
- Editors run "Cache Warmer" tool to publish content live

### Content Model
```
Collection (Course/Training Module)
  └─ Story (Chapter/Page)
       └─ Nugget (Content Piece/Component)
Quizzes → Questions (standalone or linked to Collection)
```
- Completion defined by **scroll depth** — green checkmark when user scrolls to bottom of Story
- Certificate generated when all required Stories in Collection completed AND quiz passed
- Certificates: PDF, one template (personalized by name + course), stored in CMS, downloaded manually
- Certificate retention: no security/digital signature requirements stated

### User Roles / Access Groups (Confirmed)
1. `grohe` — GROHE internal / Lixil employees (see everything incl. confidential)
2. `installer`
3. `architect & designer`
4. `kitchen studio`
5. `lixil`
6. `dev_only`
7. `showroom` (Showroom+ — in backlog, not yet live)

### Content Scale
- ~60 trainings (2–3 to be deprecated; 2 new launching before April 2026)
- 10–12 new trainings/year (A-launches); 1–3 months per course to produce
- 19 languages (not all content in all languages)
- ~10 active content editors; ~47 backend Lixil employees in Craft
- Database: 3 GB compressed text | Revisions: stored >180 days

### Media (all in Craft, NOT in Celum)
| Type | Count | Size |
|---|---|---|
| Images | 7,625 | 3.7 GB |
| Videos | 825 | 5.8 GB |
| Files | 173 | 1.1 GB |
| Audio | 1 | 1 MB |
| Transformed images | — | 25 GB |
| Cache | — | 21 GB |
| Database | — | 3 GB |

### Active Integrations
- **GROHE IDP** — SSO
- **Looker Studio** — reporting (data pushed via Excel export from Craft)
- **Phrase TMS** — translation (manual Excel import/export; no live API)
- **Cloudflare** — CDN/proxy
- **Google Analytics / GTM**
- Elasticsearch (internal, containerized)

### Backlog (Planned, Not Built)
- Phrase → direct API integration (eliminate manual Excel)
- Salesforce Data Cloud + Marketing Cloud
- GROHE+ installer loyalty program integration
- Showroom+ access group (new role)
- IDP-based registration form for GTC (better data quality)

## Target System (Sitecore XM Cloud / NEO)

### Key Decisions
- **Same IDP as NEO** → NO user/role migration needed
- **Content migrated "as is"** (no re-localization during migration; future new content uses English master)
- **Media → Celum DAM** (new GTC folder to be created in Celum by Aaron/SoE)
- **Full LMS integration: DESCOPED** for this phase
- **Personalization:** MVP = access-based visibility only (no behavioral personalization)
- **Workflow:** No complex approval workflow (mirrors current simplicity)
- **Salesforce:** Future goal only — not in scope for MVP
- **Certificates:** PDF-based, no digital signatures required

### Domain Decision (OPEN)
- Option A: Keep `training.grohe.com`
- Option B: Integrate into `www.grohe.com/de-de/training`
- Decision pending: Egidijus Bartusis (Egi, domain/SEO owner) + Al-Wasir (SEO contact)
- Note: Dev team works in same NEO repository either way; domain affects URL structure and redirects

### URL/Language Structure
- Standard NEO approach: ISO codes + locales (DE-DE, EN-GB, etc.)
- English master as fallback for untranslated content (same as NEO)

## Key URLs
- Live site: `https://training.grohe.com/`
- Login: `https://training.grohe.com/login`
- Backend API: `https://lc.training.grohe.this.work` (Learning Companion — will break post-migration)
- Looker Studio dashboard: `https://lookerstudio.google.com/reporting/4d8917d8-ab21-4f80-b024-95dc353c8791/page/p_8ddpx753rd`
- Jira SoE ticket: `https://lixilg.atlassian.net/browse/GSPA-240`
- Confluence content goals: `https://lixilg.atlassian.net/wiki/spaces/GNI/pages/5107646774`

## Discovery Phase Milestones
| MS | Description | Owner | Status |
|---|---|---|---|
| MS1 | Component mapping | Actum + SoE | **Done** |
| MS2 | Requirements in Confluence | GTC + SoE | In progress |
| MS3 | Integrations evaluated (Salesforce, Celum, Phrase, GTM, LMS) | Actum + SoE | Pending |
| MS4 | PoC for automated migration | Actum | Pending |
| MS5 | User data migration evaluated (training history) | Actum | Pending |
| MS6 | UX conception done and aligned | Sascha/Tarun + Actum | Pending |
| MS7 | UI designs for missing components in Figma | Sascha + Actum | Pending |
| MS8 | Legacy content reviewed; pages/assets to migrate defined | GTC + SoE | Pending |
| MS9 | Backlog created; migration effort estimated | Actum | Pending |

## Implementation Phase Milestones (pending Discovery)
| MS | Description | Owner |
|---|---|---|
| MS10 | GTC project set up in Sitecore; infrastructure integration prepared | Actum |
| MS11 | Required features and components developed | Actum |
| MS12 | Celum asset structure prepared; GTC team trained on Celum upload | SoE (Aaron) |
| MS13 | Content migration (automated + manual) to Celum and Sitecore | Actum + GTC + Anmsoft |
| MS14 | SEO strategy (URLs, metadata, redirects) implemented | Digital Campaigns (Al-Wasir) + Actum |
| MS15 | Tracking concept developed, implemented, validated | Digital Campaigns (Neele) + Actum |
| MS16 | Heatmap integration need clarified | SoE (Samir) |
| MS17 | GTC team trained on Sitecore authoring | SoE (Daniela) + Andreas Cibis |
| MS18 | User data and history migration executed | GTC + NEO team |
| MS19 | UAT for components + content quality check | Actum + SoE + GTC |
| MS20 | OneTrust cookie management + privacy policy updated | SoE + Digital Campaigns (Neele) |
| MS21 | Incremental rollout of key languages and markets | Actum |

## Risks & Issues
1. **THIS shutdown** — minimal support; code not shared with GROHE
2. **Craft V4 LTS ends April 2026** — hard deadline
3. **SCORM packages call THIS API at runtime** — lc.training.grohe.this.work will break post-migration
4. **Hardcoded Elasticsearch credentials** in distributed SCORM JS bundles — must be rotated immediately
5. **Hetzner not LIXIL standard** — infrastructure migration to GCP is open action
6. **2 new trainings launching April 2026** — must be accommodated without content freeze
7. **No sitemap/URL inventory** — redirects map effort unknown
8. **Historical training data migration** — major task, no strategy yet
9. **Quiz/question components** — all 8 types require full custom Sitecore development (largest implementation risk)
10. **Celum DAM migration** — assets not in Celum; risk of duplication on asset migration
11. **Phrase TMS** — currently manual Excel workflow; no live API connection
12. **No formal visual guidelines** — authoring has been author-driven in Craft CMS
