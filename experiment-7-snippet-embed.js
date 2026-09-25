window.InfiniteCarouselSnippet = {
  css: `.cp-preview[data-experiment-preview="7"] {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: stretch;
  padding: 0;
  background: rgb(31, 10, 9);
}

.cp-preview[data-experiment-preview="7"] .infinite-carousel {
  flex: 1 1 auto;
  width: 100%;
  min-height: 0;
}

.infinite-carousel {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 72px;
  width: 100%;
  height: 100%;
  padding: 0;
  justify-content: center;
  align-items: stretch;
  background-color: rgb(31, 10, 9);
  overflow: hidden;
  font-family: "Satoshi", Inter, system-ui, sans-serif;
  color: rgba(255, 255, 255, 0.9);
  user-select: none;
  touch-action: none;
}

.infinite-carousel__header {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  width: 100%;
}

.infinite-carousel__heading {
  display: block;
  width: 100%;
  max-width: 1360px;
  height: auto;
}

.infinite-carousel__stage {
  position: relative;
  flex: 0 0 400px;
  width: 100%;
  height: 400px;
  max-height: 400px;
  overflow: hidden;
  cursor: grab;
  touch-action: none;
}

.infinite-carousel__stage.is-dragging {
  cursor: grabbing;
}

.infinite-carousel__track {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.infinite-carousel__card {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  border-radius: 24px;
  background-color: rgba(255, 255, 255, 0.05);
  overflow: hidden;
  will-change: transform, height;
  pointer-events: none;
}

.infinite-carousel__card::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-image: radial-gradient(
    ellipse 299.79px 249.14px at 100% -6.17%,
    rgb(182, 220, 207) 0%,
    rgb(253, 175, 91) 42.02%,
    rgb(239, 80, 39) 82.78%
  );
  opacity: var(--active-mix, 0);
  pointer-events: none;
}

.infinite-carousel__card-badge {
  position: relative;
  z-index: 1;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 32px;
  background-image: radial-gradient(
    ellipse 40.69px 40.37px at 15% 87.5%,
    rgb(182, 220, 207) 0%,
    rgb(253, 175, 91) 43.31%,
    rgb(239, 80, 39) 94.07%
  );
}

.infinite-carousel__card-badge::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-color: rgb(255, 255, 255);
  opacity: var(--active-mix, 0);
}

.infinite-carousel__card-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  display: block;
}

.infinite-carousel__card-icon--active,
.infinite-carousel__card-icon--idle {
  z-index: 1;
}

.infinite-carousel__card-icon--active {
  opacity: var(--active-mix, 0);
}

.infinite-carousel__card-icon--idle {
  opacity: calc(1 - var(--active-mix, 0));
}

.infinite-carousel__card-copy {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

.infinite-carousel__card-title {
  margin: 0;
  font-family: "Anton", sans-serif;
  font-size: 20px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: rgb(255, 255, 255);
}

.infinite-carousel__card-shows {
  margin: 0;
  font-family: "Satoshi", sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: -0.01em;
  color: rgba(255, 255, 255, 0.8);
}
`,
  js: `window.initInfiniteCarousel = function initInfiniteCarousel(root, options = {}) {
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
    \`<img class="infinite-carousel__heading" src="\${HEADING_SRC}" width="1360" height="86" alt="15+ podcast &amp; show category">\`,
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
        \`<img class="infinite-carousel__card-icon infinite-carousel__card-icon--active" src="\${ICON_ACTIVE}" alt="" aria-hidden="true">\`,
        \`<img class="infinite-carousel__card-icon infinite-carousel__card-icon--idle" src="\${ICON_IDLE}" alt="" aria-hidden="true">\`,
        '</div>',
        '<div class="infinite-carousel__card-copy">',
        \`<h3 class="infinite-carousel__card-title">\${item.title}</h3>\`,
        \`<p class="infinite-carousel__card-shows">\${item.shows}</p>\`,
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

      card.style.height = \`\${height}px\`;
      card.style.transform = \`translate(-50%, -50%) translateX(\${x}px)\`;
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
`,
  headingSrc: "data:image/svg+xml,%3Csvg%20width%3D%221360%22%20height%3D%2286%22%20viewBox%3D%220%200%201360%2086%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Crect%20x%3D%22607.5%22%20y%3D%227%22%20width%3D%222%22%20height%3D%226%22%20rx%3D%221%22%20fill%3D%22white%22%20fill-opacity%3D%220.9%22%2F%3E%0A%3Crect%20x%3D%22611.5%22%20y%3D%222%22%20width%3D%222%22%20height%3D%2216%22%20rx%3D%221%22%20fill%3D%22white%22%20fill-opacity%3D%220.9%22%2F%3E%0A%3Crect%20x%3D%22615.5%22%20y%3D%228%22%20width%3D%222%22%20height%3D%224%22%20rx%3D%221%22%20fill%3D%22white%22%20fill-opacity%3D%220.9%22%2F%3E%0A%3Crect%20x%3D%22619.5%22%20y%3D%225%22%20width%3D%222%22%20height%3D%2210%22%20rx%3D%221%22%20fill%3D%22white%22%20fill-opacity%3D%220.9%22%2F%3E%0A%3Cpath%20d%3D%22M642.969%209.932C642.969%2013.012%20640.953%2015.168%20638.083%2015.168C635.227%2015.168%20633.239%2013.012%20633.239%209.932C633.239%206.866%20635.241%204.696%20638.097%204.696C640.967%204.696%20642.969%206.852%20642.969%209.932ZM641.527%209.932C641.527%207.58%20640.155%206.026%20638.097%206.026C636.039%206.026%20634.681%207.58%20634.681%209.932C634.681%2012.284%20636.039%2013.852%20638.097%2013.852C640.155%2013.852%20641.527%2012.27%20641.527%209.932ZM646.054%2011.402V4.878H647.426V11.318C647.426%2012.942%20648.322%2013.838%20649.932%2013.838C651.528%2013.838%20652.41%2012.928%20652.41%2011.318V4.878H653.796V11.402C653.796%2013.726%20652.312%2015.168%20649.932%2015.168C647.538%2015.168%20646.054%2013.74%20646.054%2011.402ZM658.849%2015H657.477V4.878H661.299C663.469%204.878%20664.757%206.026%20664.757%207.916C664.757%209.316%20664.057%2010.324%20662.797%2010.73L664.855%2015H663.329L661.439%2010.996H658.849V15ZM658.849%206.11V9.778H661.313C662.587%209.778%20663.315%209.092%20663.315%207.93C663.315%206.754%20662.559%206.11%20661.299%206.11H658.849ZM677.465%2015.154C674.581%2015.154%20672.663%2013.082%20672.663%209.946C672.663%206.824%20674.637%204.71%20677.535%204.71C679.817%204.71%20681.567%206.068%20681.945%208.14H680.475C680.097%206.824%20678.963%206.026%20677.493%206.026C675.449%206.026%20674.105%207.566%20674.105%209.932C674.105%2012.298%20675.449%2013.838%20677.493%2013.838C678.977%2013.838%20680.153%2013.04%20680.531%2011.794H681.987C681.553%2013.81%20679.747%2015.154%20677.465%2015.154ZM685.107%2015H683.679L687.375%204.878H688.901L692.611%2015H691.169L690.259%2012.48H686.003L685.107%2015ZM687.963%207.062L686.423%2011.29H689.853L688.299%207.062C688.229%206.866%20688.159%206.628%20688.131%206.474C688.103%206.614%20688.033%206.852%20687.963%207.062ZM693.46%206.138V4.878H700.922V6.138H697.884V15H696.512V6.138H693.46ZM709.876%2015H703.702V4.878H709.876V6.138H705.074V9.302H709.4V10.52H705.074V13.726H709.876V15ZM717.604%205.998C715.42%205.998%20714.104%207.608%20714.104%2010.002C714.104%2012.452%20715.532%2013.866%20717.618%2013.866C719.34%2013.866%20720.726%2012.984%20720.726%2010.94V10.646H717.338V9.428H722.014V15.014H720.866L720.768%2013.642C720.222%2014.524%20718.99%2015.168%20717.506%2015.168C714.636%2015.168%20712.662%2013.096%20712.662%209.974C712.662%206.894%20714.65%204.71%20717.632%204.71C719.844%204.71%20721.566%205.984%20721.902%207.93H720.446C720.068%206.642%20718.948%205.998%20717.604%205.998ZM734.497%209.932C734.497%2013.012%20732.481%2015.168%20729.611%2015.168C726.755%2015.168%20724.767%2013.012%20724.767%209.932C724.767%206.866%20726.769%204.696%20729.625%204.696C732.495%204.696%20734.497%206.852%20734.497%209.932ZM733.055%209.932C733.055%207.58%20731.683%206.026%20729.625%206.026C727.567%206.026%20726.209%207.58%20726.209%209.932C726.209%2012.284%20727.567%2013.852%20729.625%2013.852C731.683%2013.852%20733.055%2012.27%20733.055%209.932ZM739.024%2015H737.652V4.878H741.474C743.644%204.878%20744.932%206.026%20744.932%207.916C744.932%209.316%20744.232%2010.324%20742.972%2010.73L745.03%2015H743.504L741.614%2010.996H739.024V15ZM739.024%206.11V9.778H741.488C742.762%209.778%20743.49%209.092%20743.49%207.93C743.49%206.754%20742.734%206.11%20741.474%206.11H739.024ZM750.415%2010.884L746.985%204.878H748.525L750.779%208.924C750.919%209.162%20751.003%209.358%20751.115%209.596C751.241%209.344%20751.269%209.26%20751.451%208.924L753.691%204.878H755.189L751.787%2010.884V15H750.415V10.884Z%22%20fill%3D%22white%22%20fill-opacity%3D%220.9%22%2F%3E%0A%3Cpath%20d%3D%22M365.793%2047.48C365.159%2048.264%20364.263%2048.8987%20363.105%2049.384C361.985%2049.8693%20360.903%2050.112%20359.857%2050.112V42.44C361.5%2042.1787%20363.124%2041.5253%20364.729%2040.48C366.372%2039.4347%20367.548%2038.072%20368.257%2036.392H375.985V84.552H365.793V47.48Z%22%20fill%3D%22%23FEFCFA%22%2F%3E%0A%3Cpath%20d%3D%22M390.996%2085.224C387.151%2085.224%20384.09%2084.2907%20381.812%2082.424C379.535%2080.52%20378.396%2077.72%20378.396%2074.024V66.912H388.42V71C388.42%2072.6427%20388.588%2073.9307%20388.924%2074.864C389.26%2075.7973%20389.951%2076.264%20390.996%2076.264C391.967%2076.264%20392.62%2075.9467%20392.956%2075.312C393.33%2074.6773%20393.516%2073.744%20393.516%2072.512V63.048C393.516%2061.5173%20393.348%2060.304%20393.012%2059.408C392.714%2058.4747%20392.06%2058.008%20391.052%2058.008C389.223%2058.008%20388.308%2059.3333%20388.308%2061.984H379.516V36.392H402.42V45.408H388.644V52.184C389.13%2051.5493%20389.783%2051.0267%20390.604%2050.616C391.426%2050.2053%20392.359%2050%20393.404%2050C397.436%2050%20400.18%2051.4187%20401.636%2054.256C403.13%2057.0933%20403.876%2061.1067%20403.876%2066.296C403.876%2070.5893%20403.559%2074.08%20402.924%2076.768C402.327%2079.4187%20401.095%2081.4907%20399.228%2082.984C397.362%2084.4773%20394.618%2085.224%20390.996%2085.224Z%22%20fill%3D%22%23FEFCFA%22%2F%3E%0A%3Cpath%20d%3D%22M411.052%2076.32V70.608H405.396V64.28H411.052V58.624H417.38V64.28H423.092V70.608H417.38V76.32H411.052Z%22%20fill%3D%22%23FEFCFA%22%2F%3E%0A%3Cpath%20d%3D%22M438.316%2036.448H451.028C454.873%2036.448%20457.617%2037.6987%20459.26%2040.2C460.902%2042.664%20461.724%2046.2853%20461.724%2051.064C461.724%2055.8427%20460.996%2059.4453%20459.54%2061.872C458.084%2064.2987%20455.47%2065.512%20451.7%2065.512H447.78V84.552H438.316V36.448ZM448.34%2056.832C449.497%2056.832%20450.337%2056.6267%20450.86%2056.216C451.42%2055.768%20451.774%2055.152%20451.924%2054.368C452.11%2053.5467%20452.204%2052.3893%20452.204%2050.896C452.204%2048.88%20451.98%2047.424%20451.532%2046.528C451.084%2045.632%20450.188%2045.184%20448.844%2045.184H447.78V56.832H448.34Z%22%20fill%3D%22%23FEFCFA%22%2F%3E%0A%3Cpath%20d%3D%22M475.65%2085C471.767%2085%20468.818%2083.824%20466.802%2081.472C464.786%2079.0827%20463.778%2075.7413%20463.778%2071.448V48.544C463.778%2044.4%20464.786%2041.2827%20466.802%2039.192C468.818%2037.064%20471.767%2036%20475.65%2036C479.532%2036%20482.482%2037.064%20484.498%2039.192C486.514%2041.2827%20487.522%2044.4%20487.522%2048.544V71.448C487.522%2075.7787%20486.514%2079.12%20484.498%2081.472C482.482%2083.824%20479.532%2085%20475.65%2085ZM475.65%2076.152C476.508%2076.152%20477.087%2075.7787%20477.386%2075.032C477.684%2074.2853%20477.834%2073.24%20477.834%2071.896V48.376C477.834%2047.3307%20477.684%2046.4907%20477.386%2045.856C477.124%2045.184%20476.564%2044.848%20475.706%2044.848C474.1%2044.848%20473.298%2046.0613%20473.298%2048.488V71.952C473.298%2073.3333%20473.466%2074.3787%20473.802%2075.088C474.138%2075.7973%20474.754%2076.152%20475.65%2076.152Z%22%20fill%3D%22%23FEFCFA%22%2F%3E%0A%3Cpath%20d%3D%22M490.844%2036.448H504.116C507.551%2036.448%20510.127%2037.4%20511.844%2039.304C513.561%2041.208%20514.439%2044.0267%20514.476%2047.76L514.588%2070.272C514.625%2075.0133%20513.804%2078.5787%20512.124%2080.968C510.444%2083.3573%20507.663%2084.552%20503.78%2084.552H490.844V36.448ZM502.212%2076.04C503.967%2076.04%20504.844%2075.1813%20504.844%2073.464V48.656C504.844%2047.5733%20504.751%2046.7707%20504.564%2046.248C504.415%2045.688%20504.116%2045.3147%20503.668%2045.128C503.22%2044.9413%20502.529%2044.848%20501.596%2044.848H500.532V76.04H502.212Z%22%20fill%3D%22%23FEFCFA%22%2F%3E%0A%3Cpath%20d%3D%22M529.101%2085C525.592%2085%20522.773%2083.8987%20520.645%2081.696C518.555%2079.4933%20517.509%2076.4693%20517.509%2072.624V50.448C517.509%2045.6693%20518.461%2042.0667%20520.365%2039.64C522.269%2037.2133%20525.256%2036%20529.325%2036C532.872%2036%20535.728%2036.9707%20537.893%2038.912C540.059%2040.8533%20541.141%2043.6533%20541.141%2047.312V55.6H531.565V48.488C531.565%2047.1067%20531.397%2046.1547%20531.061%2045.632C530.725%2045.1093%20530.147%2044.848%20529.325%2044.848C528.467%2044.848%20527.869%2045.1467%20527.533%2045.744C527.235%2046.3413%20527.085%2047.2187%20527.085%2048.376V72.512C527.085%2073.7813%20527.272%2074.7147%20527.645%2075.312C528.019%2075.872%20528.579%2076.152%20529.325%2076.152C530.819%2076.152%20531.565%2074.9387%20531.565%2072.512V63.832H541.253V72.904C541.253%2080.968%20537.203%2085%20529.101%2085Z%22%20fill%3D%22%23FEFCFA%22%2F%3E%0A%3Cpath%20d%3D%22M542.577%2084.552L547.225%2036.448H563.521L568.113%2084.552H558.985L558.313%2076.768H552.489L551.929%2084.552H542.577ZM553.217%2069.096H557.585L555.457%2044.624H555.009L553.217%2069.096Z%22%20fill%3D%22%23FEFCFA%22%2F%3E%0A%3Cpath%20d%3D%22M581.908%2085C577.54%2085%20574.386%2083.9173%20572.444%2081.752C570.503%2079.5867%20569.532%2076.096%20569.532%2071.28V66.576H578.996V72.568C578.996%2074.9573%20579.762%2076.152%20581.292%2076.152C582.151%2076.152%20582.748%2075.9093%20583.084%2075.424C583.42%2074.9013%20583.588%2074.0427%20583.588%2072.848C583.588%2071.28%20583.402%2069.992%20583.028%2068.984C582.655%2067.9387%20582.17%2067.08%20581.572%2066.408C581.012%2065.6987%20579.986%2064.616%20578.492%2063.16L574.348%2059.016C571.138%2055.88%20569.532%2052.408%20569.532%2048.6C569.532%2044.4933%20570.466%2041.376%20572.332%2039.248C574.236%2037.0827%20576.999%2036%20580.62%2036C584.951%2036%20588.068%2037.1573%20589.972%2039.472C591.876%2041.7493%20592.828%2045.3333%20592.828%2050.224H583.028L582.972%2046.92C582.972%2046.2853%20582.786%2045.7813%20582.412%2045.408C582.076%2045.0347%20581.591%2044.848%20580.956%2044.848C580.21%2044.848%20579.65%2045.0533%20579.276%2045.464C578.903%2045.8747%20578.716%2046.4347%20578.716%2047.144C578.716%2048.712%20579.612%2050.336%20581.404%2052.016L587.004%2057.392C588.311%2058.6613%20589.394%2059.8747%20590.252%2061.032C591.111%2062.152%20591.802%2063.496%20592.324%2065.064C592.847%2066.5947%20593.108%2068.424%20593.108%2070.552C593.108%2075.2933%20592.231%2078.896%20590.476%2081.36C588.759%2083.7867%20585.903%2085%20581.908%2085Z%22%20fill%3D%22%23FEFCFA%22%2F%3E%0A%3Cpath%20d%3D%22M599.881%2084.552V45.688H594.169V36.448H615.225V45.688H609.513V84.552H599.881Z%22%20fill%3D%22%23FEFCFA%22%2F%3E%0A%3Cpath%20d%3D%22M637.561%2085.112C634.686%2085.112%20632.502%2084.0853%20631.009%2082.032C629.516%2079.9787%20628.769%2077.3093%20628.769%2074.024C628.769%2070.3653%20629.292%2067.4347%20630.337%2065.232C631.382%2062.992%20633.025%2061.032%20635.265%2059.352C633.436%2055.768%20632.521%2052.6693%20632.521%2050.056C632.521%2047.3307%20633.398%2045.2027%20635.153%2043.672C636.945%2042.104%20639.241%2041.32%20642.041%2041.32C644.804%2041.32%20647.062%2042.0667%20648.817%2043.56C650.609%2045.016%20651.505%2047.0693%20651.505%2049.72C651.505%2053.6027%20649.358%2057.2427%20645.065%2060.64L646.801%2064.728C647.846%2061.9653%20649.414%2059.8187%20651.505%2058.288L655.313%2064.224C653.11%2065.9413%20651.318%2068.7787%20649.937%2072.736L654.809%2084.552H645.513L644.505%2081.92C643.721%2082.8533%20642.713%2083.6187%20641.481%2084.216C640.286%2084.8133%20638.98%2085.112%20637.561%2085.112ZM643.049%2053.696C643.422%2053.2853%20643.758%2052.7067%20644.057%2051.96C644.356%2051.176%20644.505%2050.4293%20644.505%2049.72C644.505%2048.6%20643.964%2048.04%20642.881%2048.04C642.433%2048.04%20642.078%2048.208%20641.817%2048.544C641.556%2048.8427%20641.425%2049.2347%20641.425%2049.72C641.425%2050.6907%20641.817%2052.184%20642.601%2054.2L643.049%2053.696ZM639.073%2078.112C639.782%2078.112%20640.38%2077.8507%20640.865%2077.328C641.35%2076.768%20641.668%2076.1333%20641.817%2075.424L638.513%2067.472L638.177%2067.976C637.878%2068.424%20637.636%2069.1333%20637.449%2070.104C637.262%2071.0747%20637.169%2072.0267%20637.169%2072.96V73.24C637.169%2074.696%20637.281%2075.872%20637.505%2076.768C637.729%2077.664%20638.252%2078.112%20639.073%2078.112Z%22%20fill%3D%22%23FEFCFA%22%2F%3E%0A%3Cpath%20d%3D%22M681.647%2085C677.279%2085%20674.125%2083.9173%20672.183%2081.752C670.242%2079.5867%20669.271%2076.096%20669.271%2071.28V66.576H678.735V72.568C678.735%2074.9573%20679.501%2076.152%20681.031%2076.152C681.89%2076.152%20682.487%2075.9093%20682.823%2075.424C683.159%2074.9013%20683.327%2074.0427%20683.327%2072.848C683.327%2071.28%20683.141%2069.992%20682.767%2068.984C682.394%2067.9387%20681.909%2067.08%20681.311%2066.408C680.751%2065.6987%20679.725%2064.616%20678.231%2063.16L674.087%2059.016C670.877%2055.88%20669.271%2052.408%20669.271%2048.6C669.271%2044.4933%20670.205%2041.376%20672.071%2039.248C673.975%2037.0827%20676.738%2036%20680.359%2036C684.69%2036%20687.807%2037.1573%20689.711%2039.472C691.615%2041.7493%20692.567%2045.3333%20692.567%2050.224H682.767L682.711%2046.92C682.711%2046.2853%20682.525%2045.7813%20682.151%2045.408C681.815%2045.0347%20681.33%2044.848%20680.695%2044.848C679.949%2044.848%20679.389%2045.0533%20679.015%2045.464C678.642%2045.8747%20678.455%2046.4347%20678.455%2047.144C678.455%2048.712%20679.351%2050.336%20681.143%2052.016L686.743%2057.392C688.05%2058.6613%20689.133%2059.8747%20689.991%2061.032C690.85%2062.152%20691.541%2063.496%20692.063%2065.064C692.586%2066.5947%20692.847%2068.424%20692.847%2070.552C692.847%2075.2933%20691.97%2078.896%20690.215%2081.36C688.498%2083.7867%20685.642%2085%20681.647%2085Z%22%20fill%3D%22%23FEFCFA%22%2F%3E%0A%3Cpath%20d%3D%22M695.476%2084.552V36.448H705.052V53.64H709.588V36.448H719.164V84.552H709.588V62.712H705.052V84.552H695.476Z%22%20fill%3D%22%23FEFCFA%22%2F%3E%0A%3Cpath%20d%3D%22M734.341%2085C730.459%2085%20727.509%2083.824%20725.493%2081.472C723.477%2079.0827%20722.469%2075.7413%20722.469%2071.448V48.544C722.469%2044.4%20723.477%2041.2827%20725.493%2039.192C727.509%2037.064%20730.459%2036%20734.341%2036C738.224%2036%20741.173%2037.064%20743.189%2039.192C745.205%2041.2827%20746.213%2044.4%20746.213%2048.544V71.448C746.213%2075.7787%20745.205%2079.12%20743.189%2081.472C741.173%2083.824%20738.224%2085%20734.341%2085ZM734.341%2076.152C735.2%2076.152%20735.779%2075.7787%20736.077%2075.032C736.376%2074.2853%20736.525%2073.24%20736.525%2071.896V48.376C736.525%2047.3307%20736.376%2046.4907%20736.077%2045.856C735.816%2045.184%20735.256%2044.848%20734.397%2044.848C732.792%2044.848%20731.989%2046.0613%20731.989%2048.488V71.952C731.989%2073.3333%20732.157%2074.3787%20732.493%2075.088C732.829%2075.7973%20733.445%2076.152%20734.341%2076.152Z%22%20fill%3D%22%23FEFCFA%22%2F%3E%0A%3Cpath%20d%3D%22M753.288%2084.552L748.136%2036.448H757.544L760.232%2066.8L762.92%2036.448H771.88L774.456%2066.8L777.032%2036.448H786.552L781.288%2084.552H769.752L767.344%2061.368L765.048%2084.552H753.288Z%22%20fill%3D%22%23FEFCFA%22%2F%3E%0A%3Cpath%20d%3D%22M812.608%2085C809.098%2085%20806.28%2083.8987%20804.152%2081.696C802.061%2079.4933%20801.016%2076.4693%20801.016%2072.624V50.448C801.016%2045.6693%20801.968%2042.0667%20803.872%2039.64C805.776%2037.2133%20808.762%2036%20812.832%2036C816.378%2036%20819.234%2036.9707%20821.4%2038.912C823.565%2040.8533%20824.648%2043.6533%20824.648%2047.312V55.6H815.072V48.488C815.072%2047.1067%20814.904%2046.1547%20814.568%2045.632C814.232%2045.1093%20813.653%2044.848%20812.832%2044.848C811.973%2044.848%20811.376%2045.1467%20811.04%2045.744C810.741%2046.3413%20810.592%2047.2187%20810.592%2048.376V72.512C810.592%2073.7813%20810.778%2074.7147%20811.152%2075.312C811.525%2075.872%20812.085%2076.152%20812.832%2076.152C814.325%2076.152%20815.072%2074.9387%20815.072%2072.512V63.832H824.76V72.904C824.76%2080.968%20820.709%2085%20812.608%2085Z%22%20fill%3D%22%23FEFCFA%22%2F%3E%0A%3Cpath%20d%3D%22M826.083%2084.552L830.731%2036.448H847.027L851.619%2084.552H842.491L841.819%2076.768H835.995L835.435%2084.552H826.083ZM836.723%2069.096H841.091L838.963%2044.624H838.515L836.723%2069.096Z%22%20fill%3D%22%23FEFCFA%22%2F%3E%0A%3Cpath%20d%3D%22M858.135%2084.552V45.688H852.423V36.448H873.479V45.688H867.767V84.552H858.135Z%22%20fill%3D%22%23FEFCFA%22%2F%3E%0A%3Cpath%20d%3D%22M875.634%2084.552V36.448H894.898V45.744H885.434V55.096H894.506V64.168H885.434V75.2H895.514V84.552H875.634Z%22%20fill%3D%22%23FEFCFA%22%2F%3E%0A%3Cpath%20d%3D%22M908.064%2085C904.592%2085%20901.998%2083.7867%20900.28%2081.36C898.6%2078.896%20897.76%2075.1813%20897.76%2070.216V49.496C897.76%2045.0533%20898.75%2041.6933%20900.728%2039.416C902.707%2037.1387%20905.656%2036%20909.576%2036C912.75%2036%20915.214%2036.6347%20916.968%2037.904C918.723%2039.1733%20919.936%2041.0213%20920.608%2043.448C921.28%2045.8747%20921.616%2048.992%20921.616%2052.8H912.208V48.488C912.208%2047.3307%20912.04%2046.4347%20911.704%2045.8C911.406%2045.1653%20910.846%2044.848%20910.024%2044.848C908.195%2044.848%20907.28%2046.0427%20907.28%2048.432V71.728C907.28%2073.184%20907.467%2074.2853%20907.84%2075.032C908.214%2075.7787%20908.867%2076.152%20909.8%2076.152C910.734%2076.152%20911.387%2075.7787%20911.76%2075.032C912.134%2074.2853%20912.32%2073.184%20912.32%2071.728V64.84H909.744V56.552H921.504V84.552H917.64L916.016%2080.52C914.299%2083.5067%20911.648%2085%20908.064%2085Z%22%20fill%3D%22%23FEFCFA%22%2F%3E%0A%3Cpath%20d%3D%22M936.252%2085C932.369%2085%20929.42%2083.824%20927.404%2081.472C925.388%2079.0827%20924.38%2075.7413%20924.38%2071.448V48.544C924.38%2044.4%20925.388%2041.2827%20927.404%2039.192C929.42%2037.064%20932.369%2036%20936.252%2036C940.134%2036%20943.084%2037.064%20945.1%2039.192C947.116%2041.2827%20948.124%2044.4%20948.124%2048.544V71.448C948.124%2075.7787%20947.116%2079.12%20945.1%2081.472C943.084%2083.824%20940.134%2085%20936.252%2085ZM936.252%2076.152C937.11%2076.152%20937.689%2075.7787%20937.988%2075.032C938.287%2074.2853%20938.436%2073.24%20938.436%2071.896V48.376C938.436%2047.3307%20938.287%2046.4907%20937.988%2045.856C937.727%2045.184%20937.166%2044.848%20936.308%2044.848C934.702%2044.848%20933.9%2046.0613%20933.9%2048.488V71.952C933.9%2073.3333%20934.068%2074.3787%20934.404%2075.088C934.74%2075.7973%20935.356%2076.152%20936.252%2076.152Z%22%20fill%3D%22%23FEFCFA%22%2F%3E%0A%3Cpath%20d%3D%22M951.446%2036.448H966.23C968.582%2036.448%20970.393%2036.9893%20971.662%2038.072C972.969%2039.1173%20973.846%2040.6107%20974.294%2042.552C974.742%2044.456%20974.966%2046.9013%20974.966%2049.888C974.966%2052.6133%20974.612%2054.7413%20973.902%2056.272C973.193%2057.8027%20971.961%2058.8667%20970.206%2059.464C971.662%2059.7627%20972.708%2060.4907%20973.342%2061.648C974.014%2062.8053%20974.35%2064.3733%20974.35%2066.352L974.238%2084.552H964.83V65.736C964.83%2064.392%20964.569%2063.5333%20964.046%2063.16C963.524%2062.7867%20962.572%2062.6%20961.19%2062.6V84.552H951.446V36.448ZM963.542%2054.256C964.886%2054.256%20965.558%2052.8%20965.558%2049.888C965.558%2048.6187%20965.502%2047.6667%20965.39%2047.032C965.278%2046.3973%20965.073%2045.968%20964.774%2045.744C964.476%2045.4827%20964.046%2045.352%20963.486%2045.352H961.246V54.256H963.542Z%22%20fill%3D%22%23FEFCFA%22%2F%3E%0A%3Cpath%20d%3D%22M983.398%2084.552V68.704L975.726%2036.448H985.246L987.934%2052.744L990.622%2036.448H1000.14L992.47%2068.704V84.552H983.398Z%22%20fill%3D%22%23FEFCFA%22%2F%3E%0A%3C%2Fsvg%3E",
};
