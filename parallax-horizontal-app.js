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
    gap: document.getElementById('exp-parallax-horizontal-gap'),
    duration: document.getElementById('exp-parallax-horizontal-duration'),
    velocity: document.getElementById('exp-parallax-horizontal-velocity'),
  };

  const CARD_COUNT = 5;
  const uploadRoot = document.getElementById('exp-parallax-horizontal-images-root');
  // Uploaded images as { src (data URL), name }; empty means every card uses the default.
  if (!Array.isArray(preview.__expHorizontalParallaxImages)) preview.__expHorizontalParallaxImages = [];

  let parallax = preview.__horizontalParallax;
  let easing = preview.__expHorizontalParallaxEasing;
  let snippet = preview.__expHorizontalParallaxSnippet;
  let layoutSelector = preview.__expHorizontalParallaxLayout;
  let imageScaleSlider = preview.__expHorizontalParallaxImageScale;
  let cardSize = preview.__expHorizontalParallaxSize;

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

  async function ensureDefaultSrc() {
    if (preview.__expHorizontalParallaxDefaultSrc) return;
    try {
      preview.__expHorizontalParallaxDefaultSrc = await loadImageAsDataUrl(DEFAULT_IMAGE);
    } catch {
      preview.__expHorizontalParallaxDefaultSrc = DEFAULT_IMAGE;
    }
  }

  // Cards take the uploaded images in order, repeating when there are fewer than 5.
  function getImageSrcs() {
    const images = preview.__expHorizontalParallaxImages;
    const fallback = preview.__expHorizontalParallaxDefaultSrc || DEFAULT_IMAGE;
    return Array.from({ length: CARD_COUNT }, (_, i) => (images.length ? images[i % images.length].src : fallback));
  }

  function setImages(images) {
    preview.__expHorizontalParallaxImages = images.slice(0, CARD_COUNT);
    const upload = preview.__expHorizontalParallaxUpload;
    if (upload) {
      upload.clear(false);
      upload.add(preview.__expHorizontalParallaxImages.map(({ src, name }) => ({ url: src, name })), false);
    }
  }

  function getImageScale() {
    const percent = imageScaleSlider?.getValue() ?? 120;
    return Math.max(1, Math.min(2, percent / 100));
  }

  function getConfig() {
    return {
      cardWidth: cardSize?.getValue().width ?? 393,
      cardHeight: cardSize?.getValue().height ?? 263,
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
    return {
      cardWidth: String(cardSize?.getValue().width ?? 393),
      cardHeight: String(cardSize?.getValue().height ?? 263),
      cardSizeLocked: cardSize?.getLocked() ?? false,
      gap: controlValue(controls.gap, 16),
      duration: controlValue(controls.duration, 450),
      velocity: controlValue(controls.velocity, 1),
      easing: easing?.getRaw(),
      layout: layoutSelector?.getValue() || 'horizontal',
      imageScalePercent: String(imageScaleSlider?.getValue() ?? 120),
      images: preview.__expHorizontalParallaxImages.map(({ src, name }) => ({ src, name })),
    };
  }

  async function applySettings(data) {
    if (!data) return;

    if (cardSize) {
      const w = parseFloat(data.cardWidth);
      const h = parseFloat(data.cardHeight);
      cardSize.setValue(Number.isFinite(w) ? w : null, Number.isFinite(h) ? h : null, false);
      if (data.cardSizeLocked != null) cardSize.setLocked(Boolean(data.cardSizeLocked), false);
    }
    if (data.gap != null && controls.gap) controls.gap.value = data.gap;
    if (data.duration != null && controls.duration) controls.duration.value = data.duration;
    if (data.velocity != null && controls.velocity) controls.velocity.value = data.velocity;
    if (data.easing != null) easing?.setRaw(data.easing, false);
    if (data.layout != null) layoutSelector?.setValue(data.layout, false);
    if (data.imageScalePercent != null) imageScaleSlider?.setValue(data.imageScalePercent, false);

    await ensureDefaultSrc();

    if (Array.isArray(data.images)) {
      setImages(data.images.filter((image) => image?.src));
    } else {
      // Legacy per-card defaults (image1..5): keep only the cards that were uploaded.
      const legacy = [1, 2, 3, 4, 5]
        .map((n) => ({ src: data[`image${n}`], name: data[`imageName${n}`] }))
        .filter((image) => image.src && String(image.src).startsWith('data:') && image.name && image.name !== 'Default');
      if (legacy.length) setImages(legacy);
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

  function readAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function wireUploads() {
    if (!uploadRoot) return;
    preview.__expHorizontalParallaxUpload = window.initMultiImageUpload(uploadRoot, {
      max: CARD_COUNT,
      value: preview.__expHorizontalParallaxImages.map(({ src, name }) => ({ url: src, name })),
      onChange: async (files, items) => {
        // Data URLs (not object URLs) so the snippet export and saved defaults stay self-contained.
        const images = await Promise.all(items.map(async (item) => ({
          src: item.file ? await readAsDataUrl(item.file) : item.url,
          name: item.name,
        })));
        preview.__expHorizontalParallaxImages = images;
        applyAll();
      },
    });
  }

  window.ExperimentSettings = window.ExperimentSettings || {};
  window.ExperimentSettings['parallax-horizontal'] = {
    collect: collectSettings,
    apply: applySettings,
  };

  void (async () => {
    await ensureDefaultSrc();

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

    if (!cardSize) {
      cardSize = window.initSizeControl(document.getElementById('exp-parallax-horizontal-size-root'), {
        min: 1,
        onChange: applyAll,
      });
      preview.__expHorizontalParallaxSize = cardSize;
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
