# Notion Setup Guide — Antone Holmes Portfolio

## Overview

All site content is managed from **one Notion database**: the Resume Content DB.
Each row is a content item with a `Section Type` property that tells the build
script which page and section it belongs to.

---

## Database IDs

| Database | ID | Purpose |
|---|---|---|
| Resume Settings | `64158dfefe6244e4801148e73460ac9b` | Global settings (1 row) |
| Resume Content | `19362f03bcdb427586c4e470d9ac9e90` | All content rows |

---

## Resume Settings DB (1 row only)

| Property Name | Type | Notes |
|---|---|---|
| Name | Title | Your full name: "Antone Holmes" |
| Subtitle | Text | One-line professional subtitle |
| Profile Photo URL | URL | External URL to your headshot (use GitHub raw URL — never expires) |
| Tagline | Text | Left panel tagline e.g. "Sales & GTM Leader · Educator · Builder" |
| Bio Short | Text | 2–3 sentence bio for home page |
| Accent Color | Text | Hex code e.g. `#b5863a` |
| Border Color | Text | Hex code e.g. `#e4e3df` |
| Section Header Color | Text | Hex code |
| Blur Intensity | Number | 0–100 (0 = off) |
| Nav Label: Home | Text | Leave blank to use default "Home" |
| Nav Label: CV | Text | Leave blank to use default "CV" |
| Nav Label: Resume | Text | Leave blank to use default "Pro Resume" |
| Nav Label: Cases | Text | Leave blank to use default "Cases" |
| Nav Label: Portfolio | Text | Leave blank to use default "Portfolio" |
| Nav Label: Changelog | Text | Leave blank to use default "Updates" |

---

## Resume Content DB — Shared Properties (all rows)

These properties exist on every row regardless of Section Type:

| Property Name | Type | Notes |
|---|---|---|
| Name | Title | Primary label (varies by type — see below) |
| Section Type | Select | Controls which page/section this row appears in |
| Published | Checkbox | ✅ = visible on site. Uncheck to hide without deleting |
| Order | Number | Sort order within section (lower = first) |
| Title | Text | Secondary label (role, subtitle, platform, etc.) |
| Date Range | Text | Text date e.g. "2021 – Present" or "2018–" |
| Date | Date | Actual date for sorting (used by Updates, Reflections, Articles, Changelog) |
| Description | Text | Main body / excerpt text |
| Full Text | Text | Long-form content (Reflections only — appears in modal popup) |
| Bullets | Text | Newline-separated bullets (Experience roles, links for Social/Article) |
| Tag | Select | Category tag — values vary by section type (see below) |
| Tags | Multi-select | Multiple tags for filtering (Cases, CV, Portfolio) |
| Filter Tags | Multi-select | Additional filter tags (Portfolio — for the Tags filter bar) |
| Image URL | URL | External image URL — headshots, badges, thumbnails |
| Image | Files | Notion-hosted image (expires — prefer Image URL instead) |
| Link | URL | External link (Portfolio items, publications) |

---

## Section Type Values — Complete Reference

### `Impact Stat` — Left panel stats grid (3–6 rows, Published controls count)
| Property | Value |
|---|---|
| Name | The number/value: "12+", "50+", "10+" |
| Title | The label: "Case Studies", "People Promoted" |
| Order | 1–6 |
| Published | ✅ to show |

> Layout auto-adjusts: 3 = row, 4 = 2×2, 5 = 3+2 centered, 6 = 2×3

---

### `Credential` — Left panel badges (degrees, certs)
| Property | Value |
|---|---|
| Name | Institution/cert name: "Hampton University" |
| Title | Subtitle: "PhD Candidate" |
| Image URL | URL to logo (use `schools/` or `badges/` folder raw GitHub URL) |
| Order | Display order |
| Published | ✅ to show |

---

### `Update` — Home page: "What I've Been Working On"
| Property | Value |
|---|---|
| Name | Entry title |
| Date | Actual date (for sort order) |
| Description | Excerpt text (2–3 sentences) |
| Tag | Select: `Work` · `Faith` · `Academic` · `Community` |
| Published | ✅ to show |

---

### `Reflection` — Home page: "Activities & Reflections"
| Property | Value |
|---|---|
| Name | Entry title |
| Date | Actual date (for sort order) |
| Description | Excerpt shown on card (2–3 sentences) |
| Full Text | Full content shown in popup modal (paragraphs separated by blank lines) |
| Tag | Select: `Faith` · `Leadership` · `Community` |
| Published | ✅ to show |

---

### `Article` — Home page: "Most Recent Articles"
| Property | Value |
|---|---|
| Name | Article title |
| Date | Publication date |
| Title | Platform: "Substack" · "Medium" · "LinkedIn" |
| Image URL | URL to the article |
| Published | ✅ to show |

---

### `CV-Education` — CV page: Education section
| Property | Value |
|---|---|
| Name | Degree: "PhD, Public Theology & Community Engagement" |
| Title | "In Progress — Expected 2026" (used as conceptStatus field) |
| Date Range | Year: "2022–" |
| Description | Details, dissertation title, etc. |
| Order | Display order |
| Published | ✅ to show |

---

### `CV-Research` — CV page: Research Interests (pills)
| Property | Value |
|---|---|
| Name | Research area: "Black Ecclesiology" |
| Order | Display order |
| Published | ✅ to show |

---

