/* Squat Success theme — behaviour */
(function () {
  'use strict';

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* Mobile nav ---------------------------------------------------------- */
  $$('[data-nav]').forEach(function (nav) {
    var toggle = $('[data-nav-toggle]', nav);
    if (!toggle) return;
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $$('.nav__link', nav).forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('is-open'); });
    });
  });

  /* Chapter reader ------------------------------------------------------ */
  $$('[data-reader]').forEach(function (reader) {
    var tabs = $$('[data-reader-tab]', reader);
    var panels = $$('[data-reader-panel]', reader);
    var prevs = $$('[data-reader-prev]', reader);
    var nexts = $$('[data-reader-next]', reader);
    var current = 0;

    function show(i) {
      current = Math.max(0, Math.min(panels.length - 1, i));
      tabs.forEach(function (t, k) { t.setAttribute('aria-selected', k === current ? 'true' : 'false'); });
      panels.forEach(function (p, k) { p.hidden = k !== current; });
      prevs.forEach(function (b) { b.disabled = current === 0; });
      nexts.forEach(function (b) { b.disabled = current === panels.length - 1; });
    }
    tabs.forEach(function (t, k) { t.addEventListener('click', function () { show(k); }); });
    prevs.forEach(function (b) { b.addEventListener('click', function () { show(current - 1); }); });
    nexts.forEach(function (b) { b.addEventListener('click', function () { show(current + 1); }); });
    show(0);
  });

  /* Testimonial deck ---------------------------------------------------- */
  $$('[data-deck]').forEach(function (deck) {
    var items = $$('[data-deck-item]', deck);
    var indexes = $$('[data-deck-index]', deck);
    var prev = $('[data-deck-prev]', deck);
    var next = $('[data-deck-next]', deck);
    var current = 0;
    if (!items.length) return;
    var keyed = items.map(function (el, k) { var a = el.getAttribute('data-deck-item'); return a === '' || a === null ? k : parseInt(a, 10); });
    var total = Math.max.apply(null, keyed) + 1;
    function show(i) {
      current = (i + total) % total;
      items.forEach(function (el, k) { el.hidden = keyed[k] !== current; });
      indexes.forEach(function (el, k) { el.classList.toggle('is-current', k === current); });
      var cur = $('[data-deck-current]', deck); if (cur) cur.textContent = String(current + 1).padStart(2, '0');
    }
    if (prev) prev.addEventListener('click', function () { show(current - 1); });
    if (next) next.addEventListener('click', function () { show(current + 1); });
    show(0);
  });

  /* Video players (poster -> embed) ------------------------------------- */
  $$('[data-video]').forEach(function (wrap) {
    var play = $('[data-video-play]', wrap);
    var src = wrap.getAttribute('data-video');
    if (!play || !src) return;
    play.addEventListener('click', function () {
      var el;
      var yt = src.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
      var vm = src.match(/vimeo\.com\/(?:video\/)?(\d+)/);
      if (yt) {
        el = document.createElement('iframe');
        el.src = 'https://www.youtube-nocookie.com/embed/' + yt[1] + '?autoplay=1&rel=0';
        el.allow = 'autoplay; encrypted-media; picture-in-picture';
        el.allowFullscreen = true;
      } else if (vm) {
        el = document.createElement('iframe');
        el.src = 'https://player.vimeo.com/video/' + vm[1] + '?autoplay=1';
        el.allow = 'autoplay; fullscreen; picture-in-picture';
        el.allowFullscreen = true;
      } else {
        el = document.createElement('video');
        el.src = src; el.controls = true; el.autoplay = true; el.playsInline = true;
      }
      el.setAttribute('title', play.getAttribute('aria-label') || 'Video');
      wrap.appendChild(el);
      wrap.classList.add('is-playing');
    });
  });

  /* Career arc ---------------------------------------------------------- */
  $$('[data-arc]').forEach(function (arc) {
    var detail = $('[data-arc-detail]', arc);
    var idle = detail ? detail.textContent : '';
    $$('[data-arc-step]', arc).forEach(function (step) {
      function on() { if (detail) { detail.textContent = step.getAttribute('data-arc-step'); detail.classList.add('is-active'); } }
      function off() { if (detail) { detail.textContent = idle; detail.classList.remove('is-active'); } }
      step.addEventListener('mouseenter', on);
      step.addEventListener('focus', on);
      step.addEventListener('mouseleave', off);
      step.addEventListener('blur', off);
      step.addEventListener('click', function (e) { e.preventDefault(); on(); });
    });
  });

  /* FAQ: only one open per column (optional nicety) --------------------- */
  $$('[data-faq-col]').forEach(function (col) {
    $$('details', col).forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (!d.open) return;
        $$('details', col).forEach(function (o) { if (o !== d) o.open = false; });
      });
    });
  });
})();

/* PDP: sticky buy bar + gallery ---------------------------------------- */
(function () {
  'use strict';
  var bar = document.querySelector('[data-sticky-bar]');
  var anchor = document.querySelector('[data-sticky-anchor]');
  if (bar && anchor && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      var stuck = !entries[0].isIntersecting && entries[0].boundingClientRect.top < 0;
      bar.classList.toggle('is-visible', stuck);
      bar.setAttribute('aria-hidden', stuck ? 'false' : 'true');
      document.body.classList.toggle('has-sticky', stuck);
    }, { rootMargin: '-8px 0px 0px 0px' }).observe(anchor);
  }
  var gallery = document.querySelector('[data-gallery]');
  if (gallery) {
    var main = gallery.querySelector('[data-gallery-main]');
    var mainImg = main && main.querySelector('img');
    var original = mainImg && { src: mainImg.getAttribute('src'), srcset: mainImg.getAttribute('srcset'), alt: mainImg.getAttribute('alt') };
    var thumbs = Array.prototype.slice.call(gallery.querySelectorAll('[data-gallery-thumb]'));
    thumbs.forEach(function (t) {
      t.addEventListener('click', function () {
        if (!mainImg) return;
        var active = t.getAttribute('aria-pressed') === 'true';
        thumbs.forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
        if (active) { mainImg.setAttribute('src', original.src); if (original.srcset) mainImg.setAttribute('srcset', original.srcset); mainImg.setAttribute('alt', original.alt || ''); return; }
        t.setAttribute('aria-pressed', 'true');
        mainImg.removeAttribute('srcset');
        mainImg.setAttribute('src', t.getAttribute('data-full'));
        mainImg.setAttribute('alt', t.getAttribute('aria-label') || '');
      });
    });
  }
})();
