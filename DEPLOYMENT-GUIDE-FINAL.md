# 🚀 Resume Site - Complete Deployment Guide

## ✅ FIXES APPLIED

### 1. Build Script Error - FIXED
- Created `resume-final-build-data.js` → **Rename to `build-data.js`** when deploying
- This matches what `package.json` expects: `"build": "node build-data.js"`

### 2. Profile Photo Size - FIXED
- Reduced from 120px to **80px** (matches V1 portfolio)
- Has 2px border stroke
- Square with 4px border radius

### 3. Notion Databases - PREPOPULATED ✅
**Resume Settings:**
- Name: "Antone Holmes, BS, MA"
- Subtitle: "Strategic Sales & GTM Leader | Revenue Enablement"
- Profile Photo URL: Your headshot
- Blur Intensity: 35
- All colors set to defaults
- All section headers filled

**Resume Content:**
- ✅ AWS (3 roles with all bullets)
- ✅ Comcast (2 roles with all bullets)
- ✅ Education (IUP + Pierce)
- ✅ Social Responsibility (placeholder)
- ✅ Projects (Story Cards app)

---

## 📂 FILES TO DEPLOY

Download these 5 files:

1. **resume-v2-index.html** → Rename to **`index.html`**
2. **resume-v2-styles.css** → Rename to **`resume-styles.css`**
3. **resume-v2-script.js** → Rename to **`resume-script.js`**
4. **resume-final-build-data.js** → Rename to **`build-data.js`**
5. **resume-favicon.svg** → Rename to **`favicon.svg`**

Also need from your V1 site:
- **`package.json`** (already correct)
- **`vercel.json`** (already correct)

---

## 🔐 ENVIRONMENT VARIABLES - CRITICAL!

### **Step 1: Get Notion API Key**

1. Go to: https://www.notion.so/my-integrations
2. Click **"+ New integration"**
3. Name it: "Resume Site Integration"
4. Select your workspace
5. Click **"Submit"**
6. Copy the **"Internal Integration Token"** (starts with `secret_...`)

### **Step 2: Share Databases with Integration**

**Resume Settings Database:**
1. Open: https://www.notion.so/64158dfefe6244e4801148e73460ac9b
2. Click **"..."** (top right) → **"Add connections"**
3. Select **"Resume Site Integration"**
4. Click **"Confirm"**

**Resume Content Database:**
1. Open: https://www.notion.so/19362f03bcdb427586c4e470d9ac9e90
2. Click **"..."** (top right) → **"Add connections"**
3. Select **"Resume Site Integration"**
4. Click **"Confirm"**

### **Step 3: Add to Vercel**

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Click **"Add New"**
3. **Key:** `NOTION_API_KEY`
4. **Value:** `secret_...` (paste your integration token)
5. Select **All** (Production, Preview, Development)
6. Click **"Save"**

---

## 🚀 DEPLOYMENT STEPS

### **1. Create GitHub Repo**

```bash
# Create new repo on GitHub (e.g., "antoneholmes-resume")
git init
git add .
git commit -m "Initial resume deployment"
git remote add origin [your-repo-url]
git push -u origin main
```

### **2. Deploy to Vercel**

1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select your resume repo
4. **Build Settings:**
   - Framework Preset: **Other**
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.` (auto-detected)
5. **Environment Variables:**
   - Add `NOTION_API_KEY` with your token
6. Click **"Deploy"**

### **3. Verify Deployment**

**Check build logs for:**
```
🚀 Fetching resume data from Notion...
✅ Settings extracted
📦 Found X published items
✅ Data saved to data.json
```

**If you see errors:**
- `Cannot find module` → Check file is named `build-data.js`
- `Unauthorized` → Check Notion API key is correct
- `Could not find database` → Check databases are shared with integration

---

## 📊 NOTION DATABASES

### **Resume Settings**
📍 https://www.notion.so/64158dfefe6244e4801148e73460ac9b
🆔 Data Source ID: `38780f47-7c4f-4eae-9a8d-95ccc162d1ff`

**✅ Already filled with:**
- Your name, subtitle, photo
- Default colors
- Section headers
- Blur intensity (35)

**To customize:**
- Edit hex codes for colors
- Adjust blur (0-100)
- Change section headers
- Redeploy to see changes

### **Resume Content**
📍 https://www.notion.so/19362f03bcdb427586c4e470d9ac9e90
🆔 Data Source ID: `a5b3499c-ecc6-4001-b4e4-8597de875212`

**✅ Already populated with:**
- AWS (3 roles)
- Comcast (2 roles)
- Education (2 degrees)
- Social Responsibility (1 item)
- Projects (1 item)

**To add more:**
1. Create new row
2. Set Section Type (Experience, Education, Certification, Social, Project)
3. Fill in Name, Title, Date Range, Bullets
4. Set Order (lower = first)
5. Set Status to "Published"
6. Redeploy

---

## 🎨 COLOR CUSTOMIZATION

**Current defaults (in Notion):**
- Section Headers: `#9ca3af`
- Job Titles: `#4b5563`
- Hero Stats: `#4b5563`
- Borders: `#e5e5e5`
- Dividers: `#e5e5e5`

