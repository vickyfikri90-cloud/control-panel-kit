window.initHorizontalParallaxExperiment = function initHorizontalParallaxExperiment() {
  const preview = document.querySelector('[data-experiment-preview="parallax-horizontal"]');
  const panelRoot = document.querySelector('[data-experiment-panel="parallax-horizontal"]');
  if (!preview || !panelRoot) return;

  const utils = window.ComponentUtils;
  const DEFAULT_IMAGE = 'Components/HorizontalParallax/assets/photo.png';
  const PARALLAX_VERSION = '8';

  if (typeof window.initHorizontalParallax !== 'function') {
    console.error('Parallax Horizontal: initHorizontalParallax is not loaded');
    return;
  }

  const controls = {
    cardWidth: document.getElementById('exp-parallax-horizontal-width'),
    cardHeight: document.getElementById('exp-parallax-horizontal-height'),
    gap: document.getElementById('exp-parallax-horizontal-gap'),
    duration: document.getElementById('exp-parallax-horizontal-duration'),
    velocity: document.getElementById('exp-parallax-horizontal-velocity'),
  };

  const uploadSlots = [1, 2, 3, 4, 5].map((slot) => ({
    index: slot - 1,
    fileInput: document.getElementById(`exp-parallax-horizontal-image-${slot}-file`),
    button: document.getElementById(`exp-parallax-horizontal-image-${slot}-btn`),
    nameLabel: document.getElementById(`exp-parallax-horizontal-image-${slot}-name`),
  }));

  let parallax = preview.__horizontalParallax;
  let easing = preview.__expHorizontalParallaxEasing;
  let snippet = preview.__expHorizontalParallaxSnippet;
  let layoutSelector = preview.__expHorizontalParallaxLayout;
  let imageScaleSlider = preview.__expHorizontalParallaxImageScale;

  function controlValue(input, fallback) {
    if (!(input instanceof HTMLInputElement)) return String(fallback);
    const value = input.value.trim();
    return value || String(fallback);
  }

  function loadImageAsDataUrl(src) {
    return fetch(src)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load ${src}`);
        return response.blob();
      })
      .then(
        (blob) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
      );
  }

  async function ensureImageSrcs() {
    if (Array.isArray(preview.__expHorizontalParallaxImageSrcs) && preview.__expHorizontalParallaxImageSrcs.length === 5) {
      return preview.__expHorizontalParallaxImageSrcs;
    }

    try {
      const dataUrl = await loadImageAsDataUrl(DEFAULT_IMAGE);
      preview.__expHorizontalParallaxImageSrcs = Array.from({ length: 5 }, () => dataUrl);
    } catch {
      preview.__expHorizontalParallaxImageSrcs = Array.from({ length: 5 }, () => DEFAULT_IMAGE);
    }

    return preview.__expHorizontalParallaxImageSrcs;
  }

  function getImageSrcs() {
    return Array.isArray(preview.__expHorizontalParallaxImageSrcs) && preview.__expHorizontalParallaxImageSrcs.length === 5
      ? [...preview.__expHorizontalParallaxImageSrcs]
      : Array.from({ length: 5 }, () => DEFAULT_IMAGE);
  }

  function setUploadLabel(index, label) {
    const slot = uploadSlots[index];
    if (slot?.nameLabel) slot.nameLabel.textContent = label;
  }

  function getImageScale() {
    const percent = imageScaleSlider?.getValue() ?? 120;
    return Math.max(1, Math.min(2, percent / 100));
  }

  function getConfig() {
    return {
      cardWidth: Math.max(1, utils.parsePx(controlValue(controls.cardWidth, 393), 393)),
      cardHeight: Math.max(1, utils.parsePx(controlValue(controls.cardHeight, 263), 263)),
      gap: Math.max(0, utils.parsePx(controlValue(controls.gap, 16), 16)),
      duration: Math.max(80, utils.parseMs(controlValue(controls.duration, 450), 450)),
      velocityIntensity: Math.max(0, utils.parsePx(controlValue(controls.velocity, 1), 1)),
      easingRaw: easing?.getRaw() || '0.7, 0, 0.25, 1',
      orientation: layoutSelector?.getValue() === 'vertical' ? 'vertical' : 'horizontal',
      imageScale: getImageScale(),
      imageSrcs: getImageSrcs(),
    };
  }

  function applyAll() {
    parallax?.apply(getConfig());
    snippet?.update();
  }

  function collectSettings() {
    const srcs = getImageSrcs();
    return {
      cardWidth: controlValue(controls.cardWidth, 393),
      cardHeight: controlValue(controls.cardHeight, 263),
      gap: controlValue(controls.gap, 16),
      duration: controlValue(controls.duration, 450),
      velocity: controlValue(controls.velocity, 1),
      easing: easing?.getRaw(),
      layout: layoutSelector?.getValue() || 'horizontal',
      imageScalePercent: String(imageScaleSlider?.getValue() ?? 120),
      image1: srcs[0],
      image2: srcs[1],
      image3: srcs[2],
      image4: srcs[3],
      image5: srcs[4],
      imageName1: uploadSlots[0]?.nameLabel?.textContent || 'Default',
      imageName2: uploadSlots[1]?.nameLabel?.textContent || 'Default',
      imageName3: uploadSlots[2]?.nameLabel?.textContent || 'Default',
      imageName4: uploadSlots[3]?.nameLabel?.textContent || 'Default',
      imageName5: uploadSlots[4]?.nameLabel?.textContent || 'Default',
    };
  }

  async function applySettings(data) {
    if (!data) return;

    if (data.cardWidth != null && controls.cardWidth) controls.cardWidth.value = data.cardWidth;
    if (data.cardHeight != null && controls.cardHeight) controls.cardHeight.value = data.cardHeight;
    if (data.gap != null && controls.gap) controls.gap.value = data.gap;
    if (data.duration != null && controls.duration) controls.duration.value = data.duration;
    if (data.velocity != null && controls.velocity) controls.velocity.value = data.velocity;
    if (data.easing != null) easing?.setRaw(data.easing, false);
    if (data.layout != null) layoutSelector?.setValue(data.layout, false);
    if (data.imageScalePercent != null) imageScaleSlider?.setValue(data.imageScalePercent, false);

    await ensureImageSrcs();

    const savedImages = [data.image1, data.image2, data.image3, data.image4, data.image5];
    const savedNames = [data.imageName1, data.imageName2, data.imageName3, data.imageName4, data.imageName5];

    for (let i = 0; i < 5; i += 1) {
      const saved = savedImages[i];
      if (!saved) continue;

      if (String(saved).startsWith('data:')) {
        preview.__expHorizontalParallaxImageSrcs[i] = saved;
        setUploadLabel(i, savedNames[i] || 'Uploaded');
        continue;
      }

      try {
        preview.__expHorizontalParallaxImageSrcs[i] = await loadImageAsDataUrl(saved);
        setUploadLabel(i, savedNames[i] || 'Uploaded');
      } catch {
        // keep existing slot
      }
    }

    applyAll();
  }

  function generateSnippet() {
    const config = getConfig();
    const imageSrcsJson = JSON.stringify(config.imageSrcs);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Horizontal Parallax</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="Components/HorizontalParallax/component.css">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; height: 100%; overflow: hidden; }
    .horizontal-parallax-root { width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <div class="horizontal-parallax-root"></div>

  <script src="Components/HorizontalParallax/component.js"><\/script>
  <script>
    initHorizontalParallax(document.querySelector('.horizontal-parallax-root'), {
      cardWidth: ${config.cardWidth},
      cardHeight: ${config.cardHeight},
      gap: ${config.gap},
      duration: ${config.duration},
      velocityIntensity: ${config.velocityIntensity},
      easingRaw: ${JSON.stringify(config.easingRaw)},
      orientation: ${JSON.stringify(config.orientation)},
      imageScale: ${config.imageScale},
      imageSrcs: ${imageSrcsJson},
    });
  <\/script>
</body>
</html>`;
  }

  function wireUploads() {
    uploadSlots.forEach((slot) => {
      if (!slot.fileInput || !slot.button) return;
      if (slot.fileInput.dataset.expHorizontalParallaxWired === '1') return;

      slot.button.addEventListener('click', () => slot.fileInput.click());
      slot.fileInput.addEventListener('change', () => {
        const file = slot.fileInput.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
          if (!Array.isArray(preview.__expHorizontalParallaxImageSrcs)) {
            preview.__expHorizontalParallaxImageSrcs = Array.from({ length: 5 }, () => DEFAULT_IMAGE);
          }
          preview.__expHorizontalParallaxImageSrcs[slot.index] = String(reader.result);
          setUploadLabel(slot.index, file.name);
          applyAll();
        };
        reader.readAsDataURL(file);
        slot.fileInput.value = '';
      });

      slot.fileInput.dataset.expHorizontalParallaxWired = '1';
    });
  }

  window.ExperimentSettings = window.ExperimentSettings || {};
  window.ExperimentSettings['parallax-horizontal'] = {
    collect: collectSettings,
    apply: applySettings,
  };

  void (async () => {
    await ensureImageSrcs();

    if (!parallax || preview.dataset.parallaxVersion !== PARALLAX_VERSION) {
      parallax = window.initHorizontalParallax(preview, {
        cardWidth: 393,
        cardHeight: 263,
        gap: 16,
        duration: 450,
        velocityIntensity: 1,
        easingRaw: '0.7, 0, 0.25, 1',
        orientation: 'horizontal',
        imageScale: 1.2,
        imageSrcs: getImageSrcs(),
      });
      preview.__horizontalParallax = parallax;
      preview.dataset.parallaxVersion = PARALLAX_VERSION;
    }

    if (!layoutSelector) {
      const layoutRoot = document.getElementById('exp-parallax-horizontal-layout-root');
      if (!layoutRoot) {
        console.error('Parallax Horizontal: missing #exp-parallax-horizontal-layout-root');
        return;
      }

      layoutSelector = window.initOptionSelector(layoutRoot, {
        value: 'horizontal',
        options: [
          { value: 'horizontal', label: 'Horizontal' },
          { value: 'vertical', label: 'Vertical' },
        ],
        onChange: applyAll,
      });
      preview.__expHorizontalParallaxLayout = layoutSelector;
    }

    if (!imageScaleSlider) {
      const scaleRoot = document.getElementById('exp-parallax-horizontal-image-scale-root');
      if (!scaleRoot) {
        console.error('Parallax Horizontal: missing #exp-parallax-horizontal-image-scale-root');
        return;
      }

      if (typeof window.initSlider !== 'function') {
        console.error('Parallax Horizontal: initSlider is not loaded');
        return;
      }

      imageScaleSlider = window.initSlider(scaleRoot, {
        min: 100,
        max: 200,
        step: 1,
        value: 120,
        onChange: applyAll,
      });
      preview.__expHorizontalParallaxImageScale = imageScaleSlider;
    }

    if (!easing) {
      const easingRoot = document.getElementById('exp-parallax-horizontal-easing-root');
      if (!easingRoot) {
        console.error('Parallax Horizontal: missing #exp-parallax-horizontal-easing-root');
        return;
      }

      easing = window.initCubicBezierInput(easingRoot, { onChange: applyAll });
      preview.__expHorizontalParallaxEasing = easing;
    }

    if (!snippet) {
      const snippetRoot = document.getElementById('exp-parallax-horizontal-snippet-root');
      if (!snippetRoot) {
        console.error('Parallax Horizontal: missing #exp-parallax-horizontal-snippet-root');
        return;
      }

      snippet = window.initSnippetOutput(snippetRoot, {
        filename: 'parallax-horizontal.html',
        getContent: generateSnippet,
        updateOnInit: true,
      });
      preview.__expHorizontalParallaxSnippet = snippet;
    }

    if (preview.dataset.experimentReady !== '1') {
      utils.bindInputWrapInputs(panelRoot);

      Object.values(controls).forEach((input) => {
        if (!(input instanceof HTMLInputElement)) return;
        input.addEventListener('input', applyAll);
        utils.bindNumericArrowKey(input, applyAll);
      });

      wireUploads();
      preview.dataset.experimentReady = '1';
    }

    const pending = window.__pendingExperimentDefaults?.['parallax-horizontal'];
    if (pending) await applySettings(pending);
    else applyAll();
  })();
};
