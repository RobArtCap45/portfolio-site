// Robert Capron — portfolio behaviour
// hero metaballs, halftone posters, pixel cursor trail, skull logo, case studies

(() => {
  // every load starts at the top so the blob intro always plays: no restored
  // scroll position, and no jumping to a #section left in the address bar
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (location.hash) {
    history.replaceState(null, '', location.pathname + location.search);
    addEventListener('load', () => { if (scrollY > 2) scrollTo(0, 0); }, { once: true });   // in case the browser already jumped
  }
  scrollTo(0, 0);
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PAPER = [244, 243, 239];
  const BLUE  = [31, 71, 214];
  const PINK  = [255, 79, 168];
  const SWIRL = [107, 143, 255];   // periwinkle from the hero palette
  const INK   = [12, 12, 14];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp  = (a, b, t) => a + (b - a) * t;
  const pad3  = n => String(n).padStart(3, '0');
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  // ── LOGO — "smart animate" between the skull's three poses from the Figma file.
  // Every shape is tweened (shadow side, eye position/size, jaw, colour) so the head
  // turns and looks around smoothly; hovering switches to snappy frame-to-frame blinks.
  // Copies of the skull elsewhere (the About sticker) join in through addLogoRig(svg) and
  // move in sync; hovering any of them blinks them all.
  let addLogoRig = () => {};
  (function logo() {
    const el = document.getElementById('logo');
    const rig = svg => ({
      plate: svg.querySelector('#lg-plate, .lg-plate'), jaw: svg.querySelector('#lg-jaw, .lg-jaw'),
      panels: [...svg.querySelectorAll('.lg-panel')], eyes: [...svg.querySelectorAll('.lg-eye')],
      teeth: [...svg.querySelectorAll('.tooth')],
    });
    const rigs = [rig(el)];
    const POSES = [
      // look right (yellow)
      { px: 252, pw: 126, col: [255, 251, 137], e: [[315.5, 180.5], [370.5, 180.5]], r: 10.5, th: 29, jy: 255 },
      // look left (blue) — the shadow swings to the other side
      { px: 260, pw: 129, col: [137, 202, 255], e: [[265.5, 171.5], [320.5, 171.5]], r: 11.5, th: 29, jy: 255 },
      // look down, jaw shut (green)
      { px: 260, pw: 127, col: [72, 221, 139], e: [[283.5, 195.5], [338.5, 195.5]], r: 11, th: 16, jy: 242 },
    ];
    function apply(p) {
      const fill = `rgb(${p.col.map(c => Math.round(c)).join(',')})`;
      for (const { plate, jaw, panels, eyes, teeth } of rigs) {
        plate.setAttribute('x', p.px); plate.setAttribute('width', p.pw);
        panels.forEach(el => el.setAttribute('fill', fill));
        eyes.forEach((el, k) => { el.setAttribute('cx', p.e[k][0]); el.setAttribute('cy', p.e[k][1]); el.setAttribute('r', p.r); });
        teeth.forEach(el => el.setAttribute('height', p.th));
        jaw.setAttribute('y', p.jy); jaw.setAttribute('height', 272 - p.jy);
      }
    }
    const mix = (A, B, t) => ({
      px: lerp(A.px, B.px, t), pw: lerp(A.pw, B.pw, t),
      col: A.col.map((c, k) => lerp(c, B.col[k], t)),
      e: A.e.map((xy, k) => [lerp(xy[0], B.e[k][0], t), lerp(xy[1], B.e[k][1], t)]),
      r: lerp(A.r, B.r, t), th: lerp(A.th, B.th, t), jy: lerp(A.jy, B.jy, t),
    });
    const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    if (REDUCED) { addLogoRig = svg => { rigs.push(rig(svg)); apply(POSES[0]); }; apply(POSES[0]); return; }

    // [pose, hold ms] — idle glides between these; hover snaps through `blink`
    const idle  = [[0, 1900], [1, 1100], [0, 1300], [2, 900], [0, 1600], [1, 700], [2, 800]];
    const blink = [[1, 130], [0, 130], [2, 130], [0, 130]];
    const TWEEN = 550;
    let cur = POSES[0], seq = idle, i = 0, timer = 0, raf = 0;
    function glideTo(target, done) {
      cancelAnimationFrame(raf);
      const from = cur, t0 = performance.now();
      (function step(now) {
        const t = Math.min((now - t0) / TWEEN, 1);
        cur = mix(from, target, ease(t)); apply(cur);
        if (t < 1) raf = requestAnimationFrame(step); else done();
      })(t0);
    }
    function next() {
      const [pose, hold] = seq[i % seq.length]; i++;
      if (seq === blink) { cancelAnimationFrame(raf); cur = POSES[pose]; apply(cur); timer = setTimeout(next, hold); }
      else glideTo(POSES[pose], () => { timer = setTimeout(next, hold); });
    }
    const swap = s => { clearTimeout(timer); cancelAnimationFrame(raf); seq = s; i = 0; next(); };
    const hoverable = node => {
      node.addEventListener('pointerenter', () => swap(blink));
      node.addEventListener('pointerleave', () => swap(idle));
    };
    hoverable(el);
    addLogoRig = (svg, host) => { rigs.push(rig(svg)); apply(cur); hoverable(host || svg); };
    apply(cur);
    timer = setTimeout(next, 1200);
  })();

  // ── PROJECTS ─────────────────────────────────────────────────
  const PROJECTS = [
    {
      title: 'Pizza Wizard', cat: 'UX/UI — Ordering kiosk', img: 'pw-logo.png', fit: 'contain',
      bg: 'pw-bg.png',   // brand pattern behind the logo in the case study
      // Case study, top to bottom. Each section: title, body (paragraphs), optional
      // items (label + text rows), optional images. Images are either a file —
      // { src: 'file.png', caption: '…' } — or a placeholder box — { ph: 'what goes here' }.
      // Add `ratio: '16/9'` to a placeholder to change its shape; `cols: 2` puts a section's images side by side.
      sections: [
        {
          title: 'The Brief',
          body: ["Design a self-serve ordering kiosk for a brand."],
          images: [{ src: 'pizza-wizard/brief-splash.jpg', caption: 'The kiosk’s splash screen: “Mmmm Pizza!”' }],
        },
        {
          title: 'Brainstorm', layout: 'split',
          body: ["I started with research at a real, installed kiosk, walking the entire order-to-checkout flow and scoring it against Nielsen's 10 usability heuristics to see what held up and what didn't. That audit set the baseline before a single screen was drawn: what actually makes a touchscreen ordering flow fast, versus what just looks fast."],
          images: [{ src: 'pizza-wizard/brainstorm-score-scale.png', caption: 'Each of Nielsen’s 10 heuristics scored 0 to 4.' }],
        },
        {
          title: 'Timeline',
          body: ["A four-month project, with a new step each week, from competitive research through to animated compositions."],
          items: [
            ['01', 'Research'],
            ['02', 'Wireframes and work flows'],
            ['03', 'Style guide'],
            ['04', 'Grid layout'],
            ['05', 'Compositions'],
          ],
        },
        {
          title: 'Scope',
          body: ["Everything needed to make this kiosk work."],
          items: [
            ['Hardware', "I simulated what the kiosk would look like and where it would be placed, based on customer flow."],
            ['Content', "I used Pizza Wizard's current menu and items, and added restrictions and limits on orders."],
            ['Functionality', "I researched the user flow, including accessibility, item removal, and error prevention."],
          ],
          cols: 2,
          images: [
            { src: 'pizza-wizard/scope-console-guide.jpg', caption: 'Console guide: a 22" screen on the counter, next to the cashier and pizza display.' },
            { src: 'pizza-wizard/scope-3d-render.jpg', caption: '3D render of the kiosks in the restaurant.' },
          ],
        },
        {
          title: 'Workflow',
          body: ["I mapped out the user's journey through the kiosk."],
          images: [
            { src: 'pizza-wizard/workflow-main.png', caption: 'Main flow.' },
            { src: 'pizza-wizard/workflow-checkout.png', caption: 'Checkout flow.' },
          ],
        },
        {
          title: 'Mockups',
          items: [
            ['Physical', "I modeled every element to scale to get a better sense of sizing."],
            ['Virtual', "I made a virtual mockup to see how the kiosk might look in the restaurant."],
          ],
          cols: 2,
          images: [
            { src: 'pizza-wizard/mockup-physical.jpg', caption: 'Physical mockup: type, buttons and keypad printed to scale.' },
            { src: 'pizza-wizard/mockup-3d-render.jpg', caption: 'Virtual mockup in the restaurant.' },
          ],
        },
        {
          title: 'Wireframes',
          body: ["I laid out the user flow and the features users can interact with."],
          images: [
            { src: 'pizza-wizard/wireframe-main-menu.png', caption: 'Main menu wireframe, annotated.' },
            { src: 'pizza-wizard/wireframe-error-prevention.png', caption: 'Error prevention: confirming before an item is removed from the bag.' },
          ],
        },
        {
          title: 'Style Guide',
          body: ["A guide to how the kiosk is styled, built on a design system with annotations for every detail."],
          cols: 2,
          images: [
            { src: 'pizza-wizard/style-iconography.png', caption: 'Iconography' },
            { src: 'pizza-wizard/style-color.png', caption: 'Color palette' },
            { src: 'pizza-wizard/style-typography.png', caption: 'Typography' },
            { src: 'pizza-wizard/style-buttons.png', caption: 'Buttons' },
          ],
        },
        {
          title: 'Final Design',
          cols: 2,
          images: [
            { src: 'pizza-wizard/final-loading.png', caption: 'Loading: “Casting up some pizza.”' },
            { src: 'pw-menu.png', caption: 'Menu' },
            { src: 'pw-item-select.png', caption: 'Item select, with required choices' },
            { src: 'pizza-wizard/final-order-complete.png', caption: 'Order complete: receipt options' },
          ],
        },
        {
          title: 'Reflection',
          body: [
            "Effective UX is built on comprehensive systems that balance creativity, accessibility, and real-world constraints.",
            "As a designer, this project taught me how to adapt. It pushed me to think critically about how people interact with digital kiosks in public spaces and retail settings, and about the limitations different users bring with them. I explored everything from systems thinking and UX workflow logic to visual hierarchy, accessibility, and motion as a storytelling tool.",
            "This project challenged me to design a kiosk experience that was imaginative, functional, and grounded in real-world constraints. Along the way, I deepened my understanding of how to shape user flows, design with intent, and build systems that feel cohesive from start to finish. Through every stage of research, ideation, documentation, and refinement, I kept the end user in mind. In the end, it was each step of the process, not just the polished outcome, that taught me the most.",
          ],
        },
      ],
    },
    {
      title: 'Mofuda', cat: 'Interactive — Virtual pet', img: 'mofuda.webp', fit: 'contain',
      sections: [
        {
          title: 'Overview', layout: 'statement',
          body: ["Mofuda is a virtual pet in the spirit of a Tamagotchi."],
        },
        {
          title: 'The Object', layout: 'split',
          body: ["The handheld is a carved-wood body with a single round green button, leaf-and-blossom etching, and a paper tag on a loop."],
          images: [{ ph: 'Handheld: front and back', ratio: '4/5' }],
        },
        {
          title: 'The Game', layout: 'media-first', cols: 3,
          images: [{ ph: 'Game screen: the bear', ratio: '3/4' }, { ph: 'Health meter', ratio: '3/4' }, { ph: 'Home screen', ratio: '3/4' }],
          body: ["Its screen runs a 3D game where you look after a bear in a red daruma suit, with a health meter, sound, and a home button."],
        },
        {
          title: 'Process', cols: 2,
          body: [{ ph: 'Process text: sketches, modeling the body, building the game.' }],
          images: [{ ph: 'Sketches' }, { ph: 'Prototype / build' }],
        },
        {
          title: 'Reflection',
          body: [{ ph: 'Reflection text: what you learned making Mofuda.' }],
        },
      ],
    },
    {
      title: 'Digital ID', cat: 'UX/UI — Mobile app', img: 'digital-id.png', fit: 'contain',
      sections: [
        {
          title: 'Overview', layout: 'statement',
          body: ["A digital driver's licence for the phone."],
        },
        {
          title: 'Research',
          body: [{ ph: 'Research text: who uses it, where, and what a physical licence gets wrong.' }],
          images: [{ ph: 'Research / existing licences', ratio: '16/9' }],
        },
        {
          title: 'Hierarchy', layout: 'split',
          body: ["The holder's photo and name lead the screen, with licence number, class, restrictions, and endorsements grouped underneath, then personal details and signature."],
          images: [{ ph: 'ID screen', ratio: '9/16' }],
        },
        {
          title: 'Three Tabs', cols: 3,
          items: [
            ['ID', "The licence itself."],
            ['Barcode', "A scannable barcode."],
            ['Age check', "Age verification."],
          ],
          images: [{ ph: 'ID tab', ratio: '9/16' }, { ph: 'Barcode tab', ratio: '9/16' }, { ph: 'Age verification tab', ratio: '9/16' }],
        },
        {
          title: 'Final Design', layout: 'media-first',
          images: [{ ph: 'Final screens', ratio: '16/9' }],
          body: [{ ph: 'Final design text.' }],
        },
        {
          title: 'Reflection',
          body: [{ ph: 'Reflection text.' }],
        },
      ],
    },
    {
      title: 'Bacteria Per Pixel', cat: 'Graphic — Image', img: 'bacteria-per-pixel.webp',
      sections: [
        {
          title: 'Overview', layout: 'statement',
          body: ["Bacteria Per Pixel is a graphic piece built from bacteria."],
        },
        {
          title: 'The Piece', layout: 'media-first',
          images: [{ src: 'bacteria-per-pixel.webp', caption: 'Bacteria Per Pixel, full image.' }],
          body: [{ ph: 'Concept text: where the idea came from.' }],
        },
        {
          title: 'Form', layout: 'split',
          body: ["The image is broken into flat acid-green, white, and black shapes."],
          images: [{ ph: 'Colour / shape breakdown', ratio: '1/1' }],
        },
        {
          title: 'Type as Texture', cols: 2,
          body: ["Lines from a bacterial strain list, species names and culture-collection numbers, are set through it as texture."],
          images: [{ ph: 'Detail: strain list type', ratio: '1/1' }, { ph: 'Detail: culture numbers', ratio: '1/1' }],
        },
        {
          title: 'Process',
          body: [{ ph: 'Process text: tools, iterations, print or screen output.' }],
          images: [{ ph: 'Process / iterations', ratio: '16/9' }],
        },
      ],
    },
    {
      title: 'Hanafuda Cards', cat: 'Graphic — Card deck', img: 'Darumaoslo.png', fit: 'contain',
      sections: [
        {
          title: 'Overview', layout: 'statement',
          body: ["A hanafuda-inspired reimagining of the standard 52-card deck."],
        },
        {
          title: 'Suits', layout: 'media-first', cols: 3,
          images: [{ ph: 'Cherry blossom suit', ratio: '5/7' }, { ph: 'Plum blossom suit', ratio: '5/7' }, { ph: 'Fern suit', ratio: '5/7' }],
          body: ["Each suit is re-skinned around a Japanese floral motif (cherry blossom, plum blossom, fern) in place of the usual clubs and spades."],
        },
        {
          title: 'Face Cards', layout: 'split',
          body: ["Every face card pairs two daruma dolls instead of a royal portrait."],
          images: [{ ph: 'Daruma face card', ratio: '5/7' }],
        },
        {
          title: 'Bilingual Ranks',
          body: ["Rank markers run bilingual, Western digits alongside kanji, so the whole deck stays legible while reading as unmistakably hanafuda."],
          images: [{ ph: 'Rank marker detail', ratio: '16/9' }],
        },
        {
          title: 'The Set',
          items: [
            ['Cards', "Full 54-card set."],
            ['Illustration', "Suits, face cards, and daruma."],
            ['System', "Suit and color system."],
            ['Print', "Print-ready layout."],
          ],
          images: [{ ph: 'Full deck spread', ratio: '16/9' }],
        },
        {
          title: 'In Progress',
          body: ["The remaining suits and the box design are in progress."],
          images: [{ ph: 'Box design (coming soon)', ratio: '16/9' }],
        },
      ],
      tag: 'WIP: remaining suits + box design in progress',
    },
  ];

  // social links without an address yet: don't jump to the top when clicked
  document.querySelectorAll('a[data-soon]').forEach(a => a.addEventListener('click', e => {
    if (a.getAttribute('href') === '#') e.preventDefault();
  }));

  const now = new Date();
  document.getElementById('today').textContent =
    `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;

  // ══════════════════════════════════════════════════════════════
  // HERO — iridescent liquid blob → speckle → halftone → pixels
  // ══════════════════════════════════════════════════════════════
  const hero = document.getElementById('hero');
  const blobCv = document.getElementById('blob');
  const pctEl = document.getElementById('pct');
  const pctFill = document.getElementById('pct-fill');
  let heroProgress = 0, siteDark = 0;   // siteDark: 0 = paper, 1 = black, across the whole page
  let introP = 0;                        // 0 = just the big blob, 1 = normal size with the UI in
  const root = document.documentElement;

  // once the intro has played, its scroll space is removed (and the scroll position moved up by the
  // same amount, so nothing jumps): scrolling back up stops at the settled hero instead of the
  // full-screen intro view. A reload plays the intro again.
  let introDone = false;
  function finishIntro() {
    introDone = true;
    const y = scrollY - innerHeight * 0.9;
    root.style.scrollBehavior = 'auto';
    root.classList.add('intro-done');            // the hero loses its 90vh intro stretch (styles.css)
    scrollTo(0, Math.max(0, y));
    root.style.scrollBehavior = '';
  }
  function readHeroProgress() {
    if (!introDone && -hero.getBoundingClientRect().top >= innerHeight * 0.9) finishIntro();
    const r = hero.getBoundingClientRect();
    const scrolled = -r.top, introSpan = introDone ? 0 : innerHeight * 0.9;
    introP = introDone ? 1 : clamp(scrolled / introSpan, 0, 1);
    const span = r.height - innerHeight - introSpan;
    heroProgress = span > 0 ? clamp((scrolled - introSpan) / span, 0, 1) : 0;
    const uiIn = smooth(0.55, 1, introP);
    root.style.setProperty('--ui-in', uiIn.toFixed(3));
    root.classList.toggle('intro', uiIn < 0.5);
    // stay paper through the hero and the work wall, then go dark quickly
    // once the wall's bottom edge rises past three-quarters of the screen
    const work = document.getElementById('work');
    const darkStart = work.offsetTop + work.offsetHeight - innerHeight * 0.75;
    siteDark = smooth(darkStart, darkStart + innerHeight * 0.7, scrollY);
    root.style.setProperty('--bg', `rgb(${PAPER.map((c, k) => lerp(c, INK[k], siteDark) | 0)})`);
    root.classList.toggle('dark', siteDark > 0.5);
    pctEl.textContent = `(${pad3(Math.round(heroProgress * 100))})`;
    pctFill.style.width = `${heroProgress * 100}%`;
  }
  addEventListener('scroll', readHeroProgress, { passive: true });
  addEventListener('resize', readHeroProgress);
  readHeroProgress();

  // auto-advance: if nobody has scrolled a few seconds after opening, glide
  // to the end of the intro (blob settles, UI fades in). Any wheel / touch /
  // key / click cancels it; just moving the cursor over the blob doesn't.
  (function autoIntro() {
    if (scrollY > 2) return;
    let cancelled = false, raf = 0;
    const cancel = () => { cancelled = true; cancelAnimationFrame(raf); };
    const opts = { passive: true, once: true };
    ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(ev => addEventListener(ev, cancel, opts));
    setTimeout(() => {
      if (cancelled || scrollY > 2) return;
      const target = innerHeight * 0.9;   // matches introSpan in readHeroProgress
      if (REDUCED) { scrollTo(0, target); return; }
      root.style.scrollBehavior = 'auto';   // we drive every frame ourselves
      const t0 = performance.now(), dur = 1100;
      (function step(now) {
        if (cancelled || introDone) { root.style.scrollBehavior = ''; return; }   // done: finishIntro has moved the page
        const t = Math.min((now - t0) / dur, 1);
        const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;   // ease in-out cubic
        scrollTo(0, target * e);
        if (t < 1) raf = requestAnimationFrame(step);
        else root.style.scrollBehavior = '';
      })(t0);
    }, 1000);
  })();

  // ══════════════════════════════════════════════════════════════
  // HERO — liquid-chrome metaballs. JS runs the physics (a cohesive
  // clump that churns, plus stray droplets); the shader sums a
  // finite-support field and shades the surface like holographic chrome.
  // ══════════════════════════════════════════════════════════════
  const MAX_BALLS = 40;
  const FRAG = `
    precision highp float;
    uniform vec2  uRes;
    uniform float uTime;
    uniform float uScroll;
    uniform float uDpr;
    uniform vec3  uBalls[${MAX_BALLS}];   // x, y, r in canvas px (y up)
    uniform int   uCount;
    uniform vec2  uCenter;   // clump centre, canvas px (y up)
    uniform float uSize;     // layout scale, canvas px
    uniform vec3  uPaper;

    // Ashima simplex noise (surface ripples)
    vec3 mod289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x){ return mod289(((x * 34.0) + 1.0) * x); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
      m = m * m; m = m * m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
      vec3 g;
      g.x  = a0.x  * x0.x   + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }
    // sin-free hash (Dave Hoskins) — the classic fract(sin()) hash bands into diagonal lines on GPUs
    float hash(vec2 p){
      vec3 p3 = fract(vec3(p.xyx) * 0.1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }
    // soft poster palette: pink → lavender → periwinkle → mint → butter → back
    vec3 pal(float h){
      h = fract(h) * 5.0;
      vec3 a = vec3(1.00, 0.42, 0.72), b = vec3(0.70, 0.60, 1.00);
      if (h >= 1.0) { a = vec3(0.70, 0.60, 1.00); b = vec3(0.42, 0.56, 1.00); }
      if (h >= 2.0) { a = vec3(0.42, 0.56, 1.00); b = vec3(0.58, 0.95, 0.82); }
      if (h >= 3.0) { a = vec3(0.58, 0.95, 0.82); b = vec3(1.00, 0.93, 0.50); }
      if (h >= 4.0) { a = vec3(1.00, 0.93, 0.50); b = vec3(1.00, 0.42, 0.72); }
      float f = fract(h); f = f * f * (3.0 - 2.0 * f);
      return mix(a, b, f);
    }

    // metaball field: each ball adds (1 - d²/R²)³ inside R = 1.645r, so a lone
    // ball's surface (f = 0.25) sits exactly at r and droplets stay separate
    // until they get close — then they snap together
    const float T = 0.25;
    float field(vec2 p, out vec2 grad){
      float f = 0.0;
      grad = vec2(0.0);
      for (int i = 0; i < ${MAX_BALLS}; i++){
        if (i >= uCount) break;
        vec3 b = uBalls[i];
        vec2 d = p - b.xy;
        float R2 = b.z * b.z * 2.706;
        float q = dot(d, d) / R2;
        if (q < 1.0){
          float w = 1.0 - q;
          f += w * w * w;
          grad += -6.0 * w * w * d / R2;
        }
      }
      return f;
    }

    // soft pastel orbs drifting behind the glass (premultiplied colour + alpha).
    // blur widens their edge — crisp outside, frosted when seen through the glass
    vec3 orbCol(int i){
      if (i == 0) return vec3(1.00, 0.45, 0.74);   // pink
      if (i == 1) return vec3(0.42, 0.56, 1.00);   // periwinkle
      if (i == 2) return vec3(0.52, 0.93, 0.80);   // mint
      return vec3(1.00, 0.88, 0.48);               // butter
    }
    vec4 orbs(vec2 p, float blur){
      vec4 acc = vec4(0.0);
      float t = uTime * 0.09;
      for (int i = 0; i < 4; i++){
        float fi = float(i);
        vec2 c = uCenter + uSize * vec2(0.17 * cos(t + fi * 1.9), 0.13 * sin(t * 1.3 + fi * 2.4));
        float r = uSize * (0.075 + 0.02 * mod(fi * 3.0, 4.0) / 3.0);
        float d = length(p - c);
        float a = 1.0 - smoothstep(r - blur, r + blur, d);
        vec3 col = mix(orbCol(i), orbCol(i) * 0.82 + 0.16, clamp(d / r, 0.0, 1.0));   // gentle radial
        acc = vec4(acc.rgb * (1.0 - a) + col * a, acc.a * (1.0 - a) + a);
      }
      return acc;
    }

    // frosted glass metaball over the orbs; returns premultiplied colour + alpha,
    // soft = coverage for the halftone stages
    vec4 scene(vec2 frag, out float soft){
      vec4 bg = orbs(frag, 1.0 * uDpr);
      vec2 g;
      float f = field(frag, g);
      float gl = length(g);
      soft = max(smoothstep(T * 0.6, T + 0.35, f), bg.a);
      if (f < T * 0.5) return bg;
      float a = clamp((f - T) / max(gl * uDpr, 1e-4) + 0.5, 0.0, 1.0);   // 1px antialiased edge

      // puffy normal: tilts hard at the rim, faces the viewer deep inside
      float edge = 1.0 - smoothstep(T, T + 1.1, f);
      vec2 out2 = -g / (gl + 0.002 / uDpr);                // outward direction
      vec2 nxy = out2 * (0.06 + 0.9 * edge * edge * (3.0 - 2.0 * edge));
      vec3 n = normalize(vec3(nxy, sqrt(max(0.0, 1.0 - dot(nxy, nxy)))));
      vec3 R = reflect(vec3(0.0, 0.0, -1.0), n);
      float fres = pow(1.0 - n.z, 2.0);

      // what's behind, bent by the curved surface and frosted
      vec4 bb = orbs(frag - nxy * uSize * 0.07, uSize * 0.09);
      vec3 behind = uPaper * (1.0 - bb.a) + bb.rgb;
      vec3 col = mix(behind, vec3(1.0), 0.34 + 0.25 * fres);   // milky white tint, whiter at the rims
      col *= mix(vec3(0.93, 0.94, 0.98), vec3(1.02), smoothstep(-0.7, 0.6, R.y));

      // light from the upper left: bright hairline border, soft inner glow
      float dpx = (f - T) / max(gl, 1e-4) / uDpr;             // distance inside the edge, CSS px
      float lit = 0.5 + 0.5 * dot(out2, normalize(vec2(-0.6, 0.8)));
      float border = 1.0 - smoothstep(0.6, 2.2, dpx);
      float glow = exp(-dpx / 16.0);
      col += border * (0.25 + 0.6 * lit) + glow * 0.1 * lit;
      col -= glow * 0.05 * (1.0 - lit);                        // faint shade on the far side
      float key = smoothstep(0.94, 0.98, dot(R, normalize(vec3(-0.4, 0.55, 0.73))));
      col += key * 0.35;

      vec3 glass = clamp(col, 0.0, 1.0);
      return vec4(glass * a + bg.rgb * (1.0 - a), a + bg.a * (1.0 - a));
    }

    void main(){
      vec2 frag = gl_FragCoord.xy;
      float s = uScroll;
      float k = smoothstep(0.04, 0.22, s);               // liquid → halftone crossfade
      vec3 col = vec3(0.0);                               // premultiplied
      float alpha = 0.0;
      float soft;

      if (k < 1.0) {
        vec4 b = scene(frag, soft);
        col += b.rgb * (1.0 - k);
        alpha += b.a * (1.0 - k);
      }
      if (k > 0.0) {
        float cell = mix(5.0, 30.0, smoothstep(0.1, 1.0, s)) * uDpr;
        vec2 g = (floor(frag / cell) + 0.5) * cell;
        vec4 hb = scene(g, soft);
        // cells just outside the glass edge carry no colour yet — give them the glass tint, not black
        vec3 hcol = mix(vec3(0.95, 0.95, 0.99), hb.rgb / max(hb.a, 1e-3), smoothstep(0.0, 0.25, hb.a));
        vec2 f = (frag - g) / cell;
        float sq = smoothstep(0.62, 0.95, s);             // dots harden into pixels
        float dist = mix(length(f), max(abs(f.x), abs(f.y)), sq);
        float rr = mix(0.72, 0.5, sq) * sqrt(soft);
        float aa = 1.2 / cell;
        float dotm = 1.0 - smoothstep(rr - aa, rr + aa, dist);
        col += hcol * dotm * k;
        alpha += dotm * k;
      }
      gl_FragColor = vec4(col, alpha);
    }`;

  function startHeroShader() {
    const gl = blobCv.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: true });
    if (!gl) { blobCv.classList.add('fallback'); return; }
    const compile = (type, src) => {
      const sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
      return sh;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }'));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = n => gl.getUniformLocation(prog, n);
    const uRes = U('uRes'), uTime = U('uTime'), uScroll = U('uScroll'), uDpr = U('uDpr'),
          uBalls = U('uBalls'), uCount = U('uCount'),
          uCenter = U('uCenter'), uSize = U('uSize'), uPaper = U('uPaper');

    // ── physics, in CSS px (y down) ──
    let W = 0, H = 0, dpr = 1, size = 0, C = { x: 0, y: 0 };
    // render scale; steps down (1 → 0.75 → 0.6) on machines that can't keep up
    let quality = 1, slow = 0;
    function setQuality(q) {
      quality = dpr = q;
      blobCv.width = Math.round(W * dpr); blobCv.height = Math.round(H * dpr);
      gl.viewport(0, 0, blobCv.width, blobCv.height);
    }
    let balls = [];
    const rnd = (a, b) => a + Math.random() * (b - a);
    function init() {
      const cores = 24, drops = 14;
      balls = [];
      for (let i = 0; i < cores + drops; i++) {
        const core = i < cores;
        const ang = rnd(0, Math.PI * 2);
        // cores: a wide spread of sizes so the outline gets lobes and bumps
        const dist = core ? Math.pow(Math.random(), 0.7) * size * 0.2 : size * rnd(0.28, 0.4);
        const b = {
          core,
          r: core ? size * (Math.random() < 0.3 ? rnd(0.03, 0.05) : rnd(0.06, 0.1)) : size * rnd(0.01, 0.026),
          ang, dist,                                  // home, in polar around the centre
          spin: core ? 0.05 : rnd(0.06, 0.16) * (Math.random() < 0.5 ? -1 : 1),
          ph: rnd(0, 100), wf: rnd(0.2, 0.5),
          vx: 0, vy: 0,
        };
        b.x = C.x + Math.cos(ang) * dist; b.y = C.y + Math.sin(ang) * dist;
        balls.push(b);
      }
    }

    function resize() {
      dpr = quality;   // the surface is smooth; retina density just burns GPU
      W = blobCv.clientWidth; H = blobCv.clientHeight;
      blobCv.width = Math.round(W * dpr); blobCv.height = Math.round(H * dpr);
      gl.viewport(0, 0, blobCv.width, blobCv.height);
      // desktop gets a bigger clump; tablets/phones keep the fitted size
      const desktop = W >= 1000 && W > H;
      size = desktop ? Math.min(H * 1.8, W * 0.78) : Math.min(H, W * 0.95);
      C = desktop ? { x: W * 0.6, y: H * 0.48 }
        : W > H   ? { x: W * 0.63, y: H * 0.44 }
        :           { x: W * 0.5,  y: H * 0.36 };
      init();
    }
    addEventListener('resize', resize); resize();

    // pointer: a knife that shoves balls off its path, harder the faster it moves
    const ptr = { x: 0, y: 0, px: 0, py: 0, seen: false, moved: false };
    const view = { x: 0, y: 0, z: 1 };   // where the clump is drawn: centre + zoom
    let lastInput = -1e9;
    hero.addEventListener('pointermove', e => {
      const r = blobCv.getBoundingClientRect();
      // screen → physics space (undo the intro zoom)
      ptr.x = C.x + (e.clientX - r.left - view.x) / view.z;
      ptr.y = C.y + (e.clientY - r.top - view.y) / view.z;
      if (!ptr.seen) { ptr.px = ptr.x; ptr.py = ptr.y; ptr.seen = true; }
      ptr.moved = true;
      lastInput = performance.now();
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { ptr.seen = false; });

    function physics(dt, time) {
      // cursor segment since last frame
      let sx = 0, sy = 0, ex = 0, ey = 0, pvx = 0, pvy = 0, cutting = false;
      if (ptr.seen && ptr.moved) {
        sx = ptr.px; sy = ptr.py; ex = ptr.x; ey = ptr.y;
        pvx = (ex - sx) / dt; pvy = (ey - sy) / dt;
        cutting = Math.hypot(ex - sx, ey - sy) > 0.5;
        ptr.px = ptr.x; ptr.py = ptr.y; ptr.moved = false;
      }
      const speed = Math.min(Math.hypot(pvx, pvy), 4000);
      const damp = Math.exp(-2.6 * dt);

      for (const b of balls) {
        // home: slowly churning (cores) or orbiting (droplets), with a little wander
        const a = b.ang + time * b.spin;
        const wob = REDUCED ? 0 : size * 0.035;
        const hx = C.x + Math.cos(a) * b.dist + Math.sin(time * b.wf + b.ph) * wob;
        const hy = C.y + Math.sin(a) * b.dist + Math.cos(time * b.wf * 1.3 + b.ph) * wob;
        const k = b.core ? 3.2 : 0.9;
        b.vx += (hx - b.x) * k * dt;
        b.vy += (hy - b.y) * k * dt;

        if (cutting) {
          const dx = ex - sx, dy = ey - sy, L2 = dx * dx + dy * dy;
          const t = clamp(((b.x - sx) * dx + (b.y - sy) * dy) / L2, 0, 1);
          const qx = b.x - (sx + dx * t), qy = b.y - (sy + dy * t);
          const d = Math.hypot(qx, qy) || 0.001;
          // gentle: a slow pass barely nudges, only a real swipe splits the mass
          const reach = 12 + b.r * 0.5;
          if (d < reach) {
            const push = (1 - d / reach);
            const kick = push * (25 + speed * 0.14);
            b.vx += qx / d * kick + pvx * push * 0.04;
            b.vy += qy / d * kick + pvy * push * 0.04;
          }
        }
      }
      // cores keep their volume: soft repulsion when they crowd
      for (let i = 0; i < balls.length; i++) {
        const A = balls[i];
        for (let j = i + 1; j < balls.length; j++) {
          const B = balls[j];
          const dx = B.x - A.x, dy = B.y - A.y;
          // overlap heavily (so the fields merge into one mass) but don't collapse to a point
          const min = (A.r + B.r) * 0.4;
          const d2 = dx * dx + dy * dy;
          if (d2 >= min * min || d2 < 1e-6) continue;
          const d = Math.sqrt(d2), f = (min - d) / d * 3.0 * dt;
          const wa = B.r / (A.r + B.r), wb = A.r / (A.r + B.r);
          A.vx -= dx * f * wa * 60; A.vy -= dy * f * wa * 60;
          B.vx += dx * f * wb * 60; B.vy += dy * f * wb * 60;
        }
      }
      for (const b of balls) {
        b.vx *= damp; b.vy *= damp;
        b.x += b.vx * dt; b.y += b.vy * dt;
      }
    }

    let visible = true;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(blobCv);
    const buf = new Float32Array(MAX_BALLS * 3);
    const t0 = performance.now();
    let last = t0;
    (function frame(now) {
      requestAnimationFrame(frame);
      if (!visible) { last = now; return; }
      // 60fps while the cursor is stirring (even on 120Hz screens), 30fps otherwise
      const active = now - lastInput < 2500;
      const budget = active ? 1000 / 60 : 1000 / 30;
      if (now - last < budget - 2) return;
      // sustained long frames → render the glass at a lower resolution
      slow = now - last > budget * 1.7 ? slow + 1 : Math.max(0, slow - 1);
      if (slow > 45 && quality > 0.6) { setQuality(quality > 0.8 ? 0.75 : 0.6); slow = 0; }
      const dt = Math.min((now - last) / 1000, 1 / 20) || 1 / 60;
      last = now;
      const time = REDUCED ? 8.0 : (now - t0) / 1000;
      // intro: large and centred on open, easing to its normal size/spot on scroll
      const ez = introP * introP * (3 - 2 * introP);
      const Z0 = W >= 1000 && W > H ? 1.6 : 1.35;
      view.z = lerp(Z0, 1, ez);
      view.x = lerp(W / 2, C.x, ez);
      view.y = lerp(H / 2, C.y, ez);
      // two substeps keep fast swipes stable
      physics(dt / 2, time); physics(dt / 2, time);

      balls.forEach((b, i) => {
        const vx = view.x + (b.x - C.x) * view.z, vy = view.y + (b.y - C.y) * view.z;
        buf[i * 3] = vx * dpr; buf[i * 3 + 1] = (H - vy) * dpr; buf[i * 3 + 2] = b.r * view.z * dpr;
      });
      gl.uniform3fv(uBalls, buf);
      gl.uniform1i(uCount, balls.length);
      gl.uniform2f(uCenter, view.x * dpr, (H - view.y) * dpr);
      gl.uniform1f(uSize, size * view.z * dpr);
      gl.uniform3f(uPaper, ...PAPER.map(c => c / 255));
      gl.uniform2f(uRes, blobCv.width, blobCv.height);
      gl.uniform1f(uTime, time);
      gl.uniform1f(uScroll, heroProgress);
      gl.uniform1f(uDpr, dpr);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    })(t0);
  }
  // HERO: Dimensional Etch running on its own (etch/etch.html?embed=1: simulated people drawing
  // on the wireframe). index.html?hero=blob brings back the glass blob instead. It follows the same
  // intro (starts big and centred, settles to the right); scrolling through the dissolve then
  // flies the Etch camera into the shape (sent as a message, so it stays sharp). It sits on a
  // fixed layer behind the page, so it bleeds into Projects and Work and fades as that title rises.
  const HERO_ETCH = new URLSearchParams(location.search).get('hero') !== 'blob';
  function startEtchHero() {
    blobCv.style.display = 'none';
    const fr = document.createElement('iframe');
    fr.className = 'hero-etch';
    fr.src = 'etch/etch.html?embed=1&people=8';
    fr.title = 'Dimensional Etch, drawing on its own';
    fr.setAttribute('aria-hidden', 'true');
    fr.tabIndex = -1;
    document.body.prepend(fr);   // first in the page: fixed behind the hero text and the sections
    const wide = matchMedia('(min-width: 1001px)');
    let sentZoom = -1, sentPause = null;
    const workTitle = document.querySelector('#work .sec-title');
    fr.addEventListener('load', () => { sentZoom = -1; sentPause = null; });   // resend both once it's listening
    (function follow() {
      const settle = smooth(0, 1, introP), dive = smooth(0, 1, heroProgress);
      const scale = lerp(wide.matches ? 1.6 : 1.3, wide.matches ? 1.18 : 1.05, settle);
      // % of the hero: over to the right of the name, and it stays there while the camera zooms in
      const shift = wide.matches ? 17 * settle : 0;
      fr.style.transform = `translateX(${shift}%) scale(${scale})`;
      const zoom = +lerp(1, 1.6, dive * dive).toFixed(3);  // eases in; at 100% the camera is about halfway in, still outside the shape
      if (zoom !== sentZoom && fr.contentWindow) { fr.contentWindow.postMessage({ etchZoom: zoom }, location.origin); sentZoom = zoom; }
      // bleed into the work wall, fading out as its title climbs from the bottom of the screen to the top quarter
      const titleTop = workTitle.getBoundingClientRect().top;
      const fade = smooth(innerHeight * 0.25, innerHeight * 0.95, titleTop);
      fr.style.opacity = fade.toFixed(3);
      const hidden = fade < 0.01;
      if (hidden !== sentPause && fr.contentWindow) {   // stop drawing while it can't be seen
        fr.style.visibility = hidden ? 'hidden' : '';
        fr.contentWindow.postMessage({ etchPause: hidden }, location.origin);
        sentPause = hidden;
      }
      requestAnimationFrame(follow);
    })();
  }
  if (HERO_ETCH) startEtchHero();
  else try { startHeroShader(); } catch (err) { console.error(err); blobCv.classList.add('fallback'); }
  // the little switch under the date: reload with the other hero (the intro plays again from the top)
  const heroSwitch = document.getElementById('hero-switch');
  heroSwitch.innerHTML = `<span class="dot" aria-hidden="true"></span>${HERO_ETCH ? 'Show blob' : 'Show etch'}`;
  heroSwitch.setAttribute('aria-label', HERO_ETCH ? 'Switch the hero to the glass blob' : 'Switch the hero to Dimensional Etch');
  heroSwitch.addEventListener('click', () => {
    const u = new URL(location.href);
    if (HERO_ETCH) u.searchParams.set('hero', 'blob'); else u.searchParams.delete('hero');
    location.replace(u.href);
  });

  // ══════════════════════════════════════════════════════════════
  // WORK — halftone posters with a full-colour pixel lens
  // ══════════════════════════════════════════════════════════════
  const wall = document.getElementById('wall');
  const tagEl = document.getElementById('tag');

  // draw img into a w×h box, cover-fit
  function drawCover(ctx, img, w, h) {
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const s = Math.max(w / iw, h / ih);
    const dw = iw * s, dh = ih * s;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  }
  // contain-fit with padding (for cut-out characters on transparent bgs)
  function drawContain(ctx, img, w, h, padFrac) {
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const s = Math.min(w * (1 - padFrac) / iw, h * (1 - padFrac) / ih);
    const dw = iw * s, dh = ih * s;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  }

  class HalftonePoster {
    constructor(card, project) {
      this.card = card;
      this.cv = card.querySelector('canvas');
      this.ctx = this.cv.getContext('2d');
      this.cell = 9;
      this.mx = -1e4; this.my = -1e4;
      this.lens = 0; this.lensTarget = 0;
      this.running = false;
      this.contain = project.fit === 'contain';   // cut-outs and device shots sit whole inside the poster
      this.img = new Image();
      this.img.onload = () => this.build();
      this.img.src = project.img;

      card.addEventListener('pointermove', e => {
        const r = this.cv.getBoundingClientRect();
        this.mx = e.clientX - r.left; this.my = e.clientY - r.top;
        this.lensTarget = 1; this.kick();
      });
      card.addEventListener('pointerleave', () => { this.lensTarget = 0; this.kick(); });
      new ResizeObserver(() => this.build()).observe(this.cv);
    }
    build() {
      if (!this.img.naturalWidth) return;
      const w = this.cv.clientWidth, h = this.cv.clientHeight;
      if (!w || !h) return;
      this.dpr = Math.min(devicePixelRatio || 1, 2);
      this.cv.width = Math.round(w * this.dpr); this.cv.height = Math.round(h * this.dpr);
      this.w = w; this.h = h;
      this.cols = Math.ceil(w / this.cell); this.rows = Math.ceil(h / this.cell);
      // two-step downsample so each cell gets an averaged colour, not a single noisy pixel
      const mid = document.createElement('canvas');
      mid.width = this.cols * 4; mid.height = this.rows * 4;
      const mctx = mid.getContext('2d');
      mctx.imageSmoothingQuality = 'high';
      (this.contain ? drawContain : drawCover)(mctx, this.img, mid.width, mid.height, 0.12);
      const small = document.createElement('canvas');
      small.width = this.cols; small.height = this.rows;
      const sctx = small.getContext('2d', { willReadFrequently: true });
      sctx.imageSmoothingQuality = 'high';
      sctx.drawImage(mid, 0, 0, this.cols, this.rows);
      const d = sctx.getImageData(0, 0, this.cols, this.rows).data;
      const n = this.cols * this.rows;
      this.ink = new Float32Array(n);
      const lums = new Float32Array(n);
      for (let i = 0; i < n; i++) lums[i] = (0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]) / 255;
      // the real image at full (retina) resolution, same fit as the dots, for the hover lens
      this.full = document.createElement('canvas');
      this.full.width = this.cv.width; this.full.height = this.cv.height;
      const fctx = this.full.getContext('2d');
      fctx.imageSmoothingQuality = 'high';
      fctx.fillStyle = '#fff';
      fctx.fillRect(0, 0, this.full.width, this.full.height);
      (this.contain ? drawContain : drawCover)(fctx, this.img, this.full.width, this.full.height, 0.12);
      this.lensCv = document.createElement('canvas');
      this.lensCv.width = this.cv.width; this.lensCv.height = this.cv.height;
      // per-image levels: stretch the 4th–96th percentile of opaque cells to full range,
      // so dark or busy images don't print as a solid slab of ink
      const opaque = [];
      for (let i = 0; i < n; i++) if (d[i * 4 + 3] > 128) opaque.push(lums[i]);
      opaque.sort((a, b) => a - b);
      const lo = opaque.length ? opaque[Math.floor(opaque.length * 0.04)] : 0;
      const hi = opaque.length ? opaque[Math.floor(opaque.length * 0.96)] : 1;
      const span = Math.max(0.05, hi - lo);
      // mostly-dark images print as a negative (ink the highlights) so they read as a figure
      // (cut-out objects keep their silhouette instead)
      const negative = !this.contain && opaque.length && opaque[opaque.length >> 1] < 0.4;
      for (let i = 0; i < n; i++) {
        const a = d[i * 4 + 3] / 255;
        let lum = clamp((lums[i] - lo) / span, 0, 1);
        if (negative) lum = 1 - lum;
        this.ink[i] = (Math.pow(1 - lum, 1.25) * 0.88 + 0.06) * a;
      }
      this.draw();
    }
    // redraw only while the lens is easing or the pointer is moving
    kick() {
      this.moved = true;
      if (this.running) return;
      this.running = true;
      const step = () => {
        this.lens = REDUCED ? this.lensTarget : lerp(this.lens, this.lensTarget, 0.14);
        if (Math.abs(this.lens - this.lensTarget) < 0.01) this.lens = this.lensTarget;
        this.draw();
        if (this.lens !== this.lensTarget || this.moved) {
          this.moved = false; requestAnimationFrame(step);
        } else this.running = false;
      };
      requestAnimationFrame(step);
    }
    draw() {
      if (!this.ink) return;
      const { ctx, cell, cols, rows, dpr } = this;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, this.w, this.h);
      // lens: a window onto the real image that breaks up into pixels at its edge.
      // Each grid cell is either a halftone dot or a square of the full-res image —
      // solid near the cursor, then a fixed per-cell dither thins it out toward the rim
      const R = Math.min(this.w, this.h) * 0.36 * this.lens;
      const core = R * 0.5, band = R - core;
      const lensCells = [];
      ctx.fillStyle = `rgb(${BLUE})`;
      ctx.beginPath();
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const cx = (x + 0.5) * cell, cy = (y + 0.5) * cell;
          if (R > 1) {
            const d = Math.hypot(cx - this.mx, cy - this.my);
            if (d < R) {
              const t = (d - core) / band;                  // ≤0 in the core, 1 at the rim
              const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
              if (t <= 0 || n - Math.floor(n) > t) { lensCells.push(x, y); continue; }
            }
          }
          const r = cell * 0.58 * this.ink[y * cols + x];
          if (r < 0.35) continue;
          ctx.moveTo(cx + r, cy);
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
        }
      }
      ctx.fill();
      if (!lensCells.length) return;
      const lc = this.lensCv, lx = lc.getContext('2d');
      lx.globalCompositeOperation = 'source-over';
      lx.clearRect(0, 0, lc.width, lc.height);
      lx.drawImage(this.full, 0, 0);
      lx.globalCompositeOperation = 'destination-in';
      lx.fillStyle = '#000';
      lx.beginPath();
      const c = cell * dpr;
      for (let k = 0; k < lensCells.length; k += 2) lx.rect(lensCells[k] * c, lensCells[k + 1] * c, Math.ceil(c), Math.ceil(c));
      lx.fill();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(lc, 0, 0);
    }
  }

  document.getElementById('work-count').textContent = `(${String(PROJECTS.length).padStart(2, '0')})`;
  document.getElementById('work-range').textContent = `001 — ${pad3(PROJECTS.length)}`;
  wall.style.setProperty('--cols', Math.min(PROJECTS.length, 3));
  const cards = [];
  PROJECTS.forEach((p, i) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Open ${p.title}`);
    card.innerHTML = `
      <div class="card-poster">
        <canvas aria-hidden="true"></canvas>
        <span class="pf pf-name micro">Robert Capron</span>
        <span class="pf pf-num micro num">${pad3(i + 1)}</span>
        <span class="pf pf-vert micro vert">${p.cat}</span>
        ${p.tag ? '<span class="pf pf-tag micro">WIP</span>' : ''}
      </div>
      <div class="card-meta">
        <h3>${p.title}</h3>
        <span class="micro">${p.cat.split('—')[0].trim()}</span>
      </div>`;
    wall.appendChild(card);
    cards[i] = card;
    new HalftonePoster(card, p);
    const open = () => openCase(i);
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    card.addEventListener('pointerenter', () => { tagEl.textContent = `Open ${pad3(i + 1)} ↗`; tagEl.classList.add('on'); });
    card.addEventListener('pointerleave', () => tagEl.classList.remove('on'));
  });
  addEventListener('pointermove', e => {
    tagEl.style.transform = `translate(${e.clientX + 14}px, ${e.clientY + 14}px)`;
  }, { passive: true });

  // ── CASE STUDY ───────────────────────────────────────────────
  const caseEl = document.getElementById('case');
  const $ = id => document.getElementById(id);
  let lastFocus = null;

  const make = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  // an image entry: 'file.png', { src, caption }, or a placeholder { ph, ratio }
  function figure(im, title) {
    const o = typeof im === 'string' ? { src: im } : im;
    const fig = make('figure', 'case-fig');
    if (o.ph) {
      const box = make('div', 'case-ph micro');
      box.append(make('span', null, 'Image'), make('span', null, o.ph));
      box.style.aspectRatio = o.ratio || '4/3';
      fig.appendChild(box);
    } else {
      const img = make('img');
      img.src = o.src; img.alt = o.caption || `${title} screen`; img.loading = 'lazy';
      fig.appendChild(img);
    }
    if (o.caption) fig.appendChild(make('figcaption', null, o.caption));
    return fig;
  }
  // a body entry: a paragraph string, or a placeholder { ph }
  const para = t => typeof t === 'string' ? make('p', null, t) : make('p', 'case-ph-text', t.ph);

  let current = 0;
  // centre the circle on project i's poster, without animating the move
  function setOrigin(i) {
    const r = cards[i].querySelector('.card-poster').getBoundingClientRect();
    caseEl.style.transition = 'none';
    caseEl.style.setProperty('--cx', `${r.left + r.width / 2}px`);
    caseEl.style.setProperty('--cy', `${r.top + r.height / 2}px`);
    caseEl.getBoundingClientRect();   // commit the new centre before the transition comes back
    caseEl.style.transition = '';
  }

  function openCase(i) {
    current = i;
    const p = PROJECTS[i];
    // "next project" swaps content in place — keep focus returning to the original card
    if (!caseEl.classList.contains('open')) lastFocus = document.activeElement;
    // the circle grows out of the clicked poster (not slides in from the last one)
    if (!caseEl.classList.contains('open')) setOrigin(i);
    $('case-num').textContent = pad3(i + 1);
    $('case-cat').textContent = p.cat;
    $('case-title').textContent = p.title;
    $('case-cover').src = p.img;
    $('case-cover').alt = p.title;
    caseEl.querySelector('.case-media').style.backgroundImage = p.bg ? `url("${p.bg}")` : '';
    const tag = p.tag || '';
    $('case-tag').textContent = tag;
    $('case-tag').style.display = tag ? '' : 'none';
    const desc = $('case-desc');
    desc.replaceChildren();
    [].concat(p.desc || []).forEach(t => desc.appendChild(para(t)));
    const secs = p.sections || [];
    // section layouts: default (text, then images), 'statement' (large lead text),
    // 'split' (text beside the images), 'media-first' (images above the text)
    secs.forEach((s, k) => {
      const sec = make('section', `case-sec${s.layout ? ` case-sec--${s.layout}` : ''}`);
      const bar = make('div', 'case-sec-bar micro');
      bar.append(make('span', 'num', String(k + 1).padStart(2, '0')), make('span', 'num muted', `/ ${String(secs.length).padStart(2, '0')}`));
      const text = make('div', 'case-text');
      text.appendChild(make('h3', null, s.title));
      [].concat(s.body || []).forEach(t => text.appendChild(para(t)));
      if (s.items) {
        const dl = make('dl', 'case-items');
        s.items.forEach(([k2, v]) => {
          const row = make('div');
          row.append(make('dt', 'micro', k2), make('dd', null, v));
          dl.appendChild(row);
        });
        text.appendChild(dl);
      }
      let figs = null;
      if (s.images && s.images.length) {
        figs = make('div', 'case-figs');
        figs.style.setProperty('--n', s.cols || 1);
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
    });
    const gal = $('case-gallery');
    gal.replaceChildren(...(p.images || []).map(im => figure(im, p.title)));
    const n = (i + 1) % PROJECTS.length;
    $('case-next-num').textContent = pad3(n + 1);
    $('case-next-title').textContent = PROJECTS[n].title;
    $('case-next').onclick = () => openCase(n);
    caseEl.scrollTop = 0;
    caseEl.setAttribute('aria-hidden', 'false');
    caseEl.classList.remove('closing');
    caseEl.classList.add('open');
    document.body.classList.add('case-open');
    tagEl.classList.remove('on');
    $('case-close').focus({ preventScroll: true });
  }
  function closeCase() {
    if (!caseEl.classList.contains('open')) return;
    setOrigin(current);   // shrink back into the poster of the project being viewed
    caseEl.classList.add('closing');
    caseEl.classList.remove('open');
    caseEl.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('case-open');
    setTimeout(() => caseEl.classList.remove('closing'), REDUCED ? 0 : 750);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  $('case-close').addEventListener('click', closeCase);
  addEventListener('keydown', e => { if (e.key === 'Escape') closeCase(); });


  // ══════════════════════════════════════════════════════════════
  // PIXEL FIELD — cells that light up under the cursor and slowly
  // blink on their own. It follows the hero's own stages: liquid
  // metaballs at the top, then halftone dots, then hard pixels and
  // ×/o glyphs once you've scrolled through the hero.
  // ══════════════════════════════════════════════════════════════
  function seeded(n) { const x = Math.sin(n * 91.345) * 47453.5453; return x - Math.floor(x); }
  // same curves as the shader: k = liquid → dots crossfade, sq = dots → squares
  const stageK  = () => smooth(0.04, 0.22, heroProgress);
  const stageSq = () => smooth(0.62, 0.95, heroProgress);

  // pixel kanji for the trail: each glyph is rendered at 9px, its alpha snapped to
  // hard on/off pixels, then drawn at exactly 2× into an 18px cell with smoothing off.
  // Simple characters so they stay legible at pixel size.
  const KANJI = ['日', '月', '山', '木', '水', '火', '人', '口', '目', '田', '光', '心'];
  const kanjiCache = {};
  function kanjiGlyphs(rgb) {
    const key = rgb.join(',');
    if (kanjiCache[key]) return kanjiCache[key];
    return (kanjiCache[key] = KANJI.map(ch => {
      const c = document.createElement('canvas');
      c.width = c.height = 9;
      const x = c.getContext('2d');
      x.font = '9px "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Noto Sans JP", "MS Gothic", sans-serif';
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillStyle = '#000';
      x.fillText(ch, 4.5, 5);
      const img = x.getImageData(0, 0, 9, 9), d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const on = d[i + 3] > 55;   // low cutoff keeps thin strokes (月's right side)
        d[i] = rgb[0]; d[i + 1] = rgb[1]; d[i + 2] = rgb[2]; d[i + 3] = on ? 255 : 0;
      }
      x.putImageData(img, 0, 0);
      return c;
    }));
  }

  class PixelField {
    constructor(canvas, area, opts) {
      this.cv = canvas; this.ctx = canvas.getContext('2d');
      this.cell = 18; this.opts = opts;
      this.mouse = { x: -1e4, y: -1e4, px: -1e4, py: -1e4 };
      this.blinks = []; this.spawn = 0; this.last = 0; this.visible = false;
      area.addEventListener('pointermove', e => {
        const r = this.cv.getBoundingClientRect(), m = this.mouse;
        m.x = e.clientX - r.left; m.y = e.clientY - r.top;
        // no trail over text that asks for it (the hero copy has its own hover effect)
        m.off = !!(opts.suppress && opts.suppress(e.clientX, e.clientY));
        if (m.px < -1e3) { m.px = m.x; m.py = m.y; }
        m.moved = true;
      });
      area.addEventListener('pointerleave', () => { const m = this.mouse; m.x = m.y = m.px = m.py = -1e4; });
      new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; }).observe(canvas);
      new ResizeObserver(() => this.build()).observe(canvas);
    }
    build() {
      const w = this.cv.clientWidth, h = this.cv.clientHeight;
      if (!w || !h) return;
      this.w = w; this.h = h;
      this.dpr = 1;   // soft blobs and chunky pixels don't need retina density
      this.cv.width = Math.round(w * this.dpr); this.cv.height = Math.round(h * this.dpr);
      this.cols = Math.ceil(w / this.cell); this.rows = Math.ceil(h / this.cell) + 1;
      this.field = new Float32Array(this.cols * this.rows);   // pointer trail energy
      this.sub = 0; this.lastOff = this.opts.scrollOffset ? this.opts.scrollOffset() : 0;
      this.glow = new Float32Array(this.cols * this.rows);    // slow blink energy
      this.blinks = [];
      // low-res buffer for the liquid stage (metaballs, upscaled smooth)
      this.fs = 5;
      this.fw = Math.ceil(w / this.fs); this.fh = Math.ceil(h / this.fs);
      this.fbuf = new Float32Array(this.fw * this.fh);
      this.fcv = document.createElement('canvas');
      this.fcv.width = this.fw; this.fcv.height = this.fh;
      this.fctx = this.fcv.getContext('2d');
      this.fimg = this.fctx.createImageData(this.fw, this.fh);
      // a few permanent slabs, like the acid poster; opts.zone = [x0, y0, x1, y1]
      // as fractions, to keep them clear of text
      this.slabs = [];
      const [zx0, zy0, zx1, zy1] = this.opts.zone || [0, 0, 1, 1];
      for (let k = 0; k < (this.opts.slabs || 0); k++) {
        const sw = 2 + Math.floor(seeded(k + 1) * 6), sh = 1 + Math.floor(seeded(k + 11) * 4);
        const x0 = Math.floor(zx0 * this.cols), x1 = Math.floor(zx1 * this.cols) - sw;
        const y0 = Math.floor(zy0 * this.rows), y1 = Math.floor(zy1 * this.rows) - sh;
        this.slabs.push([x0 + Math.floor(seeded(k + 21) * Math.max(1, x1 - x0)),
                         y0 + Math.floor(seeded(k + 31) * Math.max(1, y1 - y0)), sw, sh]);
      }
    }
    stamp(x, y, strength) {
      const { cell, cols, rows, field } = this;
      const cx = Math.floor(x / cell), cy = Math.floor(y / cell), rad = this.opts.trail || 4;
      for (let j = -rad; j <= rad; j++) for (let i = -rad; i <= rad; i++) {
        const gx = cx + i, gy = cy + j;
        if (gx < 0 || gy < 0 || gx >= cols || gy >= rows) continue;
        const d = Math.hypot(i, j) / rad;
        if (d > 1) continue;
        const idx = gy * cols + gx;
        field[idx] = Math.min(1, field[idx] + (1 - d) * strength * (0.6 + 0.4 * Math.random()));
      }
    }
    // liquid stage: every lit cell adds a soft kernel; the sum is thresholded
    // into gooey blobs that merge as they touch
    drawLiquid(energy, alpha, rgb) {
      const { fbuf, fw, fh, fs, cell, cols } = this;
      fbuf.fill(0);
      const R = cell * 2 / fs, R2 = R * R;
      for (let i = 0; i < energy.length; i++) {
        const e = energy[i];
        if (e < 0.04) continue;
        const cx = ((i % cols) + 0.5) * cell / fs, cy = (((i / cols) | 0) + 0.5) * cell / fs;
        const x0 = Math.max(0, Math.floor(cx - R)), x1 = Math.min(fw - 1, Math.ceil(cx + R));
        const y0 = Math.max(0, Math.floor(cy - R)), y1 = Math.min(fh - 1, Math.ceil(cy + R));
        for (let y = y0; y <= y1; y++) {
          const dy = y - cy, row = y * fw;
          for (let x = x0; x <= x1; x++) {
            const dx = x - cx, d2 = dx * dx + dy * dy;
            if (d2 >= R2) continue;
            const t = 1 - d2 / R2;
            fbuf[row + x] += e * t * t;
          }
        }
      }
      const data = this.fimg.data, A = 255 * alpha;
      for (let i = 0, j = 0; i < fbuf.length; i++, j += 4) {
        const v = fbuf[i];
        const a = v <= 0.26 ? 0 : v >= 0.36 ? 1 : (v - 0.26) / 0.1;
        data[j] = rgb[0]; data[j + 1] = rgb[1]; data[j + 2] = rgb[2];
        data[j + 3] = a * a * (3 - 2 * a) * A;
      }
      this.fctx.putImageData(this.fimg, 0, 0);
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = 'high';
      this.ctx.drawImage(this.fcv, 0, 0, fw * fs, fh * fs);
    }
    draw(now) {
      if (!this.field || !this.visible) { this.last = 0; return; }
      const dt = this.last ? Math.min(0.1, (now - this.last) / 1000) : 1 / 60;
      this.last = now;
      const { ctx, cell: PC, cols, rows, field, glow } = this;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.clearRect(0, 0, this.w, this.h);
      const rgb = this.opts.color, fg = rgb.join(',');
      const k = stageK(), sq = stageSq();

      // slow blinks: a cell eases up and back down over ~2–4.5s
      if (!REDUCED && this.opts.blinks !== false) {
        this.spawn += dt * cols * rows * 0.0008;
        while (this.spawn >= 1) {
          this.spawn--;
          this.blinks.push({ i: (Math.random() * field.length) | 0, t0: now,
                             dur: 2000 + Math.random() * 2500, peak: 0.45 + Math.random() * 0.55 });
        }
      }
      glow.fill(0);
      this.blinks = this.blinks.filter(b => {
        const t = (now - b.t0) / b.dur;
        if (t >= 1) return false;
        glow[b.i] = Math.max(glow[b.i], Math.sin(Math.PI * t) * b.peak);
        return true;
      });

      // opts.scrollOffset: the trail is painted onto the content, so when the content
      // scrolls, shift the field with it (whole cells) plus a sub-cell draw offset
      const m = this.mouse;
      if (this.opts.scrollOffset) {
        const off = this.opts.scrollOffset(), dy = off - this.lastOff;
        this.lastOff = off;
        if (dy) {
          this.sub += dy;
          const n = Math.floor(this.sub / PC);
          if (n) {
            this.sub -= n * PC;
            if (Math.abs(n) >= rows) field.fill(0);
            else if (n > 0) { field.copyWithin(0, n * cols); field.fill(0, (rows - n) * cols); }
            else { field.copyWithin(-n * cols, 0, (rows + n) * cols); field.fill(0, 0, -n * cols); }
          }
        }
        ctx.translate(0, -this.sub);
      }
      // trail the pointer between frames so fast moves leave a line, not dots
      if (m.px > -1e3 && m.moved && !this.opts.noTrail && !m.off) {
        const steps = Math.max(1, Math.ceil(Math.hypot(m.x - m.px, m.y - m.py) / PC));
        // opts.trailAfterLiquid: in the hero the liquid stage belongs to the metaballs' own cut
        const str = 0.35 * (this.opts.trailAfterLiquid ? k : 1);
        if (str > 0.01) for (let s = 1; s <= steps; s++)
          this.stamp(lerp(m.px, m.x, s / steps), lerp(m.py, m.y, s / steps) + this.sub, str);
      }
      if (m.off) m.px = m.py = -1e4;   // restart the trail cleanly after leaving text
      else { m.px = m.x; m.py = m.y; }
      m.moved = false;

      // slabs: soft pills at the top, squaring off with the pixels
      ctx.fillStyle = `rgba(${fg},0.9)`;
      for (const [sx, sy, sw, sh] of this.slabs) {
        ctx.beginPath();
        ctx.roundRect(sx * PC, sy * PC, sw * PC, sh * PC, Math.min(sw, sh) * PC / 2 * (1 - sq));
        ctx.fill();
      }

      const decay = Math.pow(0.5, dt / 0.6);   // trail half-life 0.6s
      const energy = glow;                      // reuse: glow becomes max(trail, blink)
      let peak = 0;
      for (let i = 0; i < field.length; i++) {
        if (field[i] > energy[i]) energy[i] = field[i];
        if (energy[i] > peak) peak = energy[i];
        field[i] *= decay;
      }
      const grid = this.opts.grid ? this.opts.grid() : true;
      if (peak < 0.05 && !grid && !this.slabs.length) return;   // nothing lit — leave it cleared

      // the cursor trail skips the liquid look: at low dissolve it melted recent trail cells
      // into one solid blob (the hero's glass already covers that stage)
      if (k < 1 && !this.opts.trailAfterLiquid) this.drawLiquid(energy, 1 - k, rgb);
      if (k <= 0) return;

      // dots → pixels (with pixel kanji in the mid-energy cells)
      const glyphs = kanjiGlyphs(rgb);
      ctx.imageSmoothingEnabled = false;
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const e = energy[y * cols + x];
        const px = x * PC, py = y * PC;
        if (e < 0.05) {
          // faint grid dots everywhere
          if (grid && (x + y) % 3 === 0) { ctx.fillStyle = `rgba(${fg},${0.14 * k})`; ctx.fillRect(px + PC / 2 - 1, py + PC / 2 - 1, 2, 2); }
          continue;
        }
        ctx.fillStyle = `rgba(${fg},${Math.min(1, e * 1.4) * k})`;
        if (sq > 0.5 && e > 0.4 && e <= 0.7) {
          ctx.globalAlpha = Math.min(1, e * 1.4) * k;
          ctx.drawImage(glyphs[(x * 7 + y * 3) % glyphs.length], px, py, PC, PC);
          ctx.globalAlpha = 1;
          continue;
        }
        const size = e > 0.7 ? PC : PC * clamp(e * 1.3, 0.2, 1);
        ctx.beginPath();
        ctx.roundRect(px + (PC - size) / 2, py + (PC - size) / 2, size, size, size / 2 * (1 - sq));
        ctx.fill();
      }
    }
  }

  // the cursor trail: page-wide, following the hero's stages (none during the liquid
  // intro, dots mid-dissolve, pixels + ×/o glyphs from full dissolve onward)
  let overHeroText = () => false;   // set by heroType below
  const heroPix = new PixelField(document.getElementById('hero-pix'), document.documentElement, {
    suppress: (x, y) => overHeroText(x, y),
    slabs: 0, blinks: false, color: SWIRL, trail: 2, trailAfterLiquid: true,
    grid: () => heroProgress > 0 && heroProgress < 1,   // faint dot grid only while the hero dissolves
    // how far the page content has actually moved: scrolling through the pinned
    // hero doesn't move anything, so that stretch doesn't count
    scrollOffset: () => scrollY - clamp(scrollY - hero.offsetTop, 0, hero.offsetHeight - innerHeight),
  });
  // contact keeps its blinks and slabs; the page-wide layer handles the trail
  const contactPix = new PixelField(document.getElementById('pixels'), document.getElementById('contact'), {
    slabs: 7, color: SWIRL, noTrail: true,
  });

  // ══════════════════════════════════════════════════════════════
  // HERO TYPE — near the cursor, hero text dissolves into halftone
  // dots that swell toward the pointer. Each word's glyphs are redrawn
  // into a mask (same font, spacing, case and rotation) and sampled.
  // ══════════════════════════════════════════════════════════════
  (function heroType() {
    const pin = hero.querySelector('.hero-pin');
    const ui = hero.querySelector('.hero-ui');
    const cv = document.createElement('canvas');
    cv.id = 'hero-type'; cv.setAttribute('aria-hidden', 'true');
    pin.appendChild(cv);
    const ctx = cv.getContext('2d');
    const SEL = '.hero-date > div, .hero-vert-l, .hero-foot .intro, #hero h1, .hero-read .pct, .hero-read > div:nth-child(2)';
    const els = [...hero.querySelectorAll(SEL)].map(el => ({ el, text: null, dots: [], cell: 3, color: '#000', box: null }));
    const range = document.createRange();
    let pinRect = pin.getBoundingClientRect(), dpr = 1, W = 0, H = 0;

    function rasterize(item) {
      const { el } = item;
      item.text = el.textContent;
      item.dots = []; item.box = null;
      const box = el.getBoundingClientRect();
      if (!box.width || !box.height) return;   // hidden at this breakpoint
      const st = getComputedStyle(el);
      const fs = parseFloat(st.fontSize);
      // 1px pixels on labels and the intro (anything coarser breaks small text), chunky on the name
      item.cell = fs < 20 ? 1 : clamp(Math.round(fs / 18), 2, 12);
      item.color = st.color;
      const pad = 6;
      const w = Math.ceil(box.width) + pad * 2, h = Math.ceil(box.height) + pad * 2;
      const off = document.createElement('canvas');
      off.width = w; off.height = h;
      const o = off.getContext('2d', { willReadFrequently: true });
      o.fillStyle = '#fff';
      const vert = el.classList.contains('vert');
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let node; (node = walker.nextNode());) {
        const ps = getComputedStyle(node.parentElement);
        o.font = `${ps.fontStyle} ${ps.fontWeight} ${ps.fontSize} ${ps.fontFamily}`;
        if ('letterSpacing' in o) o.letterSpacing = ps.letterSpacing === 'normal' ? '0px' : ps.letterSpacing;
        const upper = ps.textTransform === 'uppercase';
        for (const m of node.data.matchAll(/\S+/g)) {
          range.setStart(node, m.index); range.setEnd(node, m.index + m[0].length);
          const r = range.getClientRects()[0];
          if (!r) continue;
          const word = upper ? m[0].toUpperCase() : m[0];
          const x = r.left - box.left + pad, y = r.top - box.top + pad;
          if (vert) {
            // vertical-rl + rotate(180deg): reads bottom → top
            o.save(); o.translate(x + r.width / 2, y + r.height); o.rotate(-Math.PI / 2);
            o.textBaseline = 'middle'; o.fillText(word, 0, 0); o.restore();
          } else {
            const mt = o.measureText(word);
            const fa = mt.fontBoundingBoxAscent ?? fs * 0.8, fd = mt.fontBoundingBoxDescent ?? fs * 0.2;
            o.textBaseline = 'alphabetic';
            o.fillText(word, x, y + (r.height - (fa + fd)) / 2 + fa);
          }
        }
      }
      const d = o.getImageData(0, 0, w, h).data;
      const c = item.cell, ox = box.left - pinRect.left - pad, oy = box.top - pinRect.top - pad;
      // pixelate: a cell is "ink" when the glyphs cover enough of it (average, not one sample),
      // so strokes come out as solid pixels instead of faint speckle
      for (let cy = 0; cy + c <= h; cy += c) for (let cx = 0; cx + c <= w; cx += c) {
        let sum = 0;
        for (let y = cy; y < cy + c; y++) for (let x = cx; x < cx + c; x++) sum += d[(y * w + x) * 4 + 3];
        if (sum / (c * c * 255) > 0.3) item.dots.push(ox + cx + c / 2, oy + cy + c / 2, 1);
      }
      item.box = { x: ox, y: oy, w, h };
    }
    function build() {
      pinRect = pin.getBoundingClientRect();
      W = pin.clientWidth; H = pin.clientHeight;
      dpr = Math.min(devicePixelRatio || 1, 2);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      els.forEach(rasterize);
      kick();
    }

    // the blue cursor trail stays off while the pointer is on the hero text
    overHeroText = (x, y) => els.some(({ el }) => {
      const r = el.getBoundingClientRect();
      return r.width && x > r.left - 6 && x < r.right + 6 && y > r.top - 6 && y < r.bottom + 6;
    });
    const lens = { x: -1e4, y: -1e4, r: 0, target: 0 };
    const radius = () => clamp(Math.min(W, H) * 0.09, 50, 95);
    let running = false, dirty = false;
    hero.addEventListener('pointermove', e => {
      pinRect = pin.getBoundingClientRect();
      lens.x = e.clientX - pinRect.left; lens.y = e.clientY - pinRect.top;
      lens.target = radius(); kick();
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { lens.target = 0; kick(); });

    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ui.style.setProperty('--lx', lens.x + 'px');
      ui.style.setProperty('--ly', lens.y + 'px');
      ui.style.setProperty('--lr', lens.r + 'px');
      if (lens.r < 1) return;
      const R = lens.r;
      for (const it of els) {
        const b = it.box;
        if (!b || lens.x + R < b.x || lens.x - R > b.x + b.w || lens.y + R < b.y || lens.y - R > b.y + b.h) continue;
        ctx.fillStyle = it.color;
        ctx.beginPath();
        const dots = it.dots, c = it.cell, Rin = R * 0.9, Rin2 = Rin * Rin;   // matches the mask's hard edge
        for (let k = 0; k < dots.length; k += 3) {
          const dx = dots[k] - lens.x, dy = dots[k + 1] - lens.y, d2 = dx * dx + dy * dy;
          if (d2 >= Rin2) continue;
          const L0 = 1 - Math.sqrt(d2) / Rin;
          const L = L0 * L0 * (3 - 2 * L0);
          const r = c * (0.62 + 0.2 * L);   // overlapping pixels read as blobby strokes; they melt together near the pointer
          ctx.moveTo(dots[k] + r, dots[k + 1]);
          ctx.arc(dots[k], dots[k + 1], r, 0, Math.PI * 2);
        }
        ctx.fill();
      }
    }
    function kick() {
      dirty = true;
      if (running) return;
      running = true;
      requestAnimationFrame(function frame() {
        lens.r += (lens.target - lens.r) * (REDUCED ? 1 : 0.18);
        if (Math.abs(lens.r - lens.target) < 0.5) lens.r = lens.target;
        // text that changed since the last raster (the scroll counter) is redone
        for (const it of els) if (it.el.textContent !== it.text) rasterize(it);
        draw();
        const again = lens.r !== lens.target || dirty;
        dirty = false;
        if (again) requestAnimationFrame(frame); else running = false;
      });
    }
    new ResizeObserver(build).observe(pin);
    document.fonts.ready.then(build);   // glyph masks need the real fonts
  })();


  // shared loop for the 2D sections, capped at 30fps
  let lastLoop = 0;
  (function loop(t) {
    requestAnimationFrame(loop);
    if (t - lastLoop < 1000 / 30 - 2) return;
    lastLoop = t;
    heroPix.draw(t);
    contactPix.draw(t);
  })(0);

  // ══════════════════════════════════════════════════════════════
  // FAVOURITES — the skull guy from the logo sits on the front of the About
  // photos; clicking him sends five favourite things flying out to land around
  // the prints like stickers (click again and they fly back).
  // ══════════════════════════════════════════════════════════════
  (function favorites() {
    const media = document.querySelector('.about-media');
    if (!media) return;
    const PAPER_WHITE = '#f4f1e8';   // die-cut sticker border
    // the ones that fly out; x / y = where each lands, as % of the photo area; tilt in degrees
    const FLYERS = [
      { src: 'favorites/claptrap.png', smooth: true, x: -4, y: -8, tilt: -10,
        label: 'Borderlands: one of the first games I ever played', credit: 'Icon: Borderlands 2' },
      { strip: 'favorites/ghost-rider-idle.png', fw: 57, fh: 94, frames: 24, fps: 12, scale: 2, x: -3, y: 50, tilt: -6,
        label: 'Ghost Rider: the comic I collect with my dad', credit: 'Sprite: Marvel Cosmic Invasion, ripped by Random Talking Bush' },
      { src: 'favorites/gundam.png', scale: 2, x: 38, y: -12, tilt: 5,
        label: 'Gundam: I build them in my spare time', credit: 'Sprite: SD Strike Freedom Gundam' },
      // Shinx → Luxio → Luxray, slowly "evolving"
      { strip: 'favorites/luxray-line.png', fw: 128, fh: 102, frames: 3, fps: 0.8, scale: 1, x: 80, y: 66, tilt: 8,
        label: 'Pokémon Sun: the first Pokémon game I ever beat', credit: 'Icons: Pokémon Sun & Moon' },
      { strip: 'favorites/gabumon-idle.png', fw: 29, fh: 32, frames: 10, fps: 8, scale: 4, x: 86, y: -6, tilt: 7,
        label: 'Gabumon: me if I was a Digimon', credit: 'Sprite ripped by Ploaj' },
    ];

    // a sprite (or one frame of a strip) with a die-cut border: the silhouette,
    // filled paper white, stamped in a ring around it, then the sprite on top
    function spriteSticker(img, sx, sw, sh, scale, smooth) {
      const b = Math.max(3, scale);               // border thickness
      const w = sw * scale, h = sh * scale;
      const cv = document.createElement('canvas');
      cv.width = w + b * 2; cv.height = h + b * 2;
      const x = cv.getContext('2d');
      const sil = document.createElement('canvas');
      sil.width = w; sil.height = h;
      const sx2 = sil.getContext('2d');
      sx2.imageSmoothingEnabled = !!smooth;
      sx2.drawImage(img, sx, 0, sw, sh, 0, 0, w, h);
      sx2.globalCompositeOperation = 'source-in';
      sx2.fillStyle = PAPER_WHITE; sx2.fillRect(0, 0, w, h);
      for (let a = 0; a < 16; a++) x.drawImage(sil, b + Math.round(Math.cos(a / 8 * Math.PI) * b), b + Math.round(Math.sin(a / 8 * Math.PI) * b));
      x.imageSmoothingEnabled = !!smooth;
      x.drawImage(img, sx, 0, sw, sh, b, b, w, h);
      return cv;
    }
    const animated = [];
    function tick(now) {
      for (const a of animated) {
        const f = Math.floor(now / 1000 * a.fps) % a.frames.length;
        if (f !== a.cur) { a.cur = f; a.ctx.clearRect(0, 0, a.cv.width, a.cv.height); a.ctx.drawImage(a.frames[f], 0, 0); }
      }
      requestAnimationFrame(tick);
    }
    // load a sprite (still or strip) into an element as a canvas sticker
    function mount(it, el) {
      const img = new Image();
      img.onload = () => {
        if (it.strip) {
          const frames = [];
          for (let k = 0; k < it.frames; k++) frames.push(spriteSticker(img, k * it.fw, it.fw, it.fh, it.scale, false));
          const cv = document.createElement('canvas');
          cv.width = frames[0].width; cv.height = frames[0].height;
          const ctx = cv.getContext('2d');
          ctx.drawImage(frames[0], 0, 0);
          el.appendChild(cv);
          if (!REDUCED) { animated.push({ frames, fps: it.fps, cv, ctx, cur: 0 }); if (animated.length === 1) requestAnimationFrame(tick); }
        } else {
          el.appendChild(spriteSticker(img, 0, img.naturalWidth, img.naturalHeight, it.scale || 1, it.smooth));
        }
      };
      img.onerror = () => el.remove();
      img.src = it.strip || it.src;
    }
    const showTag = text => { tagEl.textContent = text; tagEl.classList.add('on'); };
    const hideTag = () => tagEl.classList.remove('on');

    const layer = document.createElement('div');
    layer.className = 'about-pals';
    media.appendChild(layer);

    const flyers = FLYERS.map((it, k) => {
      const el = document.createElement('div');
      el.className = 'pal';
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', it.label);
      el.style.setProperty('--x', it.x + '%');
      el.style.setProperty('--y', it.y + '%');
      el.style.setProperty('--tilt', it.tilt + 'deg');
      el.style.setProperty('--delay', (k * 70) + 'ms');
      mount(it, el);
      el.addEventListener('pointerenter', () => showTag(`${it.label} (${it.credit})`));
      el.addEventListener('pointerleave', hideTag);
      layer.appendChild(el);
      return el;
    });

    // the skull guy from the top-left logo (a copy, with its ids renamed so they stay unique)
    const peek = document.createElement('button');
    peek.type = 'button';
    peek.className = 'peeker';
    peek.setAttribute('aria-expanded', 'false');
    peek.setAttribute('aria-label', 'The skull guy. Show my favourite things');
    peek.innerHTML = document.querySelector('#logo svg').outerHTML
      .replace(/id="lg(\d)"/g, 'id="pk$1"').replace(/url\(#lg(\d)\)/g, 'url(#pk$1)')
      .replace(/ id="lg-(plate|jaw)"/g, ' class="lg-$1"');
    addLogoRig(peek.querySelector('svg'), peek);   // looks around and blinks in sync with the logo
    media.appendChild(peek);
    peek.addEventListener('pointerenter', () => showTag(layer.classList.contains('out') ? 'Click to put them away' : 'Psst. Click me'));
    peek.addEventListener('pointerleave', hideTag);
    peek.addEventListener('click', () => {
      const out = layer.classList.toggle('out');
      peek.setAttribute('aria-expanded', String(out));
      peek.setAttribute('aria-label', out ? 'Put my favourite things away' : 'The skull guy. Show my favourite things');
      showTag(out ? 'Click to put them away' : 'Psst. Click me');
      // flyers sit behind the photos while hidden, in front once they've landed
      clearTimeout(layer.zTimer);
      if (out) layer.classList.add('front');
      else layer.zTimer = setTimeout(() => layer.classList.remove('front'), REDUCED ? 0 : 700);
    });
  })();

  // ══════════════════════════════════════════════════════════════
  // ABOUT BACKDROP — a slow halftone field behind About that bleeds into
  // Contact: two drifting waves swell and shrink periwinkle dots (the same
  // print language as the posters and the hero dissolve), and the dots
  // square off into pixels as they reach Contact's pixel field. Dots near
  // the pointer puff up. Runs only while it's on screen, at ≤30fps.
  // ══════════════════════════════════════════════════════════════
  (function aboutBackdrop() {
    const about = document.getElementById('about');
    const contact = document.getElementById('contact');
    if (!about || !contact) return;
    // one canvas behind both sections, so the field runs from About into the top of Contact
    const cv = document.createElement('canvas');
    cv.className = 'about-backdrop';
    cv.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cv);
    const ctx = cv.getContext('2d');
    const CELL = 16;
    let W = 0, H = 0, top = 0, seam = 0, dpr = 1, visible = false, last = 0;
    const ptr = { x: -1e4, y: -1e4, k: 0, target: 0 };

    function size() {
      top = about.getBoundingClientRect().top + scrollY;
      seam = about.offsetHeight;                              // where About ends and Contact starts
      W = document.documentElement.clientWidth;
      H = Math.round(seam + contact.offsetHeight * 0.65);     // bleed two thirds of the way into Contact
      cv.style.top = top + 'px'; cv.style.height = H + 'px';
      dpr = Math.min(devicePixelRatio || 1, 2);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      draw(performance.now());
    }
    function draw(now) {
      const t = REDUCED ? 0 : now / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = `rgb(${SWIRL})`;
      ptr.k += (ptr.target - ptr.k) * 0.08;
      const cols = Math.ceil(W / CELL), rows = Math.ceil(H / CELL);
      for (let gy = 0; gy < rows; gy++) {
        const y = (gy + 0.5) * CELL;
        // faint under the About bar, full across the seam, then fading out inside Contact
        const fade = smooth(0.06 * seam, 0.85 * seam, y) * (1 - smooth(seam + 40, H, y));
        if (fade < 0.02) continue;
        // round halftone dots square off into pixels as they cross into Contact
        const sq = smooth(seam - 120, seam + 220, y);
        ctx.globalAlpha = 0.08 + 0.3 * fade;
        ctx.beginPath();
        for (let gx = 0; gx < cols; gx++) {
          const x = (gx + 0.5) * CELL;
          let v = 0.5 + 0.28 * Math.sin(x * 0.009 + t * 0.5) * Math.cos(y * 0.013 - t * 0.35)
                      + 0.22 * Math.sin((x + y) * 0.006 - t * 0.27);
          const d = Math.hypot(x - ptr.x, y - ptr.y);
          if (d < 180) v += 0.45 * ptr.k * (1 - d / 180) ** 2;
          const r = CELL * 0.42 * smooth(0.45, 1, v) * (0.4 + 0.6 * fade);
          if (r < 0.6) continue;
          if (sq < 0.02) { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2); }
          else ctx.roundRect(x - r, y - r, r * 2, r * 2, r * (1 - sq));
        }
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    function loop(now) {
      if (visible && !REDUCED && now - last > 33) { last = now; draw(now); }
      requestAnimationFrame(loop);
    }
    const onMove = e => {
      ptr.x = e.clientX; ptr.y = e.clientY + scrollY - top; ptr.target = 1;
    };
    [about, contact].forEach(el => {
      el.addEventListener('pointermove', onMove, { passive: true });
      el.addEventListener('pointerleave', () => { ptr.target = 0; });
    });
    new IntersectionObserver(es => { visible = es[es.length - 1].isIntersecting; }).observe(cv);
    const ro = new ResizeObserver(size);
    ro.observe(about); ro.observe(contact); ro.observe(document.body);
    addEventListener('load', size);
  })();
})();
