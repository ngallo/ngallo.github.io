/**
 * VS Code-like code blocks: copy button, language badge, word-wrap toggle
 */
(function () {
  'use strict';

  const COPY_ICON =
    '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  const CHECK_ICON =
    '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>';
  const WRAP_ICON =
    '<svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M3 12h15a3 3 0 1 1 0 6h-4"/><polyline points="13 15 10 18 13 21"/><path d="M3 18h4"/></svg>';
  const NOWRAP_ICON =
    '<svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></svg>';

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.highlight').forEach(function (block) {
      // ── Language badge ────────────────────────────────────────
      var codeEl = block.querySelector('code[data-lang]');
      if (codeEl && codeEl.dataset.lang) {
        var badge = document.createElement('span');
        badge.className = 'code-lang';
        badge.textContent = codeEl.dataset.lang;
        block.appendChild(badge);
      }

      // ── Copy button ──────────────────────────────────────────
      var copyBtn = document.createElement('button');
      copyBtn.className = 'copy-btn';
      copyBtn.setAttribute('aria-label', 'Copy code');
      copyBtn.innerHTML = COPY_ICON + '<span>Copy</span>';

      copyBtn.addEventListener('click', function () {
        var code = block.querySelector('pre code');
        if (!code) return;

        var text = code.textContent || code.innerText;

        navigator.clipboard.writeText(text).then(function () {
          copyBtn.innerHTML = CHECK_ICON + '<span>Copy</span>';
          copyBtn.classList.add('copied');

          setTimeout(function () {
            copyBtn.innerHTML = COPY_ICON + '<span>Copy</span>';
            copyBtn.classList.remove('copied');
          }, 2000);
        });
      });

      block.appendChild(copyBtn);

      // ── Word-wrap toggle button ──────────────────────────────
      var wrapBtn = document.createElement('button');
      wrapBtn.className = 'wrap-btn';
      wrapBtn.setAttribute('aria-label', 'Toggle word wrap');
      wrapBtn.innerHTML = WRAP_ICON + '<span>Wrap</span>';

      wrapBtn.addEventListener('click', function () {
        var isWrapped = block.classList.toggle('is-wrapped');
        if (isWrapped) {
          wrapBtn.innerHTML = NOWRAP_ICON + '<span>Scroll</span>';
          wrapBtn.classList.add('active');
        } else {
          wrapBtn.innerHTML = WRAP_ICON + '<span>Wrap</span>';
          wrapBtn.classList.remove('active');
        }
      });

      block.appendChild(wrapBtn);
    });
  });
})();
