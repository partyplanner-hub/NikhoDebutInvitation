(function () {
  'use strict';
  var doc = document;
  doc.documentElement.classList.add('js');

  /* ---- Countdown (Philippine Time, UTC+8) ---- */
  var target = new Date('2026-11-10T17:00:00+08:00').getTime();
  var cd = doc.getElementById('countdown');
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function tick() {
    if (!cd) return;
    var diff = Math.max(0, target - Date.now());
    var v = {
      days: Math.floor(diff / 864e5),
      hours: Math.floor(diff / 36e5) % 24,
      minutes: Math.floor(diff / 6e4) % 60,
      seconds: Math.floor(diff / 1e3) % 60
    };
    for (var k in v) {
      var el = cd.querySelector('[data-u="' + k + '"]');
      if (el) el.textContent = pad(v[k]);
    }
  }
  tick();
  setInterval(tick, 1000);

  /* ---- Falling petals ---- */
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var petals = doc.getElementById('petals');
  if (petals && !reduce) {
    var count = window.innerWidth < 600 ? 9 : 16;
    for (var i = 0; i < count; i++) {
      var p = doc.createElement('span');
      p.className = 'petal';
      p.style.left = Math.random() * 100 + '%';
      p.style.setProperty('--drift', (Math.random() * 160 - 60) + 'px');
      p.style.animationDuration = (9 + Math.random() * 9) + 's';
      p.style.animationDelay = (-Math.random() * 14) + 's';
      var s = 0.6 + Math.random() * 0.9;
      p.style.width = 14 * s + 'px';
      p.style.height = 18 * s + 'px';
      petals.appendChild(p);
    }
  }

  /* ---- Top bar + back-to-top ---- */
  var bar = doc.getElementById('topbar');
  var totop = doc.getElementById('totop');
  function onScroll() {
    var y = window.pageYOffset || doc.documentElement.scrollTop;
    bar.classList.toggle('scrolled', y > 40);
    totop.classList.toggle('show', y > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Reveal on scroll ---- */
  var items = [].slice.call(doc.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) {
      // stagger siblings inside the 18-grids
      var parent = el.parentElement;
      if (parent && parent.classList.contains('grid-18')) {
        var idx = [].indexOf.call(parent.children, el);
        el.style.setProperty('--d', (idx % 6) * 0.07 + 's');
      }
      io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- Lightbox ---- */
  var lb = doc.getElementById('lightbox');
  var links = [].slice.call(doc.querySelectorAll('[data-lightbox]'));
  var lbImg = lb.querySelector('img');
  var lbCap = lb.querySelector('figcaption');
  var cur = 0;
  function show(i) {
    cur = (i + links.length) % links.length;
    lbImg.src = links[cur].getAttribute('href');
    lbImg.alt = links[cur].dataset.caption || '';
    lbCap.textContent = links[cur].dataset.caption || '';
  }
  function open(i) { show(i); lb.classList.add('open'); lb.hidden = false; doc.body.style.overflow = 'hidden'; lb.querySelector('.lb-close').focus(); }
  function close() { lb.classList.remove('open'); lb.hidden = true; doc.body.style.overflow = ''; }
  links.forEach(function (a, i) {
    a.addEventListener('click', function (e) { e.preventDefault(); open(i); });
  });
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', function () { show(cur - 1); });
  lb.querySelector('.lb-next').addEventListener('click', function () { show(cur + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  doc.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
  });
  var sx = null;
  lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
    sx = null;
  });

  /* ---- RSVP ---- */
  var btn = doc.getElementById('rsvpBtn');
  var card = doc.getElementById('rsvpCard');
  var thanks = doc.getElementById('rsvpThanks');
  if (btn) {
    btn.addEventListener('click', function () {
      if (card.classList.contains('confirmed')) return;
      card.classList.add('confirmed');
      btn.setAttribute('aria-expanded', 'true');
      thanks.setAttribute('aria-hidden', 'false');
      if (reduce) return;
      for (var i = 0; i < 10; i++) {
        var h = doc.createElement('span');
        h.className = 'burst';
        h.textContent = i % 2 ? '✦' : '❤';
        h.style.setProperty('--x', (Math.random() * 280 - 140) + 'px');
        h.style.animationDelay = (i * 0.06) + 's';
        card.appendChild(h);
        setTimeout(function (el) { el.remove(); }, 2200, h);
      }
    });
  }

  /* ---- Add to calendar (.ics) ---- */
  var cal = doc.getElementById('addToCal');
  if (cal) {
    cal.addEventListener('click', function () {
      var ics = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Debut Invitation//EN',
        'BEGIN:VEVENT',
        'UID:debut-nikho-2026@invitation',
        'DTSTAMP:20261001T000000Z',
        'DTSTART:20261110T090000Z',   // 5:00 PM Philippine Time
        'DTEND:20261110T130000Z',
        'SUMMARY:Nikho\'s 18th Birthday (Debut)',
        'LOCATION:Angkol Resort\\, Purok 12 B\\, Barangay Tinagacan\\, General Santos City',
        'DESCRIPTION:Debut celebration of Nikho Joy Hirose Besueno.',
        'END:VEVENT', 'END:VCALENDAR'
      ].join('\r\n');
      var a = doc.createElement('a');
      a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
      a.download = 'nikho-debut.ics';
      doc.body.appendChild(a); a.click(); a.remove();
    });
  }
})();
