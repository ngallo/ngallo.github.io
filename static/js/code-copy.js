/**
 * VS Code-like code blocks: copy button + language badge
 */
(function () {
  'use strict';

  const COPY_ICON =
    '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  const CHECK_ICON =
    '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>';

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
      var btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.setAttribute('aria-label', 'Copy code');
      btn.innerHTML = COPY_ICON + '<span>Copy</span>';

      btn.addEventListener('click', function () {
        var code = block.querySelector('pre code');
        if (!code) return;

        var text = code.textContent || code.innerText;

        navigator.clipboard.writeText(text).then(function () {
          btn.innerHTML = CHECK_ICON + '<span>Copied!</span>';
          btn.classList.add('copied');

          setTimeout(function () {
            btn.innerHTML = COPY_ICON + '<span>Copy</span>';
            btn.classList.remove('copied');
          }, 2000);
        });
      });

      block.appendChild(btn);
    });
  });
})();
