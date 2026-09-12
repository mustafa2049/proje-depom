/* =========================================================
   Akrep & Yelkovan — canlı analog + dijital saat
   Zaman kaynağı: kullanıcının yerel sistem saati (Date)
   ========================================================= */
(() => {
  'use strict';

  const SVG = 'http://www.w3.org/2000/svg';
  const CX = 200, CY = 200;
  const ARC_R = 180;
  const ARC_LEN = 2 * Math.PI * ARC_R;

  const el = (id) => document.getElementById(id);

  const nodes = {
    ticks:     el('ticks'),
    numerals:  el('numerals'),
    hour:      el('hourHand'),
    minute:    el('minuteHand'),
    second:    el('secondHand'),
    arc:       el('secArc'),
    crystal:   el('crystal'),
    hh:        el('dHH'),
    mm:        el('dMM'),
    ss:        el('dSS'),
    date:      el('date'),
    dayPct:    el('dayPct'),
    dayBar:    el('dayBar'),
    zoneName:  el('zoneName'),
    zoneOffset:el('zoneOffset'),
    dialTitle: el('dialTitle')
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------
     Kadran: dakika taksimatı + 12/3/6/9 rakamları
     --------------------------------------------------- */
  const polar = (angleDeg, radius) => {
    const rad = (angleDeg - 90) * Math.PI / 180;
    return { x: CX + Math.cos(rad) * radius, y: CY + Math.sin(rad) * radius };
  };

  function buildDial() {
    const frag = document.createDocumentFragment();

    for (let i = 0; i < 60; i++) {
      const angle = i * 6;
      const isHour    = i % 5 === 0;
      const isQuarter = i % 15 === 0;

      const outerR = 170;
      const innerR = isQuarter ? 151 : isHour ? 156 : 163;

      const a = polar(angle, outerR);
      const b = polar(angle, innerR);

      const line = document.createElementNS(SVG, 'line');
      line.setAttribute('x1', a.x.toFixed(2));
      line.setAttribute('y1', a.y.toFixed(2));
      line.setAttribute('x2', b.x.toFixed(2));
      line.setAttribute('y2', b.y.toFixed(2));
      line.setAttribute('class', isQuarter ? 'tick-quarter' : isHour ? 'tick-major' : 'tick-minor');
      frag.appendChild(line);
    }
    nodes.ticks.appendChild(frag);

    const numFrag = document.createDocumentFragment();
    [12, 3, 6, 9].forEach((n) => {
      const p = polar(n === 12 ? 0 : n * 30, 128);
      const t = document.createElementNS(SVG, 'text');
      t.setAttribute('x', p.x.toFixed(2));
      t.setAttribute('y', p.y.toFixed(2));
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('dominant-baseline', 'central');
      t.setAttribute('class', 'numeral numeral--anchor');
      t.textContent = String(n);
      numFrag.appendChild(t);
    });
    nodes.numerals.appendChild(numFrag);

    nodes.arc.setAttribute('stroke-dasharray', ARC_LEN.toFixed(2));
    nodes.arc.setAttribute('stroke-dashoffset', ARC_LEN.toFixed(2));
  }

  /* ---------------------------------------------------
     Saat dilimi bilgisi
     --------------------------------------------------- */
  function paintZone(now) {
    let zone = '—';
    try {
      zone = Intl.DateTimeFormat().resolvedOptions().timeZone || '—';
    } catch (_) { /* eski tarayıcı: alan boş kalır */ }
    nodes.zoneName.textContent = zone.replace(/_/g, ' ');

    const mins = -now.getTimezoneOffset();
    const sign = mins < 0 ? '−' : '+';
    const abs  = Math.abs(mins);
    nodes.zoneOffset.textContent =
      'UTC' + sign + pad(Math.floor(abs / 60)) + ':' + pad(abs % 60);
  }

  /* ---------------------------------------------------
     Yardımcılar
     --------------------------------------------------- */
  const pad = (n) => (n < 10 ? '0' : '') + n;

  const rotate = (node, deg) =>
    node.setAttribute('transform', 'rotate(' + deg.toFixed(3) + ' ' + CX + ' ' + CY + ')');

  const trDate = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  const trDay  = new Intl.DateTimeFormat('tr-TR', { weekday: 'long' });
  const trPct  = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  /* ---------------------------------------------------
     Ekran güncellemeleri
     --------------------------------------------------- */
  let lastSecond = -1;
  let lastDayKey = '';

  function paintDigital(now) {
    const s = now.getSeconds();
    if (s === lastSecond) return;
    lastSecond = s;

    nodes.hh.textContent = pad(now.getHours());
    nodes.mm.textContent = pad(now.getMinutes());
    nodes.ss.textContent = pad(s);

    const dayKey = now.getFullYear() + '-' + now.getMonth() + '-' + now.getDate();
    if (dayKey !== lastDayKey) {
      lastDayKey = dayKey;
      nodes.date.innerHTML =
        '<b>' + trDate.format(now) + '</b><i>·</i>' + trDay.format(now);
      paintZone(now);
    }

    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const elapsed  = (now.getTime() - midnight) / 86400000;
    const ratio    = Math.min(Math.max(elapsed, 0), 1);
    nodes.dayPct.textContent  = '%' + trPct.format(ratio * 100);
    nodes.dayBar.style.width  = (ratio * 100).toFixed(3) + '%';

    nodes.dialTitle.textContent =
      'Analog saat kadranı, saat ' + pad(now.getHours()) + ':' + pad(now.getMinutes());
  }

  function paintHands(now) {
    const ms = reduceMotion ? 0 : now.getMilliseconds();
    const sec  = now.getSeconds() + ms / 1000;
    const min  = now.getMinutes() + sec / 60;
    const hour = (now.getHours() % 12) + min / 60;

    rotate(nodes.hour,   hour * 30);
    rotate(nodes.minute, min  * 6);
    rotate(nodes.second, sec  * 6);

    nodes.arc.setAttribute('stroke-dashoffset', (ARC_LEN * (1 - sec / 60)).toFixed(2));

    if (nodes.crystal && !reduceMotion) {
      nodes.crystal.style.transform = 'rotate(' + (sec * 6).toFixed(2) + 'deg)';
    }
  }

  function frame() {
    const now = new Date();
    paintHands(now);
    paintDigital(now);
    requestAnimationFrame(frame);
  }

  /* ---------------------------------------------------
     Başlat
     --------------------------------------------------- */
  buildDial();

  const now0 = new Date();
  paintZone(now0);
  paintHands(now0);
  paintDigital(now0);

  if (reduceMotion) {
    setInterval(() => {
      const n = new Date();
      paintHands(n);
      paintDigital(n);
    }, 1000);
  } else {
    requestAnimationFrame(frame);
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      const n = new Date();
      lastSecond = -1;
      paintHands(n);
      paintDigital(n);
    }
  });
})();
