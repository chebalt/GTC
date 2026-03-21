-- ============================================================
-- GTC Tracking Schema — Cloud SQL (PostgreSQL 15+)
-- Run against the 'gtc' database after container creation.
-- ============================================================

-- --------------------
-- Course Progress
-- --------------------
CREATE TABLE IF NOT EXISTS course_progress (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         uuid        NOT NULL,
    course_id       uuid        NOT NULL,
    locale          varchar(10) NOT NULL,
    completed       boolean     NOT NULL DEFAULT false,
    completed_at    timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT uq_course_progress UNIQUE (user_id, course_id, locale)
);

CREATE INDEX IF NOT EXISTS idx_course_progress_user   ON course_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_course ON course_progress (course_id);

-- --------------------
-- Story Progress
-- --------------------
CREATE TABLE IF NOT EXISTS story_progress (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         uuid        NOT NULL,
    story_id        uuid        NOT NULL,
    locale          varchar(10) NOT NULL,
    completed       boolean     NOT NULL DEFAULT false,
    completed_at    timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT uq_story_progress UNIQUE (user_id, story_id, locale)
);

CREATE INDEX IF NOT EXISTS idx_story_progress_user  ON story_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_story_progress_story ON story_progress (story_id);

-- --------------------
-- Page View Progress
-- --------------------
CREATE TABLE IF NOT EXISTS page_view (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         uuid        NOT NULL,
    page_id         uuid        NOT NULL,
    locale          varchar(10) NOT NULL,
    view_count      int         NOT NULL DEFAULT 1,
    first_viewed_at timestamptz NOT NULL DEFAULT now(),
    last_viewed_at  timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT uq_page_view UNIQUE (user_id, page_id, locale)
);

CREATE INDEX IF NOT EXISTS idx_page_view_user ON page_view (user_id);
CREATE INDEX IF NOT EXISTS idx_page_view_page ON page_view (page_id);

-- --------------------
-- Quiz Progress
-- --------------------
CREATE TABLE IF NOT EXISTS quiz_progress (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         uuid        NOT NULL,
    quiz_id         uuid        NOT NULL,
    locale          varchar(10) NOT NULL,
    current_score   real,
    best_score      real,
    worst_score     real,
    attempts        int         NOT NULL DEFAULT 0,
    completed       boolean     NOT NULL DEFAULT false,
    best_attempt_at     timestamptz,
    worst_attempt_at    timestamptz,
    completed_at    timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT uq_quiz_progress UNIQUE (user_id, quiz_id, locale)
);

CREATE INDEX IF NOT EXISTS idx_quiz_progress_user ON quiz_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_progress_quiz ON quiz_progress (quiz_id);

-- --------------------
-- Content ID Mapping
-- --------------------
CREATE TABLE IF NOT EXISTS content_id_map (
    craft_element_id    int             NOT NULL,
    craft_uid           uuid            NOT NULL,
    sitecore_item_id    uuid            NOT NULL DEFAULT gen_random_uuid(),
    section             varchar(50)     NOT NULL,
    entry_type          varchar(50)     NOT NULL,
    slug                varchar(255),
    craft_uri           varchar(255),

    CONSTRAINT pk_content_id_map PRIMARY KEY (craft_element_id),
    CONSTRAINT uq_content_id_map_craft_uid UNIQUE (craft_uid),
    CONSTRAINT uq_content_id_map_sitecore_id UNIQUE (sitecore_item_id)
);

CREATE INDEX IF NOT EXISTS idx_content_id_map_section ON content_id_map (section);
CREATE INDEX IF NOT EXISTS idx_content_id_map_slug ON content_id_map (slug);

-- --------------------
-- Locale Mapping
-- --------------------
CREATE TABLE IF NOT EXISTS locale_map (
    craft_locale    varchar(10) NOT NULL PRIMARY KEY,
    sitecore_locale varchar(10) NOT NULL
);

INSERT INTO locale_map (craft_locale, sitecore_locale) VALUES
    ('en-GB', 'en-GB'),
    ('de',    'de-DE'),
    ('fr',    'fr-FR'),
    ('nl',    'nl-NL'),
    ('es',    'es-ES'),
    ('ar',    'ar-SA'),
    ('pt',    'pt-PT'),
    ('it',    'it-IT'),
    ('ru',    'ru-RU'),
    ('el',    'el-GR'),
    ('cs',    'cs-CZ'),
    ('uk',    'uk-UA'),
    ('bg',    'bg-BG'),
    ('da',    'da-DK'),
    ('pl',    'pl-PL'),
    ('tr',    'tr-TR'),
    ('fi',    'fi-FI'),
    ('nb',    'nb-NO'),
    ('hu',    'hu-HU'),
    ('hr',    'hr-HR'),
    ('sv',    'sv-SE'),
    ('mn',    'mn-MN'),
    ('en',    'en'),
    ('lv',    'lv-LV'),
    ('lt',    'lt-LT'),
    ('ro',    'ro-RO'),
    ('he',    'he-IL'),
    ('sl',    'sl-SI'),
    ('et',    'et-EE')
ON CONFLICT (craft_locale) DO NOTHING;

-- --------------------
-- Looker Studio Views
-- --------------------
CREATE OR REPLACE VIEW v_course_statistics AS
SELECT
    cp.course_id,
    cp.locale,
    count(*)                                        AS total_enrollments,
    count(*) FILTER (WHERE cp.completed)            AS completions,
    min(cp.created_at)                              AS first_enrollment,
    max(cp.updated_at)                              AS last_activity
FROM course_progress cp
GROUP BY cp.course_id, cp.locale;

CREATE OR REPLACE VIEW v_quiz_statistics AS
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
