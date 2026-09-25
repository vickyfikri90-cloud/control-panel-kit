window.StaggerTextButtonSnippetJs = `window.initStaggerTextButton = function initStaggerTextButton(root, options = {}) {
  const btn = root.querySelector('#exp9-btn')
    || root.querySelector('.stagger-text-button')
    || root;
  const label = btn.querySelector('.label');

  let restLabel = options.restLabel ?? btn.getAttribute('aria-label') ?? 'Hover here';
  let hoverLabel = options.hoverLabel ?? restLabel;
  let duration = options.duration ?? 600;
  let stagger = options.stagger ?? 40;
  let staggerMode = options.staggerMode ?? 'center-out';
  let easingRaw = options.easingRaw ?? '0.65, 0, 0.35, 1';

  let currentChars = [];
  let incomingChars = [];
  let pointerHover = false;
  let focusEngaged = false;

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  function prefersReducedMotion() {
    return motionQuery.matches;
  }

  function isEngaged() {
    return pointerHover || focusEngaged;
  }

  function getEasing() {
    const raw = String(easingRaw).trim();
    if (!raw) return 'cubic-bezier(0.65, 0, 0.35, 1)';
    if (raw.startsWith('cubic-bezier(')) return raw;

    const parts = raw.split(',').map((n) => parseFloat(n.trim()));
    if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
      return \`cubic-bezier(\${parts.join(', ')})\`;
    }

    return raw;
  }

  function splitChars(text) {
    const value = text.length ? text : ' ';
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      return [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(value)]
        .map((part) => part.segment);
    }
    return Array.from(value);
  }

  function displayChar(char) {
    return char === ' ' ? '\\u00a0' : char;
  }

  function charDelay(index, total) {
    const step = Math.max(0, stagger);
    if (prefersReducedMotion()) return 0;
    if (staggerMode === 'center-out') {
      const mid = (total - 1) / 2;
      return Math.abs(index - mid) * step;
    }
    return index * step;
  }

  // Each glyph is a small state machine that only ever moves upward:
  // below → center → above, then jumps (hidden) back to below. Changing the
  // hover state mid-animation never reverses a glyph; one in flight finishes
  // its move and then continues to wherever it needs to be.
  function renderLine(layer, text, isRest) {
    layer.replaceChildren();
    return splitChars(text).map((char, index, all) => {
      const el = document.createElement('span');
      el.className = 'stagger-char';
      el.textContent = displayChar(char);
      el.setAttribute('aria-hidden', 'true');
      layer.appendChild(el);
      return {
        el,
        index,
        total: all.length,
        isRest,
        pos: 'below',
        anim: null,
        delay: 0,
      };
    });
  }

  function renderLayers() {
    label.replaceChildren();

    const currentLayer = document.createElement('span');
    currentLayer.className = 'text text--current';

    const incomingLayer = document.createElement('span');
    incomingLayer.className = 'text text--incoming';
    incomingLayer.setAttribute('aria-hidden', 'true');

    currentChars = renderLine(currentLayer, restLabel, true);
    incomingChars = renderLine(incomingLayer, hoverLabel, false);

    label.appendChild(currentLayer);
    label.appendChild(incomingLayer);
  }

  function allGlyphs() {
    return currentChars.concat(incomingChars);
  }

  function measureTravel() {
    const line = label.getBoundingClientRect().height;
    const buttonHeight = btn.getBoundingClientRect().height;
    const em = line > 0 ? line : 16;
    const box = buttonHeight > 0 ? buttonHeight : em;
    return Math.max(em, Math.ceil((box + em) / 2));
  }

  function offsetFor(pos, travel) {
    if (pos === 'center') return 0;
    if (pos === 'above') return -travel;
    return travel;
  }

  function place(glyph, pos, travel = measureTravel()) {
    glyph.pos = pos;
    glyph.el.style.transform = \`translateY(\${offsetFor(pos, travel)}px)\`;
  }

  function wantsCenter(glyph) {
    return isEngaged() ? !glyph.isRest : glyph.isRest;
  }

  function isWaiting(glyph) {
    if (!glyph.anim) return false;
    const time = Number(glyph.anim.currentTime) || 0;
    return time < glyph.delay;
  }

  function stop(glyph) {
    if (!glyph.anim) return;
    const anim = glyph.anim;
    glyph.anim = null;
    anim.cancel();
  }

  function move(glyph, to, delay) {
    const travel = measureTravel();
    const from = offsetFor(glyph.pos, travel);
    const target = offsetFor(to, travel);

    if (prefersReducedMotion() || duration <= 0) {
      place(glyph, to, travel);
      advance(glyph, 0);
      return;
    }

    const anim = glyph.el.animate([
      { transform: \`translateY(\${from}px)\` },
      { transform: \`translateY(\${target}px)\` },
    ], {
      duration,
      delay,
      easing: getEasing(),
      fill: 'forwards',
    });

    glyph.anim = anim;
    glyph.delay = delay;
    anim.finished.then(() => {
      if (glyph.anim !== anim) return;
      glyph.anim = null;
      place(glyph, to, travel);
      anim.cancel();
      advance(glyph, 0);
    }).catch(() => {});
  }

  function advance(glyph, delay) {
    if (glyph.anim) return;

    if (glyph.pos === 'above') place(glyph, 'below');

    if (wantsCenter(glyph)) {
      if (glyph.pos === 'below') move(glyph, 'center', delay);
    } else if (glyph.pos === 'center') {
      move(glyph, 'above', delay);
    }
  }

  function syncEngagement() {
    btn.setAttribute('aria-label', isEngaged() ? hoverLabel : restLabel);
    allGlyphs().forEach((glyph) => {
      // Not started yet: drop the pending move so the glyph can re-plan.
      if (isWaiting(glyph)) stop(glyph);
      advance(glyph, charDelay(glyph.index, glyph.total));
    });
  }

  function isIdle() {
    return allGlyphs().every((glyph) => !glyph.anim);
  }

  function settle() {
    const travel = measureTravel();
    allGlyphs().forEach((glyph) => {
      stop(glyph);
      place(glyph, wantsCenter(glyph) ? 'center' : 'below', travel);
    });
    btn.setAttribute('aria-label', isEngaged() ? hoverLabel : restLabel);
  }

  function rebuild() {
    allGlyphs().forEach(stop);
    renderLayers();
    settle();
  }

  btn.addEventListener('mouseenter', () => {
    pointerHover = true;
    syncEngagement();
  });

  btn.addEventListener('mouseleave', () => {
    pointerHover = false;
    syncEngagement();
  });

  btn.addEventListener('focus', () => {
    requestAnimationFrame(() => {
      if (!btn.matches(':focus-visible')) return;
      focusEngaged = true;
      syncEngagement();
    });
  });

  btn.addEventListener('blur', () => {
    focusEngaged = false;
    syncEngagement();
  });

  motionQuery.addEventListener('change', settle);

  rebuild();

  return {
    element: btn,
    setLabels(rest, hover) {
      const nextRest = rest ?? '';
      const nextHover = hover == null || hover === '' ? nextRest : hover;
      const labelsChanged = nextRest !== restLabel || nextHover !== hoverLabel;
      restLabel = nextRest;
      hoverLabel = nextHover;
      if (!labelsChanged && currentChars.length) return;
      rebuild();
    },
    setAnimation({ duration: ms, stagger: step, staggerMode: modeValue, easingRaw: easing } = {}) {
      if (ms != null) duration = ms;
      if (step != null) stagger = step;
      if (modeValue != null) staggerMode = modeValue;
      if (easing != null) easingRaw = easing;
    },
    applyStyles(styles = {}) {
      if (styles.background != null) btn.style.background = styles.background;
      if (styles.borderRadius != null) btn.style.borderRadius = styles.borderRadius;
      if (styles.border != null) btn.style.border = styles.border;
      if (styles.height != null) btn.style.height = styles.height;
      if (styles.width != null) btn.style.width = styles.width;
      if (styles.padding != null) btn.style.padding = styles.padding;
      if (styles.fontSize != null) btn.style.fontSize = styles.fontSize;
      if (isIdle()) rebuild();
    },
  };
};
`;
