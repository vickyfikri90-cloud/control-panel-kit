window.initFlipCarouselExperiment = function initFlipCarouselExperiment() {
  const preview = document.querySelector('[data-experiment-preview="carousel-flip"]');
  const panelRoot = document.querySelector('[data-experiment-panel="carousel-flip"]');
  if (!preview || !panelRoot || preview.dataset.experimentReady === '1') return;

  const utils = window.ComponentUtils;

  const DEFAULT_COLORS = [
    { hex: 'FF6B6B', opacity: '100' },
    { hex: '4ECDC4', opacity: '100' },
    { hex: 'FFE66D', opacity: '100' },
    { hex: '5B8DEF', opacity: '100' },
    { hex: 'C77DFF', opacity: '100' },
  ];

  const carousel = window.initFlipCarousel(preview, {
    mode: 'fan',
    count: 5,
    colors: DEFAULT_COLORS.map((item) => utils.colorWithOpacity(item.hex, item.opacity)),
    fanWidth: 400,
    fanHeight: 500,
    fanRadius: 0,
    fanOriginY: 2000,
    fanStepDeg: 12,
    fanDuration: 350,
    fanEasingRaw: '0.7, 0, 0.25, 1',
    fanVelocityIntensity: 1,
    horizWidth: 600,
    horizHeight: 400,
    horizRadius: 0,
    horizOrbit: 600,
    horizPerspective: 1200,
    horizStepDeg: 12,
    horizDuration: 350,
    horizEasingRaw: '0.7, 0, 0.25, 1',
    horizVelocityIntensity: 1,
    horizHighlightScale: 1.2,
    horizOrientation: 'horizontal',
    horizInputAction: 'drag',
    transitionDuration: 600,
    transitionEasingRaw: '0.7, 0, 0.25, 1',
  });

  const controls = {
    count: document.getElementById('exp-carousel-flip-count'),
    fanRadius: document.getElementById('exp-carousel-flip-fan-radius'),
    fanRotate: document.getElementById('exp-carousel-flip-fan-rotate'),
    fanOriginY: document.getElementById('exp-carousel-flip-fan-origin-y'),
    fanDuration: document.getElementById('exp-carousel-flip-fan-duration'),
    fanVelocity: document.getElementById('exp-carousel-flip-fan-velocity'),
    horizRadius: document.getElementById('exp-carousel-flip-horiz-radius'),
    horizRotate: document.getElementById('exp-carousel-flip-horiz-rotate'),
    horizOrbit: document.getElementById('exp-carousel-flip-horiz-orbit'),
    horizPerspective: document.getElementById('exp-carousel-flip-horiz-perspective'),
    horizScale: document.getElementById('exp-carousel-flip-horiz-scale'),
    horizDuration: document.getElementById('exp-carousel-flip-horiz-duration'),
    horizVelocity: document.getElementById('exp-carousel-flip-horiz-velocity'),
    transitionDuration: document.getElementById('exp-carousel-flip-transition-duration'),
  };

  const fanEasing = window.initCubicBezierInput(document.getElementById('exp-carousel-flip-fan-easing-root'), {
    onChange: applyAll,
  });

  const horizEasing = window.initCubicBezierInput(document.getElementById('exp-carousel-flip-horiz-easing-root'), {
    onChange: applyAll,
  });

  const transitionEasing = window.initCubicBezierInput(
    document.getElementById('exp-carousel-flip-transition-easing-root'),
    { onChange: applyAll },
  );

  const modeButtons = preview.querySelectorAll('[data-flip-mode]');

  const variantSelector = window.initOptionSelector(document.getElementById('exp-carousel-flip-variant-root'), {
    value: 'horizontal',
    options: [
      { value: 'vertical', label: 'Vertical' },
      { value: 'horizontal', label: 'Horizontal' },
    ],
    onChange: applyAll,
  });

  const inputSelector = window.initOptionSelector(document.getElementById('exp-carousel-flip-input-root'), {
    value: 'drag',
    options: [
      { value: 'drag', label: 'Drag' },
      { value: 'scroll', label: 'Scroll' },
    ],
    onChange: applyAll,
  });

  const fanDimensions = window.initDimensionControlGroup(
    document.getElementById('exp-carousel-flip-fan-section'),
    {
      'fan-width': {
        initialMode: 'fixed',
        measure: () => 400,
        onChange: applyAll,
      },
      'fan-height': {
        initialMode: 'fixed',
        measure: () => 500,
        onChange: applyAll,
      },
    },
  );

  const horizDimensions = window.initDimensionControlGroup(
    document.getElementById('exp-carousel-flip-horiz-section'),
    {
      'horiz-width': {
        initialMode: 'fixed',
        measure: () => 600,
        onChange: applyAll,
      },
      'horiz-height': {
        initialMode: 'fixed',
        measure: () => 400,
        onChange: applyAll,
      },
    },
  );

  const colorInputs = [1, 2, 3, 4, 5].map((index) => (
    window.initColorInput(document.getElementById(`exp-carousel-flip-color-${index}-root`), {
      onChange: applyAll,
    })
  ));

  const snippet = window.initSnippetOutput(document.getElementById('exp-carousel-flip-snippet-root'), {
    filename: 'carousel-flip.html',
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
    controls.fanRadius,
    controls.fanRotate,
    controls.fanOriginY,
    controls.fanDuration,
    controls.fanVelocity,
    controls.horizRadius,
    controls.horizRotate,
    controls.horizOrbit,
    controls.horizPerspective,
    controls.horizScale,
    controls.horizDuration,
    controls.horizVelocity,
    controls.transitionDuration,
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

  function getHighlightScale() {
    const value = parseFloat(controls.horizScale.value);
    return Number.isFinite(value) && value > 0 ? value : 1.2;
  }

  function getColors() {
    return colorInputs.map((colorInput) => colorInput.getColor());
  }

  function getCarouselConfig() {
    return {
      count: getCount(),
      colors: getColors(),
      fanWidth: utils.parsePx(fanDimensions['fan-width'].getValue(), 400),
      fanHeight: utils.parsePx(fanDimensions['fan-height'].getValue(), 500),
      fanRadius: utils.parsePx(controls.fanRadius.value, 0),
      fanOriginY: utils.parsePx(controls.fanOriginY.value, 2000),
      fanStepDeg: utils.parsePx(controls.fanRotate.value, 12),
      fanDuration: utils.parseMs(controls.fanDuration.value, 350),
      fanEasingRaw: fanEasing.getRaw() || '0.7, 0, 0.25, 1',
      fanVelocityIntensity: Math.max(0, utils.parsePx(controls.fanVelocity.value, 1)),
      horizWidth: utils.parsePx(horizDimensions['horiz-width'].getValue(), 600),
      horizHeight: utils.parsePx(horizDimensions['horiz-height'].getValue(), 400),
      horizRadius: utils.parsePx(controls.horizRadius.value, 0),
      horizOrbit: utils.parsePx(controls.horizOrbit.value, 600),
      horizPerspective: utils.parsePx(controls.horizPerspective.value, 1200),
      horizStepDeg: utils.parsePx(controls.horizRotate.value, 12),
      horizDuration: utils.parseMs(controls.horizDuration.value, 350),
      horizEasingRaw: horizEasing.getRaw() || '0.7, 0, 0.25, 1',
      horizVelocityIntensity: Math.max(0, utils.parsePx(controls.horizVelocity.value, 1)),
      horizHighlightScale: getHighlightScale(),
      horizOrientation: variantSelector.getValue(),
      horizInputAction: inputSelector.getValue(),
      transitionDuration: utils.parseMs(controls.transitionDuration.value, 600),
      transitionEasingRaw: transitionEasing.getRaw() || '0.7, 0, 0.25, 1',
    };
  }

  function updateDimensionLabels() {
    fanDimensions['fan-width'].updateLabel();
    fanDimensions['fan-height'].updateLabel();
    horizDimensions['horiz-width'].updateLabel();
    horizDimensions['horiz-height'].updateLabel();
  }

  function getMode() {
    return carousel.getMode();
  }

  function updateModeButtons() {
    const activeMode = getMode();
    modeButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.flipMode === activeMode);
    });
  }

  function applyModeChange(targetMode) {
    const config = getCarouselConfig();
    carousel.apply(config);

    if (targetMode === carousel.getMode()) {
      updateModeButtons();
      updateDimensionLabels();
      snippet.update();
      return;
    }

    carousel.flipTo(targetMode, {
      transitionDuration: config.transitionDuration,
      transitionEasingRaw: config.transitionEasingRaw,
    }).then(() => {
      updateModeButtons();
      updateDimensionLabels();
      snippet.update();
    });
  }

  modeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      applyModeChange(button.dataset.flipMode);
    });
  });

  function applyAll() {
    carousel.apply(getCarouselConfig());
    updateModeButtons();
    updateDimensionLabels();
    snippet.update();
  }

  function collectSettings() {
    return {
      mode: getMode(),
      count: controls.count.value,
      fanRadius: controls.fanRadius.value,
      fanRotate: controls.fanRotate.value,
      fanOriginY: controls.fanOriginY.value,
      fanDuration: controls.fanDuration.value,
      fanVelocity: controls.fanVelocity.value,
      fanEasing: fanEasing.getRaw(),
      fanWidthMode: fanDimensions['fan-width'].getMode(),
      fanWidthValue: fanDimensions['fan-width'].getValue(),
      fanHeightMode: fanDimensions['fan-height'].getMode(),
      fanHeightValue: fanDimensions['fan-height'].getValue(),
      horizRadius: controls.horizRadius.value,
      horizRotate: controls.horizRotate.value,
      horizOrbit: controls.horizOrbit.value,
      horizPerspective: controls.horizPerspective.value,
      horizScale: controls.horizScale.value,
      horizDuration: controls.horizDuration.value,
      horizVelocity: controls.horizVelocity.value,
      horizEasing: horizEasing.getRaw(),
      variant: variantSelector.getValue(),
      input: inputSelector.getValue(),
      horizWidthMode: horizDimensions['horiz-width'].getMode(),
      horizWidthValue: horizDimensions['horiz-width'].getValue(),
      horizHeightMode: horizDimensions['horiz-height'].getMode(),
      horizHeightValue: horizDimensions['horiz-height'].getValue(),
      transitionDuration: controls.transitionDuration.value,
      transitionEasing: transitionEasing.getRaw(),
      colors: colorInputs.map((colorInput) => ({
        hex: colorInput.hexInput.value,
        opacity: colorInput.opacityInput.value,
      })),
    };
  }

  function applyDimensionSetting(dimension, dataModeKey, dataValueKey, data) {
    if (!dimension) return;
    if (data[dataModeKey]) {
      dimension.setMode(data[dataModeKey], false);
      if (data[dataModeKey] === 'fixed' && data[dataValueKey] != null) {
        dimension.element.querySelector('.dimension-fixed-input').value =
          String(data[dataValueKey]).replace(/px$/i, '');
      }
    }
  }

  function applySettings(data) {
    if (!data) return;

    if (data.count != null) controls.count.value = data.count;
    if (data.fanRadius != null) controls.fanRadius.value = data.fanRadius;
    if (data.fanRotate != null) controls.fanRotate.value = data.fanRotate;
    if (data.fanOriginY != null) controls.fanOriginY.value = data.fanOriginY;
    if (data.fanDuration != null) controls.fanDuration.value = data.fanDuration;
    if (data.fanVelocity != null) controls.fanVelocity.value = data.fanVelocity;
    if (data.fanEasing != null) fanEasing.setRaw(data.fanEasing, false);

    if (data.horizRadius != null) controls.horizRadius.value = data.horizRadius;
    if (data.horizRotate != null) controls.horizRotate.value = data.horizRotate;
    if (data.horizOrbit != null) controls.horizOrbit.value = data.horizOrbit;
    if (data.horizPerspective != null) controls.horizPerspective.value = data.horizPerspective;
    if (data.horizScale != null) controls.horizScale.value = data.horizScale;
    if (data.horizDuration != null) controls.horizDuration.value = data.horizDuration;
    if (data.horizVelocity != null) controls.horizVelocity.value = data.horizVelocity;
    if (data.horizEasing != null) horizEasing.setRaw(data.horizEasing, false);

    if (data.variant != null) variantSelector.setValue(data.variant, false);
    if (data.input != null) inputSelector.setValue(data.input, false);

    if (data.transitionDuration != null) {
      controls.transitionDuration.value = data.transitionDuration;
    }
    if (data.transitionEasing != null) transitionEasing.setRaw(data.transitionEasing, false);

    applyDimensionSetting(fanDimensions['fan-width'], 'fanWidthMode', 'fanWidthValue', data);
    applyDimensionSetting(fanDimensions['fan-height'], 'fanHeightMode', 'fanHeightValue', data);
    applyDimensionSetting(horizDimensions['horiz-width'], 'horizWidthMode', 'horizWidthValue', data);
    applyDimensionSetting(horizDimensions['horiz-height'], 'horizHeightMode', 'horizHeightValue', data);

    if (Array.isArray(data.colors)) {
      data.colors.forEach((color, index) => {
        const colorInput = colorInputs[index];
        if (!colorInput || !color) return;
        if (color.hex != null) colorInput.hexInput.value = color.hex;
        if (color.opacity != null) colorInput.opacityInput.value = color.opacity;
        colorInput.updateUI(false);
      });
    }

    if (data.mode != null) {
      carousel.apply(getCarouselConfig());
      if (data.mode !== carousel.getMode()) {
        carousel.flipTo(data.mode, {
          transitionDuration: utils.parseMs(controls.transitionDuration.value, 600),
          transitionEasingRaw: transitionEasing.getRaw() || '0.7, 0, 0.25, 1',
        }).then(() => {
          updateModeButtons();
          updateDimensionLabels();
          snippet.update();
        });
        return;
      }
      updateModeButtons();
    }

    applyAll();
  }

  window.ExperimentSettings = window.ExperimentSettings || {};
  window.ExperimentSettings['carousel-flip'] = {
    collect: collectSettings,
    apply: applySettings,
  };

  const pending = window.__pendingExperimentDefaults?.['carousel-flip'];
  if (pending) applySettings(pending);
  else applyAll();

  function generateSnippet() {
    const config = getCarouselConfig();
    const colorsJson = JSON.stringify(config.colors);
    const mode = getMode();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fan ↔ Horizontal FLIP Carousel</title>
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

    .flip-carousel {
      position: relative;
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      touch-action: none;
      overflow: hidden;
    }

    .flip-carousel__stage {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      cursor: grab;
      user-select: none;
      transform-style: preserve-3d;
    }

    .flip-carousel.is-mode-horizontal .flip-carousel__stage,
    .flip-carousel.is-mode-vertical .flip-carousel__stage {
      overflow: visible;
    }

    .flip-carousel__stage.is-dragging { cursor: grabbing; }

    .flip-carousel__ring {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 0;
      height: 0;
      transform-style: preserve-3d;
    }

    .flip-carousel__card {
      position: absolute;
      left: 0;
      top: 0;
      box-sizing: border-box;
      will-change: transform;
      backface-visibility: hidden;
      transform-style: preserve-3d;
    }

    .flip-carousel__card-face {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      font-size: 48px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.35);
      transform-origin: center center;
      backface-visibility: hidden;
    }

    .flip-carousel__nav {
      position: absolute;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
      z-index: 2;
    }

    .flip-carousel__nav-btn {
      width: 50px;
      height: 50px;
      border: none;
      background: #f0f0f0;
      font-family: Inter, system-ui, sans-serif;
      font-size: 9px;
      cursor: pointer;
    }

    .flip-carousel__mode-toggle {
      display: flex;
      gap: 4px;
    }

    .flip-carousel__mode-btn {
      height: 50px;
      padding: 0 12px;
      border: none;
      background: #f0f0f0;
      font-family: Inter, system-ui, sans-serif;
      font-size: 9px;
      cursor: pointer;
    }

    .flip-carousel__mode-btn.is-active {
      background: #09090b;
      color: #fff;
    }
  </style>
