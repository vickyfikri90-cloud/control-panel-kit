window.initExperiment9 = function initExperiment9() {
  const preview = document.querySelector('[data-experiment-preview="9"]');
  const panelRoot = document.querySelector('[data-experiment-panel="9"]');
  if (!preview || !panelRoot || preview.dataset.experimentReady === '1') return;

  const utils = window.ComponentUtils;
  const staggerButton = window.initStaggerTextButton(preview, {
    restLabel: 'Hover here',
    hoverLabel: 'Click me',
    duration: 600,
    stagger: 30,
    scatter: 150,
    easingRaw: '0.16, 1, 0.3, 1',
    staggerMode: 'center-out',
  });

  const btn = staggerButton.element;

  const controls = {
    labelText: document.getElementById('exp9-label-text'),
    hoverText: document.getElementById('exp9-hover-text'),
    paddingTop: document.getElementById('exp9-padding-top'),
    paddingRight: document.getElementById('exp9-padding-right'),
    paddingBottom: document.getElementById('exp9-padding-bottom'),
    paddingLeft: document.getElementById('exp9-padding-left'),
    border: document.getElementById('exp9-border'),
    radius: document.getElementById('exp9-radius'),
    duration: document.getElementById('exp9-duration'),
    stagger: document.getElementById('exp9-stagger'),
    scatter: document.getElementById('exp9-scatter'),
  };

  const staggerModeSelector = window.initOptionSelector(document.getElementById('exp9-stagger-mode-root'), {
    value: 'center-out',
    options: [
      { value: 'sequential', label: 'Sequential' },
      { value: 'center-out', label: 'Center out' },
    ],
    onChange: applyAll,
  });

  const easing = window.initCubicBezierInput(document.getElementById('exp9-easing-root'), {
    onChange: applyAll,
  });

  const dimensions = window.initDimensionControlGroup(panelRoot, {
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

  const bgColor = window.initColorInput(document.getElementById('exp9-bg-color-root'), {
    onChange: applyAll,
  });

  const borderColor = window.initColorInput(document.getElementById('exp9-border-color-root'), {
    onChange: applyAll,
  });

  const snippet = window.initSnippetOutput(document.getElementById('exp9-snippet-root'), {
    filename: 'experiment-9.html',
    getContent: generateSnippet,
    updateOnInit: false,
  });

  utils.bindInputWrapInputs(panelRoot);

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
    controls.duration,
    controls.stagger,
    controls.scatter,
  ].forEach((input) => {
    utils.bindNumericArrowKey(input, applyAll);
  });

  utils.bindNumericArrowKey(bgColor.opacityInput, applyAll, { isOpacity: true });
  utils.bindNumericArrowKey(borderColor.opacityInput, applyAll, { isOpacity: true });

  function collectSettings() {
    return {
      label: controls.labelText.value,
      hoverLabel: controls.hoverText.value,
      paddingTop: controls.paddingTop.value,
      paddingRight: controls.paddingRight.value,
      paddingBottom: controls.paddingBottom.value,
      paddingLeft: controls.paddingLeft.value,
      border: controls.border.value,
      radius: controls.radius.value,
      duration: controls.duration.value,
      stagger: controls.stagger.value,
      scatter: controls.scatter.value,
      staggerMode: staggerModeSelector.getValue(),
      easing: easing.getRaw(),
      bgHex: bgColor.hexInput.value,
      bgOpacity: bgColor.opacityInput.value,
      borderHex: borderColor.hexInput.value,
      borderOpacity: borderColor.opacityInput.value,
      widthMode: dimensions.width.getMode(),
      widthValue: dimensions.width.getValue(),
      heightMode: dimensions.height.getMode(),
      heightValue: dimensions.height.getValue(),
    };
  }

  function applySettings(data) {
    if (!data) return;

    if (data.label != null) controls.labelText.value = data.label;
    if (data.hoverLabel != null) controls.hoverText.value = data.hoverLabel;
    if (data.paddingTop != null) controls.paddingTop.value = data.paddingTop;
    if (data.paddingRight != null) controls.paddingRight.value = data.paddingRight;
    if (data.paddingBottom != null) controls.paddingBottom.value = data.paddingBottom;
    if (data.paddingLeft != null) controls.paddingLeft.value = data.paddingLeft;
    if (data.border != null) controls.border.value = data.border;
    if (data.radius != null) controls.radius.value = data.radius;
    if (data.duration != null) controls.duration.value = data.duration;
    if (data.stagger != null) controls.stagger.value = data.stagger;
    if (data.scatter != null) controls.scatter.value = data.scatter;
    if (data.staggerMode != null) staggerModeSelector.setValue(data.staggerMode, false);
    if (data.easing != null) easing.setRaw(data.easing, false);

    if (data.bgHex != null) bgColor.hexInput.value = data.bgHex;
    if (data.bgOpacity != null) bgColor.opacityInput.value = data.bgOpacity;
    bgColor.updateUI(false);

    if (data.borderHex != null) borderColor.hexInput.value = data.borderHex;
    if (data.borderOpacity != null) borderColor.opacityInput.value = data.borderOpacity;
    borderColor.updateUI(false);

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
  }

  window.ExperimentSettings = window.ExperimentSettings || {};
  window.ExperimentSettings['9'] = {
    collect: collectSettings,
    apply: applySettings,
  };

  const pending = window.__pendingExperimentDefaults?.['9'];
  if (pending) applySettings(pending);
  applyAll();

  function getDuration() {
    return Math.max(0, utils.parseMs(controls.duration.value, 600));
  }

  function getStagger() {
    return Math.max(0, utils.parseMs(controls.stagger.value, 30));
  }

  function getScatter() {
    return Math.max(0, utils.parsePx(controls.scatter.value, 150));
  }

  function getConfig() {
    const border = utils.parsePx(controls.border.value, 0);
    const bgHex = bgColor.getHex();
    const borderHex = borderColor.getHex();

    return {
      label: controls.labelText.value,
      hoverLabel: controls.hoverText.value,
      width: dimensions.width.getValue(),
      duration: getDuration(),
      stagger: getStagger(),
      scatter: getScatter(),
      staggerMode: staggerModeSelector.getValue(),
      easing: easing.getValue(),
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

    staggerButton.setLabels(config.label, config.hoverLabel);
    staggerButton.setAnimation({
      duration: config.duration,
      stagger: config.stagger,
      scatter: config.scatter,
      staggerMode: config.staggerMode,
      easingRaw: easing.getRaw() || '0.16, 1, 0.3, 1',
    });
    staggerButton.applyStyles({
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
    const hoverLabel = utils.escapeHtml(config.hoverLabel || config.label);
    const easingRaw = easing.getRaw() || '0.16, 1, 0.3, 1';
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
  <title>Stagger Text Button</title>
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
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      width: ${widthCss};
      height: ${heightCss};
      padding: ${config.paddingTop}px ${config.paddingRight}px ${config.paddingBottom}px ${config.paddingLeft}px;
      font-size: 16px;
      line-height: 1;
      border: ${config.borderCss};
      border-radius: ${config.radius}px;
      background: ${config.bg};
      cursor: pointer;
      overflow: hidden;
      position: relative;
      color: #000;
      user-select: none;
    }

    .label {
      display: grid;
      position: relative;
      line-height: 1;
    }

    .text {
      grid-area: 1 / 1;
      display: block;
      white-space: nowrap;
    }

    .stagger-char {
      display: inline-block;
      white-space: pre;
      will-change: transform;
    }
  </style>
</head>
<body>
  <button id="btn" class="stagger-text-button" type="button" aria-label="${label}">
    <span class="label"></span>
  </button>

  <script>
${window.StaggerTextButtonSnippetJs || ''}
    window.initStaggerTextButton(document.getElementById('btn'), {
      restLabel: ${JSON.stringify(config.label)},
      hoverLabel: ${JSON.stringify(config.hoverLabel || config.label)},
      duration: ${config.duration},
      stagger: ${config.stagger},
      scatter: ${config.scatter},
      staggerMode: ${JSON.stringify(config.staggerMode || 'center-out')},
      easingRaw: ${JSON.stringify(easingRaw)},
    });
  <\/script>
</body>
</html>`;
  }

  preview.dataset.experimentReady = '1';
};
