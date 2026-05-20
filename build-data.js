// build-data.js — Notion → data.json
// Maps to EXISTING Notion Section Type values, with fallbacks for new ones

const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const SETTINGS_DB = '64158dfefe6244e4801148e73460ac9b';
const CONTENT_DB  = '19362f03bcdb427586c4e470d9ac9e90';

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const _title  = (p, k) => p[k]?.title?.[0]?.plain_text  || '';
const _rt     = (p, k) => p[k]?.rich_text?.[0]?.plain_text || '';
const _rtFull = (p, k) => (p[k]?.rich_text || []).map(b => b.plain_text).join('');
const _sel    = (p, k) => p[k]?.select?.name || '';
const _multi  = (p, k) => (p[k]?.multi_select || []).map(t => t.name);
const _url    = (p, k) => p[k]?.url || '';
const _num    = (p, k) => p[k]?.number ?? null;
const _chk    = (p, k) => p[k]?.checkbox ?? false;
const _date   = (p, k) => p[k]?.date?.start || '';
const _files  = (p, k) => { const f = p[k]?.files?.[0]; if (!f) return ''; return f.type === 'external' ? f.external.url : (f.file?.url || ''); };

// Safe query — returns [] instead of throwing if the select option doesn't exist yet
async function safeQuery(dbId, filter, sorts) {
  const rows = [];
  let cursor;
  try {
    do {
      const body = { database_id: dbId, page_size: 100 };
      if (filter) body.filter = filter;
      if (sorts)  body.sorts  = sorts;
      if (cursor) body.start_cursor = cursor;
      const res = await notion.databases.query(body);
      rows.push(...res.results);
      cursor = res.has_more ? res.next_cursor : null;
    } while (cursor);
  } catch (err) {
    // If the select option doesn't exist yet in Notion, return empty — don't crash
    if (err.code === 'validation_error' && err.message.includes('select option')) {
      console.log('   ⚠️  Section Type not yet in Notion — skipping (add it when ready)');
      return [];
    }
    throw err; // re-throw anything else
  }
  return rows;
}

// Fetch all published rows in one shot, then bucket by Section Type in JS
// This avoids a separate query per type (fewer API calls, no missing-option errors)
async function fetchAllContent() {
  console.log('📦 Fetching all published content rows...');
  const rows = await safeQuery(
    CONTENT_DB,
    { or: [
      { property: 'Status', select: { equals: 'Published' } },
      { property: 'Published', checkbox: { equals: true } },
    ]},
    [{ property: 'Order', direction: 'ascending' }]
  );
  console.log('   Total published rows: ' + rows.length);
  return rows;
}

// ─── SETTINGS ──────────────────────────────────────────────────────────────────
async function fetchSettings() {
  console.log('📋 Fetching settings...');
  const rows = await safeQuery(SETTINGS_DB);
  if (!rows.length) { console.warn('⚠️  Settings DB empty'); return {}; }
  const p = rows[0].properties;
  console.log('   Settings props: ' + Object.keys(p).join(', '));
  return {
    name:            _title(p, 'Name'),
    subtitle:        _rt(p, 'Subtitle'),
    profilePhotoUrl: _url(p, 'Profile Photo URL') || _files(p, 'Profile Photo'),
    blurIntensity:   _num(p, 'Blur Intensity') ?? 0,
    accentColor:     _rt(p, 'Accent Color'),
    borderColor:     _rt(p, 'Border Color'),
    sectionHeaderColor: _rt(p, 'Section Header Color'),
    tagline:         _rt(p, 'Tagline'),
    bioShort:        _rtFull(p, 'Bio Short'),
    navHome:         _rt(p, 'Nav Label: Home')      || 'Home',
    navCV:           _rt(p, 'Nav Label: CV')        || 'CV',
    navResume:       _rt(p, 'Nav Label: Resume')    || 'Pro Resume',
    navCases:        _rt(p, 'Nav Label: Cases')     || 'Cases',
    navPortfolio:    _rt(p, 'Nav Label: Portfolio') || 'Portfolio',
    navChangelog:    _rt(p, 'Nav Label: Changelog') || 'Updates',
  };
}

