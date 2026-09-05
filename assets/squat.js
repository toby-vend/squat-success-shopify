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

/* Claim-your-copy modal ------------------------------------------------ */
(function () {
  'use strict';
  var modal = document.querySelector('[data-claim]');
  if (!modal) return;
  var form = modal.querySelector('[data-claim-form]');
  var errorEl = modal.querySelector('[data-claim-error]');
  var lastFocus = null;

  function open() {
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('claim-open');
    var first = form.querySelector('input');
    if (first) setTimeout(function () { first.focus(); }, 30);
  }
  function close() {
    modal.hidden = true;
    document.body.classList.remove('claim-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function showError(msg) { errorEl.textContent = msg; errorEl.hidden = !msg; }

  document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-claim-open]');
    if (opener) { e.preventDefault(); open(); return; }
    if (e.target.closest('[data-claim-close]')) { e.preventDefault(); close(); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) close(); });
  form.addEventListener('input', function () { showError(''); form.querySelectorAll('.is-invalid').forEach(function (i) { i.classList.remove('is-invalid'); }); });

  function splitName(full) {
    var parts = full.trim().split(/\s+/).filter(Boolean);
    var titled = parts.length > 1 && /^(dr|mr|mrs|ms|miss|prof)\.?$/i.test(parts[0]);
    var first = titled ? parts[1] : parts[0];
    var last = parts.length > (titled ? 2 : 1) ? parts[parts.length - 1] : '';
    return { first: first || '', last: last };
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    var v = { name: f.name.value, email: f.email.value, phone: f.phone.value, line1: f.line1.value, city: f.city.value, postcode: f.postcode.value };
    var missing = Object.keys(v).filter(function (k) { return !v[k].trim(); });
    if (missing.length) {
      missing.forEach(function (k) { f[k].classList.add('is-invalid'); });
      return showError('Please fill in every field so the printer can post it.');
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email.trim())) { f.email.classList.add('is-invalid'); return showError("That email doesn't look right — we send the confirmation there."); }
    var name = splitName(v.name);
    var q = {
      'checkout[email]': v.email.trim(),
      'checkout[shipping_address][first_name]': name.first,
      'checkout[shipping_address][last_name]': name.last,
      'checkout[shipping_address][phone]': v.phone.trim(),
      'checkout[shipping_address][address1]': v.line1.trim(),
      'checkout[shipping_address][city]': v.city.trim(),
      'checkout[shipping_address][zip]': v.postcode.trim().toUpperCase(),
      'checkout[shipping_address][country]': 'United Kingdom'
    };
    var query = Object.keys(q).filter(function (k) { return q[k]; }).map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(q[k]); }).join('&');
    var variant = modal.getAttribute('data-variant');
    if (modal.getAttribute('data-design-mode') === 'true') {
      return showError('Checkout can\'t open inside the theme editor. Use the theme preview link to test the full flow.');
    }
    var btn = form.querySelector('.claim__submit'); if (btn) btn.disabled = true;
    var target = '/cart/' + variant + ':1?' + query;
    var hook = modal.getAttribute('data-ghl-webhook');
    if (!hook) return window.location.assign(target);
    var payload = JSON.stringify({
      first_name: name.first, last_name: name.last, full_name: v.name.trim(),
      email: v.email.trim(), phone: v.phone.trim(),
      address1: v.line1.trim(), city: v.city.trim(), postal_code: v.postcode.trim().toUpperCase(), country: 'United Kingdom',
      tags: [modal.getAttribute('data-ghl-tag') || 'book-form-started'],
      source: modal.getAttribute('data-ghl-source') || location.hostname,
      product: modal.getAttribute('data-product') || '',
      page: location.href, submitted_at: new Date().toISOString()
    });
    var go = function () { window.location.assign(target); };
    var done = false; var finish = function () { if (!done) { done = true; go(); } };
    setTimeout(finish, 1500);
    try {
      fetch(hook, { method: 'POST', mode: 'cors', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: payload })
        .catch(function () { return fetch(hook, { method: 'POST', mode: 'no-cors', keepalive: true, body: payload }); })
        .then(finish, finish);
    } catch (err) { finish(); }
  });
})();
