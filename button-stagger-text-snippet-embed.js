window.StaggerTextButtonSnippetJs = `window.initStaggerTextButton = function initStaggerTextButton(root, options = {}) {
  const btn = root.querySelector('#exp-button-stagger-text-btn')
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
        to: null,
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
    // Layout sizes (not getBoundingClientRect) so CSS zoom/transforms on the
    // preview don't shrink the travel distance.
    const line = label.offsetHeight;
    const buttonHeight = btn.offsetHeight;
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

  function animateGlyph(glyph, to, { from, target, ms, delay, easing, travel }) {
    const anim = glyph.el.animate([
      { transform: \`translateY(\${from}px)\` },
      { transform: \`translateY(\${target}px)\` },
    ], {
      duration: ms,
      delay,
      easing,
      fill: 'forwards',
    });

    glyph.anim = anim;
    glyph.delay = delay;
    glyph.to = to;
    anim.finished.then(() => {
      if (glyph.anim !== anim) return;
      glyph.anim = null;
      place(glyph, to, travel);
      anim.cancel();
      advance(glyph, 0);
    }).catch(() => {});
  }

  function move(glyph, to, delay) {
    const travel = measureTravel();

    if (prefersReducedMotion() || duration <= 0) {
      place(glyph, to, travel);
      advance(glyph, 0);
      return;
    }

    animateGlyph(glyph, to, {
      from: offsetFor(glyph.pos, travel),
      target: offsetFor(to, travel),
      ms: duration,
      delay,
      easing: getEasing(),
      travel,
    });
  }

  function readY(el) {
    const value = getComputedStyle(el).transform;
    if (!value || value === 'none') return 0;
    return new DOMMatrixReadOnly(value).m42;
  }

  function easingTail() {
    const match = getEasing().match(/^cubic-bezier\\(([^)]+)\\)$/);
    if (match) {
      const parts = match[1].split(',').map((n) => parseFloat(n));
      if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) return parts.slice(2);
    }
    return [0.35, 1];
  }

  // A glyph rising into the center that should now leave keeps rising: its
  // move is extended straight through to the top, starting at its current
  // speed so there's no stop or stutter at the center line.
  function passThrough(glyph) {
    const anim = glyph.anim;
    const travel = measureTravel();
    const target = -travel;
    const time = Number(anim.currentTime) || 0;
    const sample = 16;

    const y0 = readY(glyph.el);
    anim.currentTime = time + sample;
    const y1 = readY(glyph.el);
    anim.currentTime = time;

    const velocity = Math.min(0, (y1 - y0) / sample);
    const distance = target - y0;
    if (distance >= 0) return;

    const ms = Math.max(duration * 0.4, duration * (Math.abs(distance) / (travel * 2)) * 1.5);
    const slope = (velocity * ms) / distance;
    const x1 = 0.3;
    const y1c = Math.min(Math.max(slope * x1, 0), 1);
    const [x2, y2] = easingTail();

    glyph.anim = null;
    anim.cancel();
    animateGlyph(glyph, 'above', {
      from: y0,
      target,
      ms,
      delay: 0,
      easing: \`cubic-bezier(\${x1}, \${y1c.toFixed(3)}, \${x2}, \${y2})\`,
      travel,
    });
    // Start on this frame instead of the next so the hand-off doesn't hold a frame.
    glyph.anim.startTime = document.timeline.currentTime - sample / 2;
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
      if (glyph.anim && glyph.to === 'center' && !wantsCenter(glyph)) {
        passThrough(glyph);
        return;
      }
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
