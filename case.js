// Robert Capron — case study sheet, shared by the main site and /v2/.
// Two reading speeds on one screen: the pinned side column is the skim layer (title, summary,
// facts, chapter list that tracks the scroll); the body is the full read, and each section opens
// with one takeaway line. The look comes from each site's own CSS.
//
//   const cs = initCaseStudy({ projects, originOf, reduced, base, onOpen, onClose });
//   cs.open(i) · cs.close() · cs.isOpen()
//
// originOf(i) → DOMRect the circle reveal grows from (or null for the screen centre).
// base → prefix for image paths ('' on the main site, '../' from /v2/).
(() => {
  const pad2 = n => String(n).padStart(2, '0');
  const pad3 = n => String(n).padStart(3, '0');
  const make = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  // placeholders ({ ph }) are notes to self: visitors never see them, ?draft=1 shows them
  const DRAFT = new URLSearchParams(location.search).has('draft');
  const isPh = t => t && typeof t === 'object' && 'ph' in t;

  const SHELL = `
    <button id="case-close" type="button">Close <span aria-hidden="true">(esc)</span></button>
    <div class="case-inner">
      <aside class="case-side">
        <div class="case-kicker micro"><span class="n num" id="case-num"></span><span class="muted" id="case-cat"></span></div>
        <h2 class="display" id="case-title"></h2>
        <span class="micro" id="case-tag"></span>
        <p class="case-summary" id="case-summary"></p>
        <dl class="case-facts" id="case-facts"></dl>
        <nav class="case-chapters" aria-label="Chapters"><div class="case-chapters-list" id="case-chapters"></div></nav>
      </aside>
      <div class="case-body">
        <div id="case-cover"></div>
        <div id="case-desc"></div>
        <button id="case-next" type="button">
          <span class="micro"><span>Next project</span><span class="num" id="case-next-num"></span></span>
          <span class="display"><span id="case-next-title"></span> →</span>
        </button>
      </div>
    </div>`;

  window.initCaseStudy = function initCaseStudy({ projects, originOf = () => null, reduced = false, base = '', onOpen, onClose }) {
    let caseEl = document.getElementById('case');
    if (!caseEl) {
      caseEl = make('div');
      caseEl.id = 'case';
      document.body.appendChild(caseEl);
    }
    caseEl.setAttribute('role', 'dialog');
    caseEl.setAttribute('aria-modal', 'true');
    caseEl.setAttribute('aria-labelledby', 'case-title');
    caseEl.setAttribute('aria-hidden', 'true');
    caseEl.innerHTML = SHELL;
    const $ = id => caseEl.querySelector('#' + id);
    const url = src => base + src;

    // a video plays (muted, looping) only while it's on screen, so a long case study doesn't stream everything at once
    const vidWatch = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) e.target.play().catch(() => {}); else e.target.pause();
    }), { threshold: 0.25 }) : null;

    // an image entry: 'file.png', { src, caption }, a video { video, poster, caption }, or a placeholder { ph, ratio }
    function figure(im, title, eager) {
      const o = typeof im === 'string' ? { src: im } : im;
      const fig = make('figure', 'case-fig');
      if (o.ph) {
        const box = make('div', 'case-ph micro');
        box.append(make('span', null, 'Image'), make('span', null, o.ph));
        box.style.aspectRatio = o.ratio || '4/3';
        fig.appendChild(box);
      } else if (o.video) {
        const v = make('video');
        v.src = url(o.video); if (o.poster) v.poster = url(o.poster);
        v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'none';
        if (o.w && o.h) v.style.aspectRatio = `${o.w} / ${o.h}`;   // the poster's shape, so nothing jumps or crops
        v.setAttribute('aria-label', o.caption || `${title} video`);
        if (vidWatch) vidWatch.observe(v); else v.autoplay = true;
        fig.appendChild(v);
      } else {
        const img = make('img');
        img.alt = o.caption || `${title} screen`;
        img.decoding = 'async';
        if (o.w && o.h) { img.width = o.w; img.height = o.h; }   // reserves the space before the file arrives
        if (!eager) img.loading = 'lazy';
        img.src = url(o.src);
        fig.appendChild(img);
      }
      if (o.caption) fig.appendChild(make('figcaption', null, o.caption));
      return fig;
    }
    const para = t => typeof t === 'string' ? make('p', null, t) : make('p', 'case-ph-text', t.ph);

    // what a visitor sees of a project: placeholders dropped, and sections left with nothing real skipped
    function visible(p) {
      let dropped = false;
      const keep = arr => [].concat(arr || []).filter(t => { if (DRAFT || !isPh(t)) return true; dropped = true; return false; });
      const secs = [];
      (p.sections || []).forEach(s => {
        const body = keep(s.body), images = keep(s.images), items = s.items || [];
        if (!body.length && !images.length && !items.length) return;
        secs.push({ ...s, body, images, items });
      });
      return { secs, dropped };
    }

    let current = 0, secEls = [], chapEls = [], active = -1, ticking = false;

    function setOrigin(i) {
      const r = originOf(i);
      caseEl.style.transition = 'none';
      caseEl.style.setProperty('--cx', r ? `${r.left + r.width / 2}px` : '50%');
      caseEl.style.setProperty('--cy', r ? `${r.top + r.height / 2}px` : '50%');
      caseEl.getBoundingClientRect();   // commit the new centre before the transition comes back
      caseEl.style.transition = '';
    }

    // the chapter whose section has reached the upper third of the sheet is the current one
    function track() {
      ticking = false;
      if (!secEls.length) return;
      const line = caseEl.getBoundingClientRect().top + caseEl.clientHeight * 0.32;
      let k = 0;
      secEls.forEach((el, j) => { if (el.getBoundingClientRect().top <= line) k = j; });
      // at the very bottom the last chapter is current even if its section is short
      if (caseEl.scrollTop + caseEl.clientHeight >= caseEl.scrollHeight - 4) k = secEls.length - 1;
      if (k === active) return;
      active = k;
      chapEls.forEach((a, j) => { if (j === k) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
      // keep the current chapter in view inside its own scroller (the sideways strip on small screens)
      const a = chapEls[k], list = a.parentElement;
      if (list.scrollWidth > list.clientWidth + 1) {
        list.scrollTo({ left: a.offsetLeft - (list.clientWidth - a.offsetWidth) / 2, behavior: reduced ? 'auto' : 'smooth' });
      }
    }
    caseEl.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(track); } }, { passive: true });
    addEventListener('resize', () => { active = -1; track(); });

    function goTo(k) {
      const el = secEls[k];
      if (!el) return;
      // land the section just under the sticky chapter strip (small screens) or near the top (large)
      const strip = caseEl.querySelector('.case-chapters');
      const pinned = getComputedStyle(strip).position === 'sticky' ? strip.offsetHeight : 0;
      const y = el.getBoundingClientRect().top - caseEl.getBoundingClientRect().top + caseEl.scrollTop - pinned - 24;
      caseEl.scrollTo({ top: Math.max(0, y), behavior: reduced ? 'auto' : 'smooth' });
    }

    function open(i) {
      current = i;
      const p = projects[i];
      const wasOpen = caseEl.classList.contains('open');
      // "next project" swaps content in place — keep focus returning to the original card
      if (!wasOpen) { lastFocus = document.activeElement; setOrigin(i); }
      $('case-num').textContent = pad3(i + 1);
      $('case-cat').textContent = p.cat;
      $('case-title').textContent = p.title;
      const { secs, dropped } = visible(p);
      const tag = p.tag || '';
      $('case-tag').textContent = tag;
      $('case-tag').hidden = !tag;
      $('case-summary').textContent = p.summary || '';
      $('case-summary').hidden = !p.summary;

      const facts = $('case-facts');
      facts.replaceChildren();
      (p.facts || []).forEach(([k, v]) => {
        const row = make('div');
        row.append(make('dt', 'micro', k), make('dd', null, v));
        facts.appendChild(row);
      });
      facts.hidden = !(p.facts && p.facts.length);

      // cover: the project's own opener (a video for Etch), else its poster image
      const cover = $('case-cover');
      const c = p.cover || { src: p.img };
      const fig = figure({ ...c, caption: c.caption }, p.title, true);
      fig.classList.add('case-cover');
      if (!p.cover && p.fit === 'contain') fig.classList.add('case-cover--contain');
      fig.style.backgroundImage = !p.cover && p.bg ? `url("${url(p.bg)}")` : '';
      cover.replaceChildren(fig);

      // sections: default (text, then images), 'statement' (large lead text),
      // 'split' (text beside the images), 'media-first' (images above the text)
      const desc = $('case-desc');
      desc.replaceChildren();
      secEls = [];
      secs.forEach((s, k) => {
        const sec = make('section', `case-sec${s.layout ? ` case-sec--${s.layout}` : ''}`);
        sec.id = `case-sec-${k + 1}`;
        const bar = make('div', 'case-sec-bar micro');
        bar.append(make('span', 'num', pad2(k + 1)), make('span', 'num muted', `/ ${pad2(secs.length)}`));
        const text = make('div', 'case-text');
        text.appendChild(make('h3', null, s.title));
        if (s.take) text.appendChild(make('p', 'case-take', s.take));
        s.body.forEach(t => text.appendChild(para(t)));
        if (s.items.length) {
          const dl = make('dl', 'case-items');
          s.items.forEach(([k2, v]) => {
            const row = make('div');
            row.append(make('dt', 'micro', k2), make('dd', null, v));
            dl.appendChild(row);
          });
          text.appendChild(dl);
        }
        let figs = null;
        if (s.images.length) {
          figs = make('div', 'case-figs');
          const n = Math.min(s.cols || 1, s.images.length);
          figs.style.setProperty('--n', n);
          figs.style.setProperty('--ns', Math.min(n, 2));   // phones: two across at most
          s.images.forEach(im => figs.appendChild(figure(im, p.title)));
        }
        sec.appendChild(bar);
        if (s.layout === 'split' && figs) {
          const row = make('div', 'case-split');
          row.append(text, figs);
          sec.appendChild(row);
        } else if (s.layout === 'media-first' && figs) sec.append(figs, text);
        else { sec.appendChild(text); if (figs) sec.appendChild(figs); }
        desc.appendChild(sec);
        secEls.push(sec);
      });
      if (dropped || !secs.length) {
        desc.appendChild(make('p', 'case-wip', 'In progress — more of this project is on the way.'));
      }

      // chapter list: one link per section, in the same numbering
      const chapters = $('case-chapters');
      chapters.replaceChildren();
      chapEls = secs.map((s, k) => {
        const a = make('a');
        a.href = `#case-sec-${k + 1}`;
        a.append(make('span', 'num', pad2(k + 1)), make('span', 'lbl', s.title));
        a.addEventListener('click', e => { e.preventDefault(); goTo(k); });
        chapters.appendChild(a);
        return a;
      });
      caseEl.querySelector('.case-chapters').hidden = secs.length < 2;

      const n = (i + 1) % projects.length;
      $('case-next-num').textContent = pad3(n + 1);
      $('case-next-title').textContent = projects[n].title;
      $('case-next').onclick = () => open(n);

      caseEl.scrollTop = 0;
      const side = caseEl.querySelector('.case-side');
      side.scrollTop = 0;
      caseEl.setAttribute('aria-hidden', 'false');
      caseEl.classList.remove('closing');
      caseEl.classList.add('open');
      document.body.classList.add('case-open');
      active = -1; track();
      $('case-close').focus({ preventScroll: true });
      if (onOpen) onOpen(i);
    }
    let lastFocus = null;

    function close() {
      if (!caseEl.classList.contains('open')) return;
      setOrigin(current);   // shrink back into the poster of the project being viewed
      caseEl.classList.add('closing');
      caseEl.classList.remove('open');
      caseEl.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('case-open');
      caseEl.querySelectorAll('video').forEach(v => v.pause());
      setTimeout(() => caseEl.classList.remove('closing'), reduced ? 0 : 750);
      if (lastFocus) lastFocus.focus({ preventScroll: true });
      if (onClose) onClose(current);
    }
    $('case-close').addEventListener('click', close);
    addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

    return { open, close, isOpen: () => caseEl.classList.contains('open') };
  };
})();
