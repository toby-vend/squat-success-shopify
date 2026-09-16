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

  /* Book stage — Figma "BookStage" prototype: Rest → Hover → Edge → Back → Rest ------- */
  $$('[data-book]').forEach(function (book) {
    var flips = $$('[data-book-flip]', book);
    var flip = flips[0];
    var state = 'rest';
    var timer = null;
    var hoverable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    function set(next) {
      state = next;
      book.classList.toggle('is-hover', next === 'hover');
      book.classList.toggle('is-edge', next === 'edge');
      book.classList.toggle('is-back', next === 'back');
      book.classList.toggle('is-closing', next === 'closing');
      if (flip) flip.setAttribute('aria-pressed', next === 'back' ? 'true' : 'false');
    }
    function flipOver() {
      clearTimeout(timer);
      set('edge');                                  // 220ms ease-in to the spine
      timer = setTimeout(function () { set('back'); }, 221); // then 220ms ease-out to the back cover
    }
    function close() {
      clearTimeout(timer);
      set('closing');                               // 500ms lift easing back to rest
      timer = setTimeout(function () { if (state === 'closing') set(book.matches(':hover') && hoverable ? 'hover' : 'rest'); }, 500);
    }

    if (hoverable) {
      book.addEventListener('mouseenter', function () { if (state === 'rest') set('hover'); });
      book.addEventListener('mouseleave', function () { if (state === 'hover') set('rest'); });
    }
    book.addEventListener('click', function (e) {
      e.preventDefault();
      if (state === 'back') close();
      else if (state === 'rest' || state === 'hover') flipOver();
    });
    flips.forEach(function (el) {
      el.addEventListener('focus', function () { if (state === 'rest') set('hover'); });
      el.addEventListener('blur', function () { if (state === 'hover') set('rest'); });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && state === 'back') close(); });
  });

  /* Fit seam — Figma FitSeam: hover/tap a side to open it (700ms), the chip restores the balance (600ms) */
  $$('[data-fit]').forEach(function (fit) {
    var hoverable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    function set(side) {
      fit.classList.toggle('is-order', side === 'order');
      fit.classList.toggle('is-skip', side === 'skip');
      fit.classList.toggle('is-return', !side);
    }
    $$('[data-fit-side]', fit).forEach(function (el) {
      var side = el.getAttribute('data-fit-side');
      if (hoverable) {
        el.addEventListener('mouseenter', function () { set(side); });
        el.addEventListener('mouseleave', function () { set(null); });
      }
      el.addEventListener('click', function () { set(fit.classList.contains('is-' + side) && !hoverable ? null : side); });
    });
    var reset = $('[data-fit-reset]', fit);
    if (reset) reset.addEventListener('click', function (e) { e.stopPropagation(); set(null); });
  });

  /* Decision — golden dust drifting through the light (stands in for the Figma video fill) ------ */
  $$('[data-dust]').forEach(function (canvas) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var ctx = canvas.getContext('2d'); if (!ctx) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5), w = 0, h = 0, motes = [], running = false, raf = 0;
    function size() {
      var r = canvas.getBoundingClientRect(); w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(220, (w * h) / 6500));
      motes = [];
      for (var i = 0; i < n; i++) motes.push(spawn(true));
    }
    function spawn(anywhere) {
      // the light beam runs from the top-centre down to the right; motes cluster along it
      var t = anywhere ? Math.random() : Math.random() * 0.25;
      var bx = w * (0.44 + 0.62 * t), by = h * (-0.05 + 0.95 * t);
      var spread = (Math.random() - .5) * (0.10 + 0.22 * t) * w;
      return { x: bx + spread, y: by + (Math.random() - .5) * 0.12 * h, r: .5 + Math.random() * 1.4, a: .08 + Math.random() * .38, vx: 0.05 + Math.random() * 0.10, vy: 0.10 + Math.random() * 0.20, tw: Math.random() * 6.28, ts: .008 + Math.random() * .02 };
    }
    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < motes.length; i++) {
        var m = motes[i]; m.x += m.vx; m.y += m.vy; m.tw += m.ts;
        if (m.y > h + 10 || m.x > w + 10) motes[i] = m = spawn(false);
        var glow = m.a * (0.55 + 0.45 * Math.sin(m.tw));
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, 6.28);
        ctx.fillStyle = 'rgba(231,196,137,' + glow.toFixed(3) + ')'; ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }
    function start() { if (!running) { running = true; raf = requestAnimationFrame(frame); } }
    function stop() { running = false; cancelAnimationFrame(raf); }
    size(); window.addEventListener('resize', size);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { en[0].isIntersecting ? start() : stop(); }).observe(canvas); else start();
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

  /* Story carousel (testimonials) ------------------------------------- */
  $$('[data-story]').forEach(function (story) {
    var film = $('[data-story-film]', story);
    var frames = $$('[data-story-frame]', story);
    var panels = $$('[data-story-panel]', story);
    var selects = $$('[data-story-select]', story);
    var stop = $('[data-story-stop]', story);
    var current = 0;
    var video = null;

    function stopFilm() {
      if (video) { try { video.pause(); } catch (e) {} video.remove(); video = null; }
      story.classList.remove('is-playing');
    }
    function show(i) {
      current = (i + panels.length) % panels.length;
      stopFilm();
      frames.forEach(function (f) { f.classList.toggle('is-active', f.getAttribute('data-story-frame') === String(current)); });
      panels.forEach(function (p) { p.hidden = p.getAttribute('data-story-panel') !== String(current); });
      selects.forEach(function (b) { b.setAttribute('aria-selected', b.getAttribute('data-story-select') === String(current) ? 'true' : 'false'); });
    }
    function play(src, label) {
      var yt = src.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
      var vm = src.match(/vimeo\.com\/(?:video\/)?(\d+)/);
      stopFilm();
      if (yt || vm) {
        video = document.createElement('iframe');
        video.src = yt ? 'https://www.youtube-nocookie.com/embed/' + yt[1] + '?autoplay=1&rel=0' : 'https://player.vimeo.com/video/' + vm[1] + '?autoplay=1';
        video.allow = 'autoplay; fullscreen; encrypted-media; picture-in-picture';
        video.allowFullscreen = true;
        video.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;background:#000';
      } else {
        video = document.createElement('video');
        video.src = src; video.controls = true; video.autoplay = true; video.playsInline = true; video.preload = 'metadata';
      }
      video.setAttribute('title', label || 'Testimonial video');
      film.appendChild(video);
      story.classList.add('is-playing');
      if (video.play) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
      film.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    selects.forEach(function (b) { b.addEventListener('click', function () { show(parseInt(b.getAttribute('data-story-select'), 10)); }); });
    story.addEventListener('click', function (e) {
      var a = e.target.closest('[data-story-play]');
      if (!a) return;
      e.preventDefault();
      play(a.getAttribute('data-story-video'), a.textContent.trim());
    });
    if (stop) stop.addEventListener('click', stopFilm);
    story.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') stopFilm();
      if (e.target.hasAttribute('data-story-select') && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        e.preventDefault(); show(current + (e.key === 'ArrowRight' ? 1 : -1));
        var next = selects[current]; if (next) next.focus();
      }
    });
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
    var idle = detail ? detail.innerHTML : '';
    $$('[data-arc-step]', arc).forEach(function (step) {
      function on() { if (detail) { detail.textContent = step.getAttribute('data-arc-step'); detail.classList.add('is-active'); } }
      function off() { if (detail) { detail.innerHTML = idle; detail.classList.remove('is-active'); } }
      step.addEventListener('mouseenter', on);
      step.addEventListener('focus', on);
      step.addEventListener('mouseleave', off);
      step.addEventListener('blur', off);
      step.addEventListener('click', function (e) { e.preventDefault(); on(); });
    });
  });

  /* FAQ — Figma FAQCard: open/close smart-animates over 350ms cubic-bezier(.22,1,.36,1); one open per column.
     The whole card animates between its closed and open heights, so nothing jumps. */
  (function () {
    var EASE = 'cubic-bezier(.22,1,.36,1)', DUR = 350;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function run(d, from, to, done) {
      d.style.overflow = 'hidden'; d.style.height = from + 'px';
      var anim = d.animate([{ height: from + 'px' }, { height: to + 'px' }], { duration: DUR, easing: EASE });
      anim.onfinish = anim.oncancel = function () { d.style.height = ''; d.style.overflow = ''; d.__anim = null; done && done(); };
      d.__anim = anim;
    }
    function openCard(d) {
      if (d.__anim) d.__anim.cancel();
      if (reduce || !d.animate) { d.open = true; return; }
      var from = d.offsetHeight;
      d.open = true; d.classList.remove('is-closing');
      var to = d.offsetHeight;
      run(d, from, to);
    }
    function closeCard(d) {
      if (d.__anim) d.__anim.cancel();
      if (reduce || !d.animate) { d.open = false; return; }
      var from = d.offsetHeight;
      var sum = d.querySelector('summary');
      var to = sum ? sum.offsetHeight + 2 : 0;
      d.classList.add('is-closing');
      run(d, from, to, function () { d.open = false; d.classList.remove('is-closing'); });
    }
    $$('[data-faq-col]').forEach(function (col) {
      var cards = $$('details', col);
      cards.forEach(function (d) {
        var sum = d.querySelector('summary'); if (!sum) return;
        sum.addEventListener('click', function (e) {
          e.preventDefault();
          if (d.open && !d.classList.contains('is-closing')) return closeCard(d);
          cards.forEach(function (o) { if (o !== d && o.open) closeCard(o); });
          openCard(d);
        });
      });
    });
  })();
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


