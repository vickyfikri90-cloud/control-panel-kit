(function () {
  const utils = window.ComponentUtils;
  const hoverButton = window.initHoverButton(document.querySelector('.cp-preview'), {
    slideGap: 100,
    duration: 350,
    easingRaw: '0.7, 0, 0.25, 1',
  });

  const btn = hoverButton.element;
  const texts = hoverButton.texts;

  const controls = {
    labelText: document.getElementById('label-text'),
    paddingTop: document.getElementById('padding-top'),
    paddingRight: document.getElementById('padding-right'),
    paddingBottom: document.getElementById('padding-bottom'),
    paddingLeft: document.getElementById('padding-left'),
    border: document.getElementById('border'),
    radius: document.getElementById('radius'),
    slideDistance: document.getElementById('slide-distance'),
    duration: document.getElementById('duration'),
    easing: document.getElementById('easing'),
  };

  const dimensions = window.initDimensionControlGroup(document, {
    width: {
      initialMode: 'hug',
      measure: () => Math.max(Math.round(btn.offsetWidth), 0),
      onChange: applyAll,
    },
    height: {
      initialMode: 'fixed',
      measure: () => Math.max(Math.round(btn.offsetHeight), 0),
      onChange: applyAll,
    },
  });

  const bgColor = window.initColorInput(document.getElementById('bg-color-root'), {
    onChange: applyAll,
  });

  const borderColor = window.initColorInput(document.getElementById('border-color-root'), {
    onChange: applyAll,
  });

  const snippet = window.initSnippetOutput(document.getElementById('snippet-root'), {
    filename: 'hover-button.html',
    getContent: generateSnippet,
    updateOnInit: false,
  });

  utils.bindInputWrapInputs(document);

  Object.values(controls).forEach((input) => {
    if (!(input instanceof HTMLInputElement)) return;
    input.addEventListener('input', applyAll);
  });

  [
    controls.paddingTop,
    controls.paddingRight,
    controls.paddingBottom,
    controls.paddingLeft,
    controls.border,
    controls.radius,
    controls.slideDistance,
    controls.duration,
  ].forEach((input) => {
    utils.bindNumericArrowKey(input, applyAll);
  });

  utils.bindNumericArrowKey(bgColor.opacityInput, applyAll, { isOpacity: true });
  utils.bindNumericArrowKey(borderColor.opacityInput, applyAll, { isOpacity: true });

  applyAll();

  function getSlideDistance() {
    return utils.parsePx(controls.slideDistance.value, 100);
  }

  function getDuration() {
    return utils.parseMs(controls.duration.value, 350);
  }

  function getEasing() {
    const raw = controls.easing.value.trim();
    if (!raw) return 'cubic-bezier(0.7, 0, 0.25, 1)';
    if (raw.startsWith('cubic-bezier(')) return raw;

    const parts = raw.split(',').map((n) => parseFloat(n.trim()));
    if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
      return `cubic-bezier(${parts.join(', ')})`;
    }

    return raw;
  }

  function getConfig() {
    const border = utils.parsePx(controls.border.value, 0);
    const bgHex = bgColor.getHex();
    const borderHex = borderColor.getHex();

    return {
      label: controls.labelText.value,
      width: dimensions.width.getValue(),
      slideGap: getSlideDistance(),
      duration: getDuration(),
      easing: getEasing(),
      bg: bgColor.getColor(),
      bgHex,
      radius: utils.parsePx(controls.radius.value, 0),
      border,
      borderColor: borderColor.getColor(),
      borderHex,
      borderCss: border === 0
        ? 'none'
        : `${border}px solid ${borderColor.getColor()}`,
      height: dimensions.height.getValue(),
      paddingTop: utils.parsePx(controls.paddingTop.value, 0),
      paddingRight: utils.parsePx(controls.paddingRight.value, 24),
      paddingBottom: utils.parsePx(controls.paddingBottom.value, 0),
      paddingLeft: utils.parsePx(controls.paddingLeft.value, 24),
    };
  }

  function applyAll() {
    const config = getConfig();

    hoverButton.setLabel(config.label);
    hoverButton.setAnimation({
      slideGap: config.slideGap,
      duration: config.duration,
      easingRaw: controls.easing.value.trim() || '0.7, 0, 0.25, 1',
    });
    hoverButton.applyStyles({
      background: config.bg,
      borderRadius: `${config.radius}px`,
      border: config.borderCss,
      height: config.height.toLowerCase() === 'auto'
        ? 'auto'
        : `${utils.parsePx(config.height, 56)}px`,
      width: config.width.toLowerCase() === 'auto'
        ? 'auto'
        : `${utils.parsePx(config.width, 0)}px`,
      padding: `${config.paddingTop}px ${config.paddingRight}px ${config.paddingBottom}px ${config.paddingLeft}px`,
    });

    dimensions.width.updateLabel();
    dimensions.height.updateLabel();
    snippet.update();
  }

  function generateSnippet() {
    const config = getConfig();
    const label = utils.escapeHtml(config.label);
    const easingRaw = controls.easing.value.trim() || '0.7, 0, 0.25, 1';
    const widthCss = config.width.toLowerCase() === 'auto'
      ? 'auto'
      : `${utils.parsePx(config.width, 0)}px`;
    const heightCss = config.height.toLowerCase() === 'auto'
      ? 'auto'
      : `${utils.parsePx(config.height, 56)}px`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hover Button</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff;
      font-family: Arial, sans-serif;
    }

    button {
      width: ${widthCss};
      padding: ${config.paddingTop}px ${config.paddingRight}px ${config.paddingBottom}px ${config.paddingLeft}px;
      font-size: 16px;
      border: ${config.borderCss};
      border-radius: ${config.radius}px;
      background: ${config.bg};
      height: ${heightCss};
      cursor: pointer;
      overflow: hidden;
      color: #000;
    }

    .label {
      display: block;
      position: relative;
      height: 1.125em;
    }

    .text {
      display: block;
      will-change: transform;
      white-space: nowrap;
    }

    .text.is-hidden {
      position: absolute;
      top: 0;
      left: 0;
    }
  </style>
</head>
<body>
  <button id="btn" type="button">
    <span class="label">
      <span class="text">${label}</span>
      <span class="text is-hidden">${label}</span>
    </span>
  </button>

  <script>
    const CONFIG = {
      slideGap: ${config.slideGap},
      duration: ${config.duration},
      easingRaw: ${JSON.stringify(easingRaw)},
    };

    const btn = document.getElementById('btn');
    const texts = btn.querySelectorAll('.text');
    let active = 0;
    let busy = false;
    let isHovered = false;

    btn.addEventListener('mouseenter', () => {
      isHovered = true;
      slide();
    });

    btn.addEventListener('mouseleave', () => {
      isHovered = false;
      if (!busy) reset();
    });

    reset();

    function getEasing() {
      const raw = CONFIG.easingRaw.trim();
      if (!raw) return 'cubic-bezier(0.7, 0, 0.25, 1)';
      if (raw.startsWith('cubic-bezier(')) return raw;

      const parts = raw.split(',').map((n) => parseFloat(n.trim()));
      if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
        return 'cubic-bezier(' + parts.join(', ') + ')';
      }

      return raw;
    }

    function getSlideMetrics() {
      const labelWidth = texts[active].offsetWidth;
      const travel = labelWidth + CONFIG.slideGap;
      return { travel };
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

      setTimeout(() => finishSlide(current, next, travel), CONFIG.duration);
    }

    function setTransform(el, x, animate) {
      el.style.transition = animate
        ? 'transform ' + CONFIG.duration + 'ms ' + getEasing()
        : 'none';
      el.style.transform = 'translateX(' + x + 'px)';
    }
  <\/script>
</body>
</html>`;
  }
})();
