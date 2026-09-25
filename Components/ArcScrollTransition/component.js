window.initArcScrollTransition = function initArcScrollTransition(root, options = {}) {
  const SECTION_COUNT = 4;
  const IMAGE_TITLES = 'Arc\nScroll\nTransition';
  const SOLID_TITLE = 'One System\nMany Possibilities';
  const SOLID_COLOR = 'rgb(130, 127, 103)';

  let container = root.querySelector('[data-arc-scroll]');
  if (!container) {
    root.innerHTML = '';
    const template = document.createElement('div');
    template.innerHTML = (
      '<div class="arc-scroll" data-arc-scroll>'
      + '<svg class="arc-scroll__svg" aria-hidden="true" width="0" height="0">'
      + '<defs><clipPath id="arc-scroll-clip" clipPathUnits="objectBoundingBox">'
      + '<path data-arc-clip-path></path>'
      + '</clipPath></defs></svg>'
      + '<div class="arc-scroll__viewport">'
      + '<div class="arc-scroll__track" data-arc-track></div>'
      + '<div class="arc-scroll__layer arc-scroll__layer--overlay" data-arc-overlay>'
      + '<div class="arc-scroll__overlay-inner" data-arc-overlay-inner></div>'
      + '</div></div></div>'
    );
    container = template.firstElementChild;
    root.appendChild(container);
  }

  const clipPathEl = container.querySelector('[data-arc-clip-path]');
  const track = container.querySelector('[data-arc-track]');
  const overlayLayer = container.querySelector('[data-arc-overlay]');
  const overlayInner = container.querySelector('[data-arc-overlay-inner]');

  if (!clipPathEl || !track || !overlayLayer || !overlayInner) {
    throw new Error('initArcScrollTransition: missing required elements');
  }

  const clipId = `arc-scroll-clip-${Math.random().toString(36).slice(2, 9)}`;
  const clipPathRoot = container.querySelector('#arc-scroll-clip') || container.querySelector('clipPath');
  if (clipPathRoot) {
    clipPathRoot.id = clipId;
    overlayLayer.style.clipPath = `url(#${clipId})`;
  }

  let config = normalizeConfig(options);
  let progress = clampProgress(options.progress ?? 0);
  let scrollVelocity = 0;
  let smoothedVelocity = 0;
  let lastWheelTime = 0;
  let animationFrameId = null;
  let isDragging = false;
  let dragStartY = 0;
  let dragStartProgress = 0;
  let activePointerId = null;
  let viewportHeight = 0;

  function normalizeConfig(raw) {
    return {
      sectionHeightVh: clampNumber(raw.sectionHeightVh ?? 150, 40, 300),
      bgImageHeightPercent: clampNumber(raw.bgImageHeightPercent ?? 100, 20, 200),
      positionMode: normalizeMode(raw.positionMode ?? 'burst-origin'),
      frontX: clampNumber(raw.frontX ?? 50, 0, 100),
      frontY: clampNumber(raw.frontY ?? 100, 0, 100),
      nextX: clampNumber(raw.nextX ?? 50, 0, 100),
      nextY: clampNumber(raw.nextY ?? 0, 0, 100),
      burstOriginX: clampNumber(raw.burstOriginX ?? 50, 0, 100),
      burstOriginY: clampNumber(raw.burstOriginY ?? 100, 0, 100),
      burstSize: clampNumber(raw.burstSize ?? 100, 10, 200),
      burstScale: clampNumber(raw.burstScale ?? 1, 0.1, 3),
      bgImage1: raw.bgImage1 ?? 'Components/ArcScrollTransition/assets/bg-1.png',
      bgImage2: raw.bgImage2 ?? 'Components/ArcScrollTransition/assets/bg-2.png',
      velocityIntensity: clampNumber(raw.velocityIntensity ?? 1, 0, 3),
      scrollSensitivity: clampNumber(raw.scrollSensitivity ?? 0.0009, 0.0002, 0.003),
    };
  }

  function normalizeMode(value) {
    const mode = String(value).toLowerCase();
    if (mode === 'peak-xy' || mode === 'seam-y') return mode;
    return 'burst-origin';
  }

  function clampNumber(value, min, max) {
    const n = Number(value);
    if (!Number.isFinite(n)) return min;
    return Math.min(max, Math.max(min, n));
  }

  function clampProgress(value) {
    let p = Number(value);
    if (!Number.isFinite(p)) p = 0;
    while (p < 0) p += SECTION_COUNT;
    while (p >= SECTION_COUNT) p -= SECTION_COUNT;
    return p;
  }

  function wrapProgress(value) {
    let p = value;
    while (p < 0) p += SECTION_COUNT;
    while (p >= SECTION_COUNT) p -= SECTION_COUNT;
    return p;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function getSectionMeta(index) {
    const i = ((index % SECTION_COUNT) + SECTION_COUNT) % SECTION_COUNT;
    const isImage = i === 0 || i === 2;
    return {
      index: i,
      type: isImage ? 'image' : 'solid',
      imageSrc: i === 0 ? config.bgImage1 : config.bgImage2,
      title: isImage ? IMAGE_TITLES : SOLID_TITLE,
    };
  }

  function getSectionPixelHeight() {
    const measured = container.clientHeight || root.clientHeight || window.innerHeight;
    viewportHeight = Math.max(measured, 1);
    return (config.sectionHeightVh / 100) * viewportHeight;
  }

  function buildSectionElement(meta) {
    const section = document.createElement('div');
    section.className = `arc-scroll__section arc-scroll__section--${meta.type}`;
    section.dataset.sectionIndex = String(meta.index);
    const sectionPx = getSectionPixelHeight();
    section.style.height = `${sectionPx}px`;

    if (meta.type === 'image') {
      const media = document.createElement('div');
      media.className = 'arc-scroll__media';
      media.style.height = `${config.bgImageHeightPercent}%`;

      const img = document.createElement('img');
      img.src = meta.imageSrc;
      img.alt = '';
      img.draggable = false;

      const shade = document.createElement('div');
      shade.className = 'arc-scroll__shade';

      media.appendChild(img);
      media.appendChild(shade);
      section.appendChild(media);
    } else {
      section.style.backgroundColor = SOLID_COLOR;
    }

    const title = document.createElement('h1');
    title.className = 'arc-scroll__title';
    title.textContent = meta.title;
    section.appendChild(title);

    return section;
  }

  function buildTrack() {
    track.innerHTML = '';
    for (let i = 0; i <= SECTION_COUNT; i += 1) {
      track.appendChild(buildSectionElement(getSectionMeta(i)));
    }
  }

  function getTransitionState() {
    const baseIndex = Math.floor(progress) % SECTION_COUNT;
    const overlayIndex = (baseIndex + 1) % SECTION_COUNT;
    const t = progress - Math.floor(progress);
    return { baseIndex, overlayIndex, t };
  }

  function getInterpolatedPoint(t) {
    return {
      x: lerp(config.frontX, config.nextX, t) / 100,
      y: lerp(config.frontY, config.nextY, t) / 100,
    };
  }

  function getVelocityBulge() {
    const v = Math.abs(smoothedVelocity) * config.velocityIntensity;
    return Math.min(0.45, v * 0.08);
  }

  function buildPeakClipPath(t, point, bulge) {
    if (t <= 0.0001) return 'M 0 0 L 0 0 Z';
    if (t >= 0.9999) return 'M 0 0 L 1 0 L 1 1 L 0 1 Z';

    const peakX = config.positionMode === 'seam-y' ? 0.5 : point.x;
    const seamY = 1 - t;
    const peakY = Math.min(point.y, seamY - 0.02) - bulge;
    const archDepth = Math.max(0.04, seamY - peakY);
    const cp1x = Math.min(0.98, peakX + 0.356);
    const cp2x = Math.max(0.02, peakX - 0.356);
    const cpY = peakY + archDepth * 0.72;

    return [
      'M 0 1',
      'L 1 1',
      `L 1 ${seamY.toFixed(4)}`,
      `C ${cp1x.toFixed(4)} ${cpY.toFixed(4)} ${(peakX + 0.02).toFixed(4)} ${peakY.toFixed(4)} ${peakX.toFixed(4)} ${peakY.toFixed(4)}`,
      `C ${(peakX - 0.02).toFixed(4)} ${peakY.toFixed(4)} ${cp2x.toFixed(4)} ${cpY.toFixed(4)} 0 ${seamY.toFixed(4)}`,
      'Z',
    ].join(' ');
  }

  function buildBurstClipPath(t, bulge) {
    if (t <= 0.0001) return 'M 0 0 L 0 0 Z';
    if (t >= 0.9999) return 'M 0 0 L 1 0 L 1 1 L 0 1 Z';

    const cx = config.burstOriginX / 100;
    const cy = config.burstOriginY / 100;
    const sizeNorm = (config.burstSize / 100) * config.burstScale;
    const radius = Math.min(2.2, t * sizeNorm * 1.35 + bulge * config.burstScale);
    const steps = 40;
    const points = [];

    for (let i = 0; i <= steps; i += 1) {
      const angle = Math.PI + (i / steps) * Math.PI;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      points.push(`${x.toFixed(4)} ${y.toFixed(4)}`);
    }

    return `M 0 1 L ${points.join(' L ')} L 1 1 Z`;
  }

  function updateClipPath(t, point, bulge) {
    let d = '';

    if (config.positionMode === 'burst-origin') {
      d = buildBurstClipPath(t, bulge);
    } else {
      d = buildPeakClipPath(t, point, bulge);
    }

    clipPathEl.setAttribute('d', d);
  }

  function mountOverlaySection(meta) {
    overlayInner.innerHTML = '';
    overlayInner.appendChild(buildSectionElement(meta));
  }

  function render() {
    const sectionPx = getSectionPixelHeight();

    track.style.transform = `translate3d(0, ${(-progress * sectionPx).toFixed(2)}px, 0)`;

    const { baseIndex, overlayIndex, t } = getTransitionState();
    const point = getInterpolatedPoint(t);
    const bulge = getVelocityBulge();

    if (t > 0.0001 && t < 0.9999) {
      mountOverlaySection(getSectionMeta(overlayIndex));
      const nextSectionTop = ((baseIndex + 1) * sectionPx) - (progress * sectionPx);
      overlayInner.style.transform = `translate3d(0, ${nextSectionTop.toFixed(2)}px, 0)`;
      overlayLayer.style.visibility = 'visible';
      updateClipPath(t, point, bulge);
    } else {
      overlayLayer.style.visibility = 'hidden';
      clipPathEl.setAttribute('d', t >= 0.9999 ? 'M 0 0 L 1 0 L 1 1 L 0 1 Z' : 'M 0 0 L 0 0 Z');
    }
  }

  function tick(now) {
    tick.lastNow = now;

    smoothedVelocity = lerp(smoothedVelocity, scrollVelocity, 0.18);
    scrollVelocity *= 0.9;

    if (Math.abs(smoothedVelocity) > 0.0001 || Math.abs(scrollVelocity) > 0.0001) {
      render();
    }

    animationFrameId = requestAnimationFrame(tick);
  }

  function addProgress(delta, velocitySample) {
    progress = wrapProgress(progress + delta);
    scrollVelocity = velocitySample;
    render();
  }

  function onWheel(event) {
    event.preventDefault();
    const now = performance.now();
    const dt = Math.max(now - lastWheelTime, 1);
    lastWheelTime = now;

    const delta = event.deltaY * config.scrollSensitivity;
    const velocitySample = (event.deltaY / dt) * config.scrollSensitivity * 16;
    addProgress(delta, velocitySample);
  }

  function onPointerDown(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    isDragging = true;
    activePointerId = event.pointerId;
    dragStartY = event.clientY;
    dragStartProgress = progress;
    container.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event) {
    if (!isDragging || event.pointerId !== activePointerId) return;
    const deltaY = event.clientY - dragStartY;
    const sectionPx = getSectionPixelHeight();
    const delta = (-deltaY / Math.max(sectionPx, 1)) * (config.scrollSensitivity / 0.0009) * 0.25;
    const velocitySample = delta * 0.06;
    progress = wrapProgress(dragStartProgress + delta);
    scrollVelocity = velocitySample;
    render();
  }

  function onPointerUp(event) {
    if (event.pointerId !== activePointerId) return;
    isDragging = false;
    activePointerId = null;
    try {
      container.releasePointerCapture(event.pointerId);
    } catch {
      // ignore
    }
  }

  function bindEvents() {
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointercancel', onPointerUp);
  }

  function unbindEvents() {
    container.removeEventListener('wheel', onWheel);
    container.removeEventListener('pointerdown', onPointerDown);
    container.removeEventListener('pointermove', onPointerMove);
    container.removeEventListener('pointerup', onPointerUp);
    container.removeEventListener('pointercancel', onPointerUp);
  }

  function apply(nextOptions = {}) {
    config = normalizeConfig({ ...config, ...nextOptions });
    if (nextOptions.progress !== undefined) {
      progress = clampProgress(nextOptions.progress);
    }
    scheduleRender();
  }

  function destroy() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    resizeObserver?.disconnect();
    unbindEvents();
  }

  function scheduleRender() {
    requestAnimationFrame(() => {
      buildTrack();
      render();
    });
  }

  const resizeObserver = typeof ResizeObserver !== 'undefined'
    ? new ResizeObserver(() => scheduleRender())
    : null;
  resizeObserver?.observe(container);

  bindEvents();
  scheduleRender();
  animationFrameId = requestAnimationFrame(tick);

  return {
    element: container,
    apply,
    destroy,
    getProgress: () => progress,
    setProgress: (value) => {
      progress = clampProgress(value);
      render();
    },
    getConfig: () => ({ ...config }),
  };
};