// ─── MAIN ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Starting Notion data fetch...\n');
  if (!process.env.NOTION_API_KEY) { console.error('❌ NOTION_API_KEY not set'); process.exit(1); }

  try {
    const [settings, allRows] = await Promise.all([
      fetchSettings(),
      fetchAllContent(),
    ]);

    // ── Bucket rows by Section Type ──────────────────────────────────────────
    // Maps EXISTING Notion values → internal keys
    // Add new Section Type values to Notion whenever you're ready —
    // they'll automatically start appearing here without code changes.
    const bucket = (type) => allRows.filter(r => _sel(r.properties, 'Section Type') === type);

    // ── EXISTING TYPES (your current Notion DB) ────────────────────────────
    const experienceRows   = bucket('Experience');
    const educationRows    = bucket('Education');
    const certRows         = bucket('Certification');
    const socialRows       = bucket('Social');
    const projectRows      = bucket('Project');

    // ── NEW TYPES (add these as select options in Notion when ready) ───────
    const impactStatRows   = bucket('Impact Stat');
    const credentialRows   = bucket('Credential');
    const updateRows       = bucket('Update');
    const reflectionRows   = bucket('Reflection');
    const articleRows      = bucket('Article');
    const caseRows         = bucket('Case');
    const portfolioRows    = bucket('Portfolio');
    const socialLinkRows   = bucket('Social Link');
    const changelogRows    = bucket('Changelog');
    const cvEdRows         = bucket('CV-Education');
    const cvResRows        = bucket('CV-Research');
    const cvPubRows        = bucket('CV-Publication');
    const cvTeachRows      = bucket('CV-Teaching');
    const cvConceptRows    = bucket('CV-Concept');
    const cvVolRows        = bucket('CV-Volunteer');
    const cvSvcRows        = bucket('CV-Service');

    // Log what we found
    const typeCounts = {};
    allRows.forEach(r => {
      const t = _sel(r.properties, 'Section Type') || '(none)';
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    });
    console.log('\n   Row breakdown: ' + JSON.stringify(typeCounts));

    // ── Map existing types to new structure ────────────────────────────────
    // Experience → Pro Resume
    const resume = experienceRows.map(r => ({
      company:   _title(r.properties, 'Name'),
      role:      _rt(r.properties, 'Title'),
      dateRange: _rt(r.properties, 'Date Range'),
      scope:     _rtFull(r.properties, 'Description'),
      bullets:   _rtFull(r.properties, 'Bullets').split('\n').filter(b => b.trim()),
      org:       _sel(r.properties, 'Tag') || _sel(r.properties, 'Section Type'),
      order:     _num(r.properties, 'Order') || 0,
    }));

    // Education → CV education
    const cvEducation = educationRows.map(r => ({
      year:   _rt(r.properties, 'Date Range'),
      name:   _title(r.properties, 'Name'),
      detail: _rtFull(r.properties, 'Description'),
      order:  _num(r.properties, 'Order') || 0,
    }));

    // Certification → CV / Impact strip
    const certifications = certRows.map(r => ({
      name:     _title(r.properties, 'Name'),
      subtitle: _rt(r.properties, 'Title'),
      imageUrl: _url(r.properties, 'Image URL') || _files(r.properties, 'Image'),
      link:     _url(r.properties, 'Image URL'),
      order:    _num(r.properties, 'Order') || 0,
    }));

    // Social → social responsibility (CV service)
    const cvService = socialRows.map(r => ({
      year:   _rt(r.properties, 'Date Range'),
      name:   _title(r.properties, 'Name'),
      detail: _rtFull(r.properties, 'Description'),
      order:  _num(r.properties, 'Order') || 0,
    }));

    // Project → Cases (existing) + Portfolio (existing)
    const cases = projectRows.map((r, i) => ({
      name:  _title(r.properties, 'Name'),
      sub:   _rt(r.properties, 'Title'),
      desc:  _rtFull(r.properties, 'Description'),
      tags:  _multi(r.properties, 'Tags'),
      order: _num(r.properties, 'Order') || i,
    }));

    // ── New types (empty until you add them to Notion) ─────────────────────
    const impactStats = impactStatRows.map(r => ({
      value: _title(r.properties, 'Name'),
      label: _rt(r.properties, 'Title'),
      order: _num(r.properties, 'Order') || 0,
    }));

    const credentials = credentialRows.length ? credentialRows.map(r => ({
      name:     _title(r.properties, 'Name'),
      subtitle: _rt(r.properties, 'Title'),
      imageUrl: _url(r.properties, 'Image URL') || _files(r.properties, 'Image'),
      order:    _num(r.properties, 'Order') || 0,
    })) : certifications; // fall back to Certification rows if Credential not set up yet

    const updates = updateRows.map(r => ({
      date:    _date(r.properties, 'Date') || _rt(r.properties, 'Date Range'),
      title:   _title(r.properties, 'Name'),
      excerpt: _rtFull(r.properties, 'Description'),
      tag:     _sel(r.properties, 'Tag'),
    }));

    const reflections = reflectionRows.map(r => ({
      date:     _date(r.properties, 'Date') || _rt(r.properties, 'Date Range'),
      title:    _title(r.properties, 'Name'),
      excerpt:  _rtFull(r.properties, 'Description'),
      fullText: _rtFull(r.properties, 'Full Text'),
      tag:      _sel(r.properties, 'Tag'),
    }));

    const articles = articleRows.map(r => ({
      date:     _date(r.properties, 'Date') || _rt(r.properties, 'Date Range'),
      title:    _title(r.properties, 'Name'),
      platform: _rt(r.properties, 'Title'),
      url:      _url(r.properties, 'Image URL') || _rtFull(r.properties, 'Bullets'),
    }));

    const portfolio = portfolioRows.length ? portfolioRows.map(r => ({
      name:        _title(r.properties, 'Name'),
      type:        _rt(r.properties, 'Title'),
      desc:        _rtFull(r.properties, 'Description'),
      imageUrl:    _url(r.properties, 'Image URL') || _files(r.properties, 'Image'),
      link:        _url(r.properties, 'Link'),
      stackTags:   _rtFull(r.properties, 'Bullets').split(/\s+/).filter(Boolean),
      filterTags:  _rtFull(r.properties, 'Tags').split(/\s+/).filter(Boolean),
      order:       _num(r.properties, 'Order') || 0,
    })) : projectRows.map(r => ({  // fall back to Project rows
      name:       _title(r.properties, 'Name'),
      type:       'Project',
      desc:       _rtFull(r.properties, 'Description'),
      imageUrl:   _url(r.properties, 'Image URL') || _files(r.properties, 'Image'),
      stackTags:  _multi(r.properties, 'Tags'),
      filterTags: [],
      order:      _num(r.properties, 'Order') || 0,
    }));

    const socialLinks = socialLinkRows.map(r => ({
      platform: _title(r.properties, 'Name'),
      url:      _url(r.properties, 'Image URL') || _rtFull(r.properties, 'Bullets'),
      iconUrl:  _files(r.properties, 'Image'),
      order:    _num(r.properties, 'Order') || 0,
    }));

    const changelog = changelogRows.map(r => ({
      version: _title(r.properties, 'Name'),
      date:    _date(r.properties, 'Date') || _rt(r.properties, 'Date Range'),
      type:    _sel(r.properties, 'Tag'),
      summary: _rt(r.properties, 'Title'),
      detail:  _rtFull(r.properties, 'Description'),
      scope:   _rt(r.properties, 'Bullets'),
    }));

    const cv = {
      'CV-Education':   cvEdRows.length    ? cvEdRows.map(r => ({ year: _rt(r.properties,'Date Range'), name: _title(r.properties,'Name'), detail: _rtFull(r.properties,'Description'), order: _num(r.properties,'Order')||0 })) : cvEducation,
      'CV-Research':    cvResRows.map(r    => ({ name: _title(r.properties,'Name'), order: _num(r.properties,'Order')||0 })),
      'CV-Publication': cvPubRows.map(r    => ({ year: _rt(r.properties,'Date Range'), name: _title(r.properties,'Name'), detail: _rtFull(r.properties,'Description'), pubType: _sel(r.properties,'Tag'), link: _url(r.properties,'Image URL'), order: _num(r.properties,'Order')||0 })),
      'CV-Teaching':    cvTeachRows.map(r  => ({ year: _rt(r.properties,'Date Range'), name: _title(r.properties,'Name'), detail: _rtFull(r.properties,'Description'), order: _num(r.properties,'Order')||0 })),
      'CV-Concept':     cvConceptRows.map(r=> ({ name: _title(r.properties,'Name'), conceptStatus: _rt(r.properties,'Title'), domain: _rt(r.properties,'Bullets'), detail: _rtFull(r.properties,'Description'), tags: _multi(r.properties,'Tags'), order: _num(r.properties,'Order')||0 })),
      'CV-Volunteer':   cvVolRows.map(r    => ({ year: _rt(r.properties,'Date Range'), name: _title(r.properties,'Name'), detail: _rtFull(r.properties,'Description'), org: _rt(r.properties,'Title'), order: _num(r.properties,'Order')||0 })),
      'CV-Service':     cvSvcRows.length   ? cvSvcRows.map(r => ({ year: _rt(r.properties,'Date Range'), name: _title(r.properties,'Name'), detail: _rtFull(r.properties,'Description'), order: _num(r.properties,'Order')||0 })) : cvService,
    };

    // ── Write data.json ───────────────────────────────────────────────────
    const data = {
      _buildTime: new Date().toISOString(),
      _version: '2.0.0',
      settings,
      impactStats,
      credentials,
      home: { updates, reflections, articles },
      cv,
      resume,
      cases,
      portfolio,
      socialLinks,
      changelog,
      // Legacy fields for backward compat with any old resume.html
      content: allRows.map(r => ({
        name:        _title(r.properties, 'Name'),
        sectionType: _sel(r.properties, 'Section Type'),
        title:       _rt(r.properties, 'Title'),
        dateRange:   _rt(r.properties, 'Date Range'),
        description: _rtFull(r.properties, 'Description'),
        bullets:     _rtFull(r.properties, 'Bullets'),
        imageUrl:    _url(r.properties, 'Image URL'),
        order:       _num(r.properties, 'Order') || 0,
      })),
    };

    fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(data, null, 2));

    console.log('\n✅ data.json written successfully');
    console.log('   Settings fields:  ' + Object.keys(settings).length);
    console.log('   Resume roles:     ' + resume.length);
    console.log('   Education:        ' + cvEducation.length);
    console.log('   Certifications:   ' + certifications.length);
    console.log('   Cases/Projects:   ' + cases.length);
    console.log('   Impact stats:     ' + impactStats.length + (impactStats.length === 0 ? ' (add Impact Stat rows in Notion)' : ''));
    console.log('   Updates:          ' + updates.length + (updates.length === 0 ? ' (add Update rows in Notion)' : ''));
    console.log('   Reflections:      ' + reflections.length);
    console.log('   Changelog:        ' + changelog.length);

  } catch (err) {
    console.error('\n❌ Build failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

main();
