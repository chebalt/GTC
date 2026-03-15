# Deliverables GAP Analysis — GROHE Training Companion (GTC)

**Project:** GTC Migration — Craft CMS → Sitecore AI (NEO)
**Document owner:** Artsiom Dylevich, Solution Architect, Actum Digital
**Version:** 1.0 — Discovery Phase deliverable
**Date:** 15 March 2026
**Status:** Draft for review

---

## 1. Component Gaps

The component mapping (13 reusable / 6 adaptation / 9 custom development) is based on **specification-level comparison only** — comparing Craft component specs against NEO component documentation and Figma designs. This mapping has not been validated in a running Sitecore AI instance with actual GTC content.

| Risk | Detail |
|---|---|
| **Reusable components may need adaptation** | Some of the 13 components marked as "reusable" may require adjustment once real GTC content is placed in them — layout differences, responsive behavior, field type mismatches, or styling conflicts may surface only during implementation |

For full component mapping detail, see `Discovery Phase/Outputs/Solution Overview.md`, Section 5.

---

## 2. Integration Gaps

The following integrations have unresolved scope or approach — marked **TBD** in the Solution Overview.

| Integration | Gap | Owner | Blocker For |
|---|---|---|---|
| **Celum — asset migration** | GROHE needs to review the downloaded assets (~10 GB, shared as zip) to determine: (1) whether they already exist in Celum, (2) whether they meet size/resolution requirements for Sitecore AI, (3) what the upload approach should be. Migration tooling cannot be designed until this is resolved. | Aaron, Andreas Fink (GROHE) | Content migration automation, media folder structure |
| **Sitecore Search — UX** | The search experience design is TBD. Sascha (UX) to propose a solution, then refine with the team. Most likely approach: extending the NEO SERP page with a new "Trainings" tab alongside Products/Spare Parts/Content. | Sascha Bonness (GROHE), Actum | Search implementation, front-end development |
| **Target group / IDP mapping** | In Craft, external users select their role (access group) from a dropdown — this role is stored only in Craft, not in the IDP. The NEO IDP has a similar "Professional Users" dropdown that could potentially be reused. The registration business logic including the "Customer type" selection flow needs to be defined. | GROHE, Actum | Personalization, role-based content visibility, registration flow |

---

## 3. Data & Migration Gaps

| Gap | Detail | Impact |
|---|---|---|
| **Course tracking history starts April 2024** | The `this_tracking_courses` table in Craft only contains data from April 2024 onwards (2,267 records). Playlist and quiz tracking goes back to November 2021. Any course completions before April 2024 are not in this table — they may only exist in the `GTC_Course_Statistics` Excel export that Jessica can generate from Craft. | Historical course completion data prior to April 2024 may be incomplete or require a separate extraction path |

---

*Document prepared by Artsiom Dylevich, Actum Digital, as part of the GTC Discovery Phase deliverables.*
*For questions or feedback, contact: Artsiom Dylevich / Marianna Husar (Actum Digital)*
