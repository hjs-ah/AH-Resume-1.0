// build-data.js — Notion → data.json
// Runs at Vercel build time via: node build-data.js
// Requires: @notionhq/client, NOTION_API_KEY env var

const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// ─── DATABASE IDs ──────────────────────────────────────────────────────────────
const SETTINGS_DB = '64158dfefe6244e4801148e73460ac9b';
const CONTENT_DB  = '19362f03bcdb427586c4e470d9ac9e90';

// ─── PROPERTY HELPERS ──────────────────────────────────────────────────────────
const _title  = (p, k) => p[k]?.title?.[0]?.plain_text  || '';
const _rt     = (p, k) => p[k]?.rich_text?.[0]?.plain_text || '';
const _rtFull = (p, k) => (p[k]?.rich_text || []).map(b => b.plain_text).join('') || '';
const _sel    = (p, k) => p[k]?.select?.name || '';
const _multi  = (p, k) => (p[k]?.multi_select || []).map(t => t.name);
const _url    = (p, k) => p[k]?.url || '';
const _num    = (p, k) => p[k]?.number ?? null;
const _chk    = (p, k) => p[k]?.checkbox ?? false;
const _date   = (p, k) => p[k]?.date?.start || '';
const _files  = (p, k) => { const f = p[k]?.files?.[0]; if (!f) return ''; return f.type === 'external' ? f.external.url : (f.file?.url || ''); };

// ─── PAGINATED QUERY ───────────────────────────────────────────────────────────
async function queryAll(dbId, filter, sorts) {
  const rows = [];
  let cursor;
  do {
    const body = { database_id: dbId, page_size: 100 };
    if (filter) body.filter = filter;
    if (sorts)  body.sorts  = sorts;
    if (cursor) body.start_cursor = cursor;
    const res = await notion.databases.query(body);
    rows.push(...res.results);
    cursor = res.has_more ? res.next_cursor : null;
  } while (cursor);
  return rows;
}

