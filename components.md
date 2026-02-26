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
