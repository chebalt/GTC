# GTC Component Mapping & Specifications

## Legend
- ✅ = Identical or almost fully reusable in NEO
- ⚙ = Partially similar — requires adaptation
- 🚫 = Not available — custom development needed

---

## Category 1: Basics Components

| # | GTC Component | NEO Equivalent | Status | Notes |
|---|---|---|---|---|
| 1 | Stage / Hero banner | Hero banner | ✅ | NEO adds video support and dual buttons. Headline always H1. |
| 2 | Text / Text block | Text Block | ✅ | Supports 2/3-column options and buttons. |
| 3 | Text/media / Content display block | Content Display Block | ✅ | Various image placements and backgrounds. |
| 4 | Text/Media Breakdown | Content Display Block | ✅ | Same component; doesn't include exact offset layout. |
| 5 | Editorial Text | Promo banner | ⚙ | GTC has scrolling animation (brand-story page); NEO is static only. |
| 6 | Multicolumn / Info Block | Info Block | ✅ | NEO: small images, multiple columns, buttons, Show more. |
| 7 | Blockquote with image | Quote | ✅ | Same structure; slightly different visual. |
| 8 | Blockquote | Quote | ✅ | Quote + author only. |
| 9 | Checklist | Info Block - Icons | ✅ | No dedicated checklist; Info Block with Icons is best option. |
| 10 | Table | Table | ✅ | NEO Table becomes **accordion on mobile**. |
| 11 | Download list | Downloads | ✅ | NEO adds document preview and request-document option. |

**Assessment:** ~90% reusable. Minor visual differences only.

---

## Category 2: Interaction Components

| # | GTC Component | NEO Equivalent | Status | Notes |
|---|---|---|---|---|
| 1 | A/B Slider | Media gallery | ⚙ | GTC-specific not available; Media Gallery shows one image per slide. |
| 2 | Slideshow | Media cards carousel / Tabs | ⚙/🚫 | No exact NEO equivalent; alternatives have limitations. |
| 3 | Text Slider | Media cards carousel / Tabs | ⚙/🚫 | Same as Slideshow. |
| 4 | Marquee Slider | Masonry gallery | ✅ | Alternative: Media gallery. |
| 5 | Teaser list | Media cards carousel | ✅ | Covers same capability with flexible media support. |
| 6 | Accordion | Accordion | ⚙ | NEO Accordion only accepts: Rich text, Image, Video (no teasers). |
| 7 | Tabs content | Tabs + Content display block | ✅ | Almost every component can be added to NEO Tabs. |
| 8 | Image tabs | Tabs | ⚙ | Only text-based tabs available in NEO. |
| 9 | Hotspots | Image with hotspots | ⚙ | Coming soon to NEO (not yet developed). Initial content = product-related only — customization needed. |

**Assessment:** Partially aligned. GTC sliders/carousels need adaptation to NEO multipurpose components.

---

## Category 3: Question/Quiz Components

| # | GTC Component | NEO Equivalent | Status |
|---|---|---|---|
| 1 | Choice question (single/multi) | N/A | 🚫 Custom dev |
| 2 | True/False Question | N/A | 🚫 Custom dev |
| 3 | Value slider question | N/A | 🚫 Custom dev |
| 4 | Sortable question | N/A | 🚫 Custom dev |
| 5 | Fill the blank question | N/A | 🚫 Custom dev |
| 6 | Drag Drop Text Question | N/A | 🚫 Custom dev |
| 7 | Drag Drop Image Question | N/A | 🚫 Custom dev |
| 8 | Feedbacks (per-question) | N/A | 🚫 Custom dev |

**Assessment: ALL 8 question types require full custom Sitecore development. This is the largest implementation gap and biggest cost driver.**

---

