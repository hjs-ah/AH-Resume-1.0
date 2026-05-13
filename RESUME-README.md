# Antone Holmes - Enhanced Resume Site

## 🎯 Overview

A modern, Notion-powered resume site with:
- ✅ Square profile photo in navigation
- ✅ Editable name + subtitle
- ✅ Certification badges section
- ✅ **Blur focus effect** (Notion-controllable 0-100 intensity)
- ✅ **Custom color swatches** (section headers, job titles, hero stats, borders, dividers)
- ✅ Text-based theme toggle (Light / Dark)
- ✅ Light mode default
- ✅ 6 sections: Certifications, Impact, Profile, Experience, Education, Social, Projects
- ✅ Fully mobile responsive

---

## 📊 Notion Databases

### **Database 1: Resume Settings**
📍 URL: https://www.notion.so/64158dfefe6244e4801148e73460ac9b
🆔 Database ID: `64158dfefe6244e4801148e73460ac9b`

**Fields (create 1 row with your values):**
1. **Name** (Title) - "Antone Holmes, BS, MA"
2. **Subtitle** (Text) - "Strategic Sales & GTM Leader"
3. **Profile Photo URL** (URL) - Your square headshot URL
4. **Blur Intensity** (Number) - 0-100 (recommended: 30-40)

**Color Swatches (Text fields with hex codes):**
5. **Section Header Color** - `#9ca3af` (grey)
6. **Job Title Color** - `#4b5563` (dark grey)
7. **Hero Stats Color** - `#4b5563` (accent)
8. **Border Color** - `#e5e5e5` (light) or `#262626` (dark)
9. **Divider Color** - `#e5e5e5` (light) or `#262626` (dark)

**Section Headers (Text fields):**
10. **Impact Section Header** - "Impact"
11. **Profile Section Header** - "Career Profile"
12. **Experience Section Header** - "Professional Experience"
13. **Education Section Header** - "Education"
14. **Social Section Header** - "Social Responsibility"
15. **Projects Section Header** - "Case Studies & Projects"

---

### **Database 2: Resume Content**
📍 URL: https://www.notion.so/19362f03bcdb427586c4e470d9ac9e90
🆔 Database ID: `19362f03bcdb427586c4e470d9ac9e90`

**Fields:**
1. **Name** (Title) - Company/School/Org/Project name
2. **Section Type** (Select) - Experience | Education | Certification | Social | Project
3. **Title** (Text) - Job title/degree/certification name
4. **Date Range** (Text) - "2022 - 2026"
5. **Description** (Text) - Scope/context (e.g., "Director-level owner...")
6. **Bullets** (Text) - Achievement bullets, one per line
7. **Image URL** (URL) - Badge/logo/screenshot
8. **Order** (Number) - Display order (1, 2, 3...)
9. **Status** (Select) - Published | Draft

---

## 🎨 Color Customization Guide

**All colors are hex codes (e.g., `#4b5563`)**

### **Light Mode Defaults:**
- Section Headers: `#9ca3af` (medium grey)
- Job Titles: `#4b5563` (dark grey)
- Hero Stats: `#4b5563` (dark grey)
- Borders: `#e5e5e5` (light grey)
- Dividers: `#e5e5e5` (light grey)

### **Dark Mode Defaults:**
- Section Headers: `#9ca3af` (light grey)
- Job Titles: `#9ca3af` (light grey)
- Hero Stats: `#9ca3af` (light grey)
- Borders: `#262626` (dark grey)
- Dividers: `#262626` (dark grey)

**To customize:** Just enter your hex code in Notion and redeploy!

---

## 🌀 Blur Focus Effect

**How it works:**
- When you scroll to a section, it stays sharp
- All other sections get a blur effect
- Creates an Apple-esque presentation feel

**Control in Notion:**
- **Blur Intensity** field (Number: 0-100)
- `0` = No blur (all sections sharp)
- `30-40` = Subtle blur (recommended)
- `100` = Maximum blur (dramatic)

**My recommendation:** Start at `35` for elegant focus.

---

## 📂 File Structure

```
resume/
├── index.html              (rename from resume-v2-index.html)
├── resume-styles.css       (rename from resume-v2-styles.css)
├── resume-script.js        (rename from resume-v2-script.js)
├── resume-build-data.js    (Notion fetch script)
├── package.json
├── vercel.json
└── data.json               (generated at build time)
```

---

## 🚀 Deployment Steps

### **1. Setup Notion Data**

**Resume Settings (1 row):**
- Fill in your name, subtitle, profile photo URL
- Set blur intensity (start with 35)
- Enter color hex codes (or leave as defaults)
- Set section header names

**Resume Content (multiple rows):**
- Create rows for AWS, Comcast, Education, etc.
- Set Section Type for each (Experience, Education, etc.)
- Fill in title, dates, description, bullets
- Add certification badges with Image URL
- Set Order (1, 2, 3...) for display sequence
- Set Status to "Published" to show on site

### **2. Create New GitHub Repo**

```bash
git init
git add .
git commit -m "Initial resume site"
git remote add origin [your-repo-url]
git push -u origin main
```

### **3. Deploy to Vercel**

1. Create new Vercel project
2. Connect to GitHub repo
3. Add environment variable:
   - `NOTION_API_KEY` = [your Notion integration token]
4. Deploy!

### **4. Get Notion API Key**

1. Go to: https://www.notion.so/my-integrations
2. Create new integration
3. Copy "Internal Integration Token"
4. Share both databases with the integration:
   - Open Resume Settings database → Share → Add integration
   - Open Resume Content database → Share → Add integration

---

## 📱 Visitor Tracking

**Recommended: Vercel Analytics (Free)**
1. Go to Vercel project → Analytics tab
2. Enable Vercel Analytics (free tier)
3. See visitor counts, pageviews, etc.

**Other options:**
- Google Analytics (free, detailed, requires cookie banner)
- Plausible ($9/mo, privacy-first)
- Fathom ($14/mo, privacy-first)

---

## 🎯 What Controls What

### **Notion → Site Mapping:**

**Resume Settings Database:**
- `Name` → Nav header name + page title + footer
- `Subtitle` → Nav subtitle below name
- `Profile Photo URL` → Square photo in nav
- `Blur Intensity` → Blur effect strength (0-100)
- `Section Header Color` → All section titles (IMPACT, CAREER PROFILE, etc.)
- `Job Title Color` → Role names in Experience, degree names in Education
- `Hero Stats Color` → The big numbers in Impact section (12+, 50+, 8)
- `Border Color` → Box outlines around cards and stats
- `Divider Color` → Horizontal lines between sections
- All Section Header fields → Section title text

**Resume Content Database:**
- `Section Type: Experience` → Professional Experience section
- `Section Type: Education` → Education section
- `Section Type: Certification` → Certifications section (shows badges)
- `Section Type: Social` → Social Responsibility section
- `Section Type: Project` → Case Studies & Projects section
- `Order` → Display sequence (lower numbers first)
- `Status: Published` → Shows on site (Draft = hidden)

---

## 🎨 Design Philosophy

**Clean & Professional:**
- Inter font throughout
- Subtle grey accents
- Minimal borders
- Generous whitespace

**Customizable:**
- All section headers editable
- All major colors customizable
- Blur effect intensity controllable

**Mobile-First:**
- Nav collapses to horizontal scroll
- Stats stack vertically
- Touch-friendly spacing

---

## 🔄 Workflow

1. ✅ Edit content in Notion
2. ✅ Redeploy in Vercel
3. ✅ Live in ~30 seconds

No code changes needed for content updates!

---

## 📧 Questions?

Built with ❤️ by Claude + Antone Holmes
