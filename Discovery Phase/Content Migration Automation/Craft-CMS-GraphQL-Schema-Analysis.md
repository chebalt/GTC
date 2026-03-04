# Craft CMS GraphQL API — Schema & Content Analysis
**Endpoint:** `https://lc.training.grohe.this.work/api`
**Auth:** Bearer token (read-only access granted)
**Analysis date:** 2026-03-04
**Analyst:** Artsiom Dylevich
**Scope:** Read-only schema introspection + live data sampling. No mutations performed.

---

## 1. Overview

The Craft CMS instance exposes a GraphQL API covering all training content for `training.grohe.com`. This endpoint returns content for **a single site** (`enGB` / `en-GB`). The full production system is multilingual (19 languages), but this GraphQL endpoint only exposes the English-language site. Localized versions of entries return an empty `localized[]` array, suggesting that other language sites are either not configured for GraphQL exposure or are behind a different authentication scope.

---

## 2. Content Inventory (Live Counts)

| Content Type | GraphQL Section | Count | URL Prefix |
|---|---|---|---|
| Collections (Courses) | `courses` | **63** | `collections/{slug}` |
| Trainings (Playlists/Compact) | `trainings` | **305** | `playlists/{slug}` |
| Lessons (Nuggets/Stories) | `lessons` | **861** | `nuggets/{slug}` |
| Quizzes | `quizzes` | **26** | `quizzes/{slug}` |
| Quiz Interactions (Questions) | `quizInteractions` | **371** | `interactions/{slug}` |
| **Total entries** | | **1,626** | |
| Images | assets (kind: image) | **8,097** | |
| Videos | assets (kind: video) | **743** | |
| SCORM packages | assets (volume: scorm) | **1** (confirmed) | |
| **Total assets** | | **9,024** | |

> **Note:** All 1,626 entries are `en-GB` (siteHandle: `enGB`). Multilingual content either lives in a separate site/database partition not accessible via this token, or is stored as inline fields per language (not yet confirmed).

---

## 3. Entry Sections (Content Types)

### 3.1 `courses` — Collections
**GraphQL type:** `courses_courses_Entry`
**URL pattern:** `collections/{slug}`
**Purpose:** Top-level course page. A Collection groups one or more Trainings and defines the full course experience.

**Custom fields:**
| Field | Type | Description |
|---|---|---|
| `taxonomy` | `taxonomy_BlockType[]` | Categories + tags (see §6) |
| `collectionData` | `collectionData_BlockType[]` | Hero text, hero video, isHero flag |
| `stage` | `stage_BlockType[]` | Hero/stage banner configuration |
| `contentBuilder` | `contentBuilder_NeoField[]` | Page content blocks |
| `isLandingpage` | Boolean | Whether this acts as a landing page |
| `colorTheme` | String | Visual theme |
| `productlineTheme` | String | Product line styling |
| `topic` | String | Topic label |

> **Important:** The required story list per collection is **not** stored inside the course entry itself. It is configured in the **Global Tracking** global set (see §7.3). This is a critical architectural difference to account for during migration.

---

### 3.2 `trainings` — Trainings / Compact Trainings
**GraphQL type:** `trainings_trainings_Entry`
**URL pattern:** `playlists/{slug}`
**Purpose:** A Training (Playlist) or Compact Training — the learning journey within a Collection. Contains ordered Nuggets and optional quiz.

**Custom fields:**
| Field | Type | Description |
|---|---|---|
| `taxonomy` | `taxonomy_BlockType[]` | Categories + tags |
| `playlistMetaInformation` | `playlistMetaInformation_BlockType[]` | readingTime estimate (numberOfStories and linkedQuiz are NOT in schema — stored via globalTracking) |
| `stage` | `stage_BlockType[]` | Stage/hero banner |
| `contentBuilder` | `contentBuilder_NeoField[]` | Page content blocks (primarily `sectionModule` + `nextChapterModule`) |
| `contentDependencies` | `contentDependencies_BlockType[]` | Links to overview/nextChapter/previousChapter |
| `showPlaylistNavigation` | Boolean | Whether to show chapter nav |
| `colorTheme` | String | Visual theme |
| `productlineTheme` | String | Product line styling |
| `topic` | String | Topic label |
| `trainingActivity` | String | Training activity label (used for tracking) |

