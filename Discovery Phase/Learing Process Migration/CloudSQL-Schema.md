# GTC Cloud SQL (PostgreSQL) — Tracking Schema

**Purpose:** Store user learning progress for the GTC application on Sitecore AI / NEO.
**Database:** Cloud SQL for PostgreSQL (GCP)
**Consumers:** GTC Middleware (Cloud Run), Looker Studio (direct connection)

---

## Design Decisions

1. **No `users` table** — User identity is the IDP UUID (type `uuid`), passed from the IDP token. No user profile data is stored in GTC's database.
2. **Content IDs are Sitecore Item IDs** — All content references (`course_id`, `story_id`, `quiz_id`) are Sitecore GUIDs (`uuid`).
3. **Language = ISO locale string** — Instead of a numeric `siteId` FK, we store the locale directly (e.g. `en-GB`, `de`, `fr`). This avoids a lookup table and is self-describing for Looker Studio.
4. **Tracking grain preserved** — One row per `(user_id, content_id, locale)`, matching Craft's model.
5. **Upsert pattern** — Middleware does `INSERT ... ON CONFLICT UPDATE` on the natural key. No duplicate rows.
6. **Timestamps use `timestamptz`** — All timestamps are timezone-aware (UTC).
7. **Playlist → Story** — Craft's "playlist" maps to "story" in the new schema, matching the existing Craft content hierarchy naming (Collection → Chapter → Story → Nugget).

---

## Schema

```sql
-- ============================================================
-- GTC Tracking Schema — Cloud SQL (PostgreSQL 15+)
-- ============================================================

-- --------------------
-- Course Progress
-- --------------------
-- Tracks completion of top-level training courses (Collections).
-- In Craft: this_tracking_courses (2,267 rows)
-- Grain: one row per user × course × locale

CREATE TABLE course_progress (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         uuid        NOT NULL,   -- IDP UUID
    course_id       uuid        NOT NULL,   -- Sitecore Item ID (Collection)
    locale          varchar(10) NOT NULL,   -- e.g. 'en-GB', 'de', 'fr'
    completed       boolean     NOT NULL DEFAULT false,
    completed_at    timestamptz,            -- when completion was first recorded
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT uq_course_progress UNIQUE (user_id, course_id, locale)
);

CREATE INDEX idx_course_progress_user    ON course_progress (user_id);
CREATE INDEX idx_course_progress_course  ON course_progress (course_id);


-- --------------------
-- Story Progress
-- --------------------
-- Tracks completion of individual stories within a course.
-- In Craft: this_tracking_playlists (19,859 rows)
-- Grain: one row per user × story × locale

CREATE TABLE story_progress (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         uuid        NOT NULL,   -- IDP UUID
    story_id        uuid        NOT NULL,   -- Sitecore Item ID (Story page)
    locale          varchar(10) NOT NULL,   -- e.g. 'en-GB', 'de', 'fr'
    completed       boolean     NOT NULL DEFAULT false,
    completed_at    timestamptz,            -- NULL while in-progress
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT uq_story_progress UNIQUE (user_id, story_id, locale)
);

CREATE INDEX idx_story_progress_user    ON story_progress (user_id);
CREATE INDEX idx_story_progress_story   ON story_progress (story_id);


-- --------------------
-- Page View Progress
-- --------------------
-- Tracks which pages/nuggets a user has viewed within a story.
-- Powers progress indicators ("3 of 5 nuggets viewed") and "resume where you left off".
-- In Craft: this_tracking_pages (106,282 rows — but only distinct user×page×locale matter)
-- Grain: one row per user × page × locale (deduplicated from Craft's raw event log)

CREATE TABLE page_view (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         uuid        NOT NULL,   -- IDP UUID
    page_id         uuid        NOT NULL,   -- Sitecore Item ID (Nugget/page)
    locale          varchar(10) NOT NULL,   -- e.g. 'en-GB', 'de', 'fr'
    view_count      int         NOT NULL DEFAULT 1,   -- number of times viewed
    first_viewed_at timestamptz NOT NULL DEFAULT now(),
    last_viewed_at  timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT uq_page_view UNIQUE (user_id, page_id, locale)
);

CREATE INDEX idx_page_view_user ON page_view (user_id);
CREATE INDEX idx_page_view_page ON page_view (page_id);


-- --------------------
-- Quiz Progress
-- --------------------
-- Tracks quiz attempts and scores. Updated in-place per attempt (not one row per attempt).
-- In Craft: this_tracking_quizzes (1,905 rows)
-- Grain: one row per user × quiz × locale

CREATE TABLE quiz_progress (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         uuid        NOT NULL,   -- IDP UUID
    quiz_id         uuid        NOT NULL,   -- Sitecore Item ID (Quiz page)
    locale          varchar(10) NOT NULL,   -- e.g. 'en-GB', 'de', 'fr'
    current_score   real,                   -- most recent attempt score (0.0–1.0)
    best_score      real,                   -- best score across all attempts
    worst_score     real,                   -- worst score across all attempts
    attempts        int         NOT NULL DEFAULT 0,
    completed       boolean     NOT NULL DEFAULT false,  -- true = passed
    best_attempt_at     timestamptz,        -- timestamp of best-scoring attempt
    worst_attempt_at    timestamptz,        -- timestamp of worst-scoring attempt
    completed_at    timestamptz,            -- first time user passed
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT uq_quiz_progress UNIQUE (user_id, quiz_id, locale)
);

CREATE INDEX idx_quiz_progress_user  ON quiz_progress (user_id);
CREATE INDEX idx_quiz_progress_quiz  ON quiz_progress (quiz_id);


```

