# Craft CMS — Learning & Tracking Database Analysis

**Source:** Local MariaDB 10.11 Docker container (`craft-mariadb`, port 3307, database `grohe`)
**Dump:** `CRAFT database/db_backup_20260312-011002.sql`
**Analysed:** 15 March 2026

---

## Tracking Tables Overview

All learning/tracking data lives in tables prefixed with `this_tracking_`. Two `_state` tables exist but are empty (likely deprecated or unused).

| Table | Rows | Unique Users | Real Users* | Date Range | Purpose |
|---|---|---|---|---|---|
| `this_tracking_courses` | 2,267 | 569 | 566 | Apr 2024 – Mar 2026 | Course (Collection) completion records |
| `this_tracking_playlists` | 19,859 | 1,329 | 1,316 | Nov 2021 – Mar 2026 | Story/lesson completion records |
| `this_tracking_quizzes` | 1,905 | 622 | 612 | Nov 2021 – Mar 2026 | Quiz attempt & score records |
| `this_tracking_pages` | 106,282 | 1,922 | — | Mar 2024 – Mar 2026 | Page view / scroll events |
| `this_tracking_sessions` | 7,135 | 113 | — | Sep 2021 – Nov 2022 | Session tracking (abandoned?) |
| `this_tracking_downloads` | 796 | 223 | — | Apr 2024 – Feb 2026 | Certificate/file download events |
| `this_tracking_quiz_state` | 0 | — | — | — | Empty (deprecated) |
| `this_tracking_playlist_state` | 0 | — | — | — | Empty (deprecated) |
| `this_tracking_market_data` | 224 | — | — | — | Country code → name/region lookup |
| `this_tracking_useragents` | 696 | — | — | — | User-agent string lookup |

*\*Real users = excluding test accounts (`@companion.de`, `@this.work`)*

---

## Table Schemas

### `this_tracking_courses` — Course Completion (2,267 rows)

| Field | Type | Notes |
|---|---|---|
| id | int(11) PK | Auto-increment |
| courseId | int(11) FK | → `elements.id` (Collection entry) |
| siteId | int(11) FK | → `sites.id` (language) |
| userId | int(11) FK | → `users.id` |
| completed | tinyint(1) | Always `1` in current data — table only records completions |
| lastCompleted | datetime | **Always `0000-00-00 00:00:00`** — field exists but is never populated |
| dateCreated | datetime | When the record was first created |
| dateUpdated | datetime | Last update timestamp |
| uid | char(36) | UUID |

**Key finding:** This table only started recording data from **April 2024**. All 2,267 records show `completed=1` — there are no in-progress records. The `lastCompleted` field is never populated.

Sample data (joined to `elements_sites` for slugs):
```
courseId  slug                                                           site  completed  dateCreated
487971    grohe-rapido-smartbox-installation-overview                    ar    1          2024-05-09
582200    rapid-slx-installation-overview                               ar    1          2024-05-09
109347    brand-trainingspage                                           ar    1          2024-05-11
424089    creating-a-consistent-bathroom-experience-with-grohe          ar    1          2024-05-17
```

### `this_tracking_playlists` — Story/Lesson Completion (19,859 rows)

| Field | Type | Notes |
|---|---|---|
| id | int(11) PK | Auto-increment |
| playlistId | int(11) FK | → `elements.id` (Story/Playlist entry) |
| siteId | int(11) FK | → `sites.id` (language) |
| userId | int(11) FK | → `users.id` |
| completed | tinyint(1) | `1` = completed (19,679), `0` = in-progress (180) |
| dateCreated | datetime | First record creation |
| dateUpdated | datetime | Last update |
| uid | char(36) | UUID |

**Key finding:** This is the largest meaningful tracking table. Unlike courses, it does have both completed and in-progress records. Data goes back to November 2021.

### `this_tracking_quizzes` — Quiz Attempts & Scores (1,905 rows)

