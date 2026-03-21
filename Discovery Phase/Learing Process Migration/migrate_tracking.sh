#!/bin/bash
# =============================================================================
# GTC Tracking Data Migration: Craft CMS (MariaDB) → Cloud SQL (PostgreSQL)
# =============================================================================
#
# Reads from the local Craft MariaDB container and loads into the local
# PostgreSQL container. Handles ID resolution:
#   - userId (int) → IDP UUID via users.email
#   - courseId/playlistId/quizId/entryId (int) → element uid from elements table
#   - siteId (int) → locale string from sites table
#
# Non-UUID users (test accounts, numeric IDs) are skipped.
# Safe to re-run — uses INSERT ... ON CONFLICT DO NOTHING.
#
# Prerequisites:
#   - Docker containers running: craft-mariadb (port 3307), gtc-postgres (port 5433)
#   - Schema already created via init_schema.sql
# =============================================================================

set -euo pipefail

MARIA_CONTAINER="craft-mariadb"
PG_CONTAINER="gtc-postgres"
PG_DB="gtc"
PG_USER="gtc"
PG_PASS="gtc123"

TMPDIR="/tmp/gtc-migration"
mkdir -p "$TMPDIR"

echo "============================================"
echo "GTC Tracking Data Migration"
echo "============================================"
echo ""

# -------------------------------------------------------
# Helper: run MariaDB query → TSV file
# MariaDB --batch outputs \N for NULLs by default (PostgreSQL COPY compatible)
# -------------------------------------------------------
maria_export() {
    local query="$1"
    local outfile="$2"
    docker exec "$MARIA_CONTAINER" mariadb -uroot -pcraft123 grohe \
        --batch --skip-column-names -e "$query" 2>/dev/null \
        | sed 's/\tNULL/\t\\N/g; s/^NULL\t/\\N\t/g' > "$outfile"
}

# -------------------------------------------------------
# Helper: run PostgreSQL SQL (single session via heredoc)
# -------------------------------------------------------
pg_sql() {
    docker exec -i -e PGPASSWORD="$PG_PASS" "$PG_CONTAINER" \
        psql -U "$PG_USER" -d "$PG_DB"
}

# -------------------------------------------------------
# 1. Migrate course_progress
# -------------------------------------------------------
echo "[1/4] Extracting course tracking data from Craft..."

maria_export "
SELECT
    SUBSTRING_INDEX(u.email, '@', 1),
    e.uid,
    s.language,
    t.completed,
    CASE WHEN t.completed = 1 AND t.dateCreated != '0000-00-00 00:00:00'
         THEN t.dateCreated ELSE NULL END,
    NULLIF(t.dateCreated, '0000-00-00 00:00:00'),
    NULLIF(t.dateUpdated, '0000-00-00 00:00:00')
FROM this_tracking_courses t
JOIN users u    ON t.userId   = u.id
JOIN elements e ON t.courseId  = e.id
JOIN sites s    ON t.siteId   = s.id
WHERE u.email REGEXP '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}@'
" "$TMPDIR/courses.tsv"

COURSE_COUNT=$(wc -l < "$TMPDIR/courses.tsv")
echo "   Extracted $COURSE_COUNT course records (non-UUID users skipped)"
echo "   Loading into PostgreSQL..."

docker cp "$TMPDIR/courses.tsv" "$PG_CONTAINER:/tmp/courses.tsv"
pg_sql <<'SQL'
CREATE TABLE _stg_courses (
    user_id uuid, course_id uuid, locale varchar(10),
    completed int, completed_at timestamp, created_at timestamp, updated_at timestamp
);
COPY _stg_courses FROM '/tmp/courses.tsv';
INSERT INTO course_progress (user_id, course_id, locale, completed, completed_at, created_at, updated_at)
SELECT user_id, course_id, locale, completed::boolean, completed_at,
       COALESCE(created_at, now()), COALESCE(updated_at, now())
FROM _stg_courses
ON CONFLICT (user_id, course_id, locale) DO NOTHING;
DROP TABLE _stg_courses;
SQL

echo "   Done."

# -------------------------------------------------------
# 2. Migrate story_progress
# -------------------------------------------------------
echo ""
echo "[2/4] Extracting story (playlist) tracking data from Craft..."

maria_export "
SELECT
    SUBSTRING_INDEX(u.email, '@', 1),
    e.uid,
    s.language,
    t.completed,
    CASE WHEN t.completed = 1 AND t.dateCreated != '0000-00-00 00:00:00'
         THEN t.dateCreated ELSE NULL END,
    NULLIF(t.dateCreated, '0000-00-00 00:00:00'),
    NULLIF(t.dateUpdated, '0000-00-00 00:00:00')
FROM this_tracking_playlists t
JOIN users u    ON t.userId     = u.id
JOIN elements e ON t.playlistId = e.id
JOIN sites s    ON t.siteId     = s.id
WHERE u.email REGEXP '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}@'
" "$TMPDIR/stories.tsv"

STORY_COUNT=$(wc -l < "$TMPDIR/stories.tsv")
echo "   Extracted $STORY_COUNT story records"
echo "   Loading into PostgreSQL..."

docker cp "$TMPDIR/stories.tsv" "$PG_CONTAINER:/tmp/stories.tsv"
pg_sql <<'SQL'
CREATE TABLE _stg_stories (
    user_id uuid, story_id uuid, locale varchar(10),
    completed int, completed_at timestamp, created_at timestamp, updated_at timestamp
);
COPY _stg_stories FROM '/tmp/stories.tsv';
INSERT INTO story_progress (user_id, story_id, locale, completed, completed_at, created_at, updated_at)
SELECT user_id, story_id, locale, completed::boolean, completed_at,
       COALESCE(created_at, now()), COALESCE(updated_at, now())
