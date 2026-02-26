# SCORM Package Analysis — GTC

## Packages Analysed
- `purefoam-de-Installer-20251124-113815.zip` — German, Installer target group
- `purefoam-fr-GROHE-20251124-111645.zip` — French, GROHE internal target group

Both extracted to `/tmp/scorm_analysis/` (temp, not persisted across sessions).

## Technical Architecture
- **SCORM version**: 1.2 (`ADL SCORM 1.2`)
- **Manifest**: Single SCO per course (`adlcp:scormtype="sco"`, `href="./index.html"`)
- **Frontend**: Custom **Nuxt.js SPA** (not Articulate Storyline / Captivate / iSpring)
- **Backend API**: `https://lc.training.grohe.this.work` (Learning Companion, by THIS)
- **IDP**: `https://idp2-apigw.cloud.grohe.com`
- **Mode**: `companion` (meaning TBC)
- **Auth options**: `AUTH_OPTION_REGISTER: false`, `AUTH_OPTION_LOSTPASSWORD: false`

## Key Config (from `window.__NUXT__` in index.html)
```
API: "https://lc.training.grohe.this.work"
API_IDP: "https://idp2-apigw.cloud.grohe.com"
API_GATE: "api/v1"
CACHE_STRATEGY: "cacheapi"
THEME: "grohe"
URL: "https://training.grohe.com"
AUTH_STRATEGY: "local"
AUTH_OPTION_REGISTER: false
AUTH_OPTION_LOSTPASSWORD: false
MODE: "companion"
EXPORT: true
EXPORT_PASSWORD: "P0eZ!Gi%zvxG"
SCORM: true
SCORM_VERSION: 1.2
API_ELASTIC_SEARCH_PREFIX: "grohe_craft-entries_"
API_ELASTIC_SEARCH_QUERY_FIELDS: ["categories^40","headline^20","overline^10","subline^5","attachment.content"]
SUPERUSERGROUPS: ["admin","editor"]
```

## SCORM Data Model Used
| Field | Usage |
|---|---|
| `cmi.core.lesson_status` | `incomplete` → `completed` (playlists done) → `passed` (all quizzes done) |
| `cmi.core.score.raw` | `Math.round(completedPlaylists / totalPlaylists * 100)` |
| `cmi.core.score.min` | 0 |
| `cmi.core.score.max` | 100 |
| `cmi.core.exit` | `suspend` (incomplete) or `logout` (completed/passed) |
| `cmi.suspend_data` | JSON: `{"cpl":"id1,id2,id3"}` — comma-separated completed playlist IDs |

## All API Endpoints (from JS bundle)
- `GET /api/auth/user`, `POST /api/auth/login`, `POST /api/auth/logout`
- `GET /api/me`, `GET /api/session-info`, `GET /api/accessgroups`
- `POST /api/register`, `POST /api/reset-password`, `POST /api/set-password`
- `POST /api/send-feedback`, `GET /api/verify-user-token?timestamp=`
- `POST /api/tracking/course/completion` — `{courseId, siteId, completed: true}`
- `POST /api/tracking/chapter/completion` — `{playlistId, siteId, completed: true}`
- `POST /api/tracking/quiz/attempt` — `{quizId, siteId, score, csrfTokenName, csrfTokenValue, ...}`
- `POST /api/tracking/page/enter`, `POST /api/tracking/page/leave`
- `POST /api/tracking/download-event`
- `POST /api/tracking/identity`
- `navigator.sendBeacon /api/tracking/ping` (page: `trackingPageId` from sessionStorage)

## Confirmed Quiz Structure (Purefoam, 10 questions, pass = 8/10)
Content is **fully embedded in JS bundles** (not fetched from API at runtime).

### Question Types (4 confirmed)
1. **Value slider** — `MInteraction` / `value-slider` component; `correctThreshold` field; instruction text shown
2. **Single-choice** — one correct answer; images supported per answer option
3. **Multi-choice** — multiple correct answers; `disableShuffle: Boolean` prop
4. **True/False** — statement evaluation

### Quiz Behaviour (confirmed)
- Pass threshold: `passThreshold` field, 8/10 for Purefoam
- Unlimited retries — "Erneut versuchen" button; success screen invites repeat
- Per-question feedback text confirmed (correct answer explanation shown after each response)
- Answer shuffle optional (`disableShuffle` prop)
- Score on retry: best score kept (`e > t.get("cmi.core.score.raw") && t.set(...)`)

### DE Purefoam Quiz Questions (10)
1. Value slider — How much foam in 15 seconds? → 2 litres with 7.5 ml soap
2. Value slider — Average soap use per shower? → 12–14 ml
3. Multi-choice — How can Purefoam device be installed? → Adhesive OR screws
4. Multi-choice — KINUAMI soap fragrances? → Waterlilly, Blossom, Marine, Mint, Citrus (5 of 7)
5. Multi-choice — KINUAMI soap properties? → Vegan, no mineral oil, no parabens, no microplastics, child-safe
6. Multi-choice — Five foam mode time intervals? → 4, 7, 10, 12, 15 seconds
7. True/False — "Foam mode always active when showering" → FALSE (button-activated)
8. Single-choice — Compatible handshowers? → Only 2 specific: Metallstab + 110 mm
9. Single-choice — How to activate cleaning mode? → Hold left button >3 seconds
10. True/False — "Powered by 3 AAA batteries" → FALSE (rechargeable battery)

## Content Differences by Target Group
- **DE Installer**: product knowledge + quiz only
- **FR GROHE internal**: adds sales persona stories (Emma/Greg/Sarah), objection-handling scripts, FAQ section, consultant question guides — plus same quiz
- **Conclusion**: target group drives content *scope*, not just access filtering

## Component Library (confirmed names)
**Atomic (C prefix):** CAccordion, CBlockquote, CButton, CButtonAudio, CButtonModal, CChecklist, CDownload, CDownloadList, CFeedback, CGrid, CH, CHeading, CIframe, CImage, CInputCheckbox, CInputDropdown, CInputRadio, CInputRange, CInputText, CInputTextarea, CLink, CList, CMarquee, CMessage, CModal, CQuizFeedback, CQuizFeedbackQuestions, CQuizProgressIndicator, CScrollto, CSection, CSlider, CTile, CTimebox, CToast, CTooltip, CVideo

**Module (M prefix):** MAbSlider, MAccordion, MAnchorNavigation, MAuthorisationForm, MBlockquote, MButton, MChecklist, MCompletedCourses, MDivider, MDownload, MDownloadList, MDragSlider, MFeedback, MFormChangePassword, MFormProfile, MHeading, MHotspot, MImage, MInteraction, MMarquee, MMulticolumn, MNextChapter, MParallax, MQuiz, MSlider, MSlot, MStage, MStatement, MTable, MTabs, MText, MTextMedia, MTextSlider, MTileView, MVideo

## Security Issues
1. **Elasticsearch credentials hardcoded** in SCORM JS bundles: `username: "elastic"`, password in plain text. Distributed to external parties. Flagged to client — rotate immediately.
2. **SCORM packages call live THIS backend** at runtime. After June 2026 decommission, existing distributed packages will lose auth + tracking silently (content still renders as it's embedded).
