# GTC Content Migration — Component (Content Builder) Field Mapping

**Version:** 1.0  
**Date:** 14 April 2026  
**Author:** Artsiom Dylevich  
**Scope:** Craft CMS `contentBuilder[]` block types → Sitecore AI (NEO) renderings + datasource items

---

## Table of Contents

1. [Overview](#1-overview)
2. [Category 1 — Basics (Reusable)](#2-category-1--basics-reusable)
   - 2.1 Stage / Hero Banner
   - 2.2 Text Block
   - 2.3 Text/Media → Content Display Block
   - 2.4 Editorial Text → Promo Banner
   - 2.5 Multicolumn → Info Block Grid + Info Block Card
   - 2.6 Blockquote → Quote
   - 2.7 Checklist → Info Block Card (Icons)
   - 2.8 Table
   - 2.9 Download List → Downloads Collection + Download Card
   - 2.10 Heading (standalone)
   - 2.11 Image (standalone)
   - 2.12 Video (standalone)
3. [Category 2 — Interactions (Adaptation Required)](#3-category-2--interactions-adaptation-required)
   - 3.1 Accordion → Accordion 2
   - 3.2 Text Tabs → Tab Component
   - 3.3 Image Tabs → Tab Component (adapted)
   - 3.4 Slideshow / Content Slider → Media Cards Carousel
   - 3.5 Text Slider → Media Cards Carousel
   - 3.6 Marquee Slider → Masonry Gallery
   - 3.7 A/B Slider → Media Gallery (adapted)
   - 3.8 Hotspots → Image2
4. [Blocks NOT Migrated](#4-blocks-not-migrated)
5. [Gap Analysis Summary](#5-gap-analysis-summary)
6. [Media Handling Rules](#6-media-handling-rules)

---

## 1. Overview

Craft CMS stores page body content as an ordered array of Neo blocks in the `contentBuilder[]` field. Each block type maps to a specific NEO Sitecore rendering + datasource item. This document maps every Craft block field to its NEO Sitecore datasource template field.

**Content builder blocks exist on:** Lessons (`lessons_lessons_Entry`) — the primary content type. Trainings and Collections reference lessons but do not themselves have `contentBuilder`.

**Block distribution (from Craft export, en-GB):**

| Priority | Block Type | Count | NEO Target | Status |
|---|---|---|---|---|
| P1 | `multicolumnModule` | 286 | Info Block Grid + Cards | ✅ Reusable |
| P1 | `textModule` | 212 | Text Block | ✅ Reusable |
| P1 | `nextChapterModule` | 188 | GTC Collection Navigation | ✅ Component (no datasource) |
| P1 | `textMediaModule` | 114 | Content Display Block | ✅ Reusable |
| P2 | `imageModule` | 86 | Image2 | ✅ Reusable |
| P2 | `headingModule` | 26 | (inline / Text Block) | ⚙ See notes |
| P2 | `videoModule` | 24 | Video | ✅ Reusable |
| P2 | `thumbnailTabsModule` | 23 | Tab Component | ⚙ Adaptation |
| P2 | `entryLinksModule` | 18 | — | ❌ Skip |
| P2 | `tableModule` | 16 | Table | ✅ Reusable |
| P2 | `contentSliderModule` | 12 | Media Cards Carousel | ⚙ Adaptation |
| P3 | `feedbackLayerModule` | 10 | GTC Feedback (component) | ✅ Component (no datasource) |
| P3 | `textSliderModule` | 9 | Media Cards Carousel | ⚙ Adaptation |
| P3 | `interactionModule` | 7 | — | ❌ Skip (inline quiz, not tracked) |
| P3 | `textTabsModule` | 6 | Tab Component | ✅ Reusable |
| P3 | `checklistModule` | 6 | Info Block Card | ⚙ Adaptation |
| P3 | `parallaxModule` | 2 | Promo Banner | ⚙ Adaptation |
| P3 | `sectionModule` | 2 | — | ❌ Skip (container only) |
| P3 | `blockquoteModule` | rare | Quote | ✅ Reusable |
| P3 | `accordionModule` | rare | Accordion 2 | ✅ Reusable |
| P3 | `abSliderModule` | rare | Media Gallery | ⚙ Adaptation |
| P3 | `marqueeSliderModule` | rare | Masonry Gallery | ✅ Reusable |
| P3 | `hotspotModule` | rare | Image2 | ⚙ Adaptation |
| P3 | `downloadsModule` | rare | Downloads Collection | ✅ Reusable |

**Coverage:** P1 blocks (multicolumn + text + textMedia + nextChapter) = **800 of ~900** total blocks (**~89%**).

---

## 2. Category 1 — Basics (Reusable)

### 2.1 Stage / Hero Banner

**Craft block:** `stage_BlockType` (on page-level, not contentBuilder)  
**NEO rendering:** Hero Banner  
**NEO datasource template:** `/sitecore/templates/Feature/Grohe Neo/HeroBanner/HeroBanner`

| # | Craft Field | Craft Path | Craft Type | NEO Field | NEO Type | Transform | Notes |
|---|---|---|---|---|---|---|---|
| 1 | overline | `stage[0].overline` | String | Tagline | Single-Line Text | Direct copy | NEO calls this "Tagline" |
| 2 | headline | `stage[0].headline` | String | Headline | Single-Line Text | Direct copy | |
| 3 | subline | `stage[0].subline` | String | Description | Rich Text | Wrap in `<p>` if plain text | |
| 4 | keyvisual | `stage[0].keyvisual[0].url` | Asset ref | Image | Droptree (media item) | Upload to media library | See [media rules](#6-media-handling-rules) |
| — | — | — | — | VideoFile | File | — | **No Craft equivalent** — NEO-only feature |
| — | — | — | — | VideoLink | Single-Line Text | — | **No Craft equivalent** |
| — | — | — | — | ButtonsPrimary | General Link | — | **No Craft equivalent** — NEO adds CTA buttons |
| — | — | — | — | ButtonsSecondary | General Link | — | **No Craft equivalent** |

**Gap:** Craft Hero is simple (text + image). NEO Hero supports video backgrounds and dual CTA buttons — no data to populate these fields during migration.

---

### 2.2 Text Block

**Craft block:** `textModule_BlockType` (212 occurrences)  
**NEO rendering:** TextBlock  
**NEO datasource template:** `/sitecore/templates/Feature/Grohe Neo/TextBlock/TextBlock`

| # | Craft Field | Craft Path | Craft Type | NEO Field | NEO Type | Transform | Notes |
|---|---|---|---|---|---|---|---|
| 1 | optionalHeading | `.optionalHeading` | String | Title | Single-Line Text | Direct copy (nullable) | |
| 2 | textComponent | `.textComponent` | HTML (Rich Text) | Text | Rich Text | Direct copy | Main body content |
| 3 | buttonComponent | `.buttonComponent` | Link object | ButtonsPrimary | General Link | Convert to Sitecore link XML | See [transform rule](#link-transform) |
| — | textModuleLayout | `.textModuleLayout` | String | — | — | **Rendering Parameters** | "1-col", "2-col", "3-col" → rendering param |
| — | textSettings | `.textSettings` | Object | — | — | — | Font size/weight; no NEO equivalent |
| — | backgroundSettings | `.backgroundSettings` | Object | — | — | **Rendering Parameters** | Background color → rendering param |
| — | spacingSettings | `.spacingSettings` | Object | — | — | **Rendering Parameters** | Spacing → rendering param |
| — | — | — | — | SubTitle | Single-Line Text | — | **No Craft equivalent** |
| — | — | — | — | FunctionalAttribute | Single-Line Text | — | **No Craft equivalent** (analytics) |
| — | — | — | — | ButtonsSecondary | General Link | — | **No Craft equivalent** |

**Gaps:**
- Craft `textModuleLayout` (2/3-col) has no direct field in NEO — handled via rendering parameters. Need to define mapping.
- Craft layout/spacing/background settings → NEO rendering parameters. These may need a custom parameter mapping table.

---

### 2.3 Text/Media → Content Display Block

**Craft block:** `textMediaModule_BlockType` (114 occurrences)  
**NEO rendering:** Content Display Block  
**NEO datasource template:** `/sitecore/templates/Feature/Grohe Neo/ContentDisplayBlock/Content Display Block`

| # | Craft Field | Craft Path | Craft Type | NEO Field | NEO Type | Transform | Notes |
|---|---|---|---|---|---|---|---|
| 1 | optionalHeading | `.optionalHeading` | String | Headline | Single-Line Text | Direct copy (nullable) | |
| 2 | textComponent | `.textComponent` | HTML | Description | Multi-Line Text | Strip HTML tags | **Type mismatch**: Craft is Rich Text, NEO is Multi-Line Text (plain). HTML formatting lost. |
| 3 | buttonComponent | `.buttonComponent` | Link | ButtonsPrimary | General Link | Convert to link XML | |
| 4 | nestedImageComponent | `.children[?].imageComponent[0].url` | Asset ref | Image | Droptree (media) | Upload to media library | From child `nestedImageComponent_BlockType` |
| 5 | nestedVideoComponent | `.children[?].videoComponent[0].url` | Asset ref | VideoFile / VideoLink | File / Text | Upload or external URL | From child `nestedVideoComponent_BlockType` |
| — | textMediaDesktopSettings | `.textMediaDesktopSettings` | Object | — | — | **Rendering Parameters** | `mediaPosition` (left/right), `mediaWidth` (50%/33%), `textTopOffset`, `showBorder` |
| — | textMediaMobileSettings | `.textMediaMobileSettings` | Object | — | — | **Rendering Parameters** | Mobile layout overrides |
| — | textMediaBreakout | `.textMediaBreakout` | Boolean | — | — | **Rendering Parameters** | Full-width breakout |
| — | — | — | — | ButtonsSecondary | General Link | — | **No Craft equivalent** |
| — | — | — | — | VideoIframeTitle | Single-Line Text | — | **No Craft equivalent** (accessibility) |

**Critical Gap:** NEO `Description` field is Multi-Line Text (plain text), but Craft `textComponent` contains HTML. Two options:
1. Strip HTML → lose formatting (bold, links, lists)
2. Request NEO team to change field type to Rich Text

**Recommendation:** Flag for NEO team review. If Description must remain plain text, the HTML content will need to be simplified.

---

### 2.4 Editorial Text → Promo Banner

**Craft block:** `parallaxModule_BlockType` (2 occurrences)  
**NEO rendering:** Promo Banner  
**NEO datasource template:** `/sitecore/templates/Feature/Grohe Neo/PromoBanner/Promo Banner`

| # | Craft Field | Craft Path | Craft Type | NEO Field | NEO Type | Transform | Notes |
|---|---|---|---|---|---|---|---|
| 1 | heading | `.children[0].headingComponent.headline` | String | Headline | Single-Line Text | Extract from child block | |
| 2 | text | `.children[0].textComponent` | HTML | Description | Rich Text | Direct copy | |
| — | parallaxElementSettings | `.parallaxElementSettings` | Object | — | — | — | **Lost:** scroll animation effects not available in NEO |
| — | — | — | — | Image | Droptree | — | **No Craft equivalent** for this block type |
| — | — | — | — | ButtonsPrimary/Secondary | General Link | — | **No Craft equivalent** |
| — | — | — | — | VideoFile/VideoLink | File/Text | — | **No Craft equivalent** |

**Gap:** Craft parallax has scroll-based animation; NEO Promo Banner is static. Visual fidelity lost, but only 2 instances.

---

### 2.5 Multicolumn → Info Block Grid + Info Block Card

**Craft block:** `multicolumnModule_BlockType` (286 occurrences — **most common**)  
**NEO rendering:** Info Block Grid (container) + Info Block Card (per column)  
**NEO datasource templates:**
- Grid: `/sitecore/templates/Feature/Grohe Neo/Info Block/InfoBlockGrid`
- Card: `/sitecore/templates/Feature/Grohe Neo/Info Block/InfoBlockCard`

**Grid-level fields:**

| # | Craft Field | Craft Path | Craft Type | NEO Field | NEO Type | Transform | Notes |
|---|---|---|---|---|---|---|---|
| 1 | optionalHeading | `.optionalHeading` | String | Headline | Single-Line Text | Direct copy (nullable) | |
| — | columnSettings | `.columnSettings` | Object | — | — | **Rendering Parameters** | Number of columns, spacing |
| — | — | — | — | Description | Multi-Line Text | — | **No Craft equivalent** at grid level |
| — | — | — | — | Button | General Link | — | **No Craft equivalent** at grid level |

**Card-level fields (per column child):**

| # | Craft Field | Craft Path | Craft Type | NEO Field | NEO Type | Transform | Notes |
|---|---|---|---|---|---|---|---|
| 1 | heading | `.children[n].optionalHeading` | String | Title | Single-Line Text | Direct copy | |
| 2 | textComponent | `.children[n].textComponent` | HTML | Text | Multi-Line Text | Strip HTML | **Type mismatch** — same issue as Content Display Block |
| 3 | buttonComponent | `.children[n].buttonComponent` | Link | Link | General Link | Convert to link XML | |
| 4 | imageComponent | `.children[n].imageComponent[0].url` | Asset ref | LargeImage or SmallImage | Droptree (media) | Upload to media library | Choose LargeImage for prominent images, SmallImage for thumbnails |
| 5 | iconComponent | `.children[n].iconComponent` | SVG/icon | IconImage | Droptree (media) | Upload to media library | If Craft uses SVG icons |

**Gap:** NEO `Text` is Multi-Line Text (plain). Craft column text contains HTML. Same issue as Content Display Block — needs resolution.

---

### 2.6 Blockquote → Quote

**Craft block:** `blockquoteModule_BlockType` (rare)  
**NEO rendering:** Quote  
**NEO datasource template:** `/sitecore/templates/Feature/Grohe Neo/Quotes/Quote`

| # | Craft Field | Craft Path | Craft Type | NEO Field | NEO Type | Transform | Notes |
|---|---|---|---|---|---|---|---|
| 1 | quote text | `.quote.text` | HTML | Text | Rich Text | Direct copy | |
| 2 | quote author | `.quote.author` | String | AuthorName | Single-Line Text (Shared) | Direct copy (nullable) | |
| — | headingComponent | `.headingComponent` | Object | — | — | — | Craft has optional heading above quote; NEO Quote has no heading |
| — | — | — | — | AuthorDescription | Single-Line Text | — | **No Craft equivalent** — NEO can show author role/title |
| — | — | — | — | AuthorPicture | Droptree | — | **No Craft equivalent** for blockquote (only "blockquote with image" variant uses images) |

**"Blockquote with Image" variant:** If Craft block has an image in `headingComponent.imageComponent`, map to `AuthorPicture`.

---

### 2.7 Checklist → Info Block Card (Icons)

**Craft block:** `checklistModule_BlockType` (6 occurrences)  
**NEO rendering:** Info Block Card (with IconImage)  
**NEO datasource template:** `/sitecore/templates/Feature/Grohe Neo/Info Block/InfoBlockCard`

| # | Craft Field | Craft Path | Craft Type | NEO Field | NEO Type | Transform | Notes |
|---|---|---|---|---|---|---|---|
| 1 | checklistItems[] | `.checklistItems[n]` | String[] | Title (per card) | Single-Line Text | One card per checklist item | Each item becomes a separate InfoBlockCard |
| — | — | — | — | IconImage | Droptree | Set to checkmark icon | Need standard checkmark icon in media library |

**Gap:** Craft checklist = flat list of text items. NEO has no dedicated checklist rendering — each item becomes an Info Block Card with an icon. Requires creating N datasource items per checklist block. Visually different but functionally equivalent.

---

### 2.8 Table

**Craft block:** `tableModule_BlockType` (16 occurrences)  
**NEO rendering:** Table  
**NEO datasource template:** `/sitecore/templates/Feature/Grohe Neo/Table/Datasource/Table`

| # | Craft Field | Craft Path | Craft Type | NEO Field | NEO Type | Transform | Notes |
|---|---|---|---|---|---|---|---|
| 1 | heading | `.optionalHeading` | String | Headline | Single-Line Text | Direct copy (nullable) | Default: `$name` |
| 2 | table data | `.table` | TableMaker object | Table | Droptree → child Table Rows + Table Cells | **Complex transform** | See below |
| — | — | — | — | Description | Rich Text | — | **No Craft equivalent** |
| — | — | — | — | TitleAboveTable | Single-Line Text | — | **No Craft equivalent** |
| — | — | — | — | Button | General Link | — | **No Craft equivalent** |

**Table data transform:**
Craft's TableMaker stores data as a JSON structure with `columns[]` and `rows[][]`. NEO Table uses a tree of child items:
1. Create a Table datasource item
2. For each row → create a `Table Row` child item
3. For each cell in the row → create a `Table Cell` child item with `Text` field

**Table Cell fields:**
| NEO Field | Type | Source |
|---|---|---|
| Text | Single-Line Text | Cell value from Craft `rows[r][c]` |
| Icon | Droptree | — (no Craft equivalent) |
| Image | Droptree | — (no Craft equivalent) |
| Alignment | Dropdown | Column alignment from Craft (if specified) |

**Gap:** Craft TableMaker supports column types (heading row, alignment). NEO Table is simpler. NEO Table becomes accordion on mobile.

---

### 2.9 Download List → Downloads Collection + Download Card

**Craft block:** `downloadsModule_BlockType` (rare)  
**NEO renderings:** Downloads Collection (container) + Download Card (per file)  
**NEO datasource templates:**
- Collection: `/sitecore/templates/Feature/Grohe Neo/DownloadCard/DownloadsCollection`
- Card: `/sitecore/templates/Feature/Grohe Neo/DownloadCard/DownloadCard`

**Collection-level:**

| # | Craft Field | Craft Path | Craft Type | NEO Field | NEO Type | Transform |
|---|---|---|---|---|---|---|
| 1 | optionalHeading | `.optionalHeading` | String | Headline | Single-Line Text | Direct copy (nullable) |
| — | — | — | — | Description | Multi-Line Text | — |

**Card-level (per file):**

| # | Craft Field | Craft Path | Craft Type | NEO Field | NEO Type | Transform | Notes |
|---|---|---|---|---|---|---|---|
| 1 | file asset | `.files[n].url` | Asset ref | File | File (media) | Upload to media library | |
| — | — | — | — | Preview | File | — | **No Craft equivalent** (NEO document preview) |
| — | — | — | — | IsLocked | Checkbox | — | **No Craft equivalent** |
| — | — | — | — | HasPhysicalCopy | Checkbox | — | **No Craft equivalent** |

---

### 2.10 Heading (standalone)

**Craft block:** `headingModule_BlockType` (26 occurrences)  
**NEO rendering:** TextBlock (reuse) or Page Title  
**NEO datasource template:** `/sitecore/templates/Feature/Grohe Neo/TextBlock/TextBlock`

| # | Craft Field | Craft Path | Craft Type | NEO Field | NEO Type | Transform | Notes |
|---|---|---|---|---|---|---|---|
| 1 | overline | `.headingComponent.overline` | String | SubTitle | Single-Line Text | Direct copy (nullable) | |
| 2 | headline | `.headingComponent.headline` | String | Title | Single-Line Text | Direct copy | |
| 3 | subline | `.headingComponent.subline` | String | Text | Rich Text | Wrap in `<p>` | |
| — | alignment | `.headingComponent.alignment` | String | — | — | **Rendering Parameters** | left/center/right |
| — | htmlTag | `.headingSettings.htmlTag` | String | — | — | — | h1/h2/h3 — no NEO field |
| — | displayStyle | `.headingSettings.displayStyle` | String | — | — | — | Visual weight — no NEO field |

**Note:** NEO has no standalone "Heading" rendering. Map to TextBlock with only Title populated, or to Page Title rendering depending on context. The `htmlTag` (h1/h2/h3) semantic information is lost.

---

### 2.11 Image (standalone)

**Craft block:** `imageModule_BlockType` (86 occurrences)  
**NEO rendering:** Image2  
**NEO datasource template:** `/sitecore/templates/Feature/Grohe Neo/Image2/Image2`

| # | Craft Field | Craft Path | Craft Type | NEO Field | NEO Type | Transform | Notes |
|---|---|---|---|---|---|---|---|
| 1 | heading | `.optionalHeading` | String | Headline | Single-Line Text | Direct copy (nullable) | |
| 2 | image | `.imageComponent[0].url` | Asset ref | Image | Droptree (media) | Upload to media library | |
| 3 | caption | `.imageComponent[0].alt` or `.captionText` | String | Caption | Rich Text | Wrap in `<p>` if plain text | |
| — | layoutArea | `.layoutArea` | String | — | — | **Rendering Parameters** | full-width / contained |
| — | captionPosition | `.captionPosition` | String | — | — | — | below/overlay — no NEO equivalent |
| — | infoTextPosition | `.infoTextPosition` | String | — | — | — | No NEO equivalent |
| — | — | — | — | Description | Rich Text | — | **No Craft equivalent** |
| — | — | — | — | Hotspot01X–05 | Single-Line Text | — | **No Craft equivalent** in basic image (see Hotspot block) |

---

### 2.12 Video (standalone)

**Craft block:** `videoModule_BlockType` (24 occurrences)  
**NEO rendering:** Video  
**NEO datasource template:** `/sitecore/templates/Feature/Grohe Neo/Video/Video`

| # | Craft Field | Craft Path | Craft Type | NEO Field | NEO Type | Transform | Notes |
|---|---|---|---|---|---|---|---|
| 1 | heading | `.optionalHeading` | String | Title | Single-Line Text | Direct copy (nullable) | |
| 2 | video asset | `.videoComponent[0].url` | Asset ref (self-hosted) | VideoFile | File (media) | Upload to media library | For self-hosted videos |
| 2b | video URL | `.videoComponent[0].url` | External URL | VideoLink | Single-Line Text | Direct copy | For YouTube/Vimeo embeds |
| 3 | poster/thumbnail | `.videoComponent[0].thumbnail` | Asset ref | Image | Droptree (media) | Upload to media library | Video poster frame |
| — | controls | `.videoSettings.controls` | Boolean | — | — | — | No NEO field |
| — | autoplay | `.videoSettings.autoplay` | Boolean | Autoplay | Checkbox | Direct copy | |
| — | loop | `.videoSettings.loop` | Boolean | — | — | — | No NEO field |
| — | muted | `.videoSettings.muted` | Boolean | — | — | — | No NEO field |
| — | — | — | — | Text | Rich Text | — | **No Craft equivalent** |
| — | — | — | — | VideoIframeTitle | Single-Line Text | — | **No Craft equivalent** (accessibility) |

---

## 3. Category 2 — Interactions (Adaptation Required)

### 3.1 Accordion → Accordion 2

**Craft block:** `accordionModule_BlockType` (rare)  
**NEO rendering:** Accordion 2 (container) + Accordion 2 Section (per panel)  
**NEO datasource templates:**
- Accordion: `/sitecore/templates/Feature/Grohe Neo/Accordion2/Accordion`
- Section: `/sitecore/templates/Feature/Grohe Neo/Accordion2/Accordion Section`

**Accordion-level:**

| # | Craft Field | Craft Path | Craft Type | NEO Field | NEO Type | Transform | Notes |
|---|---|---|---|---|---|---|---|
| 1 | optionalHeading | `.optionalHeading` | String | Title | Single-Line Text | Direct copy (nullable) | |
| — | openOnlyOnePanel | `.accordionSettings.openOnlyOnePanel` | Boolean | — | — | — | **No NEO equivalent** — NEO always allows multiple open |
| — | — | — | — | Button | General Link | — | **No Craft equivalent** |

**Section-level (per `accordionPanel` child):**

| # | Craft Field | Craft Path | Craft Type | NEO Field | NEO Type | Transform | Notes |
|---|---|---|---|---|---|---|---|
| 1 | panel title | `.children[n].title` or `.children[n].heading` | String | Title | Single-Line Text | Direct copy | |
| 2 | initiallyOpened | `.children[n].initiallyOpened` | Boolean | IsOpened | Checkbox | `true` → `1` | |
| 3 | panel content | `.children[n].textComponent` | HTML | — | — | **Place components inside section placeholder** | Accordion sections in NEO accept nested renderings (TextBlock, Image2, etc.) |

**Gap:** Craft accordion panels can contain arbitrary nested content blocks (text, images, other blocks). NEO Accordion 2 Section uses a dynamic placeholder — the nested content must be placed as child renderings inside the section. This is a **structural migration challenge**, not just a field mapping.

---

### 3.2 Text Tabs → Tab Component

**Craft block:** `textTabsModule_BlockType` (6 occurrences)  
**NEO rendering:** Tabs Collection (container) + Tab Component (per tab)  
**NEO datasource templates:**
- Collection: `/sitecore/templates/Feature/Grohe Neo/TabComponent/TabsCollection`
- Tab: `/sitecore/templates/Feature/Grohe Neo/TabComponent/TabComponent`

**Collection-level:**

| # | Craft Field | Craft Path | Craft Type | NEO Field | NEO Type | Transform |
|---|---|---|---|---|---|---|
| — | optionalHeading | `.optionalHeading` | String | — | — | Skip (no heading field on TabsCollection) |
| — | — | — | — | EventName | Single-Line Text | — (analytics) |

**Tab-level (per `textTab` child):**

| # | Craft Field | Craft Path | Craft Type | NEO Field | NEO Type | Transform | Notes |
|---|---|---|---|---|---|---|---|
| 1 | tab label | `.children[n].tabLabel` | String | Title | Single-Line Text | Direct copy | Tab header text |
| 2 | tab content | `.children[n].textComponent` | HTML | — | — | **Place as nested renderings** | Tab content goes inside tab's dynamic placeholder |

**Gap:** Like accordion, tab content in Craft can contain arbitrary blocks. NEO Tab Component uses dynamic placeholders — content blocks inside each tab must be placed as child renderings.

---

### 3.3 Image Tabs → Tab Component (adapted)

**Craft block:** `thumbnailTabsModule_BlockType` (23 occurrences)  
**NEO rendering:** Tab Component (adapted — text labels only)  
**NEO datasource template:** Same as Text Tabs

| # | Craft Field | Craft Path | Craft Type | NEO Field | NEO Type | Transform | Notes |
|---|---|---|---|---|---|---|---|
| 1 | tab thumbnail | `.children[n].thumbnail[0].url` | Asset ref | — | — | **LOST** | NEO tabs are text-only; image thumbnails not supported |
| 2 | tab label | `.children[n].tabLabel` | String | Title | Single-Line Text | Direct copy | Falls back to text label |
| 3 | tab content | `.children[n].content` | Nested blocks | — | — | Nested renderings | Same as text tabs |

**Gap:** Craft Image Tabs use thumbnail images as tab selectors. NEO Tab Component only supports text labels. The image thumbnail navigation is **lost** — tabs will show text labels instead. This affects 23 blocks. **Consider custom development** if visual fidelity is required.

---

### 3.4 Slideshow / Content Slider → Media Cards Carousel

**Craft block:** `contentSliderModule_BlockType` (12 occurrences)  
**NEO rendering:** Media Cards Carousel (container) + Media Card (per slide)  
**NEO datasource templates:**
- Carousel: `/sitecore/templates/Feature/Grohe Neo/MediaCardsCarousel/MediaCardsCarousel`
- Card: `/sitecore/templates/Feature/Grohe Neo/MediaCards/MediaCard`

**Carousel-level:**

| # | Craft Field | Craft Path | Craft Type | NEO Field | NEO Type | Transform |
|---|---|---|---|---|---|---|
| 1 | heading | `.optionalHeading` | String | Headline | Single-Line Text | Direct copy (nullable) |
| — | contentSliderSettings.effect | `.contentSliderSettings.effect` | String | — | — | **Lost** (slide/fade) |
| — | contentSliderSettings.pagination | `.contentSliderSettings.pagination` | Boolean | — | — | **Rendering Parameters** |
| — | contentSliderSettings.loop | `.contentSliderSettings.loop` | Boolean | — | — | **Rendering Parameters** |
| — | contentSliderSettings.autoplay | `.contentSliderSettings.autoplay` | Boolean | — | — | **Rendering Parameters** |
| — | — | — | — | Description | Multi-Line Text | — | **No Craft equivalent** |
| — | — | — | — | Button | General Link | — | **No Craft equivalent** |

**Card-level (per `mediaSlide` / `slide` child):**

| # | Craft Field | Craft Path | Craft Type | NEO Field | NEO Type | Transform | Notes |
|---|---|---|---|---|---|---|---|
| 1 | slide title | `.children[n].title` | String | Title | Single-Line Text | Direct copy | |
| 2 | slide text | `.children[n].textComponent` | HTML | Text | Single-Line Text | Strip HTML, truncate | **Type mismatch**: NEO MediaCard.Text is Single-Line Text |
| 3 | slide image | `.children[n].imageComponent[0].url` | Asset ref | Image | Droptree (media) | Upload to media library | |
| 4 | slide video | `.children[n].videoComponent[0].url` | Asset ref | VideoFile / VideoLink | File / Text | Upload or URL | |
| 5 | slide link | `.children[n].buttonComponent` | Link | Link | General Link | Convert to link XML | |

**Gap:** NEO MediaCard `Text` is Single-Line Text — Craft slide text is HTML. Formatting will be lost.

---

### 3.5 Text Slider → Media Cards Carousel

**Craft block:** `textSliderModule_BlockType` (9 occurrences)  
Same mapping as Content Slider above, but Craft text slider has richer text content per slide.

Additional fields on Text Slider not in Content Slider:
- `textMediaDesktopSettings` (media position/width) — lost in carousel format
- `textMediaMobileSettings` — lost

---

### 3.6 Marquee Slider → Masonry Gallery

**Craft block:** `marqueeSliderModule_BlockType` (rare)  
**NEO rendering:** Masonry Gallery (container) + Masonry Gallery Media (per image)  
**NEO datasource templates:**
- Gallery: `/sitecore/templates/Feature/Grohe Neo/MasonryGallery/MasonryGallery`
- Media: `/sitecore/templates/Feature/Grohe Neo/MasonryGallery/MasonryGalleryMedia`

**Gallery-level:**

| # | Craft Field | Craft Path | Craft Type | NEO Field | NEO Type | Transform |
|---|---|---|---|---|---|---|
| 1 | heading | `.optionalHeading` | String | Headline | Single-Line Text | Direct copy (nullable) |
| — | — | — | — | Description | Rich Text | — |

**Media-level (per image):**

| # | Craft Field | Craft Path | Craft Type | NEO Field | NEO Type | Transform |
|---|---|---|---|---|---|---|
| 1 | image | `.marqueeSliderComponent.images[n].url` | Asset ref | Image | Droptree (media) | Upload to media library |
| 2 | alt | `.marqueeSliderComponent.images[n].alt` | String | Title | Single-Line Text | Direct copy |
| — | — | — | — | Description | Rich Text | — |
| — | — | — | — | VideoModalDescription | Single-Line Text | — |

**Gap:** Craft marquee = continuous horizontal scroll. Masonry Gallery = grid layout. Visual presentation differs but content is equivalent.

---

### 3.7 A/B Slider → Media Gallery (adapted)

**Craft block:** `abSliderModule_BlockType` (rare)  
**NEO rendering:** Media Gallery  
**NEO datasource template:** `/sitecore/templates/Feature/Grohe Neo/MediaGallery/MediaGallery`

| # | Craft Field | Craft Path | Craft Type | NEO Field | NEO Type | Transform | Notes |
|---|---|---|---|---|---|---|---|
| 1 | heading | `.optionalHeading` | String | Headline | Single-Line Text | Direct copy | |
| 2 | imageA | `.abSliderImages.imageA[0].url` | Asset ref | Media child item 1 → Image | Droptree (media) | Upload + create child | |
| 3 | imageB | `.abSliderImages.imageB[0].url` | Asset ref | Media child item 2 → Image | Droptree (media) | Upload + create child | |
| — | handleStartPosition | `.handleStartPosition` | Number | — | — | — | **Lost** — drag handle not in NEO |

**Gap:** Craft A/B Slider has a drag handle for before/after comparison. NEO Media Gallery shows images in a slideshow. The interactive comparison UX is **completely lost**. Custom development would be needed to preserve this behavior.

---

### 3.8 Hotspots → Image2

**Craft block:** `hotspotModule_BlockType` (rare)  
**NEO rendering:** Image2 (with hotspot fields)  
**NEO datasource template:** `/sitecore/templates/Feature/Grohe Neo/Image2/Image2`

| # | Craft Field | Craft Path | Craft Type | NEO Field | NEO Type | Transform | Notes |
|---|---|---|---|---|---|---|---|
| 1 | image | `.imageComponent[0].url` | Asset ref | Image | Droptree (media) | Upload to media library | |
| 2 | hotspot 1 X | `.imageHotspots[0].positionX` | Number | Hotspot01X | Single-Line Text | Number → String | Percentage position |
| 3 | hotspot 1 Y | `.imageHotspots[0].positionY` | Number | Hotspot01Y | Single-Line Text | Number → String | |
| 4 | hotspot 1 target | `.imageHotspots[0].targetEntry` or `.text` | Entry ref / String | Hotspot01SKU | Single-Line Text | Entry slug or text | Craft uses `hotspotType`: "overlay" (link to nugget) or "tooltip" (show text) |
| 5–15 | hotspots 2–5 | `.imageHotspots[1–4].*` | Same | Hotspot02–05X/Y/SKU | Same | Same | NEO supports max 5 hotspots |

**Gaps:**
- NEO Image2 hotspots link to **product SKUs** (NEO is an e-commerce platform). Craft hotspots link to **content entries** (nuggets) or show **tooltip text**. The SKU field semantics don't match.
- Craft hotspots can have more than 5 points; NEO caps at 5.
- Craft has two hotspot types (overlay → navigate to page, tooltip → show text). NEO only has SKU-based product tooltips.
- **Custom development likely needed** for GTC hotspot behavior.

---

## 4. Blocks NOT Migrated

| Block Type | Count | Reason |
|---|---|---|
| `nextChapterModule` | 188 | Handled by GTC Collection Navigation component; no datasource needed |
| `feedbackLayerModule` | 10 | Handled by GTC Feedback component; no datasource needed |
| `interactionModule` | 7 | Inline quiz questions — explicitly not tracked, out of scope |
| `sectionModule` | 2 | Container/grouping block — structural only, no content |
| `entryLinksModule` | 18 | Related content links — defer to search/navigation |
| `nuggetInjector` | rare | Content reuse — handle with Sitecore cloning or manual content copy |
| `completedCoursesModule` | rare | User profile block — handled by GTC My Account component |
| `downloadButtonModule` | rare | Single-file CTA — can merge into Download Card |

---

## 5. Gap Analysis Summary

### Fields with Type Mismatches (Action Required)

| Component | Craft Field | Craft Type | NEO Field | NEO Type | Impact | Resolution |
|---|---|---|---|---|---|---|
| Content Display Block | textComponent | Rich Text (HTML) | Description | Multi-Line Text | Formatting lost | Request field type change OR strip HTML |
| Multicolumn / Info Block Card | textComponent | Rich Text (HTML) | Text | Multi-Line Text | Formatting lost | Same as above |
| Media Card (slides) | textComponent | Rich Text (HTML) | Text | Single-Line Text | Formatting + length lost | Strip HTML, truncate |

### Features Lost in Migration

| Feature | Craft Block | NEO Equivalent | Impact |
|---|---|---|---|
| Parallax/scroll animation | `parallaxModule` | Promo Banner (static) | 2 blocks; minimal |
| A/B comparison slider | `abSliderModule` | Media Gallery (slideshow) | Rare; moderate visual loss |
| Image tab thumbnails | `thumbnailTabsModule` | Tab Component (text only) | 23 blocks; moderate visual loss |
| "Open only one" accordion | `accordionModule` | Accordion 2 (always multi) | Rare; minor UX difference |
| Hotspot → content links | `hotspotModule` | Image2 (SKU-based) | Rare; semantics mismatch |
| Video controls/loop/muted | `videoModule` | Video (autoplay only) | 24 blocks; minor |
| Heading HTML tag (h1/h2/h3) | `headingModule` | TextBlock | 26 blocks; semantic HTML loss |
| Table column types | `tableModule` | Table (flat cells) | 16 blocks; minor formatting loss |

### NEO Fields with No Craft Source (Left Empty)

| NEO Component | NEO-Only Fields | Notes |
|---|---|---|
| Hero Banner | VideoFile, VideoLink, ButtonsPrimary, ButtonsSecondary | NEO feature additions |
| TextBlock | SubTitle, FunctionalAttribute, ButtonsSecondary | |
| Content Display Block | ButtonsSecondary, VideoIframeTitle | |
| All with Tracking* | TrackingButtonsPrimary, TrackingButtonsSecondary, TrackingShowMore, TrackingButton | Analytics tracking — not in Craft |
| Download Card | Preview, IsLocked, HasPhysicalCopy | NEO e-commerce features |

---

## 6. Media Handling Rules

### Image Assets

All image references in Craft are relative paths (e.g., `/assets/images/example.jpg`).

**During development:**
```
Full URL = https://lc.training.grohe.this.work + /assets/images/example.jpg
```
Images served directly from Craft. Works for dev/preview.

**For production:**
1. Upload all referenced images to CDN (Google Cloud Storage TBD)
2. Replace base URL in all Image/Droptree fields
3. Alternatively: use Sitecore Media Library — upload images as media items, reference via Droptree

**For Sitecore Droptree/Image fields:** Images must be uploaded to the Sitecore Media Library and referenced by item ID. This requires:
1. Batch upload images to `/sitecore/media library/Grohe Neo/GTC/`
2. Create a manifest mapping Craft asset path → Sitecore media item ID
3. Set Droptree fields to the media item GUID

### Video Assets

Same pattern as images. Self-hosted videos go to `VideoFile` (File field → media library). External embed URLs (YouTube/Vimeo) go to `VideoLink` (text field).

### Link Transform

Craft `buttonComponent` objects must be converted to Sitecore General Link XML format:

```xml
<link text="Button Text" linktype="external" url="https://example.com" target="_blank" />
```

Or for internal links:
```xml
<link text="Button Text" linktype="internal" id="{SITECORE-ITEM-GUID}" />
```

Internal links require resolving Craft entry slugs to Sitecore item GUIDs via `content-id-map.json`.