## Confirmed Quiz Details (from SCORM analysis)
- Pass threshold: **8/10** (purefoam quiz); configurable via `passThreshold` prop
- Unlimited retries confirmed
- Per-question feedback text (explanation shown after each answer)
- `disableShuffle` prop — answer order shuffle is configurable
- SCORM 1.2: `cmi.core.lesson_status` (incomplete/completed/passed)
- `cmi.suspend_data` = `{cpl: "id1,id2"}` (completed playlist IDs)
- Completion: `passed` = all quizzes done; score = completed playlists / total × 100

---

## Category 4: GTC Custom Components (Implementation Started)

| # | Component | Sitecore Rendering | FE Component | Status |
|---|---|---|---|---|
| 1 | GTC Stepper | `GTC Stepper` (`{7FC704F5-...}`) | `GtcStepper` (server+client) | Done — context-aware, all 3 page types, progress API integrated |
| 2 | GTC Collection Navigation | `GTC Collection Navigation` (`{A1B2C3D4-...}`) | `GtcCollectionNavigation` (server+client) | Done — Back/Next buttons, story complete on Next |
| 3 | GTC Quiz Overview | `GTC Quiz Overview` (`{B4E7F2A1-...}`) | `GtcQuizOverview` (server+client) | Done — headline, instruction, keyvisual, start button |

### GTC Stepper
- **Context-aware**: single component works on Collection, Story, and Quiz pages
  - Collection Page: fetches own `children`, no active step
  - Story/Quiz Page: fetches `parent.children` (siblings), current page = active step
  - Detection: `template.name === 'Collection Page'` from expanded ComponentQuery
- Renders steps as numbered horizontal stepper with **consecutive numbering** (1, 2, 3... regardless of type)
- Labels: "Chapter 01, 02..." for stories, "Quiz 01, 02..." for quizzes (dictionary-driven via `gtc.stepper.chapter`/`gtc.stepper.quiz`)
- Desktop: circles + labels; Mobile: circles only (labels hidden)
- No datasource — uses `$contextItem` ComponentQuery to fetch children + parent.children + template.name
- Distinguishes Story vs Quiz by `PassingScore` field presence (Quiz-only field)
- **Step states** (independent flags, not mutually exclusive):
  - Inactive: gray border, gray number, gray label
  - Active (not done): blue circle, white number, bold label
  - Done (not active): blue circle, checkmark icon, black label
  - Active + Done: blue circle with checkmark + ring-2 outline, bold label (done status preserved)
- Clickable links: Collection appends `/{childName}`, Story/Quiz strips last segment and appends `/{siblingName}`
- Progress fetched client-side from `/api/gtc/progress/batch` (GTC Learning API batch endpoint)
- GUID normalization: API returns dashed GUIDs, Sitecore uses no-dash uppercase — normalized in `useGtcProgress` hook
- API route uses hardcoded `DevBearer` auth for now; real IDP auth TBD
- Placed on GTC Collection Above Main partial design (`{D13E1283-...}`) — shared across Collection and Story Page Designs
- Width constrained: `max-w-[1280px] mx-auto`, `gap-6` between steps (matching Figma)

### GTC Quiz Overview
- Two-column layout: left = headline + instruction text + "Start quiz" button, right = keyvisual image
- **Datasource**: Quiz Page item itself (template `{20344734-...}`)
- **Fields consumed**: Headline (from `_BasePageTemplate`), InstructionText, KeyvisualUrl (all from ComponentQuery)
- **Server component** renders headline (`typo-headline-sm-bold 1024:typo-headline-lg-bold`), RichText for instruction text
- **Client component** `GtcQuizStartButton` — renders button with dictionary key `gtc.quiz.start` via `useT()`
- Image rendered via Next.js `Image` component (`sizes="(max-width: 1024px) 100vw, 592px"`). Locally renders as plain `<img>` (no srcset) because `next.config.ts` sets `unoptimized: !VERCEL_IMAGE_TTL` — on Vercel, full optimization (srcset, WebP/AVIF) kicks in.
- Craft domain `lc.training.grohe.this.work` added to `next.config.ts` `remotePatterns`
- Width: `max-w-[1280px]` with `1024:px-20` outer padding
- **Rendering**: `{B4E7F2A1-8C3D-4E5F-9A6B-7D8E9F0A1B2C}`
- **Partial design**: GTC Quiz Above Main (`{A2C4E6F8-...}`) — Breadcrumbs + GTC Stepper + GTC Quiz Overview
- **Placeholder settings**: `sxa-gtc-quiz-above-main` (`{C3D4E5F6-...}`)
- Quiz Page Design uses this partial instead of GTC Collection Above Main

