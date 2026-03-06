/**
 * Image Zoom – Lightbox for figure images
 * Adds an expand button overlay on figure images, clicking opens a fullscreen lightbox
 * with image caption/alt text displayed below.
 */
(function () {
  'use strict';

  // Expand icon (arrows pointing outward – "fullscreen" feel)
  var EXPAND_ICON =
    '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>' +
    '<line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>';

  var CLOSE_ICON =
    '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  // Create lightbox overlay (once)
  var overlay = document.createElement('div');
  overlay.className = 'img-lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-label', 'Image zoom');
  overlay.innerHTML =
    '<button class="img-lightbox__close" aria-label="Close">' + CLOSE_ICON + '</button>' +
    '<div class="img-lightbox__content">' +
    '  <img class="img-lightbox__img" src="" alt="">' +
    '  <div class="img-lightbox__caption"></div>' +
    '</div>';
  document.body.appendChild(overlay);

  var lightboxImg = overlay.querySelector('.img-lightbox__img');
  var lightboxCaption = overlay.querySelector('.img-lightbox__caption');
  var closeBtn = overlay.querySelector('.img-lightbox__close');

  function openLightbox(src, alt, caption) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';

    // Build caption: use figcaption text, or alt text, or nothing
    var displayCaption = caption || alt || '';
    if (displayCaption) {
      lightboxCaption.textContent = displayCaption;
      lightboxCaption.style.display = 'block';
    } else {
      lightboxCaption.style.display = 'none';
    }

    overlay.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    overlay.classList.remove('is-active');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeLightbox);

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeLightbox();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('is-active')) {
      closeLightbox();
    }
  });

  // Attach expand buttons to all figure images
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.postWrapper figure img').forEach(function (img) {
      var figure = img.closest('figure');
      if (!figure) return;

      // Make figure a positioning context
      figure.style.position = 'relative';

      // Get figcaption text if available, with figure number
      var figcaption = figure.querySelector('figcaption');
      var figIndex = Array.from(document.querySelectorAll('.postWrapper figure')).indexOf(figure) + 1;
      var captionText = '';
      if (figcaption) {
        captionText = 'Figure ' + figIndex + ': ' + figcaption.textContent.trim();
      } else if (img.alt) {
        captionText = 'Figure ' + figIndex + ': ' + img.alt;
      }

      // Create expand button
      var btn = document.createElement('button');
      btn.className = 'img-zoom-btn';
      btn.setAttribute('aria-label', 'Expand image');
      btn.innerHTML = EXPAND_ICON + '<span>Expand</span>';

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        openLightbox(img.src, img.alt, captionText);
      });

      figure.appendChild(btn);

      // Also allow clicking the image itself to expand
      img.style.cursor = 'pointer';
      img.addEventListener('click', function () {
        openLightbox(img.src, img.alt, captionText);
      });
    });
  });
})();
