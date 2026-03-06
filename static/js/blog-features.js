/* ==========================================================================
   Blog Features – Reading Progress Bar, Back to Top, Anchor Links,
                   TOC, Callouts, Terminal Blocks
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
  }
})();
