window.initRotateXCarousel = function initRotateXCarousel(root, options = {}) {
  const carousel = root.querySelector('[data-carousel]') || root;
  const stage = carousel.querySelector('.rotate-x-carousel__stage') || carousel;
  let ring = stage.querySelector('.rotate-x-carousel__ring');
  if (!ring) {
    ring = document.createElement('div');
    ring.className = 'rotate-x-carousel__ring';
    stage.appendChild(ring);
  }
  const prevBtn = carousel.querySelector('[data-carousel-prev]');
  const nextBtn = carousel.querySelector('[data-carousel-next]');

  const DEFAULT_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#5B8DEF', '#C77DFF'];

  let count = clampCount(options.count ?? 5);
  let width = options.width ?? 600;
  let height = options.height ?? 400;
  let radius = options.radius ?? 0;
  let colors = normalizeColors(options.colors ?? DEFAULT_COLORS);
  let orbit = options.orbit ?? 600;
  let perspective = options.perspective ?? 1200;
  let stepDeg = options.stepDeg ?? 12;
  let duration = options.duration ?? 350;
  let easingRaw = options.easingRaw ?? '0.7, 0, 0.25, 1';
  let velocityIntensity = options.velocityIntensity ?? 1;
  let highlightScale = options.highlightScale ?? 1;
  let orientation = normalizeOrientation(options.orientation ?? 'vertical');
  let inputAction = normalizeInputAction(options.inputAction ?? 'drag');
  let reverseScroll = Boolean(options.reverseScroll);

  let rotation = 0;
  let dragStartPointer = 0;
  let dragStartRotation = 0;
  let lastMovePointer = 0;
  let lastMoveTime = 0;
  let velocityDegPerMs = 0;
  let isDragging = false;
  let isAnimating = false;
  let isMomentum = false;
  let activePointerId = null;
  let animationFrameId = null;
  let scrollSnapTimer = null;
  let wheelVelocityDegPerMs = 0;
  let lastWheelTime = 0;

  function normalizeInputAction(value) {
    return String(value).toLowerCase() === 'scroll' ? 'scroll' : 'drag';
  }

  function isScrollInput() {
    return inputAction === 'scroll';
  }

  function normalizeOrientation(value) {
    return String(value).toLowerCase() === 'horizontal' ? 'horizontal' : 'vertical';
  }

  function isHorizontal() {
    return orientation === 'horizontal';
  }

  function getPointerCoord(event) {
    return isHorizontal() ? event.clientX : event.clientY;
  }

  function getDragDirection() {
    return isHorizontal() ? -1 : 1;
  }

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

  function getDragRadius() {
    return Math.max(orbit, 1);
  }

  function pxVelocityToDegVelocity(pxPerMs) {
    return getDragDirection() * (pxPerMs / getDragRadius()) * (180 / Math.PI);
  }

  function getWheelDeltaPx(event) {
    let delta = isHorizontal()
      ? (Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY)
      : event.deltaY;

    if (event.deltaMode === 1) delta *= 16;
    else if (event.deltaMode === 2) delta *= window.innerHeight;

    return reverseScroll ? -delta : delta;
  }

  function clearScrollSnapTimer() {
    if (scrollSnapTimer != null) {
      clearTimeout(scrollSnapTimer);
      scrollSnapTimer = null;
    }
  }

  function scheduleScrollSnap() {
    clearScrollSnapTimer();
    scrollSnapTimer = setTimeout(() => {
      scrollSnapTimer = null;
      const boostedVelocity = wheelVelocityDegPerMs * velocityIntensity;
      wheelVelocityDegPerMs = 0;

      if (Math.abs(boostedVelocity) > 0.02) {
        startMomentum(boostedVelocity);
        return;
      }

      snapRotation();
    }, 120);
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
    clearScrollSnapTimer();
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
      ring.querySelectorAll('.rotate-x-carousel__card').forEach((card) => {
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

  function applyStageStyles() {
    stage.style.perspective = `${perspective}px`;
    stage.style.perspectiveOrigin = '50% 50%';
    ring.style.transform = `translate(-50%, -50%) translateZ(${-orbit}px)`;
  }

  function getHighlightScale() {
    const value = Number(highlightScale);
    return Number.isFinite(value) && value > 0 ? value : 1;
  }

  function getCardScaleFromAngle(angle) {
    const scaleValue = getHighlightScale();
    if (scaleValue === 1 || stepDeg <= 0) return 1;

    const falloff = stepDeg / 2;
    const proximity = Math.max(0, 1 - Math.abs(angle) / falloff);
    return 1 + (scaleValue - 1) * proximity;
  }

  function setCardTransform(card, angle) {
    card.style.transition = 'none';
    const rotate = isHorizontal() ? `rotateY(${angle}deg)` : `rotateX(${angle}deg)`;
    card.style.transform =
      `translate(-50%, -50%) ${rotate} translateZ(${orbit}px)`;
  }

  function setCardScale(card, scale) {
    const face = card.querySelector('.rotate-x-carousel__card-face');
    if (!face) return;

    face.style.transition = 'none';
    face.style.transform = `scale(${scale})`;
  }

  function ensureCards() {
    const existing = ring.querySelectorAll('.rotate-x-carousel__card');
    const hasValidStructure = existing.length === count
      && (count === 0 || existing[0].querySelector('.rotate-x-carousel__card-face'));

    if (hasValidStructure) return;

    ring.innerHTML = '';
    for (let i = 0; i < count; i += 1) {
      const card = document.createElement('div');
      card.className = 'rotate-x-carousel__card';
      card.dataset.index = String(i);

      const face = document.createElement('div');
      face.className = 'rotate-x-carousel__card-face';
      face.textContent = String(i + 1);
      card.appendChild(face);
      ring.appendChild(card);
    }
  }

  function applyCardStyles() {
    const cards = ring.querySelectorAll('.rotate-x-carousel__card');

    cards.forEach((card, index) => {
      const face = card.querySelector('.rotate-x-carousel__card-face');
      card.style.width = `${width}px`;
      card.style.height = `${height}px`;
      if (!face) return;

      face.style.borderRadius = `${radius}px`;
      face.style.background = colors[index % colors.length];
      face.textContent = String(index + 1);
    });
  }

  function renderCards() {
    carousel.classList.toggle('is-horizontal', isHorizontal());
    carousel.classList.toggle('is-vertical', !isHorizontal());
    carousel.classList.toggle('is-scroll-input', isScrollInput());
    applyStageStyles();
    ensureCards();
    applyCardStyles();

    const cards = ring.querySelectorAll('.rotate-x-carousel__card');
    const angles = Array.from(cards, (card, index) => getRenderAngle(index, card));

    cards.forEach((card, index) => {
      const angle = angles[index];
      const scale = getCardScaleFromAngle(angle);
      setCardTransform(card, angle);
      setCardScale(card, scale);
      card.classList.toggle('is-highlighted', scale > 1.001);
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
    if (isScrollInput() || (isAnimating && !isMomentum) || event.button !== 0) return;

    cancelAnimation();

    isDragging = true;
    activePointerId = event.pointerId;
    dragStartPointer = getPointerCoord(event);
    dragStartRotation = rotation;
    lastMovePointer = getPointerCoord(event);
    lastMoveTime = performance.now();
    velocityDegPerMs = 0;
    stage.classList.add('is-dragging');
    stage.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function onPointerMove(event) {
    if (!isDragging || event.pointerId !== activePointerId) return;

    const delta = getPointerCoord(event) - dragStartPointer;
    const dragRadius = getDragRadius();
    const deltaDeg = getDragDirection() * (delta / dragRadius) * (180 / Math.PI);
    rotation = dragStartRotation + deltaDeg;

    const now = performance.now();
    const dt = now - lastMoveTime;
    if (dt > 0 && lastMoveTime > 0) {
      const instantVelocity = pxVelocityToDegVelocity(
        (getPointerCoord(event) - lastMovePointer) / dt,
      );
      velocityDegPerMs = velocityDegPerMs * 0.75 + instantVelocity * 0.25;
    }
    lastMovePointer = getPointerCoord(event);
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

  function onWheel(event) {
    if (!isScrollInput()) return;
    if (isDragging || (isAnimating && !isMomentum)) return;

    event.preventDefault();
    cancelAnimation();

    const now = performance.now();
    const deltaPx = getWheelDeltaPx(event);
    const deltaDeg = getDragDirection() * (deltaPx / getDragRadius()) * (180 / Math.PI);
    rotation += deltaDeg;

    const dt = now - lastWheelTime;
    if (dt > 0 && lastWheelTime > 0) {
      const instantVelocity = pxVelocityToDegVelocity(deltaPx / dt);
      wheelVelocityDegPerMs = wheelVelocityDegPerMs * 0.75 + instantVelocity * 0.25;
    }
    lastWheelTime = now;

    renderCards();
    scheduleScrollSnap();
  }

  stage.addEventListener('pointerdown', onPointerDown);
  stage.addEventListener('pointermove', onPointerMove);
  stage.addEventListener('pointerup', onPointerUp);
  stage.addEventListener('pointercancel', onPointerUp);
  stage.addEventListener('wheel', onWheel, { passive: false });

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
    if (config.orbit != null) orbit = config.orbit;
    if (config.perspective != null) perspective = config.perspective;
    if (config.stepDeg != null) stepDeg = config.stepDeg;
    if (config.duration != null) duration = config.duration;
    if (config.easingRaw != null) easingRaw = config.easingRaw;
    if (config.velocityIntensity != null) velocityIntensity = config.velocityIntensity;
    if (config.highlightScale != null) highlightScale = config.highlightScale;
    if (config.orientation != null) orientation = normalizeOrientation(config.orientation);
    if (config.inputAction != null) inputAction = normalizeInputAction(config.inputAction);
    if (config.reverseScroll != null) reverseScroll = Boolean(config.reverseScroll);

    if (needsRebuild) {
      ring.innerHTML = '';
    }

    cancelAnimation();
    ring.querySelectorAll('.rotate-x-carousel__card').forEach((card) => {
      delete card.dataset.angle;
    });
    renderCards();
  }

  renderCards();

  return {
    element: carousel,
    stage,
    ring,
    apply,
    getRotation: () => rotation,
    setRotation(value) {
      animateRotationTo(value);
    },
    reset() {
      cancelAnimation();
      rotation = 0;
      ring.querySelectorAll('.rotate-x-carousel__card').forEach((card) => {
        delete card.dataset.angle;
      });
      renderCards();
    },
  };
};
