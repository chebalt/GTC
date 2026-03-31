# GTC Asset Usage Analysis

**Date:** 30 March 2026
**Source:** Craft CMS local MariaDB (`relations` table joined to `assets` and `elements`)
**Method:** Identified all assets referenced by at least one **canonical (live)** element. Excluded references from drafts and revisions to get the true "in-use" picture.

---

## Executive Summary

**1,555 of 9,114 assets (17%) are not referenced by any live content.** These orphaned files total **1.5 GB** and do not need to be migrated.

Migrating only the used assets reduces the transfer from **11.6 GB to 10.1 GB**.

---

## Summary Table

|                          | Count  | Size     | % of Total |
|--------------------------|-------:|---------:|-----------:|
| **Total assets in DB**   | 9,114  | 11.6 GB  | 100%       |
| **Used** (live content)  | 7,559  | 10.1 GB  | 87%        |
| **Unused** (orphaned)    | 1,555  | 1.5 GB   | 13%        |

---

## Breakdown by Asset Type

| Type       | Used Count | Used Size | Unused Count | Unused Size |
|------------|----------:|-----------:|-------------:|------------:|
| Image      | 6,802     | 3.3 GB    | 1,385        | 662 MB      |
| Video      | 594       | 6.0 GB    | 149          | 582 MB      |
| PDF        | 18        | 260 MB    | 20           | 104 MB      |
| Word       | 141       | 816 MB    | 0            | 0           |
| Audio      | 4         | 15 MB     | 0            | 0           |
| SCORM      | 0         | 0         | 1            | 182 MB      |

### Notes on "Used" Word Documents

The 141 Word docs (816 MB) are technically referenced by content entries but are likely **source/editor files**, not displayed to end users on the portal. Recommend confirming with Jessica/Daniela whether these need to be migrated.

---

## Top Folders with Unused Assets

| Folder | Files | Size | Types |
|--------|------:|-----:|-------|
| `videos/Installation-Systems/` | 97 | 280.0 MB | image, video |
| `scorm/` | 1 | 181.5 MB | compressed |
| `images/` (root) | 184 | 144.3 MB | image, video |
| `files/Filtration-Technologies/` | 1 | 65.6 MB | pdf |
| `videos/` (root) | 14 | 61.8 MB | video |
| `videos/Rainshower-AQUA-Ceiling-Shower/` | 20 | 60.6 MB | video |
| `videos/Rapido-SmartBox/Video-Snippets/` | 4 | 57.8 MB | video |
| `images/Dice/` | 7 | 54.2 MB | image |
| `videos/Rainshower-Aqua-Pure/Chapters/` | 4 | 42.9 MB | video |
| `videos/Blue-Pure/` | 4 | 41.5 MB | video |
| `images/ISH/` | 18 | 38.2 MB | pdf |
| `images/Rainshower-AQUA-Ceiling-Shower/` | 19 | 31.0 MB | image |
| `videos/QuickFix-Brand/` | 8 | 28.8 MB | video |
| `images/Filtration-Technologies/` | 46 | 24.7 MB | image |
| `images/Rainshower-AQUA-Ceiling-Shower/Installation/` | 26 | 19.6 MB | image |

---

## Largest Unused Assets (>5 MB)