**Content block distribution in trainings (all 305):**
| Block Type | Count | Role |
|---|---|---|
| `sectionModule` | 1,259 | Container for nugget list within a training page |
| `nextChapterModule` | 188 | Navigation to next nugget/story |
| `feedbackLayerModule` | 10 | End-of-training feedback form |
| `textModule` | 8 | Occasional editorial text |
| `textMediaModule` | 1 | Text + media |
| `videoModule` | 1 | Video embed |

---

### 3.3 `lessons` — Nuggets / Stories
**GraphQL type:** `lessons_lessons_Entry`
**URL pattern:** `nuggets/{slug}`
**Purpose:** A Nugget is the atomic content unit — a Story page within a Training. Contains the actual learning content via the contentBuilder.

**Custom fields:**
| Field | Type | Description |
|---|---|---|
| `taxonomy` | `taxonomy_BlockType[]` | Categories + tags |
| `nuggetMetaInformation` | `nuggetMetaInformation_BlockType[]` | overline, headline, subline, keyvisual, knowledgeManagementVisibility, readingTime |
| `contentBuilder` | `contentBuilder_NeoField[]` | All lesson content blocks |
| `nuggetRelatedContent` | `EntryInterface[]` | Related nuggets links |
| `contentDependencies` | `contentDependencies_BlockType[]` | Overview/next/previous chapter links |
| `colorTheme` | String | Visual theme |
| `productlineTheme` | String | Product line styling |

**Content block distribution in lessons (sample: first 200):**
| Block Type | Count | Notes |
|---|---|---|
| `multicolumnModule` | 286 | Most common — multi-column layout |
| `textModule` | 212 | Rich text |
| `textMediaModule` | 114 | Text + image/video |
| `imageModule` | 86 | Image only |
| `headingModule` | 26 | Standalone heading |
| `videoModule` | 24 | Video embed |
| `thumbnailTabsModule` | 23 | Image thumbnail tabs |
| `entryLinksModule` | 18 | Links to other entries |
| `tableModule` | 16 | Table (TableMaker) |
| `contentSliderModule` | 12 | Media carousel |
| `textSliderModule` | 9 | Text+media slider |
| `interactionModule` | 7 | Embedded quiz interaction |
| `textTabsModule` | 6 | Text-based tabs |
| `checklistModule` | 6 | Checklist |
| `sectionModule` | 2 | Section wrapper |
| `parallaxModule` | 2 | Parallax scroll |

---

### 3.4 `quizzes` — Quizzes
**GraphQL type:** `quizzes_quizzes_Entry`
**URL pattern:** `quizzes/{slug}`
**Purpose:** A quiz linked to a Training. References an ordered set of quiz interaction entries.

**Custom fields:**
| Field | Type | Description |
|---|---|---|
| `taxonomy` | `taxonomy_BlockType[]` | Categories + tags |
| `quizMetaInformation` | `quizMetaInformation_BlockType[]` | overline, headline, subline, text, keyvisual, shuffleInteractions, numberOfInteractions, passingScore, enableFeedback |
| `interactions` | `EntryInterface[]` | Ordered list of quizInteraction entries |
| `positiveFeedback` | `positiveFeedback_BlockType[]` | Pass screen: icon, headline, text, image |
| `negativeFeedback` | `negativeFeedback_BlockType[]` | Fail screen: icon, headline, text, image |
| `correspondingTraining` | `EntryInterface[]` | Link back to the training entry |
| `trainingActivity` | String | Activity label for tracking |
| `colorTheme` | String | Visual theme |
| `productlineTheme` | String | Product line styling |

**Sample quiz configuration:**
- Aqua Tiles Quiz: 10 questions shown (from pool), 80% pass threshold, shuffle enabled
- Rapido Heat Recovery Quiz: 9 questions shown, 75% pass threshold, shuffle enabled

