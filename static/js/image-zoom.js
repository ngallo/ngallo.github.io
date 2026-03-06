/**
 * Image Zoom – Lightbox for figure images
 * Adds a zoom button overlay on figure images, clicking opens a fullscreen lightbox.
 */
(function () {
  'use strict';

  var ZOOM_ICON =
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>' +
    '<line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>';

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
    '<img class="img-lightbox__img" src="" alt="">';
  document.body.appendChild(overlay);

  var lightboxImg = overlay.querySelector('.img-lightbox__img');
  var closeBtn = overlay.querySelector('.img-lightbox__close');

  function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
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

  // Attach zoom buttons to all figure images
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.postWrapper figure img').forEach(function (img) {
      var figure = img.closest('figure');
      if (!figure) return;

      // Make figure a positioning context
      figure.style.position = 'relative';

      // Create zoom button
      var btn = document.createElement('button');
      btn.className = 'img-zoom-btn';
      btn.setAttribute('aria-label', 'Zoom image');
      btn.innerHTML = ZOOM_ICON + '<span>Zoom</span>';

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        openLightbox(img.src, img.alt);
      });

      figure.appendChild(btn);

      // Also allow clicking the image itself to zoom
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', function () {
        openLightbox(img.src, img.alt);
      });
    });
  });
})();