| Size | Path | Type |
|-----:|------|------|
| 181.5 MB | `scorm/purefoam-de-Installer-20251125-111626.zip` | compressed |
| 65.6 MB | `files/Filtration-Technologies/GROHE-Kitchen-Brochure_en_Master.pdf` | pdf |
| 33.7 MB | `videos/Rapido-SmartBox/Video-Snippets/THM_38Degr.mp4` | video |
| 24.5 MB | `videos/How-to-Record-a-Visit.mp4` | video |
| 23.6 MB | `videos/Blue-Pure/RO-03-06-Install-the-concentrate-hose_nonClean.mp4` | video |
| 18.3 MB | `videos/Installation-Systems/13-installing-extension-set.mp4` | video |
| 16.8 MB | `videos/Rainshower-Aqua-Pure/Chapters/Grohe_G5-_...alternativeversion_2.mp4` | video |
| 16.8 MB | `videos/Rainshower-Aqua-Pure/Chapters/new-vid-final.mp4` | video |
| 15.7 MB | `videos/Installation-Systems/13-installing-support-set.mp4` | video |
| 15.1 MB | `videos/Installation-Systems/13-exchanging-AV1.mp4` | video |
| 14.6 MB | `videos/Rapido-SmartBox/Video-Snippets/BOX_Remove-the-flushing-plate-...cut.mp4` | video |
| 14.4 MB | `images/01-QuickFix_Cover.mp4` | video (misclassified) |
| 13.7 MB | `videos/2025_102_Grohe-Heeat-Recovery_Cleanfeed-...-seg6.mp4` | video |
| 12.8 MB | `videos/Installation-Systems/13-Step-7.mp4` | video |
| 12.8 MB | `videos/Installation-Systems/Installation-3/13-Step-7.mp4` | video (duplicate) |
| 12.0 MB | `videos/PF_GROHE_SmartContol_Dual_Spray_Kitchen_long_en_Master.mp4` | video |
| 11.3 MB | `images/Brand/Brand-products-02-hotspots.png` | image |
| 10.3 MB | `images/ZZH_T101832K01_000_01.jpg` | image |
| 10.3 MB | `images/Dice/ZZH_T101832K01_000_01.jpg` | image (duplicate) |
| 9.9 MB | `images/Dice/ZZH_T101833J01_000_01.jpg` | image |
| 9.8 MB | `videos/Installation-Systems/11-Keyvisual.png` | image (misclassified) |
| 9.4 MB | `images/ZZH_T102435J01_000_01.jpg` | image |
| 9.2 MB | `images/Rainshower-AQUA-Ceiling-Shower/01-combination-sprays-editorial-03.jpg` | image |
| 8.7 MB | `videos/Rainshower-AQUA-Ceiling-Shower/V13.mp4` | video |
| 8.6 MB | `images/Dice/ZZH_T101832J01_000_01.jpg` | image |
| 8.6 MB | `images/Dice/ZZH_T101832J02_000_01.jpg` | image |
| 8.4 MB | `videos/Rainshower-Aqua-Pure/Chapters/Aqua-Pure-Brand-Film-30sec-comp.mp4` | video |
| 8.4 MB | `images/Group-387.jpg` | image |
| 8.2 MB | `videos/Blue-Pure/RO-03-01-dimensions-and-conditions_poster.mp4` | video |
| 8.1 MB | `videos/Blue-Home/Installation-01/01-filter-bypass-settings.mp4` | video |
| 8.0 MB | `images/Dice/ZZH_T101832K02_000_01.jpg` | image |
| 7.8 MB | `images/SmartControl/03-Features-Benefits/03-features-benfits-smartcontrol-concealed.png` | image |
| 7.8 MB | `images/Dice/ZZH_T101856J02_000_01.jpg` | image |
| 7.7 MB | `videos/Rainshower-AQUA-Ceiling-Shower/V19.mp4` | video |
| 6.6 MB | `videos/Blue-Home/Installation-02/03-cold-and-warm-water.mp4` | video |
| 6.5 MB | `images/Rainshower-AQUA-Ceiling-Shower/01-combination-sprays-editorial-01.jpg` | image |
| 6.5 MB | `videos/Rapido-SmartBox/Video-Snippets/THM_Push-the-chome-cap-on.mp4` | video |
| 6.5 MB | `images/Pastel-colorful-Class-Schedule-Poster-1.png` | image |
| 6.3 MB | `videos/Blue-Home/Installation-03/01-cooler-connection.mp4` | video |
| 6.3 MB | `images/dice.jpg` | image |
| 6.0 MB | `videos/Installation-Systems/12-step-7.mp4` | video |
| 5.8 MB | `images/PureFoam/01-keyvisual-video.mp4` | video (misclassified) |
| 5.8 MB | `videos/Blue-Home/Installation-02/02-pullout-hose.mp4` | video |
| 5.8 MB | `images/Colours/01_brushed-hard-graphite.jpg` | image |
| 5.8 MB | `images/Rainshower-AQUA-Ceiling-Shower/01-combination-sprays-editorial-04.jpg` | image |
| 5.6 MB | `videos/QF-COVER-ESTE-1.mp4` | video |
| 5.6 MB | `images/QF-COVER-ESTE-1.mp4` | video (misclassified) |
| 5.6 MB | `images/QuickFix-Brand/QF-COVER-ESTE-1.mp4` | video (misclassified) |
| 5.6 MB | `videos/QuickFix-Brand/QF-COVER-ESTE.mp4` | video |
| 5.6 MB | `videos/QuickFix-Brand/QF-COVER.mp4` | video |
| 5.6 MB | `images/Untitled-design-1.mp4` | video (misclassified) |
| 5.6 MB | `videos/QuickFix-Brand/Untitled-design-1.mp4` | video |
| 5.5 MB | `videos/QuickFix-Brand/QF-COVER-ESTE-lOGO-GRANDE.mp4` | video |
| 5.4 MB | `videos/Blue-Home/Installation-01/02-ventilation-hole.mp4` | video |
| 5.4 MB | `videos/getting-to-know-companion/04-competence-in-pocket.mp4` | video |
| 5.4 MB | `videos/Salesforce-Login-Logout-Password-Reset/Login-Logout-Reset-Password.mp4` | video |
| 5.4 MB | `videos/Rainshower-AQUA-Ceiling-Shower/V16.mp4` | video |
| 5.4 MB | `videos/Rainshower-AQUA-Ceiling-Shower/V5.mp4` | video |
| 5.3 MB | `videos/Installation-Systems/12-step-4.mp4` | video |
| 5.2 MB | `videos/Blue-Pure/AF-02-05-Mounting-the-water-connections.mp4` | video |
| 5.2 MB | `images/ISH/Professional.pdf` | pdf (misclassified) |
| 5.1 MB | `videos/Installation-Systems/12-step-8.mp4` | video |

---

## Observed Issues

1. **Misclassified assets** — Several `.mp4` files are stored in the `images/` volume, and a `.png` is in `videos/`. Craft CMS classifies by volume, not by actual file type.

2. **Duplicates** — Some files exist in both root and subfolder (e.g., `ZZH_T101832K01_000_01.jpg` in both `images/` and `images/Dice/`; `13-Step-7.mp4` in two video folders).

3. **Internal/test content** — Files like `How-to-Record-a-Visit.mp4`, `Untitled-design-1.mp4`, `Pastel-colorful-Class-Schedule-Poster-1.png` appear to be internal or test uploads.

4. **Non-clean cuts** — Videos with `_nonClean` suffix are pre-edit versions that were superseded.

5. **SCORM package** — The 181.5 MB `purefoam-de-Installer` zip was uploaded but never linked to any entry. SCORM is out of scope for migration anyway.

---

## Recommendation

- **Migrate only the 7,559 referenced assets** (10.1 GB)
- **Exclude the 1,555 orphaned assets** (1.5 GB) from the migration scope
- **Review the 141 Word documents** (816 MB) with Jessica/Daniela — these are referenced but unlikely to be displayed on the portal
- **Share the orphan list** with the GTC content team for a final sanity check before discarding
- Consider running a **duplicate detection pass** on the used assets to further reduce the migration payload
