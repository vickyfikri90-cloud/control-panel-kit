window.initRotateCarousel = function initRotateCarousel(root, options = {}) {
  const carousel = root.querySelector('[data-carousel]') || root;
  const stage = carousel.querySelector('.rotate-carousel__stage')
    || carousel;
  const prevBtn = carousel.querySelector('[data-carousel-prev]');
  const nextBtn = carousel.querySelector('[data-carousel-next]');

  const DEFAULT_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#5B8DEF', '#C77DFF'];

  let count = clampCount(options.count ?? 5);
  let width = options.width ?? 400;
  let height = options.height ?? 500;
  let radius = options.radius ?? 0;
  let colors = normalizeColors(options.colors ?? DEFAULT_COLORS);
  let originY = options.originY ?? 2000;
  let stepDeg = options.stepDeg ?? 12;
  let duration = options.duration ?? 350;
  let easingRaw = options.easingRaw ?? '0.7, 0, 0.25, 1';
  let velocityIntensity = options.velocityIntensity ?? 1;

  let rotation = 0;
  let dragStartX = 0;
  let dragStartRotation = 0;
  let lastMoveX = 0;
  let lastMoveTime = 0;
  let velocityDegPerMs = 0;
  let isDragging = false;
  let isAnimating = false;
  let isMomentum = false;
  let activePointerId = null;
  let animationFrameId = null;

  function clampCount(value) {
    return Math.min(12, Math.max(2, Math.round(Number(value) || 5)));
  }

  function normalizeColors(list) {
    if (!Array.isArray(list) || list.length === 0) return [...DEFAULT_COLORS];
    return list.map((color) => String(color));
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
    return `50% calc(100% + ${originY}px)`;
  }

  function getDragRadius() {
    return Math.max(originY + height / 2, 1);
  }

  function pxVelocityToDegVelocity(pxPerMs) {
    return -(pxPerMs / getDragRadius()) * (180 / Math.PI);
  }

  function wrapAngle(angle, halfSpan) {
    const span = halfSpan * 2;
    if (span <= 0) return 0;
    let wrapped = angle;
    while (wrapped > halfSpan) wrapped -= span;
    while (wrapped <= -halfSpan) wrapped += span;
    return wrapped;
  }

  function getCardAngle(index) {
    const halfSpan = (count * stepDeg) / 2;
    return wrapAngle(index * stepDeg - rotation, halfSpan);
  }

  function getSpan() {
    return count * stepDeg;
  }

  function getRenderAngle(index, card) {
    const wrapped = getCardAngle(index);

    if (!isAnimating) {
      delete card.dataset.angle;
      return wrapped;
    }

    if (card.dataset.angle == null) {
      card.dataset.angle = String(wrapped);
      return wrapped;
    }

    const prev = Number.parseFloat(card.dataset.angle);
    let angle = wrapped;
    const span = getSpan();

    while (angle - prev > span / 2) angle -= span;
    while (angle - prev < -span / 2) angle += span;

    card.dataset.angle = String(angle);
    return angle;
  }

  function cancelAnimation() {
    if (animationFrameId != null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    isAnimating = false;
    isMomentum = false;
  }

  function parseCubicBezier(raw) {
    const trimmed = String(raw).trim();
    if (!trimmed) return [0.7, 0, 0.25, 1];

    let inner = trimmed;
    if (trimmed.startsWith('cubic-bezier(') && trimmed.endsWith(')')) {
      inner = trimmed.slice('cubic-bezier('.length, -1);
    }

    const parts = inner.split(',').map((n) => parseFloat(n.trim()));
    if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
      return parts;
    }

    return [0.7, 0, 0.25, 1];
  }

  function createCubicBezierEase(x1, y1, x2, y2) {
    const cx = 3 * x1;
    const bx = 3 * (x2 - x1) - cx;
    const ax = 1 - cx - bx;
    const cy = 3 * y1;
    const by = 3 * (y2 - y1) - cy;
    const ay = 1 - cy - by;

    function sampleX(t) {
      return ((ax * t + bx) * t + cx) * t;
    }

    function sampleY(t) {
      return ((ay * t + by) * t + cy) * t;
    }

    function sampleDerivativeX(t) {
      return (3 * ax * t + 2 * bx) * t + cx;
    }

    return function ease(time) {
      if (time <= 0) return 0;
      if (time >= 1) return 1;

      let t = time;
      for (let i = 0; i < 8; i += 1) {
        const x = sampleX(t) - time;
        const dx = sampleDerivativeX(t);
        if (Math.abs(x) < 1e-5 || dx === 0) break;
        t -= x / dx;
      }

      return sampleY(t);
    };
  }

  function getEaseFunction() {
    const [x1, y1, x2, y2] = parseCubicBezier(getEasing());
    return createCubicBezierEase(x1, y1, x2, y2);
  }

  function animateRotationTo(nextRotation) {
    if (isAnimating || nextRotation === rotation) return;

    cancelAnimation();
    isAnimating = true;

    const startRotation = rotation;
    const delta = nextRotation - startRotation;
    const ease = getEaseFunction();
    const startTime = performance.now();

    function frame(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      rotation = startRotation + delta * ease(progress);
      renderCards();

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(frame);
        return;
      }

      rotation = nextRotation;
      animationFrameId = null;
      isAnimating = false;
      stage.querySelectorAll('.rotate-carousel__card').forEach((card) => {
        delete card.dataset.angle;
      });
      renderCards();
    }

    animationFrameId = requestAnimationFrame(frame);
  }

  function startMomentum(initialVelocityDegPerMs) {
    if (!initialVelocityDegPerMs) {
      snapRotation();
      return;
    }

    cancelAnimation();
    isMomentum = true;

    let velocity = initialVelocityDegPerMs;
    let lastTime = performance.now();
    const friction = 0.92;
    const minVelocity = 0.002;

    function frame(now) {
      if (!isMomentum) return;

      const dt = Math.min(now - lastTime, 32);
      lastTime = now;

      rotation += velocity * dt;
      velocity *= friction ** (dt / 16);
      renderCards();

      if (Math.abs(velocity) > minVelocity) {
        animationFrameId = requestAnimationFrame(frame);
        return;
      }

      isMomentum = false;
      animationFrameId = null;
      snapRotation();
    }

    animationFrameId = requestAnimationFrame(frame);
  }

  function setCardTransform(card, angle) {
    card.style.transition = 'none';
    card.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
  }

  function ensureCards() {
    const existing = stage.querySelectorAll('.rotate-carousel__card');
    if (existing.length === count) return;

    stage.innerHTML = '';
    for (let i = 0; i < count; i += 1) {
      const card = document.createElement('div');
      card.className = 'rotate-carousel__card';
      card.dataset.index = String(i);
      card.textContent = String(i + 1);
      stage.appendChild(card);
    }
  }

  function applyCardStyles() {
    const cards = stage.querySelectorAll('.rotate-carousel__card');
    const origin = getOrigin();

    cards.forEach((card, index) => {
      card.style.width = `${width}px`;
      card.style.height = `${height}px`;
      card.style.borderRadius = `${radius}px`;
      card.style.background = colors[index % colors.length];
      card.style.transformOrigin = origin;
      card.textContent = String(index + 1);
    });
  }

  function renderCards() {
    ensureCards();
    applyCardStyles();

    const cards = stage.querySelectorAll('.rotate-carousel__card');
    cards.forEach((card, index) => {
      setCardTransform(card, getRenderAngle(index, card));
    });
  }

  function snapRotation() {
    if (stepDeg <= 0) return;
    const snapped = Math.round(rotation / stepDeg) * stepDeg;
    if (snapped === rotation) return;

    animateRotationTo(snapped);
  }

  function stepBy(direction) {
    if (isAnimating || isDragging || isMomentum || stepDeg <= 0) return;
    animateRotationTo(rotation + direction * stepDeg);
  }

  function onPointerDown(event) {
    if ((isAnimating && !isMomentum) || event.button !== 0) return;

    cancelAnimation();

    isDragging = true;
    activePointerId = event.pointerId;
    dragStartX = event.clientX;
    dragStartRotation = rotation;
    lastMoveX = event.clientX;
    lastMoveTime = performance.now();
    velocityDegPerMs = 0;
    stage.classList.add('is-dragging');
    stage.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function onPointerMove(event) {
    if (!isDragging || event.pointerId !== activePointerId) return;

    const deltaX = event.clientX - dragStartX;
    const dragRadius = getDragRadius();
    const deltaDeg = -(deltaX / dragRadius) * (180 / Math.PI);
    rotation = dragStartRotation + deltaDeg;

    const now = performance.now();
    const dt = now - lastMoveTime;
    if (dt > 0 && lastMoveTime > 0) {
      const instantVelocity = pxVelocityToDegVelocity((event.clientX - lastMoveX) / dt);
      velocityDegPerMs = velocityDegPerMs * 0.75 + instantVelocity * 0.25;
    }
    lastMoveX = event.clientX;
    lastMoveTime = now;

    renderCards();
    event.preventDefault();
  }

  function onPointerUp(event) {
    if (!isDragging || event.pointerId !== activePointerId) return;

    isDragging = false;
    activePointerId = null;
    stage.classList.remove('is-dragging');

    if (stage.hasPointerCapture(event.pointerId)) {
      stage.releasePointerCapture(event.pointerId);
    }

    const boostedVelocity = velocityDegPerMs * velocityIntensity;
    if (Math.abs(boostedVelocity) > 0.02) {
      startMomentum(boostedVelocity);
      return;
    }

    snapRotation();
  }

  stage.addEventListener('pointerdown', onPointerDown);
  stage.addEventListener('pointermove', onPointerMove);
  stage.addEventListener('pointerup', onPointerUp);
  stage.addEventListener('pointercancel', onPointerUp);

  prevBtn?.addEventListener('click', () => stepBy(-1));
  nextBtn?.addEventListener('click', () => stepBy(1));

  function apply(config = {}) {
    let needsRebuild = false;

    if (config.count != null) {
      const nextCount = clampCount(config.count);
      if (nextCount !== count) {
        count = nextCount;
        needsRebuild = true;
      }
    }

    if (config.width != null) width = config.width;
    if (config.height != null) height = config.height;
    if (config.radius != null) radius = config.radius;
    if (config.colors != null) colors = normalizeColors(config.colors);
    if (config.originY != null) originY = config.originY;
    if (config.stepDeg != null) stepDeg = config.stepDeg;
    if (config.duration != null) duration = config.duration;
    if (config.easingRaw != null) easingRaw = config.easingRaw;
    if (config.velocityIntensity != null) velocityIntensity = config.velocityIntensity;

    if (needsRebuild) {
      stage.innerHTML = '';
    }

    cancelAnimation();
    stage.querySelectorAll('.rotate-carousel__card').forEach((card) => {
      delete card.dataset.angle;
    });
    renderCards();
  }

  renderCards();

  return {
    element: carousel,
    stage,
    apply,
    getRotation: () => rotation,
    setRotation(value) {
      animateRotationTo(value);
    },
    reset() {
      cancelAnimation();
      rotation = 0;
      stage.querySelectorAll('.rotate-carousel__card').forEach((card) => {
        delete card.dataset.angle;
      });
      renderCards();
    },
  };
};