---

### 3.5 `quizInteractions` — Quiz Questions / Interactions
**GraphQL type:** `quizInteractions_quizInteractions_Entry`
**URL pattern:** `interactions/{slug}`
**Purpose:** Individual quiz questions. Each entry contains one interaction type defined via `interactionBuilder`.

**Custom fields:**
| Field | Type | Description |
|---|---|---|
| `taxonomy` | `taxonomy_BlockType[]` | Categories + tags |
| `interactionMetaInformation` | `interactionMetaInformation_BlockType[]` | headline, includeInStoryNavigation, readingTime |
| `interactionBuilder` | `interactionBuilder_NeoField[]` | The actual question block (one per entry) |
| `interactionRelatedNuggets` | `EntryInterface[]` | Related lesson/nugget links |

**Question type distribution (all 371 interactions):**
| Question Type | Count | % |
|---|---|---|
| `interactionBuilder_choiceModule_BlockType` | 242 | 65% |
| `interactionBuilder_trueFalseModule_BlockType` | 51 | 14% |
| `interactionBuilder_valueSliderModule_BlockType` | 51 | 14% |
| `interactionBuilder_DragDropModule_BlockType` | 20 | 5% |
| `interactionBuilder_fillTheBlankModule_BlockType` | 4 | 1% |
| `interactionBuilder_sortableRankingListModule_BlockType` | 3 | 1% |

> **Note:** No instances of a 7th question type were found in production. The schema contains 6 unique interaction types. The SCORM analysis previously identified drag-drop image separately — in the schema, both text and image drag items are sub-types within `DragDropModule`.

---

### 3.6 `homepage` — Homepage
**GraphQL type:** `homepage_homepage_Entry`
**Custom fields:** `stage`, `contentBuilder`, `colorTheme`, `productlineTheme`
**Purpose:** Single entry representing the GTC homepage.

---

### 3.7 `navigation` — Navigation
**GraphQL type:** `navigation_navigation_Entry`
**Entries:** 2 (`main`, `footer`)
**Custom fields:** `navigationBuilder` (Neo field with nodes, entries, leafs, links, singleNode block types)
**Purpose:** Site navigation structure (main nav and footer nav).

---

### 3.8 Legal / Static Pages
| Section | GraphQL Type | Purpose |
|---|---|---|
| `dataProtection` | `dataProtection_dataProtection_Entry` | Privacy policy |
| `imprint` | `imprint_imprint_Entry` | Imprint/legal notice |
| `termsOfUse` | `termsOfUse_termsOfUse_Entry` | Terms of use |

---

## 4. Content Builder — All Block Types

The `contentBuilder` Neo field is shared across `trainings`, `lessons`, `courses`, and `homepage`. Block types include:

### Text & Media
| Block Type | Key Fields | Notes |
|---|---|---|
| `textModule` | optionalHeading, textComponent (HTML), buttonComponent, textModuleLayout, textSettings, backgroundSettings, spacingSettings | Rich text, 2/3-col support |
| `textMediaModule` | optionalHeading, textComponent, buttonComponent, textMediaDesktopSettings, textMediaMobileSettings, textMediaBreakout | Text + nested image/video (child blocks) |
| `imageModule` | optionalHeading, imageComponent (asset), layoutArea, captionPosition, infoTextPosition | Single image |
| `videoModule` | optionalHeading, videoComponent (asset), layoutArea, videoSettings (cta, controls, autoplay, loop, muted) | Video |
| `headingModule` | headingComponent (alignment, overline, headline, subline), headingSettings (htmlTag, displayStyle) | Standalone heading |
| `blockquoteModule` | quote (text, author?), headingComponent | Quote / blockquote |
| `statementModule` | (content not fully exposed in schema — appears to be editorial text with animation) | Parallax-style statement |