**To change:**
1. Open Resume Settings in Notion
2. Edit the color field
3. Enter hex code (e.g., `#3b82f6` for blue)
4. Redeploy in Vercel
5. Colors update live!

---

## 🌀 BLUR EFFECT

**How it works:**
- Scroll to a section → it stays sharp
- All other sections blur based on intensity
- Creates elegant focus effect

**Control:**
- Open Resume Settings in Notion
- Edit "Blur Intensity" (0-100)
- `0` = no blur
- `35` = subtle (current setting)
- `100` = maximum blur
- Redeploy to apply

---

## 📱 VISITOR TRACKING

**Recommended: Vercel Analytics (Free)**

1. Go to your Vercel project
2. Click **Analytics** tab
3. Click **"Enable Vercel Analytics"**
4. Select **Free tier**
5. Done! No code changes needed

**What you get:**
- Total visitors
- Unique visitors
- Top pages
- Referrers
- Devices (mobile vs desktop)

---

## 🔄 WORKFLOW

**To update content:**
1. Edit in Notion (Resume Settings or Resume Content)
2. Go to Vercel project → **Deployments** tab
3. Click **"..."** on latest deployment → **"Redeploy"**
4. Wait 30-60 seconds
5. Live!

**No code changes needed for:**
- Adding/editing experience
- Updating education
- Changing colors
- Adjusting blur
- Updating section headers

---

## ✅ CHECKLIST

Before first deployment:

- [ ] Downloaded all 5 files
- [ ] Renamed files correctly
- [ ] Created Notion integration
- [ ] Copied API key
- [ ] Shared Resume Settings database with integration
- [ ] Shared Resume Content database with integration
- [ ] Created GitHub repo
- [ ] Pushed files to GitHub
- [ ] Created Vercel project
- [ ] Added `NOTION_API_KEY` environment variable
- [ ] Deployed successfully
- [ ] Verified build logs show Notion data fetched
- [ ] Site loads with your content
- [ ] Tested blur effect (scroll between sections)
- [ ] Enabled Vercel Analytics (optional)

---

## 🎯 DATABASES LOCATION

Both databases are inside: **Resume Front-end Project**
📍 https://www.notion.so/Resume-Front-end-Project-35ffffd7c625807c8ec5dc64077a54bb

This keeps everything organized in one place!

---

## 🆘 TROUBLESHOOTING

**Build fails with "Cannot find module":**
- Check file is named **exactly** `build-data.js`

**"Unauthorized" error:**
- Verify Notion API key is correct in Vercel
- Check key starts with `secret_`

**"Could not find database":**
- Verify databases are shared with integration
- Go to each database → "..." → "Add connections"

**Site loads but no content:**
- Check Status is "Published" in Resume Content
- Check build logs show "Found X published items"

**Colors not updating:**
- Hex codes must start with `#`
- Example: `#4b5563` not `4b5563`

**Blur not working:**
- Check Blur Intensity is a number (not text)
- Must be between 0-100

---

## 📧 Support

Built with ❤️ by Claude + Antone Holmes

Questions? Check build logs first, then verify:
1. File names match exactly
2. Environment variable is set
3. Databases are shared with integration

---

**Ready to deploy! 🚀**
