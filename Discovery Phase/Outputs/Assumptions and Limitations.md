# Assumptions and Limitations

The following assumptions and limitations apply to the amended scope of the GTC implementation. Any changes to these conditions may impact the timeline and budget.

### Infrastructure & Architecture

1. **Shared Sitecore AI instance** — GTC content is incorporated into the existing NEO content tree. No separate multisite solution is implemented; the same repository and infrastructure are reused.

2. **No Google Cloud Storage for certificates** — Certificate files are not persisted in GCS. Google Cloud Run is used for on-demand generation with temporary caching only.

3. **Shared NEO IDP tenant** — GTC authentication uses the existing NEO IDP integration. No separate tenant or custom authentication layer is developed.

4. **Apigee setup is out of scope** — API gateway configuration is not included in this engagement.

### Content & Editorial

5. **Reuse of NEO header, footer, and navigation** — GTC pages use the existing NEO header and footer components. No custom GTC navigation is developed.

6. **Reuse of NEO publishing workflow** — GTC content follows the existing NEO editorial and publishing workflow. No custom workflow is developed.

7. **Limited interactive components** — Only A/B Slider and Hotspots are developed as new components. All other content components (e.g., Accordion, Image Tabs, Slideshow) are mapped to existing NEO equivalents where possible.

8. **Personalisation rules — setup only** — Personalisation rules are developed in Sitecore AI, but the actual rule configuration for specific content is performed manually by the GTC editorial team after delivery.

### Tracking & Analytics

9. **Craft-compatible tracking schema** — The existing Craft CMS database schema is reused for storing user learning progress. The implementation follows the current progress-tracking logic without redesign or platform-agnostic abstraction.

10. **Standard GTM integration only** — Google Tag Manager analytics integration covers standard page and event tracking. Custom actions, advanced event configurations, or bespoke data layer extensions are excluded.

11. **No platform-agnostic API** — No standalone, externally consumable API is developed. The middleware serves the GTC application only.

### Search & Reporting

12. **Search as NEO extension** — Search is delivered as an extension of the existing NEO search: a new section in the search dropdown and a new tab on the search results page. No standalone GTC search experience is developed.

13. **Direct Looker Studio connection** — CSV import functionality is excluded. Looker Studio connects directly to the database for reporting purposes.

### Quiz

14. **Two question types only** — The quiz engine supports multiple choice and true/false question types. Additional types (drag-and-drop, sliders, fill-in-the-blank, sorting) are not included in this scope.