### Layout
| Block Type | Key Fields | Notes |
|---|---|---|
| `multicolumnModule` | optionalHeading, columnSettings, children (column blocks) | Multi-column container |
| `sectionModule` | Children (section-level block wrapper used in trainings) | Groups nuggets within a playlist page |
| `parallaxModule` | parallaxElementSettings, children (parallaxEntry blocks) | Parallax scroll sections |
| `accordionModule` | optionalHeading, accordionSettings (openOnlyOnePanel), children (accordionPanel blocks) | Accordion container |
| `accordionPanel` | textComponent (HTML), initiallyOpened | Single accordion panel; children can be any content blocks |
| `textTabsModule` | optionalHeading, children (textTab blocks) | Text-labelled tabs |
| `thumbnailTabsModule` | optionalHeading, children (thumbnailTab blocks) | Image-thumbnail-labelled tabs |

### Sliders / Carousels
| Block Type | Key Fields | Notes |
|---|---|---|
| `abSliderModule` | optionalHeading, abSliderImages (imageA + imageB), handleStartPosition, layoutArea | A/B image comparison slider |
| `textSliderModule` | optionalHeading, textComponent, buttonComponent, textMediaDesktopSettings, textMediaMobileSettings, contentSliderSettings | Text+media slides |
| `contentSliderModule` | optionalHeading, contentSliderSettings (effect, slideWidth, pagination, loop, autoplay, controlPosition), children (mediaSlide / slide blocks) | Generic media carousel |
| `marqueeSliderModule` | marqueeSliderComponent (images[]) | Continuous marquee/scroll |

