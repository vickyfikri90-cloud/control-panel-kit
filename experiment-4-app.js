window.initExperiment4 = function initExperiment4() {
  const preview = document.querySelector('[data-experiment-preview="4"]');
  const panelRoot = document.querySelector('[data-experiment-panel="4"]');
  if (!preview || !panelRoot || preview.dataset.experimentReady === '1') return;

  const utils = window.ComponentUtils;

  const DEFAULT_COLORS = [
    { hex: 'FF6B6B', opacity: '100' },
    { hex: '4ECDC4', opacity: '100' },
    { hex: 'FFE66D', opacity: '100' },
    { hex: '5B8DEF', opacity: '100' },
    { hex: 'C77DFF', opacity: '100' },
  ];

  const carousel = window.initRotateXCarousel(preview, {
    count: 5,
    width: 600,
    height: 400,
    radius: 0,
    colors: DEFAULT_COLORS.map((item) => utils.colorWithOpacity(item.hex, item.opacity)),
    orbit: 600,
    perspective: 1200,
    stepDeg: 12,
    duration: 350,
    easingRaw: '0.7, 0, 0.25, 1',
    velocityIntensity: 1,
  });

  const controls = {
    count: document.getElementById('exp4-count'),
    radius: document.getElementById('exp4-radius'),
    rotate: document.getElementById('exp4-rotate'),
    orbit: document.getElementById('exp4-orbit'),
    perspective: document.getElementById('exp4-perspective'),
    duration: document.getElementById('exp4-duration'),
    velocity: document.getElementById('exp4-velocity'),
  };

  const easing = window.initCubicBezierInput(document.getElementById('exp4-easing-root'), {
    onChange: applyAll,
  });

  const dimensions = window.initDimensionControlGroup(panelRoot, {
    width: {
      initialMode: 'fixed',
      measure: () => 600,
      onChange: applyAll,
    },
    height: {
      initialMode: 'fixed',
      measure: () => 400,
      onChange: applyAll,
    },
  });

  const colorInputs = [1, 2, 3, 4, 5].map((index) => (
    window.initColorInput(document.getElementById(`exp4-color-${index}-root`), {
      onChange: applyAll,
    })
  ));

  const snippet = window.initSnippetOutput(document.getElementById('exp4-snippet-root'), {
    filename: 'experiment-4.html',
    getContent: generateSnippet,
    updateOnInit: false,
  });

  utils.bindInputWrapInputs(panelRoot);

  Object.values(controls).forEach((input) => {
    if (!(input instanceof HTMLInputElement)) return;
    input.addEventListener('input', applyAll);
  });

  [
    controls.count,
    controls.radius,
    controls.rotate,
    controls.orbit,
    controls.perspective,
    controls.duration,
    controls.velocity,
  ].forEach((input) => {
    utils.bindNumericArrowKey(input, applyAll);
  });

  colorInputs.forEach((colorInput) => {
    utils.bindNumericArrowKey(colorInput.opacityInput, applyAll, { isOpacity: true });
  });

  function clampCount(value) {
    return Math.min(12, Math.max(2, Math.round(utils.parsePx(value, 5))));
  }

  function getCount() {
    return clampCount(controls.count.value);
  }

  function getStepDeg() {
    return utils.parsePx(controls.rotate.value, 12);
  }

  function getOrbit() {
    return utils.parsePx(controls.orbit.value, 600);
  }

  function getPerspective() {
    return utils.parsePx(controls.perspective.value, 1200);
  }

  function getDuration() {
    return utils.parseMs(controls.duration.value, 350);
  }

  function getVelocityIntensity() {
    return Math.max(0, utils.parsePx(controls.velocity.value, 1));
  }

  function getEasing() {
    return easing.getValue();
  }

  function getColors() {
    return colorInputs.map((colorInput) => colorInput.getColor());
  }

  function getConfig() {
    return {
      count: getCount(),
      width: utils.parsePx(dimensions.width.getValue(), 600),
      height: utils.parsePx(dimensions.height.getValue(), 400),
      radius: utils.parsePx(controls.radius.value, 0),
      colors: getColors(),
      colorHexes: colorInputs.map((colorInput) => colorInput.getHex()),
      orbit: getOrbit(),
      perspective: getPerspective(),
      stepDeg: getStepDeg(),
      duration: getDuration(),
      velocityIntensity: getVelocityIntensity(),
      easing: getEasing(),
      easingRaw: easing.getRaw() || '0.7, 0, 0.25, 1',
    };
  }

  function collectSettings() {
    return {
      count: controls.count.value,
      radius: controls.radius.value,
      rotate: controls.rotate.value,
      orbit: controls.orbit.value,
      perspective: controls.perspective.value,
      duration: controls.duration.value,
      velocity: controls.velocity.value,
      easing: easing.getRaw(),
      widthMode: dimensions.width.getMode(),
      widthValue: dimensions.width.getValue(),
      heightMode: dimensions.height.getMode(),
      heightValue: dimensions.height.getValue(),
      colors: colorInputs.map((colorInput) => ({
        hex: colorInput.hexInput.value,
        opacity: colorInput.opacityInput.value,
      })),
    };
  }

  function applySettings(data) {
    if (!data) return;

    if (data.count != null) controls.count.value = data.count;
    if (data.radius != null) controls.radius.value = data.radius;
    if (data.rotate != null) controls.rotate.value = data.rotate;
    if (data.orbit != null) controls.orbit.value = data.orbit;
    if (data.perspective != null) controls.perspective.value = data.perspective;
    if (data.duration != null) controls.duration.value = data.duration;
    if (data.velocity != null) controls.velocity.value = data.velocity;
    if (data.easing != null) easing.setRaw(data.easing, false);

    if (data.widthMode) {
      dimensions.width.setMode(data.widthMode, false);
      if (data.widthMode === 'fixed' && data.widthValue != null) {
        dimensions.width.element.querySelector('.dimension-fixed-input').value =
          String(data.widthValue).replace(/px$/i, '');
      }
    }

    if (data.heightMode) {
      dimensions.height.setMode(data.heightMode, false);
      if (data.heightMode === 'fixed' && data.heightValue != null) {
        dimensions.height.element.querySelector('.dimension-fixed-input').value =
          String(data.heightValue).replace(/px$/i, '');
      }
    }

    if (Array.isArray(data.colors)) {
      data.colors.forEach((color, index) => {
        const colorInput = colorInputs[index];
        if (!colorInput || !color) return;
        if (color.hex != null) colorInput.hexInput.value = color.hex;
        if (color.opacity != null) colorInput.opacityInput.value = color.opacity;
        colorInput.updateUI(false);
      });
    }
  }

  window.ExperimentSettings = window.ExperimentSettings || {};
  window.ExperimentSettings['4'] = {
    collect: collectSettings,
    apply: applySettings,
  };

  const pending = window.__pendingExperimentDefaults?.['4'];
  if (pending) applySettings(pending);

  function applyAll() {
    const config = getConfig();

    carousel.apply({
      count: config.count,
      width: config.width,
      height: config.height,
      radius: config.radius,
      colors: config.colors,
      orbit: config.orbit,
      perspective: config.perspective,
      stepDeg: config.stepDeg,
      duration: config.duration,
      velocityIntensity: config.velocityIntensity,
      easingRaw: config.easingRaw,
    });

    dimensions.width.updateLabel();
    dimensions.height.updateLabel();
    snippet.update();
  }

  applyAll();

  function generateSnippet() {
    const config = getConfig();
    const easingRaw = config.easingRaw;
    const colorsJson = JSON.stringify(config.colors);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vertical 3D Carousel</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff;
      font-family: Inter, system-ui, sans-serif;
    }

    .rotate-x-carousel {
      position: relative;
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      touch-action: none;
      overflow: hidden;
    }

    .rotate-x-carousel__stage {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: visible;
      cursor: grab;
      user-select: none;
      transform-style: preserve-3d;
    }

    .rotate-x-carousel__stage.is-dragging {
      cursor: grabbing;
    }

    .rotate-x-carousel__ring {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 0;
      height: 0;
      transform-style: preserve-3d;
    }

    .rotate-x-carousel__card {
      position: absolute;
      left: 0;
      top: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      font-size: 48px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.35);
      will-change: transform;
      backface-visibility: hidden;
      transform-style: preserve-3d;
    }

    .rotate-x-carousel__nav {
      position: absolute;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
      z-index: 2;
    }

    .rotate-x-carousel__nav-btn {
      width: 50px;
      height: 50px;
      padding: 0;
      border: none;
      border-radius: 0;
      background: #f0f0f0;
      color: #000;
      font-family: Inter, system-ui, sans-serif;
      font-size: 9px;
      font-weight: 500;
      line-height: 1;
      cursor: pointer;
      flex-shrink: 0;
    }
  </style>
