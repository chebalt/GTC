# Craft CMS GraphQL — Multilingual Content Analysis
**Date:** 2026-03-05
**Analyst:** Artsiom Dylevich
**Scope:** Read-only investigation of localized content accessibility via GraphQL API.
**Status:** ✅ Complete

---

## Executive Summary

**CRITICAL FINDING: All 19 language sites ARE accessible via the existing GraphQL token.** The earlier assumption (in `Craft-CMS-GraphQL-Schema-Analysis.md §10.1`) that the API only exposes `en-GB` was incorrect. Using `site: "*"` or direct site handles, all 19 localizations can be queried with the current bearer token.

This means a **full multilingual content export is possible via the GraphQL API** — no database-level access is strictly required for content. DB access is still needed for user tracking data.

---

## 1. All 19 Site Handles

| Handle | Language Code | Approx. Collections | Notes |
|--------|--------------|---------------------|-------|
| `enGB` | en-GB | 63 | Master / source |
| `de` | de | 54 | German |
| `nl` | nl | 54 | Dutch |
| `fr` | fr | 54 | French |
| `es` | es | 54 | Spanish |
| `ar` | ar | 50 | Arabic (RTL) |
| `cs` | cs | 50 | Czech |
| `ru` | ru | 50 | Russian |
| `bg` | bg | 44 | Bulgarian |
| `pl` | pl | 46 | Polish |
| `tr` | tr | 40 | Turkish |
| `da` | da | 48 | Danish |
| `pt` | pt | 48 | Portuguese |
| `uk` | uk | 48 | Ukrainian |
| `nb` | nb | 32 | Norwegian Bokmål |
| `el` | el | 27 | Greek |
| `hr` | hr | 27 | Croatian |
| `hu` | hu | 12 | Hungarian |
| `fi` | fi | 17 | Finnish |

**Not all content is published in all languages.** `enGB` is always the master with the most content. Some languages (Finnish, Hungarian) have significantly fewer collections.

---

## 2. How to Query Localized Content

### Option A: Query a single site by handle
```graphql
{
  coursesEntries(site: "de") {
    id title slug language siteHandle
  }
}
```

### Option B: Query all sites in one request
```graphql
{
  coursesEntries(site: "*", limit: 100) {
    id title slug language siteHandle
  }
}
```
Note: `site: "*"` returns entries across all sites in one response. With pagination this allows a full cross-language export. However, for large datasets (861 lessons × 19 languages) querying per-site is more manageable.

### Option C: `localized` field — get all translations of one entry
```graphql
{
  coursesEntries(slug: "grohe-ceramics-basics") {
    id title slug language siteHandle
    localized(site: "*") {
      id title slug language siteHandle
    }
  }
}
```
This returns the entry itself + all 18 other language versions in a single query. Confirmed working: returns all 19 versions for the ceramics collection.

### Option D: `language` argument (2-letter codes only)
```graphql
{
  coursesEntries(language: "de", limit: 5) { id title slug }
}
```
Works with 2-letter codes (`de`, `fr`, `nl`, `es`, `pt`, `pl`, `ru`). Does **not** work with hyphenated codes (`de-DE`, `fr-FR`) — these throw a server error.

---

## 3. Translation Quality Assessment

### 3.1 Content titles (trainings)
Out of 270 trainings accessible in DE:
- **251 (93%)** have identical titles to EN — same product names, English-only titles are normal
- **19 (7%)** have genuinely different titles (translation or localization variation)
- **35** EN trainings are not present in DE at all

### 3.2 Content titles (lessons)
Out of 816 lessons accessible in DE:
- **742 (91%)** have identical titles to EN
- **73 (9%)** differ (includes minor typo fixes, e.g. "SFiltration" → "Filtration")
- **46** EN lessons are not present in DE

### 3.3 Body content
Body content (textModule, headingModule, etc.) is translated into each language. The `contentBuilder` field returns language-specific content when querying with a site handle. This is the core multilingual content.

### 3.4 UI strings — FULLY TRANSLATED ✅
`globalUiTexts` global set has one entry per site. Quiz interaction strings, navigation labels, header texts are all properly localized. Key examples:

| String | enGB | de | fr | ru | ar |
|--------|------|----|----|----|-----|
| Confirm button | OK | OK | OK | OK | موافق |
| Retry button | Retry | Erneut versuchen | Réessayer | Повторить попытку | إعادة المحاولة |
| Start Quiz | Start | Start | Commencer | Начать | البدء |
| TRUE label | TRUE | RICHTIG | VRAI | ПРАВИЛьНО | صح |
| FALSE label | FALSE | FALSCH | FAUX | НЕПРАВИЛьНО | خطأ |
| Home (nav) | Home | Startseite | Accueil | — | الصفحة الرئيسية |
| Logout | Logout | Abmelden | Déconnexion | — | تسجيل الخروج |

