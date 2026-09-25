window.initExperiment6 = function initExperiment6() {
  const preview = document.querySelector('[data-experiment-preview="6"]');
  const panelRoot = document.querySelector('[data-experiment-panel="6"]');
  if (!preview || !panelRoot) return;

  const utils = window.ComponentUtils;

  if (typeof window.initArcScrollTransition !== 'function') {
    console.error('Experiment 6: initArcScrollTransition is not loaded');
    return;
  }

  const controls = {
    sectionHeight: document.getElementById('exp6-section-height'),
    bgImageHeight: document.getElementById('exp6-bg-image-height'),
    frontX: document.getElementById('exp6-front-x'),
    frontY: document.getElementById('exp6-front-y'),
    nextX: document.getElementById('exp6-next-x'),
    nextY: document.getElementById('exp6-next-y'),
    burstOriginX: document.getElementById('exp6-burst-origin-x'),
    burstOriginY: document.getElementById('exp6-burst-origin-y'),
    burstSize: document.getElementById('exp6-burst-size'),
    burstScale: document.getElementById('exp6-burst-scale'),
  };

  let arcScroll = preview.__arcScrollController;
  let positionModeSelector = preview.__exp6PositionMode;
  let snippet = preview.__exp6Snippet;

  if (!arcScroll) {
    arcScroll = window.initArcScrollTransition(preview, {
      sectionHeightVh: 150,
      bgImageHeightPercent: 100,
      positionMode: 'burst-origin',
      frontX: 50,
      frontY: 100,
      nextX: 50,
      nextY: 0,
      burstOriginX: 50,
      burstOriginY: 100,
      burstSize: 100,
      burstScale: 1,
    });
    preview.__arcScrollController = arcScroll;
  }

  if (!positionModeSelector) {
    const modeRoot = document.getElementById('exp6-position-mode-root');
    if (!modeRoot) {
      console.error('Experiment 6: missing #exp6-position-mode-root');
      return;
    }

    positionModeSelector = window.initOptionSelector(modeRoot, {
      value: 'burst-origin',
      options: [
        { value: 'peak-xy', label: 'Peak X/Y' },
        { value: 'seam-y', label: 'Seam Y' },
        { value: 'burst-origin', label: 'Burst Origin' },
      ],
      onChange: () => {
        updatePanelVisibility();
        applyAll();
      },
    });
    preview.__exp6PositionMode = positionModeSelector;
  }

  if (!snippet) {
    const snippetRoot = document.getElementById('exp6-snippet-root');
    if (!snippetRoot) {
      console.error('Experiment 6: missing #exp6-snippet-root');
      return;
    }

    snippet = window.initSnippetOutput(snippetRoot, {
      filename: 'experiment-6.html',
      getContent: generateSnippet,
      updateOnInit: true,
    });
    preview.__exp6Snippet = snippet;
  }

  if (preview.dataset.experimentReady !== '1') {
    utils.bindInputWrapInputs(panelRoot);

    Object.values(controls).forEach((input) => {
      if (!(input instanceof HTMLInputElement)) return;
      input.addEventListener('input', applyAll);
    });

    Object.values(controls).forEach((input) => {
      utils.bindNumericArrowKey(input, applyAll);
    });

    preview.dataset.experimentReady = '1';
  }

  function controlValue(input, fallback) {
    if (!(input instanceof HTMLInputElement)) return String(fallback);
    return input.value;
  }

  function clampPercent(value, fallback) {
    return Math.min(100, Math.max(0, utils.parsePx(value, fallback)));
  }

  function getConfig() {
    return {
      sectionHeightVh: utils.parsePx(controlValue(controls.sectionHeight, 150), 150),
      bgImageHeightPercent: utils.parsePx(controlValue(controls.bgImageHeight, 100), 100),
      positionMode: positionModeSelector.getValue(),
      frontX: clampPercent(controlValue(controls.frontX, 50), 50),
      frontY: clampPercent(controlValue(controls.frontY, 100), 100),
      nextX: clampPercent(controlValue(controls.nextX, 50), 50),
      nextY: clampPercent(controlValue(controls.nextY, 0), 0),
      burstOriginX: clampPercent(controlValue(controls.burstOriginX, 50), 50),
      burstOriginY: clampPercent(controlValue(controls.burstOriginY, 100), 100),
      burstSize: Math.max(10, utils.parsePx(controlValue(controls.burstSize, 100), 100)),
      burstScale: Math.max(0.1, parseFloat(controlValue(controls.burstScale, 1)) || 1),
    };
  }

  function updatePanelVisibility() {
    const mode = positionModeSelector.getValue();
    const isBurst = mode === 'burst-origin';
    const hideX = mode === 'seam-y';

    panelRoot.querySelectorAll('[data-exp6-pos-group]').forEach((node) => {
      node.hidden = isBurst;
    });

    panelRoot.querySelectorAll('[data-exp6-burst-group]').forEach((node) => {
      node.hidden = !isBurst;
    });

    panelRoot.querySelectorAll('[data-exp6-pos-x]').forEach((node) => {
      node.hidden = isBurst || hideX;
    });
  }

  function applyAll() {
    arcScroll.apply(getConfig());
    updatePanelVisibility();
    snippet.update();
    requestAnimationFrame(() => arcScroll.apply(getConfig()));
  }

  function collectSettings() {
    return {
      sectionHeight: controlValue(controls.sectionHeight, 150),
      bgImageHeight: controlValue(controls.bgImageHeight, 100),
      positionMode: positionModeSelector.getValue(),
      frontX: controlValue(controls.frontX, 50),
      frontY: controlValue(controls.frontY, 100),
      nextX: controlValue(controls.nextX, 50),
      nextY: controlValue(controls.nextY, 0),
      burstOriginX: controlValue(controls.burstOriginX, 50),
      burstOriginY: controlValue(controls.burstOriginY, 100),
      burstSize: controlValue(controls.burstSize, 100),
      burstScale: controlValue(controls.burstScale, 1),
    };
  }

  function applySettings(data) {
    if (!data) return;

    if (data.sectionHeight != null && controls.sectionHeight) {
      controls.sectionHeight.value = data.sectionHeight;
    }
    if (data.bgImageHeight != null && controls.bgImageHeight) {
      controls.bgImageHeight.value = data.bgImageHeight;
    }
    if (data.positionMode != null) positionModeSelector.setValue(data.positionMode, false);
    if (data.frontX != null && controls.frontX) controls.frontX.value = data.frontX;
    if (data.frontY != null && controls.frontY) controls.frontY.value = data.frontY;
    if (data.nextX != null && controls.nextX) controls.nextX.value = data.nextX;
    if (data.nextY != null && controls.nextY) controls.nextY.value = data.nextY;
    if (data.burstOriginX != null && controls.burstOriginX) {
      controls.burstOriginX.value = data.burstOriginX;
    }
    if (data.burstOriginY != null && controls.burstOriginY) {
      controls.burstOriginY.value = data.burstOriginY;
    }
    if (data.burstSize != null && controls.burstSize) controls.burstSize.value = data.burstSize;
    if (data.burstScale != null && controls.burstScale) controls.burstScale.value = data.burstScale;

    applyAll();
  }

  window.ExperimentSettings = window.ExperimentSettings || {};
  window.ExperimentSettings['6'] = {
    collect: collectSettings,
    apply: applySettings,
  };

  function generateSnippet() {
    const config = getConfig();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Arc Scroll Transition</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter+Display:wght@100..900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="Components/ArcScrollTransition/component.css">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; height: 100%; overflow: hidden; }
    .arc-scroll-root { width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <div class="arc-scroll-root"></div>

  <script src="Components/ArcScrollTransition/component.js"><\/script>
  <script>
    initArcScrollTransition(document.querySelector('.arc-scroll-root'), {
      sectionHeightVh: ${config.sectionHeightVh},
      bgImageHeightPercent: ${config.bgImageHeightPercent},
      positionMode: ${JSON.stringify(config.positionMode)},
      frontX: ${config.frontX},
      frontY: ${config.frontY},
      nextX: ${config.nextX},
      nextY: ${config.nextY},
      burstOriginX: ${config.burstOriginX},
      burstOriginY: ${config.burstOriginY},
      burstSize: ${config.burstSize},
      burstScale: ${config.burstScale},
    });
  <\/script>
</body>
</html>`;
  }

  const pending = window.__pendingExperimentDefaults?.['6'];
  if (pending) applySettings(pending);
  else applyAll();
};
