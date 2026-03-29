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

---

## Question Templates (child items under Quiz Page)

### _GtcQuestionBaseTemplate (Foundation)

Inherited by all 6 question type templates.

#### GTC Question section

| Field | Type | Versioning | Notes |
|---|---|---|---|
| QuestionOverline | Single-Line Text | Versioned | Text above the question (e.g. category label) |
| QuestionText | Rich Text | Versioned | The question itself (HTML) |
| QuestionInstruction | Rich Text | Versioned | Instruction text (e.g. "Select the right answers") |
| QuestionImage | Image | Shared | Optional image for the question |

#### GTC Question Feedback section

| Field | Type | Versioning | Notes |
|---|---|---|---|
| PositiveFeedbackText | Rich Text | Versioned | Shown when answered correctly |
| NegativeFeedbackText | Rich Text | Versioned | Shown when answered incorrectly |
| SolutionFeedbackText | Rich Text | Versioned | Solution explanation (optional) |

### GTC Choice Question

Inherits: `_GtcQuestionBaseTemplate`. Insert options: GTC Choice Answer.

| Field | Type | Versioning | Notes |
|---|---|---|---|
| ForceMultipleChoice | Checkbox | Shared | Force multi-select even if only 1 correct |
| DisableShuffle | Checkbox | Shared | Prevent shuffling of answer order |

**GTC Choice Answer** (child item): AnswerText (Rich Text, Versioned), IsCorrect (Checkbox, Shared), AnswerImage (Image, Shared)

### GTC True False Question

Inherits: `_GtcQuestionBaseTemplate`.

| Field | Type | Versioning | Notes |
|---|---|---|---|
| TrueLabel | Single-Line Text | Versioned | Custom label for True option |
| FalseLabel | Single-Line Text | Versioned | Custom label for False option |
| CorrectAnswer | Checkbox | Shared | Checked = True is correct |

### GTC Value Slider Question

Inherits: `_GtcQuestionBaseTemplate`.

| Field | Type | Versioning | Notes |
|---|---|---|---|
| MinValue | Integer | Shared | Minimum slider value |
| MaxValue | Integer | Shared | Maximum slider value |
| Steps | Single-Line Text | Shared | Step increment (supports decimals) |
| InitialValue | Integer | Shared | Starting slider position |
| CorrectValue | Integer | Shared | The correct answer value |
| CorrectThreshold | Integer | Shared | Tolerance margin (empty = exact match) |
| MinLabel | Single-Line Text | Versioned | Label at minimum end |
| MaxLabel | Single-Line Text | Versioned | Label at maximum end |
| ValueLabel | Single-Line Text | Versioned | Unit label (e.g. "mm") |

### GTC Drag Drop Question

Inherits: `_GtcQuestionBaseTemplate`. Insert options: GTC Drag Drop Pair.

| Field | Type | Versioning | Notes |
|---|---|---|---|
| DisableShuffle | Checkbox | Shared | Prevent shuffling of drag items |

**GTC Drag Drop Pair** (child item): DragText (Rich Text, Versioned), DragImage (Image, Shared), DropText (Rich Text, Versioned), DropImage (Image, Shared). Correct answer = the pairing itself.

### GTC Fill Blank Question

Inherits: `_GtcQuestionBaseTemplate`.

| Field | Type | Versioning | Notes |
|---|---|---|---|
| BlankText | Rich Text | Versioned | Text with ___ markers where blanks appear |

### GTC Sortable Question

Inherits: `_GtcQuestionBaseTemplate`. Insert options: GTC Sortable Item.

**GTC Sortable Item** (child item): ItemText (Rich Text, Versioned). Correct order = item sort order.

---

## Design Notes

1. **Quiz questions** — child items under the Quiz page. Each question type gets its own template inheriting `_GtcQuestionBaseTemplate`. Answer options (Choice, DragDrop, Sortable) are child items under the question. Order preserved via `__Sortorder`.

2. **Nuggets eliminated** — their component content (text, image, video, multicolumn, tabs, sliders, etc.) will be placed as renderings directly on Story pages via the Experience Editor.

3. **Taxonomy** — **Resolved:** rely on ITaggableTemplate for generic tagging (ContentTags removed). MainCategories kept as a GTC-specific custom field on Collection and Story via `_GtcTaxonomyTemplate`.

4. **Common fields** — **Resolved:** Overline, Subline, ColorTheme, and ProductlineTheme extracted into `_GtcBasePageTemplate`. Lookup fields (ColorTheme, ProductlineTheme, CourseType, MainCategories) use Droplink/Multilist pointing to Data folder items via enhanced Sitecore queries.

5. **Course completion** — In Craft, completion rules were stored globally (`globalTracking.courseData`). In Sitecore AI, they move to the Collection's `RequiredItems` field — each Collection owns its own completion definition.

6. **Navigation** — **Resolved:** Navigation fields removed (ParentCollection, NextChapter, PreviousChapter, RelatedContent, CorrespondingTraining). Hierarchy is implicit via content tree structure. Chapter order defined by `__Sortorder` on Story/Quiz items under Collection.
