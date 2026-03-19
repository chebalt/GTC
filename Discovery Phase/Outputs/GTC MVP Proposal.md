# GROHE Training Companion — MVP Proposal
## AI-Driven Accelerated Delivery

---

### What We're Proposing

We propose an MVP delivery of the GROHE Training Companion (GTC) on Sitecore AI, focused on delivering the **minimum feature set** required for a learner to complete the entire training journey — from exploring available collections, through consuming lessons and passing quizzes, all the way to earning a certificate.

This MVP is intentionally lean. It does not cover every feature of the current platform, but it delivers the **complete end-to-end learning path** so that real users can start training on the new platform from day one. All additional features and enhancements are layered on top in subsequent releases.

---

### What Your Users Will Be Able to Do

#### 1. Browse and Navigate Training Content
Users will land on a **dedicated GTC Home Page** with clear access to the full training catalogue. Every training module — whether a multi-chapter course or a compact training — will have its own **Collection Page** presenting the structure, chapters, and progress at a glance. Individual lessons are delivered through **Story Pages** with rich content. A **General Page** template supports any additional informational pages (e.g., about, help, legal).

#### 2. Log In and Access Their Personal Account
Learners sign in through the existing **GROHE IDP** (single sign-on) — no new passwords, no new accounts. Once logged in, they can access their **personal dashboard ("My Account")**, where they see an overview of enrolled courses and a dedicated section for **completed trainings** with direct access to earned certificates.

#### 3. Track Their Learning Progress — Automatically
As users scroll through training chapters, the system **automatically records their progress**. Visual indicators show which modules have been read, which quizzes have been attempted, and whether a certificate is available. This tracking works identically to the current Craft CMS experience — no learning data is lost in the transition.

#### 4. Take Quizzes and Earn Certificates
The **interactive quiz experience** is included with the two most common question types — **multiple choice and true/false** — rebuilt as modern, responsive components. Users see their **quiz progress in real time**, can retry attempts, and receive immediate scoring feedback. Additional question types (drag-and-drop, sliders, fill-in-the-blank, sorting) are delivered in subsequent releases.

Upon successful course completion, the system **generates a personalised PDF certificate** on demand — ready to download or share. Certificates are generated through a lightweight middleware service, keeping the solution simple and cost-effective.

#### 5. Full Existing Training History Migration
All **existing learning progress and quiz results** are migrated from the current Craft CMS database. Users will log into the new platform and find their completed courses, quiz scores, and certificates exactly where they left them. No history is lost. This migration is fully automated and **repeatable** — it can be re-run as many times as needed to capture the latest data right before sunsetting the current system.

#### 6. Access All Existing Training Content from Day One
The entire content library — **all collections, trainings, lessons, and quizzes across 19 languages** — is migrated automatically using AI-assisted tooling. Content structure, translations, media assets, and quiz configurations are all preserved. This is not a manual re-entry exercise; it is an **automated, repeatable migration pipeline** that ensures accuracy and speed.

---

### What This MVP Intentionally Defers

To keep the scope focused and the timeline achievable, the following capabilities are planned for subsequent releases:

- **Navigation (header, footer, menus)** — will reuse NEO navigation in the interim
- **Search** — training discovery works through browsing; dedicated search comes next
- **Personalisation** — role-based content filtering is deferred; all users see all content initially
- **Looker Studio reporting** — analytics dashboards are connected in a follow-up phase
- **Interactive content components** (slideshows, hotspots, A/B sliders, accordions, image tabs) — backend data models are created to preserve all content during migration, but the frontend will display interim placeholders until full component implementation is delivered
- **Feedback forms** — email-based feedback is added post-MVP
- **SEO (hreflang, sitemaps, redirects)** — full SEO optimisation follows before public launch
- **Content editor workflow, roles, Phrase integration** — editorial tooling is phased in after content is live

---

*This proposal covers the MVP scope only. The full platform delivery (including all deferred items above) is detailed in the GTC Project Plan.*