---

## Mapping from Craft CMS

| Craft Table | → | Cloud SQL Table | Key Changes |
|---|---|---|---|
| `this_tracking_courses` | → | `course_progress` | `courseId` (int) → `course_id` (uuid), `siteId` (int) → `locale` (varchar), `userId` (int) → `user_id` (uuid) |
| `this_tracking_playlists` | → | `story_progress` | `playlistId` → `story_id`, same ID/locale mapping |
| `this_tracking_quizzes` | → | `quiz_progress` | All score fields preserved, `lastCompleted` dropped (was always zero), `completed_at` added |
| `this_tracking_pages` | → | `page_view` | Deduplicated: raw events collapsed to one row per user×page×locale, with `view_count` and first/last timestamps |
| `this_tracking_sessions` | | *not migrated* | Abandoned since Nov 2022 |
| `this_tracking_downloads` | | *not migrated* | Certificate download log, replaced by `certificate` table |
| `this_tracking_market_data` | | *not migrated* | Static country lookup — not needed |
| `this_tracking_useragents` | | *not migrated* | UA strings — not needed |

---

## Migration ID Resolution

During data migration, Craft integer IDs must be resolved to UUIDs:

```
Craft userId  → users.email → strip "@training.grohe.com" → IDP UUID (user_id)
Craft courseId/playlistId/quizId → elements_sites.slug → match to Sitecore Item ID (content_id)
Craft siteId  → sites.handle → locale string (e.g. 'enGB' → 'en-GB')
```

The slug-to-Sitecore-ID mapping will be produced as a CSV artifact during content migration (Epic 20), so tracking migration (Epic 19) depends on content migration completing first.

---

## Looker Studio Views

These views provide Looker Studio with the same reporting dimensions currently available via Craft's `GTC_*` tables:

```sql
-- Equivalent of GTC_Course_Statistics
CREATE VIEW v_course_statistics AS
SELECT
    cp.course_id,
    cp.locale,
    count(*)                                        AS total_enrollments,
    count(*) FILTER (WHERE cp.completed)            AS completions,
    min(cp.created_at)                              AS first_enrollment,
    max(cp.updated_at)                              AS last_activity
FROM course_progress cp
GROUP BY cp.course_id, cp.locale;

-- Equivalent of GTC_Quiz_Statistics
CREATE VIEW v_quiz_statistics AS
SELECT
    qp.quiz_id,
    qp.locale,
    count(*)                                        AS total_attempts,
    count(*) FILTER (WHERE qp.completed)            AS passes,
    round(avg(qp.best_score)::numeric, 3)           AS avg_best_score,
    sum(qp.attempts)                                AS total_individual_attempts,
    min(qp.created_at)                              AS first_attempt,
    max(qp.updated_at)                              AS last_activity
FROM quiz_progress qp
GROUP BY qp.quiz_id, qp.locale;
```

---

## Volume Estimate

| Table | Migrated Rows | Growth Rate | Year 1 Estimate |
|---|---|---|---|
| `course_progress` | 2,267 | ~100/month | ~3,500 |
| `story_progress` | 19,859 | ~400/month | ~25,000 |
| `page_view` | ~15,000* | ~500/month | ~21,000 |
| `quiz_progress` | 1,905 | ~40/month | ~2,400 |

*\*Estimated after deduplication: 106K raw events → ~15K distinct user×page×locale combinations*

Total: **~51,900 rows Year 1** — trivial for Cloud SQL. No partitioning or sharding needed.
