window.ArcScrollTransitionSnippet = {
  css: `.cp-preview[data-experiment-preview="transition-arc-scroll"] {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: stretch;
  padding: 0;
  background: #000;
}

.cp-preview[data-experiment-preview="transition-arc-scroll"] .arc-scroll {
  flex: 1 1 auto;
  width: 100%;
  min-height: 0;
}

.arc-scroll {
  --arc-heading-size: 96px;
  --arc-solid-color: #cecece;
  --arc-image-opacity: 0.8;
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  container-type: size;
  background: #000;
}

.arc-scroll__scroller {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.arc-scroll__scroller::-webkit-scrollbar {
  display: none;
}

.arc-scroll__section {
  position: relative;
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 100cqh;
  overflow: hidden;
  color: #f2f2f2;
}

.arc-scroll__section.is--solid {
  color: #0a0a0a;
  background-color: var(--arc-solid-color);
}

.arc-scroll__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-color: #000;
}

.arc-scroll__bg-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: var(--arc-image-opacity);
  user-select: none;
}

.arc-scroll__content {
  position: relative;
  z-index: 1;
}

.arc-scroll__h {
  max-width: 8em;
  margin: 0;
  font-family: "Haffer XH", Inter, Arial, sans-serif;
  font-size: var(--arc-heading-size);
  font-weight: 400;
  line-height: 0.95;
  letter-spacing: -0.04em;
  text-align: center;
}

/* Osmo drops the heading to 3.5em (from 6em) below 768px. */
@container (max-width: 767px) {
  .arc-scroll__h {
    font-size: calc(var(--arc-heading-size) * 3.5 / 6);
  }
}

.arc-scroll__transition {
  position: absolute;
  inset: auto 0 0;
  z-index: 10;
  pointer-events: none;
  color: var(--arc-solid-color);
}

.arc-scroll__transition.is--top {
  inset: 0 0 auto;
}

.arc-scroll__transition svg {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1;
}

.arc-scroll__transition path {
  fill: currentColor;
}
`,
  js: `// Arc Scroll Transition — vanilla port of Osmo's resource
// (https://www.osmo.supply/preview?resource=arc-scroll-transition).
//
// Sections scroll inside the preview. Each [data-arc-transition] holds a
// square SVG anchored to the bottom (cover) or top (reveal) of its section;
// a quadratic arc fills it as the section scrolls, bulging most at the middle
// of the transition (depth * sin(progress * PI)). Wheel input is smoothed
// (Lenis-like lerp) and progress trails scroll by \`scrub\` seconds
// (ScrollTrigger scrub).
window.initArcScrollTransition = function initArcScrollTransition(root, options = {}) {
  const VIEWBOX = 100;
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const DEFAULTS = {
    curves: [12, 10, 25, 5],
    // Section heights in vh of the scroller (sections 1-4; section 5 stays 100).
    sectionHeights: [100, 100, 100, 100],
    scrub: 0.3,
    smoothing: 0.1,
    headingSize: 96,
    solidColor: '#cecece',
    imageOpacity: 80,
    bgImage1: 'Components/ArcScrollTransition/assets/bg-1.png',
    bgImage2: 'Components/ArcScrollTransition/assets/bg-2.png',
  };

  // Mirrors the Osmo demo page. \`transitions\` index into config.curves.
  const SECTIONS = [
    { image: 1, title: 'Arc<br>Scroll<br>Transition', bottom: { mode: 'cover', curve: 0 } },
    { solid: true, title: 'Also works as reveal instead of cover effect' },
    {
      image: 2,
      title: 'Easily adapt how steep the curve is',
      top: { mode: 'reveal', curve: 1 },
      bottom: { mode: 'cover', curve: 2 },
    },
    { solid: true, title: 'One system, many possibilities' },
    { image: 1, title: 'Arc<br>Scroll<br>Transition', top: { mode: 'reveal', curve: 3 } },
  ];

  let config = normalize(options);
  let instances = [];
  let frameId = null;
  let lastTime = 0;
  let targetScroll = 0;
  let wheelActive = false;

  const container = document.createElement('div');
  container.className = 'arc-scroll';
  container.setAttribute('data-arc-scroll', '');
  const scroller = document.createElement('div');
  scroller.className = 'arc-scroll__scroller';
  container.appendChild(scroller);
  root.replaceChildren(container);

  function normalize(raw) {
    const curves = Array.isArray(raw.curves) ? raw.curves : DEFAULTS.curves;
    const heights = Array.isArray(raw.sectionHeights) ? raw.sectionHeights : DEFAULTS.sectionHeights;
    return {
      curves: DEFAULTS.curves.map((fallback, i) => finite(curves[i], fallback)),
      sectionHeights: DEFAULTS.sectionHeights.map((fallback, i) => Math.max(10, finite(heights[i], fallback))),
      scrub: Math.max(0, finite(raw.scrub, DEFAULTS.scrub)),
      smoothing: Math.min(1, Math.max(0.01, finite(raw.smoothing, DEFAULTS.smoothing))),
      headingSize: Math.max(8, finite(raw.headingSize, DEFAULTS.headingSize)),
      solidColor: raw.solidColor || DEFAULTS.solidColor,
      imageOpacity: Math.min(100, Math.max(0, finite(raw.imageOpacity, DEFAULTS.imageOpacity))),
      bgImage1: raw.bgImage1 || DEFAULTS.bgImage1,
      bgImage2: raw.bgImage2 || DEFAULTS.bgImage2,
    };
  }

  function finite(value, fallback) {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function round(value) {
    return Math.round(value * 100) / 100;
  }

  function buildTransition(section, spec) {
    const wrapper = document.createElement('div');
    wrapper.className = 'arc-scroll__transition';
    if (spec.mode === 'reveal') wrapper.classList.add('is--top');
    wrapper.setAttribute('data-arc-transition', spec.mode);

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', \`0 0 \${VIEWBOX} \${VIEWBOX}\`);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS(SVG_NS, 'path');
    svg.appendChild(path);
    wrapper.appendChild(svg);
    section.appendChild(wrapper);

    return {
      section,
      path,
      mode: spec.mode,
      curveIndex: spec.curve,
      depth: 0,
      progress: -1,
      shown: -1,
    };
  }

  function build() {
    scroller.replaceChildren();
    instances = [];

    SECTIONS.forEach((meta) => {
      const section = document.createElement('section');
      section.className = 'arc-scroll__section';
      if (meta.solid) section.classList.add('is--solid');

      if (meta.top) instances.push(buildTransition(section, meta.top));

      if (meta.image) {
        const bg = document.createElement('div');
        bg.className = 'arc-scroll__bg';
        const img = document.createElement('img');
        img.className = 'arc-scroll__bg-img';
        img.alt = '';
        img.draggable = false;
        img.dataset.arcImage = String(meta.image);
        bg.appendChild(img);
        section.appendChild(bg);
      }

      const content = document.createElement('div');
      content.className = 'arc-scroll__content';
      const heading = document.createElement('h2');
      heading.className = 'arc-scroll__h';
      heading.innerHTML = meta.title;
      content.appendChild(heading);
      section.appendChild(content);

      if (meta.bottom) instances.push(buildTransition(section, meta.bottom));

      scroller.appendChild(section);
    });
  }

  function applyStyles() {
    container.style.setProperty('--arc-heading-size', \`\${config.headingSize}px\`);
    container.style.setProperty('--arc-solid-color', config.solidColor);
    container.style.setProperty('--arc-image-opacity', String(config.imageOpacity / 100));
    scroller.querySelectorAll('.arc-scroll__section').forEach((section, i) => {
      const vh = config.sectionHeights[i];
      section.style.minHeight = vh == null ? '' : \`\${vh}cqh\`;
    });
    scroller.querySelectorAll('[data-arc-image]').forEach((img) => {
      const src = img.dataset.arcImage === '2' ? config.bgImage2 : config.bgImage1;
      if (img.getAttribute('src') !== src) img.src = src;
    });
  }

  function measure() {
    instances.forEach((instance) => {
      const { offsetWidth: w, offsetHeight: h } = instance.section;
      const aspect = h ? w / h : 1;
      instance.depth = config.curves[instance.curveIndex] * aspect;
      instance.shown = -1;
    });
  }

  // ScrollTrigger ranges, relative to the scroller:
  //   cover:  "bottom bottom" → "bottom top"
  //   reveal: "top bottom"    → "top top"
  function scrollProgress(instance) {
    const vh = scroller.clientHeight || 1;
    const { offsetTop, offsetHeight } = instance.section;
    const anchor = instance.mode === 'cover' ? offsetTop + offsetHeight : offsetTop;
    const start = anchor - vh;
    return Math.min(1, Math.max(0, (scroller.scrollTop - start) / vh));
  }

  function draw(instance, progress) {
    const fill = instance.mode === 'cover' ? progress : 1 - progress;
    const curve = instance.depth * Math.sin(fill * Math.PI);

    if (instance.mode === 'cover') {
      const edge = round(VIEWBOX - VIEWBOX * fill);
      const control = round(edge - curve * 2);
      instance.path.setAttribute('d', \`M0 \${VIEWBOX} L0 \${edge} Q\${VIEWBOX / 2} \${control} \${VIEWBOX} \${edge} L\${VIEWBOX} \${VIEWBOX} Z\`);
      return;
    }

    const edge = round(VIEWBOX * fill);
    const control = round(edge + curve * 2);
    instance.path.setAttribute('d', \`M0 0 L0 \${edge} Q\${VIEWBOX / 2} \${control} \${VIEWBOX} \${edge} L\${VIEWBOX} 0 Z\`);
  }

  function maxScroll() {
    return Math.max(0, scroller.scrollHeight - scroller.clientHeight);
  }

  function tick(now) {
    frameId = null;
    const dt = lastTime ? Math.min(0.1, (now - lastTime) / 1000) : 1 / 60;
    lastTime = now;
    let busy = false;

    if (wheelActive) {
      // Lenis-style lerp, normalised to 60fps.
      const k = 1 - Math.pow(1 - config.smoothing, dt * 60);
      const next = scroller.scrollTop + (targetScroll - scroller.scrollTop) * k;
      if (Math.abs(targetScroll - next) < 0.5) {
        scroller.scrollTop = targetScroll;
        wheelActive = false;
      } else {
        scroller.scrollTop = next;
        busy = true;
      }
    }

    // Scrub: progress eases toward the scroll position over ~\`scrub\` seconds.
    const k = config.scrub > 0 ? 1 - Math.exp(-dt / (config.scrub / 3)) : 1;
    instances.forEach((instance) => {
      const target = scrollProgress(instance);
      if (instance.progress < 0) instance.progress = target;
      instance.progress += (target - instance.progress) * k;
      if (Math.abs(target - instance.progress) < 0.0005) instance.progress = target;
      else busy = true;

      if (instance.shown !== instance.progress) {
        instance.shown = instance.progress;
        draw(instance, instance.progress);
      }
    });

    if (busy) schedule();
    else lastTime = 0;
  }

  function schedule() {
    if (frameId == null) frameId = requestAnimationFrame(tick);
  }

  function onWheel(event) {
    if (event.ctrlKey) return;
    event.preventDefault();
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? scroller.clientHeight : 1;
    if (!wheelActive) targetScroll = scroller.scrollTop;
    targetScroll = Math.min(maxScroll(), Math.max(0, targetScroll + event.deltaY * unit));
    wheelActive = true;
    schedule();
  }

  function onScroll() {
    // Native scroll (touch, scrollbar, keyboard) takes over from the wheel lerp.
    if (!wheelActive) targetScroll = scroller.scrollTop;
    schedule();
  }

  const resizeObserver = new ResizeObserver(() => {
    measure();
    schedule();
  });

  scroller.addEventListener('wheel', onWheel, { passive: false });
  scroller.addEventListener('scroll', onScroll, { passive: true });
  resizeObserver.observe(scroller);

  build();
  applyStyles();
  measure();
  schedule();

  return {
    element: container,
    apply(nextOptions = {}) {
      config = normalize({ ...config, ...nextOptions });
      applyStyles();
      measure();
      schedule();
    },
    getConfig() {
      return { ...config, curves: [...config.curves], sectionHeights: [...config.sectionHeights] };
    },
    destroy() {
      if (frameId != null) cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      scroller.removeEventListener('wheel', onWheel);
      scroller.removeEventListener('scroll', onScroll);
      container.remove();
    },
  };
};
`,
};