### `CV-Publication` — CV page: Publications & Scholarship
| Property | Value |
|---|---|
| Name | Publication title |
| Date Range | Year: "2025" |
| Description | Detail/venue description |
| Tag | Select: `Journal` · `Conference` · `Chapter` · `Article` · `Coursework` |
| Link | URL to publication (optional) |
| Order | Display order |
| Published | ✅ to show |

---

### `CV-Teaching` — CV page: Teaching & Instruction
| Property | Value |
|---|---|
| Name | Role/course title |
| Date Range | Year range: "2024–" |
| Description | Description |
| Order | Display order |
| Published | ✅ to show |

---

### `CV-Concept` — CV page: Original Concepts & Frameworks
| Property | Value |
|---|---|
| Name | Concept name: "SIAD Framework" |
| Title | Status: `Active` · `Developing` · `Concept` · `Published` |
| Bullets | Domain: "Theology · Community Development" |
| Description | Full description |
| Tags | Multi-select tags for the concept |
| Order | Display order |
| Published | ✅ to show |

---

### `CV-Volunteer` — CV page: Volunteer & Community Service
| Property | Value |
|---|---|
| Name | Role title |
| Title | Organization name |
| Date Range | Year range |
| Description | Description of work |
| Order | Display order |
| Published | ✅ to show |

---

### `CV-Service` — CV page: Service & Leadership
| Property | Value |
|---|---|
| Name | Role title |
| Title | Organization |
| Date Range | Year range |
| Description | Description |
| Order | Display order |
| Published | ✅ to show |

---

### `Experience` — Pro Resume page: Role blocks
| Property | Value |
|---|---|
| Name | Company name: "Amazon Web Services" |
| Title | Role title: "Sr. Partner Development Manager" |
| Date Range | "2021 – Present" |
| Description | Company scope/description (shown under company name) |
| Bullets | Newline-separated achievement bullets (one per line in Notion) |
| Tag | Select org for filter: `AWS` · `Comcast` · `VOW` · `SuitUp` · `MLU` · `BGC` |
| Order | Display order (lower = shown first) |
| Published | ✅ to show |

> **Sub-bullets tip**: Each line in the Bullets text field becomes one bullet point.
> Use shift+enter in Notion to add a new line within the same text block.

---

### `Case` — Cases page
| Property | Value |
|---|---|
| Name | Case title |
| Title | Organization + date: "Amazon Web Services · 2021–2023" |
| Description | Full case description |
| Tags | Multi-select — use these exact values for filtering: `Cross-Functional` · `Strategy` · `Community-Dev` · `Community-Leadership` · `Enablement` · `Partner-Collaboration` · `Executive-Sponsorship` |
| Order | Display order |
| Published | ✅ to show |

---

### `Portfolio` — Portfolio page: project cards
| Property | Value |
|---|---|
| Name | Project name |
| Title | Type label: "Full-Stack Build" · "Brand Identity" · "Product Build" |
| Description | Project description |
| Image URL | Screenshot or thumbnail URL |
| Link | Live URL or case study link |
| Tags | Multi-select stack tags: `React` · `Notion` · `Figma` · `Supabase` · `Vercel` |
| Filter Tags | Multi-select category tags: `Full-Stack` · `Design` · `Branding` · `Education` · `Community` |
| Order | Display order |
| Published | ✅ to show |

---

### `Social Link` — Portfolio page: Social Links section
| Property | Value |
|---|---|
| Name | Platform: "Medium" · "Behance" · "LinkedIn" · "GitHub" |
| Image URL | Your profile URL on that platform |
| Image | Optional custom icon (Notion file upload) |
| Order | Display order |
| Published | ✅ to show |

---

### `Changelog` — Updates page: version history
| Property | Value |
|---|---|
| Name | Version string: "v2.1.0" |
| Date | Release date |
| Title | One-line summary: "Added tag filtering to Portfolio" |
| Description | Detailed description |
| Bullets | Affected page/section: "Portfolio · Tags" |
| Tag | Select: `Feature` · `Fix` · `Design` · `Content` · `Infrastructure` |
| Published | ✅ to show |

---

## Image Hosting (Important)

Notion-hosted file URLs **expire after ~1 hour**. Always use external URLs.

**Recommended approach for all images:**
1. Add image files to your GitHub repo under `headshots/`, `badges/`, or `schools/`
2. Use the raw GitHub URL format:
   `https://raw.githubusercontent.com/hjs-ah/[repo]/main/headshots/filename.jpg`
3. Paste this URL into the `Image URL` field in Notion

This URL never expires and deploys with your site.

---

## Workflow: Adding New Content

1. Open the **Resume Content DB** in Notion
2. Click **+ New** to add a row
3. Set **Section Type** to the correct value (see above)
4. Fill in the properties for that section type
5. Check **Published** when ready
6. Go to Vercel → your project → **Deployments** → click **...** → **Redeploy**
7. Site updates within ~60 seconds

---

## Build Log Verification

After deploying, check Vercel build logs for:
```
🚀 Starting Notion data fetch...
📋 Fetching settings...
📊 Fetching impact stats...
...
✅ data.json written
   Impact stats: 5
   Credentials:  4
   ...
```

If you see `❌ Build failed`, check:
1. `NOTION_API_KEY` is set in Vercel → Settings → Environment Variables → Production scope
2. Both databases are shared with your Notion integration (... → Add connections)
3. Section Type values match exactly (case-sensitive)