Note: Some languages (like `ru`) appear to have EN fallbacks for header texts — Ukrainian has the most complete translation including unique placeholder text ("Упс упс упс" for locked content headline).

---

## 4. Content Counts Across All Languages

| Type | enGB | de | fr | nl | es | pt | ru |
|------|------|----|----|----|----|----|-----|
| Collections | 63 | 54 | 54 | 54 | 54 | 48 | 50 |
| Trainings | 305 | 270 | 270 | 270 | 260 | 230 | 248 |
| Lessons | 861 | 816 | 816 | 816 | 815 | 790 | 815 |

**Pattern:** Major European languages (de, fr, nl, es) appear to share the same publication scope (~54 collections, ~270 trainings). Portuguese and Russian have slightly less. Smaller markets (fi, hu) have significantly fewer.

---

## 5. Quiz Interaction Texts — Field Names (corrected)

The `globalInteractionTexts_BlockType` within `globalUiTexts` contains these translatable scalar fields:

```
singleChoiceInstruction        multipleChoiceInstruction
singleChoiceImageInstruction   multipleChoiceImageInstruction
valueSliderInstruction         trueFalseInstruction
dragDropInstruction            sortableRankingInstruction
fillTheBlankInstruction
trueFalseTrueLabel             trueFalseFalseLabel
confirmationButton             retryButton
solutionButton                 quizStartButton
quizRestartButton
positiveFeedbackHeadline       negativeFeedbackHeadline
solutionFeedbackHeadline
positiveQuizFeedbackHeadline   negativeQuizFeedbackHeadline
progressIndicatorLabel
```

These must all be migrated to Sitecore AI's dictionary/labeling system, one set per language.

---

## 6. Migration Strategy — Recommended Approach

### Phase 1: Per-language content export

```
For each site in [enGB, de, hu, da, el, bg, nl, tr, es, hr, pt, fr, ar, cs, pl, uk, nb, fi, ru]:
  Export: coursesEntries(site: "{handle}")
  Export: trainingsEntries(site: "{handle}")
  Export: lessonsEntries(site: "{handle}")
  Export: quizzesEntries(site: "{handle}")
  Export: quizInteractions(site: "{handle}")
  Export: globalSets(handle: "globalUiTexts", site: "{handle}")
  Export: globalSets(handle: "globalTracking", site: "{handle}")
```

Total estimated content volume across all 19 languages:
- Collections: ~800 (63 EN + variations)
- Trainings: ~4,500
- Lessons: ~12,000+
- Quiz interactions: ~371 (shared — likely not multiplied by language)

### Phase 2: Asset export (language-neutral)
Assets (`images`, `videos`, `files`, `audio`, `scorm`) are shared across sites — no per-language duplication needed.

### Phase 3: Sitecore AI import
- Use `uid` field as stable cross-language identifier (same UID across localizations of the same entry)
- Use `siteHandle` + `slug` as routing key

---

## 7. Data Quality Notes

- Some DE training titles match EN slugs but appear to be different content (possibly a content reshuffling in DE — e.g., "Rapido Shower Frame Heat Recovery - Installation preparation" slug exists in DE with title "Purefoam - Installation preparation"). This may indicate some localized sites have been independently restructured.
- Slug matching across languages is **not** a safe uniqueness key. Use `uid` instead — it is the canonical cross-site entry identifier in Craft CMS.
- Some UI strings appear to have EN placeholder text that was never translated (e.g., `lockedContentPopupHeadline` = "Locked Content Popup Headline" in most languages — likely a content management oversight, not a technical issue).

---

## 8. Updated Script Requirements

The existing `full_export.js` only queries `enGB`. It must be updated to:
1. Accept a `site` parameter
2. Loop through all 19 site handles
3. Save per-language JSON files (e.g., `ceramics-basics-de.json`)
4. Use `uid` as the cross-language linking key

Scripts produced during this investigation:
- `probe_localization.js` — Site handle discovery
- `probe_localization2.js` — Content counts per language
- `probe_localization3.js` — Field name discovery, translation comparison
- `probe_localization4.js` — Final targeted checks, UI strings, scale analysis

---

*All queries in this analysis were READ-ONLY. No mutations were performed.*