### GTC Quiz Engine (architecture decided 12 Apr 2026)
- **Option B chosen**: SPA-style, single quiz page renders all questions client-side (no page-per-question routing)
- Rationale: (1) `ShuffleQuestions` flag needs client-side array shuffle — page-based routing breaks this, (2) API only stores final score, not per-question answers — no server state to restore, (3) question items are data templates not page templates — no content model rework, (4) matches existing Craft CMS Nuxt.js SPA behavior
- Alternatives rejected: (A) page-per-question — breaks shuffle, needs content model rework, adds state management across pages; (C) hybrid hash-based — marginal benefit over pure SPA, extra complexity
- **Implementation approach**: server component fetches quiz fields + all child questions via GraphQL, passes to `GtcQuizEngine` client component. Client manages: question order (shuffle), current index, user answers, score computation. On completion: POST to `/neo/gtc-learning/v1/quiz/{quizId}/attempt` with `{ score, completed }`. Show pass/fail using `PassText`/`FailText` fields.
- Trade-off accepted: page refresh resets quiz (acceptable — quizzes are 8-10 questions, ~2 min)
- **Question types to implement**: Choice (65%), TrueFalse (14%), ValueSlider (14%), DragDrop (5%), FillBlank (<1%), Sortable (<1%) — switch on template ID
- **Quiz fields used**: ShuffleQuestions, PassingScore, NumberOfQuestions, EnableFeedback, PassText, FailText, Headline, InstructionText, KeyvisualUrl
- **Figma designs**: Multiple Choice (4120-6493), True/False (4120-5213), Fail Results (4120-7467), Success Results (4129-6788), Negative Feedback (4120-6818), Positive Feedback (4120-7140)

### GTC Collection Navigation
- Back/Next buttons at the bottom of Story pages for navigating between collection siblings
- **Back** (secondary outlined, left arrow): navigates to previous sibling
- **Next Chapter/Quiz** (primary filled, right arrow): POSTs story-complete to `/api/gtc/story/complete`, then navigates to next sibling
- Either button conditionally rendered (hidden if no prev/next sibling exists)
- Uses NEO `Button` component (`variant="primary"`/`"secondary"`, `size="large"`) + `IconArrowLeft24`/`IconArrowRight24`
- Returns null on Collection pages — only renders on Story/Quiz child pages
- Prev/next determined server-side from `parent.children` via ComponentQuery
- Next label is dictionary-driven: "Next Chapter" (`gtc.navigation.nextChapter`) or "Next Quiz" (`gtc.navigation.nextQuiz`) based on next sibling's `PassingScore` field
- **New layout**: GTC Story Layout — General Layout + `gtc-below-main` placeholder after `headless-main`
- **New partial design**: GTC Story Below Main — places this component into `gtc-below-main`
- Story Page Design now has 4 partial designs: header, above-main, below-main, footer

---

## Functional Components (Non-Content)

### User Account Component
- Two sections: **Personal Data** (read-only) + **Learning History** (list of completed courses)
- Personal data: Title, First/Last Name, Email, Country (ISO-2)
- Learning History: course thumbnail, title, completion date, [Download Certificate] button
- Complexity: Integration with MyAccount/IDP for profile sync; date format localization (DD.MM.YYYY vs MM/DD/YYYY)

