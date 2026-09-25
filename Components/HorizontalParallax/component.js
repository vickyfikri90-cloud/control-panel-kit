window.initHorizontalParallax = function initHorizontalParallax(root, options = {}) {
  const COUNT = 5;
  const IMAGE_SCALE = 1.2;

  const DEFAULT_IMAGE = 'Components/HorizontalParallax/assets/photo.png';

  let carousel = root.querySelector('[data-horizontal-parallax]');
  if (!carousel) {
    carousel = document.createElement('div');
    carousel.className = 'horizontal-parallax';
    carousel.dataset.horizontalParallax = '';
    root.appendChild(carousel);
  }

  carousel.innerHTML = [
    '<div class="horizontal-parallax__stage">',
    '<div class="horizontal-parallax__track"></div>',
    '</div>',
    '<div class="horizontal-parallax__nav">',
    '<button type="button" class="horizontal-parallax__nav-btn" data-carousel-prev>Prev</button>',
    '<button type="button" class="horizontal-parallax__nav-btn" data-carousel-next>Next</button>',
    '</div>',
  ].join('');

  const stage = carousel.querySelector('.horizontal-parallax__stage');
  const track = carousel.querySelector('.horizontal-parallax__track');
  const prevBtn = carousel.querySelector('[data-carousel-prev]');
  const nextBtn = carousel.querySelector('[data-carousel-next]');

  let config = normalizeConfig(options);
  let position = 0;
  let isDragging = false;
  let isAnimating = false;
  let isMomentum = false;
  let activePointerId = null;
  let dragStartClient = 0;
  let dragStartPosition = 0;
  let lastMoveClient = 0;
  let lastMoveTime = 0;
  let velocityItemsPerMs = 0;
  let animationFrameId = null;
  let scrollSnapTimer = null;
  let wheelVelocityItemsPerMs = 0;
  let lastWheelTime = 0;
  const cards = [];

  function isVertical() {
    return config.orientation === 'vertical';
  }

  function stepSize() {
    return isVertical() ? config.cardHeight + config.gap : config.cardWidth + config.gap;
  }

  function primaryClient(event) {
    return isVertical() ? event.clientY : event.clientX;
  }

  function clampNumber(value, fallback, min, max) {
    const next = Number(value);
    if (!Number.isFinite(next)) return fallback;
    return Math.min(max, Math.max(min, next));
  }

  function normalizeConfig(raw) {
    return {
      cardWidth: clampNumber(raw.cardWidth, 393, 1, Number.MAX_SAFE_INTEGER),
      cardHeight: clampNumber(raw.cardHeight, 263, 1, Number.MAX_SAFE_INTEGER),
      gap: clampNumber(raw.gap, 16, 0, 120),
      duration: clampNumber(raw.duration, 450, 80, 4000),
      velocityIntensity: clampNumber(raw.velocityIntensity, 1, 0, 8),
      easingRaw: String(raw.easingRaw ?? '0.7, 0, 0.25, 1'),
      imageScale: clampNumber(raw.imageScale, IMAGE_SCALE, 1, 2),
      orientation: raw.orientation === 'vertical' ? 'vertical' : 'horizontal',
      imageSrcs: normalizeImageSrcs(raw),
    };
  }

  function normalizeImageSrcs(raw) {
    const fallback = String(raw.imageSrc ?? DEFAULT_IMAGE).trim() || DEFAULT_IMAGE;
    if (Array.isArray(raw.imageSrcs) && raw.imageSrcs.length > 0) {
      return Array.from({ length: COUNT }, (_, index) => {
        const entry = String(raw.imageSrcs[index] ?? fallback).trim();
        return entry || fallback;
      });
    }
    return Array.from({ length: COUNT }, () => fallback);
  }

  function wrapOffset(index, pos) {
    let delta = index - pos;
    delta -= Math.round(delta / COUNT) * COUNT;
    return delta;
  }

  function wrapPositionValue(value) {
    return ((value % COUNT) + COUNT) % COUNT;
  }

  function imageShiftPx(offset) {
    const clamped = Math.max(-1, Math.min(1, offset));
    const bleed = (config.imageScale - 1) / 2;
    const base = isVertical() ? config.cardHeight : config.cardWidth;
    return clamped * base * bleed;
  }

  function parseCubicBezier(raw) {
    const trimmed = String(raw).trim();
    if (!trimmed) return [0.7, 0, 0.25, 1];

    let inner = trimmed;
    if (trimmed.startsWith('cubic-bezier(') && trimmed.endsWith(')')) {
      inner = trimmed.slice('cubic-bezier('.length, -1);
    }

    const parts = inner.split(',').map((n) => parseFloat(n.trim()));
    if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) return parts;
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
    const coords = parseCubicBezier(config.easingRaw);
    return createCubicBezierEase(coords[0], coords[1], coords[2], coords[3]);
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

  function clearScrollSnapTimer() {
    if (scrollSnapTimer != null) {
      clearTimeout(scrollSnapTimer);
      scrollSnapTimer = null;
    }
  }

  function getWheelDeltaPx(event) {
    let delta = isVertical()
      ? (Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX)
      : (Math.abs(event.deltaX) >= Math.abs(event.deltaY) ? event.deltaX : event.deltaY);

    if (event.deltaMode === 1) delta *= 16;
    else if (event.deltaMode === 2) delta *= window.innerHeight;

    return delta;
  }

  function scheduleScrollSnap() {
    clearScrollSnapTimer();
    scrollSnapTimer = setTimeout(() => {
      scrollSnapTimer = null;
      const boosted = wheelVelocityItemsPerMs * config.velocityIntensity;
      wheelVelocityItemsPerMs = 0;

      if (Math.abs(boosted) > 0.0012) {
        startMomentum(boosted);
        return;
      }

      snap();
    }, 120);
  }

  function onWheel(event) {
    if (isDragging || (isAnimating && !isMomentum)) return;

    event.preventDefault();
    cancelAnimation();

    const now = performance.now();
    const step = stepSize();
    const deltaPx = getWheelDeltaPx(event);
    position += deltaPx / step;

    const dt = now - lastWheelTime;
    if (dt > 0 && lastWheelTime > 0) {
      const instant = (deltaPx / step) / dt;
      wheelVelocityItemsPerMs = wheelVelocityItemsPerMs * 0.75 + instant * 0.25;
    }
    lastWheelTime = now;

    renderCards();
    scheduleScrollSnap();
  }

  function ensureCards() {
    if (cards.length === COUNT && cards.every((entry) => entry.img)) return;

    track.innerHTML = '';
    cards.length = 0;

    for (let i = 0; i < COUNT; i += 1) {
      const card = document.createElement('div');
      card.className = 'horizontal-parallax__card';
      const img = document.createElement('img');
      img.src = config.imageSrcs[i] || DEFAULT_IMAGE;
      img.alt = '';
      img.draggable = false;
      img.addEventListener('load', () => renderCards(), { once: true });

      const frame = document.createElement('div');
      frame.className = 'horizontal-parallax__frame';
      frame.appendChild(img);

      card.appendChild(frame);
      track.appendChild(card);
      cards.push({
        element: card,
        img,
      });
    }
  }

  function syncImageSources() {
    cards.forEach((card, index) => {
      if (!card.img) return;
      const src = config.imageSrcs[index] || DEFAULT_IMAGE;
      const current = card.img.getAttribute('src') || '';
      if (current === src) return;
      card.img.src = src;
      card.img.addEventListener('load', () => renderCards(), { once: true });
    });
  }

  function applyImageLayout(img, offset) {
    const scale = config.imageScale;
    const shiftPx = imageShiftPx(offset);
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.objectPosition = 'center center';
    if (isVertical()) {
      img.style.transform = `translate(-50%, calc(-50% + ${-shiftPx}px)) scale(${scale})`;
    } else {
      img.style.transform = `translate(calc(-50% + ${shiftPx}px), -50%) scale(${scale})`;
    }
  }

  function renderCards() {
    ensureCards();
    carousel.classList.toggle('is-vertical', isVertical());
    const step = stepSize();

    cards.forEach((card, index) => {
      const offset = wrapOffset(index, position);
      const axisOffset = offset * step;
      const axisTransform = isVertical()
        ? `translateY(${axisOffset}px)`
        : `translateX(${axisOffset}px)`;

      card.element.style.width = `${config.cardWidth}px`;
      card.element.style.height = `${config.cardHeight}px`;
      card.element.style.transform = `translate(-50%, -50%) ${axisTransform}`;
      card.element.style.zIndex = String(20 - Math.round(Math.abs(offset) * 2));
      applyImageLayout(card.img, offset);
      card.element.style.opacity = Math.abs(offset) > 2.6 ? '0' : '1';
    });
  }

  function animateTo(target, onComplete) {
    cancelAnimation();
    if (Math.abs(target - position) < 0.001) {
      position = wrapPositionValue(target);
      renderCards();
      if (onComplete) onComplete();
      return;
    }

    isAnimating = true;
    const start = position;
    const delta = target - start;
    const ease = getEaseFunction();
    const startTime = performance.now();

    function frame(now) {
      const progress = Math.min((now - startTime) / config.duration, 1);
      position = start + delta * ease(progress);
      renderCards();

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(frame);
        return;
      }

      position = wrapPositionValue(target);
      animationFrameId = null;
      isAnimating = false;
      renderCards();
      if (onComplete) onComplete();
    }

    animationFrameId = requestAnimationFrame(frame);
  }

  function snap(onComplete) {
    animateTo(Math.round(position), onComplete);
  }

  function stepBy(direction) {
    if (isDragging) return;
    cancelAnimation();
    animateTo(Math.round(position) + direction);
  }

  function startMomentum(initialVelocity) {
    if (!initialVelocity) {
      snap();
      return;
    }

    cancelAnimation();
    isMomentum = true;

    let velocity = initialVelocity;
    let lastTime = performance.now();
    const friction = 0.92;
    const minVelocity = 0.00035;

    function momentumFrame(now) {
      if (!isMomentum) return;

      const dt = Math.min(now - lastTime, 32);
      lastTime = now;
      position += velocity * dt;
      velocity *= Math.pow(friction, dt / 16);
      renderCards();

      if (Math.abs(velocity) > minVelocity) {
        animationFrameId = requestAnimationFrame(momentumFrame);
        return;
      }

      isMomentum = false;
      animationFrameId = null;
      snap();
    }

    animationFrameId = requestAnimationFrame(momentumFrame);
  }

  function onPointerDown(event) {
    if ((isAnimating && !isMomentum) || event.button !== 0) return;

    cancelAnimation();
    isDragging = true;
    activePointerId = event.pointerId;
    dragStartClient = primaryClient(event);
    dragStartPosition = position;
    lastMoveClient = primaryClient(event);
    lastMoveTime = performance.now();
    velocityItemsPerMs = 0;
    stage.classList.add('is-dragging');
    stage.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function onPointerMove(event) {
    if (!isDragging || event.pointerId !== activePointerId) return;

    const step = stepSize();
    const client = primaryClient(event);
    const deltaClient = client - dragStartClient;
    position = dragStartPosition - deltaClient / step;

    const now = performance.now();
    const dt = now - lastMoveTime;
    if (dt > 0) {
      const instant = -(client - lastMoveClient) / step / dt;
      velocityItemsPerMs = velocityItemsPerMs * 0.75 + instant * 0.25;
    }
    lastMoveClient = client;
    lastMoveTime = now;

    renderCards();
    event.preventDefault();
  }

  function endDrag(event) {
    if (!isDragging || event.pointerId !== activePointerId) return;

    isDragging = false;
    activePointerId = null;
    stage.classList.remove('is-dragging');

    if (stage.hasPointerCapture(event.pointerId)) {
      stage.releasePointerCapture(event.pointerId);
    }

    const boosted = velocityItemsPerMs * config.velocityIntensity;
    if (Math.abs(boosted) > 0.0012) {
      startMomentum(boosted);
      return;
    }

    snap();
  }

  stage.addEventListener('pointerdown', onPointerDown);
  stage.addEventListener('pointermove', onPointerMove);
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  carousel.addEventListener('wheel', onWheel, { passive: false });
  prevBtn?.addEventListener('click', () => stepBy(-1));
  nextBtn?.addEventListener('click', () => stepBy(1));

  renderCards();

  return {
    element: carousel,
    apply(next) {
      const prevSrcs = config.imageSrcs?.join('\0');
      config = normalizeConfig({ ...config, ...next });
      if (config.imageSrcs.join('\0') !== prevSrcs) syncImageSources();
      renderCards();
    },
  };
};