FROM _stg_stories
ON CONFLICT (user_id, story_id, locale) DO NOTHING;
DROP TABLE _stg_stories;
SQL

echo "   Done."

# -------------------------------------------------------
# 3. Migrate quiz_progress
# -------------------------------------------------------
echo ""
echo "[3/4] Extracting quiz tracking data from Craft..."

maria_export "
SELECT
    SUBSTRING_INDEX(u.email, '@', 1),
    e.uid,
    s.language,
    t.currentScore,
    t.bestScore,
    t.worstScore,
    t.attempts,
    t.completed,
    NULLIF(t.bestAttempt, '0000-00-00 00:00:00'),
    NULLIF(t.worstAttempt, '0000-00-00 00:00:00'),
    CASE WHEN t.completed = 1 AND t.dateCreated != '0000-00-00 00:00:00'
         THEN t.dateCreated ELSE NULL END,
    NULLIF(t.dateCreated, '0000-00-00 00:00:00'),
    NULLIF(t.dateUpdated, '0000-00-00 00:00:00')
FROM this_tracking_quizzes t
JOIN users u    ON t.userId = u.id
JOIN elements e ON t.quizId = e.id
JOIN sites s    ON t.siteId = s.id
WHERE u.email REGEXP '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}@'
" "$TMPDIR/quizzes.tsv"

QUIZ_COUNT=$(wc -l < "$TMPDIR/quizzes.tsv")
echo "   Extracted $QUIZ_COUNT quiz records"
echo "   Loading into PostgreSQL..."

docker cp "$TMPDIR/quizzes.tsv" "$PG_CONTAINER:/tmp/quizzes.tsv"
pg_sql <<'SQL'
CREATE TABLE _stg_quizzes (
    user_id uuid, quiz_id uuid, locale varchar(10),
    current_score real, best_score real, worst_score real,
    attempts int, completed int,
    best_attempt_at timestamp, worst_attempt_at timestamp,
    completed_at timestamp, created_at timestamp, updated_at timestamp
);
COPY _stg_quizzes FROM '/tmp/quizzes.tsv';
INSERT INTO quiz_progress (user_id, quiz_id, locale, current_score, best_score, worst_score,
    attempts, completed, best_attempt_at, worst_attempt_at, completed_at, created_at, updated_at)
SELECT user_id, quiz_id, locale, current_score, best_score, worst_score,
    attempts, completed::boolean, best_attempt_at, worst_attempt_at, completed_at,
    COALESCE(created_at, now()), COALESCE(updated_at, now())
FROM _stg_quizzes
ON CONFLICT (user_id, quiz_id, locale) DO NOTHING;
DROP TABLE _stg_quizzes;
SQL

echo "   Done."

# -------------------------------------------------------
# 4. Migrate page_view (deduplicated)
# -------------------------------------------------------
echo ""
echo "[4/4] Extracting page view data from Craft (deduplicating)..."

maria_export "
SELECT
    SUBSTRING_INDEX(u.email, '@', 1),
    e.uid,
    s.language,
    COUNT(*),
    MIN(t.dateCreated),
    MAX(t.dateCreated)
FROM this_tracking_pages t
JOIN users u    ON t.userId  = u.id
JOIN elements e ON t.entryId = e.id
JOIN sites s    ON t.siteId  = s.id
WHERE u.email REGEXP '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}@'
GROUP BY SUBSTRING_INDEX(u.email, '@', 1), e.uid, s.language
" "$TMPDIR/pageviews.tsv"

PV_COUNT=$(wc -l < "$TMPDIR/pageviews.tsv")
echo "   Extracted $PV_COUNT deduplicated page view records (from 106K raw events)"
echo "   Loading into PostgreSQL..."

docker cp "$TMPDIR/pageviews.tsv" "$PG_CONTAINER:/tmp/pageviews.tsv"
pg_sql <<'SQL'
CREATE TABLE _stg_pageviews (
    user_id uuid, page_id uuid, locale varchar(10),
    view_count int, first_viewed_at timestamp, last_viewed_at timestamp
);
COPY _stg_pageviews FROM '/tmp/pageviews.tsv';
INSERT INTO page_view (user_id, page_id, locale, view_count, first_viewed_at, last_viewed_at)
SELECT user_id, page_id, locale, view_count, first_viewed_at, last_viewed_at
FROM _stg_pageviews
ON CONFLICT (user_id, page_id, locale) DO NOTHING;
DROP TABLE _stg_pageviews;
SQL

echo "   Done."

# -------------------------------------------------------
# Summary
# -------------------------------------------------------
echo ""
echo "============================================"
echo "Migration complete. Row counts:"
echo "============================================"

pg_sql <<'SQL'
SELECT 'course_progress' AS table_name, COUNT(*) AS rows FROM course_progress
UNION ALL
SELECT 'story_progress', COUNT(*) FROM story_progress
UNION ALL
SELECT 'page_view', COUNT(*) FROM page_view
UNION ALL
SELECT 'quiz_progress', COUNT(*) FROM quiz_progress
ORDER BY table_name;
SQL

# Cleanup
rm -rf "$TMPDIR"
echo ""
echo "Temp files cleaned up. Migration finished."
