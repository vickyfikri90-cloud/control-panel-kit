window.initExperiment6 = function initExperiment6() {
  const preview = document.querySelector('[data-experiment-preview="6"]');
  const panelRoot = document.querySelector('[data-experiment-panel="6"]');
  if (!preview || !panelRoot || preview.dataset.experimentReady === '1') return;

  const utils = window.ComponentUtils;

  if (typeof window.initArcScrollTransition !== 'function') {
    console.error('Experiment 6: initArcScrollTransition is not loaded');
    return;
  }

  const DEFAULT_CURVES = [12, 10, 25, 5];
  const DEFAULT_HEIGHTS = [100, 100, 100, 100];

  const controls = {
    sectionHeights: [1, 2, 3, 4].map((n) => document.getElementById(`exp6-section-height-${n}`)),
    curves: [1, 2, 3, 4].map((n) => document.getElementById(`exp6-curve-${n}`)),
    scrub: document.getElementById('exp6-scrub'),
    smoothing: document.getElementById('exp6-smoothing'),
    headingSize: document.getElementById('exp6-heading-size'),
    imageOpacity: document.getElementById('exp6-image-opacity'),
  };

  const numericInputs = [
    ...controls.sectionHeights,
    ...controls.curves,
    controls.scrub,
    controls.smoothing,
    controls.headingSize,
    controls.imageOpacity,
  ];

  const arcScroll = window.initArcScrollTransition(preview, {});

  const solidColor = window.initColorInput(document.getElementById('exp6-solid-color-root'), {
    onChange: applyAll,
  });

  const snippet = window.initSnippetOutput(document.getElementById('exp6-snippet-root'), {
    filename: 'experiment-6.html',
    getContent: generateSnippet,
    updateOnInit: false,
  });

  utils.bindInputWrapInputs(panelRoot);

  numericInputs.forEach((input) => {
    input.addEventListener('input', applyAll);
    utils.bindNumericArrowKey(input, applyAll);
  });
  utils.bindNumericArrowKey(solidColor.opacityInput, applyAll, { isOpacity: true });

  function getConfig() {
    return {
      sectionHeights: controls.sectionHeights.map((input, i) => (
        Math.max(10, utils.parsePx(input.value, DEFAULT_HEIGHTS[i]))
      )),
      curves: controls.curves.map((input, i) => utils.parsePx(input.value, DEFAULT_CURVES[i])),
      scrub: Math.max(0, utils.parsePx(controls.scrub.value, 0.3)),
      smoothing: Math.min(1, Math.max(0.01, utils.parsePx(controls.smoothing.value, 0.1))),
      headingSize: Math.max(8, utils.parsePx(controls.headingSize.value, 96)),
      solidColor: solidColor.getColor(),
      imageOpacity: Math.min(100, Math.max(0, utils.parsePx(controls.imageOpacity.value, 80))),
    };
  }

  function applyAll() {
    arcScroll.apply(getConfig());
    snippet.update();
  }

  function collectSettings() {
    return {
      sectionHeights: controls.sectionHeights.map((input) => input.value),
      curves: controls.curves.map((input) => input.value),
      scrub: controls.scrub.value,
      smoothing: controls.smoothing.value,
      headingSize: controls.headingSize.value,
      imageOpacity: controls.imageOpacity.value,
      solidHex: solidColor.hexInput.value,
      solidOpacity: solidColor.opacityInput.value,
    };
  }

  function applySettings(data) {
    if (!data) return;

    if (Array.isArray(data.sectionHeights)) {
      data.sectionHeights.forEach((value, i) => {
        if (value != null && controls.sectionHeights[i]) controls.sectionHeights[i].value = value;
      });
    }
    if (Array.isArray(data.curves)) {
      data.curves.forEach((value, i) => {
        if (value != null && controls.curves[i]) controls.curves[i].value = value;
      });
    }
    if (data.scrub != null) controls.scrub.value = data.scrub;
    if (data.smoothing != null) controls.smoothing.value = data.smoothing;
    if (data.headingSize != null) controls.headingSize.value = data.headingSize;
    if (data.imageOpacity != null) controls.imageOpacity.value = data.imageOpacity;
    if (data.solidHex != null) solidColor.hexInput.value = data.solidHex;
    if (data.solidOpacity != null) solidColor.opacityInput.value = data.solidOpacity;
    solidColor.updateUI(false);
  }

  window.ExperimentSettings = window.ExperimentSettings || {};
  window.ExperimentSettings['6'] = {
    collect: collectSettings,
    apply(data) {
      applySettings(data);
      applyAll();
    },
  };

  function generateSnippet() {
    const config = getConfig();
    const embed = window.ArcScrollTransitionSnippet || { css: '', js: '' };

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Arc Scroll Transition</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; height: 100%; overflow: hidden; background: #000; }
    .arc-scroll-root { width: 100vw; height: 100vh; height: 100svh; }

${embed.css}
  </style>
</head>
<body>
  <div class="arc-scroll-root"></div>

  <script>
${embed.js}
    // Image paths are relative to this file; point them at your own images.
    window.initArcScrollTransition(document.querySelector('.arc-scroll-root'), {
      sectionHeights: ${JSON.stringify(config.sectionHeights)},
      curves: ${JSON.stringify(config.curves)},
      scrub: ${config.scrub},
      smoothing: ${config.smoothing},
      headingSize: ${config.headingSize},
      solidColor: ${JSON.stringify(config.solidColor)},
      imageOpacity: ${config.imageOpacity},
      bgImage1: 'Components/ArcScrollTransition/assets/bg-1.png',
      bgImage2: 'Components/ArcScrollTransition/assets/bg-2.png',
    });
  <\/script>
</body>
</html>`;
  }

  const pending = window.__pendingExperimentDefaults?.['6'];
  if (pending) applySettings(pending);
  applyAll();

  preview.dataset.experimentReady = '1';
};
