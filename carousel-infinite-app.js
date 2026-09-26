window.initInfiniteCarouselExperiment = function initInfiniteCarouselExperiment() {
  const preview = document.querySelector('[data-experiment-preview="carousel-infinite"]');
  const panelRoot = document.querySelector('[data-experiment-panel="carousel-infinite"]');
  if (!preview || !panelRoot) return;

  const utils = window.ComponentUtils;

  if (typeof window.initInfiniteCarousel !== 'function') {
    console.error('Carousel Infinite: initInfiniteCarousel is not loaded');
    return;
  }

  const controls = {
    heightActive: document.getElementById('exp-carousel-infinite-height-active'),
    heightA: document.getElementById('exp-carousel-infinite-height-a'),
    heightB: document.getElementById('exp-carousel-infinite-height-b'),
    heightC: document.getElementById('exp-carousel-infinite-height-c'),
    duration: document.getElementById('exp-carousel-infinite-duration'),
    velocity: document.getElementById('exp-carousel-infinite-velocity'),
    autoPlayInterval: document.getElementById('exp-carousel-infinite-autoplay-interval'),
  };

  let carousel = preview.__infiniteCarousel;
  let easing = preview.__expInfiniteCarouselEasing;
  let snippet = preview.__expInfiniteCarouselSnippet;

  if (!carousel) {
    carousel = window.initInfiniteCarousel(preview, {
      heightActive: 400,
      heightA: 320,
      heightB: 240,
      heightC: 360,
      duration: 450,
      velocityIntensity: 1,
      autoPlayInterval: 4000,
      easingRaw: '0.7, 0, 0.25, 1',
    });
    preview.__infiniteCarousel = carousel;
  }

  if (!easing) {
    const easingRoot = document.getElementById('exp-carousel-infinite-easing-root');
    if (!easingRoot) {
      console.error('Carousel Infinite: missing #exp-carousel-infinite-easing-root');
      return;
    }

    easing = window.initCubicBezierInput(easingRoot, { onChange: applyAll });
    preview.__expInfiniteCarouselEasing = easing;
  }

  if (!snippet) {
    const snippetRoot = document.getElementById('exp-carousel-infinite-snippet-root');
    if (!snippetRoot) {
      console.error('Carousel Infinite: missing #exp-carousel-infinite-snippet-root');
      return;
    }

    snippet = window.initSnippetOutput(snippetRoot, {
      filename: 'carousel-infinite.html',
      getContent: generateSnippet,
      updateOnInit: true,
    });
    preview.__expInfiniteCarouselSnippet = snippet;
  }

  if (preview.dataset.experimentReady !== '1') {
    utils.bindInputWrapInputs(panelRoot);

    Object.values(controls).forEach((input) => {
      if (!(input instanceof HTMLInputElement)) return;
      input.addEventListener('input', applyAll);
      utils.bindNumericArrowKey(input, applyAll);
    });

    preview.dataset.experimentReady = '1';
  }

  function controlValue(input, fallback) {
    if (!(input instanceof HTMLInputElement)) return String(fallback);
    return input.value;
  }

  function getConfig() {
    return {
      heightActive: Math.max(80, utils.parsePx(controlValue(controls.heightActive, 400), 400)),
      heightA: Math.max(80, utils.parsePx(controlValue(controls.heightA, 320), 320)),
      heightB: Math.max(80, utils.parsePx(controlValue(controls.heightB, 240), 240)),
      heightC: Math.max(80, utils.parsePx(controlValue(controls.heightC, 360), 360)),
      duration: Math.max(80, utils.parseMs(controlValue(controls.duration, 450), 450)),
      velocityIntensity: Math.max(0, utils.parsePx(controlValue(controls.velocity, 1), 1)),
      autoPlayInterval: Math.max(0, utils.parseMs(controlValue(controls.autoPlayInterval, 4000), 4000)),
      easingRaw: easing.getRaw() || '0.7, 0, 0.25, 1',
    };
  }

  function applyAll() {
    carousel.apply(getConfig());
    snippet.update();
  }

  function collectSettings() {
    return {
      heightActive: controlValue(controls.heightActive, 400),
      heightA: controlValue(controls.heightA, 320),
      heightB: controlValue(controls.heightB, 240),
      heightC: controlValue(controls.heightC, 360),
      duration: controlValue(controls.duration, 450),
      velocity: controlValue(controls.velocity, 1),
      autoPlayInterval: controlValue(controls.autoPlayInterval, 4000),
      easing: easing.getRaw(),
    };
  }

  function applySettings(data) {
    if (!data) return;

    if (data.heightActive != null && controls.heightActive) {
      controls.heightActive.value = data.heightActive;
    }
    if (data.heightA != null && controls.heightA) controls.heightA.value = data.heightA;
    if (data.heightB != null && controls.heightB) controls.heightB.value = data.heightB;
    if (data.heightC != null && controls.heightC) controls.heightC.value = data.heightC;
    if (data.duration != null && controls.duration) controls.duration.value = data.duration;
    if (data.velocity != null && controls.velocity) controls.velocity.value = data.velocity;
    if (data.autoPlayInterval != null && controls.autoPlayInterval) {
      controls.autoPlayInterval.value = data.autoPlayInterval;
    }
    if (data.easing != null) easing.setRaw(data.easing, false);

    applyAll();
  }

  window.ExperimentSettings = window.ExperimentSettings || {};
  window.ExperimentSettings['carousel-infinite'] = {
    collect: collectSettings,
    apply: applySettings,
  };

  function generateSnippet() {
    const config = getConfig();
    const embed = window.InfiniteCarouselSnippet;

    if (!embed) {
      return '<!-- Run: node scripts/build-single-html.js -->';
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Infinite Carousel</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Anton&family=Satoshi:wght@500&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; height: 100%; overflow: hidden; }
    .infinite-carousel-root { width: 100vw; height: 100vh; }

${embed.css}
  </style>
</head>
<body>
  <div class="infinite-carousel-root"></div>
  <script>
${embed.js}
    initInfiniteCarousel(document.querySelector('.infinite-carousel-root'), {
      headingSrc: ${JSON.stringify(embed.headingSrc)},
      heightActive: ${config.heightActive},
      heightA: ${config.heightA},
      heightB: ${config.heightB},
      heightC: ${config.heightC},
      duration: ${config.duration},
      velocityIntensity: ${config.velocityIntensity},
      autoPlayInterval: ${config.autoPlayInterval},
      easingRaw: ${JSON.stringify(config.easingRaw)},
    });
  <\/script>
</body>
</html>`;
  }

  const pending = window.__pendingExperimentDefaults?.['carousel-infinite'];
  if (pending) applySettings(pending);
  else applyAll();
};