| Field | Type | Notes |
|---|---|---|
| id | int(11) PK | Auto-increment |
| quizId | int(11) FK | → `elements.id` (Quiz entry) |
| siteId | int(11) FK | → `sites.id` (language) |
| userId | int(11) FK | → `users.id` |
| currentScore | float | Most recent attempt score (ratio 0.0–1.0) |
| bestScore | float | Best score achieved across all attempts |
| worstScore | float | Worst score achieved |
| attempts | int(11) | Total attempt count (observed range: 1–36) |
| completed | tinyint(1) | `1` = passed (1,382), `0` = not yet passed (523) |
| lastCompleted | datetime | **Always `0000-00-00 00:00:00`** — never populated |
| bestAttempt | datetime | Timestamp of the best-scoring attempt |
| worstAttempt | datetime | Timestamp of the worst-scoring attempt |
| dateCreated | datetime | First record creation |
| dateUpdated | datetime | Last update |
| uid | char(36) | UUID |

**Key finding:** Rich tracking data. Each row is one user × one quiz × one site (language). Scores accumulate across attempts — the row is updated in place rather than creating new rows per attempt.

Sample data:
```
quizId  siteId  userId  currentScore  bestScore  worstScore  attempts  completed
78483   2       8       0             0          0           2         0
78483   1       8       0.428571      0.714286   0           18        1
80359   1       175529  0.25          0.875      0.25        8         1
```

### `this_tracking_pages` — Page View / Scroll Events (106,282 rows)

| Field | Type | Notes |
|---|---|---|
| id | int(11) PK | Auto-increment |
| entryId | int(11) FK | → `elements.id` |
| siteId | int(11) FK | → `sites.id` |
| userId | int(11) FK | → `users.id` |
| userAgentId | int(11) FK | → `this_tracking_useragents.id` |
| eventType | varchar(255) | Event classification |
| pageUrl | varchar(255) | URL of the tracked page |
| dateCreated | datetime | Event timestamp |
| dateUpdated | datetime | |
| uid | char(36) | UUID |

**Note:** This is the raw event log. At 106K rows it's the largest table but likely NOT needed for migration — the aggregate completion data in courses/playlists/quizzes is sufficient.

### `this_tracking_downloads` — File Downloads (796 rows)

| Field | Type | Notes |
|---|---|---|
| id | int(11) PK | Auto-increment |
| userId | int(11) FK | → `users.id` |
| userAgentId | int(11) FK | → `this_tracking_useragents.id` |
| url | varchar(255) | Downloaded file URL |
| dateCreated | datetime | Download timestamp |
| dateUpdated | datetime | |
| uid | char(36) | UUID |

### `this_tracking_sessions` — Session Tracking (7,135 rows, abandoned)

| Field | Type | Notes |
|---|---|---|
| id | int(11) PK | Auto-increment |
| userId | int(11) FK | → `users.id` |
| userAgentId | int(11) FK | → `this_tracking_useragents.id` |
| dateCreated | datetime | Session start |
| dateUpdated | datetime | |
| uid | char(36) | UUID |

**Note:** Only 113 unique users, data stops at November 2022 — likely this tracking was abandoned or replaced by `this_tracking_pages`.

### `this_tracking_market_data` — Country Lookup (224 rows)

| Field | Type | Notes |
|---|---|---|
| country_code | char(2) PK | ISO 2-letter country code |
| country_name | varchar(100) | Country display name |
| region | varchar(100) | Region grouping |

### `this_tracking_useragents` — User-Agent Lookup (696 rows)

| Field | Type | Notes |
|---|---|---|
| id | int(11) PK | Auto-increment |
| userAgent | varchar(255) UNIQUE | Raw user-agent string |
| dateCreated | datetime | |
| dateUpdated | datetime | |
| uid | char(36) | UUID |

---

## Completion Status Distribution

| Table | Completed | In Progress | Total |
|---|---|---|---|
| `this_tracking_courses` | 2,267 (100%) | 0 (0%) | 2,267 |
| `this_tracking_playlists` | 19,679 (99.1%) | 180 (0.9%) | 19,859 |
| `this_tracking_quizzes` | 1,382 (72.5%) | 523 (27.5%) | 1,905 |

---

## Site (Language) Distribution — Course Completions