### Interactive
| Block Type | Key Fields | Notes |
|---|---|---|
| `hotspotModule` | imageHotspots (hotspot position + hotspotType: overlay or tooltip) | Image with hotspots; overlay type links to nuggets; tooltip shows text |
| `interactionModule` | (links to a quizInteraction entry) | Embeds a quiz question inline in a lesson |
| `feedbackLayerModule` | (end-of-training feedback collection) | Course feedback form trigger |
| `completedCoursesModule` | (shows user's completed courses list) | Account/profile block |

### Navigation / Functional
| Block Type | Key Fields | Notes |
|---|---|---|
| `nextChapterModule` | (links to next chapter/nugget) | Chapter navigation |
| `nuggetInjector` | (injects another nugget's content) | Content reuse across trainings |
| `entryLinksModule` | (related content links) | Related content |
| `downloadButtonModule` | (single file download) | Download CTA |
| `downloadsModule` | (multiple files download list) | Download list |
| `tableModule` | table (TableMaker: columns, rows) | Rich table |
| `checklistModule` | checklistItems[] | Checklist items |

---

## 5. Interaction Builder — Quiz Question Types (Detail)

All question types share common base fields:
- `questionOverline`: String (optional prefix)
- `question`: HTML string (the question text)
- `questionInstruction`: String (auto-populated from globalInteractionTexts)
- `optionalImageComponent`: optional image asset
- `optionalSoundButtonComponent`: optional audio file
- `positiveFeedback`, `negativeFeedback`, `solutionFeedback`: feedback blocks (icon, headline, text, image)
- `stacked`: Boolean (layout)
- `colorTheme`, `backgroundSettings`, `spacingSettings`

### 5.1 Choice Question (`interactionBuilder_choiceModule_BlockType`) — 242 usages
Additional fields:
- `choiceAnswerOptions[]`: `answerText` (HTML), `asset` (optional image), `correctAnswer` (Boolean)
- `forceMultipleChoice`: Boolean — forces multi-select mode even if only one answer correct
- `disableShuffle`: Boolean — prevents answer shuffling

### 5.2 True/False Question (`interactionBuilder_trueFalseModule_BlockType`) — 51 usages
Additional fields:
- `trueFalseAnswerOptions[]`: `trueLabel`, `falseLabel`, `correctAnswer` (String: "true"/"false")

### 5.3 Value Slider Question (`interactionBuilder_valueSliderModule_BlockType`) — 51 usages
Additional fields:
- `valueSliderConfiguration[]`: `minValue`, `minLabel`, `maxValue`, `maxLabel`, `steps`, `currentValueLabel`, `initialValue`, `correctValue`, `correctThreshold`

### 5.4 Drag & Drop Question (`interactionBuilder_DragDropModule_BlockType`) — 20 usages
Additional fields:
- `dragDrop[]`: contains `drag` (drag_MatrixField) and `drop` (drop_MatrixField)
  - `drag` subtypes: `drag_dragDropText_BlockType` (textComponent), `drag_dragDropImage_BlockType` (imageComponent)
  - `drop` subtypes: `drop_dropText_BlockType` (textComponent), `drop_dropImage_BlockType` (imageComponent)
- `disableShuffle`: Boolean

### 5.5 Fill in the Blank (`interactionBuilder_fillTheBlankModule_BlockType`) — 4 usages
Additional fields:
- `textWithoutFormating`: String — the sentence with blank(s) encoded (format TBD from live data)

### 5.6 Sortable Ranking List (`interactionBuilder_sortableRankingListModule_BlockType`) — 3 usages
Additional fields:
- `sortableAnswerItems[]`: `item` (String) — ordered list items to be ranked

---

## 6. Taxonomy System

Used across all entry types via the `taxonomy_BlockType`:

| Field | Type | Notes |
|---|---|---|
| `mainCategories` | `mainCategory_Category[]` | Product/topic categories — **48 total** |
| `tags` | `contentTags_Tag[]` | Content tags — **11 total** |

**Category examples (top-level):** PROFESSIONAL, SPA, QUICKFIX, WATERSYSTEMS, BRAND, COLOURS, ATRIO, ALLURE, EVERSTREAM, PUREFOAM, DICE, CERAMICS, SMARTCONTROL, etc.

**Tags:** allure gravity, Bau, BauEdge, ceramic, ceramics, colours, Professional, quickfix, quiz, spa, surfaces

---

## 7. Global Sets

Three global sets are used for site-wide configuration:

### 7.1 `globalFallbackImages`
Fallback keyvisual images for quiz, question, and general content contexts.
Fields: `quizKeyvisual`, `questionKeyvisual`, `generalKeyvisual` (all AssetInterface).

### 7.2 `globalUiTexts`
**All** user-facing text strings are stored here (fully translatable per site):
- `globalFormats`: tile reading time format
- `globalTexts`: navigation labels, CTA labels, locked content popup texts, lead popup texts
- `globalHeaderTexts`: Home, Profile, Logout, Search, Close labels
- `globalInteractionTexts`: all question instruction templates, button labels (Confirm, Retry, Solution, Start Quiz, Restart Quiz), feedback headlines for all question types
- `globalFeedbackLayer`: headline + text for the feedback layer
- `feedbackMailSettings`: feedback email receiver, subject, message template

### 7.3 `globalTracking` ⚠️ Critical
**This is where course completion rules are defined**, not inside individual course entries.

The `courseData` Matrix field maps:
- `courseData_collections_BlockType`: `collection` (→ course entry) + `stories` (→ ordered list of lesson/nugget entries that are REQUIRED for completion)
- `courseData_compactTrainings_BlockType`: `compactTraining` (→ training entry)

> **Migration implication:** Course completion rules (which stories must be finished to complete a course) are globally configured. There is no per-collection "required stories" field — it is all centralised here. This must be migrated to a per-course field structure in Sitecore AI.

---

## 8. Asset Volumes

| Volume | GraphQL Type | Count | Notes |
|---|---|---|---|
| `images` | `images_Asset` | ~8,097 | Transformed versions served via CDN |
| `videos` | `videos_Asset` | ~743 | Direct asset links |
| `files` | `files_Asset` | ~173 (known from DB) | GQL kind filter "document" returned 0 — volume-based query needed |
| `audio` | `audio_Asset` | 1 | Single audio file found |
| `scorm` | `scorm_Asset` | 1 confirmed | `purefoam-de-Installer-20251125-111626.zip` (190 MB) |

**Asset fields available:** `id`, `uid`, `title`, `filename`, `extension`, `url`, `mimeType`, `size`, `width`, `height`, `alt`, `focalPoint`, `hasFocalPoint`, `kind`, `path`, `dateCreated`, `dateUpdated`, `dateModified`, `uploader`

---

## 9. Content Relationships Map

```
Course (collections/{slug})
  └── [via globalTracking] → Trainings[] (required)
        └── [sectionModule contentBuilder] → Lessons (ordered nuggets)
              └── [interactionModule contentBuilder] → QuizInteraction (inline question)
  └── [via globalTracking] → Quizzes (linked quiz)
        └── interactions[] → QuizInteractions[] (question pool)
              └── interactionRelatedNuggets[] → Lessons (supporting content)

Training (playlists/{slug})
  └── [contentDependencies] → overview / nextChapter / previousChapter
  └── [playlistMetaInformation] → readingTime

Lesson/Nugget (nuggets/{slug})
  └── [nuggetRelatedContent] → other Lessons
  └── [contentDependencies] → overview / nextChapter / previousChapter
  └── [taxonomy] → Categories + Tags

Quiz (quizzes/{slug})
  └── [correspondingTraining] → Training
  └── [interactions] → QuizInteraction[] (ordered pool)
  └── positiveFeedback / negativeFeedback (pass/fail screens)

QuizInteraction (interactions/{slug})
  └── [interactionBuilder] → one of 6 question types
  └── [interactionRelatedNuggets] → Lessons
```

---

## 10. Key Migration Findings

### 10.1 Single-language endpoint
This API only surfaces `en-GB` content. For full multilingual migration (19 languages), additional API access or database-level extraction will be needed. The `localized` field on entries returns empty for all queried entries.

### 10.2 Global Tracking is the course completion authority
Course completion rules (required stories per collection) are not stored per-collection — they live in `globalTracking`. This is a non-trivial mapping task: each of the 63 collections needs its story list extracted from the global set and stored as a first-class field in Sitecore AI.

### 10.3 Content block inventory for frontend mapping
The most heavily used content blocks in lessons are `multicolumnModule` (286), `textModule` (212), `textMediaModule` (114), and `imageModule` (86). These cover ~85% of all lesson content. The full NEO component library mapping effort should prioritise these first.

### 10.4 Quiz pool vs displayed question count
Quizzes have more interaction entries than `numberOfInteractions` shown per attempt (e.g., 10 interactions in pool, show 9-10). Shuffling is enabled by default (`shuffleInteractions: true`). The `numberOfInteractions` and `passingScore` (as a percentage, e.g., 80 = 80%) fields are set per quiz.

### 10.5 No completion flag in GraphQL
Consistent with prior discovery: there is no course completion status field on any entry type. All completion state lives in the Craft CMS user tracking tables (not exposed via GraphQL). Completion data must be exported via database-level access.

### 10.6 `fillInTheBlank` question format
Only 4 instances exist. The `textWithoutFormating` field stores the sentence — the blank formatting needs to be sampled from actual data to determine the encoding convention (e.g., `___`, `[blank]`, or special marker).

### 10.7 SCORM assets
Only 1 SCORM package is accessible via this token (`purefoam-de-Installer-20251125-111626.zip`, 190 MB). The 2nd SCORM file (`purefoam-fr`) found locally was not returned — likely stored in a different volume or site.

---

## 11. Recommended Next Steps

1. **Confirm multilingual access** — request a token or direct DB access to extract all 19 language versions of all content.
2. **Export globalTracking data** — map all 63 collections to their required stories and linked quizzes.
3. **Sample `fillInTheBlank` live data** — query 4 existing entries to understand the blank encoding convention.
4. **Paginate full content export** — build a script that iterates through all sections with pagination (limit + offset), exporting full content trees.
5. **Asset download** — download all 9,024 assets via the `url` field from AssetInterface, grouped by volume (images, videos, files, audio, scorm).
6. **Map content block → Sitecore AI component** — use the block distribution table in §3.3 as the migration priority order.

---

*Document generated from live schema introspection and data sampling. All queries were read-only. Raw introspection JSON: `introspection_raw.json` (4.8 MB).*
