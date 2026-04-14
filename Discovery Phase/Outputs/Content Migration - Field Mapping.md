# GTC Content Migration — Field Mapping

**Version:** 1.0  
**Date:** 14 April 2026  
**Author:** Artsiom Dylevich  
**Source:** Craft CMS GraphQL API (`lc.training.grohe.this.work/api`)  
**Target:** Sitecore AI (NEO platform)  
**Data snapshot:** `craft-export.json` (12 Apr 2026)

---

## Table of Contents

1. [Collection Page (Course)](#1-collection-page-course)
2. [Story Page (Training/Lesson)](#2-story-page-traininglesson)
3. [Quiz Page](#3-quiz-page)
4. [Question Types](#4-question-types)
   - 4.1 Choice Question
   - 4.2 True/False Question
   - 4.3 Value Slider Question
   - 4.4 Drag & Drop Question
   - 4.5 Fill in the Blank Question
   - 4.6 Sortable Ranking Question
5. [Global / Lookup Data](#5-global--lookup-data)
6. [Structural / Navigation Fields](#6-structural--navigation-fields)
7. [Content Builder Blocks (Inline Components)](#7-content-builder-blocks-inline-components)
8. [Fields NOT Migrated](#8-fields-not-migrated)
9. [Transformation Rules](#9-transformation-rules)

---

## 1. Collection Page (Course)

**Craft type:** `courses_courses_Entry` (63 items)  
**Sitecore template:** Collection Page `{b5f566f0-776f-2143-6186-4f700b7f1293}`  
**Inherits:** `_GtcBasePageTemplate`, `_GtcTaxonomyTemplate`, `_BasePageTemplate`, `ITaggableTemplate`, `IPageAssetMedia`, `IIndexableTemplate`

| # | Craft Field | Craft Path | Craft Type | Sitecore Field | Sitecore Type | Versioned | Transform | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | title | `title` | String | Headline | Single-Line Text | Yes | Direct copy | Page title; also maps to `NavigationTitle` |
| 2 | slug | `slug` | String | — (URL segment) | — | — | URL construction | Used as Sitecore item name |
| 3 | uid | `uid` | UUID | — (external ID) | — | — | Stored in `content-id-map.json` | Cross-language linking key |
| 4 | overline | `stage[0].overline` | String | Overline | Single-Line Text | Yes | Direct copy | Text above headline |
| 5 | headline | `stage[0].headline` | String | — | — | — | Skip | Redundant with `title` |
| 6 | subline | `stage[0].subline` | String | Subline | Rich Text | Yes | Direct copy (nullable) | Text below headline |
| 7 | keyvisual URL | `stage[0].keyvisual[0].url` | Asset ref | KeyvisualUrl | Single-Line Text | Shared | Prepend base URL | Relative path → full CDN URL |
| 8 | colorTheme | `colorTheme` | Dropdown | ColorTheme | Droplink | Shared | Lookup → GUID | See [lookup table](#color-theme) |
| 9 | productlineTheme | `productlineTheme` | Dropdown | ProductlineTheme | Droplink | Shared | Lookup → GUID | See [lookup table](#productline-theme) |
| 10 | isLandingpage | `isLandingpage` | Boolean | IsHero | Checkbox | Shared | `true` → `1` | Show hero stage layout |
| 11 | heroText | `collectionData[0].heroText` | Rich Text | HeroText | Rich Text | Yes | Direct copy (nullable) | Hero banner descriptive text; often empty |
| 12 | topic | `topic` | String | — | — | — | Skip | Internal label, not rendered in Sitecore |
| 13 | mainCategories | `taxonomy[0].mainCategories[]` | Entry refs | MainCategories | Multilist | Shared | Slug → GUID | See [category lookup](#main-categories-48-items) |
| 14 | courseType | `globalTracking.courseData[].__typename` | Derived | CourseType | Droplink | Shared | Typename → GUID | `courseData_collections_BlockType` → Course; `courseData_compactTrainings_BlockType` → Compact Training |
| 15 | requiredItems | `globalTracking.courseData[].stories[]` | Entry refs | RequiredItems | Multilist | Shared | Slug → Sitecore item ID | **CRITICAL:** Extracted from global set, NOT per-entry. See [transformation rule 4](#4-course-completion-rules-globaltracking) |

---

## 2. Story Page (Training/Lesson)

**Craft types:** `trainings_trainings_Entry` (273 items) + `lessons_lessons_Entry` (flattened into trainings at export)  
**Sitecore template:** Story Page `{693af99d-7689-dc12-31d8-0dd8ca77590a}`  
**Inherits:** `_GtcBasePageTemplate`, `_GtcTaxonomyTemplate`, `_BasePageTemplate`, `ITaggableTemplate`, `IPageAssetMedia`, `IIndexableTemplate`

| # | Craft Field | Craft Path | Craft Type | Sitecore Field | Sitecore Type | Versioned | Transform | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | title | `title` | String | Headline | Single-Line Text | Yes | Direct copy | Also maps to `NavigationTitle` |
| 2 | slug | `slug` | String | — (URL segment) | — | — | URL construction | Sitecore item name |
| 3 | uid | `uid` | UUID | — (external ID) | — | — | Stored in `content-id-map.json` | Cross-language linking key |
| 4 | overline | `stage[0].overline` | String | Overline | Single-Line Text | Yes | Direct copy | May also come from `nuggetMetaInformation[0].overline` for lessons |
| 5 | headline | `stage[0].headline` | String | — | — | — | Skip | Redundant with `title` |
| 6 | subline | `stage[0].subline` | String | Subline | Rich Text | Yes | Direct copy (nullable) | |
| 7 | keyvisual URL | `stage[0].keyvisual[0].url` | Asset ref | KeyvisualUrl | Single-Line Text | Shared | Prepend base URL | |
| 8 | colorTheme | `colorTheme` | Dropdown | ColorTheme | Droplink | Shared | Lookup → GUID | |
| 9 | productlineTheme | `productlineTheme` | Dropdown | ProductlineTheme | Droplink | Shared | Lookup → GUID | |
| 10 | readingTime | `playlistMetaInformation[0].readingTime` | Integer | ReadingTime | Single-Line Text | Shared | Int → String (e.g. `8` → `"8"`) | Minutes estimate |
| 11 | trainingActivity | `trainingActivity` | String | TrainingActivity | Single-Line Text | Shared | Direct copy | Analytics tracking label |
| 12 | mainCategories | `taxonomy[0].mainCategories[]` | Entry refs | MainCategories | Multilist | Shared | Slug → GUID | |
| 13 | topic | `topic` | String | — | — | — | Skip | Internal label |

---

## 3. Quiz Page

**Craft type:** `quizzes_quizzes_Entry` (28 items)  
**Sitecore template:** Quiz Page `{20344734-9abd-a64f-27fc-d483f59253f6}`  
**Inherits:** `_GtcBasePageTemplate`, `_BasePageTemplate`, `ITaggableTemplate`, `IPageAssetMedia`, `IIndexableTemplate`

| # | Craft Field | Craft Path | Craft Type | Sitecore Field | Sitecore Type | Versioned | Transform | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | title | `title` | String | Headline | Single-Line Text | Yes | Direct copy | Also `NavigationTitle` |
| 2 | slug | `slug` | String | — (URL segment) | — | — | URL construction | |
| 3 | uid | `uid` | UUID | — | — | — | `content-id-map.json` | |
| 4 | overline | `quizMetaInformation[0].overline` | String | Overline | Single-Line Text | Yes | Direct copy | |
| 5 | headline | `quizMetaInformation[0].headline` | String | — | — | — | Skip | Redundant with `title` |
| 6 | subline | `quizMetaInformation[0].subline` | String | Subline | Rich Text | Yes | Direct copy (nullable) | |
| 7 | keyvisual URL | `quizMetaInformation[0].keyvisual[0].url` | Asset ref | KeyvisualUrl | Single-Line Text | Shared | Prepend base URL | Often empty; falls back to `globalFallbackImages.quizKeyvisual` |
| 8 | instructionText | `quizMetaInformation[0].text` | Rich Text | InstructionText | Rich Text | Yes | Direct copy (nullable) | Quiz intro/instructions |
| 9 | passingScore | `quizMetaInformation[0].passingScore` | Integer | PassingScore | Integer | Shared | Direct copy | Percentage 0–100 (e.g. `80` = 80%) |
| 10 | numberOfInteractions | `quizMetaInformation[0].numberOfInteractions` | Integer | NumberOfQuestions | Integer | Shared | Direct copy | Questions shown per attempt from pool |
| 11 | shuffleInteractions | `quizMetaInformation[0].shuffleInteractions` | Boolean | ShuffleQuestions | Checkbox | Shared | `true` → `1` | |
| 12 | enableFeedback | `quizMetaInformation[0].enableFeedback` | Boolean | EnableFeedback | Checkbox | Shared | `true` → `1` | |
| 13 | colorTheme | `colorTheme` | Dropdown | ColorTheme | Droplink | Shared | Lookup → GUID | |
| 14 | productlineTheme | `productlineTheme` | Dropdown | ProductlineTheme | Droplink | Shared | Lookup → GUID | |
| 15 | trainingActivity | `trainingActivity` | String | TrainingActivity | Single-Line Text | Shared | Direct copy | |
| 16 | pass headline | `positiveFeedback[0].feedbackHeadline` | String | PassHeadline | Single-Line Text | Yes | Direct copy (nullable) | ~50% of quizzes have this populated |
| 17 | pass text | `positiveFeedback[0].feedbackText` | Rich Text | PassText | Rich Text | Yes | Direct copy | |
| 18 | pass image | — | — | PassImage | Image | Shared | — | **Not in Craft export** — no quiz-level feedback images exist |
| 19 | fail headline | `negativeFeedback[0].feedbackHeadline` | String | FailHeadline | Single-Line Text | Yes | Direct copy (nullable) | |
| 20 | fail text | `negativeFeedback[0].feedbackText` | Rich Text | FailText | Rich Text | Yes | Direct copy | |
| 21 | fail image | — | — | FailImage | Image | Shared | — | **Not in Craft export** |
| 22 | correspondingTraining | `correspondingTraining[0].slug` | Entry ref | — | — | — | Structural | Used for "Return to training" link; handled by Sitecore tree structure (quiz is sibling of stories under same collection) |
| 23 | interactions | `interactions[]` | Entry refs | — (child items) | — | — | Structural | Quiz questions become child items under Quiz Page. Order preserved via `__Sortorder` |
| 24 | mainCategories | `taxonomy[0].mainCategories[]` | Entry refs | — | — | — | Skip | Quiz Page does NOT inherit `_GtcTaxonomyTemplate` |

---

## 4. Question Types

All question types are child items under a Quiz Page. They share a base template.

### Common Fields (`_GtcQuestionBaseTemplate`)

These fields exist on **every** question type:

| # | Craft Field | Craft Path | Craft Type | Sitecore Field | Sitecore Type | Versioned | Transform | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | questionOverline | `interactionBuilder[0].questionOverline` | String | QuestionOverline | Single-Line Text | Yes | Direct copy (nullable) | |
| 2 | question | `interactionBuilder[0].question` | Rich Text | QuestionText | Rich Text | Yes | Direct copy | The question itself (HTML) |
| 3 | questionInstruction | `interactionBuilder[0].questionInstruction` | Rich Text | QuestionInstruction | Rich Text | Yes | Direct copy (nullable) | e.g. "Select the right answers" |
| 4 | optionalImageComponent | `interactionBuilder[0].optionalImageComponent[0].url` | Asset ref | QuestionImage | Image | Shared | URL → media item | 25 questions have images; currently exported as empty `{}` — needs re-export with `url` field |
| 5 | positiveFeedback | `interactionBuilder[0].positiveFeedback[0].feedbackText` | Rich Text | PositiveFeedbackText | Rich Text | Yes | Direct copy (nullable) | |
| 6 | negativeFeedback | `interactionBuilder[0].negativeFeedback[0].feedbackText` | Rich Text | NegativeFeedbackText | Rich Text | Yes | Direct copy (nullable) | |
| 7 | solutionFeedback | `interactionBuilder[0].solutionFeedback[0].feedbackText` | Rich Text | SolutionFeedbackText | Rich Text | Yes | Direct copy (nullable) | Only on Choice, ValueSlider, DragDrop, Sortable, FillBlank — NOT on TrueFalse |

> **Note:** `feedbackHeadline` exists on per-question feedback in Craft but is almost always `null`. Sitecore base template does not have a per-question feedback headline field. Verified no data loss.

---

### 4.1 Choice Question (187 items, 68%)

**Craft type:** `interactionBuilder_choiceModule_BlockType`  
**Sitecore template:** GTC Choice Question  
**Child items:** GTC Choice Answer (one per answer option)

**Question-level fields:**

| # | Craft Field | Craft Path | Type | Sitecore Field | Sitecore Type | Versioned | Transform |
|---|---|---|---|---|---|---|---|
| 1 | forceMultipleChoice | `forceMultipleChoice` | Boolean | ForceMultipleChoice | Checkbox | Shared | `true` → `1` |
| 2 | disableShuffle | `disableShuffle` | Boolean | DisableShuffle | Checkbox | Shared | `true` → `1` |

**Answer-level fields (GTC Choice Answer, per `choiceAnswerOptions[]` entry):**

| # | Craft Field | Craft Path | Type | Sitecore Field | Sitecore Type | Versioned | Transform |
|---|---|---|---|---|---|---|---|
| 1 | answerText | `choiceAnswerOptions[n].answerText` | Rich Text | AnswerText | Rich Text | Yes | Direct copy |
| 2 | correctAnswer | `choiceAnswerOptions[n].correctAnswer` | Boolean | IsCorrect | Checkbox | Shared | `true` → `1` |
| 3 | asset | `choiceAnswerOptions[n].asset[0].url` | Asset ref | AnswerImage | Single-Line Text | Shared | Prepend base URL | 20 answers have images |

---

### 4.2 True/False Question (43 items, 16%)

**Craft type:** `interactionBuilder_trueFalseModule_BlockType`  
**Sitecore template:** GTC True False Question  
**No child items** — answers are fields on the question itself.

| # | Craft Field | Craft Path | Type | Sitecore Field | Sitecore Type | Versioned | Transform | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | trueLabel | `trueFalseAnswerOptions[0].trueLabel` | String | TrueLabel | Single-Line Text | Yes | Direct copy | Custom label (NOT always "True") |
| 2 | falseLabel | `trueFalseAnswerOptions[0].falseLabel` | String | FalseLabel | Single-Line Text | Yes | Direct copy | Custom label (NOT always "False") |
| 3 | correctAnswer | `trueFalseAnswerOptions[0].correctAnswer` | String | CorrectAnswer | Checkbox | Shared | `"true"` → `1`, `"false"` → `0` | **String in Craft, Boolean in Sitecore** |

---

### 4.3 Value Slider Question (28 items, 10%)

**Craft type:** `interactionBuilder_valueSliderModule_BlockType`  
**Sitecore template:** GTC Value Slider Question  
**No child items.**

| # | Craft Field | Craft Path | Type | Sitecore Field | Sitecore Type | Versioned | Transform | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | minValue | `valueSliderConfiguration[0].minValue` | Integer | MinValue | Integer | Shared | Direct copy | |
| 2 | maxValue | `valueSliderConfiguration[0].maxValue` | Integer | MaxValue | Integer | Shared | Direct copy | |
| 3 | steps | `valueSliderConfiguration[0].steps` | Integer | Steps | Single-Line Text | Shared | Int → String | May be decimal (e.g. `0.1`) |
| 4 | initialValue | `valueSliderConfiguration[0].initialValue` | Integer | InitialValue | Integer | Shared | Direct copy | Starting slider position |
| 5 | correctValue | `valueSliderConfiguration[0].correctValue` | Integer | CorrectValue | Integer | Shared | Direct copy | |
| 6 | correctThreshold | `valueSliderConfiguration[0].correctThreshold` | Integer | CorrectThreshold | Integer | Shared | Direct copy (nullable) | Tolerance margin; `null` = exact match |
| 7 | minLabel | `valueSliderConfiguration[0].minLabel` | String | MinLabel | Single-Line Text | Yes | Direct copy (nullable) | e.g. "Cold" |
| 8 | maxLabel | `valueSliderConfiguration[0].maxLabel` | String | MaxLabel | Single-Line Text | Yes | Direct copy (nullable) | e.g. "Hot" |
| 9 | currentValueLabel | `valueSliderConfiguration[0].currentValueLabel` | String | ValueLabel | Single-Line Text | Yes | Direct copy (nullable) | Unit label (e.g. "liter", "°C") |

---

### 4.4 Drag & Drop Question (10 items, 4%)

**Craft type:** `interactionBuilder_DragDropModule_BlockType`  
**Sitecore template:** GTC Drag Drop Question  
**Child items:** GTC Drag Drop Pair (one per `dragDrop[]` entry)

**Question-level fields:**

| # | Craft Field | Craft Path | Type | Sitecore Field | Sitecore Type | Versioned | Transform |
|---|---|---|---|---|---|---|---|
| 1 | disableShuffle | `disableShuffle` | Boolean | DisableShuffle | Checkbox | Shared | `true` → `1` |

**Pair-level fields (GTC Drag Drop Pair, per `dragDrop[]` entry):**

| # | Craft Field | Craft Path | Type | Sitecore Field | Sitecore Type | Versioned | Transform | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | drag text | `dragDrop[n].drag[0].textComponent` | Rich Text | DragText | Rich Text | Yes | Direct copy | When `__typename` = `drag_dragDropText_BlockType` |
| 2 | drag image | `dragDrop[n].drag[0].imageComponent[0].url` | Asset ref | DragImage | Image | Shared | URL → media item | When `__typename` = `drag_dragDropImage_BlockType` |
| 3 | drop text | `dragDrop[n].drop[0].textComponent` | Rich Text | DropText | Rich Text | Yes | Direct copy | When `__typename` = `drop_dropText_BlockType` |
| 4 | drop image | `dragDrop[n].drop[0].imageComponent[0].url` | Asset ref | DropImage | Image | Shared | URL → media item | When `__typename` = `drop_dropImage_BlockType` |

> **Correct answer** = the pairing itself. Drag item N matches Drop item N within the same `dragDrop[]` entry. No separate "correct" flag.

---

### 4.5 Fill in the Blank Question (3 items, 1%)

**Craft type:** `interactionBuilder_fillTheBlankModule_BlockType`  
**Sitecore template:** GTC Fill Blank Question  
**No child items.**

| # | Craft Field | Craft Path | Type | Sitecore Field | Sitecore Type | Versioned | Transform | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | textWithoutFormating | `textWithoutFormating` | String | BlankText | Rich Text | Yes | See [rule 6](#6-fill-in-the-blank-encoding) | Uses `{{ correct \| wrong1 \| wrong2 }}` format. First option in each `{{ }}` group is correct. |

**Example:**
```
The Reverse Osmosis Filter... {{ bacteria | chlorine | lime }}, viruses...
```
→ `bacteria` is the correct answer; `chlorine` and `lime` are distractors.

---

### 4.6 Sortable Ranking Question (2 items, <1%)

**Craft type:** `interactionBuilder_sortableRankingListModule_BlockType`  
**Sitecore template:** GTC Sortable Question  
**Child items:** GTC Sortable Item (one per `sortableAnswerItems[]` entry)

**Item-level fields (GTC Sortable Item):**

| # | Craft Field | Craft Path | Type | Sitecore Field | Sitecore Type | Versioned | Transform | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | item | `sortableAnswerItems[n].item` | Rich Text | ItemText | Rich Text | Yes | Direct copy | |

> **Correct order** = array index in Craft → `__Sortorder` in Sitecore (100, 200, 300...). First item in Craft array = `__Sortorder: 100` = correct position 1.

---

## 5. Global / Lookup Data

### Color Theme

| Craft Value | Sitecore Item GUID | Sitecore Item Name |
|---|---|---|
| `light` | `3f123c71-443c-1853-37d5-612b09777ff8` | Light |
| `medium` | `3bbae94a-e7ac-d815-4a95-ea85a44a4e0a` | Medium |
| `dark` | `298d1deb-8a48-15b5-f1fa-ead9ba539786` | Dark |

### Productline Theme

| Craft Value | Sitecore Item GUID |
|---|---|
| `standard` | `e36cbd21-ca3f-9b6a-03e8-8d4188ca1341` |
| `spa` | ⚠️ **NOT MAPPED** — only `standard` exists in `lookup-mappings.json`. Need to create or map. |

### Course Type

| Craft `__typename` | Sitecore GUID | Label |
|---|---|---|
| `courseData_collections_BlockType` | `bac7e663-54a1-54e3-4eb8-357f238954d9` | Course |
| `courseData_compactTrainings_BlockType` | `dc9c3ba8-a24f-2677-7b4c-85b535f07510` | Compact Training |

### Main Categories (48 items)

Full mapping in `lookup-mappings.json`. Sample:

| Craft Slug | Craft Title | Sitecore GUID |
|---|---|---|
| `professional` | PROFESSIONAL | `64f8cf47-a977-39d4-f6b3-c581f82cb613` |
| `spa` | SPA | `ded0580a-8f28-ae06-638f-7ca8c580d7b0` |
| `quickfix` | QUICKFIX | `32a4c2f5-cb75-451d-e068-05ded821eb03` |
| `watersystems` | WATERSYSTEMS | `812bef03-8348-3e82-da67-890e60ae0009` |
| `allure-gravity` | Allure Gravity | `a6f08539-a2dc-ef3d-c3b0-be3f06eb8122` |
| ... | ... | ... |

### Global UI Texts (`globalUiTexts`)

| Craft Field Group | Purpose | Migration Target |
|---|---|---|
| `globalInteractionTexts` | Quiz button labels, feedback headlines | GTC.Dictionary items (21 created) |
| `globalTexts` | Navigation labels, CTA text | GTC.Dictionary items |
| `globalHeaderTexts` | Header nav (Home, Profile, etc.) | NEO header — not GTC scope |
| `globalFeedbackLayer` | Feedback form headline | Hardcoded / dictionary |
| `globalFormats` | Reading time format | Dictionary |

### Global Fallback Images (`globalFallbackImages`)

| Craft Field | Purpose | Migration |
|---|---|---|
| `quizKeyvisual` | Default quiz hero image | Upload to CDN; reference in Sitecore Standard Values or FE fallback |
| `questionKeyvisual` | Default question image | FE fallback |
| `generalKeyvisual` | Default page hero image | FE fallback |

---

## 6. Structural / Navigation Fields

These Craft fields control content hierarchy and navigation. They are **not migrated as field values** but instead expressed through the **Sitecore content tree structure**.

| Craft Field | Craft Path | Purpose | Sitecore Equivalent |
|---|---|---|---|
| `contentDependencies[0].overview` | Training/Lesson | Parent collection link | Sitecore tree parent (Story under Collection folder) |
| `contentDependencies[0].nextChapter` | Training/Lesson | Next story in sequence | Sitecore sibling order (`__Sortorder`) |
| `contentDependencies[0].previousChapter` | Training/Lesson | Previous story in sequence | Sitecore sibling order |
| `correspondingTraining` | Quiz | Link back to training/collection | Sitecore tree parent (Quiz is sibling of Stories) |
| `interactions[]` | Quiz | Ordered list of question entries | Child items under Quiz Page with `__Sortorder` |
| `globalTracking.courseData[].stories[]` | Global | Required stories per collection | `RequiredItems` Multilist on Collection Page |
| `globalTracking.courseData[].collection[]` | Global | Collection reference | Matching Collection Page item |
| `showPlaylistNavigation` | Training | Show prev/next nav | Handled by GTC Stepper/Collection Navigation components (always shown for Stories) |

---

## 7. Content Builder Blocks (Inline Components)

Content builder blocks from `contentBuilder[]` in Craft lessons are **NOT migrated as Sitecore content fields**. They represent page body content rendered by NEO components. Migration of these blocks is a **separate workstream** (Component Content Migration) that maps each block type to a Sitecore rendering + datasource item.

**Block type inventory (from Craft export):**

| Block Type | Craft Count | NEO Rendering | Priority | Migration Status |
|---|---|---|---|---|
| `multicolumnModule_BlockType` | 286 | Info Block | High | Not started |
| `textModule_BlockType` | 212 | Text Block | High | Not started |
| `textMediaModule_BlockType` | 114 | Content Display Block | High | Not started |
| `imageModule_BlockType` | 86 | (Image handling) | Medium | Not started |
| `videoModule_BlockType` | 24 | (Video handling) | Medium | Not started |
| `headingModule_BlockType` | 26 | Heading | Medium | Not started |
| `nextChapterModule_BlockType` | 188 | GTC Collection Navigation | High | Handled by component (no datasource needed) |
| `thumbnailTabsModule_BlockType` | 23 | Tabs | Medium | Not started |
| `entryLinksModule_BlockType` | 18 | (Related content) | Low | Not started |
| `tableModule_BlockType` | 16 | Table | Medium | Not started |
| `contentSliderModule_BlockType` | 12 | Media cards carousel | Medium | Not started |
| `feedbackLayerModule_BlockType` | 10 | (Feedback form) | Low | Handled by component |
| `textSliderModule_BlockType` | 9 | Media cards carousel | Low | Not started |
| `interactionModule_BlockType` | 7 | (Embedded quiz) | Low | Not in scope (inline quizzes not tracked) |
| `textTabsModule_BlockType` | 6 | Tabs | Low | Not started |
| `checklistModule_BlockType` | 6 | Info Block - Icons | Low | Not started |
| `blockquoteModule_BlockType` | — | Quote | Low | Not started |
| `accordionModule_BlockType` | — | Accordion | Low | Not started |
| `parallaxModule_BlockType` | 2 | Promo banner | Low | Not started |
| `abSliderModule_BlockType` | — | Media gallery | Low | Not started |
| `marqueeSliderModule_BlockType` | — | Masonry gallery | Low | Not started |
| `hotspotModule_BlockType` | — | Image with hotspots | Low | Not started |
| `downloadsModule_BlockType` | — | Downloads | Low | Not started |
| `sectionModule_BlockType` | 2 | (Container) | Low | Not started |

> Content builder block field mapping will be documented separately per block type when the component content migration workstream begins.

---

## 8. Fields NOT Migrated

| Craft Field | Reason |
|---|---|
| `id` (Craft entry ID) | Internal Craft identifier; `uid` used instead for cross-reference |
| `uri` | URL paths reconstructed from Sitecore tree structure |
| `topic` | Internal label; not rendered in target system |
| `stage[0].headline` | Redundant — `title` is used as Headline |
| `taxonomy[0].tags[]` | Tags not implemented in Sitecore content model (only MainCategories) |
| `showPlaylistNavigation` | Navigation always present in Sitecore (GTC Stepper + Collection Navigation) |
| `contentDependencies` | Expressed through Sitecore tree structure |
| `stacked` (on all question types) | Layout flag; Sitecore rendering handles layout |
| `interactionMetaInformation[0].headline` | Redundant with question `title` |
| `interactionMetaInformation[0].readingTime` | Not applicable to questions |
| `interactionRelatedNuggets[]` | Related content links from questions — not in scope |
| `nuggetRelatedContent[]` | Related content links from lessons — not in scope |
| `feedbackHeadline` (per-question) | Almost always `null`; no matching Sitecore field |
| `correspondingTraining` | Structural — handled by Sitecore tree |

---

## 9. Transformation Rules

### 1. Asset URL Construction

Craft assets use relative paths. Prepend the base URL:

```
Craft:    /assets/images/Rapido-SmartBox/Quiz/09-Q1-single-lever-trim-sets.png
Sitecore: https://lc.training.grohe.this.work/assets/images/Rapido-SmartBox/Quiz/09-Q1-single-lever-trim-sets.png
```

Before launch, replace `https://lc.training.grohe.this.work` with CDN URL.

### 2. Boolean → Checkbox

Craft Boolean (`true`/`false`) → Sitecore Checkbox (`1`/empty string):

```
true  → 1
false → (empty)
```

### 3. Dropdown → Droplink GUID

Craft dropdown strings → Sitecore Droplink item GUIDs via `lookup-mappings.json`:

```
"light" → "{3f123c71-443c-1853-37d5-612b09777ff8}"
```

### 4. Course Completion Rules (`globalTracking`)

The `globalTracking.courseData[]` matrix must be denormalized:
1. For each `courseData` entry, find the `collection[0].slug`
2. Match to the corresponding Collection Page item in Sitecore
3. Map each `stories[].slug` to a Sitecore Story/Quiz Page item ID
4. Populate the Collection's `RequiredItems` Multilist with pipe-separated GUIDs

For compact trainings (`courseData_compactTrainings_BlockType`), there are no `stories[]` — only the `compactTraining[0].slug` reference.

### 5. Category Multilist

Craft category slugs → pipe-separated Sitecore GUIDs:

```
Craft:    ["professional", "spa", "quickfix"]
Sitecore: "{64f8cf47-...}|{ded0580a-...}|{32a4c2f5-...}"
```

### 6. Fill in the Blank Encoding

Craft uses `{{ correct | wrong1 | wrong2 }}` format in plain text. The **first option** in each group is the correct answer:

```
Craft:    {{ bacteria | chlorine | lime }}
```

The FE component (`QuestionFillBlank.tsx`) parses this at render time. The raw text is stored as-is in `BlankText`.

### 7. Sort Order Preservation

Craft array indices → Sitecore `__Sortorder`:
- Index 0 → `__Sortorder: 100`
- Index 1 → `__Sortorder: 200`
- Index N → `__Sortorder: (N+1) × 100`

Applies to: Stories under Collection, Questions under Quiz, Answers under Question, Sortable Items, Drag/Drop Pairs.

### 8. True/False `correctAnswer` Type Coercion

Craft stores `correctAnswer` as a **string** (`"true"` / `"false"`), not a boolean. Must string-compare, not truthy-check:

```javascript
// CORRECT
sitecore.CorrectAnswer = craft.correctAnswer === "true" ? "1" : ""
// WRONG — would treat "false" as truthy
sitecore.CorrectAnswer = craft.correctAnswer ? "1" : ""
```

---

## Open Issues

| # | Issue | Impact | Action |
|---|---|---|---|
| 1 | `productlineTheme: "spa"` has no Sitecore lookup GUID | 63 collections affected if any use `spa` | Create "spa" productline theme item or map to `standard` |
| 2 | `optionalImageComponent` exports as empty `{}` | 25 question images missing | Re-export with `url` field in GraphQL query |
| 3 | Content builder blocks not yet mapped at field level | Story page body content | Separate workstream — requires NEO rendering analysis |
| 4 | Tags (`taxonomy[0].tags[]`) dropped | 11 tags not migrated | Confirm with product team if tags are needed |
| 5 | Multilingual field values | Only en-GB exported so far | Re-run export with `site: "*"` for all 19 languages |
| 6 | `feedbackHeadline` on per-question feedback | Data exists on some questions | Verify none are non-null; if any are, add field to `_GtcQuestionBaseTemplate` |
