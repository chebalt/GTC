# Craft CMS — User Learning Progress Data Accessibility
**Date:** 2026-03-05
**Analyst:** Artsiom Dylevich
**Scope:** Read-only investigation of user and tracking data via GraphQL and HTTP.
**Status:** ✅ Complete — definitive conclusion reached.

---

## Executive Summary

**User learning progress data (course completions, quiz answers, quiz scores) is NOT accessible via GraphQL or any REST API endpoint.** The tracking data lives in custom MariaDB tables that are not exposed through Craft CMS's GraphQL layer. Direct database access is required to export historical user progress for migration.

What IS accessible via GraphQL: basic user profiles (2,891 users) with market and access group assignments.

---

## 1. What Was Investigated

| Method | Result |
|--------|--------|
| GraphQL schema introspection — all types | No tracking/progress/completion types found |
| GraphQL `users` query | Returns profile data only — no learning progress |
| Craft action controller endpoints (`/actions/*`) | All 404 (tracking-related) |
| Nuxt.js / frontend REST API paths | All 404 |
| `globalTracking_GlobalSet` | Course completion RULES only (not user data) |
| `completedCoursesModule` block type | A UI display component, not a data store |
| User `preferences` field | Craft UI preferences (language, locale) — not progress |

---

## 2. User Data Accessible via GraphQL

### 2.1 Basic profile
The `users` query returns:
- `id`, `uid`, `email`, `username`, `firstName`, `lastName`
- `status` (active / inactive / pending / suspended)
- `dateCreated`, `dateUpdated`
- `market` — 2-letter country code
- `accessgroup` — comma-separated role label(s)
- `preferences` — Craft UI prefs JSON (not learning data)

**No** course progress, quiz history, or completion data on the User type.

### 2.2 User population
| Metric | Value |
|--------|-------|
| Total users | **2,891** |
| Active | 2,870 |
| Suspended | 18 |
| Pending | 2 |
| Inactive | 1 |
| Content editors (Craft backend group) | **56** |

### 2.3 Access group distribution (frontend content access control)
| Group | Users |
|-------|-------|
| GROHE | 1,540 |
| Installer | 796 |
| Showroom | 191 |
| (none assigned) | 162 |
| Architects & Designers | 105 |
| LIXIL | 47 |
| DIY / E-com | 46 |
| Kitchen Studio | 10 |

### 2.4 Top markets
| Market | Users | Market | Users |
|--------|-------|--------|-------|
| de | 684 | nl | 155 |
| gb | 474 | pl | 93 |
| fr | 296 | cy | 79 |
| (none) | 170 | be | 74 |

User emails follow the pattern `{IDP-UUID}@training.grohe.com` — confirming that Craft users are auto-created from the GROHE IDP/SSO at first login.

---

## 3. What `globalTracking` Actually Contains

The `globalTracking_GlobalSet.courseData` field stores **course structure rules**, NOT user progress:

```
courseData_collections_BlockType:
  collection → { id, title, slug }   ← which collection
  stories    → [{ id, slug }]         ← which trainings/nuggets are REQUIRED for completion

courseData_compactTrainings_BlockType:
  compactTraining → { id, title, slug }  ← compact training entry
```

Of the 63 en-GB collections:
- **50** are configured as full `collections` with required story lists
- **13** are `compactTrainings`

This is course completion logic — not per-user progress state.

---

## 4. What `completedCoursesModule` Is

The `contentBuilder_completedCoursesModule_BlockType` is a Neo content block embedded on the "My Account" / profile page. Its fields are:
- `optionalHeading`, `textComponent`, `colorTheme` — pure layout/display settings

It has **no data fields**. The list of courses a user has completed is presumably fetched at runtime from a custom PHP controller or external service — not stored in this block.

---

## 5. Architecture of the Tracking System

Based on the investigation, the tracking system architecture is:

```
User action (course lesson viewed / quiz submitted)
         │
         ▼
Nuxt.js SPA frontend
         │ HTTP POST (custom Craft action or direct DB call)
         ▼
Custom Craft CMS PHP plugin (controller not exposed via this API key)
         │
         ▼
MariaDB custom tables (NOT in GraphQL schema)
   - user_course_progress (user_id, collection_slug, language, last_updated)
   - user_quiz_results    (user_id, quiz_slug, attempts, best_score, worst_score, completed)
   - (possibly: individual answer records)
```

The GraphQL schema is generated from Craft's standard entry/asset/user structure. Custom plugin tables are deliberately NOT surfaced in GraphQL — this is standard Craft CMS behavior.

---

## 6. Migration Implications

### 6.1 Data that CAN be migrated via GraphQL ✅
- User profiles (uid, email, market, access group) — 2,891 users
- All content (19 languages) — covered in `Craft-CMS-Localization-Analysis.md`
- Course completion rules (globalTracking courseData)
- All UI strings (globalUiTexts)

### 6.2 Data that REQUIRES direct MariaDB access ⚠️
| Data | Why DB needed |
|------|--------------|
| Course progress per user | Custom tables, not in GraphQL |
| Course completion status per user | Custom tables |
| Quiz attempt history | Custom tables |
| Quiz scores (best/worst) per user | Custom tables |
| Individual quiz answers per attempt | Unknown if stored; likely custom tables |
| Feedback responses | Custom tables |

### 6.3 Recommended DB export approach
From prior discovery: MariaDB 10.11 on Hetzner, ~3 GB compressed text. The following table names are likely (to be confirmed with Jessica / Craft admin access):
- A table tracking user × course × language progress with "last updated" timestamp
- A table tracking user × quiz completion with attempts/score data
- A table for feedback submissions

**Action needed:** Request DB read access (or ask Jessica/Grohe to run export queries) to extract:
```sql
SELECT * FROM craft_tracking_*;   -- or similar prefix
SHOW TABLES LIKE '%track%';
SHOW TABLES LIKE '%quiz%';
SHOW TABLES LIKE '%progress%';
SHOW TABLES LIKE '%complet%';
```

### 6.4 Scope reminder
Per existing project decisions: **historical tracking migration is still TBD** (marked as "major task, strategy TBD" in open questions). This investigation confirms it cannot be done via API alone — it requires deliberate DB-level effort and a decision on how much history to migrate (all-time vs. last 12 months, etc.).

---

## 7. Useful User Data Points for Migration Planning

- **2,870 active learners** (users with active status)
- **56 content editors** who use the Craft backend — these need Sitecore AI author roles configured
- Users are **IDP-first** (UUID-based emails) — no password migration needed. Same IDP handles authentication in Sitecore AI.
- `market` and `accessgroup` values must map to Sitecore AI roles/personalization rules during migration (Epic 18: Roles & Permissions).

---

*All queries in this investigation were READ-ONLY. No mutations were performed.*
*Scripts: `probe_user_tracking.js`, `probe_user_tracking2.js`*
