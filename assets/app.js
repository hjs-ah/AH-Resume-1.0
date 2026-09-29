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
  function socialIcon(name) {
    var n = (name || '').toLowerCase();
    if (n.indexOf('linkedin') > -1) return svg(ICON.linkedin);
    if (n.indexOf('github') > -1) return svg(ICON.github);
    if (n.indexOf('mail') > -1 || n.indexOf('email') > -1) return svg(ICON.mail);
    if (n === 'x' || n.indexOf('twitter') > -1) return svg(ICON.x);
    if (n.indexOf('youtube') > -1 || n.indexOf('twitch') > -1) return svg(ICON.play);
    if (n.indexOf('medium') > -1 || n.indexOf('substack') > -1) return svg(ICON.book);
    return svg(ICON.globe);
  }

  /* ── state ── */
  var DATA = null;
  var TABS = [
    { id: 'home', def: 'Home', icon: 'user', labelKey: 'navHome', showKey: 'showHome', render: renderHome },
    { id: 'cv', def: 'CV', icon: 'list', labelKey: 'navCV', showKey: 'showCV', render: renderCV },
    { id: 'resume', def: 'Pro Resume', icon: 'briefcase', labelKey: 'navResume', showKey: 'showResume', render: renderResume },
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
        return el('div', { class: 'stat' }, el('div', { class: 'stat-num', text: st.value }), el('div', { class: 'stat-lbl', text: st.label }));
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
        return el('div', { class: 'cards' }, rows.slice().sort(function (a, b) { return (b.year || '').localeCompare(a.year || ''); }).map(function (b) {
          var img = b.imageUrl && safeUrl(b.imageUrl) ? el('img', { class: 'book-cover', alt: 'Cover of ' + b.name, src: safeUrl(b.imageUrl), loading: 'lazy' }) : null;
          if (img) img.addEventListener('error', function () { img.remove(); });
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
  function renderResume(root) {
    var rows = (DATA.resume || []).slice().sort(byOrder);
    root.appendChild(pageHeader('Professional Experience'));
    if (!rows.length) { root.appendChild(emptyNote('No experience is published yet.')); return; }

    var groups = []; var index = {};
    rows.forEach(function (r) {
      if (!(r.company in index)) { index[r.company] = groups.length; groups.push({ company: r.company, org: r.org, roles: [] }); }
      groups[index[r.company]].roles.push(r);
    });
    var list = el('div', { class: 'section' });
    var draw = function (org) {
      list.textContent = '';
      groups.filter(function (g) { return !org || g.org === org; }).forEach(function (g) {
        var first = g.roles[0];
        list.appendChild(el('article', { class: 'exp' },
          el('div', { class: 'exp-top' }, el('h2', { class: 'exp-co', text: g.company }), first.dateRange ? el('div', { class: 'exp-dates', text: first.dateRange }) : null),
          first.scope ? el('p', { class: 'exp-scope', text: first.scope }) : null,
          g.roles.map(function (r) {
            return el('div', { class: 'role' },
              el('div', { class: 'role-head' }, el('h3', { class: 'role-title', text: r.role }), r.dateRange ? el('span', { class: 'role-date', text: r.dateRange }) : null),
              (r.bullets && r.bullets.length) ? el('ul', { class: 'bullets' }, r.bullets.map(function (b) { return el('li', { text: b }); })) : null);
          })));
      });
    };
    draw('');
    var orgs = unique(groups.map(function (g) { return g.org; }));
    if (orgs.length > 1) root.appendChild(el('div', { class: 'section' }, filterChips(orgs, draw)));
    root.appendChild(list);
  }

  /* ═══ CASES ═══ */
  function renderCases(root) {
    var cases = (DATA.cases || []).slice().sort(byOrder);
    root.appendChild(pageHeader('Case Studies', 'GTM, enablement, and strategy work.'));
    if (!cases.length) { root.appendChild(emptyNote('No case studies are published yet.')); return; }
    var grid = el('div', { class: 'cards' });
    var draw = function (tag) {
      grid.textContent = '';
      cases.forEach(function (c, i) {
        if (tag && (c.tags || []).indexOf(tag) < 0) return;
        grid.appendChild(el('article', { class: 'card' }, el('div', { class: 'card-body' },
          el('div', { class: 'card-kicker', text: '(' + String(i + 1).padStart(3, '0') + ')' }),
          el('h3', { class: 'card-title', text: c.name }),
          c.sub ? el('div', { class: 'card-sub', text: c.sub }) : null,
          c.desc ? el('p', { class: 'card-text', text: c.desc }) : null,
          (c.tags && c.tags.length) ? el('div', { class: 'card-tags' }, c.tags.map(function (t) { return el('span', { class: 'tag', text: t }); })) : null)));
      });
    };
    draw('');
    var tags = unique([].concat.apply([], cases.map(function (c) { return c.tags || []; })));
    var wrap = el('div', { class: 'section' }, tags.length > 1 ? filterChips(tags, draw) : null, grid);
    root.appendChild(wrap);
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
      }, svg(ICON[t.icon]), el('span', { text: s[t.labelKey] || t.def }));
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
  }
  function go(id) {
    if (location.hash.replace('#', '') !== id) location.hash = id; else show(id);
  }
  function show(id, scrollIntoView) {
    var tab = visibleTabs.filter(function (t) { return t.id === id; })[0] || visibleTabs[0];
    if (!tab) return;
    visibleTabs.forEach(function (t) {
      var b = document.getElementById('tab-' + t.id);
      var on = t === tab;
      b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1;
      if (on) b.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
    panel.setAttribute('aria-labelledby', 'tab-' + tab.id);
    panel.textContent = '';
    try { tab.render(panel); } catch (err) {
      console.error(err);
      panel.appendChild(el('p', { class: 'notice', text: 'Something went wrong showing this section.' }));
    }
    panel.scrollTop = 0;
    /* Mobile: the profile card sits above the content, so bring the panel into view after a tab tap. */
    if (scrollIntoView && window.matchMedia('(max-width: 860px)').matches) {
      var top = panel.getBoundingClientRect().top + window.scrollY - (document.querySelector('.tabs').offsetHeight + 12);
      window.scrollTo({ top: Math.max(0, top) });
    }
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
    if (s.accentColor && window.CSS && CSS.supports('color', s.accentColor)) {
      document.documentElement.style.setProperty('--accent', s.accentColor);
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
    photo.appendChild(mono);
    if (s.profilePhotoUrl && safeUrl(s.profilePhotoUrl)) {
      var img = el('img', { alt: '', src: safeUrl(s.profilePhotoUrl), fetchpriority: 'high' });
      img.addEventListener('load', function () { mono.remove(); });
      img.addEventListener('error', function () { img.remove(); });
      photo.appendChild(img);
    }

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

  function wireProfileButtons() {
    document.getElementById('btn-download').addEventListener('click', function () {
      /* Prints the CV tab; the browser's "Save as PDF" makes the download. */
      if (!visibleTabs.some(function (t) { return t.id === 'cv'; })) return;
      var prevTitle = document.title;
      document.title = ((DATA.settings || {}).name || 'CV') + ' — CV';
      show('cv', false);
      setTimeout(function () { window.print(); document.title = prevTitle; }, 150);
    });
  }

  /* ── boot ── */
  function boot() {
    panel = document.getElementById('panel');
    tabsList = document.getElementById('tabs-list');
    wireTheme(); wireReader();

    fetch('/data.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (d) { DATA = d; })
      .catch(function (err) { console.warn('data.json unavailable:', err.message); DATA = null; })
      .then(function () {
        if (!DATA) {
          buildTabs();
          panel.textContent = '';
          panel.appendChild(el('p', { class: 'notice', text: "Content couldn't be loaded right now. Please refresh in a moment." }));
          return;
        }
        applySettings(); buildTabs(); wireProfileButtons();
        window.addEventListener('hashchange', function () { show(location.hash.replace('#', ''), true); });
        show(location.hash.replace('#', ''));
      });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