### Personalization Component
- Target group selection: user manually sets during registration or in account settings
- Groups: `grohe`, `installer`, `architect & designer`, `kitchen studio`, `lixil`, `dev_only`, `showroom`
- Visibility at **component level** (Nugget level) — many-to-many: multiple roles can see same component
- Confidential content (e.g., Hansgrohe vs GROHE comparison) visible to `grohe` only
- Default behavior for unassigned role: TBD (show minimal content or "Contact Support")
- MVP: access-based visibility only; NO behavioral personalization
- Target group info must come from IDP; NEO handles this differently than CraftCMS → investigation needed

### Training Completion Tracking
- Completion triggers: scroll to bottom of Story → green checkmark
- Collection marked "done" when: all required Stories completed + linked quiz passed
- Configuration: editors set in backend which Stories/quizzes are required for a Collection
- Data stored: 100% in Craft CMS (no external DB)
- Migration: training history must be extracted and migrated

### PDF Certificate Creation
- One certificate template, personalized by user name + course name
- Auto-generated upon training completion (user clicks Download in their account)
- Stored in CMS; no retention/digital signature requirements
- Future Salesforce integration being considered

### HotSpot Component
- Interactive image with clickable zones
- Coming to NEO "soon" (not yet developed as of Feb 2026)
- Initial NEO hotspot content will be product-related only → customization needed for GTC use cases
- Field spec: Image, Hotspot positions (x/y), Hotspot titles, Hotspot descriptions, optional CTAs

### User Tracking
- Google Analytics (via GTM)
- Looker Studio dashboard for reporting (data pushed via Excel export)
- Contact for access: Marina Vorontcova
- Track: users per module/quiz, users by segment, page views, market/language breakdown

### Feedback Form
- Collects user feedback on trainings
- Export mechanism: CSV/Excel (TBD) — open question

### Training Search
- Auth-gated: only visible/accessible to logged-in users
- Scope: **Courses, Chapters, and Quizzes** (per spec); simplified to **course level only** (per workshop decision)
- Search indexes: keyword + category (Segments: Professional/Spa/Quickfix; Product Names)
- Real-time results dropdown; thumbnail + title + short description per result
- Role-based visibility: results filtered by user's target group
- Current tech: Elasticsearch 7.17; target: Sitecore search provider
- Performance: trigger after 3+ characters typed
- Accessibility: WCAG 2.1 AA compliant (aria-live, keyboard nav, focus management)

### Header & Footer
- All elements TBD (pending UX/design alignment)
- Header proposed: meta-nav, GROHE/GTC logo (TBD), My Account dropdown, language switch, search, flyout nav
- Footer proposed: Imprint, Privacy Policy, Terms of Use, feedback link (TBD), logo, logout (TBD), copyright

---

## UI/Content Components (detailed specs)

### A/B Slider (B Slider)
- Side-by-side comparison of two images (before/after)
- Interactive drag handle to reveal left/right image
- Fields: Left Image, Right Image, optional labels/captions
- Adaptation from NEO Media Gallery needed

### Text Slider
Two user stories written:
**A: Tab Navigation Slider**
- Tabs above a Stage-like display; clicking tab updates content
- ARIA: tablist/tab/tabpanel; keyboard: Left/Right arrows
- Modes: Text Only, Image Only, Text + Image
- Autoplay: optional, paused on hover/interaction

**B: Tabbed Image Slider (Thumbnail Nav)**
- Top section: large image + text block of active tab
- Bottom section: thumbnail navigation bar
- Clicking thumbnail activates content
- Autoplay: optional; WCAG 2.1 AA; inline Experience Editor support

### Image Tabs
- Tabs using images as tab selectors (not text labels)
- Only text-based tabs exist in NEO currently → adaptation needed

---

## Summary Gap Count
| Category | Total | ✅ | ⚙ | 🚫 |
|---|---|---|---|---|
| Basics | 11 | 10 | 1 | 0 |
| Interactions | 9 | 3 | 5 | 1 |
| Questions | 8 | 0 | 0 | 8 |
| **Total** | **28** | **13** | **6** | **9** |

**9 components require custom development; 8 of those are the quiz/question types.**
