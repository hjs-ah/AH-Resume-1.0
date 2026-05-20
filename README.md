# AH Portfolio — v2.0.0

Antone Holmes personal portfolio site. Single-page app with Notion CMS backend.

## Stack
- Static HTML/CSS/JS — no framework
- Notion API — all content managed from Notion
- Vercel — build-time data fetch + static hosting
- GitHub — source of truth

## Pages
| View | Description |
|---|---|
| Home | Newsletter-style: Updates, Reflections (with modals), Articles |
| CV | Academic CV: Research, Education, Publications, Concepts, Volunteer |
| Pro Resume | Full experience with org filter (AWS, Comcast, VOW, SuitUp, MLU, BGC) |
| Cases | GTM & strategy case studies with category filters |
| Portfolio | Creative work with tool + tag filters, social links |
| Updates | Changelog / version history |

## Setup
1. `npm install`
2. Set `NOTION_API_KEY` environment variable
3. `npm run build` — fetches Notion data → writes `data.json`
4. Open `index.html`

## Deploy
Push to GitHub → Vercel auto-deploys. See `NOTION-SETUP.md` for full Notion config.

## File Structure
```
index.html          — SPA (all views)
build-data.js       — Notion fetch → data.json
data.json           — Generated at build time (gitignored)
package.json
vercel.json
NOTION-SETUP.md     — Complete Notion property reference
headshots/          — Profile photos (use raw GitHub URLs in Notion)
badges/             — Cert + org logos
schools/            — School logos
```

## Content Updates
Edit in Notion → Redeploy in Vercel → Live in ~60s.
No code changes needed for: adding entries, editing bullets, updating dates,
toggling visibility, changing nav labels, or adjusting colors.
