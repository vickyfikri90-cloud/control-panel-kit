window.initFlipCarousel = function initFlipCarousel(root, options = {}) {
  const carousel = root.querySelector('[data-carousel]') || root;
  const stage = carousel.querySelector('.flip-carousel__stage') || carousel;
  let ring = stage.querySelector('.flip-carousel__ring');
  if (!ring) {
    ring = document.createElement('div');
    ring.className = 'flip-carousel__ring';
    stage.appendChild(ring);
  }
  const prevBtn = carousel.querySelector('[data-carousel-prev]');
  const nextBtn = carousel.querySelector('[data-carousel-next]');

  const DEFAULT_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#5B8DEF', '#C77DFF'];

  let mode = normalizeMode(options.mode ?? 'fan');
  let count = clampCount(options.count ?? 5);
  let colors = normalizeColors(options.colors ?? DEFAULT_COLORS);

  let fanWidth = options.fanWidth ?? 400;
  let fanHeight = options.fanHeight ?? 500;
  let fanRadius = options.fanRadius ?? 0;
  let fanOriginY = options.fanOriginY ?? 2000;
  let fanStepDeg = options.fanStepDeg ?? 12;
  let fanDuration = options.fanDuration ?? 350;
  let fanEasingRaw = options.fanEasingRaw ?? '0.7, 0, 0.25, 1';
  let fanVelocityIntensity = options.fanVelocityIntensity ?? 1;

  let horizWidth = options.horizWidth ?? 600;
  let horizHeight = options.horizHeight ?? 400;
  let horizRadius = options.horizRadius ?? 0;
  let horizOrbit = options.horizOrbit ?? 600;
  let horizPerspective = options.horizPerspective ?? 1200;
  let horizStepDeg = options.horizStepDeg ?? 12;
  let horizDuration = options.horizDuration ?? 350;
  let horizEasingRaw = options.horizEasingRaw ?? '0.7, 0, 0.25, 1';
  let horizVelocityIntensity = options.horizVelocityIntensity ?? 1;
  let horizHighlightScale = options.horizHighlightScale ?? 1.2;
  let horizOrientation = normalizeOrientation(options.horizOrientation ?? 'horizontal');
  let horizInputAction = normalizeInputAction(options.horizInputAction ?? 'drag');

  let transitionDuration = options.transitionDuration ?? 600;
  let transitionEasingRaw = options.transitionEasingRaw ?? '0.7, 0, 0.25, 1';

  let rotation = 0;
  let dragStartPointer = 0;
  let dragStartRotation = 0;
  let lastMovePointer = 0;
  let lastMoveTime = 0;
  let velocityDegPerMs = 0;
  let isDragging = false;
  let isAnimating = false;
  let isMomentum = false;
  let isFlipping = false;
  let flipAnimationFrameId = null;
  let activePointerId = null;
  let animationFrameId = null;
  let scrollSnapTimer = null;
  let wheelVelocityDegPerMs = 0;
  let lastWheelTime = 0;

  function normalizeMode(value) {
    return String(value).toLowerCase() === 'horizontal' ? 'horizontal' : 'fan';
  }

  function normalizeOrientation(value) {
    return String(value).toLowerCase() === 'horizontal' ? 'horizontal' : 'vertical';
  }

  function normalizeInputAction(value) {
    return String(value).toLowerCase() === 'scroll' ? 'scroll' : 'drag';
  }

  function isFanMode() {
    return mode === 'fan';
  }

  function isHorizontal3D() {
    return !isFanMode() && horizOrientation === 'horizontal';
  }

  function isScrollInput() {
    return !isFanMode() && horizInputAction === 'scroll';
  }

  function getActiveStepDeg() {
    return isFanMode() ? fanStepDeg : horizStepDeg;
  }

  function getActiveDuration() {
    return isFanMode() ? fanDuration : horizDuration;
  }

  function getActiveEasingRaw() {
    return isFanMode() ? fanEasingRaw : horizEasingRaw;
  }

  function getActiveVelocityIntensity() {
    return isFanMode() ? fanVelocityIntensity : horizVelocityIntensity;
  }

  function getPointerCoord(event) {
    if (isFanMode()) return event.clientX;
    return isHorizontal3D() ? event.clientX : event.clientY;
  }

  function getDragDirection() {
    if (isFanMode()) return -1;
    return isHorizontal3D() ? -1 : 1;
  }

  function clampCount(value) {
    return Math.min(12, Math.max(2, Math.round(Number(value) || 5)));
  }

  function normalizeColors(list) {
    if (!Array.isArray(list) || list.length === 0) return [...DEFAULT_COLORS];
    return list.map((color) => String(color));
  }

  function isFanModeFor(m) {
    return normalizeMode(m) === 'fan';
  }

  function isHorizontal3DFor(m) {
    return !isFanModeFor(m) && horizOrientation === 'horizontal';
  }

  function getStepDegFor(m) {
    return isFanModeFor(m) ? fanStepDeg : horizStepDeg;
  }

  function getCardAngleFor(index, m) {
    const stepDeg = getStepDegFor(m);
    const halfSpan = (count * stepDeg) / 2;
    return wrapAngle(index * stepDeg - rotation, halfSpan);
  }

  function getCardScaleForAngle(angle) {
    const scaleValue = getHighlightScale();
    const stepDeg = horizStepDeg;
    if (scaleValue === 1 || stepDeg <= 0) return 1;

    const falloff = stepDeg / 2;
    const proximity = Math.max(0, 1 - Math.abs(angle) / falloff);
    return 1 + (scaleValue - 1) * proximity;
  }

  function getLayoutState(m) {
    const fan = isFanModeFor(m);
    return {
      perspective: fan ? 100000 : horizPerspective,
      ringZ: fan ? 0 : -horizOrbit,
      borderRadius: fan ? fanRadius : horizRadius,
      isFan: fan,
    };
  }

  function getCardState(index, m) {
    const fan = isFanModeFor(m);
    const angle = getCardAngleFor(index, m);
    return {
      angle,
      width: fan ? fanWidth : horizWidth,
      height: fan ? fanHeight : horizHeight,
      scale: fan ? 1 : getCardScaleForAngle(angle),
      fanOriginY: fan ? fanOriginY : 0,
      orbit: fan ? 0 : horizOrbit,
      isFan: fan,
      useRotateY: !fan && isHorizontal3DFor(m),
      useRotateX: !fan && !isHorizontal3DFor(m),
    };
  }

  function getCards() {
    return Array.from(carousel.querySelectorAll('.flip-carousel__card'))
      .sort((a, b) => Number(a.dataset.index) - Number(b.dataset.index));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  const DEG = Math.PI / 180;

  function spreadFromAngle(angleDeg, radius) {
    if (radius <= 0 || !Number.isFinite(angleDeg)) return 0;
    return Math.sin(angleDeg * DEG) * radius;
  }

  function angleFromSpread(spread, radius, sign) {
    if (radius <= 0.001) return 0;
    const s = Math.min(1, Math.abs(spread) / radius);
    return (Math.asin(s) / DEG) * (sign >= 0 ? 1 : -1);
  }

  function getSpreadPresence(fromIsFan, t) {
    return {
      fanPresence: fromIsFan ? 1 - t : t,
      horizPresence: fromIsFan ? t : 1 - t,
    };
  }

  function applyFlipFrame(t, fromMode, toMode, fromLayout, toLayout, fromCards, toCards, cards) {
    const fromIsFan = fromLayout.isFan;
    const { fanPresence, horizPresence } = getSpreadPresence(fromIsFan, t);
    const layoutBlend = fromIsFan ? t : fanPresence;
    const perspective = lerp(fromLayout.perspective, toLayout.perspective, layoutBlend);
    const ringZ = lerp(fromLayout.ringZ, toLayout.ringZ, layoutBlend);
    const activeMode = t < 0.5 ? fromMode : toMode;

    if (perspective >= 99999) {
      stage.style.perspective = '';
    } else {
      stage.style.perspective = `${perspective}px`;
    }
    stage.style.perspectiveOrigin = '50% 50%';
    ring.style.transform = `translate(-50%, -50%) translateZ(${ringZ}px)`;

    carousel.classList.toggle('is-mode-fan', isFanModeFor(activeMode));
    carousel.classList.toggle(
      'is-mode-horizontal',
      !isFanModeFor(activeMode) && isHorizontal3DFor(activeMode),
    );
    carousel.classList.toggle(
      'is-mode-vertical',
      !isFanModeFor(activeMode) && !isHorizontal3DFor(activeMode),
    );

    cards.forEach((card, index) => {
      const from = fromCards[index];
      const to = toCards[index];
      const face = card.querySelector('.flip-carousel__card-face');

      const width = lerp(from.width, to.width, t);
      const height = lerp(from.height, to.height, t);
      const borderRadius = lerp(
        fromLayout.borderRadius,
        toLayout.borderRadius,
        t,
      );

      const fanOriginFull = fromIsFan ? from.fanOriginY : to.fanOriginY;
      const fanHeightFull = fromIsFan ? from.height : to.height;
      const fanAngleFull = fromIsFan ? from.angle : to.angle;
      const fanRadiusFull = fanOriginFull + fanHeightFull / 2;

      const horizAngleFull = fromIsFan ? to.angle : from.angle;
      const horizOrbitFull = fromIsFan ? to.orbit : from.orbit;
      const fromOrbitVal = from.isFan ? 0 : from.orbit;
      const toOrbitVal = to.isFan ? 0 : to.orbit;
      const orbitPresence = fromIsFan ? horizPresence : fanPresence;
      const blendedOrbit = lerp(fromOrbitVal, toOrbitVal, orbitPresence);

      let fanRot = 0;
      let horizRot = 0;
      let orbitZ = 0;
      let originY = 0;
      let applyFanRotate = false;

      if (fanPresence > 0.001 && fanRadiusFull > 0.001) {
        if (Math.abs(fanAngleFull) > 0.001) {
          const fullFanSpread = spreadFromAngle(fanAngleFull, fanRadiusFull);
          const targetFanSpread = fullFanSpread * fanPresence;
          fanRot = angleFromSpread(targetFanSpread, fanRadiusFull, fanAngleFull);
          originY = fanOriginFull * fanPresence;
          applyFanRotate = true;
        } else {
          fanRot = 0;
          originY = fanOriginFull * fanPresence;
          applyFanRotate = fanPresence > 0.001;
        }
      }

      if (horizPresence > 0.001 && horizOrbitFull > 0.001) {
        if (Math.abs(horizAngleFull) <= 0.001) {
          horizRot = 0;
          orbitZ = blendedOrbit;
        } else {
          const fullHorizSpread = spreadFromAngle(horizAngleFull, horizOrbitFull);
          const targetHorizSpread = fullHorizSpread * horizPresence;
          horizRot = horizAngleFull;
          const sinA = Math.sin(horizAngleFull * DEG);
          orbitZ = sinA > 0.001
            ? targetHorizSpread / sinA
            : blendedOrbit;
        }
      }

      const fromScale = from.scale;
      const toScale = to.scale;
      const scalePresence = horizPresence;
      const scale = lerp(fromScale, toScale, scalePresence);

      card.style.width = `${width}px`;
      card.style.height = `${height}px`;
      card.style.transition = 'none';
      card.style.transformOrigin = originY > 0.5
        ? `50% calc(100% + ${originY}px)`
        : 'center center';

      const useRotateY = horizPresence > 0.001 && (
        fromIsFan
          ? isHorizontal3DFor(toMode)
          : isHorizontal3DFor(fromMode)
      );
      const useRotateX = horizPresence > 0.001 && (
        fromIsFan
          ? !isHorizontal3DFor(toMode) && !isFanModeFor(toMode)
          : !isHorizontal3DFor(fromMode) && !isFanModeFor(fromMode)
      );

      let transform = 'translate(-50%, -50%)';
      if (applyFanRotate) transform += ` rotate(${fanRot}deg)`;
      if (useRotateY && Math.abs(horizRot) > 0.001) {
        transform += ` rotateY(${horizRot}deg)`;
      } else if (useRotateX && Math.abs(horizRot) > 0.001) {
        transform += ` rotateX(${horizRot}deg)`;
      }
      if (orbitZ > 0.001) transform += ` translateZ(${orbitZ}px)`;
      card.style.transform = transform;

      if (face) {
        face.style.borderRadius = `${borderRadius}px`;
        face.style.background = colors[index % colors.length];
        face.style.transition = 'none';
        if (scale > 1.001) {
          face.style.transform = `scale(${scale})`;
        } else if (fromScale > 1.001 && scalePresence > 0.001) {
          face.style.transform = `scale(${scale})`;
        } else {
          face.style.transform = '';
        }
      }

      card.classList.toggle('is-highlighted', scale > 1.001);
    });
  }

  function getEasingFromRaw(raw) {
    const trimmed = String(raw).trim();
    if (!trimmed) return 'cubic-bezier(0.7, 0, 0.25, 1)';
    if (trimmed.startsWith('cubic-bezier(')) return trimmed;

    const parts = trimmed.split(',').map((n) => parseFloat(n.trim()));
    if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
      return `cubic-bezier(${parts.join(', ')})`;
    }

    return trimmed;
  }

  function getFanOrigin() {
    return `50% calc(100% + ${fanOriginY}px)`;
  }

  function getFanDragRadius() {
    return Math.max(fanOriginY + fanHeight / 2, 1);
  }

  function getHorizDragRadius() {
    return Math.max(horizOrbit, 1);
  }

  function getDragRadius() {
    return isFanMode() ? getFanDragRadius() : getHorizDragRadius();
  }

  function pxVelocityToDegVelocity(pxPerMs) {
    return getDragDirection() * (pxPerMs / getDragRadius()) * (180 / Math.PI);
  }

  function getWheelDeltaPx(event) {
    let delta = isHorizontal3D()
      ? (Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY)
      : event.deltaY;

    if (event.deltaMode === 1) delta *= 16;
    else if (event.deltaMode === 2) delta *= window.innerHeight;

    return delta;
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
      const boostedVelocity = wheelVelocityDegPerMs * getActiveVelocityIntensity();
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
    const stepDeg = getActiveStepDeg();
    const halfSpan = (count * stepDeg) / 2;
    return wrapAngle(index * stepDeg - rotation, halfSpan);
  }

  function getSpan() {
    return count * getActiveStepDeg();
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

  function cancelFlipAnimation() {
    if (flipAnimationFrameId != null) {
      cancelAnimationFrame(flipAnimationFrameId);
      flipAnimationFrameId = null;
    }
  }

  function cancelAnimation() {
    cancelFlipAnimation();
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

  function getEaseFunction(raw) {
    const [x1, y1, x2, y2] = parseCubicBezier(getEasingFromRaw(raw));
    return createCubicBezierEase(x1, y1, x2, y2);
  }

  function animateRotationTo(nextRotation) {
    if (isFlipping || isAnimating || nextRotation === rotation) return;

    cancelAnimation();
    isAnimating = true;

    const startRotation = rotation;
    const delta = nextRotation - startRotation;
    const ease = getEaseFunction(getActiveEasingRaw());
    const duration = getActiveDuration();
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
      getCards().forEach((card) => {
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

  function getHighlightScale() {
    const value = Number(horizHighlightScale);
    return Number.isFinite(value) && value > 0 ? value : 1;
  }

  function getCardScaleFromAngle(angle) {
    const scaleValue = getHighlightScale();
    const stepDeg = horizStepDeg;
    if (scaleValue === 1 || stepDeg <= 0) return 1;

    const falloff = stepDeg / 2;
    const proximity = Math.max(0, 1 - Math.abs(angle) / falloff);
    return 1 + (scaleValue - 1) * proximity;
  }

  function applyStageStyles() {
    if (isFanMode()) {
      stage.style.perspective = '';
      stage.style.perspectiveOrigin = '';
      ring.style.transform = 'translate(-50%, -50%)';
      return;
    }

    stage.style.perspective = `${horizPerspective}px`;
    stage.style.perspectiveOrigin = '50% 50%';
    ring.style.transform = `translate(-50%, -50%) translateZ(${-horizOrbit}px)`;
  }

  function setFanCardTransform(card, angle) {
    card.style.transition = 'none';
    card.style.transformOrigin = getFanOrigin();
    card.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
  }

  function setHorizCardTransform(card, angle) {
    card.style.transition = 'none';
    card.style.transformOrigin = '';
    const rotate = isHorizontal3D() ? `rotateY(${angle}deg)` : `rotateX(${angle}deg)`;
    card.style.transform = `translate(-50%, -50%) ${rotate} translateZ(${horizOrbit}px)`;
  }

  function setCardScale(card, scale) {
    const face = card.querySelector('.flip-carousel__card-face');
    if (!face) return;

    face.style.transition = 'none';
    face.style.transform = scale === 1 ? '' : `scale(${scale})`;
  }

  function ensureCards() {
    const existing = getCards();
    const hasValidStructure = existing.length === count
      && (count === 0 || existing[0].querySelector('.flip-carousel__card-face'));

    if (hasValidStructure) return;

    ring.innerHTML = '';
    for (let i = 0; i < count; i += 1) {
      const card = document.createElement('div');
      card.className = 'flip-carousel__card';
      card.dataset.index = String(i);

      const face = document.createElement('div');
      face.className = 'flip-carousel__card-face';
      face.textContent = String(i + 1);
      card.appendChild(face);
      ring.appendChild(card);
    }
  }

  function applyCardStyles() {
    const cards = getCards();
    const width = isFanMode() ? fanWidth : horizWidth;
    const height = isFanMode() ? fanHeight : horizHeight;
    const borderRadius = isFanMode() ? fanRadius : horizRadius;

    cards.forEach((card, index) => {
      const face = card.querySelector('.flip-carousel__card-face');
      card.style.width = `${width}px`;
      card.style.height = `${height}px`;
      if (!face) return;

      face.style.borderRadius = `${borderRadius}px`;
      face.style.background = colors[index % colors.length];
      face.textContent = String(index + 1);
    });
  }

  function updateModeClasses() {
    carousel.classList.toggle('is-mode-fan', isFanMode());
    carousel.classList.toggle('is-mode-horizontal', !isFanMode() && isHorizontal3D());
    carousel.classList.toggle('is-mode-vertical', !isFanMode() && !isHorizontal3D());
    carousel.classList.toggle('is-scroll-input', isScrollInput());
  }

  function renderCards(options = {}) {
    if (isFlipping && !options.duringFlip) return;

    updateModeClasses();
    applyStageStyles();
    ensureCards();
    applyCardStyles();

    const cards = getCards();
    cards.forEach((card, index) => {
      const angle = getRenderAngle(index, card);

      if (isFanMode()) {
        setFanCardTransform(card, angle);
        setCardScale(card, 1);
        card.classList.remove('is-highlighted');
        return;
      }

      const scale = getCardScaleFromAngle(angle);
      setHorizCardTransform(card, angle);
      setCardScale(card, scale);
      card.classList.toggle('is-highlighted', scale > 1.001);
    });
  }

  function flipTo(targetMode, config = {}) {
    const toMode = normalizeMode(targetMode);
    if (isFlipping) return Promise.resolve(false);
    if (toMode === mode) return Promise.resolve(true);

    if (config.transitionDuration != null) transitionDuration = config.transitionDuration;
    if (config.transitionEasingRaw != null) transitionEasingRaw = config.transitionEasingRaw;

    const fromMode = mode;
    cancelAnimation();
    ensureCards();

    const cards = getCards();
    const fromLayout = getLayoutState(fromMode);
    const toLayout = getLayoutState(toMode);
    const fromCards = cards.map((_, index) => getCardState(index, fromMode));
    const toCards = cards.map((_, index) => getCardState(index, toMode));

    isFlipping = true;
    carousel.classList.add('is-flipping');
    mode = toMode;

    const ease = getEaseFunction(transitionEasingRaw);
    const duration = transitionDuration;
    const startTime = performance.now();

    applyFlipFrame(0, fromMode, toMode, fromLayout, toLayout, fromCards, toCards, cards);

    return new Promise((resolve) => {
      function frame(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const t = ease(progress);

        applyFlipFrame(t, fromMode, toMode, fromLayout, toLayout, fromCards, toCards, cards);

        if (progress < 1) {
          flipAnimationFrameId = requestAnimationFrame(frame);
          return;
        }

        applyFlipFrame(1, fromMode, toMode, fromLayout, toLayout, fromCards, toCards, cards);
        flipAnimationFrameId = null;
        isFlipping = false;
        carousel.classList.remove('is-flipping');
        cards.forEach((card) => {
          delete card.dataset.angle;
        });
        renderCards();
        resolve(true);
      }

      flipAnimationFrameId = requestAnimationFrame(frame);
    });
  }

  function snapRotation() {
    const stepDeg = getActiveStepDeg();
    if (stepDeg <= 0) return;
    const snapped = Math.round(rotation / stepDeg) * stepDeg;
    if (snapped === rotation) return;

    animateRotationTo(snapped);
  }

  function stepBy(direction) {
    if (isFlipping || isAnimating || isDragging || isMomentum || getActiveStepDeg() <= 0) return;
    animateRotationTo(rotation + direction * getActiveStepDeg());
  }

  function onPointerDown(event) {
    if (isFlipping || isScrollInput() || (isAnimating && !isMomentum) || event.button !== 0) return;

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
    const deltaDeg = getDragDirection() * (delta / getDragRadius()) * (180 / Math.PI);
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

    const boostedVelocity = velocityDegPerMs * getActiveVelocityIntensity();
    if (Math.abs(boostedVelocity) > 0.02) {
      startMomentum(boostedVelocity);
      return;
    }

    snapRotation();
  }

  function onWheel(event) {
    if (isFlipping || !isScrollInput()) return;
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

    if (config.colors != null) colors = normalizeColors(config.colors);

    if (config.fanWidth != null) fanWidth = config.fanWidth;
    if (config.fanHeight != null) fanHeight = config.fanHeight;
    if (config.fanRadius != null) fanRadius = config.fanRadius;
    if (config.fanOriginY != null) fanOriginY = config.fanOriginY;
    if (config.fanStepDeg != null) fanStepDeg = config.fanStepDeg;
    if (config.fanDuration != null) fanDuration = config.fanDuration;
    if (config.fanEasingRaw != null) fanEasingRaw = config.fanEasingRaw;
    if (config.fanVelocityIntensity != null) fanVelocityIntensity = config.fanVelocityIntensity;

    if (config.horizWidth != null) horizWidth = config.horizWidth;
    if (config.horizHeight != null) horizHeight = config.horizHeight;
    if (config.horizRadius != null) horizRadius = config.horizRadius;
    if (config.horizOrbit != null) horizOrbit = config.horizOrbit;
    if (config.horizPerspective != null) horizPerspective = config.horizPerspective;
    if (config.horizStepDeg != null) horizStepDeg = config.horizStepDeg;
    if (config.horizDuration != null) horizDuration = config.horizDuration;
    if (config.horizEasingRaw != null) horizEasingRaw = config.horizEasingRaw;
    if (config.horizVelocityIntensity != null) {
      horizVelocityIntensity = config.horizVelocityIntensity;
    }
    if (config.horizHighlightScale != null) horizHighlightScale = config.horizHighlightScale;
    if (config.horizOrientation != null) {
      horizOrientation = normalizeOrientation(config.horizOrientation);
    }
    if (config.horizInputAction != null) {
      horizInputAction = normalizeInputAction(config.horizInputAction);
    }

    if (config.transitionDuration != null) transitionDuration = config.transitionDuration;
    if (config.transitionEasingRaw != null) transitionEasingRaw = config.transitionEasingRaw;

    if (needsRebuild) {
      ring.innerHTML = '';
    }

    if (!isFlipping) {
      cancelAnimation();
      getCards().forEach((card) => {
        delete card.dataset.angle;
      });
      renderCards();
    }
  }

  renderCards();

  return {
    element: carousel,
    stage,
    ring,
    apply,
    flipTo,
    getMode: () => mode,
    getRotation: () => rotation,
    isFlipping: () => isFlipping,
    setRotation(value) {
      animateRotationTo(value);
    },
    reset() {
      cancelAnimation();
      rotation = 0;
      getCards().forEach((card) => {
        delete card.dataset.angle;
      });
      renderCards();
    },
  };
};
