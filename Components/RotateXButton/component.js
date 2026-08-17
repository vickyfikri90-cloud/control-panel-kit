window.initRotateXButton = function initRotateXButton(root, options = {}) {
  const btn = root.querySelector('#exp2-btn')
    || root.querySelector('.rotate-x-button')
    || root;
  const texts = btn.querySelectorAll('.text');

  let active = 0;
  let busy = false;
  let isHovered = false;

  let rotateDeg = options.rotateDeg ?? 90;
  let rotateAxis = normalizeAxis(options.rotateAxis ?? 'x');
  let originOffset = options.originOffset ?? 5000;
  let duration = options.duration ?? 350;
  let easingRaw = options.easingRaw ?? '0.7, 0, 0.25, 1';

  function normalizeAxis(value) {
    const axis = String(value).trim().toLowerCase();
    if (axis === 'y' || axis === 'z') return axis;
    return 'x';
  }

  function rotateProperty() {
    return `rotate${rotateAxis.toUpperCase()}`;
  }

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

  function getOrigin() {
    if (rotateAxis === 'y') {
      return `calc(100% + ${originOffset}px) 50%`;
    }
    return `50% calc(100% + ${originOffset}px)`;
  }

  function applyOrigin() {
    const origin = getOrigin();
    texts.forEach((el) => {
      el.style.transformOrigin = origin;
    });
  }

  function setRotation(el, degrees, animate) {
    el.style.transition = animate
      ? `transform ${duration}ms ${getEasing()}`
      : 'none';
    el.style.transform = `${rotateProperty()}(${degrees}deg)`;
  }

  function reset() {
    busy = false;
    active = 0;
    texts[0].classList.remove('is-hidden');
    texts[1].classList.add('is-hidden');
    applyOrigin();
    setRotation(texts[0], 0, false);
    setRotation(texts[1], rotateDeg, false);
  }

  function finishFlip(current, next) {
    setRotation(current, -rotateDeg, false);
    current.classList.add('is-hidden');
    next.classList.remove('is-hidden');
    active = 1 - active;
    busy = false;
    if (!isHovered) reset();
  }

  function flip() {
    if (busy) return;
    busy = true;

    const current = texts[active];
    const next = texts[1 - active];

    next.classList.add('is-hidden');
    setRotation(next, rotateDeg, false);
    next.offsetHeight;

    setRotation(current, -rotateDeg, true);
    setRotation(next, 0, true);

    setTimeout(() => finishFlip(current, next), duration);
  }

  btn.addEventListener('mouseenter', () => {
    isHovered = true;
    flip();
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
    setAnimation({
      rotateDeg: deg,
      rotateAxis: axis,
      originOffset: origin,
      duration: ms,
      easingRaw: easing,
    } = {}) {
      if (deg != null) rotateDeg = deg;
      if (axis != null) rotateAxis = normalizeAxis(axis);
      if (origin != null) originOffset = origin;
      if (ms != null) duration = ms;
      if (easing != null) easingRaw = easing;
      if (!busy) reset();
    },
    reset,
  };
};