| siteId | Records | Handle |
|---|---|---|
| 1 | 1,405 | enGB (en-GB) |
| 2 | 225 | de |
| 19 | 132 | (see sites table) |
| 22 | 95 | |
| 30 | 81 | |
| 20 | 65 | |
| 12 | 47 | |
| 14 | 47 | |
| 35 | 27 | |
| 8 | 24 | |
| 17 | 22 | |
| 13 | 18 | |
| 29 | 15 | |
| 6 | 15 | |
| 4 | 8 | |
| 31 | 8 | |
| 7 | 8 | |
| 9 | 8 | |
| 26 | 7 | |
| 33 | 7 | |
| 15 | 2 | |
| 25 | 1 | |

22 distinct siteIds used across course tracking records.

---

## Join Relationships

All tracking tables use Craft's internal element IDs and can be resolved to human-readable slugs and titles:

```
this_tracking_courses.courseId     → elements.id → elements_sites.slug (+ .uri)
this_tracking_playlists.playlistId → elements.id → elements_sites.slug (+ .uri)
this_tracking_quizzes.quizId       → elements.id → elements_sites.slug (+ .uri)
this_tracking_*.siteId             → sites.id → sites.handle (language code)
this_tracking_*.userId             → users.id → users.email (format: {IDP-UUID}@training.grohe.com)
```

---

## Related Table: `stc_quizmetainformation`

Quiz configuration data stored per quiz entry per site:

| Field | Type | Notes |
|---|---|---|
| elementId | int(11) FK | → quiz element |
| siteId | int(11) FK | → site/language |
| field_shuffleInteractions | tinyint(1) | Randomize question order |
| field_passingScore | smallint(3) | Pass threshold (e.g., 71 = ~5/7 correct) |
| field_numberOfInteractions | int(10) | Number of questions in quiz |
| field_headline | text | Quiz heading (e.g., "Quiz") |
| field_overline | text | Overline text (e.g., "Prove your knowledge") |
| field_text | text | Quiz description (HTML) |
| field_enableFeedback_bidmvcjr | tinyint(1) | Per-question feedback enabled |

---

## Migration Implications

### What to migrate (priority)

1. **`this_tracking_courses`** (2,267 rows) → `UserCourseProgress` in Cloud SQL
   - Map `courseId` → slug via `elements_sites`
   - Map `siteId` → language code via `sites`
   - Map `userId` → IDP UUID via `users.email`
   - All records are `completed=1`, so `completed_at` = `dateCreated` or `dateUpdated`

2. **`this_tracking_quizzes`** (1,905 rows) → `UserQuizProgress` in Cloud SQL
   - Richest data: scores, attempts, timestamps
   - Map same FK chain as courses

3. **`this_tracking_playlists`** (19,859 rows) → Consider whether story-level progress is needed in new system
   - If yes, needs a `UserStoryProgress` table in Cloud SQL (not currently in schema)
   - If no, this data can be archived but not actively migrated

### What to skip

- **`this_tracking_pages`** (106K rows) — raw events, not needed for user progress
- **`this_tracking_sessions`** (7K rows) — abandoned since Nov 2022
- **`this_tracking_downloads`** (796 rows) — certificate download log, not user progress
- **`this_tracking_quiz_state`** / **`this_tracking_playlist_state`** — empty

### Key concerns

1. **`this_tracking_courses` only has data from April 2024.** Any course completions before that date are NOT in this table. The `this_tracking_playlists` table (going back to Nov 2021) may be the only evidence of earlier completions. The workshop Q3 answer mentions a `GTC_Course_Statistics` Excel export that Jessica can generate from Craft — this may contain the full historical data.

2. **`lastCompleted` is always zero** — cannot be used as completion timestamp. Use `dateCreated` (first completion) or `dateUpdated` (most recent activity) instead.

3. **User ID mapping** — `userId` is Craft's internal integer ID. Must be resolved to `users.email` (`{IDP-UUID}@training.grohe.com`), then stripped to get the IDP UUID for the new system.

4. **Element ID to slug mapping** — `courseId`, `playlistId`, `quizId` are Craft element IDs. Must be joined to `elements_sites` (filtered by matching `siteId`) to get the slug. These slugs are the key linking old and new content.

5. **Volume is manageable** — total migration-relevant records: ~24K (courses + quizzes + playlists). No performance concerns.