</head>
<body>
  <div class="rotate-x-carousel" data-carousel>
    <div class="rotate-x-carousel__stage">
      <div class="rotate-x-carousel__ring"></div>
    </div>
    <div class="rotate-x-carousel__nav">
      <button type="button" class="rotate-x-carousel__nav-btn" data-carousel-prev>Prev</button>
      <button type="button" class="rotate-x-carousel__nav-btn" data-carousel-next>Next</button>
    </div>
  </div>

  <script>
    const CONFIG = {
      count: ${config.count},
      width: ${config.width},
      height: ${config.height},
      radius: ${config.radius},
      colors: ${colorsJson},
      orbit: ${config.orbit},
      perspective: ${config.perspective},
      stepDeg: ${config.stepDeg},
      duration: ${config.duration},
      velocityIntensity: ${config.velocityIntensity},
      easingRaw: ${JSON.stringify(easingRaw)},
    };

    const stage = document.querySelector('.rotate-x-carousel__stage');
    const ring = document.querySelector('.rotate-x-carousel__ring');
    const prevBtn = document.querySelector('[data-carousel-prev]');
    const nextBtn = document.querySelector('[data-carousel-next]');
    let count = CONFIG.count;
    let rotation = 0;
    let dragStartY = 0;
    let dragStartRotation = 0;
    let lastMoveY = 0;
    let lastMoveTime = 0;
    let velocityDegPerMs = 0;
    let isDragging = false;
    let isAnimating = false;
    let isMomentum = false;
    let activePointerId = null;
    let animationFrameId = null;

    function getEasing() {
      const raw = String(CONFIG.easingRaw).trim();
      if (!raw) return 'cubic-bezier(0.7, 0, 0.25, 1)';
      if (raw.startsWith('cubic-bezier(')) return raw;

      const parts = raw.split(',').map(function (n) { return parseFloat(n.trim()); });
      if (parts.length === 4 && parts.every(function (n) { return Number.isFinite(n); })) {
        return 'cubic-bezier(' + parts.join(', ') + ')';
      }

      return raw;
    }

    function getDragRadius() {
      return Math.max(CONFIG.orbit, 1);
    }

    function pxVelocityToDegVelocity(pxPerMs) {
      return (pxPerMs / getDragRadius()) * (180 / Math.PI);
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
      const halfSpan = (count * CONFIG.stepDeg) / 2;
      return wrapAngle(index * CONFIG.stepDeg - rotation, halfSpan);
    }

    function getSpan() {
      return count * CONFIG.stepDeg;
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

    function applyStageStyles() {
      stage.style.perspective = CONFIG.perspective + 'px';
      stage.style.perspectiveOrigin = '50% 50%';
      ring.style.transform = 'translate(-50%, -50%) translateZ(' + (-CONFIG.orbit) + 'px)';
    }

    function setCardTransform(card, angle) {
      card.style.transition = 'none';
      card.style.transform =
        'translate(-50%, -50%) rotateX(' + angle + 'deg) translateZ(' + CONFIG.orbit + 'px)';
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

      const parts = inner.split(',').map(function (n) { return parseFloat(n.trim()); });
      if (parts.length === 4 && parts.every(function (n) { return Number.isFinite(n); })) {
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
      const coords = parseCubicBezier(getEasing());
      return createCubicBezierEase(coords[0], coords[1], coords[2], coords[3]);
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
        const progress = Math.min((now - startTime) / CONFIG.duration, 1);
        rotation = startRotation + delta * ease(progress);
        renderCards();

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(frame);
          return;
        }

        rotation = nextRotation;
        animationFrameId = null;
        isAnimating = false;
        ring.querySelectorAll('.rotate-x-carousel__card').forEach(function (card) {
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

      function momentumFrame(now) {
        if (!isMomentum) return;

        const dt = Math.min(now - lastTime, 32);
        lastTime = now;

        rotation += velocity * dt;
        velocity *= Math.pow(friction, dt / 16);
        renderCards();

        if (Math.abs(velocity) > minVelocity) {
          animationFrameId = requestAnimationFrame(momentumFrame);
          return;
        }

        isMomentum = false;
        animationFrameId = null;
        snapRotation();
      }

      animationFrameId = requestAnimationFrame(momentumFrame);
    }

    function ensureCards() {
      const existing = ring.querySelectorAll('.rotate-x-carousel__card');
      if (existing.length === count) return;

      ring.innerHTML = '';
      for (let i = 0; i < count; i += 1) {
        const card = document.createElement('div');
        card.className = 'rotate-x-carousel__card';
        card.textContent = String(i + 1);
        ring.appendChild(card);
      }
    }

    function applyCardStyles() {
      const cards = ring.querySelectorAll('.rotate-x-carousel__card');

      cards.forEach(function (card, index) {
        card.style.width = CONFIG.width + 'px';
        card.style.height = CONFIG.height + 'px';
        card.style.borderRadius = CONFIG.radius + 'px';
        card.style.background = CONFIG.colors[index % CONFIG.colors.length];
        card.textContent = String(index + 1);
      });
    }

    function renderCards() {
      applyStageStyles();
      ensureCards();
      applyCardStyles();

      const cards = ring.querySelectorAll('.rotate-x-carousel__card');
      cards.forEach(function (card, index) {
        setCardTransform(card, getRenderAngle(index, card));
      });
    }

    function snapRotation() {
      if (CONFIG.stepDeg <= 0) return;
      const snapped = Math.round(rotation / CONFIG.stepDeg) * CONFIG.stepDeg;
      if (snapped === rotation) return;
      animateRotationTo(snapped);
    }

    function stepBy(direction) {
      if (isAnimating || isDragging || isMomentum || CONFIG.stepDeg <= 0) return;
      animateRotationTo(rotation + direction * CONFIG.stepDeg);
    }

    stage.addEventListener('pointerdown', function (event) {
      if ((isAnimating && !isMomentum) || event.button !== 0) return;

      cancelAnimation();

      isDragging = true;
      activePointerId = event.pointerId;
      dragStartY = event.clientY;
      dragStartRotation = rotation;
      lastMoveY = event.clientY;
      lastMoveTime = performance.now();
      velocityDegPerMs = 0;
      stage.classList.add('is-dragging');
      stage.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    stage.addEventListener('pointermove', function (event) {
      if (!isDragging || event.pointerId !== activePointerId) return;

      const deltaY = event.clientY - dragStartY;
      const deltaDeg = (deltaY / getDragRadius()) * (180 / Math.PI);
      rotation = dragStartRotation + deltaDeg;

      const now = performance.now();
      const dt = now - lastMoveTime;
      if (dt > 0 && lastMoveTime > 0) {
        const instantVelocity = pxVelocityToDegVelocity((event.clientY - lastMoveY) / dt);
        velocityDegPerMs = velocityDegPerMs * 0.75 + instantVelocity * 0.25;
      }
      lastMoveY = event.clientY;
      lastMoveTime = now;

      renderCards();
      event.preventDefault();
    });

    function endDrag(event) {
      if (!isDragging || event.pointerId !== activePointerId) return;

      isDragging = false;
      activePointerId = null;
      stage.classList.remove('is-dragging');

      if (stage.hasPointerCapture(event.pointerId)) {
        stage.releasePointerCapture(event.pointerId);
      }

      const boostedVelocity = velocityDegPerMs * CONFIG.velocityIntensity;
      if (Math.abs(boostedVelocity) > 0.02) {
        startMomentum(boostedVelocity);
        return;
      }

      snapRotation();
    }

    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);

    prevBtn?.addEventListener('click', function () { stepBy(-1); });
    nextBtn?.addEventListener('click', function () { stepBy(1); });

    renderCards();
  <\/script>
</body>
</html>`;
  }

  preview.dataset.experimentReady = '1';
};
