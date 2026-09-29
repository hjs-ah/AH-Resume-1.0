/* Portfolio front-end.
   Reads /data.json (written at build time by build-data.js from Notion)
   and renders every tab. Nothing here talks to Notion directly. */
(function () {
  'use strict';

  /* ── tiny DOM helpers (all text goes through textContent: safe by default) ── */
  function el(tag, props) {
    var n = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (k) {
        var v = props[k];
        if (v == null || v === false) return;
        if (k === 'class') n.className = v;
        else if (k === 'text') n.textContent = v;
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') n.addEventListener(k.slice(2), v);
        else n.setAttribute(k, v === true ? '' : v);
      });
    }
    for (var i = 2; i < arguments.length; i++) append(n, arguments[i]);
    return n;
  }
  function append(parent, kid) {
    if (kid == null || kid === false) return;
    if (Array.isArray(kid)) { kid.forEach(function (k) { append(parent, k); }); return; }
    parent.appendChild(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  function svg(paths, cls) {
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true');
    if (cls) s.setAttribute('class', cls);
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', paths); s.appendChild(p);
    return s;
  }
  function safeUrl(u) {
    if (!u) return '';
    u = String(u).trim();
    return /^(https?:|mailto:|tel:|\/|#)/i.test(u) ? u : '';
  }
  function isExternal(u) { return /^https?:/i.test(u); }
  function link(cls, url, kids) {
    var href = safeUrl(url);
    var a = el(href ? 'a' : 'div', { class: cls });
    if (href) {
      a.setAttribute('href', href);
      if (isExternal(href)) { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); }
    }
    append(a, kids);
    return a;
  }
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function fmtDate(s) {
    // "2026-05-14" → "May 2026" without timezone drift
    var m = /^(\d{4})-(\d{2})/.exec(s || '');
    if (m) return MONTHS[parseInt(m[2], 10) - 1] + ' ' + m[1];
    return s || '';
  }
  function byOrder(a, b) { return (a.order || 0) - (b.order || 0); }
  function unique(list) {
    var seen = {}; return list.filter(function (x) { if (!x || seen[x]) return false; seen[x] = 1; return true; });
  }
  function paragraphs(text) {
    return String(text || '').split(/\n{2,}/).filter(function (p) { return p.trim(); })
      .map(function (p) { return el('p', { text: p.trim() }); });
  }

  /* ── icons ── */
  var ICON = {
    user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0',
    list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
    briefcase: 'M3 8h18v12H3zM8 8V5a1 1 0 011-1h6a1 1 0 011 1v3M3 13h18',
    layers: 'M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5',
    grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
    clock: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2',
    arrow: 'M7 17L17 7M17 7H8M17 7v9',
    mail: 'M3 5h18v14H3zM3 7l9 6 9-6',
    globe: 'M12 21a9 9 0 100-18 9 9 0 000 18zM3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18',
    linkedin: 'M6 9v11M6 5v.01M11 20v-7a3 3 0 016 0v7M11 9v11',
    github: 'M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 00-1.3-3.2 4.2 4.2 0 00-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 00-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 00-.1 3.2A4.6 4.6 0 004 9.5c0 4.6 2.700 5.700 5.500 6-.6.6-.6 1.200-.5 2V21',
    x: 'M4 4l16 16M20 4L4 20',
    play: 'M5 4l14 8-14 8z',
    book: 'M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5zM4 19a2 2 0 012-2h13'
  };
  function brandSvg(children) {
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true'); s.setAttribute('class', 'brand');
    children.forEach(function (c) {
      var e = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      Object.keys(c).forEach(function (k) { e.setAttribute(k, c[k]); });
      s.appendChild(e);
    });
    return s;
  }
  function socialIcon(name) {
    var n = (name || '').toLowerCase();
    if (n.indexOf('linkedin') > -1) return svg(ICON.linkedin);
    if (n.indexOf('github') > -1) return svg(ICON.github);
    if (n.indexOf('mail') > -1 || n.indexOf('email') > -1) return svg(ICON.mail);
    if (n === 'x' || n.indexOf('twitter') > -1) return svg(ICON.x);
    if (n.indexOf('youtube') > -1 || n.indexOf('twitch') > -1) return svg(ICON.play);
    if (n.indexOf('medium') > -1) return brandSvg([{ cx: 7.2, cy: 12, rx: 5.2, ry: 5.6 }, { cx: 16.2, cy: 12, rx: 2.7, ry: 5.6 }, { cx: 21, cy: 12, rx: 1.1, ry: 5 }]);
    if (n.indexOf('behance') > -1) return el('span', { class: 'social-text', text: 'B\u0113', 'aria-hidden': 'true' });
    if (n.indexOf('substack') > -1) return svg(ICON.book);
    return svg(ICON.globe);
  }


  /* ── data hygiene ──
     Notion currently holds some rows twice, and a few resume rows have employer / title swapped.
     We never modify Notion; we just render each item once and pick the right field as the employer. */
  function norm(s) {
    return String(s || '').toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
      .replace(/[^a-z0-9]+/g, ' ').trim();
  }
  function dedupe(rows, keyFn, richFn) {
    var out = [], at = {};
    (rows || []).forEach(function (r) {
      var k = keyFn(r);
      if (!(k in at)) { at[k] = out.length; out.push(r); return; }
      if (richFn && richFn(r) > richFn(out[at[k]])) out[at[k]] = r;
    });
    return out;
  }
  function textLen() { var n = 0; for (var i = 0; i < arguments.length; i++) n += String(arguments[i] || '').length; return n; }

  function prepare(d) {
    var home = d.home || {};
    home.updates = dedupe(home.updates, function (r) { return norm(r.title); }, function (r) { return textLen(r.excerpt); });
    home.reflections = dedupe(home.reflections, function (r) { return norm(r.title); }, function (r) { return textLen(r.fullText, r.excerpt); });
    home.articles = dedupe(home.articles, function (r) { return norm(r.title); });
    d.home = home;
    d.socialLinks = dedupe(d.socialLinks, function (r) { return norm(r.platform) + '|' + r.url; });
    d.portfolio = dedupe(d.portfolio, function (r) { return norm(r.name); }, function (r) { return textLen(r.desc, r.problem, r.direction); });
    d.cases = dedupe(d.cases, function (r) { return norm(r.name); }, function (r) { return textLen(r.desc); });
    d.changelog = dedupe(d.changelog, function (r) { return norm(r.version) + '|' + norm(r.summary); }, function (r) { return textLen(r.detail); });
    d.impactStats = dedupe(d.impactStats, function (r) { return norm(r.value) + norm(r.label); });
    d.credentials = dedupe(d.credentials, function (r) { return norm(r.name) + norm(r.subtitle); });
    var cv = d.cv || {};
    Object.keys(cv).forEach(function (k) {
      cv[k] = dedupe(cv[k], function (r) { return norm(r.name) + '|' + norm(r.year); }, function (r) { return textLen(r.detail); });
    });
    d.cv = cv;

    // Resume: decide which of company/role holds the employer, using how often each value repeats.
    var rows = d.resume || [], freq = {};
    rows.forEach(function (r) { [r.company, r.role].forEach(function (v) { var k = norm(v); if (k) freq[k] = (freq[k] || 0) + 1; }); });
    function score(v, org) {
      var k = norm(v), o = norm(org);
      return (freq[k] || 0) + (o && k.indexOf(o) > -1 ? 3 : 0) + (/(amazon|comcast|center|inc|llc|university|corp)/.test(k) ? 2 : 0);
    }
    rows = rows.map(function (r) {
      var swap = score(r.role, r.org) > score(r.company, r.org);
      return Object.assign({}, r, { employer: swap ? r.role : r.company, title: swap ? r.company : r.role });
    });
    d.resume = dedupe(rows, function (r) { return norm(r.employer) + '|' + norm(r.title) + '|' + norm(r.dateRange); },
      function (r) { return (r.bullets || []).length; });
    return d;
  }
  function spanOf(roles) {
    var years = [], open = false;
    roles.forEach(function (r) {
      (String(r.dateRange || '').match(/\d{4}/g) || []).forEach(function (y) { years.push(parseInt(y, 10)); });
      if (/present|current/i.test(r.dateRange || '')) open = true;
    });
    if (!years.length) return '';
    var lo = Math.min.apply(null, years), hi = Math.max.apply(null, years);
    return lo + ' – ' + (open ? 'Present' : hi);
  }
  function inkFor(color) {
    /* Pick black or white text for a filled accent so it stays readable (e.g. a gold accent). */
    try {
      var ctx = document.createElement('canvas').getContext('2d');
      ctx.fillStyle = '#000'; ctx.fillStyle = color;
      var v = ctx.fillStyle, r, g, b;
      if (v.charAt(0) === '#') { r = parseInt(v.substr(1, 2), 16); g = parseInt(v.substr(3, 2), 16); b = parseInt(v.substr(5, 2), 16); }
      else { var m = v.match(/[\d.]+/g); r = +m[0]; g = +m[1]; b = +m[2]; }
      function lin(c) { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
      var L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
      return L > 0.32 ? '#14181f' : '#ffffff';
    } catch (e) { return '#ffffff'; }
  }

  /* The design's accent is blue (see --accent in site.css). Flip to true to let Notion's "Accent Color" override it. */
  var USE_NOTION_ACCENT = false;

  /* ── state ── */
  var DATA = null;
  var TABS = [
    { id: 'home', def: 'Home', icon: 'user', labelKey: 'navHome', showKey: 'showHome', render: renderHome },
    { id: 'cv', def: 'CV', icon: 'list', labelKey: 'navCV', showKey: 'showCV', render: renderCV },
    { id: 'resume', def: 'Career Summary', icon: 'briefcase', labelKey: 'navResume', showKey: 'showResume', render: renderResume },
    { id: 'cases', def: 'Cases', icon: 'layers', labelKey: 'navCases', showKey: 'showCases', render: renderCases },
    { id: 'portfolio', def: 'Portfolio', icon: 'grid', labelKey: 'navPortfolio', showKey: 'showPortfolio', render: renderPortfolio },
    { id: 'changelog', def: 'Updates', icon: 'clock', labelKey: 'navChangelog', showKey: 'showChangelog', render: renderChangelog }
  ];
  var visibleTabs = [];
  var panel, tabsList;

  /* ── generic pieces ── */
  function section(title, body, extraHead) {
    return el('section', { class: 'section' },
      el('div', { class: 'section-head' }, el('h2', { class: 'section-title', text: title }), extraHead),
      body);
  }
  function filterChips(options, onPick, allLabel) {
    var wrap = el('div', { class: 'chips filter-row', role: 'group', 'aria-label': 'Filter' });
    var buttons = [];
    [''].concat(options).forEach(function (opt) {
      var b = el('button', { type: 'button', class: 'chip', 'aria-pressed': opt === '' ? 'true' : 'false', text: opt === '' ? (allLabel || 'All') : opt });
      b.addEventListener('click', function () {
        buttons.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        onPick(opt);
      });
      buttons.push(b); wrap.appendChild(b);
    });
    return wrap;
  }
  function pageHeader(title, lede) {
    return el('header', { class: 'section' },
      el('h1', { class: 'page-title', text: title }),
      lede ? el('p', { class: 'page-lede', text: lede }) : null);
  }
  function emptyNote(text) { return el('p', { class: 'empty', text: text }); }

  /* ── stat icons + number roll ── */
  var STAT_ICONS = [
    [/year|lead|revenue|org/i, 'M3 17l6-6 4 4 8-8M15 7h6v6'],
    [/people|promot|advanc|team/i, 'M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M10 11a4 4 0 100-8 4 4 0 000 8zM21 21v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8'],
    [/volunteer|hour|mobiliz|service/i, 'M20.8 5.6a5.5 5.5 0 00-7.8 0L12 6.7l-1-1.1a5.5 5.5 0 00-7.8 7.8L12 22l8.8-8.6a5.5 5.5 0 000-7.8z'],
    [/achiever|circle|award|recipient|winner/i, 'M12 15a6 6 0 100-12 6 6 0 000 12zM8.2 13.9L7 22l5-3 5 3-1.2-8.1'],
    [/top|%|rank|national|percent/i, 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 17a5 5 0 100-10 5 5 0 000 10zM12 13a1 1 0 100-2 1 1 0 000 2z']
  ];
  function statIcon(text) {
    for (var i = 0; i < STAT_ICONS.length; i++) if (STAT_ICONS[i][0].test(text)) return STAT_ICONS[i][1];
    return 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z';
  }
  function scrambleNum(text) {
    if (reducedMotion()) return text;
    return String(text).replace(/\d/g, function (d) { var r = Math.floor(Math.random() * 10); return String(r); });
  }
  /* Digits shuffle randomly, then the shuffle slows and settles on the real figure. */
  function rollNumber(node, finalText) {
    if (reducedMotion() || !/\d/.test(finalText)) { node.textContent = finalText; return; }
    var dur = 1000, t0 = performance.now(), next = 0;
    function frame(now) {
      if (!node.isConnected) return;
      var p = Math.min(1, (now - t0) / dur);
      if (p >= 1) { node.textContent = finalText; return; }
      if (now >= next) { node.textContent = scrambleNum(finalText); next = now + 30 + 170 * p * p; }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* Things that should start once the page is actually on screen (after fade-in / intro). */
  var pendingHooks = [], introQueue = [];
  function runWhenVisible(fn) {
    var root = document.documentElement;
    if (root.classList.contains('intro') && !root.classList.contains('intro-go')) introQueue.push(fn); else fn();
  }

  /* ═══ HOME ═══ */
  function renderHome(root) {
    var s = DATA.settings || {};
    var first = (s.name || '').trim().split(/\s+/)[0];
    var hero = el('section', { class: 'section' },
      first ? el('p', { class: 'hero-eyebrow', text: "Hi, I'm " + first }) : null,
      s.tagline ? el('h1', { class: 'hero-title', text: s.tagline }) : el('h1', { class: 'hero-title', text: s.name || '' }),
      s.bioShort ? el('p', { class: 'hero-bio', text: s.bioShort }) : null,
      el('div', { class: 'hero-actions' },
        el('a', { class: 'btn', href: 'mailto:antoneholmes@icloud.com', text: 'Get in touch' }),
        el('button', { type: 'button', class: 'btn btn-ghost', onclick: function () { go('cv'); }, text: 'View full CV' })));
    root.appendChild(hero);

    var stats = (DATA.impactStats || []).slice().sort(byOrder);
    if (stats.length) {
      root.appendChild(section('Career Impact', el('div', { class: 'stats' }, stats.map(function (st) {
        var num = el('div', { class: 'stat-num', text: scrambleNum(st.value) });
        num.setAttribute('aria-label', st.value);
        pendingHooks.push(function () { rollNumber(num, st.value); });
        return el('div', { class: 'stat' }, svg(statIcon(st.label + ' ' + st.value), 'stat-ico'), num, el('div', { class: 'stat-lbl', text: st.label }));
      }))));
    }

    var creds = (DATA.credentials || []).slice().sort(byOrder);
    if (creds.length) {
      root.appendChild(section('Credentials', el('div', { class: 'creds' }, creds.map(credChip))));
    }

    var home = DATA.home || {};
    var updates = home.updates || [];
    if (updates.length) {
      var list = el('div', { class: 'feed' });
      var draw = function (tag) {
        list.textContent = '';
        updates.filter(function (u) { return !tag || u.tag === tag; }).forEach(function (u) {
          list.appendChild(el('article', { class: 'row' },
            el('div', { class: 'row-date', text: fmtDate(u.date) }),
            el('div', null,
              u.tag ? el('span', { class: 'chip chip-soft chip-static', text: u.tag }) : null,
              el('h3', { class: 'row-title', text: u.title }),
              u.excerpt ? el('p', { class: 'row-text', text: u.excerpt }) : null)));
        });
      };
      draw('');
      var tags = unique(updates.map(function (u) { return u.tag; }));
      root.appendChild(section("What I've Been Working On",
        el('div', null, tags.length > 1 ? filterChips(tags, draw) : null, list)));
    }

    var refl = home.reflections || [];
    if (refl.length) {
      var rlist = el('div', { class: 'feed' });
      var rdraw = function (tag) {
        rlist.textContent = '';
        refl.filter(function (r) { return !tag || r.tag === tag; }).forEach(function (r) {
          var open = function () { openReader(r); };
          rlist.appendChild(el('article', { class: 'row' },
            el('div', { class: 'row-date', text: fmtDate(r.date) }),
            el('div', null,
              r.tag ? el('span', { class: 'chip chip-soft chip-static', text: r.tag }) : null,
              el('h3', { class: 'row-title', text: r.title }),
              r.excerpt ? el('p', { class: 'row-text', text: r.excerpt }) : null,
              (r.fullText || r.excerpt) ? el('div', { class: 'row-actions' },
                el('button', { type: 'button', class: 'link-btn', onclick: open, text: 'Read more →' })) : null)));
        });
      };
      rdraw('');
      var rtags = unique(refl.map(function (r) { return r.tag; }));
      root.appendChild(section('Activities & Reflections',
        el('div', null, rtags.length > 1 ? filterChips(rtags, rdraw) : null, rlist)));
    }

    var articles = home.articles || [];
    if (articles.length) {
      root.appendChild(section('Most Recent Articles', el('div', { class: 'links' }, articles.map(function (a) {
        var meta = [a.platform, fmtDate(a.date)].filter(Boolean).join(' · ');
        return link('link-row', a.url, [
          el('div', null, el('div', { class: 'link-row-meta', text: meta }), el('div', { class: 'link-row-title', text: a.title })),
          a.url ? svg(ICON.arrow) : null
        ]);
      }))));
    }
  }

  function credChip(c) {
    var acr = c.acronym || (c.name || '').replace(/[^A-Z]/g, '').slice(0, 4) || (c.name || '').slice(0, 3).toUpperCase();
    var img = el('div', { class: 'cred-img' });
    var fallback = function () { img.textContent = ''; img.appendChild(document.createTextNode(acr)); };
    if (c.imageUrl && safeUrl(c.imageUrl)) {
      var im = el('img', { alt: '', src: safeUrl(c.imageUrl), loading: 'lazy' });
      im.addEventListener('error', fallback);
      img.appendChild(im);
    } else fallback();
    return el('div', { class: 'cred' }, img,
      el('div', null, el('div', { class: 'cred-name', text: c.name }), c.subtitle ? el('div', { class: 'cred-sub', text: c.subtitle }) : null));
  }

  /* ═══ CV ═══ */
  function cvEntries(rows, opts) {
    opts = opts || {};
    return el('div', null, rows.slice().sort(byOrder).map(function (r) {
      var title = r.link ? link('', r.link, r.name) : r.name;
      return el('div', { class: 'entry' },
        el('div', { class: 'entry-year', text: r.year || '' }),
        el('div', null,
          el('div', { class: 'entry-title' }, title),
          (r.org || r.detail) ? el('div', { class: 'entry-detail', text: [r.org, r.detail].filter(Boolean).join(' — ') }) : null,
          r.pubType ? el('div', { class: 'entry-meta' }, el('span', { class: 'tag', text: r.pubType })) : null));
    }));
  }
  function renderCV(root) {
    var cv = DATA.cv || {};
    root.appendChild(pageHeader('Curriculum Vitae', (DATA.settings || {}).subtitle || ''));
    var blocks = [
      ['Education', cv['CV-Education'], cvEntries],
      ['Research Interests', cv['CV-Research'], function (rows) {
        return el('div', { class: 'tag-list' }, rows.slice().sort(byOrder).map(function (r) { return el('span', { class: 'chip chip-static', text: r.name }); }));
      }],
      ['Publications & Presentations', cv['CV-Publication'], cvEntries],
      ['Teaching', cv['CV-Teaching'], cvEntries],
      ['Original Concepts', cv['CV-Concept'], function (rows) {
        return el('div', { class: 'cards' }, rows.slice().sort(byOrder).map(function (r) {
          return el('div', { class: 'card' }, el('div', { class: 'card-body' },
            r.conceptStatus ? el('div', { class: 'card-kicker', text: r.conceptStatus }) : null,
            el('h3', { class: 'card-title', text: r.name }),
            r.domain ? el('div', { class: 'card-sub', text: r.domain }) : null,
            r.detail ? el('p', { class: 'card-text', text: r.detail }) : null,
            (r.tags && r.tags.length) ? el('div', { class: 'card-tags' }, r.tags.map(function (t) { return el('span', { class: 'tag', text: t }); })) : null));
        }));
      }],
      ['Books', cv['Book'], function (rows) {
        /* Covers that live in the repo, used when the Notion row has no working image URL. */
        var LOCAL_COVERS = { 'god s word': '/assets/books/gods-word.jpg' };
        return el('div', { class: 'cards' }, rows.slice().sort(function (a, b) { return (b.year || '').localeCompare(a.year || ''); }).map(function (b) {
          var local = LOCAL_COVERS[norm(b.name)];
          var src = (b.imageUrl && safeUrl(b.imageUrl)) || local || '';
          var img = src ? el('img', { class: 'book-cover', alt: 'Cover of ' + b.name, src: src, loading: 'lazy' }) : null;
          if (img) img.addEventListener('error', function () {
            if (local && img.getAttribute('src') !== local) img.src = local; else img.remove();
          });
          var card = el('div', { class: 'card' }, img, el('div', { class: 'card-body' },
            b.year ? el('div', { class: 'card-kicker', text: b.year }) : null,
            el('h3', { class: 'card-title', text: b.name }),
            b.subtitle ? el('div', { class: 'card-sub', text: b.subtitle }) : null,
            b.link ? link('link-btn', b.link, 'View book →') : (b.detail ? el('p', { class: 'card-text', text: b.detail }) : null)));
          return card;
        }));
      }],
      ['Volunteer & Community', cv['CV-Volunteer'], cvEntries],
      ['Service', cv['CV-Service'], cvEntries]
    ];
    var any = false;
    blocks.forEach(function (b) {
      if (b[1] && b[1].length) { any = true; root.appendChild(section(b[0], b[2](b[1]))); }
    });
    if (!any) root.appendChild(emptyNote('No CV entries are published yet.'));
  }

  /* ═══ RESUME ═══ */
  /* ═══ CAREER SUMMARY — one straight timeline; each chapter points to its case studies ═══ */
  var pendingCase = '';
  function span(text) {
    var yrs = String(text || '').match(/\d{4}/g) || [];
    var pres = /present|current|now/i.test(String(text || ''));
    var start = yrs[0] ? +yrs[0] : null;
    return { start: start, end: pres ? 9999 : (yrs[1] ? +yrs[1] : start) };
  }
  function shortEmployer(e) {
    var t = String(e || '').replace(/\s*\(.*?\)\s*/g, ' ').trim();
    return /^amazon web services$/i.test(t) ? 'AWS' : t;
  }
  function openCase(name) { pendingCase = norm(name); go('cases'); }
  function renderResume(root) {
    var rows = (DATA.resume || []).slice();
    var cases = (DATA.cases || []).slice().sort(byOrder);
    var thisYear = new Date().getFullYear();
    root.appendChild(pageHeader('Career Summary'));
    if (!rows.length) { root.appendChild(emptyNote('No experience is published yet.')); return; }

    rows.forEach(function (r) { r._span = span(r.dateRange); });
    rows.sort(function (x, y) {
      return ((x._span.start || 0) - (y._span.start || 0)) || ((x._span.end || 0) - (y._span.end || 0));
    });
    function casesFor(r, year) {
      var ek = norm(r.employer);
      if (!ek) return [];
      return cases.filter(function (c) {
        var comp = norm(String(c.sub || '').split('·')[0]);
        if (!comp || !(ek.indexOf(comp) > -1 || comp.indexOf(ek) > -1)) return false;
        var cs = span(c.sub);
        if (year) return !cs.start || (cs.start <= year && cs.end >= year);
        if (!cs.start || !r._span.start) return true;
        return cs.start <= r._span.end && cs.end >= r._span.start;
      });
    }
    function caseList(list) {
      return el('ul', { class: 'bullets case-links' }, list.map(function (c) {
        var btn = el('button', { type: 'button', class: 'link-btn', onclick: function () { openCase(c.name); } }, c.name, svg(ICON.arrow));
        return el('li', null, btn, c.sub ? el('span', { class: 'case-links-sub', text: '  ' + c.sub.split('·').slice(1).join('·').trim() }) : null);
      }));
    }

    var job = -1, year = null;
    var hint = el('p', { class: 'tl-hint', text: 'Click to Filter' });
    var nodes = [];
    var yearsRow = el('div', { class: 'tl-years chips', role: 'group', 'aria-label': 'Filter by year', hidden: true });
    var clearBtn = el('button', { type: 'button', class: 'chip tl-clear', text: 'Clear filters', hidden: true,
      onclick: function () { job = -1; year = null; paint(); } });
    var detail = el('div', { class: 'tl-detail', id: 'tl-detail', 'aria-live': 'polite' });

    function paint(focusIdx) {
      nodes.forEach(function (n, j) {
        n.setAttribute('aria-pressed', j === job ? 'true' : 'false');
        n.classList.toggle('is-dim', job > -1 && j !== job);
      });
      if (focusIdx !== undefined) nodes[focusIdx].focus();
      clearBtn.hidden = job < 0;
      yearsRow.textContent = '';
      yearsRow.hidden = job < 0;
      detail.textContent = '';

      if (job < 0) {
        detail.appendChild(el('div', { class: 'card-label', text: 'All case studies' }));
        detail.appendChild(cases.length ? caseList(cases) : el('p', { class: 'empty', text: 'No case studies are published yet.' }));
        return;
      }
      var r = rows[job];
      var y0 = r._span.start, y1 = Math.min(r._span.end || y0, thisYear);
      if (y0) for (var y = y0; y <= y1 && y - y0 < 30; y++) {
        (function (yy) {
          yearsRow.appendChild(el('button', { type: 'button', class: 'chip', 'aria-pressed': year === yy ? 'true' : 'false', text: String(yy),
            onclick: function () { year = year === yy ? null : yy; paint(); } }));
        })(y);
      }
      var cs = casesFor(r, year);
      detail.appendChild(el('div', { class: 'tl-detail-head' },
        el('h2', { class: 'tl-role', text: r.title }),
        el('div', { class: 'tl-meta', text: [r.employer, year ? String(year) : r.dateRange].filter(Boolean).join('  ·  ') })));
      if (r.scope && !year) detail.appendChild(el('p', { class: 'exp-scope', text: r.scope }));
      detail.appendChild(el('div', { class: 'card-label', text: year ? 'Case studies in ' + year : 'Case studies from this chapter' }));
      detail.appendChild(cs.length ? caseList(cs) : el('p', { class: 'empty', text: year ? 'No case studies are linked to ' + year + '.' : 'No case studies are linked to this chapter yet.' }));
      if (r.bullets && r.bullets.length && !year) {
        detail.appendChild(el('details', { class: 'tl-more' },
          el('summary', { text: 'Role highlights' }),
          el('ul', { class: 'bullets' }, r.bullets.map(function (b) {
            return /^\d{4}\s*[–—-]\s*(\d{4}|present)\s*\|/i.test(b)
              ? el('li', { class: 'sub', text: b.replace(/\s*\|\s*/, '  ·  ') })
              : el('li', { text: b });
          }))));
      }
    }

    var track = el('ol', { class: 'tl-track', style: 'grid-template-columns:repeat(' + rows.length + ',minmax(66px,1fr))' });
    rows.forEach(function (r, i) {
      var btn = el('button', { type: 'button', class: 'tl-node', 'aria-pressed': 'false', 'aria-controls': 'tl-detail',
        title: r.title + ' — ' + (r.employer || ''),
        onclick: function () { job = job === i ? -1 : i; year = null; paint(); },
        onkeydown: function (e) {
          var k = e.key, to = k === 'ArrowRight' ? i + 1 : k === 'ArrowLeft' ? i - 1 : k === 'Home' ? 0 : k === 'End' ? rows.length - 1 : null;
          if (to === null || to < 0 || to >= rows.length) return;
          e.preventDefault(); nodes.forEach(function (n, j) { n.tabIndex = j === to ? 0 : -1; }); nodes[to].focus();
        } },
        el('span', { class: 'tl-year', text: r._span.start || '' }),
        el('span', { class: 'tl-tick' }),
        el('span', { class: 'tl-label', text: shortEmployer(r.employer) }));
      btn.tabIndex = i === 0 ? 0 : -1;
      nodes.push(btn);
      track.appendChild(el('li', null, btn));
    });
    root.appendChild(el('div', { class: 'tl' },
      hint,
      el('div', { class: 'tl-scroll' }, el('div', { class: 'tl-rail' }, el('div', { class: 'tl-line' }), track)),
      yearsRow,
      el('div', { class: 'tl-actions' }, clearBtn)));
    root.appendChild(detail);
    paint();
  }

  /* ═══ CASES ═══ */
  function renderCases(root) {
    var cases = (DATA.cases || []).slice().sort(byOrder);
    root.appendChild(pageHeader('Case Studies', 'GTM, enablement, and strategy work.'));
    if (!cases.length) { root.appendChild(emptyNote('No case studies are published yet.')); return; }
    var grid = el('div', { class: 'stack' });
    // Case descriptions are written as "CHALLENGE: … ACTION: … ACHIEVEMENT: … RESULT: …" — split into labeled blocks.
    function parts(desc) {
      var re = /(CHALLENGE|ACTION|ACHIEVEMENT|RESULT)S?:\s*/g, out = [], m, last = null;
      while ((m = re.exec(desc)) !== null) {
        if (last) last.text = desc.slice(last.from, m.index).trim();
        last = { label: m[1].charAt(0) + m[1].slice(1).toLowerCase(), from: re.lastIndex, text: '' };
        out.push(last);
      }
      if (last) last.text = desc.slice(last.from).trim();
      return out.filter(function (x) { return x.text; });
    }
    var draw = function (tag) {
      grid.textContent = '';
      cases.forEach(function (c, i) {
        if (tag && (c.tags || []).indexOf(tag) < 0) return;
        var sections = parts(c.desc || '');
        grid.appendChild(el('article', { class: 'card case', id: 'case-' + norm(c.name).replace(/ /g, '-') }, el('div', { class: 'card-body' },
          el('div', { class: 'card-kicker', text: '(' + String(i + 1).padStart(3, '0') + ')' }),
          el('h3', { class: 'card-title', text: c.name }),
          c.sub ? el('div', { class: 'card-sub', text: c.sub }) : null,
          sections.length
            ? el('div', { class: 'case-grid' }, sections.map(function (x) {
                return el('div', null, el('div', { class: 'card-label', text: x.label }), el('p', { class: 'card-text', text: x.text }));
              }))
            : (c.desc ? el('p', { class: 'card-text', text: c.desc }) : null),
          (c.tags && c.tags.length) ? el('div', { class: 'card-tags' }, c.tags.map(function (t) { return el('span', { class: 'tag', text: t }); })) : null)));
      });
    };
    draw('');
    var tags = unique([].concat.apply([], cases.map(function (c) { return c.tags || []; })));
    var wrap = el('div', { class: 'section' }, tags.length > 1 ? filterChips(tags, draw) : null, grid);
    root.appendChild(wrap);
    if (pendingCase) {
      var want = 'case-' + pendingCase.replace(/ /g, '-'); pendingCase = '';
      pendingHooks.push(function () {
        var t = document.getElementById(want);
        if (!t) return;
        t.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' });
        t.classList.add('is-flash'); setTimeout(function () { t.classList.remove('is-flash'); }, 1800);
      });
    }
  }

  /* ═══ PORTFOLIO ═══ */
  function renderPortfolio(root) {
    var items = (DATA.portfolio || []).slice().sort(byOrder);
    root.appendChild(pageHeader('Portfolio', 'Selected builds and creative work.'));
    if (!items.length) { root.appendChild(emptyNote('No portfolio items are published yet.')); return; }
    var grid = el('div', { class: 'cards' });
    var draw = function (tag) {
      grid.textContent = '';
      items.forEach(function (p) {
        if (tag && (p.filterTags || []).indexOf(tag) < 0) return;
        var thumb = null;
        if (p.imageUrl && safeUrl(p.imageUrl)) {
          thumb = el('div', { class: 'card-thumb' });
          var im = el('img', { src: safeUrl(p.imageUrl), alt: '', loading: 'lazy' });
          im.addEventListener('error', (function (t) { return function () { t.remove(); }; })(thumb));
          thumb.appendChild(im);
        }
        grid.appendChild(link('card', p.link, [
          thumb,
          el('div', { class: 'card-body' },
            p.type ? el('div', { class: 'card-kicker', text: p.type }) : null,
            el('h3', { class: 'card-title', text: p.name }),
            p.problem ? [el('div', { class: 'card-label', text: 'The Problem' }), el('p', { class: 'card-text', text: p.problem })] : null,
            p.direction ? [el('div', { class: 'card-label', text: 'The Direction' }), el('p', { class: 'card-text', text: p.direction })]
              : (!p.problem && p.desc ? el('p', { class: 'card-text', text: p.desc }) : null),
            (p.stackTags && p.stackTags.length) ? el('div', { class: 'card-tags' }, p.stackTags.map(function (t) { return el('span', { class: 'tag', text: t }); })) : null)
        ]));
      });
    };
    draw('');
    var tags = unique([].concat.apply([], items.map(function (p) { return p.filterTags || []; })));
    root.appendChild(el('div', { class: 'section' }, tags.length > 1 ? filterChips(tags, draw) : null, grid));
  }

  /* ═══ CHANGELOG ═══ */
  function renderChangelog(root) {
    var entries = DATA.changelog || [];
    root.appendChild(pageHeader('Updates', 'Version history for this site.'));
    if (!entries.length) { root.appendChild(emptyNote('No updates yet.')); return; }
    var list = el('div', { class: 'feed' });
    var draw = function (type) {
      list.textContent = '';
      entries.filter(function (e) { return !type || e.type === type; }).forEach(function (e) {
        list.appendChild(el('article', { class: 'row' },
          el('div', null, el('div', { class: 'cl-version', text: e.version || '' }), el('div', { class: 'row-date', text: fmtDate(e.date) })),
          el('div', null,
            e.type ? el('span', { class: 'chip chip-soft chip-static', text: e.type }) : null,
            e.scope ? el('div', { class: 'cl-scope', text: e.scope }) : null,
            e.summary ? el('h3', { class: 'row-title', text: e.summary }) : null,
            e.detail ? el('p', { class: 'row-text', text: e.detail }) : null)));
      });
    };
    draw('');
    var types = unique(entries.map(function (e) { return e.type; }));
    root.appendChild(el('div', { class: 'section' }, types.length > 1 ? filterChips(types, draw) : null, list));
  }

  /* ── reader dialog (reflections) ── */
  function openReader(r) {
    var dlg = document.getElementById('reader');
    if (!dlg || typeof dlg.showModal !== 'function') return;
    document.getElementById('reader-date').textContent = fmtDate(r.date);
    var tag = document.getElementById('reader-tag');
    tag.textContent = r.tag || ''; tag.style.display = r.tag ? '' : 'none';
    document.getElementById('reader-title').textContent = r.title || '';
    var body = document.getElementById('reader-body'); body.textContent = '';
    paragraphs(r.fullText || r.excerpt).forEach(function (p) { body.appendChild(p); });
    dlg.showModal();
  }
  function wireReader() {
    var dlg = document.getElementById('reader');
    if (!dlg) return;
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  }

  /* ── tabs + routing ── */
  function buildTabs() {
    var s = DATA ? (DATA.settings || {}) : {};
    visibleTabs = TABS.filter(function (t) { return s[t.showKey] !== false; });
    tabsList.textContent = '';
    visibleTabs.forEach(function (t) {
      var b = el('button', {
        type: 'button', class: 'tab', role: 'tab', id: 'tab-' + t.id,
        'aria-selected': 'false', 'aria-controls': 'panel', tabindex: '-1'
      }, svg(ICON[t.icon]), el('span', { text: tabLabel(s[t.labelKey], t.def) }));
      b.addEventListener('click', function () { go(t.id); });
      b.addEventListener('keydown', function (e) {
        var i = visibleTabs.indexOf(t), j = -1;
        if (e.key === 'ArrowRight') j = (i + 1) % visibleTabs.length;
        else if (e.key === 'ArrowLeft') j = (i - 1 + visibleTabs.length) % visibleTabs.length;
        else if (e.key === 'Home') j = 0; else if (e.key === 'End') j = visibleTabs.length - 1;
        if (j > -1) { e.preventDefault(); go(visibleTabs[j].id); document.getElementById('tab-' + visibleTabs[j].id).focus(); }
      });
      tabsList.appendChild(b);
    });
    indicator = el('span', { class: 'tab-indicator', 'aria-hidden': 'true' });
    tabsList.appendChild(indicator);
    activeTab = null;
  }
  /* Notion may still say "Pro Resume"; the site calls it Career Summary. */
  function tabLabel(v, def) { return (!v || /^pro resume$/i.test(String(v).trim())) ? def : v; }
  function go(id) {
    if (location.hash.replace('#', '') !== id) location.hash = id; else show(id);
  }
  var swapToken = 0, indicator = null, activeTab = null;
  function reducedMotion() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function moveIndicator(animate) {
    if (!indicator || !activeTab) return;
    var b = document.getElementById('tab-' + activeTab.id);
    if (!b) return;
    var inset = 12;   // matches the tab's horizontal padding so the line sits under the text
    if (!animate) indicator.classList.add('no-anim');
    indicator.style.width = Math.max(0, b.offsetWidth - inset * 2) + 'px';
    indicator.style.transform = 'translateX(' + (b.offsetLeft + inset) + 'px)';
    if (!animate) { void indicator.offsetWidth; indicator.classList.remove('no-anim'); }
  }
  function show(id, scrollIntoView) {
    var tab = visibleTabs.filter(function (t) { return t.id === id; })[0] || visibleTabs[0];
    if (!tab) return;
    var first = !activeTab;
    activeTab = tab;
    visibleTabs.forEach(function (t) {
      var b = document.getElementById('tab-' + t.id);
      var on = t === tab;
      b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1;
      if (on) b.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
    moveIndicator(!first);
    panel.setAttribute('aria-labelledby', 'tab-' + tab.id);

    var token = ++swapToken;
    var old = panel.querySelector('.page');
    var animate = !!old && !reducedMotion();
    function swap() {
      if (token !== swapToken) return;
      panel.textContent = '';
      var page = el('div', { class: 'page' + (animate ? ' is-entering' : '') });
      try { tab.render(page); } catch (err) {
        console.error(err);
        page.appendChild(el('p', { class: 'notice', text: 'Something went wrong showing this section.' }));
      }
      panel.appendChild(page);
      panel.scrollTop = 0;
      var hooks = pendingHooks.splice(0);
      /* Reveal (blur/fade in) only once layout is settled: fonts ready and images decoded. */
      function reveal() {
        if (token !== swapToken) return;
        page.classList.remove('is-entering');
        runWhenVisible(function () { hooks.forEach(function (f) { try { f(); } catch (e) {} }); });
      }
      if (animate) {
        var waits = [new Promise(function (r) { requestAnimationFrame(function () { requestAnimationFrame(r); }); })];
        if (document.fonts && document.fonts.ready) waits.push(document.fonts.ready);
        [].forEach.call(page.querySelectorAll('img'), function (im) { if (!im.complete) waits.push(new Promise(function (r) { im.addEventListener('load', r); im.addEventListener('error', r); })); });
        Promise.race([Promise.all(waits), new Promise(function (r) { setTimeout(r, 600); })]).then(reveal);
      } else reveal();
      /* Mobile: the profile card sits above the content, so bring the panel into view after a tab tap. */
      if (scrollIntoView && window.matchMedia('(max-width: 860px)').matches) {
        var top = panel.getBoundingClientRect().top + window.scrollY - (document.querySelector('.tabs').offsetHeight + 12);
        window.scrollTo({ top: Math.max(0, top) });
      }
    }
    if (animate) { old.classList.add('is-leaving'); setTimeout(swap, 150); } else swap();
  }

  /* ── theme ── */
  function currentTheme() { return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
  function paintThemeBtn() {
    var dark = currentTheme() === 'dark';
    var btn = document.getElementById('theme-btn');
    document.getElementById('theme-label').textContent = dark ? 'Light' : 'Dark';
    btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  }
  function wireTheme() {
    paintThemeBtn();
    document.getElementById('theme-btn').addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      paintThemeBtn();
    });
  }

  /* ── settings → profile card ── */
  function applySettings() {
    var s = DATA.settings || {};
    if (USE_NOTION_ACCENT && s.accentColor && window.CSS && CSS.supports('color', s.accentColor)) {
      document.documentElement.style.setProperty('--accent', s.accentColor);
      document.documentElement.style.setProperty('--accent-ink', inkFor(s.accentColor));
    }
    var name = s.name || 'Antone Holmes';
    var sub = s.subtitle || s.tagline || '';
    document.getElementById('profile-name').textContent = name;
    document.getElementById('brand-name').textContent = name;
    document.getElementById('profile-sub').textContent = sub;
    document.getElementById('brand-sub').textContent = sub;
    document.title = name + ' — Portfolio';

    var photo = document.getElementById('profile-photo');
    photo.textContent = '';
    var initials = name.split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
    var mono = el('span', { class: 'monogram', text: initials });
    if (s.profilePhotoUrl && safeUrl(s.profilePhotoUrl)) {
      /* No placeholder flash: the photo fades in once it has fully loaded and decoded. */
      photoReady = new Promise(function (resolve) {
        var img = el('img', { alt: '', fetchpriority: 'high' });
        function show() { photo.appendChild(img); requestAnimationFrame(function () { requestAnimationFrame(function () { img.classList.add('is-loaded'); }); }); resolve(); }
        img.addEventListener('load', function () { (img.decode ? img.decode() : Promise.resolve()).then(show, show); });
        img.addEventListener('error', function () { photo.appendChild(mono); resolve(); });
        img.src = safeUrl(s.profilePhotoUrl);
      });
    } else {
      photo.appendChild(mono);
    }
    var blurb = document.getElementById('profile-blurb');
    blurb.textContent = s.bioShort || '';
    blurb.style.display = s.bioShort ? '' : 'none';

    var socials = document.getElementById('socials');
    socials.textContent = '';
    var links = (DATA.socialLinks || []).slice().sort(byOrder).filter(function (l) { return safeUrl(l.url); });
    if (!links.length) {
      links = [
        { platform: 'Email', url: 'mailto:antoneholmes@icloud.com' },
        { platform: 'LinkedIn', url: 'https://www.linkedin.com/in/antone-h/' },
        { platform: 'GitHub', url: 'https://github.com/hjs-ah' }
      ];
    }
    links.forEach(function (l) {
      var a = link('', l.url);
      a.setAttribute('aria-label', l.platform); a.setAttribute('title', l.platform);
      a.appendChild(l.iconUrl && safeUrl(l.iconUrl)
        ? el('img', { src: safeUrl(l.iconUrl), alt: '', width: 18, height: 18 })
        : socialIcon(l.platform));
      socials.appendChild(el('li', null, a));
    });
  }

  function wireProfileButtons() { /* "View CV" is a plain #cv link handled by the hash router. */ }

  /* ── boot ── */
  /* Eased wheel scrolling for the content panel (desktop, mouse wheels only). */
  function initSmoothScroll() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var target = 0, raf = 0;
    function desktop() { return window.matchMedia('(min-width: 861px)').matches; }
    function tick() {
      var d = target - panel.scrollTop;
      if (Math.abs(d) < 0.5) { panel.scrollTop = target; raf = 0; return; }
      panel.scrollTop += d * 0.14;
      raf = requestAnimationFrame(tick);
    }
    panel.addEventListener('scroll', function () { if (!raf) target = panel.scrollTop; }, { passive: true });
    panel.addEventListener('wheel', function (e) {
      if (e.ctrlKey || e.shiftKey || !desktop()) return;
      var dy = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY;
      /* Small, fine-grained deltas = trackpad, which is already smooth. */
      if (e.deltaMode === 0 && Math.abs(dy) < 40 && !raf) return;
      var max = panel.scrollHeight - panel.clientHeight;
      if (max <= 0) return;
      if (!raf) target = panel.scrollTop;
      var next = Math.max(0, Math.min(max, target + dy));
      if (next === target && (next === 0 || next === max)) return;
      e.preventDefault();
      target = next;
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: false });
  }

  /* Loader → (desktop) profile appears centred, holds, then slides left as the content slides out. */
  var loaded = false;
  var photoReady = null;
  function finishLoad() {
    if (loaded) return; loaded = true;
    var root = document.documentElement, loader = document.getElementById('loader');
    if (loader) { loader.classList.add('is-done'); setTimeout(function () { loader.hidden = true; }, 320); }
    if (root.classList.contains('intro')) {
      root.classList.add('intro-show');
      setTimeout(function () { root.classList.add('intro-go'); introQueue.splice(0).forEach(function (f) { f(); }); }, 950);
      setTimeout(function () { root.classList.remove('intro', 'intro-show', 'intro-go'); moveIndicator(false); }, 2000);
    }
  }

  function boot() {
    panel = document.getElementById('panel');
    initSmoothScroll();
    tabsList = document.getElementById('tabs-list');
    wireTheme(); wireReader();

    fetch('/data.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (d) { DATA = prepare(d); })
      .catch(function (err) { console.warn('data.json unavailable:', err.message); DATA = null; })
      .then(function () {
        if (!DATA) {
          buildTabs();
          panel.textContent = '';
          panel.appendChild(el('p', { class: 'notice', text: "Content couldn't be loaded right now. Please refresh in a moment." }));
          return;
        }
        applySettings(); buildTabs(); wireProfileButtons();
        window.addEventListener('resize', function () { moveIndicator(false); });
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { moveIndicator(false); });
        window.addEventListener('hashchange', function () { show(location.hash.replace('#', ''), true); });
        show(location.hash.replace('#', ''));
      })
      .then(function () { return photoReady ? Promise.race([photoReady, new Promise(function (r) { setTimeout(r, 2500); })]) : null; })
      .then(finishLoad, finishLoad);
    setTimeout(finishLoad, 8000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
