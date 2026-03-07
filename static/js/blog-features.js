/* ==========================================================================
   Blog Features – Reading Progress Bar, Back to Top, Anchor Links,
                   TOC, Callouts, Terminal Blocks, Mermaid, Share, Reading Time
   ========================================================================== */
(function () {
  'use strict';

  /* ── 1. Reading Progress Bar ──────────────────────────────────────────── */
  function initProgressBar() {
    var post = document.querySelector('.postWrapper');
    if (!post) return;

    var bar = document.createElement('div');
    bar.id = 'reading-progress';
    document.body.appendChild(bar);

    // Calculate total reading time from word count (200 wpm)
    var text = post.textContent || post.innerText || '';
    var wordCount = text.trim().split(/\s+/).length;
    var totalMinutes = Math.ceil(wordCount / 200);

    // Create reading-time-left indicator
    var timeLeft = document.createElement('span');
    timeLeft.id = 'reading-time-left';
    timeLeft.textContent = '~' + totalMinutes + ' min left';
    document.body.appendChild(timeLeft);

    function updateProgress() {
      var rect = post.getBoundingClientRect();
      var postTop = rect.top + window.scrollY;
      var postHeight = post.offsetHeight;
      var viewportH = window.innerHeight;
      var scrollY = window.scrollY;

      var start = postTop;
      var end = postTop + postHeight - viewportH;
      var progress = 0;

      if (scrollY >= end) {
        progress = 100;
      } else if (scrollY > start) {
        progress = ((scrollY - start) / (end - start)) * 100;
      }

      bar.style.width = progress + '%';

      // Update time remaining
      var remaining = Math.ceil(totalMinutes * (1 - progress / 100));
      if (remaining < 1) remaining = 0;
      timeLeft.textContent = remaining === 0 ? 'Done!' : '~' + remaining + ' min left';

      // Show/hide: fade out at top (before article) and at bottom (finished)
      if (progress <= 0 || progress >= 100) {
        timeLeft.classList.remove('is-visible');
      } else {
        timeLeft.classList.add('is-visible');
      }
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });
    updateProgress();
  }

  /* ── 2. Back to Top Button ────────────────────────────────────────────── */
  function initBackToTop() {
    var btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML =
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
      '<polyline points="18 15 12 9 6 15"></polyline>' +
      '</svg>';
    document.body.appendChild(btn);

    function toggleVisibility() {
      if (window.scrollY > 300) {
        btn.classList.add('is-visible');
      } else {
        btn.classList.remove('is-visible');
      }
    }

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility();

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── 3. Anchor Links on Headings ──────────────────────────────────────── */
  function initAnchorLinks() {
    var post = document.querySelector('.postWrapper');
    if (!post) return;

    var headings = post.querySelectorAll('h2[id], h3[id], h4[id]');
    headings.forEach(function (h) {
      h.classList.add('has-anchor');

      var link = document.createElement('a');
      link.href = '#' + h.id;
      link.className = 'heading-anchor';
      link.setAttribute('aria-label', 'Link to this section');
      link.textContent = '#';
      h.insertBefore(link, h.firstChild);
    });
  }

  /* ── 4. Table of Contents (inline collapsible) ────────────────────────── */
  function initTOC() {
    var post = document.querySelector('.postWrapper');
    if (!post) return;

    var headings = post.querySelectorAll('h2[id], h3[id]');
    if (headings.length < 2) return; // not enough headings to warrant a TOC

    // Build list items
    var listHTML = '';
    headings.forEach(function (h) {
      var level = h.tagName === 'H3' ? 'toc-h3' : 'toc-h2';
      listHTML +=
        '<li class="' + level + '">' +
        '<a href="#' + h.id + '" class="toc-link" data-target="' + h.id + '">' +
        h.textContent.replace(/^#\s*/, '') + // strip the anchor '#' prefix
        '</a></li>';
    });

    // Create the nav element
    var nav = document.createElement('nav');
    nav.className = 'toc-nav';
    nav.setAttribute('aria-label', 'Table of Contents');
    nav.innerHTML =
      '<details class="toc-details">' +
      '<summary class="toc-summary">Table of Contents</summary>' +
      '<ul class="toc-list">' + listHTML + '</ul>' +
      '</details>';

    // Insert before the first h2
    var firstH2 = post.querySelector('h2');
    if (firstH2) {
      firstH2.parentNode.insertBefore(nav, firstH2);
    }

    // Smooth scroll for TOC links
    nav.addEventListener('click', function (e) {
      var link = e.target.closest('.toc-link');
      if (!link) return;
      e.preventDefault();
      var targetId = link.getAttribute('data-target');
      var target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Update URL hash without jumping
        history.pushState(null, '', '#' + targetId);
      }
    });

    // Highlight current section on scroll
    var tocLinks = nav.querySelectorAll('.toc-link');
    var headingEls = Array.from(headings);

    function updateActive() {
      var scrollY = window.scrollY;
      var current = null;

      for (var i = 0; i < headingEls.length; i++) {
        var rect = headingEls[i].getBoundingClientRect();
        // Consider heading "active" if it's near/above the top of viewport
        if (rect.top <= 120) {
          current = headingEls[i].id;
        }
      }

      tocLinks.forEach(function (link) {
        if (link.getAttribute('data-target') === current) {
          link.classList.add('toc-active');
        } else {
          link.classList.remove('toc-active');
        }
      });
    }

    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
  }

  /* ── 5. Callout / Admonition Blocks ───────────────────────────────────── */
  function initCallouts() {
    var post = document.querySelector('.postWrapper');
    if (!post) return;

    var blockquotes = post.querySelectorAll('blockquote');

    // Map of label patterns to callout class names
    var patterns = [
      { regex: /^Important\s*Note:?/i, cls: 'callout-warning' },
      { regex: /^Important:?/i,        cls: 'callout-warning' },
      { regex: /^Warning:?/i,          cls: 'callout-warning' },
      { regex: /^Note:?/i,             cls: 'callout-note' },
      { regex: /^Tip:?/i,              cls: 'callout-tip' },
      { regex: /^Info:?/i,             cls: 'callout-info' },
      { regex: /^Danger:?/i,           cls: 'callout-danger' },
    ];

    blockquotes.forEach(function (bq) {
      var firstP = bq.querySelector('p:first-child');
      if (!firstP) return;
      var firstStrong = firstP.querySelector('strong:first-child');
      if (!firstStrong) return;

      var text = firstStrong.textContent.trim();

      for (var i = 0; i < patterns.length; i++) {
        if (patterns[i].regex.test(text)) {
          bq.classList.add(patterns[i].cls);
          break;
        }
      }
    });
  }

  /* ── 6. Terminal-Style Command Blocks ─────────────────────────────────── */
  /* (moved below – see original position)                                  */

  /* ── 7. Mermaid Diagram Support ──────────────────────────────────────── */
  function initMermaid() {
    if (typeof mermaid === 'undefined') return;

    var diagrams = document.querySelectorAll('.mermaid');
    if (diagrams.length === 0) return;

    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables: {
        // — Global dark background & text —
        darkMode: true,
        background: '#161b22',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '14px',
        textColor: '#e6edf3',

        // — Primary (nodes, boxes) → dark bg, blue border, white text —
        primaryColor: '#1c2433',
        primaryTextColor: '#e6edf3',
        primaryBorderColor: '#58a6ff',
        mainBkg: '#1c2433',
        nodeBorder: '#58a6ff',

        // — Secondary & Tertiary —
        secondaryColor: '#1a2636',
        secondaryTextColor: '#e6edf3',
        secondaryBorderColor: '#388bfd',
        tertiaryColor: '#161b22',
        tertiaryTextColor: '#e6edf3',
        tertiaryBorderColor: '#30363d',

        // — Lines & arrows —
        lineColor: '#58a6ff',

        // — Cluster / subgraph —
        clusterBkg: '#161b22',
        clusterBorder: '#30363d',

        // — Notes —
        noteBkgColor: '#1a2636',
        noteTextColor: '#e6edf3',
        noteBorderColor: '#388bfd',

        // — Sequence diagrams —
        actorBkg: '#1c2433',
        actorBorder: '#58a6ff',
        actorTextColor: '#e6edf3',
        actorLineColor: '#30363d',
        signalColor: '#58a6ff',
        signalTextColor: '#e6edf3',
        labelBoxBkgColor: '#1c2433',
        labelBoxBorderColor: '#58a6ff',
        labelTextColor: '#e6edf3',
        loopTextColor: '#e6edf3',
        activationBorderColor: '#58a6ff',
        activationBkgColor: '#1a2636',
        sequenceNumberColor: '#e6edf3',

        // — Gantt —
        sectionBkgColor: '#1c2433',
        altSectionBkgColor: '#161b22',
        sectionBkgColor2: '#1a2636',
        taskBkgColor: '#388bfd',
        taskBorderColor: '#58a6ff',
        taskTextColor: '#ffffff',
        taskTextLightColor: '#ffffff',
        taskTextDarkColor: '#ffffff',
        doneTaskBkgColor: '#238636',
        doneTaskBorderColor: '#2ea043',
        activeTaskBkgColor: '#58a6ff',
        activeTaskBorderColor: '#79c0ff',
        gridColor: '#30363d',
        todayLineColor: '#f78166',

        // — Class / ER diagrams —
        relationColor: '#58a6ff',
        relationLabelColor: '#e6edf3',
        relationLabelBackground: '#161b22',
        classText: '#e6edf3',
        titleColor: '#e6edf3',
        edgeLabelBackground: '#161b22',
        nodeTextColor: '#e6edf3',

        // — Pie chart —
        pieTitleTextSize: '16px',
        pieTitleTextColor: '#e6edf3',
        pieSectionTextColor: '#ffffff',
        pieLegendTextColor: '#e6edf3',
        pieLegendTextSize: '14px',
        pieStrokeColor: '#30363d',
        pie1: '#58a6ff',
        pie2: '#388bfd',
        pie3: '#79c0ff',
        pie4: '#3fb950',
        pie5: '#1f6feb',
        pie6: '#a5d6ff',
        pie7: '#0d4a99',
        pie8: '#56d364',

        // — State diagram —
        labelColor: '#e6edf3',
        altBackground: '#1a2636',

        // — Flowchart —
        fillType0: '#1c2433',
        fillType1: '#1a2636',
        fillType2: '#161b22',
      },
    });
    mermaid.run({ querySelector: '.mermaid' });
  }

  /* ── 8. Social Share Buttons ─────────────────────────────────────────── */
  function initShareButtons() {
    var post = document.querySelector('.postWrapper');
    if (!post) return;

    var pageUrl = window.location.href;

    // Extract clean title (strip " | Site Name" suffix)
    var rawTitle = document.title;
    var cleanTitle = rawTitle.split(' | ')[0].trim();

    // Extract author from meta or default
    var authorMeta = document.querySelector('meta[name="author"]');
    var author = authorMeta ? authorMeta.content : 'Nicola Gallo';

    // Build structured tweet text with unicode
    var tweetText = cleanTitle + '\n\n' +
      '✍️ ' + author + '\n' +
      '🔗 ' + pageUrl;

    var container = document.createElement('div');
    container.className = 'share-buttons';
    container.innerHTML =
      '<button class="share-btn share-btn--twitter" aria-label="Share on X">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>' +
        '<span>share</span>' +
      '</button>' +
      '<button class="share-btn share-btn--linkedin" aria-label="Share on LinkedIn">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>' +
        '<span>share</span>' +
      '</button>' +
      '<button class="share-btn share-btn--copy" aria-label="Copy link">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>' +
        '<span>copy</span>' +
      '</button>';

    post.appendChild(container);

    // Twitter / X — always open X directly (intent URL works on mobile too, opens X app)
    container.querySelector('.share-btn--twitter').addEventListener('click', function () {
      var url = 'https://twitter.com/intent/tweet?text=' +
        encodeURIComponent(tweetText);
      window.open(url, 'share-twitter', 'width=550,height=420,menubar=no,toolbar=no');
    });

    // LinkedIn — always open LinkedIn directly (share URL opens LinkedIn app on mobile)
    container.querySelector('.share-btn--linkedin').addEventListener('click', function () {
      var url = 'https://www.linkedin.com/sharing/share-offsite/?url=' +
        encodeURIComponent(pageUrl);
      window.open(url, 'share-linkedin', 'width=550,height=520,menubar=no,toolbar=no');
    });

    // Copy Link
    container.querySelector('.share-btn--copy').addEventListener('click', function () {
      var btn = this;
      navigator.clipboard.writeText(pageUrl).then(function () {
        var label = btn.querySelector('span');
        var original = label.textContent;
        label.textContent = '✓';
        btn.classList.add('share-btn--copied');
        setTimeout(function () {
          label.textContent = original;
          btn.classList.remove('share-btn--copied');
        }, 2000);
      });
    });
  }

  /* ── 6 (original). Terminal-Style Command Blocks ─────────────────────── */
  function initTerminalBlocks() {
    var blocks = document.querySelectorAll('.highlight');

    blocks.forEach(function (block) {
      var codeEl = block.querySelector('code[data-lang="bash"], code[data-lang="shell"]');
      if (!codeEl) return;

      // Mark the wrapper
      block.classList.add('terminal-block');

      // Create the macOS-style terminal header
      var header = document.createElement('div');
      header.className = 'terminal-header';
      header.innerHTML =
        '<span class="terminal-dot terminal-dot--red"></span>' +
        '<span class="terminal-dot terminal-dot--yellow"></span>' +
        '<span class="terminal-dot terminal-dot--green"></span>' +
        '<span class="terminal-title">terminal</span>';

      // Insert before the <pre>
      var pre = block.querySelector('pre');
      if (pre) {
        block.insertBefore(header, pre);
      }
    });
  }

  /* ── Init on DOM ready ────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    initProgressBar();
    initBackToTop();
    initAnchorLinks();
    initTOC();
    initCallouts();
    initTerminalBlocks();
    initMermaid();
    initShareButtons();
  }
})();
