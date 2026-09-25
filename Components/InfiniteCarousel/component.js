window.initInfiniteCarousel = function initInfiniteCarousel(root, options = {}) {
  const COUNT = 10;
  const CARD_WIDTH = 200;
  const GAP = 16;
  const STEP = CARD_WIDTH + GAP;
  const HEADING_SRC = options.headingSrc ?? 'Components/InfiniteCarousel/assets/heading.svg';

  const CARD_ITEMS = [
    { title: 'Health & Wellness', shows: '30 Shows' },
    { title: 'Business', shows: '30 Shows' },
    { title: 'Technology', shows: '30 Shows' },
    { title: 'Science', shows: '30 Shows' },
    { title: 'Education', shows: '30 Shows' },
    { title: 'Science & Culture', shows: '30 Shows' },
    { title: 'Comedy', shows: '30 Shows' },
    { title: 'News', shows: '30 Shows' },
    { title: 'Sports', shows: '30 Shows' },
    { title: 'True crime', shows: '30 Shows' },
  ];

  const ICON_ACTIVE =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIHZpZXdCb3g9IjAgMCAxNCAxNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIuMTQzMTkgMTEuODMwN0MyLjIwNTY5IDExLjg2MTkgMi42NzQ0NCAxMi4yMDU3IDQuMTQzMTkgMTEuNzM2OUM0LjQ4Njk0IDExLjYxMTkgNC44MzA2OSAxMS40ODY5IDUuMTc0NDQgMTEuMjk5NEM0LjczNjk0IDEwLjk1NTcgNC4yOTk0NCAxMC41NDk0IDMuODYxOTQgMTAuMTExOUMzLjQ1NTY5IDkuNzA1NjkgMy4wNDk0NCA5LjIzNjk0IDIuNjc0NDQgOC43OTk0NEMyLjUxODE5IDkuMTc0NDQgMi4zNjE5NCA5LjUxODE5IDIuMjY4MTkgOS44MzA2OUMxLjc2ODE5IDExLjI5OTQgMi4xMTE5NCAxMS43OTk0IDIuMTQzMTkgMTEuODMwN1pNMy43OTk0NCA2Ljk4Njk0QzQuMjM2OTQgNy41NDk0NCA0LjczNjk0IDguMTQzMTkgNS4yOTk0NCA4LjcwNTY5QzUuODYxOTQgOS4yNjgxOSA2LjQyNDQ0IDkuNzY4MTkgNy4wMTgxOSAxMC4xNzQ0QzcuNTgwNjkgOS43NjgxOSA4LjE0MzE5IDkuMjY4MTkgOC43MDU2OSA4LjcwNTY5QzkuMjk5NDQgOC4xNDMxOSA5Ljc2ODE5IDcuNTQ5NDQgMTAuMjA1NyA2Ljk4Njk0QzkuNzY4MTkgNi40MjQ0NCA5LjI5OTQ0IDUuODMwNjkgOC43MDU2OSA1LjI2ODE5QzguMTQzMTkgNC43MDU2OSA3LjU4MDY5IDQuMjA1NjkgNy4wMTgxOSAzLjc5OTQ0QzYuNDI0NDQgNC4yMDU2OSA1Ljg2MTk0IDQuNzA1NjkgNS4yOTk0NCA1LjI2ODE5QzQuNzM2OTQgNS44MzA2OSA0LjIzNjk0IDYuNDI0NDQgMy43OTk0NCA2Ljk4Njk0Wk01LjE3NDQ0IDIuNjc0NDRDNC44MzA2OSAyLjQ4Njk0IDQuNDg2OTQgMi4zNjE5NCA0LjE3NDQ0IDIuMjM2OTRDMi42NzQ0NCAxLjc2ODE5IDIuMjA1NjkgMi4xMTE5NCAyLjE3NDQ0IDIuMTQzMTlDMi4xMTE5NCAyLjE3NDQ0IDEuNzY4MTkgMi42NzQ0NCAyLjI2ODE5IDQuMTQzMTlDMi4zNjE5NCA0LjQ1NTY5IDIuNTE4MTkgNC43OTk0NCAyLjY3NDQ0IDUuMTc0NDRDMy4wNDk0NCA0LjczNjk0IDMuNDU1NjkgNC4yOTk0NCAzLjg2MTk0IDMuODYxOTRDNC4yOTk0NCAzLjQyNDQ0IDQuNzM2OTQgMy4wNDk0NCA1LjE3NDQ0IDIuNjc0NDRaTTcuMDE4MTkgMS4zOTMxOUM5LjU4MDY5IC0wLjEzODA2MSAxMi4wNDk0IC0wLjQ4MTgxMSAxMy4yNjgyIDAuNzM2OTM5QzE0LjQ4NjkgMS45NTU2OSAxNC4xNDMyIDQuNDI0NDQgMTIuNjExOSA2Ljk4Njk0QzE0LjE0MzIgOS41NDk0NCAxNC40ODY5IDEyLjAxODIgMTMuMjY4MiAxMy4yMzY5QzEyLjA0OTQgMTQuNDg2OSA5LjU4MDY5IDE0LjExMTkgNy4wMTgxOSAxMi41ODA3QzQuNDI0NDQgMTQuMTExOSAxLjk1NTY5IDE0LjQ4NjkgMC43MzY5MzkgMTMuMjM2OUMtMC40ODE4MTEgMTIuMDE4MiAtMC4xMzgwNjEgOS41NDk0NCAxLjM5MzE5IDYuOTg2OTRDLTAuMTM4MDYxIDQuNDI0NDQgLTAuNDgxODExIDEuOTU1NjkgMC43MzY5MzkgMC43MzY5MzlDMS45NTU2OSAtMC40ODE4MTEgNC40MjQ0NCAtMC4xMzgwNjEgNy4wMTgxOSAxLjM5MzE5Wk04LjgzMDY5IDIuNjc0NDRDOS4yNjgxOSAzLjA0OTQ0IDkuNzA1NjkgMy40MjQ0NCAxMC4xNDMyIDMuODYxOTRDMTAuNTQ5NCA0LjI5OTQ0IDEwLjk1NTcgNC43MzY5NCAxMS4zMzA3IDUuMTc0NDRDMTEuNDg2OSA0Ljc5OTQ0IDExLjY0MzIgNC40NTU2OSAxMS43MzY5IDQuMTQzMTlDMTIuMjM2OSAyLjY3NDQ0IDExLjg5MzIgMi4xNzQ0NCAxMS44NjE5IDIuMTQzMTlDMTEuNzk5NCAyLjExMTk0IDExLjMzMDcgMS43NjgxOSA5Ljg2MTk0IDIuMjM2OTRDOS41MTgxOSAyLjM2MTk0IDkuMTc0NDQgMi40ODY5NCA4LjgzMDY5IDIuNjc0NDRaTTExLjMzMDcgOC43OTk0NEMxMC45NTU3IDkuMjY4MTkgMTAuNTQ5NCA5LjcwNTY5IDEwLjE0MzIgMTAuMTExOUM5LjcwNTY5IDEwLjU0OTQgOS4yNjgxOSAxMC45NTU3IDguODMwNjkgMTEuMjk5NEM5LjE3NDQ0IDExLjQ4NjkgOS41MTgxOSAxMS42MTE5IDkuODYxOTQgMTEuNzM2OUMxMS4zMzA3IDEyLjIzNjkgMTEuNzk5NCAxMS44NjE5IDExLjg2MTkgMTEuODMwN0MxMS44OTMyIDExLjc5OTQgMTIuMjM2OSAxMS4yOTk0IDExLjczNjkgOS44MzA2OUMxMS42NDMyIDkuNTE4MTkgMTEuNDg2OSA5LjE3NDQ0IDExLjMzMDcgOC43OTk0NFpNOC4wMTgxOSA2Ljk4Njk0QzguMDE4MTkgNy41NDk0NCA3LjU0OTQ0IDguMDE4MTkgNi45ODY5NCA4LjAxODE5QzYuNDI0NDQgOC4wMTgxOSA1Ljk4Njk0IDcuNTQ5NDQgNS45ODY5NCA2Ljk4Njk0QzUuOTg2OTQgNi40MjQ0NCA2LjQyNDQ0IDUuOTg2OTQgNi45ODY5NCA1Ljk4Njk0QzcuNTQ5NDQgNS45ODY5NCA4LjAxODE5IDYuNDI0NDQgOC4wMTgxOSA2Ljk4Njk0WiIgZmlsbD0idXJsKCNwYWludDBfcmFkaWFsXzE4Nl8xMjE1KSIvPgo8ZGVmcz4KPHJhZGlhbEdyYWRpZW50IGlkPSJwYWludDBfcmFkaWFsXzE4Nl8xMjE1IiBjeD0iMCIgY3k9IjAiIHI9IjEiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMjIuMDE3IC0xNS44NDcyIDExLjA4MTIgMjQuNTIzOCAtMi4zNDU3IDE3LjMyMDYpIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNCNkRDQ0YiLz4KPHN0b3Agb2Zmc2V0PSIwLjQzMzEyNSIgc3RvcC1jb2xvcj0iI0ZEQUY1QiIvPgo8c3RvcCBvZmZzZXQ9IjAuOTQwNjUzIiBzdG9wLWNvbG9yPSIjRUY1MDI3Ii8+CjwvcmFkaWFsR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+Cg==';

  const ICON_IDLE =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIHZpZXdCb3g9IjAgMCAxNCAxNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIuMTQzMTkgMTEuODMwN0MyLjIwNTY5IDExLjg2MTkgMi42NzQ0NCAxMi4yMDU3IDQuMTQzMTkgMTEuNzM2OUM0LjQ4Njk0IDExLjYxMTkgNC44MzA2OSAxMS40ODY5IDUuMTc0NDQgMTEuMjk5NEM0LjczNjk0IDEwLjk1NTcgNC4yOTk0NCAxMC41NDk0IDMuODYxOTQgMTAuMTExOUMzLjQ1NTY5IDkuNzA1NjkgMy4wNDk0NCA5LjIzNjk0IDIuNjc0NDQgOC43OTk0NEMyLjUxODE5IDkuMTc0NDQgMi4zNjE5NCA5LjUxODE5IDIuMjY4MTkgOS44MzA2OUMxLjc2ODE5IDExLjI5OTQgMi4xMTE5NCAxMS43OTk0IDIuMTQzMTkgMTEuODMwN1pNMy43OTk0NCA2Ljk4Njk0QzQuMjM2OTQgNy41NDk0NCA0LjczNjk0IDguMTQzMTkgNS4yOTk0NCA4LjcwNTY5QzUuODYxOTQgOS4yNjgxOSA2LjQyNDQ0IDkuNzY4MTkgNy4wMTgxOSAxMC4xNzQ0QzcuNTgwNjkgOS43NjgxOSA4LjE0MzE5IDkuMjY4MTkgOC43MDU2OSA4LjcwNTY5QzkuMjk5NDQgOC4xNDMxOSA5Ljc2ODE5IDcuNTQ5NDQgMTAuMjA1NyA2Ljk4Njk0QzkuNzY4MTkgNi40MjQ0NCA5LjI5OTQ0IDUuODMwNjkgOC43MDU2OSA1LjI2ODE5QzguMTQzMTkgNC43MDU2OSA3LjU4MDY5IDQuMjA1NjkgNy4wMTgxOSAzLjc5OTQ0QzYuNDI0NDQgNC4yMDU2OSA1Ljg2MTk0IDQuNzA1NjkgNS4yOTk0NCA1LjI2ODE5QzQuNzM2OTQgNS44MzA2OSA0LjIzNjk0IDYuNDI0NDQgMy43OTk0NCA2Ljk4Njk0Wk01LjE3NDQ0IDIuNjc0NDRDNC44MzA2OSAyLjQ4Njk0IDQuNDg2OTQgMi4zNjE5NCA0LjE3NDQ0IDIuMjM2OTRDMi42NzQ0NCAxLjc2ODE5IDIuMjA1NjkgMi4xMTE5NCAyLjE3NDQ0IDIuMTQzMTlDMi4xMTE5NCAyLjE3NDQ0IDEuNzY4MTkgMi42NzQ0NCAyLjI2ODE5IDQuMTQzMTlDMi4zNjE5NCA0LjQ1NTY5IDIuNTE4MTkgNC43OTk0NCAyLjY3NDQ0IDUuMTc0NDRDMy4wNDk0NCA0LjczNjk0IDMuNDU1NjkgNC4yOTk0NCAzLjg2MTk0IDMuODYxOTRDNC4yOTk0NCAzLjQyNDQ0IDQuNzM2OTQgMy4wNDk0NCA1LjE3NDQ0IDIuNjc0NDRaTTcuMDE4MTkgMS4zOTMxOUM5LjU4MDY5IC0wLjEzODA2MSAxMi4wNDk0IC0wLjQ4MTgxMSAxMy4yNjgyIDAuNzM2OTM5QzE0LjQ4NjkgMS45NTU2OSAxNC4xNDMyIDQuNDI0NDQgMTIuNjExOSA2Ljk4Njk0QzE0LjE0MzIgOS41NDk0NCAxNC40ODY5IDEyLjAxODIgMTMuMjY4MiAxMy4yMzY5QzEyLjA0OTQgMTQuNDg2OSA5LjU4MDY5IDE0LjExMTkgNy4wMTgxOSAxMi41ODA3QzQuNDI0NDQgMTQuMTExOSAxLjk1NTY5IDE0LjQ4NjkgMC43MzY5MzkgMTMuMjM2OUMtMC40ODE4MTEgMTIuMDE4MiAtMC4xMzgwNjEgOS41NDk0NCAxLjM5MzE5IDYuOTg2OTRDLTAuMTM4MDYxIDQuNDI0NDQgLTAuNDgxODExIDEuOTU1NjkgMC43MzY5MzkgMC43MzY5MzlDMS45NTU2OSAtMC40ODE4MTEgNC40MjQ0NCAtMC4xMzgwNjEgNy4wMTgxOSAxLjM5MzE5Wk04LjgzMDY5IDIuNjc0NDRDOS4yNjgxOSAzLjA0OTQ0IDkuNzA1NjkgMy40MjQ0NCAxMC4xNDMyIDMuODYxOTRDMTAuNTQ5NCA0LjI5OTQ0IDEwLjk1NTcgNC43MzY5NCAxMS4zMzA3IDUuMTc0NDRDMTEuNDg2OSA0Ljc5OTQ0IDExLjY0MzIgNC40NTU2OSAxMS43MzY5IDQuMTQzMTlDMTIuMjM2OSAyLjY3NDQ0IDExLjg5MzIgMi4xNzQ0NCAxMS44NjE5IDIuMTQzMTlDMTEuNzk5NCAyLjExMTk0IDExLjMzMDcgMS43NjgxOSA5Ljg2MTk0IDIuMjM2OTRDOS41MTgxOSAyLjM2MTk0IDkuMTc0NDQgMi40ODY5NCA4LjgzMDY5IDIuNjc0NDRaTTExLjMzMDcgOC43OTk0NEMxMC45NTU3IDkuMjY4MTkgMTAuNTQ5NCA5LjcwNTY5IDEwLjE0MzIgMTAuMTExOUM5LjcwNTY5IDEwLjU0OTQgOS4yNjgxOSAxMC45NTU3IDguODMwNjkgMTEuMjk5NEM5LjE3NDQ0IDExLjQ4NjkgOS41MTgxOSAxMS42MTE5IDkuODYxOTQgMTEuNzM2OUMxMS4zMzA3IDEyLjIzNjkgMTEuNzk5NCAxMS44NjE5IDExLjg2MTkgMTEuODMwN0MxMS44OTMyIDExLjc5OTQgMTIuMjM2OSAxMS4yOTk0IDExLjczNjkgOS44MzA2OUMxMS42NDMyIDkuNTE4MTkgMTEuNDg2OSA5LjE3NDQ0IDExLjMzMDcgOC43OTk0NFpNOC4wMTgxOSA2Ljk4Njk0QzguMDE4MTkgNy41NDk0NCA3LjU0OTQ0IDguMDE4MTkgNi45ODY5NCA4LjAxODE5QzYuNDI0NDQgOC4wMTgxOSA1Ljk4Njk0IDcuNTQ5NDQgNS45ODY5NCA2Ljk4Njk0QzUuOTg2OTQgNi40MjQ0NCA2LjQyNDQ0IDUuOTg2OTQgNi45ODY5NCA1Ljk4Njk0QzcuNTQ5NDQgNS45ODY5NCA4LjAxODE5IDYuNDI0NDQgOC4wMTgxOSA2Ljk4Njk0WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==';

  let carousel = root.querySelector('[data-carousel]');
  if (!carousel) {
    carousel = document.createElement('div');
    carousel.className = 'infinite-carousel';
    carousel.dataset.carousel = '';
    root.appendChild(carousel);
  }

  carousel.innerHTML = [
    '<div class="infinite-carousel__header">',
    `<img class="infinite-carousel__heading" src="${HEADING_SRC}" width="1360" height="86" alt="15+ podcast &amp; show category">`,
    '</div>',
    '<div class="infinite-carousel__stage">',
    '<div class="infinite-carousel__track"></div>',
    '</div>',
  ].join('');

  const stage = carousel.querySelector('.infinite-carousel__stage');
  const track = carousel.querySelector('.infinite-carousel__track');

  let config = normalizeConfig(options);
  let position = 0;
  let isDragging = false;
  let isAnimating = false;
  let isMomentum = false;
  let activePointerId = null;
  let dragStartX = 0;
  let dragStartPosition = 0;
  let lastMoveX = 0;
  let lastMoveTime = 0;
  let velocityItemsPerMs = 0;
  let animationFrameId = null;
  let scrollSnapTimer = null;
  let wheelVelocityItemsPerMs = 0;
  let lastWheelTime = 0;
  let autoPlayTimer = null;
  let autoPlayPaused = false;
  const cards = [];

  function clampNumber(value, fallback, min, max) {
    const next = Number(value);
    if (!Number.isFinite(next)) return fallback;
    return Math.min(max, Math.max(min, next));
  }

  function normalizeConfig(raw) {
    return {
      heightActive: clampNumber(raw.heightActive, 400, 80, 800),
      heightA: clampNumber(raw.heightA, 320, 80, 800),
      heightB: clampNumber(raw.heightB, 240, 80, 800),
      heightC: clampNumber(raw.heightC, 360, 80, 800),
      duration: clampNumber(raw.duration, 450, 80, 4000),
      velocityIntensity: clampNumber(raw.velocityIntensity, 1, 0, 8),
      autoPlayInterval: clampNumber(raw.autoPlayInterval, 4000, 0, 60000),
      easingRaw: String(raw.easingRaw ?? '0.7, 0, 0.25, 1'),
    };
  }

  function heightForState(state) {
    if (state === 'active') return config.heightActive;
    if (state === 'a') return config.heightA;
    if (state === 'b') return config.heightB;
    return config.heightC;
  }

  function stateForDistance(distance) {
    const abs = Math.abs(distance);
    if (abs < 0.5) return 'active';
    if (abs < 1.5) return 'a';
    if (abs < 2.5) return 'b';
    return 'c';
  }

  function wrapOffset(index, pos) {
    let delta = index - pos;
    delta -= Math.round(delta / COUNT) * COUNT;
    return delta;
  }

  function wrapPositionValue(value) {
    return ((value % COUNT) + COUNT) % COUNT;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function heightForDistance(distance) {
    const abs = Math.abs(distance);
    if (abs <= 1) return lerp(config.heightActive, config.heightA, abs);
    if (abs <= 2) return lerp(config.heightA, config.heightB, abs - 1);
    if (abs <= 3) return lerp(config.heightB, config.heightC, abs - 2);
    return config.heightC;
  }

  function activeMix(distance) {
    return Math.max(0, 1 - Math.abs(distance));
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

  function clearAutoPlayTimer() {
    if (autoPlayTimer != null) {
      clearTimeout(autoPlayTimer);
      autoPlayTimer = null;
    }
  }

  function pauseAutoPlay() {
    autoPlayPaused = true;
    clearAutoPlayTimer();
  }

  function resumeAutoPlay() {
    autoPlayPaused = false;
    scheduleAutoPlay();
  }

  function scheduleAutoPlay() {
    clearAutoPlayTimer();
    if (autoPlayPaused || !config.autoPlayInterval || config.autoPlayInterval <= 0) return;

    autoPlayTimer = setTimeout(() => {
      autoPlayTimer = null;
      tickAutoPlay();
    }, config.autoPlayInterval);
  }

  function tickAutoPlay() {
    if (autoPlayPaused || isDragging || isMomentum || isAnimating) {
      scheduleAutoPlay();
      return;
    }

    animateTo(Math.round(position) + 1, () => {
      scheduleAutoPlay();
    });
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
    let delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;

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

      snap(resumeAutoPlay);
    }, 120);
  }

  function onWheel(event) {
    if (isDragging || (isAnimating && !isMomentum)) return;

    pauseAutoPlay();
    event.preventDefault();
    cancelAnimation();

    const now = performance.now();
    const deltaPx = getWheelDeltaPx(event);
    position += deltaPx / STEP;

    const dt = now - lastWheelTime;
    if (dt > 0 && lastWheelTime > 0) {
      const instant = (deltaPx / STEP) / dt;
      wheelVelocityItemsPerMs = wheelVelocityItemsPerMs * 0.75 + instant * 0.25;
    }
    lastWheelTime = now;

    renderCards();
    scheduleScrollSnap();
  }

  function ensureCards() {
    if (cards.length === COUNT) return;

    track.innerHTML = '';
    cards.length = 0;

    for (let i = 0; i < COUNT; i += 1) {
      const item = CARD_ITEMS[i % CARD_ITEMS.length];
      const card = document.createElement('div');
      card.className = 'infinite-carousel__card';
      card.innerHTML = [
        '<div class="infinite-carousel__card-badge">',
        `<img class="infinite-carousel__card-icon infinite-carousel__card-icon--active" src="${ICON_ACTIVE}" alt="" aria-hidden="true">`,
        `<img class="infinite-carousel__card-icon infinite-carousel__card-icon--idle" src="${ICON_IDLE}" alt="" aria-hidden="true">`,
        '</div>',
        '<div class="infinite-carousel__card-copy">',
        `<h3 class="infinite-carousel__card-title">${item.title}</h3>`,
        `<p class="infinite-carousel__card-shows">${item.shows}</p>`,
        '</div>',
      ].join('');
      track.appendChild(card);
      cards.push(card);
    }
  }

  function renderCards() {
    ensureCards();

    cards.forEach((card, index) => {
      const offset = wrapOffset(index, position);
      const height = heightForDistance(offset);
      const mix = activeMix(offset);
      const x = offset * STEP;

      card.style.height = `${height}px`;
      card.style.transform = `translate(-50%, -50%) translateX(${x}px)`;
      card.style.zIndex = String(20 - Math.round(Math.abs(offset) * 2));
      card.style.setProperty('--active-mix', String(mix));
      card.style.opacity = Math.abs(offset) > 4.2 ? '0' : '1';
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

  function startMomentum(initialVelocity) {
    if (!initialVelocity) {
      snap(resumeAutoPlay);
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
      snap(resumeAutoPlay);
    }

    animationFrameId = requestAnimationFrame(momentumFrame);
  }

  function onPointerDown(event) {
    if ((isAnimating && !isMomentum) || event.button !== 0) return;

    pauseAutoPlay();
    cancelAnimation();
    isDragging = true;
    activePointerId = event.pointerId;
    dragStartX = event.clientX;
    dragStartPosition = position;
    lastMoveX = event.clientX;
    lastMoveTime = performance.now();
    velocityItemsPerMs = 0;
    stage.classList.add('is-dragging');
    stage.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function onPointerMove(event) {
    if (!isDragging || event.pointerId !== activePointerId) return;

    const deltaX = event.clientX - dragStartX;
    position = dragStartPosition - deltaX / STEP;

    const now = performance.now();
    const dt = now - lastMoveTime;
    if (dt > 0) {
      const instant = -(event.clientX - lastMoveX) / STEP / dt;
      velocityItemsPerMs = velocityItemsPerMs * 0.75 + instant * 0.25;
    }
    lastMoveX = event.clientX;
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

    snap(resumeAutoPlay);
  }

  stage.addEventListener('pointerdown', onPointerDown);
  stage.addEventListener('pointermove', onPointerMove);
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  carousel.addEventListener('wheel', onWheel, { passive: false });

  renderCards();
  scheduleAutoPlay();

  return {
    element: carousel,
    apply(next) {
      config = normalizeConfig({ ...config, ...next });
      renderCards();
      if (!autoPlayPaused) scheduleAutoPlay();
    },
  };
};
