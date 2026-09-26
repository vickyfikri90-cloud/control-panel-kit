window.initHeadingEntranceExperiment = function initHeadingEntranceExperiment() {
  const preview = document.querySelector('[data-experiment-preview="heading-entrance"]');
  const panelRoot = document.querySelector('[data-experiment-panel="heading-entrance"]');
  if (!preview || !panelRoot || preview.dataset.experimentReady === '1') return;

  const utils = window.ComponentUtils;
  const heading = window.initHeadingEntrance(preview, { autoplay: false });

  const controls = {
    text: document.getElementById('exp-heading-entrance-text'),
    blurStart: document.getElementById('exp-heading-entrance-blur-start'),
    blurEnd: document.getElementById('exp-heading-entrance-blur-end'),
    fontSize: document.getElementById('exp-heading-entrance-font-size'),
    fontWeight: document.getElementById('exp-heading-entrance-font-weight'),
    letterSpacing: document.getElementById('exp-heading-entrance-letter-spacing'),
    duration: document.getElementById('exp-heading-entrance-duration'),
    stagger: document.getElementById('exp-heading-entrance-stagger'),
    layersOffBefore: document.getElementById('exp-heading-entrance-layers-off'),
  };

  const easing = window.initCubicBezierInput(document.getElementById('exp-heading-entrance-easing-root'), {
    onChange: () => applyAll(true),
  });

  const snippet = window.initSnippetOutput(document.getElementById('exp-heading-entrance-snippet-root'), {
    filename: 'heading-entrance.html',
    getContent: generateSnippet,
    updateOnInit: false,
  });

  utils.bindInputWrapInputs(panelRoot);

  controls.text.addEventListener('input', () => applyAll(true));
  [controls.fontSize, controls.fontWeight, controls.letterSpacing].forEach((input) => {
    input.addEventListener('input', () => applyAll(false));
    utils.bindNumericArrowKey(input, () => applyAll(false));
  });
  [controls.blurStart, controls.blurEnd, controls.duration, controls.stagger, controls.layersOffBefore].forEach((input) => {
    input.addEventListener('input', () => applyAll(true));
    utils.bindNumericArrowKey(input, () => applyAll(true));
  });

  document.getElementById('exp-heading-entrance-restart').addEventListener('click', () => heading.play());

  function collectSettings() {
    return {
      text: controls.text.value,
      blurStart: controls.blurStart.value,
      blurEnd: controls.blurEnd.value,
      fontSize: controls.fontSize.value,
      fontWeight: controls.fontWeight.value,
      letterSpacing: controls.letterSpacing.value,
      duration: controls.duration.value,
      staggerPercent: controls.stagger.value,
      layersOffBefore: controls.layersOffBefore.value,
      easing: easing.getRaw(),
    };
  }

  function applySettings(data) {
    if (!data) return;
    ['text', 'blurStart', 'blurEnd', 'fontSize', 'fontWeight', 'letterSpacing', 'duration', 'layersOffBefore'].forEach((key) => {
      if (data[key] != null) controls[key].value = data[key];
    });
    if (data.staggerPercent != null) controls.stagger.value = data.staggerPercent;
    if (data.easing != null) easing.setRaw(data.easing, false);
  }

  window.ExperimentSettings = window.ExperimentSettings || {};
  window.ExperimentSettings['heading-entrance'] = {
    collect: collectSettings,
    apply: applySettings,
  };

  function getConfig() {
    const duration = Math.max(0, utils.parseMs(controls.duration.value, 800));
    const staggerPercent = Math.max(0, parseFloat(controls.stagger.value) || 0);
    return {
      text: controls.text.value,
      blurStart: Math.max(0, utils.parsePx(controls.blurStart.value, 24)),
      blurEnd: Math.max(0, utils.parsePx(controls.blurEnd.value, 2)),
      fontSize: Math.max(1, utils.parsePx(controls.fontSize.value, 48)),
      fontWeight: Math.min(900, Math.max(100, Math.round(Number(controls.fontWeight.value) || 600))),
      letterSpacing: utils.parsePx(controls.letterSpacing.value, 0),
      duration,
      // Per-char delay as a % of duration.
      stagger: Math.round(duration * staggerPercent) / 100,
      layersOffBefore: Math.max(0, utils.parseMs(controls.layersOffBefore.value, 2)),
      easingRaw: easing.getRaw() || '0.22, 1, 0.36, 1',
    };
  }

  function applyAll(replay) {
    heading.set(getConfig());
    if (replay) heading.play();
    snippet.update();
  }

  const pending = window.__pendingExperimentDefaults?.['heading-entrance'];
  if (pending) applySettings(pending);
  applyAll(true);

  function generateSnippet() {
    const config = getConfig();
    const text = utils.escapeHtml(config.text);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Heading Entrance</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff;
    }

${window.HeadingEntranceSnippet?.css || ''}
  </style>
</head>
<body>
  <div class="heading-entrance">
    <h2 class="heading-entrance__text">${text}</h2>
    <div class="heading-entrance__burn"></div>
    <div class="heading-entrance__dodge"></div>
  </div>

  <script>
${window.HeadingEntranceSnippet?.js || ''}
    window.initHeadingEntrance(document.body, ${JSON.stringify(config, null, 2).replace(/\n/g, '\n    ')});
  <\/script>
</body>
</html>`;
  }

  preview.dataset.experimentReady = '1';
};
