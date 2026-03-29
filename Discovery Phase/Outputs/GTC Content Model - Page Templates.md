# GTC Content Model — Page Templates Proposal

**Date:** 2026-03-23
**Author:** Artsiom Dylevich
**Status:** Draft — pending review

---

## Overview

Three new page templates for GTC training content, placed at:
`/sitecore/templates/Project/Grohe Neo/Pages/`

All three inherit the same base templates as **General Page**:
- **_BasePageTemplate** → Headline (Single-Line Text, default `$name`), Description (Rich Text), AssetMedia (Droplink), SEO (Title, MetaDescription, MetaKeywords, BlockTitle), Analytics (PageCategory, PageName)
- **ITaggableTemplate** → Tagging
- **IPageAssetMedia** → Page asset media
- **IIndexableTemplate** → IncludeForSearch (Checkbox)

Nuggets are **not** a separate page type — their components are placed directly on Collection/Story/Quiz pages via renderings.

---

## _GtcBasePageTemplate (Foundation)

Path: `/sitecore/templates/Foundation/Grohe Neo/GTC/_GtcBasePageTemplate`

Inherited by all three GTC page templates to avoid field duplication.

### GTC Content section

| Field | Type | Versioning | Notes |
|---|---|---|---|
| Overline | Single-Line Text | Versioned | Translatable text above headline |
| Subline | Rich Text | Versioned | Translatable text below headline |

### GTC Settings section

| Field | Type | Versioning | Notes |
|---|---|---|---|
| ColorTheme | Droplist | Shared | Values: "light", "medium", "dark" |
| ProductlineTheme | Droplist | Shared | Values: "standard" + brand variants |

---

## Collection Page

Maps to Craft CMS `courses_courses_Entry` (Collections + Trainings/Playlists).

Inherits: `_GtcBasePageTemplate` (Overline, Subline, ColorTheme, ProductlineTheme)

### GTC Content section

| Field | Type | Versioning | Notes |
|---|---|---|---|
| HeroText | Rich Text | Versioned | Hero banner descriptive text |

### GTC Settings section

| Field | Type | Versioning | Notes |
|---|---|---|---|
| CourseType | Droplist | Shared | Values: "Course", "Compact Training" |
| IsHero | Checkbox | Shared | Show hero stage layout |

### GTC Structure section

| Field | Type | Versioning | Notes |
|---|---|---|---|
| Chapters | Multilist | Shared | Ordered list of Story + Quiz child pages |
| RequiredItems | Multilist | Shared | Stories/Quizzes required for course completion (migrated from Craft `globalTracking.courseData`) |

### GTC Taxonomy section

| Field | Type | Versioning | Notes |
|---|---|---|---|
| MainCategories | Multilist | Shared | Primary content categories (48 Craft `mainCategory` items: PROFESSIONAL, SPA, WATERSYSTEMS, ATRIO, etc.) |

---

## Story Page

Maps to Craft CMS `trainings_trainings_Entry` + `lessons_lessons_Entry` (Training/Playlist pages with nugget content placed inline).

Inherits: `_GtcBasePageTemplate` (Overline, Subline, ColorTheme, ProductlineTheme)

### GTC Content section

| Field | Type | Versioning | Notes |
|---|---|---|---|
| ReadingTime | Single-Line Text | Shared | e.g. "10 min" — not language-dependent |

### GTC Settings section

| Field | Type | Versioning | Notes |
|---|---|---|---|
| TrainingActivity | Single-Line Text | Shared | Tracking label for analytics |

### GTC Navigation section

| Field | Type | Versioning | Notes |
|---|---|---|---|
| ParentCollection | Droptree | Shared | Back-link to owning Collection |
| NextChapter | Droptree | Shared | Next Story/Quiz in sequence |
| PreviousChapter | Droptree | Shared | Previous Story in sequence |
| RelatedContent | Multilist | Shared | Related stories for "See also" |

### GTC Taxonomy section

| Field | Type | Versioning | Notes |
|---|---|---|---|
| MainCategories | Multilist | Shared | Primary content categories |

---

## Quiz Page

Maps to Craft CMS `quizzes_quizzes_Entry`.

Inherits: `_GtcBasePageTemplate` (Overline, Subline, ColorTheme, ProductlineTheme)

### GTC Content section

| Field | Type | Versioning | Notes |
|---|---|---|---|
| InstructionText | Rich Text | Versioned | Quiz intro/instructions |

### GTC Quiz Configuration section

| Field | Type | Versioning | Notes |
|---|---|---|---|
| PassingScore | Integer | Shared | Percentage threshold (0–100) |
| NumberOfQuestions | Integer | Shared | How many questions to show per attempt from the pool |
| ShuffleQuestions | Checkbox | Shared | Randomize question order |
| EnableFeedback | Checkbox | Shared | Show per-question feedback |
| TrainingActivity | Single-Line Text | Shared | Tracking label |

### GTC Quiz Feedback section

| Field | Type | Versioning | Notes |
|---|---|---|---|
| PassHeadline | Single-Line Text | Versioned | Heading shown on pass |
| PassText | Rich Text | Versioned | Message shown on pass |
| PassImage | Image | Shared | Image for pass screen |
| FailHeadline | Single-Line Text | Versioned | Heading shown on fail |
| FailText | Rich Text | Versioned | Message shown on fail |
| FailImage | Image | Shared | Image for fail screen |

### GTC Navigation section

| Field | Type | Versioning | Notes |
|---|---|---|---|
| ParentCollection | Droptree | Shared | Back-link to owning Collection |
| CorrespondingTraining | Droptree | Shared | The Story/Training this quiz belongs to |

---

## Design Notes

1. **Quiz questions** — will be child items under the Quiz page (not a field). Each question type (Choice, True/False, Value Slider, Drag & Drop, Fill in the Blank, Sortable) gets its own data template. This mirrors Sitecore's pattern for ordered, owned sub-content.

2. **Nuggets eliminated** — their component content (text, image, video, multicolumn, tabs, sliders, etc.) will be placed as renderings directly on Story pages via the Experience Editor.

3. **Taxonomy** — ~~Decision needed: keep custom fields, or rely on inherited ITaggableTemplate?~~ **Resolved:** rely on ITaggableTemplate for generic tagging (ContentTags removed). MainCategories kept as a GTC-specific custom field on Collection and Story for product-line/topic filtering (maps to Craft's 48 `mainCategory` items).

4. **Common fields** — ~~Decision needed: extract into a shared `_GtcBasePageTemplate`?~~ **Resolved:** yes — Overline, Subline, ColorTheme, and ProductlineTheme extracted into `_GtcBasePageTemplate` foundation template, inherited by all three page templates.

5. **Course completion** — In Craft, completion rules were stored globally (`globalTracking.courseData`). In Sitecore AI, they move to the Collection's `RequiredItems` field — each Collection owns its own completion definition.

6. **Navigation fields** — PreviousChapter/NextChapter on Story and CorrespondingTraining on Quiz enable sequential navigation. These are Shared (same structure across languages). Alternative: derive navigation from Chapters ordering on the parent Collection (would remove the need for these fields but add runtime logic).