/* Attribution capture (UTMs / click ids) — persisted so the claim form can send them */
(function () {
  'use strict';
  var KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'];
  try {
    var params = new URLSearchParams(location.search);
    var stored = {};
    try { stored = JSON.parse(localStorage.getItem('ss_attribution') || '{}') || {}; } catch (e) { stored = {}; }
    var touched = false;
    KEYS.forEach(function (k) { var v = params.get(k); if (v) { stored[k] = v.slice(0, 250); touched = true; } });
    if (!stored.landing_page) { stored.landing_page = location.href.slice(0, 500); touched = true; }
    if (!stored.referrer && document.referrer && document.referrer.indexOf(location.hostname) === -1) { stored.referrer = document.referrer.slice(0, 500); touched = true; }
    if (touched) localStorage.setItem('ss_attribution', JSON.stringify(stored));
    window.__ssAttribution = stored;
  } catch (e) { window.__ssAttribution = {}; }
})();

/* Claim your copy — lead capture → GHL webhook → pre-filled checkout ------ */
(function () {
  'use strict';
  var LEAD_KEY = 'ss_lead';
  var modal = document.querySelector('[data-claim]');
  var forms = Array.prototype.slice.call(document.querySelectorAll('[data-claim-form]'));
  if (!forms.length) return;
  var lastFocus = null;

  function readLead() { try { return JSON.parse(localStorage.getItem(LEAD_KEY) || 'null'); } catch (e) { return null; } }
  function saveLead(v) { try { localStorage.setItem(LEAD_KEY, JSON.stringify(v)); } catch (e) {} }
  window.__ssLead = readLead();

  function open() {
    if (!modal) return;
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('claim-open');
    var first = modal.querySelector('input');
    if (first) setTimeout(function () { first.focus(); }, 30);
  }
  function close() {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('claim-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-claim-open]');
    if (opener) { e.preventDefault(); open(); return; }
    if (e.target.closest('[data-claim-close]')) { e.preventDefault(); close(); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal && !modal.hidden) close(); });
  if (modal && /[?&#]claim(?:=|&|$)/.test(location.search + location.hash)) open();

  function splitName(full) {
    var parts = full.trim().split(/\s+/).filter(Boolean);
    var titled = parts.length > 1 && /^(dr|mr|mrs|ms|miss|prof)\.?$/i.test(parts[0]);
    var first = titled ? parts[1] : parts[0];
    var last = parts.length > (titled ? 2 : 1) ? parts[parts.length - 1] : '';
    return { first: first || '', last: last };
  }
  function encode(obj) {
    return Object.keys(obj).filter(function (k) { return obj[k]; }).map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]); }).join('&');
  }
  function postAll(urls, payload, cb) {
    var pending = urls.length, done = false;
    var finish = function () { if (!done) { done = true; cb(); } };
    var one = function () { if (--pending <= 0) finish(); };
    setTimeout(finish, 1800);
    urls.forEach(function (url) {
      try {
        fetch(url, { method: 'POST', mode: 'cors', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: payload })
          .catch(function () { return fetch(url, { method: 'POST', mode: 'no-cors', keepalive: true, body: payload }); })
          .then(one, one);
      } catch (err) { one(); }
    });
  }

  forms.forEach(function (form) {
    var errorEl = form.querySelector('[data-claim-error]');
    var f = form.elements;
    function showError(msg) { if (errorEl) { errorEl.textContent = msg; errorEl.hidden = !msg; } }

    // Returning visitor: pre-fill from the last submission
    var lead = window.__ssLead;
    if (lead) ['name', 'email', 'phone', 'line1', 'city', 'postcode'].forEach(function (k) { if (f[k] && !f[k].value && lead[k]) f[k].value = lead[k]; });

    form.addEventListener('input', function () { showError(''); form.querySelectorAll('.is-invalid').forEach(function (i) { i.classList.remove('is-invalid'); }); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = { name: f.name.value.trim(), email: f.email.value.trim(), phone: f.phone.value.trim(), line1: f.line1.value.trim(), city: f.city.value.trim(), postcode: f.postcode.value.trim().toUpperCase() };
      var missing = Object.keys(v).filter(function (k) { return !v[k]; });
      if (missing.length) {
        missing.forEach(function (k) { f[k].classList.add('is-invalid'); });
        return showError('Please fill in every field so the printer can post it.');
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email)) { f.email.classList.add('is-invalid'); return showError("That email doesn't look right — we send the confirmation there."); }
      if (form.getAttribute('data-design-mode') === 'true') {
        return showError('Checkout can\'t open inside the theme editor. Use the theme preview link to test the full flow.');
      }
      var name = splitName(v.name);
      var attr = window.__ssAttribution || {};
      var source = form.getAttribute('data-source') || location.hostname;
      var tag = form.getAttribute('data-tag') || 'book-requested';
      saveLead(v);

      // 1. Fallback route: cart permalink. Shopify's checkout no longer honours checkout[...] prefill params on
      //    permalinks (they are stripped on the Shop Pay universal redirect), but the cart attributes survive.
      var q = {
        'attributes[claimed]': '1',
        'attributes[lead_source]': source,
        'attributes[utm_source]': attr.utm_source || '',
        'attributes[utm_medium]': attr.utm_medium || '',
        'attributes[utm_campaign]': attr.utm_campaign || ''
      };
      var variant = form.getAttribute('data-variant');
      var target = '/cart/' + variant + ':1?' + encode(q);

      // 2. Preferred route: Storefront API cartCreate (tokenless from the store's own domain) with buyerIdentity +
      //    a selected delivery address, which the new checkout DOES prefill. Redirect to cart.checkoutUrl.
      var attrs = Object.keys(q).map(function (k) { return { key: k.slice(11, -1), value: q[k] }; }).filter(function (a) { return a.value; });
      var phoneE164 = (function (raw) {
        var d = raw.replace(/[^\d+]/g, '');
        if (/^\+/.test(d)) return d;
        if (/^00/.test(d)) return '+' + d.slice(2);
        if (/^0/.test(d)) return '+44' + d.slice(1);
        if (/^44/.test(d)) return '+' + d;
        return '+44' + d;
      })(v.phone);
      function cartCreate(withPhone) {
        var address = { firstName: name.first, lastName: name.last, address1: v.line1, city: v.city, zip: v.postcode, countryCode: 'GB' };
        var buyer = { email: v.email, countryCode: 'GB' };
        if (withPhone) { address.phone = phoneE164; buyer.phone = phoneE164; }
        var body = JSON.stringify({
          query: 'mutation cartCreate($input: CartInput!) { cartCreate(input: $input) { cart { checkoutUrl } userErrors { field message } } }',
          variables: { input: {
            lines: [{ merchandiseId: 'gid://shopify/ProductVariant/' + variant, quantity: 1 }],
            buyerIdentity: buyer,
            delivery: { addresses: [{ selected: true, oneTimeUse: true, address: { deliveryAddress: address } }] },
            attributes: attrs
          } }
        });
        // Theme previews (*.shopifypreview.com) don't serve the API, so call the shop's own domain (CORS is open there)
        var api = (window.Shopify && window.Shopify.shop ? 'https://' + window.Shopify.shop : '') + '/api/2026-07/graphql.json';
        return fetch(api, { method: 'POST', mode: 'cors', headers: { 'Content-Type': 'application/json' }, body: body })
          .then(function (r) { return r.json(); })
          .then(function (j) {
            var c = j && j.data && j.data.cartCreate;
            if (c && c.cart && c.cart.checkoutUrl) return c.cart.checkoutUrl;
            if (withPhone && c && c.userErrors && c.userErrors.some(function (e) { return /phone/i.test((e.field || []).join('.')); })) return cartCreate(false);
            return null;
          });
      }

      // 3. Lead → GHL inbound webhook(s), flat JSON so every key maps in the workflow builder
      var urls = (form.getAttribute('data-webhooks') || '').split(/[\s,]+/).filter(function (u) { return /^https?:\/\//.test(u); });
      var btn = form.querySelector('.claim__submit'); if (btn) btn.disabled = true;
      var payload = JSON.stringify({
        first_name: name.first, last_name: name.last, full_name: v.name,
        email: v.email, phone: v.phone,
        address1: v.line1, city: v.city, postal_code: v.postcode, country: 'United Kingdom',
        tags: [tag], tag: tag,
        source: source,
        product: form.getAttribute('data-product') || '',
        utm_source: attr.utm_source || '', utm_medium: attr.utm_medium || '', utm_campaign: attr.utm_campaign || '',
        utm_content: attr.utm_content || '', utm_term: attr.utm_term || '', gclid: attr.gclid || '', fbclid: attr.fbclid || '',
        landing_page: attr.landing_page || '', referrer: attr.referrer || '',
        page: location.href, submitted_at: new Date().toISOString()
      });

      var checkoutUrl = null, done = false;
      var go = function () { if (done) return; done = true; window.location.assign(checkoutUrl || target); };
      var pending = 2;
      var one = function () { if (--pending <= 0) go(); };
      setTimeout(go, 3500);
      cartCreate(true).then(function (u) { checkoutUrl = u; one(); }, one);
      if (urls.length) postAll(urls, payload, one); else one();
    });
  });
})();