// ─── SETTINGS ──────────────────────────────────────────────────────────────────
async function fetchSettings() {
  console.log('📋 Fetching settings...');
  const rows = await queryAll(SETTINGS_DB);
  if (!rows.length) { console.warn('⚠️  Settings DB empty'); return {}; }
  const p = rows[0].properties;
  console.log('   Props found:', Object.keys(p).join(', '));
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

// ─── IMPACT STATS ──────────────────────────────────────────────────────────────
async function fetchImpactStats() {
  console.log('📊 Fetching impact stats...');
  const rows = await queryAll(CONTENT_DB,
    { property: 'Section Type', select: { equals: 'Impact Stat' } },
    [{ property: 'Order', direction: 'ascending' }]);
  return rows.filter(r => _chk(r.properties, 'Published')).slice(0, 6).map(r => ({
    value: _title(r.properties, 'Name'),
    label: _rt(r.properties, 'Title'),
    order: _num(r.properties, 'Order') || 0,
  }));
}

// ─── CREDENTIALS ───────────────────────────────────────────────────────────────
async function fetchCredentials() {
  console.log('🏅 Fetching credentials...');
  const rows = await queryAll(CONTENT_DB,
    { property: 'Section Type', select: { equals: 'Credential' } },
    [{ property: 'Order', direction: 'ascending' }]);
  return rows.filter(r => _chk(r.properties, 'Published')).map(r => ({
    name:     _title(r.properties, 'Name'),
    subtitle: _rt(r.properties, 'Title'),
    imageUrl: _url(r.properties, 'Image URL') || _files(r.properties, 'Image'),
    order:    _num(r.properties, 'Order') || 0,
  }));
}

// ─── UPDATES (Home — What I've Been Working On) ────────────────────────────────
async function fetchUpdates() {
  console.log('📝 Fetching updates...');
  const rows = await queryAll(CONTENT_DB,
    { property: 'Section Type', select: { equals: 'Update' } },
    [{ property: 'Date', direction: 'descending' }]);
  return rows.filter(r => _chk(r.properties, 'Published')).map(r => ({
    date:    _date(r.properties, 'Date') || _rt(r.properties, 'Date Range'),
    title:   _title(r.properties, 'Name'),
    excerpt: _rtFull(r.properties, 'Description'),
    tag:     _sel(r.properties, 'Tag'),
  }));
}

// ─── REFLECTIONS ───────────────────────────────────────────────────────────────
async function fetchReflections() {
  console.log('🪞 Fetching reflections...');
  const rows = await queryAll(CONTENT_DB,
    { property: 'Section Type', select: { equals: 'Reflection' } },
    [{ property: 'Date', direction: 'descending' }]);
  return rows.filter(r => _chk(r.properties, 'Published')).map(r => ({
    date:     _date(r.properties, 'Date') || _rt(r.properties, 'Date Range'),
    title:    _title(r.properties, 'Name'),
    excerpt:  _rtFull(r.properties, 'Description'),
    fullText: _rtFull(r.properties, 'Full Text'),
    tag:      _sel(r.properties, 'Tag'),
  }));
}

// ─── ARTICLES ──────────────────────────────────────────────────────────────────
async function fetchArticles() {
  console.log('📰 Fetching articles...');
  const rows = await queryAll(CONTENT_DB,
    { property: 'Section Type', select: { equals: 'Article' } },
    [{ property: 'Date', direction: 'descending' }]);
  return rows.filter(r => _chk(r.properties, 'Published')).map(r => ({
    date:     _date(r.properties, 'Date') || _rt(r.properties, 'Date Range'),
    title:    _title(r.properties, 'Name'),
    platform: _rt(r.properties, 'Title'),
    url:      _url(r.properties, 'Image URL') || _rtFull(r.properties, 'Bullets'),
  }));
}

// ─── CV ────────────────────────────────────────────────────────────────────────
async function fetchCV() {
  console.log('📚 Fetching CV sections...');
  const types = ['CV-Education','CV-Research','CV-Publication','CV-Teaching','CV-Concept','CV-Volunteer','CV-Service'];
  const all = {};
  for (const t of types) {
    const rows = await queryAll(CONTENT_DB,
      { property: 'Section Type', select: { equals: t } },
      [{ property: 'Order', direction: 'ascending' }]);
    all[t] = rows.filter(r => _chk(r.properties, 'Published')).map(r => ({
      year:          _rt(r.properties, 'Date Range'),
      name:          _title(r.properties, 'Name'),
      detail:        _rtFull(r.properties, 'Description'),
      pubType:       _sel(r.properties, 'Tag'),
      conceptStatus: _rt(r.properties, 'Title'),
      domain:        _rt(r.properties, 'Bullets'),
      link:          _url(r.properties, 'Image URL'),
      tags:          _multi(r.properties, 'Tags'),
      order:         _num(r.properties, 'Order') || 0,
    }));
    console.log('   ' + t + ': ' + all[t].length);
  }
  return all;
}

// ─── RESUME ────────────────────────────────────────────────────────────────────
async function fetchResume() {
  console.log('💼 Fetching resume...');
  const rows = await queryAll(CONTENT_DB,
    { property: 'Section Type', select: { equals: 'Experience' } },
    [{ property: 'Order', direction: 'ascending' }]);
  return rows.filter(r => _chk(r.properties, 'Published')).map(r => ({
    company:   _title(r.properties, 'Name'),
    role:      _rt(r.properties, 'Title'),
    dateRange: _rt(r.properties, 'Date Range'),
    scope:     _rtFull(r.properties, 'Description'),
    bullets:   _rtFull(r.properties, 'Bullets').split('\n').filter(b => b.trim()),
    org:       _sel(r.properties, 'Tag'),
    order:     _num(r.properties, 'Order') || 0,
  }));
}

// ─── CASES ─────────────────────────────────────────────────────────────────────
async function fetchCases() {
  console.log('🗂  Fetching cases...');
  const rows = await queryAll(CONTENT_DB,
    { property: 'Section Type', select: { equals: 'Case' } },
    [{ property: 'Order', direction: 'ascending' }]);
  return rows.filter(r => _chk(r.properties, 'Published')).map(r => ({
    name:  _title(r.properties, 'Name'),
    sub:   _rt(r.properties, 'Title'),
    desc:  _rtFull(r.properties, 'Description'),
    tags:  _multi(r.properties, 'Tags'),
    order: _num(r.properties, 'Order') || 0,
  }));
}

// ─── PORTFOLIO ─────────────────────────────────────────────────────────────────
async function fetchPortfolio() {
  console.log('🎨 Fetching portfolio...');
  const rows = await queryAll(CONTENT_DB,
    { property: 'Section Type', select: { equals: 'Portfolio' } },
    [{ property: 'Order', direction: 'ascending' }]);
  return rows.filter(r => _chk(r.properties, 'Published')).map(r => ({
    name:        _title(r.properties, 'Name'),
    type:        _rt(r.properties, 'Title'),
    desc:        _rtFull(r.properties, 'Description'),
    imageUrl:    _url(r.properties, 'Image URL') || _files(r.properties, 'Image'),
    link:        _url(r.properties, 'Link'),
    stackTags:   _multi(r.properties, 'Tags'),
    filterTags:  _multi(r.properties, 'Filter Tags'),
    order:       _num(r.properties, 'Order') || 0,
  }));
}

// ─── SOCIAL LINKS ──────────────────────────────────────────────────────────────
async function fetchSocialLinks() {
  console.log('🔗 Fetching social links...');
  const rows = await queryAll(CONTENT_DB,
    { property: 'Section Type', select: { equals: 'Social Link' } },
    [{ property: 'Order', direction: 'ascending' }]);
  return rows.filter(r => _chk(r.properties, 'Published')).map(r => ({
    platform: _title(r.properties, 'Name'),
    url:      _url(r.properties, 'Image URL') || _rtFull(r.properties, 'Bullets'),
    iconUrl:  _files(r.properties, 'Image'),
    order:    _num(r.properties, 'Order') || 0,
  }));
}

// ─── CHANGELOG ─────────────────────────────────────────────────────────────────
async function fetchChangelog() {
  console.log('🔄 Fetching changelog...');
  const rows = await queryAll(CONTENT_DB,
    { property: 'Section Type', select: { equals: 'Changelog' } },
    [{ property: 'Date', direction: 'descending' }]);
  return rows.filter(r => _chk(r.properties, 'Published')).map(r => ({
    version: _title(r.properties, 'Name'),
    date:    _date(r.properties, 'Date') || _rt(r.properties, 'Date Range'),
    type:    _sel(r.properties, 'Tag'),
    summary: _rt(r.properties, 'Title'),
    detail:  _rtFull(r.properties, 'Description'),
    scope:   _rt(r.properties, 'Bullets'),
  }));
}

// ─── MAIN ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Starting Notion data fetch...\n');
  if (!process.env.NOTION_API_KEY) { console.error('❌ NOTION_API_KEY not set'); process.exit(1); }

  try {
    const [settings, impactStats, credentials, updates, reflections, articles,
           cv, resume, cases, portfolio, socialLinks, changelog] = await Promise.all([
      fetchSettings(), fetchImpactStats(), fetchCredentials(),
      fetchUpdates(), fetchReflections(), fetchArticles(),
      fetchCV(), fetchResume(), fetchCases(),
      fetchPortfolio(), fetchSocialLinks(), fetchChangelog(),
    ]);

    const data = {
      _buildTime: new Date().toISOString(),
      _version: '2.0.0',
      settings, impactStats, credentials,
      home: { updates, reflections, articles },
      cv, resume, cases, portfolio, socialLinks, changelog,
    };

    fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(data, null, 2));

    console.log('\n✅ data.json written');
    console.log('   Impact stats: ' + impactStats.length);
    console.log('   Credentials:  ' + credentials.length);
    console.log('   Updates:      ' + updates.length);
    console.log('   Reflections:  ' + reflections.length);
    console.log('   Articles:     ' + articles.length);
    console.log('   CV entries:   ' + Object.values(cv).flat().length);
    console.log('   Resume roles: ' + resume.length);
    console.log('   Cases:        ' + cases.length);
    console.log('   Portfolio:    ' + portfolio.length);
    console.log('   Changelog:    ' + changelog.length);

  } catch (err) {
    console.error('\n❌ Build failed:', err.message);
    process.exit(1);
  }
}

main();
