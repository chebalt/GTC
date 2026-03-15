# Automated Migration Plan — GROHE Training Companion (GTC)

**Project:** GTC Migration — Craft CMS → Sitecore AI (NEO)
**Document owner:** Artsiom Dylevich, Solution Architect, Actum Digital
**Version:** 1.0 — Discovery Phase deliverable
**Date:** 15 March 2026
**Status:** Draft for review

---

## 1. Scope

This document describes the automated migration approach for moving GTC content and user learning data from Craft CMS to Sitecore AI. It covers three migration streams:

| Stream | What | Source | Target |
|---|---|---|---|
| **A. Content** | Training pages, quizzes, questions, single pages | Craft CMS GraphQL API | Sitecore AI |
| **B. Media Assets** | Images, videos, files | Craft CMS file system (downloaded) | Celum DAM / Sitecore AI (TBD) |
| **C. Learning Progress** | Course completions, quiz scores, story progress | Craft CMS MariaDB | Cloud SQL (PostgreSQL) |

---

## 2. Content Migration (Stream A)

### 2.1 What Is Being Migrated

| Content Type | Unique Items | Localized Versions | Total Pages |
|---|---|---|---|
| Collections (Courses) | 65 | up to 28 locales | 930 |
| Stories (Trainings/Playlists) | 317 | up to 28 locales | 4,485 |
| Quizzes | 28 | up to 25 locales | 317 |
| Single Pages (Homepage, Imprint, Data Protection, Terms of Use) | 4 | up to 29 locales | 114 |
| **Total** | **414** | | **5,846** |

Full URL inventory: `Discovery Phase/Learing Process Migration/GTC-Full-URL-Inventory.md`

### 2.2 Approach

Content will be extracted automatically from the Craft CMS GraphQL API, which provides full read access to all 19 languages using the existing API token. A Proof of Concept (POC) export has already been completed during Discovery, confirming the approach works end-to-end.

**Migration steps:**

1. **Extract** — Automated scripts query the Craft GraphQL API for each content type across all locales, producing structured JSON files per training
2. **Transform** — Scripts map Craft content structures (Collections, Stories, Nuggets, Quizzes, Questions) to the Sitecore AI content model (pages, components, data items)
3. **Load** — Transformed content is imported into Sitecore AI using the Sitecore management API

### 2.3 POC Completed

During Discovery, a working export script was built and tested against live data:

- **Full export of "GROHE Ceramics Basics"** — one complete training with all stories, quiz, questions, and asset references (255 KB JSON output)
- **Asset manifest extraction** — 70 referenced assets identified and catalogued for one training
- **All 19 languages confirmed accessible** via the same API token

This POC validates that automated content extraction is feasible and does not require direct database access.

### 2.4 What Requires Manual QA

Automated migration produces a "first pass" that must be reviewed by content editors:

- Visual layout and component rendering on each page
- Image placement and sizing within components
- Quiz question display and answer validation
- Navigation structure and internal links between trainings

---

## 3. Media Asset Migration (Stream B)

### 3.1 Inventory

| Asset Type | Count | Size |
|---|---|---|
| Images | ~8,200 | 3.7 GB |
| Videos | ~740 | 5.8 GB |
| Files (PDFs, documents) | ~170 | 1.1 GB |
| Audio | 4 | < 1 MB |
| **Total** | **~9,100** | **~10.6 GB** |

### 3.2 Current Status

All assets have been downloaded from the Craft CMS server (9,113 of 9,114 files, ~10 GB) and are available as a zip archive shared with GROHE.

### 3.3 Approach — TBD

The asset migration approach is **pending a decision from GROHE** (Aaron / Andreas Fink). Before migration tooling can be designed, GROHE needs to:

1. Review the downloaded assets to determine whether equivalent files already exist in Celum
2. Confirm whether the assets meet the size and resolution requirements for Sitecore AI
3. Decide on the upload approach

Once the approach is confirmed, the migration will be automated using the asset manifest (mapping each asset to the pages where it is used).

---

## 4. Learning Progress Migration (Stream C)

### 4.1 What Is Being Migrated

User learning data is stored in custom MariaDB tables within Craft CMS. This data is **not accessible via any API** — direct database access is the only extraction path.

| Data Type | Records | Unique Users | Date Range |
|---|---|---|---|
| Course completions | 2,267 | 566 | April 2024 – March 2026 |
| Story/lesson completions | 19,859 | 1,316 | November 2021 – March 2026 |
| Quiz attempts & scores | 1,905 | 612 | November 2021 – March 2026 |
| **Total migration-relevant records** | **~24,000** | | |

Additional tables exist for page views (106K), downloads (796), and sessions (7K), but these are operational logs and are **not in scope** for migration.

### 4.2 Approach

1. **Extract** — Query the Craft MariaDB database to export course completions, quiz scores, and story progress, joining to user emails and content slugs for identification
2. **Transform** — Map Craft internal IDs to the new system identifiers:
   - User IDs → IDP UUIDs (via `users.email` which contains `{IDP-UUID}@training.grohe.com`)
   - Course/Quiz IDs → content slugs (via `elements_sites` table)
   - Site IDs → language codes (via `sites` table)
3. **Load** — Import transformed records into the Cloud SQL (PostgreSQL) `UserCourseProgress` and `UserQuizProgress` tables

### 4.3 Key Consideration

**Course completion data only goes back to April 2024.** The `this_tracking_courses` table was apparently introduced or reset at that point. Quiz and story tracking data goes back to November 2021.

### 4.4 Volume & Complexity

The total volume of ~24,000 records is small and presents no technical challenge. The data is clean, relational, and well-structured. The primary effort is in building and validating the ID mapping (Craft internal IDs → slugs → Sitecore identifiers).

---

*Document prepared by Artsiom Dylevich, Actum Digital, as part of the GTC Discovery Phase deliverables.*
*For questions or feedback, contact: Artsiom Dylevich / Marianna Husar (Actum Digital)*
