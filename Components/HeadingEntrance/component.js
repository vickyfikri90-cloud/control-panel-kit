window.initHeadingEntrance = function initHeadingEntrance(root, options = {}) {
  const wrap = root.querySelector('.heading-entrance') || root;
  const heading = wrap.querySelector('.heading-entrance__text');
  const layers = wrap.querySelectorAll('.heading-entrance__burn, .heading-entrance__dodge');

  let text = options.text ?? 'Bleeding Text';
  let blurStart = options.blurStart ?? 24;
  let blurEnd = options.blurEnd ?? 2;
  let fontSize = options.fontSize ?? 48;
  let fontWeight = options.fontWeight ?? 600;
  let letterSpacing = options.letterSpacing ?? 0;
  let duration = options.duration ?? 800;
  let stagger = options.stagger ?? 40;
  let easingRaw = options.easingRaw ?? '0.22, 1, 0.36, 1';
  let chars = [];
  let running = [];
  let layersTimer = null;
  // Blend layers switch off instantly this many ms before the entrance ends.
  let layersOffBefore = options.layersOffBefore ?? 2;

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  function getEasing() {
    const raw = String(easingRaw).trim();
    if (!raw) return 'cubic-bezier(0.22, 1, 0.36, 1)';
    if (raw.startsWith('cubic-bezier(')) return raw;
    const parts = raw.split(',').map((n) => parseFloat(n.trim()));
    if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
      return `cubic-bezier(${parts.join(', ')})`;
    }
    return raw;
  }

  function splitChars(value) {
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      return [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(value)]
        .map((part) => part.segment);
    }
    return Array.from(value);
  }

  function render() {
    heading.replaceChildren();
    heading.setAttribute('aria-label', text);
    chars = splitChars(text).map((char) => {
      const el = document.createElement('span');
      el.className = 'heading-entrance__char';
      el.textContent = char;
      el.setAttribute('aria-hidden', 'true');
      heading.appendChild(el);
      return el;
    });
  }

  function play() {
    running.forEach((anim) => anim.cancel());
    running = [];
    clearTimeout(layersTimer);
    setLayersVisible(true);
    if (motionQuery.matches) return;
    // Blur goes start → end per char; the blend layers keep it sharp-edged.
    const from = { filter: `blur(${blurStart}px)` };
    const to = { filter: `blur(${blurEnd}px)` };
    chars.forEach((el, i) => {
      running.push(el.animate([from, to], {
        duration,
        delay: i * stagger,
        easing: getEasing(),
        fill: 'backwards',
      }));
    });
    const total = Math.max(0, chars.length - 1) * stagger + duration;
    layersTimer = setTimeout(() => setLayersVisible(false), Math.max(0, total - layersOffBefore));
  }

  function setLayersVisible(visible) {
    layers.forEach((el) => { el.style.opacity = visible ? '1' : '0'; });
  }

  function applyStyles() {
    heading.style.fontSize = `${fontSize}px`;
    heading.style.fontWeight = String(fontWeight);
    heading.style.letterSpacing = `${letterSpacing}px`;
    chars.forEach((el) => { el.style.filter = `blur(${blurEnd}px)`; });
    // Blend layers must cover the full blur spread, or blurred edges get clipped.
    const spread = Math.ceil(Math.max(blurStart, blurEnd) * 3);
    layers.forEach((el) => { el.style.inset = `${-spread}px`; });
  }

  function set(next = {}) {
    const textChanged = next.text != null && next.text !== text;
    if (next.text != null) text = next.text;
    if (next.blurStart != null) blurStart = next.blurStart;
    if (next.blurEnd != null) blurEnd = next.blurEnd;
    if (next.fontSize != null) fontSize = next.fontSize;
    if (next.fontWeight != null) fontWeight = next.fontWeight;
    if (next.letterSpacing != null) letterSpacing = next.letterSpacing;
    if (next.duration != null) duration = next.duration;
    if (next.stagger != null) stagger = next.stagger;
    if (next.easingRaw != null) easingRaw = next.easingRaw;
    if (next.layersOffBefore != null) layersOffBefore = next.layersOffBefore;
    if (textChanged || !chars.length) render();
    applyStyles();
  }

  set();
  if (options.autoplay !== false) play();

  return { element: wrap, set, play };
};