</head>
<body>
  <div class="flip-carousel" data-carousel>
    <div class="flip-carousel__stage">
      <div class="flip-carousel__ring"></div>
    </div>
    <div class="flip-carousel__nav">
      <button type="button" class="flip-carousel__nav-btn" data-carousel-prev>Prev</button>
      <div class="flip-carousel__mode-toggle">
        <button type="button" class="flip-carousel__mode-btn${mode === 'fan' ? ' is-active' : ''}" data-flip-mode="fan">Fan</button>
        <button type="button" class="flip-carousel__mode-btn${mode === 'horizontal' ? ' is-active' : ''}" data-flip-mode="horizontal">Horizontal</button>
      </div>
      <button type="button" class="flip-carousel__nav-btn" data-carousel-next>Next</button>
    </div>
  </div>

  <script src="Components/FlipCarousel/component.js"><\/script>
  <script>
    const CONFIG = {
      mode: ${JSON.stringify(mode)},
      count: ${config.count},
      colors: ${colorsJson},
      fanWidth: ${config.fanWidth},
      fanHeight: ${config.fanHeight},
      fanRadius: ${config.fanRadius},
      fanOriginY: ${config.fanOriginY},
      fanStepDeg: ${config.fanStepDeg},
      fanDuration: ${config.fanDuration},
      fanEasingRaw: ${JSON.stringify(config.fanEasingRaw)},
      fanVelocityIntensity: ${config.fanVelocityIntensity},
      horizWidth: ${config.horizWidth},
      horizHeight: ${config.horizHeight},
      horizRadius: ${config.horizRadius},
      horizOrbit: ${config.horizOrbit},
      horizPerspective: ${config.horizPerspective},
      horizStepDeg: ${config.horizStepDeg},
      horizDuration: ${config.horizDuration},
      horizEasingRaw: ${JSON.stringify(config.horizEasingRaw)},
      horizVelocityIntensity: ${config.horizVelocityIntensity},
      horizHighlightScale: ${config.horizHighlightScale},
      horizOrientation: ${JSON.stringify(config.horizOrientation)},
      horizInputAction: ${JSON.stringify(config.horizInputAction)},
      transitionDuration: ${config.transitionDuration},
      transitionEasingRaw: ${JSON.stringify(config.transitionEasingRaw)},
    };

    const preview = document.querySelector('.flip-carousel').parentElement;
    const carousel = initFlipCarousel(preview, CONFIG);

    document.querySelectorAll('[data-flip-mode]').forEach((button) => {
      button.addEventListener('click', () => {
        const targetMode = button.dataset.flipMode;
        document.querySelectorAll('[data-flip-mode]').forEach((node) => {
          node.classList.toggle('is-active', node === button);
        });
        carousel.apply(CONFIG);
        carousel.flipTo(targetMode, {
          transitionDuration: CONFIG.transitionDuration,
          transitionEasingRaw: CONFIG.transitionEasingRaw,
        });
      });
    });
  <\/script>
</body>
</html>`;
  }

  preview.dataset.experimentReady = '1';
};
