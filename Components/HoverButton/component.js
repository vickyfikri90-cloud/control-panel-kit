window.initHoverButton = function initHoverButton(root, options = {}) {
  const btn = root.querySelector('#btn') || root.querySelector('.hover-button') || root;
  const texts = btn.querySelectorAll('.text');
  const utils = window.ComponentUtils;

  let active = 0;
  let busy = false;
  let isHovered = false;

  let slideGap = options.slideGap ?? 100;
  let duration = options.duration ?? 350;
  let easingRaw = options.easingRaw ?? '0.7, 0, 0.25, 1';

  function getEasing() {
    const raw = String(easingRaw).trim();
    if (!raw) return 'cubic-bezier(0.7, 0, 0.25, 1)';
    if (raw.startsWith('cubic-bezier(')) return raw;

    const parts = raw.split(',').map((n) => parseFloat(n.trim()));
    if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
      return `cubic-bezier(${parts.join(', ')})`;
    }

    return raw;
  }

  function getSlideMetrics() {
    const labelWidth = texts[active].offsetWidth;
    const travel = labelWidth + slideGap;
    return { travel };
  }

  function setTransform(el, x, animate) {
    el.style.transition = animate
      ? `transform ${duration}ms ${getEasing()}`
      : 'none';
    el.style.transform = `translateX(${x}px)`;
  }

  function reset() {
    const { travel } = getSlideMetrics();
    busy = false;
    active = 0;
    texts[0].classList.remove('is-hidden');
    texts[1].classList.add('is-hidden');
    setTransform(texts[0], 0, false);
    setTransform(texts[1], -travel, false);
  }

  function finishSlide(current, next, travel) {
    setTransform(current, -travel, false);
    current.classList.add('is-hidden');
    next.classList.remove('is-hidden');
    active = 1 - active;
    busy = false;
    if (!isHovered) reset();
  }

  function slide() {
    if (busy) return;
    busy = true;

    const { travel } = getSlideMetrics();
    const current = texts[active];
    const next = texts[1 - active];

    next.classList.add('is-hidden');
    setTransform(next, -travel, false);
    next.offsetHeight;

    setTransform(current, travel, true);
    setTransform(next, 0, true);

    setTimeout(() => finishSlide(current, next, travel), duration);
  }

  btn.addEventListener('mouseenter', () => {
    isHovered = true;
    slide();
  });

  btn.addEventListener('mouseleave', () => {
    isHovered = false;
    if (!busy) reset();
  });

  reset();

  return {
    element: btn,
    texts,
    setLabel(label) {
      texts.forEach((el) => {
        el.textContent = label;
      });
      if (!busy) reset();
    },
    applyStyles(styles = {}) {
      if (styles.background != null) btn.style.background = styles.background;
      if (styles.borderRadius != null) btn.style.borderRadius = styles.borderRadius;
      if (styles.border != null) btn.style.border = styles.border;
      if (styles.height != null) btn.style.height = styles.height;
      if (styles.width != null) btn.style.width = styles.width;
      if (styles.padding != null) btn.style.padding = styles.padding;
      if (!busy) reset();
    },
    setAnimation({ slideGap: gap, duration: ms, easingRaw: easing } = {}) {
      if (gap != null) slideGap = gap;
      if (ms != null) duration = ms;
      if (easing != null) easingRaw = easing;
      if (!busy) reset();
    },
    reset,
    getSlideMetrics,
  };
};
