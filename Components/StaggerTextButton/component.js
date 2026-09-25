window.initStaggerTextButton = function initStaggerTextButton(root, options = {}) {
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
  let animations = [];
  let runId = 0;
  let pointerHover = false;
  let focusEngaged = false;
  let mode = 'rest';

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
      return `cubic-bezier(${parts.join(', ')})`;
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
    return char === ' ' ? '\u00a0' : char;
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

  function renderLine(layer, text) {
    layer.replaceChildren();
    splitChars(text).forEach((char) => {
      const span = document.createElement('span');
      span.className = 'stagger-char';
      span.textContent = displayChar(char);
      span.setAttribute('aria-hidden', 'true');
      layer.appendChild(span);
    });
    return [...layer.querySelectorAll('.stagger-char')];
  }

  function renderLayers() {
    label.replaceChildren();

    const currentLayer = document.createElement('span');
    currentLayer.className = 'text text--current';

    const incomingLayer = document.createElement('span');
    incomingLayer.className = 'text text--incoming';
    incomingLayer.setAttribute('aria-hidden', 'true');

    currentChars = renderLine(currentLayer, restLabel);
    incomingChars = renderLine(incomingLayer, hoverLabel);

    label.appendChild(currentLayer);
    label.appendChild(incomingLayer);
  }

  function measureTravel() {
    const line = label.getBoundingClientRect().height;
    const buttonHeight = btn.getBoundingClientRect().height;
    const em = line > 0 ? line : 16;
    const box = buttonHeight > 0 ? buttonHeight : em;
    return Math.max(em, Math.ceil((box + em) / 2));
  }

  function pose(chars, y) {
    chars.forEach((el) => {
      el.style.transform = `translateY(${y}px)`;
    });
  }

  function clearEffects() {
    animations.forEach((anim) => anim.cancel());
    animations = [];
  }

  function settleRest() {
    clearEffects();
    const travel = measureTravel();
    pose(currentChars, 0);
    pose(incomingChars, travel);
    btn.setAttribute('aria-label', restLabel);
    mode = 'rest';
  }

  function settleEntered() {
    clearEffects();
    const travel = measureTravel();
    pose(currentChars, -travel);
    pose(incomingChars, 0);
    btn.setAttribute('aria-label', hoverLabel);
    mode = 'entered';
  }

  // Each char moves straight from → to; only the delay differs per char, so
  // center-out mode keeps the middle chars ahead and the wave reads as a chevron.
  function runLayer(chars, from, to) {
    const total = chars.length;
    const animDuration = prefersReducedMotion() ? 0 : Math.max(0, duration);
    return chars.map((el, index) => {
      return el.animate([
        { transform: `translateY(${from}px)` },
        { transform: `translateY(${to}px)` },
      ], {
        duration: animDuration,
        delay: charDelay(index, total),
        easing: getEasing(),
        fill: 'forwards',
      });
    });
  }

  function watch(id, onDone) {
    if (prefersReducedMotion()) {
      onDone();
      return;
    }
    Promise.all(animations.map((anim) => anim.finished.catch(() => {}))).then(() => {
      if (id !== runId) return;
      onDone();
    });
  }

  function finish(doneMode) {
    if (doneMode === 'entered') {
      if (!isEngaged()) {
        playLeave();
        return;
      }
      settleEntered();
      return;
    }

    if (isEngaged()) {
      playEnter();
      return;
    }

    settleRest();
  }

  function playEnter() {
    const id = ++runId;
    clearEffects();
    if (prefersReducedMotion()) {
      settleEntered();
      return;
    }
    const travel = measureTravel();
    pose(currentChars, 0);
    pose(incomingChars, travel);
    animations = [
      ...runLayer(currentChars, 0, -travel),
      ...runLayer(incomingChars, travel, 0),
    ];
    mode = 'entering';
    watch(id, () => finish('entered'));
  }

  function playLeave() {
    const id = ++runId;
    clearEffects();
    if (prefersReducedMotion()) {
      settleRest();
      return;
    }
    const travel = measureTravel();
    pose(currentChars, travel);
    pose(incomingChars, 0);
    animations = [
      ...runLayer(currentChars, travel, 0),
      ...runLayer(incomingChars, 0, -travel),
    ];
    mode = 'leaving';
    watch(id, () => finish('rest'));
  }

  function playForward(doneMode) {
    const id = ++runId;
    mode = doneMode === 'rest' ? 'leaving' : 'entering';
    animations.forEach((anim) => {
      anim.playbackRate = 1;
      anim.play();
    });
    watch(id, () => finish(doneMode));
  }

  function reverseCurrent(doneMode) {
    const id = ++runId;
    mode = doneMode === 'rest' ? 'reversing-enter' : 'reversing-leave';
    animations.forEach((anim) => {
      anim.playbackRate = -1;
      anim.play();
    });
    watch(id, () => finish(doneMode));
  }

  function onEngage() {
    if (mode === 'leaving') {
      reverseCurrent('entered');
      return;
    }
    if (mode === 'reversing-enter') {
      playForward('entered');
      return;
    }
    if (mode === 'entering' || mode === 'entered' || mode === 'reversing-leave') return;
    playEnter();
  }

  function onDisengage() {
    if (mode === 'entering') {
      reverseCurrent('rest');
      return;
    }
    if (mode === 'reversing-enter') return;
    if (mode === 'reversing-leave') {
      playForward('rest');
      return;
    }
    if (mode === 'rest' || mode === 'leaving') return;
    playLeave();
  }

  function syncEngagement() {
    if (isEngaged()) onEngage();
    else onDisengage();
  }

  function rebuild() {
    runId += 1;
    clearEffects();
    renderLayers();
    if (isEngaged()) settleEntered();
    else settleRest();
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

  motionQuery.addEventListener('change', () => {
    if (isEngaged()) settleEntered();
    else settleRest();
  });

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
      if (mode === 'rest' || mode === 'entered') rebuild();
    },
  };
};
